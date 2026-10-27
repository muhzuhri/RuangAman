import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminToken } from '@/lib/serverAuth';
import { type Report, type CaseStatus } from '@/lib/types';

function getSupabaseServerConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || '';
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const isConfigured = Boolean(url) && Boolean(key) && !url.includes('your-supabase-project');
  return { url, key, isConfigured };
}

function dbRowToReport(row: any): Report {
  return {
    caseId: row.case_id || row.caseId,
    anonymousToken: row.anonymous_token || row.anonymousToken,
    category: row.category,
    incidentTime: row.incident_time || row.incidentTime || undefined,
    involvedParties: row.involved_parties || row.involvedParties || undefined,
    targetFaculty: row.target_faculty || row.targetFaculty || undefined,
    chronology: row.chronology,
    evidences: Array.isArray(row.evidences) ? row.evidences : [],
    messages: Array.isArray(row.messages) ? row.messages : [],
    auditLogs: Array.isArray(row.audit_logs) ? row.audit_logs : [],
    status: (row.status as CaseStatus) || 'Laporan Diterima',
    receivedAt: row.received_at || row.receivedAt || new Date().toISOString(),
    isAnonymous: true,
    abuseFlags: Array.isArray(row.abuse_flags) ? row.abuse_flags : row.abuseFlags || undefined,
    aiTriage: row.ai_triage || row.aiTriage || undefined,
  };
}

export async function GET(request: NextRequest): Promise<NextResponse> {
  // Verifikasi otorisasi admin
  const token = request.cookies.get('admin_token')?.value;
  const verified = await verifyAdminToken(token);
  if (!verified) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const { url, key, isConfigured } = getSupabaseServerConfig();

  if (!isConfigured) {
    return NextResponse.json({
      success: true,
      reports: [],
      database: { isConfigured: false, connected: false, message: 'Supabase URL/Key belum dikonfigurasi' },
    });
  }

  try {
    const fetchUrl = `${url}/rest/v1/reports?select=*&order=received_at.desc&limit=100`;
    const res = await fetch(fetchUrl, {
      method: 'GET',
      headers: {
        apikey: key,
        Authorization: `Bearer ${key}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      return NextResponse.json({
        success: false,
        error: `Database HTTP ${res.status}`,
        reports: [],
        database: { isConfigured: true, connected: false },
      }, { status: 502 });
    }

    const rows = await res.json();
    const reports = Array.isArray(rows) ? rows.map(dbRowToReport) : [];

    return NextResponse.json({
      success: true,
      reports,
      database: { isConfigured: true, connected: true, count: reports.length, url },
    });
  } catch (err: any) {
    console.error('[Admin Reports API] Error:', err);
    return NextResponse.json({
      success: false,
      error: err?.message || 'Database connection timeout',
      reports: [],
      database: { isConfigured: true, connected: false },
    }, { status: 500 });
  }
}
