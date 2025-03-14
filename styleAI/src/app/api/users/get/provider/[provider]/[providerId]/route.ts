import { NextResponse } from 'next/server';
import { getUserByProvider } from '@/lib/models/user';

export async function GET(
  request: Request,
  { params }: { params: { provider: string; providerId: string } }
) {
  try {
    const user = await getUserByProvider(params.provider, params.providerId);
    if (!user) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      );
    }
    return NextResponse.json(user);
  } catch (error) {
    console.error('获取用户信息失败:', error);
    return NextResponse.json(
      { error: '获取用户信息失败' },
      { status: 500 }
    );
  }
}