import { NextResponse } from 'next/server';
import { getUserById } from '@/lib/models/user';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const user = await getUserById(params.id);
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