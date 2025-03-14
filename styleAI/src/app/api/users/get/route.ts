import { NextResponse } from 'next/server';
import { getAllUsers } from '@/lib/models/user';

export async function GET(request: Request) {
  try {
    const users = await getAllUsers();
    return NextResponse.json(users);
  } catch (error) {
    console.error('获取用户列表失败:', error);
    return NextResponse.json(
      { error: '获取用户列表失败' },
      { status: 500 }
    );
  }
}