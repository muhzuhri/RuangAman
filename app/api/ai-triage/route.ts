import { NextRequest, NextResponse } from 'next/server';

// ─── Types ─────────────────────────────────────────────────────────────────────

export type TriageRiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface TriageResult {
  riskLevel: TriageRiskLevel;
  urgencyScore: number;
  categoryRecommendation: string;
  legalPasalBasis: string;
  summary: string;
}

interface TriageEvidenceSummary {
  fileName?: string;
  forensicStatus?: string;
  aiAnalysis?: {
    authenticityScore?: number;
    tamperingDetected?: boolean;
    forensicNotes?: string;
  };
}

interface TriageRequestBody {
  kronologi: string;
  evidences?: TriageEvidenceSummary[];
}

// ─── System Prompt ─────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `Anda adalah sistem AI Smart Triage untuk platform pelaporan Satgas PPKS (Pencegahan dan Penanganan Kekerasan Seksual & Perundungan) di lingkungan perguruan tinggi Indonesia (RuangAman).
Tugas Anda adalah membaca teks kronologi laporan secara OBYEKTIF, KETAT, dan MENDALAM, serta memberikan penilaian risiko nyata yang akurat.

ATURAN KRITIS PENILAIAN KONTEKS:
1. EVALUASI KONTEKS NYATA (Context Awareness):
   - Jangan terjebak oleh kata-kata lepas. Periksa substansi narasi pelapor.
   - JIKA teks kronologi HANYA berisi tugas akademik (kuliah/makalah/tugas praktikum/coding), teks umum, pengujian sistem/asal ketik, atau tidak memuat unsur kekerasan/pelecehan sama sekali, Anda WAJIB mengklasifikasikannya sebagai:
     * Tingkat Risiko: "LOW" (Skor Urgensi: 10-25) atau "MEDIUM" (Skor Urgensi: 30-45).
     * Rekomendasi Kategori: "Laporan Non-Kasus / Tinjauan Akademik" atau "Informasi Umum / Non-Darurat".
     * JANGAN PERNAH menetapkan status "CRITICAL" untuk teks yang tidak berhubungan dengan kekerasan!
   - HANYA tetapkan status "CRITICAL" (Skor Urgensi: 85-100) JIKA DAN HANYA JIKA terdapat:
     * Ancaman fisik nyata terhadap keselamatan jiwa.
     * Pemaksaan seksual berat, pemerkosaan, atau serangan fisik langsung.
     * Situasi darurat yang membutuhkan intervensi aparat penegak hukum / Satgas seketika.
   - Tetapkan status "HIGH" (Skor Urgensi: 60-80) untuk:
     * Perundungan berat berkelanjutan, pemerasan, stalking intensif, atau pelecehan seksual non-fisik/daring (KSBE).
   - Tetapkan status "MEDIUM" (Skor Urgensi: 35-55) untuk:
     * Konflik relasi kuasa, diskriminasi akademik, atau pelanggaran etika yang membutuhkan mediasi formal.
   - Tetapkan status "LOW" (Skor Urgensi: 10-30) untuk:
     * Teks umum/akademik/tugas, ketidaknyamanan minor, atau sengketa personal ringan.

2. PENALTI BUKTI MANIPULASI / REKAYASA AI:
   - Jika informasi berkas bukti terlampir terindikasi "Manipulated" atau "Terindikasi AI / Re-generated / Manipulated", lakukan PENURUNAN SKOR URGENSI secara otomatis (kurangi 30-45 poin) karena keabsahan bukti diragukan/diduga manipulatif.

PENTING: Respons HARUS berupa JSON murni:
{
  "riskLevel": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
  "urgencyScore": <angka 1-100>,
  "categoryRecommendation": "<string kategori>",
  "legalPasalBasis": "<string rujukan undang-undang/pasal>",
  "summary": "<string ringkasan objektif 1-2 kalimat>"
}`;

// ─── Gemini API Call ───────────────────────────────────────────────────────────

async function callGeminiAPI(kronologi: string, evidences?: TriageEvidenceSummary[]): Promise<TriageResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY tidak dikonfigurasi di environment variables.');
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  let evidenceContext = '';
  if (evidences && evidences.length > 0) {
    const hasManipulated = evidences.some(
      (e) => e.forensicStatus === 'Manipulated' || e.aiAnalysis?.tamperingDetected
    );
    evidenceContext = `\n\nInformasi Berkas Bukti Terlampir:\n- Jumlah Berkas: ${evidences.length}\n- Indikasi Rekayasa/AI: ${hasManipulated ? 'YA (Ditemukan berkas terindikasi manipulasi / AI generated)' : 'TIDAK (Berkas tampak wajar)'}`;
  }

  const requestBody = {
    systemInstruction: {
      parts: [{ text: SYSTEM_PROMPT }],
    },
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: `Analisis narasi kronologi berikut dan berikan penilaian risiko objektif dalam format JSON:\n\n"${kronologi}"${evidenceContext}`,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.1,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 512,
      responseMimeType: 'application/json',
    },
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
    signal: AbortSignal.timeout(15000), // 15s timeout
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const rawText: string =
    data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

  const parsed: TriageResult = JSON.parse(rawText);

  if (
    !parsed.riskLevel ||
    typeof parsed.urgencyScore !== 'number' ||
    !parsed.categoryRecommendation ||
    !parsed.legalPasalBasis ||
    !parsed.summary
  ) {
    throw new Error('Respons AI tidak memenuhi format yang diharapkan.');
  }

  const validLevels: TriageRiskLevel[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
  if (!validLevels.includes(parsed.riskLevel)) {
    throw new Error(`riskLevel tidak valid: ${parsed.riskLevel}`);
  }

  // Integrasi penalti otomatis jika bukti terdeteksi manipulasi
  const hasTamperedEvidence = evidences?.some(
    (e) => e.forensicStatus === 'Manipulated' || e.aiAnalysis?.tamperingDetected
  );
  if (hasTamperedEvidence) {
    parsed.urgencyScore = Math.max(15, parsed.urgencyScore - 35);
    if (parsed.riskLevel === 'CRITICAL') parsed.riskLevel = 'MEDIUM';
    else if (parsed.riskLevel === 'HIGH') parsed.riskLevel = 'LOW';
    parsed.summary += ' (Catatan: Skor urgensi diturunkan otomatis karena bukti forensik terindikasi manipulasi/AI).';
  }

  parsed.urgencyScore = Math.min(100, Math.max(1, Math.round(parsed.urgencyScore)));

  return parsed;
}

// ─── Fallback Heuristic (Obyektif & Kontekstual) ───────────────────────────────

function heuristicTriage(kronologi: string, evidences?: TriageEvidenceSummary[]): TriageResult {
  const text = kronologi.toLowerCase();

  // 1. Cek apakah teks kronologi adalah materi akademik / tugas kuliah / non-kasus
  const academicKeywords = [
    'tugas', 'makalah', 'kuliah', 'praktikum', 'coding', 'algoritma',
    'soal', 'ujian', 'uts', 'uas', 'skripsi', 'modul', 'latihan',
    'html', 'javascript', 'python', 'antigravity', 'react', 'program',
    'referensi', 'jurnal', 'materi', 'bab 1', 'bab 2', 'pendahuluan'
  ];
  const isAcademicOrTest = academicKeywords.some((k) => text.includes(k));

  // 2. Keyword kekerasan fisik nyata / bahaya seketika (Hanya ini yang boleh CRITICAL)
  const realCriticalKeywords = [
    'perkosaan', 'diperkosa', 'pemerkosaan', 'diserang secara fisik',
    'ancaman pembunuhan', 'dibacok', 'dipukul berdarah', 'dicekik',
    'disekap', 'dipaksa bersetubuh', 'sebar foto kamu', 'sebar foto',
    'tak sebar foto', 'ancaman sebar', 'sebar video'
  ];

  // 3. Keyword pelanggaran serius non-fisik / KSBE / intimidasi
  const highKeywords = [
    'pelecehan seksual', 'dilecehkan', 'dipegang paksa', 'diraba paksa',
    'foto bugil', 'disebar luaskan', 'intimidasi', 'mengancam menyebarkan',
    'stalking', 'deepfake', 'konten intim', 'cyberbullying berat', 'ancam',
    'nurut tak sebar'
  ];

  // 4. Keyword diskriminasi / etika / pemerasan relasi kuasa
  const mediumKeywords = [
    'diskriminasi', 'diperlakukan tidak adil', 'diejek', 'dipermalukan di depan kelas',
    'pelanggaran etika dosen', 'ancaman nilai diturunkan', 'senior', 'transfer uang',
    'palak', 'pemerasan', 'bayar uang', 'pungli'
  ];

  let riskLevel: TriageRiskLevel = 'LOW';
  let urgencyScore = 20;

  // Jika teks tugas kuliah/akademik dan tidak ada kata pemerkosaan/serangan nyata -> LOW
  if (isAcademicOrTest && !realCriticalKeywords.some((k) => text.includes(k))) {
    riskLevel = 'LOW';
    urgencyScore = 18;
    return {
      riskLevel,
      urgencyScore,
      categoryRecommendation: 'Laporan Non-Kasus / Tinjauan Akademik',
      legalPasalBasis: 'Permendikbudristek No. 30 Tahun 2021 (Verifikasi Awal Substansi Kasus)',
      summary: 'Kronologi yang disampaikan terindikasi memuat teks materi akademik atau latihan non-kekerasan. Tidak terdeteksi indikasi ancaman fisik atau bahaya darurat.',
    };
  }

  if (realCriticalKeywords.some((k) => text.includes(k))) {
    riskLevel = 'CRITICAL';
    urgencyScore = 88;
  } else if (highKeywords.some((k) => text.includes(k))) {
    riskLevel = 'HIGH';
    urgencyScore = 75;
  } else if (mediumKeywords.some((k) => text.includes(k))) {
    riskLevel = 'MEDIUM';
    urgencyScore = 65;
  } else {
    riskLevel = 'LOW';
    urgencyScore = 15;
  }

  // Cek Penalti Bukti Manipulasi AI
  const hasTamperedEvidence = evidences?.some(
    (e) => e.forensicStatus === 'Manipulated' || e.aiAnalysis?.tamperingDetected
  );
  if (hasTamperedEvidence) {
    urgencyScore = Math.max(15, urgencyScore - 40);
    if (riskLevel === 'CRITICAL') riskLevel = 'MEDIUM';
    else if (riskLevel === 'HIGH') riskLevel = 'LOW';
  }

  const categoryMap: Record<TriageRiskLevel, string> = {
    CRITICAL: 'Indikasi Pengancaman / Kekerasan Seksual Berbasis Elektronik (KSBE)',
    HIGH: 'Perundungan Siber & Pelecehan Non-Fisik',
    MEDIUM: 'Indikasi Pemerasan Finansial & Perundungan Relasi Kuasa (Bullying)',
    LOW: 'Laporan Non-Kasus / Aktivitas Akademik Normal',
  };

  const legalMap: Record<TriageRiskLevel, string> = {
    CRITICAL: 'Pasal 14 UU TPKS No. 12 Tahun 2022 & Permendikbudristek No. 30/2021',
    HIGH: 'Pasal 14 UU TPKS (KSBE) & Pasal 5 Permendikbudristek No. 30 Tahun 2021 tentang PPKS',
    MEDIUM: 'Pasal 368 KUHP (Pemerasan) & Permendikbudristek No. 30/2021',
    LOW: 'Pasal 28E UUD 1945 & Permendikbudristek No. 30 Tahun 2021 tentang PPKS',
  };

  const summaryMap: Record<TriageRiskLevel, string> = {
    CRITICAL:
      'Laporan memuat indikasi bahaya fisik nyata yang memerlukan tindakan darurat langsung oleh Satgas PPKS.' +
      (hasTamperedEvidence ? ' (Skor urgensi diturunkan karena bukti terdeteksi manipulasi).' : ''),
    HIGH:
      'Laporan menunjukkan pola intimidasi atau pelecehan berbasis elektronik yang membutuhkan pendampingan prioritas.' +
      (hasTamperedEvidence ? ' (Skor urgensi disesuaikan karena keabsahan bukti diragukan).' : ''),
    MEDIUM:
      'Laporan mengindikasikan pelanggaran etika atau relasi kuasa yang disarankan untuk diklarifikasi melalui mediasi Satgas.',
    LOW:
      'Laporan tidak menunjukkan tanda kekerasan darurat. Ditinjau sebagai informasi umum atau klarifikasi informal.',
  };

  return {
    riskLevel,
    urgencyScore,
    categoryRecommendation: categoryMap[riskLevel],
    legalPasalBasis: legalMap[riskLevel],
    summary: summaryMap[riskLevel],
  };
}

// ─── Route Handler ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: TriageRequestBody = await request.json();

    if (!body.kronologi || typeof body.kronologi !== 'string') {
      return NextResponse.json(
        { error: 'Field "kronologi" wajib diisi dan harus berupa string.' },
        { status: 400 }
      );
    }

    const kronologi = body.kronologi.trim();
    if (kronologi.length < 3) {
      return NextResponse.json(
        { error: 'Kronologi terlalu singkat untuk dianalisis.' },
        { status: 400 }
      );
    }

    // Coba gunakan Gemini API, fallback ke heuristik jika gagal
    let result: TriageResult;
    let usedFallback = false;

    try {
      result = await callGeminiAPI(kronologi, body.evidences);
    } catch (aiError) {
      console.warn('[AI Triage] Gemini API gagal, menggunakan analisis heuristik:', aiError);
      result = heuristicTriage(kronologi, body.evidences);
      usedFallback = true;
    }

    return NextResponse.json({ ...result, _analyzedBy: usedFallback ? 'heuristic' : 'gemini' });
  } catch (error) {
    console.error('[AI Triage] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan internal saat menganalisis laporan.' },
      { status: 500 }
    );
  }
}
