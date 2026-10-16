/**
 * Modul Proteksi Bot, Anti-Spam & Rate Limiting untuk Formulir Pelaporan Anonim
 */

const SUBMISSION_COOLDOWN_MS = 60 * 1000; // Cooldown 60 detik antar laporan dari perangkat yang sama
const MAX_ATTEMPTS_PER_HOUR = 5;

export interface AntiSpamCheckResult {
  allowed: boolean;
  message?: string;
  cooldownSeconds?: number;
}

/**
 * Memeriksa Rate-Limiting berbasis LocalStorage untuk mencegah spam otomatis dari bot/script
 */
export function checkSubmissionRateLimit(): AntiSpamCheckResult {
  if (typeof window === 'undefined') return { allowed: true };

  const lastSubmitTimeStr = localStorage.getItem('ak_last_submission_time');
  const attemptsStr = localStorage.getItem('ak_submission_attempts');

  const now = Date.now();

  if (lastSubmitTimeStr) {
    const lastSubmitTime = parseInt(lastSubmitTimeStr, 10);
    const timePassed = now - lastSubmitTime;

    if (timePassed < SUBMISSION_COOLDOWN_MS) {
      const remainingSeconds = Math.ceil((SUBMISSION_COOLDOWN_MS - timePassed) / 1000);
      return {
        allowed: false,
        message: `Terlalu banyak percobaaan. Harap tunggu ${remainingSeconds} detik sebelum mengirimkan laporan baru untuk mencegah spam.`,
        cooldownSeconds: remainingSeconds,
      };
    }
  }

  let attempts: { timestamp: number }[] = [];
  if (attemptsStr) {
    try {
      attempts = JSON.parse(attemptsStr);
      // Filter percobaan dalam 1 jam terakhir
      attempts = attempts.filter((a) => now - a.timestamp < 3600 * 1000);
    } catch {
      attempts = [];
    }
  }

  if (attempts.length >= MAX_ATTEMPTS_PER_HOUR) {
    return {
      allowed: false,
      message: 'Batas maksimum laporan (5 laporan/jam) dari perangkat ini tercapai. Harap tunggu beberapa saat.',
    };
  }

  return { allowed: true };
}

/**
 * Menolak kronologi yang terlalu pendek / generik agar formulir tidak dipakai saling menjatuhkan tanpa substansi.
 */
export function assessChronologyQuality(chronology: string): AntiSpamCheckResult {
  const cleaned = chronology.replace(/\s+/g, ' ').trim();
  const words = cleaned.split(' ').filter(Boolean);

  if (cleaned.length < 20) {
    return {
      allowed: false,
      message: 'Kronologi terlalu singkat. Jelaskan kejadian secara konkret (minimal 20 karakter) agar laporan tidak disalahgunakan untuk tuduhan kosong.',
    };
  }

  if (words.length < 4) {
    return {
      allowed: false,
      message: 'Kronologi perlu lebih rinci (minimal 4 kata) mencakup apa yang terjadi, kapan, dan mengapa ini pelanggaran — bukan sekadar tuduhan nama.',
    };
  }

  if (/(.)\1{10,}/.test(cleaned)) {
    return {
      allowed: false,
      message: 'Teks kronologi terdeteksi tidak wajar. Harap tulis uraian kejadian yang sesungguhnya.',
    };
  }

  return { allowed: true };
}

const EVIDENCE_HASH_KEY = 'ak_evidence_hashes';

type EvidenceHashRecord = { sha256: string; caseId: string; timestamp: number };

function readEvidenceHashes(): EvidenceHashRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(EVIDENCE_HASH_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Mencegah daur ulang berkas bukti yang sama di banyak laporan (saling lapor dengan file identik).
 */
export function findDuplicateEvidenceHash(sha256: string): { duplicate: boolean; caseId?: string } {
  const hit = readEvidenceHashes().find((row) => row.sha256 === sha256);
  return hit ? { duplicate: true, caseId: hit.caseId } : { duplicate: false };
}

export function recordEvidenceHashes(caseId: string, hashes: string[]): void {
  if (typeof window === 'undefined') return;
  const now = Date.now();
  const existing = readEvidenceHashes().filter((row) => now - row.timestamp < 30 * 24 * 3600 * 1000);
  for (const sha256 of hashes) {
    if (!sha256) continue;
    existing.push({ sha256, caseId, timestamp: now });
  }
  localStorage.setItem(EVIDENCE_HASH_KEY, JSON.stringify(existing));
}

/**
 * Mencatat pengiriman laporan baru untuk memperbarui rate-limit
 */
export function recordSubmission(): void {
  if (typeof window === 'undefined') return;

  const now = Date.now();
  localStorage.setItem('ak_last_submission_time', now.toString());

  const attemptsStr = localStorage.getItem('ak_submission_attempts');
  let attempts: { timestamp: number }[] = [];
  if (attemptsStr) {
    try {
      attempts = JSON.parse(attemptsStr);
      attempts = attempts.filter((a) => now - a.timestamp < 3600 * 1000);
    } catch {
      attempts = [];
    }
  }
  attempts.push({ timestamp: now });
  localStorage.setItem('ak_submission_attempts', JSON.stringify(attempts));
}

/**
 * Tantangan Matematika / Nonce Sederhana untuk Verifikasi Manusia (Anti-Bot Challenge)
 */
export function generateHumanChallenge(): { problem: string; answer: number } {
  const num1 = Math.floor(Math.random() * 8) + 2;
  const num2 = Math.floor(Math.random() * 8) + 1;
  return {
    problem: `Berapa ${num1} + ${num2}?`,
    answer: num1 + num2,
  };
}
