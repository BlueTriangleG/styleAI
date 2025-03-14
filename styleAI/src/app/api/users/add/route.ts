import { NextResponse } from 'next/server';
import { createUser } from '@/lib/models/user';

export async function POST(request: Request) {
  try {
    const data = await request.json();

    // 验证必要字段
    const requiredFields = ['provider', 'provider_id', 'username'];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `缺少必要字段: ${field}` },
          { status: 400 }
        );
      }
    }

    // 创建用户
    const user = await createUser({
      provider: data.provider,
      provider_id: data.provider_id,
      username: data.username,
      email: data.email,
      avatar_url: data.avatar_url,
      github_profile_url: data.github_profile_url,
      bio: data.bio,
      access_token: data.access_token,
      refresh_token: data.refresh_token
    });

    return NextResponse.json(user, { status: 201 });
  } catch (error: any) {
    console.error('创建用户失败:', error);
    return NextResponse.json(
      { error: '创建用户失败' },
      { status: 500 }
    );
  }
}