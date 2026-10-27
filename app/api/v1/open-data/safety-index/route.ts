import { NextResponse } from 'next/server';
import { aggregateTransparencyData } from '@/lib/transparencyService';

export const revalidate = 60;

/**
 * Open Data API: Indeks Keselamatan & Zonasi Risiko Fakultas Kampus
 */
export async function GET() {
  const aggregated = aggregateTransparencyData([], 'local_active');

  const payload = {
    apiVersion: '1.0.0',
    system: 'RuangAman Campus Safety Ecosystem',
    indicator: 'Indeks Kerawanan & Keamanan Civitas Akademika (IKKA)',
    timestamp: new Date().toISOString(),
    zones: aggregated.riskHeatmap.map((z) => ({
      zoneId: z.zoneId,
      faculty: z.zoneName,
      buildingType: z.buildingType,
      reportedCasesCount: z.count,
      riskLevel: z.riskLevel,
      status: z.actionStatus,
      recommendedIntervention: z.recommendation,
    })),
  };

  return NextResponse.json(payload, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, s-maxage=60',
    },
  });
}
