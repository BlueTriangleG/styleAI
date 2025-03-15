from flask import Blueprint, request, jsonify, current_app
import uuid
import time
import logging
import os
import sys
import importlib.util
import json
from app.utils.db import get_job_by_id, update_job_description
from app.utils.image_utils import save_image_from_buffer, buffer_to_base64, cleanup_temp_files
from app.mock_data import MOCK_ANALYSIS_DATA

# 添加算法目录到Python路径
algorithms_path = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'app', 'utils', 'algorithms')
if algorithms_path not in sys.path:
    sys.path.append(algorithms_path)

# 设置日志记录器
logger = logging.getLogger(__name__)

# 创建蓝图
personalized_bp = Blueprint('personalized', __name__, url_prefix='/api/personalized')

# 确保算法模块路径在sys.path中
ALGORITHMS_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'utils', 'algorithms')
if ALGORITHMS_PATH not in sys.path:
    sys.path.append(ALGORITHMS_PATH)
    logger.info(f"已将算法模块路径添加到sys.path: {ALGORITHMS_PATH}")

# 模拟数据 - 个性化分析结果
MOCK_ANALYSIS_DATA = {
    "features": [
        {
            "title": "Debug Information",
            "content": "Failed to fetch content. This is mock data for debugging purposes."
        },
        {
            "title": "Striking Features",
            "content": "They have a captivating look with expressive eyes and a warm smile that immediately draws attention."
        },
        {
            "title": "Well-Defined Facial Structure",
            "content": "Their face features high cheekbones, a sharp jawline, and a balanced symmetry, giving them a classic yet modern appearance."
        },
        {
            "title": "Distinctive Style",
            "content": "Their hairstyle and grooming are impeccably maintained, complementing their overall polished and stylish look."
        },
        {
            "title": "Elegant and Timeless",
            "content": "With a natural elegance and subtle makeup, they exude a timeless charm that stands out in any setting."
        }
    ],
    "colors": [
        {"name": "Navy Blue", "hex": "#000080"},
        {"name": "Burgundy", "hex": "#800020"},
        {"name": "Forest Green", "hex": "#228B22"},
        {"name": "Charcoal Gray", "hex": "#36454F"}
    ],
    "styles": [
        "Classic", "Professional", "Elegant", "Sophisticated"
    ]
}

# 模拟数据 - 穿着建议图片
MOCK_SUIT_PICTURES = {
    "success": True,
    "debug_info": "Failed to fetch content. This is mock data for debugging purposes.",
    "pictures": [
        {
            "id": "suit1",
            "url": "https://example.com/suits/navy-blue-suit.jpg",
            "description": "Navy Blue Classic Suit"
        },
        {
            "id": "suit2",
            "url": "https://example.com/suits/charcoal-gray-suit.jpg",
            "description": "Charcoal Gray Professional Suit"
        },
        {
            "id": "suit3",
            "url": "https://example.com/suits/burgundy-suit.jpg",
            "description": "Burgundy Elegant Suit"
        }
    ]
}

# 安全导入预加载模块
def safe_import_preload():
    """安全导入预加载模块"""
    try:
        if importlib.util.find_spec('app.utils.preload') is not None:
            from app.utils import preload
            return preload
        else:
            logger.warning("预加载模块不可用")
            return None
    except ImportError as e:
        logger.error(f"导入预加载模块失败: {str(e)}")
        return None

# 解析分析结果
def parse_analysis_result(json_text):
    """
    Parse the analysis result from JSON text
    
    Args:
        json_text (str): JSON text to parse
        
    Returns:
        tuple: (features, colors, styles, is_mock_data)
    """
    try:
        # Remove JSON markers if present
        if json_text.startswith('```json'):
            json_text = json_text[7:]  # Remove ```json
        if json_text.endswith('```'):
            json_text = json_text[:-3]  # Remove ```
            
        # Strip whitespace
        json_text = json_text.strip()
        
        # Parse JSON
        parsed_data = json.loads(json_text)
        logger.info(f"Successfully parsed JSON data: {json.dumps(parsed_data)[:200]}...")
        
        # Check if there's an analysis field, if not use the entire data
        analysis_result = parsed_data.get('analysis', parsed_data)
        
        # Extract features, colors and styles
        # First check if there are Structural Features and Style Features
        structural_features = analysis_result.get('Structural Features', {})
        style_features = analysis_result.get('Style Features', {})
        
        # Build features list
        features = []
        
        # Add body features
        body_features = structural_features.get('Body Features', {})
        if body_features:
            features.append({
                "title": "Body Features",
                "content": ", ".join([f"{k}: {v}" for k, v in body_features.items() if v])
            })
        
        # Add face features
        face_features = structural_features.get('Face Features', {})
        if face_features:
            features.append({
                "title": "Face Features",
                "content": ", ".join([f"{k}: {v}" for k, v in face_features.items() if v])
            })
        
        # Add style features
        if style_features:
            for style_key, style_value in style_features.items():
                if style_value and isinstance(style_value, str) and style_key != 'Color Palette' and style_key != 'Style Recommendations':
                    features.append({
                        "title": style_key,
                        "content": style_value
                    })
        
        # If no features were extracted, use original data
        if not features and analysis_result.get('features'):
            features = analysis_result.get('features')
        elif not features:
            # If still no features, create one based on original data
            features = [{"title": "Analysis Result", "content": str(analysis_result)}]
        
        # Extract colors
        colors = []
        color_palette = style_features.get('Color Palette', [])
        if isinstance(color_palette, list):
            for color in color_palette:
                if isinstance(color, dict) and 'name' in color and 'hex' in color:
                    colors.append(color)
                elif isinstance(color, str):
                    # Assume color is provided as name
                    colors.append({"name": color, "hex": "#000000"})  # Default black
        
        # If no colors were extracted, use original data
        if not colors and analysis_result.get('colors'):
            colors = analysis_result.get('colors')
        elif not colors:
            # Default colors
            colors = [
                {"name": "Black", "hex": "#000000"},
                {"name": "White", "hex": "#FFFFFF"},
                {"name": "Gray", "hex": "#808080"},
                {"name": "Blue", "hex": "#0000FF"}
            ]
        
        # Extract styles
        styles = []
        style_recommendations = style_features.get('Style Recommendations', [])
        if isinstance(style_recommendations, list):
            styles = style_recommendations
        elif isinstance(style_recommendations, str):
            # If string, split by comma
            styles = [s.strip() for s in style_recommendations.split(',')]
        
        # If no styles were extracted, use original data
        if not styles and analysis_result.get('styles'):
            styles = analysis_result.get('styles')
        elif not styles:
            # Default styles
            styles = ["Casual", "Formal", "Business", "Elegant"]
        
        # Log extracted data
        logger.info(f"Extracted features: {features}")
        logger.info(f"Extracted colors: {colors}")
        logger.info(f"Extracted styles: {styles}")
        
        # 确保返回的数据结构正确
        if not features or not isinstance(features, list):
            logger.warning("提取的特征为空或格式不正确，使用默认值")
            features = [{"title": "Analysis Result", "content": "Successfully analyzed but no features extracted"}]
            
        if not colors or not isinstance(colors, list):
            logger.warning("提取的颜色为空或格式不正确，使用默认值")
            colors = [
                {"name": "Black", "hex": "#000000"},
                {"name": "White", "hex": "#FFFFFF"}
            ]
            
        if not styles or not isinstance(styles, list):
            logger.warning("提取的风格为空或格式不正确，使用默认值")
            styles = ["Casual", "Formal"]
        
        return features, colors, styles, False
    except Exception as e:
        logger.error(f"Error parsing analysis result: {str(e)}")
        return None, None, None, True

@personalized_bp.route('/analysis', methods=['POST'])
def personalized_analysis():
    """
    个性化分析API端点
    接受一个包含jobId的JSON请求
    从数据库获取图像数据，保存到临时文件，分析图像，并返回个性化分析结果
    """
    job_id = None
    try:
        # 获取请求中的JSON数据
        data = request.get_json()
        
        if not data:
            logger.error("请求中没有JSON数据")
            return jsonify({
                'error': 'No JSON data provided',
                'status': 'error'
            }), 400
            
        if 'jobId' not in data:
            logger.error("请求中没有jobId字段")
            return jsonify({
                'error': 'No jobId provided',
                'status': 'error'
            }), 400
            
        job_id = data['jobId']
        logger.info(f"接收到个性化分析请求，jobId: {job_id}")
        
        # 从数据库获取job记录
        job = get_job_by_id(job_id)
        
        if not job:
            logger.warning(f"未找到job记录，jobId: {job_id}")
            return jsonify({
                'error': f'Job with ID {job_id} not found',
                'status': 'error'
            }), 404
        
        # 检查是否有上传的图像
        image_data = job.get('uploaded_image')
        image_path = None
        image_base64 = None
        analysis_result = None
        is_mock_data = False
        
        if image_data:
            # 获取图像大小
            image_size = len(image_data)
            logger.info(f"从数据库获取到图像数据，大小: {image_size} 字节")
            
            # 保存图像到临时文件
            temp_filename = f"uploaded_{job_id}.jpg"
            image_path = save_image_from_buffer(image_data, temp_filename)
            logger.info(f"图像已保存到临时文件: {image_path}")
            
            # 将图像转换为base64格式（如果需要的话）
            image_base64 = buffer_to_base64(image_data)
            
            # 直接使用本地文件路径进行分析
            try:
                # 检查算法模块是否可用
                input_analyse_spec = importlib.util.find_spec('input_analyse')
                
                if input_analyse_spec:
                    # 导入算法模块
                    import input_analyse
                    
                    logger.info(f"开始分析图像: {image_path}")
                    
                    # 分析用户输入，直接传递本地文件路径
                    user_text = input_analyse.main(image_path)
                    
                    if user_text:
                        logger.info(f"图像分析完成，结果: {user_text[:100]}...")
                        
                        # 解析分析结果
                        try:
                            # 处理可能带有```json标记的JSON字符串
                            if isinstance(user_text, str):
                                # 使用辅助函数解析分析结果
                                features, colors, styles, parsing_failed = parse_analysis_result(user_text)
                                
                                if parsing_failed:
                                    # 如果解析失败，使用原始文本作为分析结果
                                    logger.warning("解析分析结果失败，使用模拟数据")
                                    features = [{"title": "Analysis Result", "content": user_text}]
                                    colors = MOCK_ANALYSIS_DATA["colors"]
                                    styles = MOCK_ANALYSIS_DATA["styles"]
                                    is_mock_data = True
                                else:
                                    # 解析成功，不使用模拟数据
                                    logger.info("成功解析分析结果，使用实际数据")
                                    is_mock_data = False
                                    # 确保analysis_result不为None，这样下面的条件判断会使用实际解析的数据
                                    analysis_result = True
                                    
                                    # 再次检查数据结构是否正确
                                    if not features or not isinstance(features, list):
                                        logger.warning("解析后的特征为空或格式不正确")
                                        features = [{"title": "Parsing Issue", "content": "Features were extracted but in incorrect format"}]
                                    
                                    if not colors or not isinstance(colors, list):
                                        logger.warning("解析后的颜色为空或格式不正确")
                                        colors = [{"name": "Default", "hex": "#000000"}]
                                    
                                    if not styles or not isinstance(styles, list):
                                        logger.warning("解析后的风格为空或格式不正确")
                                        styles = ["Default"]
                            else:
                                analysis_result = user_text
                                logger.warning("User text is not a string type, cannot parse JSON")
                                is_mock_data = True
                                features = MOCK_ANALYSIS_DATA["features"]
                                colors = MOCK_ANALYSIS_DATA["colors"]
                                styles = MOCK_ANALYSIS_DATA["styles"]
                                
                        except Exception as e:
                            logger.error(f"Error in analysis result parsing section: {str(e)}")
                            # 使用原始文本作为分析结果
                            features = [{"title": "Analysis Result", "content": user_text}]
                            colors = MOCK_ANALYSIS_DATA["colors"]
                            styles = MOCK_ANALYSIS_DATA["styles"]
                            is_mock_data = True
                            
                    else:
                        logger.warning("图像分析未返回结果，使用模拟数据")
                        is_mock_data = True
                        features = MOCK_ANALYSIS_DATA["features"]
                        colors = MOCK_ANALYSIS_DATA["colors"]
                        styles = MOCK_ANALYSIS_DATA["styles"]
                else:
                    logger.warning("input_analyse模块不可用，使用模拟数据")
                    is_mock_data = True
                    features = MOCK_ANALYSIS_DATA["features"]
                    colors = MOCK_ANALYSIS_DATA["colors"]
                    styles = MOCK_ANALYSIS_DATA["styles"]
            except Exception as e:
                logger.error(f"使用input_analyse进行分析时出错: {str(e)}")
                # 出错时继续使用模拟数据
                is_mock_data = True
                features = MOCK_ANALYSIS_DATA["features"]
                colors = MOCK_ANALYSIS_DATA["colors"]
                styles = MOCK_ANALYSIS_DATA["styles"]
        else:
            logger.warning("没有上传的图像数据，使用模拟数据")
            is_mock_data = True
        
        # 准备返回的分析结果
        if is_mock_data:
            # 如果使用模拟数据，添加调试信息并使用mock数据
            final_analysis = {
                "features": MOCK_ANALYSIS_DATA["features"],
                "colors": MOCK_ANALYSIS_DATA["colors"],
                "styles": MOCK_ANALYSIS_DATA["styles"],
                "debug_info": "Failed to fetch content. This is mock data for debugging purposes."
            }
            logger.info(f"返回模拟数据，is_mock_data={is_mock_data}")
        else:
            # 使用实际解析的数据
            final_analysis = {
                "features": features,
                "colors": colors,
                "styles": styles
            }
            logger.info(f"返回实际分析数据，is_mock_data={is_mock_data}")
            logger.info(f"实际分析数据特征: {features[:2]}")
            
            # 将分析结果保存到数据库
            try:
                # 准备要保存的数据
                description_data = {
                    "analysis": final_analysis,
                    "timestamp": int(time.time()),
                    "analysis_type": "personalized"
                }
                
                # 更新数据库
                update_success = update_job_description(job_id, description_data)
                if update_success:
                    logger.info(f"成功将分析结果保存到数据库，jobId: {job_id}")
                else:
                    logger.warning(f"无法将分析结果保存到数据库，jobId: {job_id}")
            except Exception as e:
                logger.error(f"保存分析结果到数据库时出错: {str(e)}")
        
        # 返回个性化分析结果，只包含必要的字段
        response_data = {
            'status': 'success',
            'jobId': job_id,
            'analysis': final_analysis,
            'is_mock_data': is_mock_data
        }
        logger.info(f"API响应: is_mock_data={is_mock_data}, 特征数量={len(final_analysis['features'])}")
        return jsonify(response_data)
        
    except Exception as e:
        logger.error(f"个性化分析时出错: {str(e)}")
        return jsonify({
            'error': str(e),
            'status': 'error',
            'debug_info': "Failed to fetch content. This is mock data for debugging purposes."
        }), 500
    finally:
        # 清理临时文件
        if image_path:
            cleanup_temp_files(file_paths=[image_path])

@personalized_bp.route('/wear-suit-pictures', methods=['POST'])
def wear_suit_pictures():
    """
    穿着建议图片API端点
    接受一个包含jobId的JSON请求
    返回成功/失败状态和模拟的穿着建议图片
    """
    job_id = None
    is_mock_data = False
    try:
        # 获取请求中的JSON数据
        data = request.get_json()
        
        if not data:
            logger.error("请求中没有JSON数据")
            return jsonify({
                'error': 'No JSON data provided',
                'status': 'error'
            }), 400
            
        if 'jobId' not in data:
            logger.error("请求中没有jobId字段")
            return jsonify({
                'error': 'No jobId provided',
                'status': 'error'
            }), 400
            
        job_id = data['jobId']
        logger.info(f"接收到穿着建议请求，jobId: {job_id}")
        
        # 检查job是否存在
        job = get_job_by_id(job_id)
        
        if not job:
            logger.warning(f"未找到job记录，jobId: {job_id}")
            return jsonify({
                'error': f'Job with ID {job_id} not found',
                'status': 'error'
            }), 404
        
        # 尝试使用预加载的模型生成穿着建议图片
        try:
            # 安全导入预加载模块
            preload = safe_import_preload()
            
            if preload:
                # 获取预加载的资源
                resources = preload.get_model_resources()
                
                # 检查change_ootd模块是否可用
                change_ootd_spec = importlib.util.find_spec('change_ootd')
                
                if change_ootd_spec and resources.get('model'):
                    # 导入算法模块
                    import change_ootd
                    
                    # 获取用户上传的图像路径
                    image_data = job.get('uploaded_image')
                    if image_data:
                        # 保存图像到临时文件
                        temp_filename = f"uploaded_{job_id}.jpg"
                        image_path = save_image_from_buffer(image_data, temp_filename)
                        
                        if image_path:
                            logger.info(f"使用预加载的模型生成穿着建议图片，图像路径: {image_path}")
                            # 尝试调用change_ootd模块生成穿着建议图片
                            try:
                                # 调用change_ootd模块生成穿着建议图片
                                logger.info(f"开始生成穿着建议图片: {image_path}")
                                result = change_ootd.generate_outfit_images(image_path, resources.get('model'))
                                
                                if result and isinstance(result, dict) and result.get('success'):
                                    logger.info("成功生成穿着建议图片")
                                    # 返回实际生成的图片数据
                                    response = {
                                        "jobId": job_id,
                                        "timestamp": int(time.time()),
                                        "status": "success",
                                        "data": result,
                                        "is_mock_data": False
                                    }
                                    return jsonify(response), 200
                                else:
                                    logger.warning("生成穿着建议图片失败，使用模拟数据")
                                    is_mock_data = True
                            except Exception as e:
                                logger.error(f"调用change_ootd模块时出错: {str(e)}")
                                is_mock_data = True
                        else:
                            logger.warning("保存图像失败，使用模拟数据")
                    else:
                        logger.warning("没有上传的图像数据，使用模拟数据")
                        is_mock_data = True
                else:
                    logger.warning("change_ootd模块或预加载模型不可用，使用模拟数据")
                    is_mock_data = True
            else:
                logger.warning("预加载模块不可用，使用模拟数据")
                is_mock_data = True
        except Exception as e:
            logger.error(f"生成穿着建议图片时出错: {str(e)}")
            # 出错时继续使用模拟数据
            is_mock_data = True
        
        # 返回模拟数据
        response = {
            "jobId": job_id,
            "timestamp": int(time.time()),
            "status": "success",
            "data": MOCK_SUIT_PICTURES,
            "is_mock_data": is_mock_data
        }
        
        # 如果使用模拟数据，添加调试信息
        if is_mock_data:
            response["debug_info"] = "Failed to fetch content. This is mock data for debugging purposes."
        
        return jsonify(response), 200
        
    except Exception as e:
        logger.error(f"穿着建议处理失败: {e}", exc_info=True)
        return jsonify({
            'error': str(e),
            'status': 'error',
            'debug_info': "Failed to fetch content. This is mock data for debugging purposes."
        }), 500
    finally:
        # 处理完成后清理临时文件
        if job_id:
            cleanup_temp_files(job_id)

@personalized_bp.route('/description/<job_id>', methods=['GET'])
def get_description(job_id):
    """
    获取个性化分析描述API端点
    根据jobId获取保存在数据库中的target_description
    
    Args:
        job_id (str): 要查询的job ID
        
    Returns:
        JSON: 包含分析描述的JSON响应
    """
    try:
        logger.info(f"接收到获取分析描述请求，jobId: {job_id}")
        
        # 从数据库获取job记录
        job = get_job_by_id(job_id)
        
        if not job:
            logger.warning(f"未找到job记录，jobId: {job_id}")
            return jsonify({
                'error': f'Job with ID {job_id} not found',
                'status': 'error'
            }), 404
        
        # 获取target_description字段
        target_description = job.get('target_description')
        
        if not target_description:
            logger.warning(f"未找到分析描述，jobId: {job_id}")
            return jsonify({
                'error': 'No description found for this job',
                'status': 'error'
            }), 404
        
        # 解析JSON字符串
        try:
            if isinstance(target_description, str):
                description_data = json.loads(target_description)
            else:
                description_data = target_description
                
            logger.info(f"成功获取分析描述，jobId: {job_id}")
            
            # 返回分析描述
            return jsonify({
                'status': 'success',
                'jobId': job_id,
                'description': description_data
            })
            
        except json.JSONDecodeError as e:
            logger.error(f"解析分析描述JSON时出错: {str(e)}")
            return jsonify({
                'error': 'Invalid description format',
                'status': 'error'
            }), 500
            
    except Exception as e:
        logger.error(f"获取分析描述时出错: {str(e)}")
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500 