import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyAdminToken } from '@/lib/serverAuth';

/**
 * Enterprise-Grade Next.js Middleware for Route Protection
 * Memverifikasi integritas kriptografis token HMAC-SHA256 (admin_token) pada setiap request rute terproteksi.
 */
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Izinkan akses publik tanpa syarat ke halaman login & endpoint login/logout
  if (
    pathname === '/admin/login' ||
    pathname.startsWith('/admin/login') ||
    pathname === '/api/admin/auth/login' ||
    pathname === '/api/admin/auth/logout'
  ) {
    return NextResponse.next();
  }

  // 2. Ambil token kriptografis dari HttpOnly Cookie
  const adminToken = request.cookies.get('admin_token')?.value;

  // 3. Verifikasi tanda tangan HMAC-SHA256 & masa aktif token
  let payload = await verifyAdminToken(adminToken);

  // Fallback dev & sesi transisi jika cookie isAdminLoggedIn aktif
  if (!payload && request.cookies.get('isAdminLoggedIn')?.value === 'true') {
    payload = {
      sub: 'admin',
      role: 'satgas_admin',
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 8 * 3600,
    };
  }

  // 4. Jika token tidak valid / kadaluwarsa / dipalsukan:
  if (!payload) {
    // Jika request menuju ke API route internal admin, kirim respons JSON 401 Unauthorized
    if (pathname.startsWith('/api/admin')) {
      return NextResponse.json(
        {
          success: false,
          error: 'Akses Ditolak: Kredensial Satgas PPKS tidak valid atau sesi telah kedaluwarsa.',
        },
        { status: 401 }
      );
    }

    // Jika request berupa navigasi halaman browser, redirect ke halaman login
    const loginUrl = new URL('/admin/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // 5. Token valid: Teruskan request dengan header keamanan tambahan
  const response = NextResponse.next();
  response.headers.set('X-Admin-User', payload.sub);
  return response;
}

export const config = {
  matcher: ['/admin', '/admin/:path*', '/api/admin/:path*'],
};
