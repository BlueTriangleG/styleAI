"""
模拟数据模块
包含API返回的模拟数据，用于开发和测试
"""

# 个性化分析的模拟数据
MOCK_ANALYSIS_DATA = {
    "features": [
        {
            "title": "身材特点",
            "content": "身材偏瘦，肩膀较窄，身高适中"
        },
        {
            "title": "面部特征",
            "content": "圆形脸，五官较为立体"
        },
        {
            "title": "肤色",
            "content": "偏黄色调，中等肤色"
        }
    ],
    "colors": [
        {
            "name": "深蓝色",
            "hex": "#1a237e"
        },
        {
            "name": "灰色",
            "hex": "#616161"
        },
        {
            "name": "米色",
            "hex": "#d7ccc8"
        },
        {
            "name": "深绿色",
            "hex": "#1b5e20"
        }
    ],
    "styles": [
        "商务休闲",
        "简约现代",
        "都市精英",
        "学院风"
    ]
}

# 穿搭推荐的模拟数据
MOCK_OUTFIT_DATA = {
    "outfits": [
        {
            "id": "outfit1",
            "name": "商务休闲风格",
            "description": "适合日常办公和轻商务场合，舒适又不失正式感",
            "image": "https://example.com/images/outfit1.jpg"
        },
        {
            "id": "outfit2",
            "name": "简约现代风格",
            "description": "干净利落的线条，适合各种场合，展现现代都市感",
            "image": "https://example.com/images/outfit2.jpg"
        },
        {
            "id": "outfit3",
            "name": "都市精英风格",
            "description": "高品质面料和精致剪裁，展现专业和成熟的一面",
            "image": "https://example.com/images/outfit3.jpg"
        }
    ]
} 