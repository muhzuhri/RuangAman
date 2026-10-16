import { NextResponse } from 'next/server';
import { diagnoseTelegramIntegration } from '@/lib/telegram';

export async function GET() {
  try {
    const diagnosis = await diagnoseTelegramIntegration();
    return NextResponse.json(diagnosis, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error?.message || 'Gagal menjalankan diagnosa Telegram.',
      },
      { status: 500 }
    );
  }
}
