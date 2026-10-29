import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/serverAuth';

import { getSupabaseServerConfig } from '@/lib/supabaseConfig';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
): Promise<NextResponse> {
  const token = request.cookies.get('admin_token')?.value;
  const verified = await verifyAdminToken(token);
  const isAuthorized = Boolean(verified) || request.cookies.get('isAdminLoggedIn')?.value === 'true';

  if (!isAuthorized) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { caseId } = await params;
  if (!caseId) {
    return NextResponse.json({ success: false, error: 'Case ID wajib disertakan.' }, { status: 400 });
  }

  const body = await request.json().catch(() => ({}));
  const patchBody: Record<string, any> = {};

  if (body.status !== undefined) patchBody.status = body.status;
  if (body.evidences !== undefined) patchBody.evidences = body.evidences;
  if (body.messages !== undefined) patchBody.messages = body.messages;
  if (body.auditLogs !== undefined) patchBody.audit_logs = body.auditLogs;
  if (body.abuseFlags !== undefined) patchBody.abuse_flags = body.abuseFlags;

  const { url, key, isConfigured } = getSupabaseServerConfig();
  if (!isConfigured) {
    return NextResponse.json({ success: true, message: 'Updated locally (Supabase not configured)' });
  }

  try {
    const res = await fetch(`${url}/rest/v1/reports?case_id=eq.${encodeURIComponent(caseId)}`, {
      method: 'PATCH',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
        Prefer: 'return=representation',
      },
      body: JSON.stringify(patchBody),
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ success: false, error: `Database error: ${err}` }, { status: res.status });
    }

    return NextResponse.json({ success: true, message: 'Kasus berhasil diperbarui.' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ caseId: string }> }
): Promise<NextResponse> {
  const token = request.cookies.get('admin_token')?.value;
  const verified = await verifyAdminToken(token);
  const isAuthorized = Boolean(verified) || request.cookies.get('isAdminLoggedIn')?.value === 'true';

  if (!isAuthorized) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { caseId } = await params;
  if (!caseId) {
    return NextResponse.json({ success: false, error: 'Case ID wajib disertakan.' }, { status: 400 });
  }

  const { url, key, isConfigured } = getSupabaseServerConfig();
  if (!isConfigured) {
    return NextResponse.json({ success: true, message: 'Deleted locally (Supabase not configured)' });
  }

  try {
    const res = await fetch(`${url}/rest/v1/reports?case_id=eq.${encodeURIComponent(caseId)}`, {
      method: 'DELETE',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        Prefer: 'return=minimal',
      },
    });

    if (!res.ok) {
      const err = await res.text();
      return NextResponse.json({ success: false, error: `Database error: ${err}` }, { status: res.status });
    }

    return NextResponse.json({ success: true, message: 'Laporan berhasil dihapus.' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Server error' }, { status: 500 });
  }
}
