import { NextRequest, NextResponse } from 'next/server';
import { checkServerRateLimit, getClientIp } from '@/lib/serverRateLimit';
import { type Message, type AuditLog } from '@/lib/types';

function getSupabaseServerConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const isConfigured = Boolean(url) && Boolean(key) && !url.includes('your-supabase-project');
  return { url, key, isConfigured };
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
): Promise<NextResponse> {
  const ip = getClientIp(request);

  // Rate Limiting: Maksimal 15 pesan chat per menit per IP
  const rateLimit = checkServerRateLimit(`chat_ip_${ip}`, 15, 60 * 1000);
  if (!rateLimit.success) {
    return NextResponse.json(
      { success: false, error: 'Terlalu sering mengirim pesan. Harap tunggu sejenak.' },
      { status: 429 }
    );
  }

  const { token } = await params;
  const cleanInput = (token || '').trim().toUpperCase();

  const body = await request.json().catch(() => ({}));
  const text = (body.text || '').trim();

  if (!text) {
    return NextResponse.json({ success: false, error: 'Pesan tidak boleh kosong.' }, { status: 400 });
  }

  const { url, key, isConfigured } = getSupabaseServerConfig();
  if (!isConfigured) {
    return NextResponse.json({ success: true, message: 'Pesan tercatat secara lokal.' });
  }

  try {
    // 1. Dapatkan laporan terkini
    const fetchRes = await fetch(
      `${url}/rest/v1/reports?or=(anonymous_token.ilike.${encodeURIComponent(cleanInput)},case_id.ilike.${encodeURIComponent(cleanInput)})&select=case_id,messages,audit_logs&limit=1`,
      {
        headers: { apikey: key, Authorization: `Bearer ${key}` },
        cache: 'no-store',
      }
    );

    if (!fetchRes.ok) {
      return NextResponse.json({ success: false, error: 'Kasus tidak ditemukan.' }, { status: 404 });
    }

    const rows = await fetchRes.json();
    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json({ success: false, error: 'Kasus tidak ditemukan.' }, { status: 404 });
    }

    const current = rows[0];
    const caseId = current.case_id;
    const existingMessages: Message[] = Array.isArray(current.messages) ? current.messages : [];
    const existingLogs: AuditLog[] = Array.isArray(current.audit_logs) ? current.audit_logs : [];

    const nowIso = new Date().toISOString();
    const newMsg: Message = {
      id: `MSG-${Date.now()}`,
      sender: 'Pelapor',
      text,
      timestamp: nowIso,
    };
    const newLog: AuditLog = {
      id: `AL-${Date.now()}`,
      action: 'Pelapor mengirimkan balasan pesan anonim',
      actor: 'Pelapor',
      timestamp: nowIso,
    };

    const updatedMessages = [...existingMessages, newMsg];
    const updatedLogs = [...existingLogs, newLog];

    // 2. Patch laporan ke Supabase
    const patchRes = await fetch(`${url}/rest/v1/reports?case_id=eq.${encodeURIComponent(caseId)}`, {
      method: 'PATCH',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: updatedMessages,
        audit_logs: updatedLogs,
      }),
    });

    if (!patchRes.ok) {
      return NextResponse.json({ success: false, error: 'Gagal memperbarui pesan di database.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: newMsg,
      auditLog: newLog,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err?.message || 'Server error' }, { status: 500 });
  }
}
