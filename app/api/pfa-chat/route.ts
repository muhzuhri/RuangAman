import { NextRequest, NextResponse } from 'next/server';

// ─── Types ─────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

interface PfaChatRequestBody {
  message: string;
  history?: ChatMessage[];
}

// ─── System Prompt ─────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `Anda adalah Ara, asisten AI Psychological First Aid (PFA) dari platform AmanKampus. Anda hadir untuk mendampingi korban dugaan kekerasan, pelecehan, atau perundungan di lingkungan kampus Indonesia.

IDENTITAS & PERAN ANDA:
- Nama: Ara (AmanKampus Resilience Assistant)
- Peran: Pendamping PFA (Psychological First Aid) — bukan terapis atau dokter.
- Bahasa: Bahasa Indonesia yang hangat, empatik, dan mudah dipahami.
- Anda TIDAK menggantikan profesional kesehatan mental atau Satgas PPKS.

PRINSIP PFA YANG HARUS DITERAPKAN:
1. LOOK (Amati): Kenali dan akui perasaan korban tanpa menghakimi.
2. LISTEN (Dengarkan): Berikan ruang aman untuk berbicara. Jangan terlalu banyak bertanya.
3. LINK (Hubungkan): Arahkan ke sumber daya yang tepat (Satgas PPKS, hotline, formulir laporan).

PANDUAN RESPONS:
- Selalu mulai dengan mengakui perasaan pengguna ("Saya mengerti ini sangat berat untuk dihadapi...")
- Gunakan kalimat pendek, hangat, dan tidak menghakimi.
- Jangan pernah meminta detail tentang kejadian — fokus pada kondisi emosional saat ini.
- Jika pengguna menunjukkan tanda bahaya (pikiran melukai diri sendiri), segera berikan nomor darurat: Hotline Kemenkes 119 ext 8 atau Into The Light Indonesia 119 ext 8.
- Validasi keberanian mereka untuk berbicara.
- Ingatkan bahwa identitas mereka terlindungi secara penuh (Zero-Knowledge Encryption & Anonimitas).
- Maksimal 3-4 kalimat per respons agar tidak overwhelming.
- Hindari memberikan saran hukum atau medis yang spesifik — arahkan ke profesional.
- Selalu akhiri dengan satu pertanyaan terbuka atau pilihan sederhana untuk melanjutkan percakapan.

JIKA PENGGUNA SIAP MELAPOR:
- Jelaskan bahwa mereka bisa menggunakan formulir di /report secara anonim.
- Assurance: "Tidak ada yang akan mengetahui identitas Anda. Semua metadata lokasi dihapus."

HAL YANG TIDAK BOLEH DILAKUKAN:
- Jangan menghakimi atau mempertanyakan kebenaran cerita pengguna.
- Jangan memaksa pengguna untuk melapor — ini harus keputusan mereka sendiri.
- Jangan memberikan janji yang tidak dapat dipenuhi.
- Jangan meminta atau menyimpan informasi pribadi apapun.`;

// ─── Gemini API Call ───────────────────────────────────────────────────────────

async function callGeminiChatAPI(
  message: string,
  history: ChatMessage[]
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY tidak dikonfigurasi.');
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

  // Build conversation history for Gemini multi-turn
  const contents = [
    ...history.map((msg) => ({
      role: msg.role,
      parts: [{ text: msg.text }],
    })),
    {
      role: 'user' as const,
      parts: [{ text: message }],
    },
  ];

  const requestBody = {
    systemInstruction: {
      parts: [{ text: SYSTEM_PROMPT }],
    },
    contents,
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 512,
    },
    safetySettings: [
      {
        category: 'HARM_CATEGORY_HARASSMENT',
        threshold: 'BLOCK_ONLY_HIGH',
      },
      {
        category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
        threshold: 'BLOCK_ONLY_HIGH',
      },
    ],
  };

  const response = await fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(requestBody),
    signal: AbortSignal.timeout(15000),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Gemini API error (${response.status}): ${errText}`);
  }

  const data = await response.json();
  const text: string =
    data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

  if (!text) {
    throw new Error('Gemini API mengembalikan respons kosong.');
  }

  return text.trim();
}

// ─── Fallback Responses ────────────────────────────────────────────────────────

const FALLBACK_RESPONSES = [
  'Terima kasih sudah mempercayakan perasaan Anda kepada saya. Saya di sini untuk mendengarkan, apapun yang sedang Anda rasakan saat ini sepenuhnya valid. Apakah Anda ingin bercerita lebih lanjut, atau ada yang bisa saya bantu sekarang?',
  'Saya sangat menghargai keberanian Anda untuk berbicara. Anda tidak sendirian dalam menghadapi ini. Boleh saya tanya — bagaimana kondisi Anda saat ini? Apakah Anda merasa aman?',
  'Ini pasti sangat berat untuk dihadapi, dan Anda sudah melakukan langkah yang luar biasa berani dengan mencari bantuan. Ingat, identitas Anda sepenuhnya terlindungi di sini. Ada tiga hal yang bisa saya bantu: mendampingi Anda bernapas tenang, menjelaskan proses pelaporan, atau menghubungkan Anda dengan Satgas PPKS.',
];

let fallbackIndex = 0;

function getFallbackResponse(): string {
  const response = FALLBACK_RESPONSES[fallbackIndex % FALLBACK_RESPONSES.length];
  fallbackIndex++;
  return response;
}

// ─── Route Handler ─────────────────────────────────────────────────────────────

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body: PfaChatRequestBody = await request.json();

    if (!body.message || typeof body.message !== 'string') {
      return NextResponse.json(
        { error: 'Field "message" wajib diisi.' },
        { status: 400 }
      );
    }

    const message = body.message.trim();
    const history: ChatMessage[] = Array.isArray(body.history) ? body.history : [];

    if (message.length === 0) {
      return NextResponse.json(
        { error: 'Pesan tidak boleh kosong.' },
        { status: 400 }
      );
    }

    let reply: string;
    let usedFallback = false;

    try {
      reply = await callGeminiChatAPI(message, history);
    } catch (aiError) {
      console.warn('[PFA Chat] Gemini API gagal, menggunakan fallback response:', aiError);
      reply = getFallbackResponse();
      usedFallback = true;
    }

    return NextResponse.json({
      reply,
      _respondedBy: usedFallback ? 'fallback' : 'gemini',
    });
  } catch (error) {
    console.error('[PFA Chat] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan internal.' },
      { status: 500 }
    );
  }
}
