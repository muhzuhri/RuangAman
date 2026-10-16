import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * High-Performance Next.js Middleware for Admin Route Protection & Session Pre-validation
 * 
 * Performance Optimizations:
 * 1. Filtered matcher: Runs strictly on `/admin` routes, bypassing static assets and public pages.
 * 2. Fast local cookie check: Pre-validates session cookie without making blocking network calls
 *    to Supabase Auth (`supabase.auth.getUser()`) on every navigation.
 * 3. Bypasses auth checks for `/admin/login` to prevent redirect loops.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Allow unauthenticated access to login page
  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  // 2. Fast non-blocking cookie check for protected admin routes
  const adminCookie = request.cookies.get('isAdminLoggedIn')?.value;

  // If no session cookie exists on server side, redirect to login page immediately
  // avoiding unneeded HTML streaming or background fetches
  if (!adminCookie) {
    const loginUrl = new URL('/admin/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
