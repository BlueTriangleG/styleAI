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
  console.log('pathname', pathname);

  // 检查是否是公开路由
  if (publicPaths.some((path) => pathname.startsWith(path))) {
    return NextResponse.next();
  }

  // 获取认证token
  const token = request.cookies.get('auth_token')?.value;
  console.log(request);
  console.log('token', token);

  if (!token) {
    // 如果是API请求，返回401状态码
    if (pathname.startsWith('/api/')) {
      return NextResponse.json(
        { error: 'Unauthorized access' },
        { status: 401 }
      );
    }
    // 否则重定向到登录页面
    return NextResponse.redirect(new URL('/login', request.url));
  }

  try {
    // 验证token
    console.log('Starting token verification:', token);
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET!);
      const decoded = jose.jwtVerify(token, secret);
      console.log('Token verification successful, decoded result:', decoded);
    } catch (verifyError) {
      console.error('Token verification failed:', verifyError);
      throw verifyError;
    }
    console.log('Verification process completed');
    return NextResponse.next();
  } catch (error) {
    console.error('Middleware error:', error);
    // token无效
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }
    return NextResponse.redirect(new URL('/login', request.url));
  }
}

// 配置需要进行中间件处理的路由
export const config = {
  matcher: [
    // '/', // 根路径
    '/dashboard/:path*',
    '/settings/:path*',
    '/personalized-recommendation/:path*',
    '/api/((?!auth/login|auth/github).*)',
  ],
};
