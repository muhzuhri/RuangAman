/**
 * Telegram Bot Emergency Service
 * 
 * Mengirim notifikasi darurat real-time ke grup Telegram Tim Keamanan / Satgas PPKS
 * menggunakan Telegram Bot API.
 */

export interface TelegramConfig {
  botToken: string;
  chatId: string;
  isConfigured: boolean;
}

export interface TelegramSendResult {
  success: boolean;
  messageId?: number;
  simulated?: boolean;
  error?: string;
  reason?: string;
}

export interface SOSAlertPayload {
  alertId?: string;
  latitude?: number | null;
  longitude?: number | null;
  accuracy?: number | null;
  locationStatus: 'granted' | 'denied' | 'unavailable' | 'timeout' | 'not_supported' | string;
  timestamp?: string;
  userAgent?: string;
  clientNote?: string;
}

export interface HighRiskReportPayload {
  token: string;
  caseId?: string;
  category?: string;
  riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | string;
  urgencyScore?: number;
  summary: string;
  legalPasalBasis?: string;
  receivedAt?: string;
}

export interface FullReportPayload {
  token: string;
  caseId?: string;
  category: string;
  incidentTime?: string;
  involvedParties?: string;
  targetFaculty?: string;
  chronology: string;
  evidencesCount?: number;
  aiTriage?: {
    riskLevel?: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | string;
    urgencyScore?: number;
    summary?: string;
    legalPasalBasis?: string;
    categoryRecommendation?: string;
  };
  receivedAt?: string;
}

/**
 * Membaca konfigurasi Telegram dari environment variables
 */
export function getTelegramConfig(): TelegramConfig {
  const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim() || '';
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim() || '';

  const isConfigured =
    Boolean(botToken) &&
    Boolean(chatId) &&
    !botToken.includes('your-bot-token') &&
    !chatId.includes('your-chat-id');

  return { botToken, chatId, isConfigured };
}

/**
 * Escape teks untuk format Telegram HTML mode
 */
export function escapeTelegramHtml(text: string): string {
  if (!text) return '';
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Format timestamp ke format lokal Indonesia (WIB)
 */
export function formatToIndonesianTime(isoString?: string): string {
  try {
    const date = isoString ? new Date(isoString) : new Date();
    return new Intl.DateTimeFormat('id-ID', {
      dateStyle: 'full',
      timeStyle: 'medium',
      timeZone: 'Asia/Jakarta',
    }).format(date) + ' WIB';
  } catch {
    return new Date().toLocaleString('id-ID') + ' WIB';
  }
}

/**
 * Ubah pesan error mentah Telegram API menjadi penjelasan bahasa Indonesia yang jelas dan solutif
 */
export function formatTelegramError(rawError: string): string {
  if (!rawError) return 'Terjadi kendala saat menghubungi server Telegram.';

  if (rawError.includes('timeout') || rawError.includes('aborted') || rawError.includes('Timeout')) {
    return 'Koneksi ke server Telegram timeout (>25 detik). Akses internet lambat atau jaringan ISP membatasi akses ke api.telegram.org.';
  }
  if (rawError.includes('chat not found')) {
    return 'Chat tidak ditemukan di Telegram (chat not found). Pastikan Anda sudah menekan START di bot @ruangaman_alert_bot atau telah mengundang bot ke grup Satgas.';
  }
  if (rawError.includes('bot was blocked')) {
    return 'Bot diblokir oleh akun penerima di Telegram. Buka bot @ruangaman_alert_bot dan unblock bot.';
  }
  if (rawError.includes('not a member') || rawError.includes('bot is not a member')) {
    return 'Bot belum dijadikan anggota di grup Telegram Satgas.';
  }
  if (rawError.includes('Unauthorized') || rawError.includes('401')) {
    return 'Token Bot Telegram tidak valid. Periksa nilai TELEGRAM_BOT_TOKEN di .env.local.';
  }
  return rawError;
}

/**
 * Mengirim pesan teks terformat ke Telegram Chat / Group Satgas
 */
export async function sendTelegramMessage(
  htmlText: string,
  options: { disableWebPagePreview?: boolean } = {}
): Promise<TelegramSendResult> {
  const { botToken, chatId, isConfigured } = getTelegramConfig();

  if (!isConfigured) {
    console.warn(
      '[Telegram Service] TELEGRAM_BOT_TOKEN atau TELEGRAM_CHAT_ID belum dikonfigurasi di .env.local. Notifikasi disimulasikan di konsol server:\n',
      htmlText.replace(/<[^>]+>/g, '')
    );
    return {
      success: true,
      simulated: true,
      reason: 'Environment variables TELEGRAM_BOT_TOKEN / TELEGRAM_CHAT_ID tidak diisi.',
    };
  }

  const endpoint = `https://api.telegram.org/bot${botToken}/sendMessage`;

  // Bangun daftar kandidat Chat ID (misal user lupa awalan -100 untuk supergroup)
  const candidateChatIds: string[] = [chatId];
  if (chatId.startsWith('-') && !chatId.startsWith('-100')) {
    // misal -5475355521 -> dicoba juga varian supergroup -1005475355521
    candidateChatIds.push(`-100${chatId.slice(1)}`);
  } else if (!chatId.startsWith('-') && /^\d+$/.test(chatId)) {
    // misal 5475355521 -> dicoba juga varian supergroup -1005475355521
    candidateChatIds.push(`-100${chatId}`);
  }

  let lastError = '';

  for (const targetId of candidateChatIds) {
    // Coba kirim dengan timeout 25 detik dan toleransi 1x retry
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: targetId,
            text: htmlText,
            parse_mode: 'HTML',
            disable_web_page_preview: options.disableWebPagePreview ?? false,
          }),
          // Timeout 25s untuk toleransi latency ISP Indonesia saat akses Telegram
          signal: AbortSignal.timeout(25000),
        });

        const data = await response.json();

        if (response.ok && data.ok) {
          return {
            success: true,
            messageId: data.result?.message_id,
            simulated: false,
          };
        }

        lastError = data?.description || `HTTP ${response.status}: Gagal mengirim pesan Telegram`;

        // Jika error bukan karena chat not found, hentikan iterasi retry
        if (!lastError.includes('chat not found')) {
          break;
        }
      } catch (err: any) {
        lastError = err?.message || 'Gagal menghubungi Telegram Bot API (Network Timeout / Error)';
        if (attempt === 1) {
          console.warn(`[Telegram Service] Percobaan 1 ke ${targetId} terkendala (${lastError}), mencoba ulang...`);
        }
      }
    }
  }

  const formattedMsg = formatTelegramError(lastError);
  console.error('[Telegram Service] Gagal mengirim pesan ke Telegram:', formattedMsg);

  return {
    success: false,
    error: formattedMsg,
  };
}

/**
 * Pemicu 1: Kirim Notifikasi Darurat SOS (Emergency Panic Button & Geolocation)
 */
export async function sendTelegramSOSAlert(payload: SOSAlertPayload): Promise<TelegramSendResult> {
  const alertId = payload.alertId || `SOS-${Date.now().toString(36).toUpperCase()}`;
  const waktuFormatted = formatToIndonesianTime(payload.timestamp);

  const hasCoords =
    typeof payload.latitude === 'number' &&
    typeof payload.longitude === 'number' &&
    !isNaN(payload.latitude) &&
    !isNaN(payload.longitude);

  let locationText = '';

  if (hasCoords) {
    const lat = payload.latitude!;
    const lng = payload.longitude!;
    const mapUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    const isCoarse = payload.accuracy && payload.accuracy > 150;
    const accuracyStr = payload.accuracy
      ? ` (Estimasi: ±${Math.round(payload.accuracy)}m${isCoarse ? ' - Wi-Fi/Laptop' : ' - GPS Satelit Presisi'})`
      : '';

    locationText = [
      `📍 <b>Titik Koordinat:</b>`,
      `• Lat / Lng: <code>${lat}, ${lng}</code>${accuracyStr}`,
      `• <b>Pin Google Maps:</b> <a href="${mapUrl}">Buka Titik Peta Google Maps</a>`,
      isCoarse
        ? `<i>⚠️ Perangkat pelapor mengakses via Laptop/Wi-Fi ISP (radius ±500m). Utamakan patokan gedung pelapor jika tercantum di bawah.</i>`
        : `<i>✅ Titik dideteksi dari sensor GPS presisi smartphone.</i>`,
    ].filter(Boolean).join('\n');
  } else {
    let reason = 'Lokasi tidak diizinkan oleh perangkat pelapor';
    if (payload.locationStatus === 'denied') reason = 'Izin akses lokasi ditolak oleh pelapor';
    if (payload.locationStatus === 'timeout') reason = 'Waktu pencarian GPS habis (timeout)';
    if (payload.locationStatus === 'unavailable') reason = 'Sinyal GPS tidak tersedia pada perangkat';

    locationText = [
      `📍 <b>Informasi Lokasi Geolocation:</b>`,
      `⚠️ <b>${escapeTelegramHtml(reason)}</b>`,
      `<i>Perangkat pelapor tidak dapat memberikan titik koordinat otomatis. Harap segera lakukan penelusuran sektor darurat atau pantau rekaman CCTV kampus.</i>`,
    ].join('\n');
  }

  const clientNoteSection = payload.clientNote?.trim()
    ? `\n🏢 <b>LOKASI SPESIFIK / PATOKAN DARI PELAPOR:</b>\n👉 <b>"${escapeTelegramHtml(payload.clientNote.trim())}"</b>\n`
    : '';

  const message = [
    `🚨 <b>WARNING: PANGGILAN DARURAT SOS (PANIC BUTTON)</b> 🚨`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `<b>ID Peringatan:</b> <code>${alertId}</code>`,
    `<b>Waktu Kejadian:</b> ${waktuFormatted}`,
    `<b>Kategori:</b> 🔴 KRISIS DARURAT KEAMANAN KAMPUS`,
    clientNoteSection,
    locationText,
    ``,
    `🚨 <b>INSTRUKSI TINDAKAN PETUGAS KEAMANAN & SATGAS:</b>`,
    `1. Segera instruksikan petugas patroli keamanan terdekat menuju ke titik lokasi.`,
    `2. Hubungi posko keamanan kampus sektor terkait untuk bersiaga penuh.`,
    `3. Utamakan perlindungan keselamatan pelapor dan sterilisasi area.`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `🛡️ <i>RuangAman Real-Time Crisis Dispatcher</i>`,
  ].filter(Boolean).join('\n');

  return sendTelegramMessage(message, { disableWebPagePreview: false });
}

/**
 * Pemicu 2: Kirim Notifikasi Laporan Risiko Tinggi / Kritis dari AI Triage
 */
export async function sendTelegramHighRiskReportNotification(
  payload: HighRiskReportPayload
): Promise<TelegramSendResult> {
  const waktuFormatted = formatToIndonesianTime(payload.receivedAt);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const adminUrl = `${baseUrl.replace(/\/$/, '')}/admin`;

  const isCritical = payload.riskLevel === 'CRITICAL';
  const badgeIcon = isCritical ? '🚨' : '⚠️';
  const riskTitle = isCritical ? 'RISIKO KRITIS (CRITICAL)' : 'RISIKO TINGGI (HIGH)';

  const urgencyText =
    typeof payload.urgencyScore === 'number'
      ? `Skor Urgensi: <b>${payload.urgencyScore}/100</b>`
      : 'Urgensi Prioritas';

  const categoryText = escapeTelegramHtml(payload.category || 'Kekerasan / Pelecehan Seksual');
  const summaryText = escapeTelegramHtml(payload.summary || 'Membutuhkan tindakan cepat.');
  const legalText = escapeTelegramHtml(
    payload.legalPasalBasis || 'Permendikbudristek No. 30 Tahun 2021 & UU TPKS No. 12 Tahun 2022'
  );

  const message = [
    `${badgeIcon} <b>LAPORAN ${riskTitle} MASUK</b>`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `<b>Token Kasus Anonim:</b> <code>${escapeTelegramHtml(payload.token)}</code>`,
    `<b>Tingkat Risiko:</b> <b>${escapeTelegramHtml(payload.riskLevel)}</b> (${urgencyText})`,
    `<b>Kategori:</b> ${categoryText}`,
    `<b>Waktu Diterima:</b> ${waktuFormatted}`,
    ``,
    `📝 <b>Ringkasan Kasus (AI Triage Analysis):</b>`,
    `<i>"${summaryText}"</i>`,
    ``,
    `⚖️ <b>Rujukan Regulasi / Dasar Hukum:</b>`,
    `<code>${legalText}</code>`,
    ``,
    `🔗 <b>Akses Dasbor Admin:</b>`,
    `<a href="${adminUrl}">Klik Disini untuk Meninjau Kasus di Dasbor Satgas</a>`,
    `URL: ${adminUrl}`,
    ``,
    `📌 <i>Instruksi: Segera buka Dasbor Admin untuk memverifikasi berkas bukti terenkripsi dan memulai prosedur pendampingan korban.</i>`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `🛡️ <i>RuangAman AI Triage System</i>`,
  ].join('\n');

  return sendTelegramMessage(message, { disableWebPagePreview: true });
}

/**
 * Pemicu: Kirim Notifikasi Lengkap Setiap Laporan Kasus Baru Masuk ke Telegram Satgas
 */
export async function sendTelegramFullReportNotification(
  payload: FullReportPayload
): Promise<TelegramSendResult> {
  const waktuFormatted = formatToIndonesianTime(payload.receivedAt);
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const adminUrl = `${baseUrl.replace(/\/$/, '')}/admin`;

  const riskLevel = payload.aiTriage?.riskLevel || 'UNASSESSED';
  let badgeIcon = '📋';
  let riskBadge = '🟢 RENDAH';

  if (riskLevel === 'CRITICAL') {
    badgeIcon = '🚨';
    riskBadge = '🔴 KRITIS (CRITICAL)';
  } else if (riskLevel === 'HIGH') {
    badgeIcon = '⚠️';
    riskBadge = '🟠 TINGGI (HIGH)';
  } else if (riskLevel === 'MEDIUM') {
    badgeIcon = '🟡';
    riskBadge = '🟡 MENENGAH (MEDIUM)';
  } else if (riskLevel === 'LOW') {
    badgeIcon = 'ℹ️';
    riskBadge = '🟢 RENDAH (LOW)';
  }

  const urgencyText =
    typeof payload.aiTriage?.urgencyScore === 'number'
      ? `Skor Urgensi AI: <b>${payload.aiTriage.urgencyScore}/100</b>`
      : 'Urgensi Terverifikasi';

  const categoryText = escapeTelegramHtml(payload.category || 'Laporan Pengaduan');
  const incidentTimeText = escapeTelegramHtml(payload.incidentTime || 'Tidak disebutkan');
  const targetFacultyText = escapeTelegramHtml(payload.targetFaculty || 'Lingkungan Kampus');
  const involvedPartiesText = escapeTelegramHtml(payload.involvedParties || 'Tidak disebutkan (Anonim)');

  // Format kronologi lengkap (maksimal 2000 karakter agar tidak melebihi batas Telegram)
  const fullChronology = payload.chronology?.trim() || 'Tidak ada uraian kronologi.';
  const displayedChronology =
    fullChronology.length > 2000
      ? fullChronology.substring(0, 2000) + '... (selengkapnya di Dasbor Admin)'
      : fullChronology;

  const count = payload.evidencesCount ?? 0;
  const evidencesText =
    count > 0
      ? `📎 <b>${count} Berkas Bukti Terlampir</b> (Tervalidasi SHA-256 & EXIF Stripped)`
      : '📎 <i>Tidak ada berkas bukti lampiran.</i>';

  const aiSection = payload.aiTriage
    ? [
        ``,
        `🤖 <b>Analisis AI Smart Triage:</b>`,
        `• Tingkat Risiko: <b>${riskBadge}</b> (${urgencyText})`,
        payload.aiTriage.summary ? `• Ringkasan Kasus: <i>"${escapeTelegramHtml(payload.aiTriage.summary)}"</i>` : '',
        payload.aiTriage.legalPasalBasis
          ? `• Rujukan Dasar Regulasi: <code>${escapeTelegramHtml(payload.aiTriage.legalPasalBasis)}</code>`
          : '',
      ]
        .filter(Boolean)
        .join('\n')
    : '';

  const message = [
    `${badgeIcon} <b>PEMBERITAHUAN LAPORAN KASUS BARU MASUK</b> ${badgeIcon}`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `<b>Token Kasus Anonim:</b> <code>${escapeTelegramHtml(payload.token)}</code>`,
    payload.caseId ? `<b>ID Berkas Kasus:</b> <code>${escapeTelegramHtml(payload.caseId)}</code>` : '',
    `<b>Waktu Diterima:</b> ${waktuFormatted}`,
    `<b>Kategori Kasus:</b> <b>${categoryText}</b>`,
    `<b>Waktu Kejadian:</b> ${incidentTimeText}`,
    `<b>Fakultas / Lokasi Terkait:</b> ${targetFacultyText}`,
    `<b>Pihak Terkait / Terlapor:</b> ${involvedPartiesText}`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `📝 <b>KRONOLOGI LENGKAP KEJADIAN:</b>`,
    `<i>"${escapeTelegramHtml(displayedChronology)}"</i>`,
    ``,
    `📁 <b>Status Lampiran Bukti:</b>`,
    evidencesText,
    aiSection,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `🔗 <b>Akses Dasbor Admin Satgas PPKS:</b>`,
    `URL: ruang-aman-ten.vercel.app/admin`,
    `━━━━━━━━━━━━━━━━━━━━━━━━━━`,
    `🛡️ <i>RuangAman Crisis Dispatcher System</i>`,
  ]
    .filter(Boolean)
    .join('\n');

  return sendTelegramMessage(message, { disableWebPagePreview: true });
}

export interface TelegramDiagnosis {
  isConfigured: boolean;
  botTokenProvided: boolean;
  chatIdConfigured: string;
  botValid: boolean;
  botDetails?: {
    id: number;
    username: string;
    firstName: string;
  };
  detectedChats: Array<{
    id: number | string;
    title: string;
    type: string;
    username?: string;
  }>;
  canSendToConfiguredChat: boolean;
  sendError?: string;
  status: 'ready' | 'needs_start' | 'invalid_token' | 'not_configured' | 'network_error';
  recommendations: string[];
}

/**
 * Mendiagnosis status bot Telegram dan mencari interaksi user/grup secara otomatis
 */
export async function diagnoseTelegramIntegration(): Promise<TelegramDiagnosis> {
  const { botToken, chatId, isConfigured } = getTelegramConfig();

  const diagnosis: TelegramDiagnosis = {
    isConfigured,
    botTokenProvided: Boolean(botToken),
    chatIdConfigured: chatId,
    botValid: false,
    detectedChats: [],
    canSendToConfiguredChat: false,
    status: 'not_configured',
    recommendations: [],
  };

  if (!botToken) {
    diagnosis.status = 'not_configured';
    diagnosis.recommendations.push(
      'Isi TELEGRAM_BOT_TOKEN di file .env.local dengan token dari @BotFather di Telegram.'
    );
    return diagnosis;
  }

  // 1. Cek getMe
  try {
    const meRes = await fetch(`https://api.telegram.org/bot${botToken}/getMe`, {
      signal: AbortSignal.timeout(20000),
    });
    const meData = await meRes.json();
    if (meData.ok && meData.result) {
      diagnosis.botValid = true;
      diagnosis.botDetails = {
        id: meData.result.id,
        username: meData.result.username,
        firstName: meData.result.first_name,
      };
    } else {
      diagnosis.status = 'invalid_token';
      diagnosis.recommendations.push(
        `Token bot tidak valid: ${meData.description || 'Periksa kembali TELEGRAM_BOT_TOKEN'}`
      );
      return diagnosis;
    }
  } catch (err: any) {
    diagnosis.status = 'network_error';
    diagnosis.recommendations.push(
      `Gagal menghubungi Telegram API: ${formatTelegramError(err?.message || '')}`
    );
    return diagnosis;
  }

  // 2. Cek getUpdates untuk mendeteksi chat ID otomatis
  try {
    const updatesRes = await fetch(`https://api.telegram.org/bot${botToken}/getUpdates`, {
      signal: AbortSignal.timeout(20000),
    });
    const updatesData = await updatesRes.json();
    if (updatesData.ok && Array.isArray(updatesData.result)) {
      const seen = new Set<string>();
      for (const item of updatesData.result) {
        const msg = item.message || item.channel_post || item.my_chat_member;
        if (msg && msg.chat) {
          const c = msg.chat;
          const key = c.id.toString();
          if (!seen.has(key)) {
            seen.add(key);
            diagnosis.detectedChats.push({
              id: c.id,
              title: c.title || `${c.first_name || ''} ${c.last_name || ''}`.trim() || c.username || 'Tanpa Nama',
              type: c.type,
              username: c.username,
            });
          }
        }
      }
    }
  } catch (err) {
    console.warn('[Telegram Diagnosis] getUpdates warning:', err);
  }

  // 3. Tes kirim pesan jika chatId diisi
  if (chatId) {
    const testResult = await sendTelegramMessage(
      '🔔 <b>Tes Diagnostik RuangAman</b>: Integrasi Notifikasi Satgas Telegram Aktif!',
      { disableWebPagePreview: true }
    );
    diagnosis.canSendToConfiguredChat = testResult.success;
    if (testResult.success) {
      diagnosis.status = 'ready';
    } else {
      diagnosis.sendError = testResult.error;
      diagnosis.status = 'needs_start';
    }
  } else {
    diagnosis.status = 'needs_start';
  }

  // Rekomendasi berdasarkan kondisi
  if (diagnosis.status === 'ready') {
    diagnosis.recommendations.push(
      '✅ Bot Telegram siap digunakan! Pesan darurat SOS dan laporan risiko tinggi akan langsung terkirim.'
    );
  } else if (diagnosis.status === 'needs_start') {
    const botUser = diagnosis.botDetails?.username ? `@${diagnosis.botDetails.username}` : '@ruangaman_alert_bot';
    diagnosis.recommendations.push(
      `Buka Telegram dan cari bot ${botUser}, lalu klik tombol "START" (atau ketik /start).`
    );
    diagnosis.recommendations.push(
      `Atau tambahkan ${botUser} ke grup Telegram Tim Keamanan / Satgas Anda, lalu kirim pesan tes di grup.`
    );
    if (diagnosis.detectedChats.length > 0) {
      diagnosis.recommendations.push(
        `Chat ID yang terdeteksi dari pesan masuk: ${diagnosis.detectedChats.map((c) => `${c.title} (${c.id})`).join(', ')}. Salin ID ini ke TELEGRAM_CHAT_ID di .env.local!`
      );
    }
  }

  return diagnosis;
}

