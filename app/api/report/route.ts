import { NextRequest, NextResponse } from 'next/server';
import { sendTelegramFullReportNotification } from '@/lib/telegram';
import { type AITriageResult } from '@/lib/types';

interface ReportNotificationRequestBody {
  token?: string;
  anonymousToken?: string;
  caseId?: string;
  category?: string;
  incidentTime?: string;
  involvedParties?: string;
  targetFaculty?: string;
  chronology?: string;
  evidencesCount?: number;
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

    // Kirim notifikasi lengkap ke Telegram Satgas untuk setiap laporan yang masuk
    const telegramResult = await sendTelegramFullReportNotification({
      token,
      caseId: body.caseId,
      category: body.category || body.aiTriage?.categoryRecommendation || 'Laporan Pengaduan',
      incidentTime: body.incidentTime,
      involvedParties: body.involvedParties,
      targetFaculty: body.targetFaculty,
      chronology: body.chronology || '',
      evidencesCount: body.evidencesCount ?? 0,
      aiTriage: body.aiTriage,
      receivedAt: body.receivedAt || new Date().toISOString(),
    });

    return NextResponse.json(
      {
        success: true,
        token,
        riskLevel: body.aiTriage?.riskLevel || 'UNASSESSED',
        telegramNotified: telegramResult.success,
        telegramDetails: telegramResult,
        message: telegramResult.success
          ? 'Laporan lengkap berhasil diteruskan ke Telegram Satgas PPKS.'
          : 'Laporan tercatat di sistem kampus, namun notifikasi Telegram terkendala.',
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
