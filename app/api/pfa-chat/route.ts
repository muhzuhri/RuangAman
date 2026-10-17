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

const SYSTEM_PROMPT = `Kamu adalah Ara, PFA (Psychological First Aid) Virtual Assistant resmi dari platform RuangAman.

NADA BICARA:
- Empatis, menenangkan, profesional, suportif, dan solutif.
- Gunakan bahasa Indonesia yang hangat, bersahabat, dan tidak menghakimi.

INSTRUKSI UTAMA:
Setiap kali pengguna menceritakan masalah, kekhawatiran, atau kasus perundungan/kekerasan seksual/intimidasi di lingkungan kampus:
1. Berikan empati mendalam dan validasi perasaan mereka, serta masukan praktis secara singkat agar mereka merasa tenang dan tidak sendirian.
2. Secara aktif hubungkan solusi dan langkah mereka dengan fitur-fitur platform RuangAman:
   • Laporan 100% Anonim & Aman: Jelaskan bahwa mereka dapat membuat laporan secara aman dan tanpa takut di halaman "/report".
   • Keamanan Data Mutlak: Tegaskan bahwa data laporan dilindungi dengan enkripsi AES-256 dan arsitektur Zero-Knowledge, sehingga identitas pribadi, nama, maupun NIM tidak akan pernah bocor ke siapapun.
   • Penanganan Cepat Satgas PPKS: Beritahukan bahwa setiap laporan akan dianalisis secara objektif oleh AI Smart Triage dan langsung diteruskan secara real-time ke Satgas PPKS Kampus untuk penanganan dan perlindungan segera.
   • Latihan Penenangan Diri (Relaksasi): Ajak dan ingatkan mereka untuk memanfaatkan fitur teknik pernapasan penenang kepanikan (4-7-8 Breathing) di menu "/support" jika saat ini masih merasa cemas atau tegang.

GAYA BALASAN:
- Gunakan format paragraf pembuka yang ringkas dan menenangkan.
- Gunakan poin-poin (bullet points) yang rapi, terstruktur, dan mudah dibaca oleh korban yang sedang dalam kondisi cemas atau tertekan.
- Hindari kalimat bertele-tele. Maksimal 3-4 poin agar korban tidak merasa kewalahan membaca.
- Selalu tutup dengan kalimat dukungan hangat dan tanyakan apakah ada hal lain yang ingin mereka ceritakan atau ketahui tentang proses pelaporan.`;

// ─── Gemini API Call ───────────────────────────────────────────────────────────

async function callGeminiChatAPI(
  message: string,
  history: ChatMessage[]
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GEMINI_API_KEY tidak dikonfigurasi.');
  }

  // Coba model gemini-3.5-flash-lite, lalu gemini-3.8-flash, lalu gemini-flash-latest
  const candidateModels = ['gemini-3.5-flash-lite', 'gemini-3.8-flash', 'gemini-flash-latest'];
  let lastError: Error | null = null;

  for (const model of candidateModels) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

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
          maxOutputTokens: 600,
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
        throw new Error(`Gemini API error (${response.status} on ${model}): ${errText}`);
      }

      const data = await response.json();
      const text: string =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

      if (text && text.trim().length > 0) {
        return text.trim();
      }
    } catch (err: any) {
      lastError = err;
      console.warn(`[PFA Chat] Model ${model} terkendala:`, err?.message || err);
    }
  }

  throw lastError || new Error('Semua model Gemini gagal merespons.');
}

// ─── Fallback Responses (Sesuai Aturan System Prompt Baru) ───────────────────────

const FALLBACK_RESPONSES = [
  `Terima kasih sudah berani bercerita kepada saya. Apa yang Anda rasakan saat ini sepenuhnya valid dan Anda tidak sendirian menghadapi situasi ini. 💚

Untuk membantu Anda melangkah dengan aman dan tenang, platform RuangAman menyediakan fitur yang bisa Anda manfaatkan:

• 🔒 **Laporan 100% Anonim (/report):** Anda dapat menceritakan kejadian secara rahasia. Data dilindungi enkripsi AES-256 dan Zero-Knowledge sehingga identitas, nama, maupun NIM tidak akan pernah bocor.
• ⚡ **Penanganan Cepat Satgas PPKS:** Laporan Anda akan dianalisis secara objektif oleh AI Smart Triage dan langsung diteruskan ke tim Satgas kampus untuk penanganan segera.
• 🌿 **Relaksasi Mandiri (/support):** Jika Anda masih merasa cemas atau tegang saat ini, cobalah panduan teknik pernapasan penenang kepanikan di menu Bantuan & PFA.

Tarik napas perlahan... Apakah ada hal lain yang ingin Anda ceritakan atau tanyakan tentang proses pelaporan?`,

  `Saya memahami ini situasi yang sangat berat dan mencemaskan. Namun ingat, Anda berada di ruang yang aman dan keberanian Anda untuk berbicara patut dihargai. 💚

Langkah perlindungan yang siap mendukung Anda di RuangAman:

• 🛡️ **Pelaporan Terenkripsi di /report:** Buat laporan tanpa rasa takut. Sistem menjamin 100% anonimitas dengan standar keamanan kriptografi tinggi.
• 🤖 **AI Smart Triage & Satgas Kampus:** Sistem akan menilai urgensi kasus dan menghubungkan laporan Anda dengan tim Satgas PPKS untuk perlindungan bebas retaliasi.
• 🌬️ **Penenang Kecemasan di /support:** Manfaatkan fitur latihan pernapasan 4-7-8 untuk membantu menstabilkan detak jantung dan emosi Anda saat ini.

Apakah Anda saat ini berada di tempat yang aman, atau butuh bantuan Ara untuk menjelaskan langkah pelaporan?`,
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
