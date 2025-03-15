import os
import psycopg2
from psycopg2.extras import RealDictCursor
import logging

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