from flask import Blueprint, request, jsonify
import uuid
import time

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
    返回模拟的个性化分析数据
    """
    try:
        # 获取请求中的JSON数据
        data = request.get_json()
        
        if not data or 'jobId' not in data:
            return jsonify({'error': 'No jobId provided'}), 400
            
        job_id = data['jobId']
        
        # 模拟处理时间
        time.sleep(0.5)
        
        # 返回模拟数据
        response = {
            "jobId": job_id,
            "timestamp": int(time.time()),
            "status": "success",
            "data": MOCK_ANALYSIS_DATA
        }
        
        return jsonify(response), 200
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@personalized_bp.route('/wear-suit-pictures', methods=['POST'])
def wear_suit_pictures():
    """
    穿着建议图片API端点
    接受一个包含jobId的JSON请求
    返回成功/失败状态和模拟的穿着建议图片
    """
    try:
        # 获取请求中的JSON数据
        data = request.get_json()
        
        if not data or 'jobId' not in data:
            return jsonify({'error': 'No jobId provided'}), 400
            
        job_id = data['jobId']
        
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
        return jsonify({'error': str(e)}), 500 