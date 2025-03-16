import { NextRequest, NextResponse } from 'next/server';
import { getJobById } from '@/lib/models/job';

/**
 * 获取job的best_fit图片数据API
 * POST /api/jobs/getBestFit
 */
export async function POST(request: NextRequest) {
  try {
    // 解析请求体
    const body = await request.json();
    const jobId = body.jobId;

    if (!jobId) {
      return NextResponse.json(
        { status: 'error', error: '缺少必要参数: jobId' },
        { status: 400 }
      );
    }

    console.log(`正在获取job的best_fit图片数据，jobId: ${jobId}`);

    // 从数据库获取job记录
    const job = await getJobById(jobId);

    if (!job) {
      console.log(`未找到job记录，jobId: ${jobId}`);
      return NextResponse.json(
        { status: 'error', error: `未找到job记录: ${jobId}` },
        { status: 404 }
      );
    }

    // 检查是否有best_fit图片数据
    if (!job.best_fit) {
      console.log(`Job记录中没有best_fit图片数据，jobId: ${jobId}`);
      return NextResponse.json(
        { status: 'error', error: '没有best_fit图片数据' },
        { status: 404 }
      );
    }

    // 将Buffer转换为Base64字符串
    const imageData = Buffer.from(job.best_fit).toString('base64');

    // 返回成功响应
    return NextResponse.json({
      status: 'success',
      jobId: jobId,
      imageData: imageData,
    });
  } catch (error) {
    console.error('获取job的best_fit图片数据失败:', error);
    return NextResponse.json(
      {
        status: 'error',
        error: '获取best_fit图片数据失败',
        details: (error as Error).message,
      },
      { status: 500 }
    );
  }
}
