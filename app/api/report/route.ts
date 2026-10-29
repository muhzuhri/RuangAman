import { NextRequest, NextResponse } from 'next/server';
import { sendTelegramFullReportNotification } from '@/lib/telegram';
import { checkServerRateLimit, getClientIp } from '@/lib/serverRateLimit';
import { type AITriageResult } from '@/lib/types';

interface ReportSubmissionPayload {
  token?: string;
  anonymousToken?: string;
  caseId?: string;
  category?: string;
  incidentTime?: string;
  involvedParties?: string;
  targetFaculty?: string;
  chronology?: string;
  evidences?: any[];
  evidencesCount?: number;
  aiTriage?: AITriageResult;
  auditLogs?: any[];
  messages?: any[];
  abuseFlags?: string[];
  receivedAt?: string;
}

import { getSupabaseServerConfig } from '@/lib/supabaseConfig';

export async function POST(request: NextRequest): Promise<NextResponse> {
  const ip = getClientIp(request);

  // 1. Server-side Rate Limiting: Maksimal 6 laporan per jam per IP
  const rateLimit = checkServerRateLimit(`report_submit_${ip}`, 6, 60 * 60 * 1000);
  if (!rateLimit.success) {
    return NextResponse.json(
      {
        success: false,
        error: `Batas pengiriman laporan tercapai (maksimal 6 laporan/jam). Silakan tunggu ${rateLimit.resetSeconds} detik.`,
      },
      {
        status: 429,
        headers: { 'Retry-After': String(rateLimit.resetSeconds) },
      }
    );
  }

  try {
    const body: ReportSubmissionPayload = await request.json().catch(() => ({}));
    const token = body.token || body.anonymousToken;
    const caseId = body.caseId;
    const chronology = (body.chronology || '').trim();

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Token laporan anonim (anonymousToken) wajib disertakan.' },
        { status: 400 }
      );
    }

    if (!chronology || chronology.length < 5) {
      return NextResponse.json(
        { success: false, error: 'Kronologi kejadian wajib diisi dengan narasi yang jelas.' },
        { status: 400 }
      );
    }

    // 2. Simpan secara aman ke Supabase dari Sisi Server
    const { url, key, isConfigured } = getSupabaseServerConfig();
    let dbSaved = false;

    if (isConfigured && caseId) {
      try {
        const dbRow = {
          case_id: caseId,
          anonymous_token: token,
          category: body.category || 'Laporan Pengaduan',
          incident_time: body.incidentTime || null,
          involved_parties: body.involvedParties || null,
          target_faculty: body.targetFaculty || null,
          chronology: chronology,
          evidences: Array.isArray(body.evidences) ? body.evidences : [],
          messages: Array.isArray(body.messages) ? body.messages : [],
          audit_logs: Array.isArray(body.auditLogs) ? body.auditLogs : [],
          status: 'Laporan Diterima',
          received_at: body.receivedAt || new Date().toISOString(),
          is_anonymous: true,
          abuse_flags: body.abuseFlags || [],
          ai_triage: body.aiTriage || null,
        };

        const dbRes = await fetch(`${url}/rest/v1/reports`, {
          method: 'POST',
          headers: {
            apikey: key,
            Authorization: `Bearer ${key}`,
            'Content-Type': 'application/json',
            Prefer: 'resolution=ignore-duplicates,return=representation',
          },
          body: JSON.stringify(dbRow),
        });

        if (dbRes.ok) {
          dbSaved = true;
        } else {
          console.warn('[Report API] Gagal simpan ke Supabase:', await dbRes.text());
        }
      } catch (dbErr) {
        console.warn('[Report API] Supabase connection error:', dbErr);
      }
    }

    // 3. Kirim notifikasi lengkap ke Telegram Satgas
    const telegramResult = await sendTelegramFullReportNotification({
      token,
      caseId: body.caseId,
      category: body.category || body.aiTriage?.categoryRecommendation || 'Laporan Pengaduan',
      incidentTime: body.incidentTime,
      involvedParties: body.involvedParties,
      targetFaculty: body.targetFaculty,
      chronology,
      evidencesCount: body.evidencesCount ?? (body.evidences ? body.evidences.length : 0),
      aiTriage: body.aiTriage,
      receivedAt: body.receivedAt || new Date().toISOString(),
    });

    return NextResponse.json(
      {
        success: true,
        token,
        caseId,
        dbSaved,
        riskLevel: body.aiTriage?.riskLevel || 'UNASSESSED',
        telegramNotified: telegramResult.success,
        message: 'Laporan berhasil dicatat dan diproses oleh sistem keamanan kampus.',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[Report API Route] Error processing report notification:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Terjadi kesalahan sistem saat memproses laporan.',
      },
      { status: 500 }
    );
  }
}
