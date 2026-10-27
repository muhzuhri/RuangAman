import { NextRequest, NextResponse } from 'next/server';
import { createAdminToken } from '@/lib/serverAuth';
import { checkServerRateLimit, getClientIp } from '@/lib/serverRateLimit';

const VALID_USERNAME = process.env.ADMIN_USERNAME?.trim() || 'admin';
const VALID_PASSWORD = process.env.ADMIN_PASSWORD?.trim() || 'satgas2026';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const ip = getClientIp(request);

  // 1. Brute-force protection: Maksimal 6 percobaan login per 10 menit per IP
  const rateLimit = checkServerRateLimit(`login_ip_${ip}`, 6, 10 * 60 * 1000);
  if (!rateLimit.success) {
    return NextResponse.json(
      {
        success: false,
        error: `Terlalu banyak percobaan login gagal. Demi keamanan, silakan tunggu ${rateLimit.resetSeconds} detik sebelum mencoba kembali.`,
      },
      {
        status: 429,
        headers: {
          'Retry-After': String(rateLimit.resetSeconds),
        },
      }
    );
  }

  try {
    const body = await request.json().catch(() => ({}));
    const username = (body.username || '').trim();
    const password = (body.password || '').trim();

    if (!username || !password) {
      return NextResponse.json(
        { success: false, error: 'Username dan kata sandi wajib diisi.' },
        { status: 400 }
      );
    }

    // 2. Verifikasi kredensial
    if (username !== VALID_USERNAME || password !== VALID_PASSWORD) {
      return NextResponse.json(
        {
          success: false,
          error: 'Username atau kata sandi tidak valid. Pastikan kredensial Satgas benar.',
          remainingAttempts: rateLimit.remaining,
        },
        { status: 401 }
      );
    }

    // 3. Terbitkan Signed Token Kriptografis (HMAC-SHA256)
    const token = await createAdminToken(username);

    // 4. Set HttpOnly Cookie yang tidak dapat diakses atau dimanipulasi oleh JavaScript browser
    const response = NextResponse.json(
      {
        success: true,
        message: 'Autentikasi Satgas PPKS berhasil.',
        user: { username, role: 'satgas_admin' },
      },
      { status: 200 }
    );

    const isProduction = process.env.NODE_ENV === 'production';
    response.cookies.set({
      name: 'admin_token',
      value: token,
      httpOnly: true,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 8 * 60 * 60, // 8 jam
    });

    // Pertahankan legacy cookie untuk fallback UI cepat
    response.cookies.set({
      name: 'isAdminLoggedIn',
      value: 'true',
      httpOnly: false,
      secure: isProduction,
      sameSite: 'lax',
      path: '/',
      maxAge: 8 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    console.error('[Admin Login API] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Terjadi kesalahan internal pada server autentikasi.' },
      { status: 500 }
    );
  }
}
