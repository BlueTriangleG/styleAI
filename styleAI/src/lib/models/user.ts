import { query } from '../db';
import { User } from '../../types/user';

// 创建新用户
export async function createUser(data: Omit<User, 'id' | 'created_at' | 'updated_at'>) {
  const insertQuery = `
    INSERT INTO users (
      provider, provider_id, username, email, avatar_url,
      github_profile_url, bio, access_token, refresh_token
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *;
  `;
  try {
    const result = await query(insertQuery, [
      data.provider,
      data.provider_id,
      data.username,
      data.email,
      data.avatar_url,
      data.github_profile_url,
      data.bio,
      data.access_token,
      data.refresh_token
    ]);
    return result.rows[0];
  } catch (error) {
    console.error('创建用户失败:', error);
    throw error;
  }
}

// 根据ID获取用户
export async function getUserById(id: string) {
  const selectQuery = 'SELECT * FROM users WHERE id = $1;';
  try {
    const result = await query(selectQuery, [id]);
    return result.rows[0];
  } catch (error) {
    console.error('获取用户失败:', error);
    throw error;
  }
}

// 根据provider和provider_id获取用户
export async function getUserByProvider(provider: string, providerId: string) {
  const selectQuery = 'SELECT * FROM users WHERE provider = $1 AND provider_id = $2;';
  try {
    const result = await query(selectQuery, [provider, providerId]);
    return result.rows[0];
  } catch (error) {
    console.error('获取用户失败:', error);
    throw error;
  }
}

// 根据邮箱获取用户
export async function getUserByEmail(email: string) {
  const selectQuery = 'SELECT * FROM users WHERE email = $1;';
  try {
    const result = await query(selectQuery, [email]);
    return result.rows[0];
  } catch (error) {
    console.error('获取用户失败:', error);
    throw error;
  }
}

// 获取所有用户
export async function getAllUsers() {
  const selectQuery = 'SELECT * FROM users ORDER BY created_at DESC;';
  try {
    const result = await query(selectQuery);
    return result.rows;
  } catch (error) {
    console.error('获取用户列表失败:', error);
    throw error;
  }
}

// 更新用户信息
export async function updateUser(id: string, data: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>) {
  const updateFields = [];
  const values = [];
  let paramCount = 1;

  // 动态构建更新字段
  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) {
      updateFields.push(`${key} = $${paramCount}`);
      values.push(value);
      paramCount++;
    }
  });

  // 添加updated_at字段的更新
  updateFields.push('updated_at = now()');

  // 如果没有要更新的字段，直接返回
  if (updateFields.length === 1) {
    return getUserById(id);
  }

  const updateQuery = `
    UPDATE users
    SET ${updateFields.join(', ')}
    WHERE id = $${paramCount}
    RETURNING *;
  `;

  try {
    values.push(id);
    const result = await query(updateQuery, values);
    return result.rows[0];
  } catch (error) {
    console.error('更新用户失败:', error);
    throw error;
  }
}

// 删除用户
export async function deleteUser(id: string) {
  const deleteQuery = 'DELETE FROM users WHERE id = $1 RETURNING *;';
  try {
    const result = await query(deleteQuery, [id]);
    return result.rows[0];
  } catch (error) {
    console.error('删除用户失败:', error);
    throw error;
  }
}