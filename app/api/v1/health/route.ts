import { NextResponse } from 'next/server';
import { getSupabaseConfig } from '@/lib/reportsService';
import { getTelegramConfig } from '@/lib/telegram';

export async function GET() {
  const supabase = getSupabaseConfig();
  const telegram = getTelegramConfig();
  const geminiConfigured = Boolean(process.env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY.includes('your-gemini'));

  const healthData = {
    status: 'healthy',
    system: 'RuangAman Interconnected Platform',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime ? process.uptime() : 0),
    services: {
      relationalDatabase: {
        provider: 'Supabase PostgreSQL',
        configured: supabase.isConfigured,
        status: supabase.isConfigured ? 'connected' : 'offline_fallback_ready',
      },
      aiEngine: {
        provider: 'Google Gemini 2.0 Multimodal',
        configured: geminiConfigured,
        features: ['Smart Triage', 'Visual & Audio Forensics', 'PFA Ara Chatbot'],
      },
      emergencyDispatch: {
        provider: 'Telegram Bot API 24/7',
        configured: telegram.isConfigured,
        status: telegram.isConfigured ? 'active' : 'simulated_fallback',
      },
      cryptographicEngine: {
        algorithm: 'Web Crypto HMAC-SHA256 & SHA-256 Checksum',
        status: 'operational',
      },
    },
    interoperability: {
      openApiVersion: '3.0.3',
      openDataEndpoint: '/api/v1/open-data/statistics',
    },
  };

  return NextResponse.json(healthData, {
    status: 200,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
