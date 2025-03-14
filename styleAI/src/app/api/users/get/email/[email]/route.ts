import { NextResponse } from 'next/server';
import { getUserByEmail } from '@/lib/models/user';

export async function GET(
  request: Request,
  { params }: { params: { email: string } }
) {
  try {
    const user = await getUserByEmail(params.email);
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