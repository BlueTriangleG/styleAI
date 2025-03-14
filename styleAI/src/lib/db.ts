import { Pool } from 'pg';

// 数据库连接配置
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false // 在开发环境中可能需要设置为false
  }
});

// 执行查询的通用函数
export async function query(text: string, params?: any[]) {
  try {
    const result = await pool.query(text, params);
    return result;
  } catch (error) {
    console.error('数据库查询错误:', error);
    throw error;
  }
}

// 获取单个连接（用于事务等需要保持连接的操作）
export async function getClient() {
  const client = await pool.connect();
  return client;
}

// 测试数据库连接
export async function testConnection() {
  try {
    const result = await query('SELECT NOW()');
    console.log('数据库连接成功:', result.rows[0]);
    return true;
  } catch (error) {
    console.error('数据库连接失败:', error);
    return false;
  }
}