from flask import Blueprint, request, jsonify, current_app
import uuid
import time
import logging
import os
import sys
import importlib.util
import json
from app.utils.db import get_job_by_id, update_job_description, update_job_best_fit
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

# 模拟西装图片数据
MOCK_SUIT_PICTURES = [
    {
        "description": "Navy Blue Classic Suit",
        "url": "https://example.com/suits/navy-blue-suit.jpg"
    },
    {
        "description": "Charcoal Gray Professional Suit",
        "url": "https://example.com/suits/charcoal-gray-suit.jpg"
    },
    {
        "description": "Burgundy Elegant Suit",
        "url": "https://example.com/suits/burgundy-suit.jpg"
    }
]

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
            # 确保所有值都是字符串
            body_features_content = ", ".join([f"{k}: {str(v)}" for k, v in body_features.items() if v is not None])
            features.append({
                "title": "Body Features",
                "content": body_features_content
            })
        
        # Add face features
        face_features = structural_features.get('Face Features', {})
        if face_features:
            # 确保所有值都是字符串
            face_features_content = ", ".join([f"{k}: {str(v)}" for k, v in face_features.items() if v is not None])
            features.append({
                "title": "Face Features",
                "content": face_features_content
            })
        
        # Add style features
        if style_features:
            for style_key, style_value in style_features.items():
                if style_value is not None and style_key != 'Color Palette' and style_key != 'Style Recommendations':
                    # 确保style_value是字符串
                    if isinstance(style_value, dict) or isinstance(style_value, list):
                        style_value = json.dumps(style_value)
                    else:
                        style_value = str(style_value)
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
                        
                        # 将原始的user_text转换为JSON格式，并保存到数据库中的target_description字段
                        try:
                            # 检查user_text是否已经是JSON格式
                            if isinstance(user_text, dict):
                                # 已经是JSON对象，直接使用
                                description_data = user_text
                                # 确保所有嵌套对象都被转换为字符串
                                description_data = convert_nested_objects_to_string(description_data)
                            elif isinstance(user_text, str):
                                # 检查是否是Markdown格式的JSON字符串
                                if '```json' in user_text:
                                    # 提取JSON部分
                                    import re
                                    json_match = re.search(r'```json\n([\s\S]*?)\n```', user_text)
                                    if json_match:
                                        import json
                                        # 解析JSON字符串为Python对象
                                        try:
                                            description_data = json.loads(json_match.group(1))
                                            logger.info("成功从Markdown格式中提取JSON数据")
                                            # 确保所有嵌套对象都被转换为字符串
                                            description_data = convert_nested_objects_to_string(description_data)
                                        except json.JSONDecodeError as e:
                                            logger.error(f"解析JSON失败: {str(e)}")
                                            # 如果解析失败，使用原始字符串
                                            description_data = user_text
                                    else:
                                        # 没有找到匹配的JSON部分，使用原始字符串
                                        description_data = user_text
                                else:
                                    # 不是Markdown格式，尝试直接解析为JSON
                                    try:
                                        import json
                                        description_data = json.loads(user_text)
                                        logger.info("成功将字符串解析为JSON数据")
                                        # 确保所有嵌套对象都被转换为字符串
                                        description_data = convert_nested_objects_to_string(description_data)
                                    except json.JSONDecodeError:
                                        # 解析失败，使用原始字符串
                                        description_data = user_text
                            else:
                                # 其他类型，转换为字符串
                                description_data = str(user_text)
                            
                            # 更新数据库
                            update_success = update_job_description(job_id, description_data)
                            if update_success:
                                logger.info(f"成功将分析结果保存到数据库，jobId: {job_id}")
                            else:
                                logger.warning(f"无法将分析结果保存到数据库，jobId: {job_id}")
                            
                            # 返回处理后的数据
                            return jsonify({
                                'status': 'success',
                                'jobId': job_id,
                                'analysis': description_data
                            })
                        except Exception as e:
                            logger.error(f"处理分析结果时出错: {str(e)}")
                            return jsonify({
                                'error': str(e),
                                'status': 'error'
                            }), 500
                    else:
                        logger.warning("图像分析未返回结果，使用模拟数据")
                        is_mock_data = True
                        # 返回模拟数据
                        return jsonify({
                            'status': 'success',
                            'jobId': job_id,
                            'analysis': MOCK_ANALYSIS_DATA,
                            'is_mock_data': True
                        })
                else:
                    logger.warning("input_analyse模块不可用，使用模拟数据")
                    is_mock_data = True
                    # 返回模拟数据
                    return jsonify({
                        'status': 'success',
                        'jobId': job_id,
                        'analysis': MOCK_ANALYSIS_DATA,
                        'is_mock_data': True
                    })
            except Exception as e:
                logger.error(f"使用input_analyse进行分析时出错: {str(e)}")
                # 出错时返回模拟数据
                return jsonify({
                    'status': 'success',
                    'jobId': job_id,
                    'analysis': MOCK_ANALYSIS_DATA,
                    'is_mock_data': True,
                    'error': str(e)
                })
        else:
            logger.warning("没有上传的图像数据，使用模拟数据")
            # 没有图像数据时返回模拟数据
            return jsonify({
                'status': 'success',
                'jobId': job_id,
                'analysis': MOCK_ANALYSIS_DATA,
                'is_mock_data': True
            })
        
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
        
        # log job
        logger.info(f"job: {job}")
        
        if not job:
            logger.warning(f"未找到job记录，jobId: {job_id}")
            return jsonify({
                'error': f'Job with ID {job_id} not found',
                'status': 'error'
            }), 404
        
        # 尝试使用算法生成穿着建议图片
        try:
            # 安全导入预加载模块
            from app.utils.preload import safe_import_preload
            preload = safe_import_preload()
            
            if preload:
                # 获取预加载的资源
                resources = preload.get_model_resources()
                
                # 检查算法模块是否可用
                embedding_match_spec = importlib.util.find_spec('embedding_match')
                change_ootd_spec = importlib.util.find_spec('change_ootd')
                
                if embedding_match_spec and change_ootd_spec and resources.get('model') and resources.get('tokenizer'):
                    # 导入算法模块
                    import embedding_match
                    import change_ootd
                    
                    # 获取用户上传的图像数据
                    image_data = job.get('uploaded_image')
                    if image_data:
                        # 保存图像到临时文件
                        temp_filename = f"uploaded_{job_id}.jpg"
                        image_path = save_image_from_buffer(image_data, temp_filename)
                        
                        if image_path:
                            logger.info(f"已保存用户上传图像到临时文件: {image_path}")
                            
                            # 步骤1: 使用embedding_match算法分析用户图像
                            logger.info(f"开始使用embedding_match分析用户图像: {image_path}")
                            analysis_data = job.get('target_description')
                            if not analysis_data:
                                logger.warning("未找到分析结果，使用模拟数据")
                                is_mock_data = True
                                return jsonify({
                                    "jobId": job_id,
                                    "timestamp": int(time.time()),
                                    "status": "error",
                                    "error": "No analysis result found. Using mock data.",
                                    "debug_info": "No analysis result found. Using mock data."
                                }), 400

                            # 处理target_description，确保它是JSON字符串
                            try:
                                if isinstance(analysis_data, dict):
                                    # 如果已经是dict，则转换为JSON字符串
                                    analysis_data = convert_nested_objects_to_string(analysis_data)
                                    analysis_json_str = json.dumps(analysis_data)
                                    logger.info("已将target_description从dict转换为JSON字符串")
                                elif isinstance(analysis_data, str):
                                    # 如果已经是字符串，则验证它是有效的JSON
                                    json.loads(analysis_data)  # 只是验证，不使用返回值
                                    analysis_json_str = analysis_data
                                    logger.info("target_description已经是有效的JSON字符串")
                                else:
                                    logger.error(f"无法处理的target_description类型: {type(analysis_data)}")
                                    return jsonify({
                                        "status": "error",
                                        "jobId": job_id,
                                        "error": "target_description类型无效",
                                        "debug_info": f"类型为 {type(analysis_data)}"
                                    }), 500
                            except Exception as e:
                                logger.error(f"处理target_description失败: {e}", exc_info=True)
                                return jsonify({
                                    "status": "error",
                                    "jobId": job_id,
                                    "error": "target_description不是有效的JSON格式",
                                    "debug_info": str(e)
                                }), 500

                            # 步骤2: 使用embedding_match找到最佳匹配的图片
                            model = resources.get('model')
                            tokenizer = resources.get('tokenizer')
                            device = resources.get('device')

                            # 直接传递处理后的JSON字符串给embedding_match
                            best_image_name = embedding_match.main(
                                analysis_json_str,  # 使用处理后的JSON字符串
                                tokenizer, 
                                model, 
                                device
                            )
                            
                            # 解析分析结果
                            try:
                                # 步骤2: 使用embedding_match找到最佳匹配的图片
                                model = resources.get('model')
                                tokenizer = resources.get('tokenizer')
                                device = resources.get('device')
                                
                                # 调用embedding_match算法
                                best_image_name = embedding_match.main(
                                    analysis_json_str,  # 使用处理后的JSON字符串
                                    tokenizer, 
                                    model, 
                                    device
                                )
                                
                                if not best_image_name:
                                    logger.warning("embedding_match未返回有效结果")
                                    return jsonify({
                                        "status": "error",
                                        "jobId": job_id,
                                        "error": "无法找到匹配的服装图片"
                                    }), 500
                                
                                # 构建模型图片URL
                                men_fashion_dir = os.path.join(ALGORITHMS_PATH, "ALL_images")
                                if not os.path.exists(men_fashion_dir):
                                    logger.warning(f"ALL_images目录不存在: {men_fashion_dir}")
                                    # 尝试创建目录
                                    try:
                                        os.makedirs(men_fashion_dir, exist_ok=True)
                                        logger.info(f"已创建ALL_images目录: {men_fashion_dir}")
                                    except Exception as e:
                                        logger.error(f"创建ALL_images目录失败: {str(e)}")
                                        return jsonify({
                                            "status": "error",
                                            "jobId": job_id,
                                            "error": f"ALL_images目录不存在且无法创建: {str(e)}"
                                        }), 500
                                
                                # 将匹配的图片复制到match目录
                                try:
                                    # 默认使用示例图片作为模型图片
                                    model_image_url = os.path.join(men_fashion_dir, "example.jpg")
                                    
                                    # 检查best_image_name是否有效
                                    if best_image_name and not isinstance(best_image_name, tuple):
                                        # 如果best_image_name是完整路径，则直接使用
                                        if os.path.isabs(best_image_name):
                                            source_image_path = best_image_name
                                        else:
                                            # 否则，假设它是相对于ALL_images的路径
                                            source_image_path = os.path.join(men_fashion_dir, best_image_name)
                                        
                                        # 检查源图片是否存在
                                        if os.path.exists(source_image_path):
                                            # 直接使用原始图片路径，不复制
                                            logger.info(f"使用原始图片路径: {source_image_path}")
                                            model_image_url = source_image_path
                                        else:
                                            logger.warning(f"匹配的图片不存在: {source_image_path}")
                                    else:
                                        logger.warning(f"无效的best_image_name: {best_image_name}")
                                except Exception as e:
                                    logger.error(f"处理图片路径时出错: {str(e)}")
                                
                                logger.info(f"使用模型图片: {model_image_url}")
                                
                                # 步骤3: 使用change_ootd生成穿着建议图片
                                logger.info(f"开始使用change_ootd生成穿着建议图片")
                                try:
                                    # 修正参数顺序：第一个参数是模特图片(model_image_url)，第二个参数是服装图片(garment_image_url)
                                    # 在这里，模特图片是用户上传的图片(image_path)，服装图片是匹配的服装图片(model_image_url)
                                    
                                    # 将本地图片转换为base64编码
                                    def encode_image_to_base64(image_path):
                                        import base64
                                        with open(image_path, "rb") as image_file:
                                            return "data:image/jpeg;base64," + base64.b64encode(image_file.read()).decode()
                                    
                                    # 使用base64编码图片
                                    model_image_base64 = encode_image_to_base64(image_path)
                                    garment_image_base64 = encode_image_to_base64(model_image_url)
                                    
                                    # 使用base64编码的图片调用change_ootd.main
                                    output_path = change_ootd.main(model_image_base64, garment_image_base64)
                                    
                                    if not output_path or not os.path.exists(output_path):
                                        logger.warning("change_ootd未返回有效结果，使用模拟数据")
                                        # 使用模拟数据
                                        # 读取示例图片作为模拟数据
                                        sample_image_path = os.path.join(ALGORITHMS_PATH, "main.py")
                                        with open(sample_image_path, 'rb') as f:
                                            output_image_data = f.read()
                                    else:
                                        # 读取生成的图片
                                        with open(output_path, 'rb') as f:
                                            output_image_data = f.read()
                                        
                                        # 清理临时文件
                                        cleanup_temp_files(file_paths=[output_path])
                                except Exception as e:
                                    logger.error(f"使用change_ootd生成穿着建议图片时出错: {str(e)}")
                                    # 使用模拟数据
                                    # 读取示例图片作为模拟数据
                                    sample_image_path = os.path.join(ALGORITHMS_PATH, "main.py")
                                    with open(sample_image_path, 'rb') as f:
                                        output_image_data = f.read()
                                
                                # 更新数据库中的best_fit字段
                                update_success = update_job_best_fit(job_id, output_image_data)
                                
                                if not update_success:
                                    logger.warning(f"更新job {job_id}的best_fit字段失败")
                                    return jsonify({
                                        "status": "error",
                                        "jobId": job_id,
                                        "error": "更新数据库失败"
                                    }), 500
                                
                                # 清理临时文件
                                cleanup_temp_files(file_paths=[image_path])
                                
                                return jsonify({
                                    "status": "success",
                                    "jobId": job_id,
                                    "message": "成功生成最佳穿着建议图片"
                                }), 200
                                
                            except Exception as e:
                                logger.error(f"处理分析结果时出错: {str(e)}", exc_info=True)
                                is_mock_data = True
                        else:
                            logger.warning("保存图像失败，使用模拟数据")
                            is_mock_data = True
                    else:
                        logger.warning("没有上传的图像数据，使用模拟数据")
                        is_mock_data = True
                else:
                    logger.warning("算法模块或预加载模型不可用，使用模拟数据")
                    is_mock_data = True
            else:
                logger.warning("预加载模块不可用，使用模拟数据")
                is_mock_data = True
        except Exception as e:
            logger.error(f"生成穿着建议图片时出错: {str(e)}", exc_info=True)
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

@personalized_bp.route('/generate-best-fit', methods=['POST'])
def generate_best_fit():
    """
    根据job ID生成最佳穿着建议图片并存储到数据库
    
    请求参数:
        jobId: 任务ID
        
    返回:
        成功: {"status": "success", "jobId": "xxx", "message": "成功生成最佳穿着建议图片"}
        失败: {"status": "error", "error": "错误信息"}
    """
    try:
        # 获取请求参数
        data = request.get_json()
        job_id = data.get('jobId')
        
        if not job_id:
            return jsonify({
                'status': 'error',
                'error': '缺少必要参数: jobId'
            }), 400
            
        logger.info(f"接收到生成最佳穿着建议请求，jobId: {job_id}")
        
        # 从数据库获取job记录
        job = get_job_by_id(job_id)
        
        if not job:
            logger.warning(f"未找到job记录，jobId: {job_id}")
            return jsonify({
                'status': 'error',
                'error': f'未找到job记录: {job_id}'
            }), 404
            
        # 获取用户上传的图像数据
        image_data = job.get('uploaded_image')
        
        if not image_data:
            logger.warning(f"Job记录中没有上传的图像数据，jobId: {job_id}")
            return jsonify({
                'status': 'error',
                'error': '没有上传的图像数据'
            }), 400
            
        # 保存图像到临时文件
        image_path = save_image_from_buffer(image_data, prefix=f"uploaded_{job_id}")
        logger.info(f"图像已保存到临时文件: {image_path}")
        
        # 获取分析结果
        target_description = job.get('target_description')
        analysis_data = None
        
        if target_description:
            try:
                # 尝试解析JSON字符串
                if isinstance(target_description, str):
                    # 直接使用原始文本作为分析数据
                    analysis_data = target_description
                else:
                    # 如果已经是对象，直接使用
                    analysis_data = target_description
                    # 确保所有嵌套对象都被转换为字符串
                    analysis_data = convert_nested_objects_to_string(analysis_data)
            except Exception as e:
                logger.error(f"解析target_description时出错: {str(e)}")
        
        if not analysis_data:
            logger.warning(f"未找到分析结果，将先进行分析，jobId: {job_id}")
            # 使用input_analyse进行分析
            try:
                # 导入input_analyse模块
                import input_analyse
                
                # 分析图像
                logger.info(f"开始分析图像: {image_path}")
                analysis_data = input_analyse.main(image_path)
                
                if analysis_data:
                    # 保存分析结果到数据库
                    update_success = update_job_description(job_id, analysis_data)
                    if update_success:
                        logger.info(f"成功将分析结果保存到数据库，jobId: {job_id}")
                    else:
                        logger.warning(f"无法将分析结果保存到数据库，jobId: {job_id}")
                else:
                    logger.warning(f"分析图像失败，未返回有效结果，jobId: {job_id}")
            except Exception as e:
                logger.error(f"分析图像时出错: {str(e)}")
        
        # 尝试使用算法生成最佳穿着建议图片
        try:
            # 安全导入预加载模块
            from app.utils.preload import safe_import_preload
            preload = safe_import_preload()
            
            if preload:
                # 获取预加载的资源
                resources = preload.get_model_resources()
                
                # 检查算法模块是否可用
                embedding_match_spec = importlib.util.find_spec('embedding_match')
                change_ootd_spec = importlib.util.find_spec('change_ootd')
                
                if embedding_match_spec and change_ootd_spec:
                    # 导入算法模块
                    import embedding_match
                    import change_ootd
                    
                    # 获取模型和tokenizer
                    model = resources.get('model')
                    tokenizer = resources.get('tokenizer')
                    device = resources.get('device')
                    
                    if not model or not tokenizer or not device:
                        logger.error("预加载的模型资源不可用")
                        return jsonify({
                            "status": "error",
                            "jobId": job_id,
                            "error": "预加载的模型资源不可用"
                        }), 500
                    
                    if analysis_data:
                        # 步骤1: 使用embedding_match找到最佳匹配的图片
                        logger.info(f"开始使用embedding_match分析用户图像: {image_path}")
                        logger.info(f"分析数据: {analysis_data}")
                        # 调用embedding_match算法，使用预加载的模型和tokenizer
                        best_image_name = embedding_match.main(
                            analysis_data, 
                            tokenizer, 
                            model, 
                            device
                        )
                        
                        if not best_image_name:
                            logger.warning("embedding_match未返回有效结果")
                            return jsonify({
                                "status": "error",
                                "jobId": job_id,
                                "error": "无法找到匹配的服装图片"
                            }), 500
                        
                        # 构建模型图片URL
                        men_fashion_dir = os.path.join(ALGORITHMS_PATH, "ALL_images")
                        if not os.path.exists(men_fashion_dir):
                            logger.warning(f"ALL_images目录不存在: {men_fashion_dir}")
                            # 尝试创建目录
                            try:
                                os.makedirs(men_fashion_dir, exist_ok=True)
                                logger.info(f"已创建ALL_images目录: {men_fashion_dir}")
                            except Exception as e:
                                logger.error(f"创建ALL_images目录失败: {str(e)}")
                                return jsonify({
                                    "status": "error",
                                    "jobId": job_id,
                                    "error": f"ALL_images目录不存在且无法创建: {str(e)}"
                                }), 500
                        
                        # 将匹配的图片复制到match目录
                        try:
                            # 默认使用示例图片作为模型图片
                            model_image_url = os.path.join(men_fashion_dir, "example.jpg")
                            
                            # 检查best_image_name是否有效
                            if best_image_name and not isinstance(best_image_name, tuple):
                                # 如果best_image_name是完整路径，则直接使用
                                if os.path.isabs(best_image_name):
                                    source_image_path = best_image_name
                                else:
                                    # 否则，假设它是相对于ALL_images的路径
                                    source_image_path = os.path.join(men_fashion_dir, best_image_name)
                                
                                # 检查源图片是否存在
                                if os.path.exists(source_image_path):
                                    # 直接使用原始图片路径，不复制
                                    logger.info(f"使用原始图片路径: {source_image_path}")
                                    model_image_url = source_image_path
                                else:
                                    logger.warning(f"匹配的图片不存在: {source_image_path}")
                            else:
                                logger.warning(f"无效的best_image_name: {best_image_name}")
                        except Exception as e:
                            logger.error(f"处理图片路径时出错: {str(e)}")
                        
                        logger.info(f"使用模型图片: {model_image_url}")
                        
                        # 步骤2: 使用change_ootd生成穿着建议图片
                        logger.info(f"开始使用change_ootd生成穿着建议图片")
                        try:
                            # 修正参数顺序：第一个参数是模特图片(model_image_url)，第二个参数是服装图片(garment_image_url)
                            # 在这里，模特图片是用户上传的图片(image_path)，服装图片是匹配的服装图片(model_image_url)
                            
                            # 将本地图片转换为base64编码
                            def encode_image_to_base64(image_path):
                                import base64
                                with open(image_path, "rb") as image_file:
                                    return "data:image/jpeg;base64," + base64.b64encode(image_file.read()).decode()
                            
                            # 使用base64编码图片
                            model_image_base64 = encode_image_to_base64(image_path)
                            garment_image_base64 = encode_image_to_base64(model_image_url)
                            
                            # 使用base64编码的图片调用change_ootd.main
                            output_path = change_ootd.main(model_image_base64, garment_image_base64)
                            
                            if not output_path or not os.path.exists(output_path):
                                logger.warning("change_ootd未返回有效结果，使用模拟数据")
                                # 使用模拟数据
                                # 读取示例图片作为模拟数据
                                sample_image_path = os.path.join(ALGORITHMS_PATH, "main.py")
                                with open(sample_image_path, 'rb') as f:
                                    output_image_data = f.read()
                            else:
                                # 读取生成的图片
                                with open(output_path, 'rb') as f:
                                    output_image_data = f.read()
                                
                                # 清理临时文件
                                cleanup_temp_files(file_paths=[output_path])
                        except Exception as e:
                            logger.error(f"使用change_ootd生成穿着建议图片时出错: {str(e)}")
                            # 使用模拟数据
                            # 读取示例图片作为模拟数据
                            sample_image_path = os.path.join(ALGORITHMS_PATH, "main.py")
                            with open(sample_image_path, 'rb') as f:
                                output_image_data = f.read()
                        
                        # 更新数据库中的best_fit字段
                        update_success = update_job_best_fit(job_id, output_image_data)
                        
                        if not update_success:
                            logger.warning(f"更新job {job_id}的best_fit字段失败")
                            return jsonify({
                                "status": "error",
                                "jobId": job_id,
                                "error": "更新数据库失败"
                            }), 500
                        
                        # 清理临时文件
                        cleanup_temp_files(file_paths=[image_path])
                        
                        return jsonify({
                            "status": "success",
                            "jobId": job_id,
                            "message": "成功生成最佳穿着建议图片"
                        }), 200
                    else:
                        logger.warning("缺少分析数据，无法生成穿着建议图片")
                        return jsonify({
                            "status": "error",
                            "jobId": job_id,
                            "error": "缺少分析数据"
                        }), 400
                else:
                    logger.warning("算法模块或资源不可用")
                    return jsonify({
                        "status": "error",
                        "jobId": job_id,
                        "error": "算法模块或资源不可用"
                    }), 500
            else:
                logger.warning("预加载模块不可用")
                return jsonify({
                    "status": "error",
                    "jobId": job_id,
                    "error": "预加载模块不可用"
                }), 500
        except Exception as e:
            logger.error(f"生成穿着建议图片时出错: {str(e)}")
            # 清理临时文件
            cleanup_temp_files(file_paths=[image_path])
            return jsonify({
                "status": "error",
                "jobId": job_id,
                "error": f"生成穿着建议图片时出错: {str(e)}"
            }), 500
    except Exception as e:
        logger.error(f"处理请求时出错: {str(e)}")
        return jsonify({
            "status": "error",
            "error": f"处理请求时出错: {str(e)}"
        }), 500

def convert_nested_objects_to_string(data):
    """
    递归地将嵌套对象中的非基本类型转换为字符串
    
    Args:
        data: 要转换的数据
        
    Returns:
        转换后的数据
    """
    if isinstance(data, dict):
        result = {}
        for key, value in data.items():
            if isinstance(value, (dict, list)):
                result[key] = convert_nested_objects_to_string(value)
            elif value is not None and not isinstance(value, (str, int, float, bool)):
                result[key] = str(value)
            else:
                result[key] = value
        return result
    elif isinstance(data, list):
        return [convert_nested_objects_to_string(item) for item in data]
    else:
        return data 
