from flask import Blueprint, request, jsonify, current_app
import uuid
import time
import logging
import os
from app.utils.db import get_job_by_id
from app.utils.image_utils import save_image_from_buffer, buffer_to_base64, cleanup_temp_files

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 创建蓝图
personalized_bp = Blueprint('personalized', __name__, url_prefix='/api/personalized')

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

@personalized_bp.route('/analysis', methods=['POST'])
def personalized_analysis():
    """
    个性化分析API端点
    接受一个包含jobId的JSON请求
    从数据库获取图像数据，保存到临时文件，并返回个性化分析结果
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
        
        if image_data:
            logger.info(f"从数据库获取到图像数据，大小: {len(image_data) if image_data else 0} 字节")
            
            # 将图像数据保存到临时文件
            image_path = save_image_from_buffer(image_data, job_id, 'uploaded')
            
            if image_path:
                logger.info(f"图像已保存到临时文件: {image_path}")
                
                # 转换为base64以便在响应中返回
                image_base64 = buffer_to_base64(image_data)
                
                # 这里可以添加对图像的分析处理代码
                # ...
                
                # 模拟处理时间
                time.sleep(1)
            else:
                logger.warning(f"保存图像到临时文件失败，jobId: {job_id}")
        else:
            logger.warning(f"Job记录中没有图像数据，jobId: {job_id}")
        
        # 返回分析结果
        response = {
            "jobId": job_id,
            "timestamp": int(time.time()),
            "status": "success",
            "data": MOCK_ANALYSIS_DATA,
            "imagePath": image_path,
            "imageBase64": image_base64
        }
        
        return jsonify(response), 200
        
    except Exception as e:
        logger.error(f"个性化分析处理失败: {e}", exc_info=True)
        return jsonify({
            'error': str(e),
            'status': 'error'
        }), 500
    finally:
        # 不要在这里清理临时文件，因为后续可能还需要使用
        pass

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
        
        # 模拟处理时间
        time.sleep(0.5)
        
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