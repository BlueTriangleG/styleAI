import { NextRequest, NextResponse } from 'next/server';
import { createJob } from '@/lib/models/job';
import { verifyJwtToken } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';
import { currentUser } from '@clerk/nextjs/server';

/**
 * 创建新的job记录API
 * POST /api/jobs/create
 */
export async function POST(request: NextRequest) {
  try {
    let userId: string;

    try {
      // 解析请求体
      const body = await request.json();

      // 优先使用请求中传入的dbUserId
      if (body.dbUserId) {
        console.log('使用请求中传入的dbUserId:', body.dbUserId);
        userId = body.dbUserId;
      } else {
        // 尝试获取Clerk用户
        const user = await currentUser();

        if (user) {
          console.log('使用Clerk用户ID:', user.id);
          // 调用同步API获取数据库用户ID
          const syncResponse = await fetch(
            new URL('/styleai/api/users/sync', request.url).toString(),
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
            }
          );

          if (syncResponse.ok) {
            const syncResult = await syncResponse.json();
            userId = syncResult.userId;
            console.log('成功获取数据库用户ID:', userId);
          } else {
            console.log('同步用户失败，使用临时用户ID');
            userId = 'temp-' + uuidv4();
          }
        } else {
          console.log('未找到用户，使用临时用户ID');
          userId = 'temp-' + uuidv4();
        }
      }

      console.log(`使用的用户ID: ${userId}`);

      // 处理上传的图像
      let uploadedImage: Buffer | undefined;

      // 如果请求中包含图片数据（Base64格式），则转换为Buffer
      if (body.uploadedImage) {
        // 移除Base64前缀（如果有）
        const base64Data = body.uploadedImage.replace(
          /^data:image\/\w+;base64,/,
          ''
        );
        uploadedImage = Buffer.from(base64Data, 'base64');
      }

      // 创建job记录
      const job = await createJob(userId, uploadedImage);

      // 返回成功响应
      return NextResponse.json({
        success: true,
        message: '成功创建job记录',
        jobId: job.id,
      });
    } catch (error) {
      console.log('请求体解析失败或处理图片失败:', error);
      // 使用临时用户ID
      userId = 'temp-' + uuidv4();

      // 创建job记录（无图片）
      const job = await createJob(userId);

      // 返回成功响应
      return NextResponse.json({
        success: true,
        message: '成功创建job记录（无图片）',
        jobId: job.id,
      });
    }
  } catch (error) {
    console.error('创建job记录失败:', error);
    return NextResponse.json(
      { error: '创建job记录失败', details: (error as Error).message },
      { status: 500 }
    );
  }
}
