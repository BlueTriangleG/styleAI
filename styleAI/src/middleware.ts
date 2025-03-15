import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jose from 'jose';

// 不需要验证的路由
const publicPaths = [
  '/login',
  '/api/auth/login',
  '/api/auth/github',
  '/api/auth/github/callback',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log("pathname",pathname);

  // Set redirect URL to avoid redirect problem under nginx proxy
  const redirectURL = request.nextUrl.clone();
  redirectURL.pathname = '/login';

  // 检查是否是公开路由
  if (publicPaths.some(path => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // 获取认证token
  const token = request.cookies.get('auth_token')?.value;
  console.log(request);
  console.log("token",token);

  if (!token) {
    // 如果是API请求，返回401状态码
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: '未授权访问' }, { status: 401 });
    }
    // 否则重定向到登录页面
    return NextResponse.redirect(redirectURL);
  }

  try {
    // 验证token
    console.log("开始验证token:", token);
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
      const decoded = jose.jwtVerify(token, secret);
      console.log("token验证成功，解码结果:", decoded);
    } catch (verifyError) {
      console.error("token验证失败:", verifyError);
      throw verifyError;
    }
    console.log("验证流程结束");
    return NextResponse.next();
  } catch (error) {
    console.error("中间件错误:", error);
    // token无效
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'token无效' }, { status: 401 });
    }
    return NextResponse.redirect(redirectURL);
  }
}

// 配置需要进行中间件处理的路由
export const config = {
  matcher: [
    // '/', // 根路径
    '/dashboard/:path*',
    '/settings/:path*',
    '/api/((?!auth/login|auth/github).*)',
  ],
};