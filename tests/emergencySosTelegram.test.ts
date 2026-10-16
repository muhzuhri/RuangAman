/**
 * Test Suite: Emergency SOS Geolocation & Telegram Real-Time Notification
 */

import {
  escapeTelegramHtml,
  formatToIndonesianTime,
  sendTelegramSOSAlert,
  sendTelegramHighRiskReportNotification,
  getTelegramConfig,
} from '../lib/telegram';
import { POST as sosAlertHandler } from '../app/api/sos-alert/route';
import { POST as reportNotificationHandler } from '../app/api/report/route';
import { NextRequest } from 'next/server';

export async function runEmergencySosTelegramTests() {
  console.log('🧪 Starting Emergency SOS & Telegram Integration Tests...\n');

  // Test 1: HTML Escaping
  console.log('Test 1: HTML Escaping for Telegram...');
  const dangerousText = '<script>alert("hack")</script> & "quotes" > 100 < 200';
  const escaped = escapeTelegramHtml(dangerousText);
  if (escaped.includes('<script>') || escaped.includes('>') || escaped.includes('& "')) {
    throw new Error(`HTML escaping failed: ${escaped}`);
  }
  console.log('  ✅ HTML Escaped properly:', escaped);

  // Test 2: Indonesian time formatting
  console.log('\nTest 2: Indonesian Locale Time Formatting...');
  const timeFormatted = formatToIndonesianTime('2026-10-16T10:30:00.000Z');
  if (!timeFormatted.includes('WIB') && !timeFormatted.includes('2026')) {
    throw new Error(`Time formatting failed: ${timeFormatted}`);
  }
  console.log('  ✅ Time formatted:', timeFormatted);

  // Test 3: SOS Alert with valid Coordinates (Simulated or Real)
  console.log('\nTest 3: SOS Alert with GPS Coordinates...');
  const sosCoordsResult = await sendTelegramSOSAlert({
    alertId: 'SOS-TEST-001',
    latitude: -6.2088,
    longitude: 106.8456,
    accuracy: 12,
    locationStatus: 'granted',
    timestamp: new Date().toISOString(),
  });
  if (!sosCoordsResult.success) {
    throw new Error(`SOS with coordinates failed: ${sosCoordsResult.error}`);
  }
  console.log('  ✅ SOS with GPS coordinates processed successfully (simulated/real).');

  // Test 4: SOS Alert with Denied Geolocation (Graceful Fallback)
  console.log('\nTest 4: SOS Alert with Location Denied / Unavailable (Graceful Fallback)...');
  const sosDeniedResult = await sendTelegramSOSAlert({
    alertId: 'SOS-TEST-DENIED',
    latitude: null,
    longitude: null,
    locationStatus: 'denied',
    timestamp: new Date().toISOString(),
  });
  if (!sosDeniedResult.success) {
    throw new Error(`SOS with denied location failed: ${sosDeniedResult.error}`);
  }
  console.log('  ✅ SOS with location denied handled gracefully without throwing.');

  // Test 5: High Risk Report Telegram Notification (CRITICAL)
  console.log('\nTest 5: AI Triage High Risk (CRITICAL) Telegram Notification...');
  const highRiskResult = await sendTelegramHighRiskReportNotification({
    token: 'AK-2026-TEST99',
    caseId: 'CASE-2026-99999',
    category: 'Kekerasan Seksual & Pelecehan',
    riskLevel: 'CRITICAL',
    urgencyScore: 95,
    summary: 'Korban mengalami ancaman fisik dan pemaksaan berulang di area asrama kampus.',
    legalPasalBasis: 'Pasal 6 UU TPKS No. 12 Tahun 2022',
    receivedAt: new Date().toISOString(),
  });
  if (!highRiskResult.success) {
    throw new Error(`High risk report notification failed: ${highRiskResult.error}`);
  }
  console.log('  ✅ High risk CRITICAL report notification processed successfully.');

  // Test 6: API Route /api/sos-alert Handler
  console.log('\nTest 6: POST /api/sos-alert API Route Handler...');
  const mockSosReq = new NextRequest('http://localhost:3000/api/sos-alert', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      latitude: -6.3621,
      longitude: 106.8249,
      accuracy: 8,
      locationStatus: 'granted',
    }),
  });
  const sosRes = await sosAlertHandler(mockSosReq);
  const sosJson = await sosRes.json();
  if (sosRes.status !== 200 || !sosJson.success || !sosJson.alertId) {
    throw new Error(`SOS API handler returned unexpected response: ${JSON.stringify(sosJson)}`);
  }
  console.log('  ✅ /api/sos-alert responded 200 with alertId:', sosJson.alertId);

  // Test 7: API Route /api/report Handler with CRITICAL risk
  console.log('\nTest 7: POST /api/report API Route with AI Triage CRITICAL...');
  const mockReportReq = new NextRequest('http://localhost:3000/api/report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token: 'AK-2026-CRIT01',
      caseId: 'CASE-2026-00002',
      category: 'Pelecehan Seksual Berat',
      aiTriage: {
        riskLevel: 'CRITICAL',
        urgencyScore: 92,
        categoryRecommendation: 'Kekerasan Seksual',
        legalPasalBasis: 'UU TPKS No. 12 Tahun 2022',
        summary: 'Indikasi kekerasan seksual darurat di gedung fakultas.',
      },
    }),
  });
  const reportRes = await reportNotificationHandler(mockReportReq);
  const reportJson = await reportRes.json();
  if (reportRes.status !== 200 || !reportJson.success || !reportJson.telegramNotified) {
    throw new Error(`Report API handler failed for CRITICAL: ${JSON.stringify(reportJson)}`);
  }
  console.log('  ✅ /api/report notified Telegram successfully for CRITICAL case.');

  // Test 8: API Route /api/report Handler with LOW risk (should not spam telegram emergency)
  console.log('\nTest 8: POST /api/report API Route with AI Triage LOW (no telegram emergency spam)...');
  const mockLowRiskReq = new NextRequest('http://localhost:3000/api/report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token: 'AK-2026-LOW01',
      caseId: 'CASE-2026-00003',
      category: 'Konflik Ringan',
      aiTriage: {
        riskLevel: 'LOW',
        urgencyScore: 15,
        categoryRecommendation: 'Ketidaknyamanan Sosial',
        legalPasalBasis: 'Permendikbudristek No. 30 Tahun 2021',
        summary: 'Konflik komunikasi interpersonal ringan.',
      },
    }),
  });
  const lowReportRes = await reportNotificationHandler(mockLowRiskReq);
  const lowReportJson = await lowReportRes.json();
  if (lowReportRes.status !== 200 || !lowReportJson.success || lowReportJson.telegramNotified !== false) {
    throw new Error(`Report API should not trigger emergency Telegram for LOW risk: ${JSON.stringify(lowReportJson)}`);
  }
  console.log('  ✅ /api/report properly bypassed emergency Telegram for LOW risk case.');

  console.log('\n🎉 ALL 8 EMERGENCY SOS & TELEGRAM TESTS PASSED PERFECTLY!\n');
}

// Execute tests
runEmergencySosTelegramTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
