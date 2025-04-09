import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

/**
 * Define public routes that don't require authentication
 * Home page is public, sign-in and sign-up pages are handled by Clerk
 */
const isPublicRoute = createRouteMatcher(['/', '/sign-in(.*)', '/sign-up(.*)']);

/**
 * Configure Clerk middleware to protect all routes except public ones
 * If the user is not authenticated, they will be redirected to home page
 */
export default clerkMiddleware(async (auth, req) => {
  // Skip public routes - they're accessible to everyone
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // Check if user is authenticated
  const { userId } = await auth();

  if (!userId) {
    // Redirect unauthenticated users to home page
    const homeUrl = new URL('/styleai', req.url);
    return NextResponse.redirect(homeUrl);
  }

  // User is authenticated, proceed with the request
  return NextResponse.next();
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
