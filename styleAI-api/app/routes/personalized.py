from flask import Blueprint, request, jsonify, current_app
import uuid
import time
import logging
import os
import sys
import importlib.util
import json
from app.utils.db import get_job_by_id
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
        
        if image_data:
            # 获取图像大小
            image_size = len(image_data)
            logger.info(f"从数据库获取到图像数据，大小: {image_size} 字节")
            
            # 保存图像到临时文件
            temp_filename = f"uploaded_{job_id}.jpg"
            image_path = save_image_from_buffer(image_data, temp_filename)
            logger.info(f"图像已保存到临时文件: {image_path}")
            
            # 将图像转换为base64格式
            image_base64 = buffer_to_base64(image_data)
            
            # 创建临时目录用于存储分析结果
            temp_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'temp')
            output_dir = os.path.join(temp_dir, f"analysis_{job_id}")
            os.makedirs(output_dir, exist_ok=True)
            
            # 直接使用本地文件路径，而不是创建file://URL
            # 在这里使用input_analyse.main函数进行分析
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
                                # 移除可能的```json和```标记
                                if user_text.startswith('```json'):
                                    user_text = user_text[7:]  # 移除```json
                                if user_text.endswith('```'):
                                    user_text = user_text[:-3]  # 移除```
                                
                                # 去除前后空白字符
                                user_text = user_text.strip()
                                
                                # 尝试解析JSON
                                analysis_result = json.loads(user_text).get('analysis', {})
                                
                                features = analysis_result.get('features', [])
                                colors = analysis_result.get('colors', [])
                                styles = analysis_result.get('styles', [])
                            else:
                                analysis_result = user_text
                                
                        except Exception as e:
                            logger.error(f"解析分析结果时出错: {str(e)}")
                            # 使用原始文本作为分析结果
                            features = [{"title": "分析结果", "content": user_text}]
                            
                    else:
                        logger.warning("图像分析未返回结果，使用模拟数据")
                else:
                    logger.warning("input_analyse模块不可用，使用模拟数据")
            except Exception as e:
                logger.error(f"使用input_analyse进行分析时出错: {str(e)}")
                # 出错时继续使用模拟数据
        
        # 准备返回的分析结果
        final_analysis = {
            "features": features if analysis_result else MOCK_ANALYSIS_DATA["features"],
            "colors": colors if analysis_result else MOCK_ANALYSIS_DATA["colors"],
            "styles": styles if analysis_result else MOCK_ANALYSIS_DATA["styles"]
        }
        
        # 返回个性化分析结果，只包含必要的字段
        return jsonify({
            'status': 'success',
            'jobId': job_id,
            'analysis': final_analysis
        })
        
    except Exception as e:
        logger.error(f"个性化分析时出错: {str(e)}")
        return jsonify({
            'error': str(e),
            'status': 'error'
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
                            # 这里可以调用change_ootd模块生成穿着建议图片
                            # 但目前仍使用模拟数据
                else:
                    logger.warning("change_ootd模块或预加载模型不可用，使用模拟数据")
            else:
                logger.warning("预加载模块不可用，使用模拟数据")
        except Exception as e:
            logger.error(f"生成穿着建议图片时出错: {str(e)}")
            # 出错时继续使用模拟数据
        
        # 返回模拟数据
        response = {
            "jobId": job_id,
            "timestamp": int(time.time()),
            "status": "success",
            "data": MOCK_SUIT_PICTURES
        }
        
        return jsonify(response), 200
        
    except Exception as e:
        logger.error(f"穿着建议处理失败: {e}", exc_info=True)
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500
    finally:
        # 处理完成后清理临时文件
        if job_id:
            cleanup_temp_files(job_id) 