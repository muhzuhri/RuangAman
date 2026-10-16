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

interface TriageRequestBody {
  kronologi: string;
}

// ─── System Prompt ─────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `Anda adalah sistem AI Smart Triage untuk platform pelaporan kekerasan seksual dan perundungan di lingkungan kampus Indonesia (AmanKampus). Tugas Anda adalah menganalisis teks kronologi laporan dan memberikan penilaian risiko secara objektif.

INSTRUKSI KETAT:
1. Analisis kronologi secara menyeluruh dan netral.
2. Tentukan tingkat risiko berdasarkan kriteria berikut:
   - CRITICAL: Ancaman fisik langsung, pelecehan seksual berat, kekerasan fisik, atau situasi darurat yang membutuhkan tindakan segera.
   - HIGH: Perundungan serius, intimidasi berulang, pelecehan seksual verbal/non-fisik, eksploitasi, atau dampak psikologis berat.
   - MEDIUM: Diskriminasi, pelanggaran etika akademik, intimidasi tidak langsung, atau situasi yang membutuhkan mediasi.
   - LOW: Ketidaknyamanan sosial, konflik interpersonal ringan, atau situasi yang dapat diselesaikan secara informal.
3. Berikan skor urgensi dari 1-100 (100 = paling mendesak).
4. Rekomendasikan kategori kasus yang paling tepat.
5. Kaitkan dengan dasar hukum yang relevan (Permendikbudristek No. 30 Tahun 2021 tentang PPKS, UU No. 12 Tahun 2022 tentang TPKS, atau KUHP).
6. Tulis ringkasan singkat dalam Bahasa Indonesia yang empatis dan profesional (maksimal 2 kalimat).

PENTING: Respons Anda HARUS berupa JSON valid dengan struktur persis seperti ini, tanpa teks tambahan di luar JSON:
{
  "riskLevel": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
  "urgencyScore": <angka 1-100>,
  "categoryRecommendation": "<string kategori>",
  "legalPasalBasis": "<string dasar hukum>",
  "summary": "<string ringkasan 1-2 kalimat>"
}`;

// ─── Gemini API Call ───────────────────────────────────────────────────────────

async function callGeminiAPI(kronologi: string): Promise<TriageResult> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY tidak dikonfigurasi di environment variables.');
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  const requestBody = {
    systemInstruction: {
      parts: [{ text: SYSTEM_PROMPT }],
    },
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: `Analisis kronologi laporan berikut dan berikan penilaian risiko dalam format JSON:\n\n"${kronologi}"`,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.2,
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

  // Parse JSON response dari Gemini
  const parsed: TriageResult = JSON.parse(rawText);

  // Validate required fields
  if (
    !parsed.riskLevel ||
    typeof parsed.urgencyScore !== 'number' ||
    !parsed.categoryRecommendation ||
    !parsed.legalPasalBasis ||
    !parsed.summary
  ) {
    throw new Error('Respons AI tidak memenuhi format yang diharapkan.');
  }

  // Validate riskLevel value
  const validLevels: TriageRiskLevel[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
  if (!validLevels.includes(parsed.riskLevel)) {
    throw new Error(`riskLevel tidak valid: ${parsed.riskLevel}`);
  }

  // Clamp urgencyScore to 1-100
  parsed.urgencyScore = Math.min(100, Math.max(1, Math.round(parsed.urgencyScore)));

  return parsed;
}

// ─── Fallback Heuristic (ketika API Key tidak tersedia / quota habis) ──────────

function heuristicTriage(kronologi: string): TriageResult {
  const text = kronologi.toLowerCase();

  const criticalKeywords = [
    'perkosaan', 'diperkosa', 'kekerasan fisik', 'dipukul', 'ancaman pembunuhan',
    'diancam', 'pemerasan fisik', 'dipaksa secara fisik', 'diserang',
  ];
  const highKeywords = [
    'pelecehan seksual', 'dilecehkan', 'dipegang', 'diraba', 'foto bugil',
    'intimidasi', 'mengancam', 'bullying berat', 'perundungan', 'stalking',
    'deepfake', 'konten intim', 'cyberbullying',
  ];
  const mediumKeywords = [
    'diskriminasi', 'diperlakukan tidak adil', 'diejek', 'dipermalukan',
    'pelanggaran etika', 'tugas di luar', 'nilai diturunkan', 'tidak adil',
  ];

  let riskLevel: TriageRiskLevel = 'LOW';
  let urgencyScore = 20;

  if (criticalKeywords.some((k) => text.includes(k))) {
    riskLevel = 'CRITICAL';
    urgencyScore = 90 + Math.floor(Math.random() * 10);
  } else if (highKeywords.some((k) => text.includes(k))) {
    riskLevel = 'HIGH';
    urgencyScore = 65 + Math.floor(Math.random() * 15);
  } else if (mediumKeywords.some((k) => text.includes(k))) {
    riskLevel = 'MEDIUM';
    urgencyScore = 40 + Math.floor(Math.random() * 20);
  } else {
    riskLevel = 'LOW';
    urgencyScore = 15 + Math.floor(Math.random() * 20);
  }

  const categoryMap: Record<TriageRiskLevel, string> = {
    CRITICAL: 'Kekerasan Seksual & Pelecehan',
    HIGH: 'Perundungan & Intimidasi Serius',
    MEDIUM: 'Diskriminasi & Pelanggaran Etika',
    LOW: 'Ketidaknyamanan & Konflik Interpersonal',
  };

  const legalMap: Record<TriageRiskLevel, string> = {
    CRITICAL: 'Pasal 5 & 6 UU No. 12 Tahun 2022 tentang Tindak Pidana Kekerasan Seksual (TPKS)',
    HIGH:
      'Pasal 5 UU TPKS & Pasal 6 Permendikbudristek No. 30 Tahun 2021 tentang PPKS',
    MEDIUM:
      'Pasal 9 & 10 Permendikbudristek No. 30 Tahun 2021 tentang Pencegahan dan Penanganan Kekerasan Seksual (PPKS)',
    LOW: 'Pasal 9 Permendikbudristek No. 30 Tahun 2021 tentang PPKS',
  };

  const summaryMap: Record<TriageRiskLevel, string> = {
    CRITICAL:
      'Laporan mengindikasikan situasi kritis yang memerlukan penanganan segera oleh Satgas PPKS dan pihak berwenang. Korban disarankan untuk segera mencari perlindungan dan mendokumentasikan bukti.',
    HIGH:
      'Laporan menunjukkan indikasi pelanggaran serius yang memerlukan investigasi prioritas. Satgas PPKS perlu segera menghubungi pelapor untuk pendampingan lanjutan.',
    MEDIUM:
      'Laporan mengindikasikan pelanggaran etika atau diskriminasi yang perlu ditangani melalui jalur mediasi formal. Satgas akan mengevaluasi dan merespons dalam 3 hari kerja.',
    LOW:
      'Laporan diterima dan akan ditinjau oleh tim Satgas. Jika diperlukan, mediasi informal akan direkomendasikan sebagai langkah penyelesaian pertama.',
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
    if (kronologi.length < 20) {
      return NextResponse.json(
        { error: 'Kronologi terlalu singkat untuk dianalisis (minimal 20 karakter).' },
        { status: 400 }
      );
    }

    // Coba gunakan Gemini API, fallback ke heuristik jika gagal
    let result: TriageResult;
    let usedFallback = false;

    try {
      result = await callGeminiAPI(kronologi);
    } catch (aiError) {
      console.warn('[AI Triage] Gemini API gagal, menggunakan analisis heuristik:', aiError);
      result = heuristicTriage(kronologi);
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
