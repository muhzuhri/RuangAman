import { NextRequest, NextResponse } from 'next/server';
import { sendTelegramSOSAlert, SOSAlertPayload } from '@/lib/telegram';

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json().catch(() => ({}));

    const alertId = `SOS-${Date.now().toString(36).toUpperCase()}`;
    const timestamp = body.timestamp || new Date().toISOString();

    const payload: SOSAlertPayload = {
      alertId,
      latitude: typeof body.latitude === 'number' ? body.latitude : null,
      longitude: typeof body.longitude === 'number' ? body.longitude : null,
      accuracy: typeof body.accuracy === 'number' ? body.accuracy : null,
      locationStatus: body.locationStatus || (body.latitude ? 'granted' : 'denied'),
      timestamp,
      userAgent: request.headers.get('user-agent') || undefined,
      clientNote: typeof body.clientNote === 'string' ? body.clientNote : undefined,
    };

    // Siarkan sinyal darurat ke grup Telegram Tim Keamanan & Satgas
    const telegramResult = await sendTelegramSOSAlert(payload);

    return NextResponse.json(
      {
        success: true,
        alertId,
        timestamp,
        locationStatus: payload.locationStatus,
        hasCoordinates: payload.latitude !== null && payload.longitude !== null,
        coordinates:
          payload.latitude !== null && payload.longitude !== null
            ? {
                latitude: payload.latitude,
                longitude: payload.longitude,
                accuracy: payload.accuracy,
                mapsUrl: `https://www.google.com/maps/search/?api=1&query=${payload.latitude},${payload.longitude}`,
              }
            : null,
        telegramNotified: telegramResult.success && !telegramResult.simulated,
        telegramError: telegramResult.error || (telegramResult.simulated ? 'Mode simulasi (Token belum dikonfigurasi)' : null),
        isSimulated: Boolean(telegramResult.simulated),
        message: telegramResult.success
          ? 'Sinyal bahaya darurat (SOS) telah berhasil disiarkan ke Keamanan Kampus dan Satgas PPKS.'
          : 'Sinyal darurat SOS tercatat di sistem, namun pengiriman ke Telegram mengalami kendala.',
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('[SOS Alert API] Gagal memproses panggilan darurat:', error);
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Terjadi kesalahan sistem saat memproses sinyal darurat.',
      },
      { status: 500 }
    );
  }
}
