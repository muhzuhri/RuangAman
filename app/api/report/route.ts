import { NextRequest, NextResponse } from 'next/server';
import { sendTelegramHighRiskReportNotification } from '@/lib/telegram';
import { type AITriageResult } from '@/lib/types';

interface ReportNotificationRequestBody {
  token?: string;
  anonymousToken?: string;
  caseId?: string;
  category?: string;
  chronology?: string;
  aiTriage?: AITriageResult;
  receivedAt?: string;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: ReportNotificationRequestBody = await request.json().catch(() => ({}));

    const token = body.token || body.anonymousToken;
    if (!token) {
      return NextResponse.json(
        { error: 'Token laporan (anonymousToken) wajib disertakan.' },
        { status: 400 }
      );
    }

    const aiTriage = body.aiTriage;
    let telegramNotified = false;
    let telegramDetails: any = null;

    // Evaluasi apakah risiko termasuk kategori CRITICAL atau HIGH
    if (aiTriage && (aiTriage.riskLevel === 'CRITICAL' || aiTriage.riskLevel === 'HIGH')) {
      const telegramResult = await sendTelegramHighRiskReportNotification({
        token,
        caseId: body.caseId,
        category: body.category || aiTriage.categoryRecommendation,
        riskLevel: aiTriage.riskLevel,
        urgencyScore: aiTriage.urgencyScore,
        summary: aiTriage.summary,
        legalPasalBasis: aiTriage.legalPasalBasis,
        receivedAt: body.receivedAt || new Date().toISOString(),
      });

      telegramNotified = telegramResult.success;
      telegramDetails = telegramResult;
    }

    return NextResponse.json(
      {
        success: true,
        token,
        riskLevel: aiTriage?.riskLevel || 'UNASSESSED',
        telegramNotified,
        telegramDetails,
        message: telegramNotified
          ? 'Notifikasi laporan berisiko tinggi berhasil diteruskan ke Telegram Satgas PPKS.'
          : 'Laporan diproses tanpa notifikasi darurat Telegram.',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[Report API Route] Error processing report notification:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Terjadi kesalahan sistem saat memproses notifikasi laporan.',
      },
      { status: 500 }
    );
  }
}
