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
        for column in columns:
            logger.info(f"  {column['column_name']} ({column['data_type']})")
        
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

if __name__ == "__main__":
    logger.info("开始测试数据库连接...")
    success = test_db_connection()
    
    if success:
        logger.info("数据库连接测试成功!")
        sys.exit(0)
    else:
        logger.error("数据库连接测试失败!")
        sys.exit(1) 