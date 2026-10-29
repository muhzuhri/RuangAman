import { NextRequest, NextResponse } from 'next/server';
import { checkServerRateLimit, getClientIp } from '@/lib/serverRateLimit';
import { type Report, type CaseStatus } from '@/lib/types';

import { getSupabaseServerConfig } from '@/lib/supabaseConfig';

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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
): Promise<NextResponse> {
  const ip = getClientIp(request);

  // Rate Limiting: Maksimal 30 pencarian per menit per IP untuk mencegah brute force token
  const rateLimit = checkServerRateLimit(`track_ip_${ip}`, 30, 60 * 1000);
  if (!rateLimit.success) {
    return NextResponse.json(
      {
        success: false,
        error: `Terlalu banyak permintaan pelacakan. Tunggu ${rateLimit.resetSeconds} detik.`,
      },
      { status: 429 }
    );
  }

  const { token } = await params;
  const cleanInput = (token || '').trim().toUpperCase();

  if (!cleanInput || cleanInput.length < 3) {
    return NextResponse.json(
      { success: false, error: 'Token anonim atau Case ID tidak valid.' },
      { status: 400 }
    );
  }

  const { url, key, isConfigured } = getSupabaseServerConfig();

  if (isConfigured) {
    try {
      const fetchUrl = `${url}/rest/v1/reports?or=(anonymous_token.ilike.${encodeURIComponent(cleanInput)},case_id.ilike.${encodeURIComponent(cleanInput)})&select=*&limit=1`;
      const res = await fetch(fetchUrl, {
        method: 'GET',
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      });

      if (res.ok) {
        const rows = await res.json();
        if (Array.isArray(rows) && rows.length > 0) {
          const report = dbRowToReport(rows[0]);
          return NextResponse.json({ success: true, report });
        }
      }
    } catch (err) {
      console.warn('[Track API] Supabase error/timeout:', err);
    }
  }

  return NextResponse.json(
    { success: false, error: 'Laporan tidak ditemukan dengan token atau ID tersebut.' },
    { status: 404 }
  );
}
