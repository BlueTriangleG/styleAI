import os
import uuid
import base64
from io import BytesIO
from PIL import Image
import logging

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 临时文件存储目录
TEMP_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 'temp')

# 确保临时目录存在
if not os.path.exists(TEMP_DIR):
    os.makedirs(TEMP_DIR)
    logger.info(f"创建临时目录: {TEMP_DIR}")

def save_image_from_buffer(image_buffer, filename=None, job_id=None, prefix='img'):
    """
    将二进制图像数据保存到临时文件
    
    Args:
        image_buffer (bytes): 二进制图像数据
        filename (str, optional): 指定的文件名，如果提供则使用此文件名
        job_id (str, optional): 关联的job ID，用于生成文件名
        prefix (str, optional): 文件名前缀，用于生成文件名
        
    Returns:
        str: 保存的文件路径
    """
    try:
        if not image_buffer:
            logger.error("图像数据为空")
            return None
            
        # 生成文件名
        if filename:
            # 使用指定的文件名
            filepath = os.path.join(TEMP_DIR, filename)
        else:
            # 生成唯一文件名
            filename = f"{prefix}_{job_id or uuid.uuid4()}.jpg"
            filepath = os.path.join(TEMP_DIR, filename)
        
        # 将二进制数据转换为图像并保存
        image = Image.open(BytesIO(image_buffer))
        image.save(filepath)
        
        logger.info(f"图像已保存到: {filepath}")
        return filepath
    except Exception as e:
        logger.error(f"保存图像失败: {e}")
        return None

def buffer_to_base64(image_buffer):
    """
    将二进制图像数据转换为base64字符串
    
    Args:
        image_buffer (bytes): 二进制图像数据
        
    Returns:
        str: base64编码的图像数据
    """
    try:
        if not image_buffer:
            return None
            
        # 将二进制数据转换为base64字符串
        base64_data = base64.b64encode(image_buffer).decode('utf-8')
        return f"data:image/jpeg;base64,{base64_data}"
    except Exception as e:
        logger.error(f"转换图像为base64失败: {e}")
        return None

def cleanup_temp_files(job_id=None, file_paths=None):
    """
    清理临时文件
    
    Args:
        job_id (str, optional): 如果提供，只清理与该job ID相关的文件
        file_paths (list, optional): 如果提供，只清理指定的文件路径列表
    """
    try:
        # 如果提供了文件路径列表，直接清理这些文件
        if file_paths:
            for filepath in file_paths:
                if os.path.exists(filepath):
                    os.remove(filepath)
                    logger.info(f"已删除临时文件: {filepath}")
            return
            
        # 否则，根据job_id清理文件
        for filename in os.listdir(TEMP_DIR):
            if job_id and job_id not in filename:
                continue
                
            filepath = os.path.join(TEMP_DIR, filename)
            if os.path.isfile(filepath):
                os.remove(filepath)
                logger.info(f"已删除临时文件: {filepath}")
    except Exception as e:
        logger.error(f"清理临时文件失败: {e}") 