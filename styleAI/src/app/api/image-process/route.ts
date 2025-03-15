import { NextRequest, NextResponse } from 'next/server';
import { processImageClient } from '@/lib/imageProcessor';

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    if (!data.imageData) {
      return NextResponse.json({ error: '缺少图片数据' }, { status: 400 });
    }

    // 处理图片 - 在服务器端也使用客户端处理方法
    // 注意：这在服务器端可能不能正常工作，因为Canvas API是浏览器特性
    // 这里只是为了保持API兼容性
    try {
      const processedImage = await processImageClient(data.imageData);

      return NextResponse.json({
        success: true,
        processedImage,
      });
    } catch (error) {
      console.error('服务器端图片处理失败，返回原始图片:', error);

      // 如果处理失败，返回原始图片
      return NextResponse.json({
        success: true,
        processedImage: data.imageData,
        warning: '服务器端处理失败，返回原始图片',
      });
    }
  } catch (error) {
    console.error('图片处理API错误:', error);

    return NextResponse.json(
      { error: '图片处理失败', details: (error as Error).message },
      { status: 500 }
    );
  }
}

// 设置较大的响应体大小限制，因为我们处理的是图片
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};
