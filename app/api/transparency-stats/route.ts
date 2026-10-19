import { NextResponse } from 'next/server';
import { getSupabaseConfig } from '@/lib/reportsService';
import {
  aggregateTransparencyData,
  type CampusRiskZone,
  type TransparencyStatsResponse,
} from '@/lib/transparencyService';
import type { Report, CaseStatus } from '@/lib/types';

export type { CampusRiskZone, TransparencyStatsResponse };

export async function GET() {
  try {
    const { url, key, isConfigured } = getSupabaseConfig();
    let reports: Report[] = [];
    let dataSource: 'live_supabase' | 'local_active' | 'synced_database' = 'local_active';

    if (isConfigured) {
      try {
        const res = await fetch(`${url}/rest/v1/reports?select=*&order=received_at.desc`, {
          headers: {
            apikey: key,
            Authorization: `Bearer ${key}`,
            Accept: 'application/json',
          },
          cache: 'no-store',
        });

        if (res.ok) {
          const rows = await res.json();
          if (Array.isArray(rows)) {
            reports = rows.map((row: any) => ({
              caseId: row.case_id || row.caseId,
              anonymousToken: row.anonymous_token || row.anonymousToken,
              category: row.category,
              incidentTime: row.incident_time || row.incidentTime || '',
              involvedParties: row.involved_parties || row.involvedParties || undefined,
              targetFaculty: row.target_faculty || row.targetFaculty || undefined,
              chronology: row.chronology || '',
              evidences: Array.isArray(row.evidences) ? row.evidences : [],
              messages: Array.isArray(row.messages) ? row.messages : [],
              auditLogs: Array.isArray(row.audit_logs) ? row.audit_logs : [],
              status: (row.status as CaseStatus) || 'Laporan Diterima',
              receivedAt: row.received_at || row.receivedAt || new Date().toISOString(),
              isAnonymous: true,
              abuseFlags: Array.isArray(row.abuse_flags) ? row.abuse_flags : undefined,
              aiTriage: row.ai_triage || undefined,
            }));
            dataSource = 'live_supabase';
          }
        }
      } catch (dbErr) {
        console.warn('[Transparency API] Supabase offline/unreachable:', dbErr);
      }
    }

    const payload = aggregateTransparencyData(reports, dataSource);

    return NextResponse.json(payload, {
      status: 200,
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    });
  } catch (error: any) {
    console.error('[Transparency Stats API] Error:', error);
    const fallbackPayload = aggregateTransparencyData([], 'local_active');
    return NextResponse.json(fallbackPayload, { status: 200 });
  }
}
