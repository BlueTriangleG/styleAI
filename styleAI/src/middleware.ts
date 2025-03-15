import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken, parseToken } from './lib/auth';

// Routes that don't require authentication
const publicRoutes = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/refresh',
  '/personalized-recommendation',
  '/personalized-recommendation/step1',
  '/personalized-recommendation/loading',
  '/personalized-recommendation/step2',
];

export function middleware(request: NextRequest) {
  // Check if it's a public route
  const isPublicRoute = publicRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  );

  if (isPublicRoute) return NextResponse.next();

  // Get authentication token
  const token = request.cookies.get('auth_token')?.value;

  if (!token) {
    // If it's an API request, return 401 status code
    if (request.nextUrl.pathname.startsWith('/api/')) {
      return new NextResponse(
        JSON.stringify({ message: 'Authentication required' }),
        { status: 401, headers: { 'content-type': 'application/json' } }
      );
    }

    // Otherwise redirect to login page
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Validate token
  try {
    const payload = parseToken(token);
    const currentTime = Math.floor(Date.now() / 1000);

    if (!payload || !payload.exp || payload.exp < currentTime) {
      // Token is invalid or expired
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('auth_token');
      return response;
    }

    return NextResponse.next();
  } catch (error) {
    // Invalid token
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete('auth_token');
    return response;
  }
}

// Configure routes that need middleware processing
export const config = {
  matcher: [
    // '/', // Root path
    '/dashboard/:path*',
    '/profile/:path*',
    '/api/:path*',
  ],
};
