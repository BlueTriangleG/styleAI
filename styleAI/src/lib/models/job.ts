import { query } from '../db';

/**
 * Job模型接口
 */
export interface Job {
  id: string;
  user_id: string;
  uploaded_image?: Buffer;
  best_fit?: Buffer;
  casual_daily?: Buffer;
  professional_work?: Buffer;
  social_gathering?: Buffer;
  outdoor_sports?: Buffer;
  target_description?: Buffer | string | any;
  created_at?: Date;
}

/**
 * 创建新的job记录
 * @param userId 用户ID
 * @param uploadedImage 上传的图片数据（可选）
 * @returns 创建的job记录
 */
export async function createJob(
  userId: string,
  uploadedImage?: Buffer
): Promise<Job> {
  try {
    console.log(`创建新的job记录，用户ID: ${userId}`);

    const insertQuery = `
      INSERT INTO jobs (
        user_id, 
        uploaded_image,
        created_at
      ) 
      VALUES ($1, $2, CURRENT_TIMESTAMP)
      RETURNING id, user_id, created_at;
    `;

    const result = await query(insertQuery, [userId, uploadedImage]);

    if (result.rows.length === 0) {
      throw new Error('创建job记录失败');
    }

    console.log(`成功创建job记录，ID: ${result.rows[0].id}`);
    return result.rows[0];
  } catch (error) {
    console.error('创建job记录失败:', error);
    throw error;
  }
}

/**
 * 根据ID获取job记录
 * @param jobId Job ID
 * @returns Job记录
 */
export async function getJobById(jobId: string): Promise<Job | null> {
  try {
    const selectQuery = `
      SELECT * FROM jobs 
      WHERE id = $1;
    `;

    const result = await query(selectQuery, [jobId]);

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  } catch (error) {
    console.error(`获取job记录失败，ID: ${jobId}:`, error);
    throw error;
  }
}

/**
 * 获取用户的所有job记录
 * @param userId 用户ID
 * @returns 用户的所有job记录
 */
export async function getJobsByUserId(userId: string): Promise<Job[]> {
  try {
    const selectQuery = `
      SELECT * FROM jobs 
      WHERE user_id = $1
    `;

    const result = await query(selectQuery, [userId]);
    return result.rows;
  } catch (error) {
    console.error(`获取用户job记录失败，用户ID: ${userId}:`, error);
    throw error;
  }
}

/**
 * 更新job记录
 * @param jobId Job ID
 * @param updateData 要更新的数据
 * @returns 更新后的job记录
 */
export async function updateJob(
  jobId: string,
  updateData: Partial<Omit<Job, 'id' | 'user_id'>>
): Promise<Job | null> {
  try {
    // 构建更新查询
    const updateFields: string[] = [];
    const queryParams: any[] = [];
    let paramIndex = 1;

    // 添加要更新的字段
    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== undefined) {
        updateFields.push(`${key} = $${paramIndex}`);
        queryParams.push(value);
        paramIndex++;
      }
    });

    // 如果没有要更新的字段，则直接返回null
    if (updateFields.length === 0) {
      return null;
    }

    // 添加jobId
    queryParams.push(jobId);

    const updateQuery = `
      UPDATE jobs 
      SET ${updateFields.join(', ')} 
      WHERE id = $${paramIndex}
      RETURNING *;
    `;

    const result = await query(updateQuery, queryParams);

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  } catch (error) {
    console.error(`更新job记录失败，ID: ${jobId}:`, error);
    throw error;
  }
}

/**
 * 删除job记录
 * @param jobId Job ID
 * @returns 删除的job记录
 */
export async function deleteJob(jobId: string): Promise<Job | null> {
  try {
    const deleteQuery = `
      DELETE FROM jobs 
      WHERE id = $1
      RETURNING *;
    `;

    const result = await query(deleteQuery, [jobId]);

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  } catch (error) {
    console.error(`删除job记录失败，ID: ${jobId}:`, error);
    throw error;
  }
}
