import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/serverAuth';

export async function GET(request: NextRequest): Promise<NextResponse> {
  const token = request.cookies.get('admin_token')?.value;

  if (!token) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  const payload = await verifyAdminToken(token);
  if (!payload) {
    return NextResponse.json({ authenticated: false, error: 'Sesi kedaluwarsa atau token tidak valid' }, { status: 401 });
  }

  return NextResponse.json({
    authenticated: true,
    user: {
      username: payload.sub,
      role: payload.role,
      expiresAt: new Date(payload.exp * 1000).toISOString(),
    },
  });
}
