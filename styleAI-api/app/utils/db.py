import os
import psycopg2
from psycopg2.extras import RealDictCursor
import logging
import json

# 配置日志
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 从环境变量获取数据库连接URL
DATABASE_URL = os.environ.get('DATABASE_URL', "postgresql://test_owner:npg_riaEfFBXn19H@ep-snowy-bar-a7w4sdqq-pooler.ap-southeast-2.aws.neon.tech/test?sslmode=require")

def get_db_connection():
    """
    创建并返回数据库连接
    """
    try:
        if not DATABASE_URL:
            logger.error("未设置DATABASE_URL环境变量")
            raise ValueError("未设置DATABASE_URL环境变量")
            
        conn = psycopg2.connect(DATABASE_URL, cursor_factory=RealDictCursor)
        logger.info("数据库连接成功")
        return conn
    except Exception as e:
        logger.error(f"数据库连接失败: {e}")
        raise

def get_job_by_id(job_id):
    """
    根据job_id从数据库获取job记录
    
    Args:
        job_id (str): 要查询的job ID
        
    Returns:
        dict: 包含job信息的字典，如果未找到则返回None
    """
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # 查询job记录
        cur.execute("SELECT * FROM jobs WHERE id = %s", (job_id,))
        job = cur.fetchone()
        
        cur.close()
        conn.close()
        
        return job
    except Exception as e:
        logger.error(f"获取job记录失败: {e}")
        return None 

def update_job_description(job_id, description_data):
    """
    更新数据库中job记录的target_description字段
    
    Args:
        job_id (str): 要更新的job ID
        description_data (dict): 要保存的描述数据
        
    Returns:
        bool: 更新成功返回True，失败返回False
    """
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # 将description_data转换为JSON字符串
        description_json = json.dumps(description_data)
        
        # 更新job记录
        cur.execute(
            "UPDATE jobs SET target_description = %s WHERE id = %s",
            (description_json, job_id)
        )
        
        # 提交事务
        conn.commit()
        
        # 检查是否有行被更新
        rows_affected = cur.rowcount
        
        cur.close()
        conn.close()
        
        if rows_affected > 0:
            logger.info(f"成功更新job {job_id}的target_description")
            return True
        else:
            logger.warning(f"未找到job {job_id}，无法更新target_description")
            return False
            
    except Exception as e:
        logger.error(f"更新job target_description失败: {e}")
        return False 

def update_job_best_fit(job_id, image_data):
    """
    更新数据库中job记录的best_fit字段
    
    Args:
        job_id (str): 要更新的job ID
        image_data (bytes): 要保存的图片二进制数据
        
    Returns:
        bool: 更新成功返回True，失败返回False
    """
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # 更新job记录
        cur.execute(
            "UPDATE jobs SET best_fit = %s WHERE id = %s",
            (psycopg2.Binary(image_data), job_id)
        )
        
        # 提交事务
        conn.commit()
        
        # 检查是否有行被更新
        rows_affected = cur.rowcount
        
        cur.close()
        conn.close()
        
        if rows_affected > 0:
            logger.info(f"成功更新job {job_id}的best_fit")
            return True
        else:
            logger.warning(f"未找到job {job_id}，无法更新best_fit")
            return False
            
    except Exception as e:
        logger.error(f"更新job best_fit失败: {e}")
        return False 