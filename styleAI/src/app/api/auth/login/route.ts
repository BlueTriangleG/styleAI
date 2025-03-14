import { NextResponse } from 'next/server';

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const REDIRECT_URI = `${process.env.APP_URL}/api/auth/github/callback`;

// POST /api/auth/login
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { provider } = body;

    if (provider === 'github') {
      const params = new URLSearchParams({
        client_id: GITHUB_CLIENT_ID!,
        redirect_uri: REDIRECT_URI,
        scope: 'read:user user:email',
        allow_signup: 'true',
      });

      return NextResponse.redirect(
        `https://github.com/login/oauth/authorize?${params.toString()}`
      );
    }

    return NextResponse.json(
      { error: '不支持的登录方式' },
      { status: 400 }
    );
  } catch (error) {
    console.error('登录失败:', error);
    return NextResponse.json(
      { error: '登录失败' },
      { status: 500 }
    );
  }
}