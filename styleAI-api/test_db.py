#!/usr/bin/env python3
"""
数据库连接测试脚本
用于测试数据库连接和API功能
"""

import os
import sys
import logging
from dotenv import load_dotenv
import psycopg2
from psycopg2.extras import RealDictCursor
import json

# 配置日志
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# 加载环境变量
load_dotenv()

def test_db_connection():
    """测试数据库连接"""
    try:
        # 获取数据库连接URL
        database_url = os.environ.get('DATABASE_URL')
        
        if not database_url:
            logger.error("未设置DATABASE_URL环境变量")
            return False
            
        logger.info(f"尝试连接到数据库: {database_url}")
        
        # 连接数据库
        conn = psycopg2.connect(database_url, cursor_factory=RealDictCursor)
        
        # 创建游标
        cur = conn.cursor()
        
        # 测试查询
        cur.execute("SELECT current_database(), current_user")
        result = cur.fetchone()
        
        logger.info(f"数据库连接成功: {result}")
        
        # 查询jobs表结构
        cur.execute("""
            SELECT column_name, data_type 
            FROM information_schema.columns 
            WHERE table_name = 'jobs'
        """)
        
        columns = cur.fetchall()
        logger.info("Jobs表结构:")
        for col in columns:
            logger.info(f"  {col['column_name']} - {col['data_type']}")
        
        # 查询jobs表中的记录数
        cur.execute("SELECT COUNT(*) FROM jobs")
        count = cur.fetchone()['count']
        logger.info(f"Jobs表中有 {count} 条记录")
        
        # 如果有记录，查询第一条记录
        if count > 0:
            cur.execute("SELECT id, user_id FROM jobs LIMIT 1")
            job = cur.fetchone()
            logger.info(f"示例job记录: ID={job['id']}, User ID={job['user_id']}")
        
        # 关闭连接
        cur.close()
        conn.close()
        
        return True
    except Exception as e:
        logger.error(f"数据库连接测试失败: {e}", exc_info=True)
        return False

def get_job_by_id(job_id):
    """获取指定ID的job记录"""
    try:
        # 获取数据库连接URL
        database_url = os.environ.get('DATABASE_URL')
        
        if not database_url:
            logger.error("未设置DATABASE_URL环境变量")
            return None
            
        logger.info(f"尝试连接到数据库: {database_url}")
        
        # 连接数据库
        conn = psycopg2.connect(database_url, cursor_factory=RealDictCursor)
        
        # 创建游标
        cur = conn.cursor()
        
        # 查询job记录
        cur.execute("SELECT * FROM jobs WHERE id = %s", (job_id,))
        job = cur.fetchone()
        
        if job:
            logger.info(f"找到job记录: {job['id']}")
            
            # 检查target_description字段
            if job.get('target_description'):
                logger.info("target_description字段存在")
                try:
                    # 尝试解析JSON
                    if isinstance(job['target_description'], str):
                        json_data = json.loads(job['target_description'])
                        logger.info("target_description是有效的JSON字符串")
                    else:
                        logger.warning(f"target_description不是字符串，而是 {type(job['target_description'])}")
                except Exception as e:
                    logger.error(f"解析target_description失败: {str(e)}")
            else:
                logger.warning("target_description字段不存在或为空")
                
            # 检查best_fit字段
            if job.get('best_fit'):
                logger.info("best_fit字段存在且不为空")
                logger.info(f"best_fit字段大小: {len(job['best_fit'])} 字节")
            else:
                logger.warning("best_fit字段不存在或为空")
        else:
            logger.warning(f"未找到ID为 {job_id} 的job记录")
        
        # 关闭连接
        cur.close()
        conn.close()
        
        return job
    except Exception as e:
        logger.error(f"查询job记录失败: {str(e)}")
        return None

def main():
    """主函数"""
    # 测试数据库连接
    if not test_db_connection():
        logger.error("数据库连接测试失败")
        sys.exit(1)
    
    # 测试获取job记录
    job_id = "7752da65-b239-4936-af3d-ae6609d9a3be"
    job = get_job_by_id(job_id)
    if job:
        logger.info(f"成功获取job记录: {job['id']}")
    else:
        logger.error(f"获取job记录失败")

if __name__ == "__main__":
    logger.info("开始测试数据库连接...")
    main() 