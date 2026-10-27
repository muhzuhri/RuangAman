import { NextResponse } from 'next/server';
import { aggregateTransparencyData } from '@/lib/transparencyService';
import { getSupabaseConfig } from '@/lib/reportsService';
import type { Report, CaseStatus } from '@/lib/types';

export const revalidate = 60; // Cache 60 detik untuk performa tinggi

/**
 * Open Data API Endpoint: Agregat Statistik Keamanan & Penanganan Kasus Kampus
 * Standarisasi Interoperabilitas untuk Dashboard Rektorat, Kemendikbudristek & SIAKAD Kampus.
 * 
 * Sifat: 100% Zero-Knowledge Agregat. Tidak memuat informasi identitas pribadi (PII) pelapor maupun terlapor.
 */
export async function GET() {
  try {
    const { url, key, isConfigured } = getSupabaseConfig();
    let reports: Report[] = [];
    let dataSource: 'live_supabase' | 'local_active' | 'synced_database' = 'local_active';

    if (isConfigured) {
      try {
        const res = await fetch(`${url}/rest/v1/reports?select=category,status,received_at,target_faculty`, {
          headers: {
            apikey: key,
            Authorization: `Bearer ${key}`,
            Accept: 'application/json',
          },
          next: { revalidate: 60 },
        });

        if (res.ok) {
          const rows = await res.json();
          if (Array.isArray(rows)) {
            reports = rows.map((r: any) => ({
              caseId: '',
              anonymousToken: '',
              category: r.category,
              chronology: '',
              incidentTime: '',
              targetFaculty: r.target_faculty,
              evidences: [],
              status: (r.status as CaseStatus) || 'Laporan Diterima',
              receivedAt: r.received_at || new Date().toISOString(),
              isAnonymous: true,
            }));
            dataSource = 'live_supabase';
          }
        }
      } catch (e) {
        console.warn('[OpenData API] Supabase error:', e);
      }
    }

    const aggregated = aggregateTransparencyData(reports, dataSource);

    const openDataPayload = {
      apiVersion: '1.0.0',
      system: 'RuangAman Campus Safety Ecosystem',
      license: 'Open Data Commons Public Domain Dedication (CC0-1.0)',
      generatedAt: new Date().toISOString(),
      dataSource: aggregated.dataSource,
      privacyGuarantee: aggregated.privacyNotice,
      metadata: {
        totalReportsHandled: aggregated.totalReportsProcessed,
        activeCases: aggregated.activeCasesUnderReview,
        overallResolutionRate: `${aggregated.resolutionRatePercentage}%`,
        averageResponseTimeHours: aggregated.averageResponseTimeHours,
      },
      categoryBreakdown: aggregated.realCategories.map((cat) => ({
        category: cat.category,
        caseCount: cat.count,
        percentage: `${cat.percentage}%`,
      })),
      statusBreakdown: aggregated.realStatuses.map((st) => ({
        status: st.status,
        label: st.label,
        count: st.count,
        percentage: `${st.percentage}%`,
        description: st.description,
      })),
      facultyRiskZones: aggregated.riskHeatmap.map((zone) => ({
        zoneId: zone.zoneId,
        facultyName: zone.zoneName,
        buildingType: zone.buildingType,
        reportedCount: zone.count,
        riskLevel: zone.riskLevel,
        actionStatus: zone.actionStatus,
        recommendedIntervention: zone.recommendation,
      })),
    };

    return NextResponse.json(openDataPayload, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120',
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        error: 'Gagal menghasilkan data agregat terbuka.',
        message: err?.message,
      },
      { status: 500 }
    );
  }
}
