import { NextResponse } from 'next/server';
import * as jose from 'jose';
import { query } from '@/lib/db';

const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET;
const REDIRECT_URI = `${process.env.APP_URL}/api/auth/github/callback`;

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  if (!code) {
    return NextResponse.json({ error: '未收到授权码' }, { status: 400 });
  }

  try {
    // 获取访问令牌
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        client_id: GITHUB_CLIENT_ID,
        client_secret: GITHUB_CLIENT_SECRET,
        code,
        redirect_uri: REDIRECT_URI,
      }),
    });

    const tokenData = await tokenResponse.json();
    if (tokenData.error) {
      throw new Error(tokenData.error_description || '获取访问令牌失败');
    }

    // 获取用户信息
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const userData = await userResponse.json();
    if (userResponse.status !== 200) {
      throw new Error('获取用户信息失败');
    }

    // 获取用户邮箱
    const emailResponse = await fetch('https://api.github.com/user/emails', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });
    const emailData = await emailResponse.json();
    const primaryEmail = emailData.find((email: any) => email.primary)?.email;

    // 创建或更新用户信息
    const userResult = await query(
      `
      INSERT INTO users (
        provider,
        provider_id,
        username,
        email,
        avatar_url,
        github_profile_url,
        bio,
        access_token,
        refresh_token
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (provider, provider_id) DO UPDATE
      SET 
        username = $3,
        email = $4,
        avatar_url = $5,
        github_profile_url = $6,
        bio = $7,
        access_token = $8,
        refresh_token = $9,
        updated_at = CURRENT_TIMESTAMP
      RETURNING id, username, email, avatar_url, bio;
      `,
      [
        'github',
        userData.id.toString(),
        userData.login,
        primaryEmail,
        userData.avatar_url,
        userData.html_url,
        userData.bio,
        tokenData.access_token,
        tokenData.refresh_token || null
      ]
    );

    const user = userResult.rows[0];

    // 生成JWT令牌
    const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
    const token = await new jose.SignJWT({
      userId: user.id,
      username: user.username,
      email: user.email,
      avatar: user.avatar_url,
      bio: user.bio,
      provider: 'github'
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('7d')
      .sign(secret);

    // 重定向到前端，携带token
    const redirectUrl = new URL('/auth/github/callback', process.env.APP_URL);
    redirectUrl.searchParams.set('token', token);
    // 重定向到首页，同时设置cookie
    const response = NextResponse.redirect(process.env.APP_URL || '/');
    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 // 7天
    });
    return response;
  } catch (error) {
    console.error('GitHub认证错误:', error);
    return NextResponse.redirect(
      `${process.env.APP_URL}/login?error=github_auth_failed`
    );
  }
}