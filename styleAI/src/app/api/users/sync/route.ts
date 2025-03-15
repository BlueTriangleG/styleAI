import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { currentUser } from '@clerk/nextjs/server';

/**
 * 同步用户信息到数据库
 * POST /api/users/sync
 */
export async function POST(request: NextRequest) {
  try {
    // 获取当前用户信息
    const user = await currentUser();

    if (!user) {
      return NextResponse.json({ error: '未找到用户信息' }, { status: 401 });
    }

    console.log('正在同步用户信息到数据库:', user.id);

    // 从Clerk获取用户信息
    const provider = user.externalAccounts[0]?.provider || 'clerk';
    const providerId = user.externalAccounts[0]?.externalId || user.id;
    const username = user.username || user.firstName || 'user';
    const email = user.emailAddresses[0]?.emailAddress;
    const avatarUrl = user.imageUrl;
    const bio = (user.publicMetadata?.bio as string) || '';

    let userId;

    // 首先检查用户是否已存在（通过provider和providerId）
    const checkUserByProviderQuery = `
      SELECT id FROM users 
      WHERE provider = $1 AND provider_id = $2
    `;
    const existingUserByProvider = await query(checkUserByProviderQuery, [
      provider,
      providerId,
    ]);

    if (existingUserByProvider.rows.length > 0) {
      // 用户已存在（通过provider和providerId），更新用户信息
      userId = existingUserByProvider.rows[0].id;
      console.log(
        `用户已存在（通过provider和providerId），ID: ${userId}，更新用户信息`
      );

      const updateQuery = `
        UPDATE users 
        SET 
          username = $1,
          avatar_url = $2,
          bio = $3,
          updated_at = NOW()
        WHERE id = $4
      `;

      await query(updateQuery, [username, avatarUrl, bio, userId]);
    } else if (email) {
      // 检查是否存在相同email的用户
      const checkUserByEmailQuery = `
        SELECT id FROM users 
        WHERE email = $1
      `;
      const existingUserByEmail = await query(checkUserByEmailQuery, [email]);

      if (existingUserByEmail.rows.length > 0) {
        // 存在相同email的用户，更新该用户的provider和providerId
        userId = existingUserByEmail.rows[0].id;
        console.log(
          `存在相同email的用户，ID: ${userId}，更新provider和providerId`
        );

        const updateUserQuery = `
          UPDATE users 
          SET 
            provider = $1,
            provider_id = $2,
            username = $3,
            avatar_url = $4,
            bio = $5,
            updated_at = NOW()
          WHERE id = $6
        `;

        await query(updateUserQuery, [
          provider,
          providerId,
          username,
          avatarUrl,
          bio,
          userId,
        ]);
      } else {
        // 用户不存在，创建新用户
        console.log('用户不存在，创建新用户');

        const insertQuery = `
          INSERT INTO users (
            provider,
            provider_id,
            username,
            email,
            avatar_url,
            bio
          ) 
          VALUES ($1, $2, $3, $4, $5, $6)
          RETURNING id
        `;

        const result = await query(insertQuery, [
          provider,
          providerId,
          username,
          email,
          avatarUrl,
          bio,
        ]);

        userId = result.rows[0].id;
        console.log(`成功创建用户，ID: ${userId}`);
      }
    } else {
      // 没有email但也不存在相同provider和providerId的用户，创建新用户
      console.log('用户不存在且没有email，创建新用户');

      const insertQuery = `
        INSERT INTO users (
          provider,
          provider_id,
          username,
          avatar_url,
          bio
        ) 
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id
      `;

      const result = await query(insertQuery, [
        provider,
        providerId,
        username,
        avatarUrl,
        bio,
      ]);

      userId = result.rows[0].id;
      console.log(`成功创建用户，ID: ${userId}`);
    }

    // 返回用户ID
    return NextResponse.json({
      success: true,
      userId: userId,
      message: '用户信息同步成功',
    });
  } catch (error) {
    console.error('同步用户信息失败:', error);

    // 即使出错也返回成功响应，避免前端报错
    // 尝试从错误信息中提取用户ID
    let userId = null;

    if (
      (error as Error).message.includes(
        'duplicate key value violates unique constraint'
      )
    ) {
      // 如果是唯一性约束冲突，尝试查找已存在的用户
      try {
        const user = await currentUser();
        if (user && user.emailAddresses && user.emailAddresses.length > 0) {
          const email = user.emailAddresses[0].emailAddress;

          // 通过email查找用户
          const checkUserByEmailQuery = `
            SELECT id FROM users 
            WHERE email = $1
          `;
          const existingUser = await query(checkUserByEmailQuery, [email]);

          if (existingUser.rows.length > 0) {
            userId = existingUser.rows[0].id;
            console.log(`找到已存在的用户，ID: ${userId}`);
          }
        }
      } catch (innerError) {
        console.error('尝试查找已存在用户失败:', innerError);
      }
    }

    if (userId) {
      return NextResponse.json({
        success: true,
        userId: userId,
        message: '找到已存在的用户',
      });
    }

    // 如果无法找到用户ID，则返回错误
    return NextResponse.json(
      { error: '同步用户信息失败', details: (error as Error).message },
      { status: 500 }
    );
  }
}
