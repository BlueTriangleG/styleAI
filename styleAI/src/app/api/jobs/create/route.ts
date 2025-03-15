import { NextRequest, NextResponse } from 'next/server';
import { createJob } from '@/lib/models/job';
import { verifyJwtToken } from '@/lib/auth';

/**
 * 创建新的job记录API
 * POST /api/jobs/create
 */
export async function POST(request: NextRequest) {
  try {
    // 验证用户身份
    const token = request.cookies.get('auth_token')?.value;

    if (!token) {
      return NextResponse.json({ error: '未授权，请先登录' }, { status: 401 });
    }

    // 验证JWT令牌
    const payload = await verifyJwtToken(token);

    if (!payload || !payload.userId) {
      return NextResponse.json({ error: '无效的令牌' }, { status: 401 });
    }

    // 获取用户ID
    const userId = payload.userId;

    // 解析请求体
    let uploadedImage: Buffer | undefined;

    try {
      const body = await request.json();

      // 如果请求中包含图片数据（Base64格式），则转换为Buffer
      if (body.uploadedImage) {
        // 移除Base64前缀（如果有）
        const base64Data = body.uploadedImage.replace(
          /^data:image\/\w+;base64,/,
          ''
        );
        uploadedImage = Buffer.from(base64Data, 'base64');
      }
    } catch (error) {
      console.log('请求体解析失败，假设没有上传图片');
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
    console.error('创建job记录失败:', error);
    return NextResponse.json(
      { error: '创建job记录失败', details: (error as Error).message },
      { status: 500 }
    );
  }
}
