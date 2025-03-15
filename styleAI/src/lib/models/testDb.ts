import { query } from '../db';

interface TestDb {
  id: number;
  name: string;
  description: string;
}

// 插入数据
export async function insertTestDb(data: Omit<TestDb, 'id'>) {
  const insertQuery = `
    INSERT INTO test_db (name, description)
    VALUES ($1, $2)
    RETURNING *;
  `;
  try {
    const result = await query(insertQuery, [data.name, data.description]);
    return result.rows[0];
  } catch (error) {
    console.error('插入数据失败:', error);
    throw error;
  }
}

// 获取所有数据
export async function getAllTestDb() {
  const selectQuery = 'SELECT * FROM test_db ORDER BY id;';
  try {
    const result = await query(selectQuery);
    return result.rows;
  } catch (error) {
    console.error('获取数据失败:', error);
    throw error;
  }
}

// 根据ID获取数据
export async function getTestDbById(id: number) {
  const selectQuery = 'SELECT * FROM test_db WHERE id = $1;';
  try {
    const result = await query(selectQuery, [id]);
    return result.rows[0];
  } catch (error) {
    console.error('获取数据失败:', error);
    throw error;
  }
}

// 更新数据
export async function updateTestDb(
  id: number,
  data: Partial<Omit<TestDb, 'id'>>
) {
  const updateQuery = `
    UPDATE test_db
    SET name = COALESCE($1, name),
        description = COALESCE($2, description)
    WHERE id = $3
    RETURNING *;
  `;
  try {
    const result = await query(updateQuery, [data.name, data.description, id]);
    return result.rows[0];
  } catch (error) {
    console.error('更新数据失败:', error);
    throw error;
  }
}

// 删除数据
export async function deleteTestDb(id: number) {
  const deleteQuery = 'DELETE FROM test_db WHERE id = $1 RETURNING *;';
  try {
    const result = await query(deleteQuery, [id]);
    return result.rows[0];
  } catch (error) {
    console.error('删除数据失败:', error);
    throw error;
  }
}
