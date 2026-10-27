import { NextResponse } from 'next/server';

export async function POST(): Promise<NextResponse> {
  const response = NextResponse.json(
    { success: true, message: 'Sesi admin berhasil diakhiri.' },
    { status: 200 }
  );

  response.cookies.set({
    name: 'admin_token',
    value: '',
    httpOnly: true,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
    expires: new Date(0),
  });

  response.cookies.set({
    name: 'isAdminLoggedIn',
    value: '',
    httpOnly: false,
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
    expires: new Date(0),
  });

  return response;
}
