import { NextRequest, NextResponse } from 'next/server';

interface CaseContextData {
  caseId: string;
  category: string;
  chronology: string;
  targetFaculty?: string;
  receivedAt: string;
  status: string;
  riskLevel: string;
  urgencyScore: number;
  evidenceSummary?: string;
  evidenceCount?: number;
}

interface CaseAdvisorRequestBody {
  caseData: CaseContextData;
  mode: 'initial_plan' | 'chat';
  question?: string;
  history?: { role: 'user' | 'model'; text: string }[];
}

// ─── Rule-Based Intelligent Fallback Generator ──────────────────────────────

function generateFallbackResponse(
  caseData: CaseContextData,
  mode: 'initial_plan' | 'chat',
  question?: string
): string {
  const {
    caseId,
    category,
    chronology,
    targetFaculty,
    riskLevel,
    evidenceCount = 0,
    evidenceSummary = '',
  } = caseData;

  const isCritical = riskLevel === 'CRITICAL';
  const isHigh = riskLevel === 'HIGH';

  if (mode === 'initial_plan' || !question || question.toLowerCase().includes('rencana strategis')) {
    return `### 📋 REKOMENDASI STRATEGIS PENANGANAN KASUS (${caseId})
**Analisis Terpadu Berdasarkan Fakta Pelapor, Tingkat Risiko & Bukti Digital**

---

#### 1. 🔍 Evaluasi Objektif & Analisis Keparahan Kasus
- **Klasifikasi Aduan:** ${category || 'Kekerasan/Pelanggaran Lingkungan Kampus'}
- **Tingkat Risiko:** **${riskLevel}** (Skor Urgensi: ${caseData.urgencyScore}/100)
- **Unit / Fakultas Terkait:** ${targetFaculty || 'Lingkup Kampus Umum'}
- **Evaluasi Narasi Pelapor:**
  Kronologi mengindikasikan adanya dugaan tindakan yang melanggar norma keselamatan dan integritas civitas akademika. ${
    isCritical
      ? 'Ditemukan indikasi ancaman fisik atau pemaksaan yang berpotensi membahayakan keselamatan korban secara langsung.'
      : isHigh
      ? 'Teridentifikasi pola intimidasi/pelecehan yang membutuhkan tindakan perlindungan psikologis dan pembatasan interaksi segera.'
      : 'Perlu verifikasi klarifikasi administratif untuk menentukan apakah terdapat unsur pelanggaran etika atau relasi kuasa.'
  }
- **Status Alat Bukti Forensik:**
  ${evidenceCount > 0 ? `Tercatat ${evidenceCount} berkas bukti digital. ${evidenceSummary || 'Bukti telah melalui validasi Magic-Bytes dan EXIF Stripping.'}` : 'Belum ada berkas digital terlampir; pembuktian berfokus pada keterangan kronologis dan saksi.'}

---

#### 2. ⚡ Rencana Aksi Satgas PPKS (Action Plan Bertahap)
1. **Langkah 1: Pengamanan & Proteksi Korban (0 - 24 Jam)**
   - Berikan jaminan kerahasiaan penuh (*Zero-Knowledge Guarantee*).
   - Pastikan korban tidak berada dalam lingkungan atau jadwal akademik yang sama dengan terlapor bila terjadi ancaman intimidasi.
   - Terbitkan surat perlindungan sementara dari Ketua Satgas PPKS bila korban mengalami trauma atau intimidasi.
2. **Langkah 2: Validasi Berkas & Pengumpulan Keterangan (1 - 3 Hari)**
   - Periksa keabsahan bukti digital (verifikasi hash SHA-256 dan catatan otentikasi pelapor).
   - Jadwalkan wawancara terpisah dan terlindung dengan pelapor (dilarang mengonfrontasi langsung dengan pihak terlapor).
3. **Langkah 3: Pemanggilan Klarifikasi Terlapor (3 - 7 Hari)**
   - Layangkan surat panggilan tertutup resmi melalui Unit/Fakultas terkait.
   - Catat Berita Acara Pemeriksaan (BAP) dengan fokus pada substansi kronologi aduan.

---

#### 3. 🛡️ Protokol Pemulihan & Konseling Psikologis (PFA)
- Rujuk korban ke Unit Layanan Konseling Psikologis Kampus untuk penanganan trauma atau kecemasan.
- Rekomendasikan dispensasi kehadiran akademik / perkuliahan sementara jika korban mengalami trauma berat.

---

#### 4. ⚖️ Landasan Regulasi & Rekomendasi Sanksi
- **Rujukan Hukum:** Permendikbudristek No. 30 Tahun 2021 tentang Pencegahan dan Penanganan Kekerasan Seksual di Lingkungan Perguruan Tinggi, serta UU TPKS No. 12 Tahun 2022.
- **Rekomendasi Sanksi Administratif:**
  ${
    isCritical
      ? '• Sanksi Berat: Pemberhentian sementara (skorsing) atau pemutusan status sebagai civitas akademika (drop out/pemberhentian tetap).'
      : isHigh
      ? '• Sanksi Sedang: Skorsing akademik 1-2 semester, pencabutan beasiswa, dan larangan mengikuti kegiatan kampus.'
      : '• Sanksi Ringan: Teguran tertulis dan kewajiban mengikuti program konseling pembinaan perilaku.'
  }`;
  }

  // Chat Mode Fallback
  const qLower = (question || '').toLowerCase();

  // 1. Bukti & Forensik
  if (qLower.includes('bukti') || qLower.includes('forensik') || qLower.includes('valid') || qLower.includes('cukup') || qLower.includes('screenshot') || qLower.includes('rekaman')) {
    return `Halo tim Satgas, menanggapi pertanyaan Anda mengenai **alat bukti kasus ${caseId}**:

1. **Kekuatan Bukti Digital:**
   - Tercatat **${evidenceCount} berkas bukti digital** pada laporan ini.
   - ${
     evidenceCount > 0
       ? 'Seluruh berkas bukti telah melewati pemeriksaan biner Magic-Bytes dan enkripsi hash SHA-256 Checksum, serta metadata sensitif (EXIF GPS) telah disanitasi. Secara forensik digital, berkas ini otentik dan memenuhi syarat pembuktian awal.'
       : 'Saat ini belum ada berkas digital yang diunggah. Namun berdasarkan **Pasal 39 Permendikbudristek No. 30/2021**, keterangan kronologis pelapor yang konsisten sudah sah menjadi dasar penyelidikan Satgas tanpa harus menunggu bukti sempurna.'
   }
2. **Langkah Verifikasi Satgas:**
   - Cocokkan stempel waktu (*timestamp*) pada kronologi dengan berkas bukti terkait.
   - Catat hash SHA-256 pada Berita Acara Pemeriksaan (BAP) agar integritas rantai bukti (*chain of custody*) terjamin di mata hukum.`;
  }

  // 2. Surat Panggilan & Draf Resmi
  if (qLower.includes('surat') || qLower.includes('panggilan') || qLower.includes('undangan') || qLower.includes('klarifikasi') || qLower.includes('draf') || qLower.includes('bap')) {
    return `Berikut draf **Surat Panggilan Klarifikasi Terlapor** resmi yang siap digunakan oleh Satgas PPKS:

\`\`\`text
NOMOR: 042/SATGAS-PPKS/KLARIFIKASI/${new Date().getFullYear()}
HAL  : Undangan Klarifikasi Tertutup atas Dugaan Pelanggaran Kode Etik
SIFAT: RAHASIA (CONFIDENTIAL)

Kepada Yth.
Sdr./Sdri. [Nama Pihak Terlapor]
Unit/Fakultas: ${targetFaculty || '[Fakultas Terkait]'}

Dengan hormat,
Sehubungan dengan adanya laporan aduan dugaan pelanggaran etik dan keselamatan kampus dengan Kode Register Kasus [${caseId}] kategori [${category}], Satgas PPKS mengundang Saudara/i untuk hadir dalam sesi klarifikasi tertutup pada:

Hari/Tanggal : [Tentukan Hari, Tanggal]
Waktu        : 10.00 WIB - Selesai
Tempat       : Ruang Konsultasi Khusus Satgas PPKS (Gedung Rektorat)
Agenda       : Pemberian Keterangan & Klarifikasi atas Dugaan Pelanggaran Etik

Saudara/i berhak memberikan keterangan secara tertib dan didampingi bila diperlukan. Demi integritas proses pemeriksaan, pertemuan ini bersifat tertutup dan mengikat secara disipliner akademik.

Demikian undangan ini kami sampaikan. Atas kerja sama Saudara/i, kami ucapkan terima kasih.

Satgas PPKS Perguruan Tinggi
[Tanda Tangan & Cap Resmi]
\`\`\`

💡 *Tips Ara:* Pastikan surat dikirimkan secara tertutup (dalam amplop bersegel atau email resmi berenkripsi) demi mencegah kebocoran informasi dan rumor di fakultas.`;
  }

  // 3. Mediasi & Konfrontasi
  if (qLower.includes('mediasi') || qLower.includes('damai') || qLower.includes('tatap muka') || qLower.includes('konfrontasi')) {
    return `⚠️ **Peringatan Penting Protokol Mediasi untuk Kasus ${caseId}:**

1. **Larangan Mediasi Tatap Muka Langsung:**
   Berdasarkan Permendikbudristek No. 30/2021 dan standar penanganan korban kekerasan, **korban TIDAK BOLEH dikonfrontasi atau dipertemukan langsung dalam satu ruangan dengan terlapor**, terutama bila ada unsur intimidasi atau ketimpangan relasi kuasa.
2. **Gunakan Metode *Shuttle Consultation* (Pemeriksaan Terpisah):**
   Satgas bertindak sebagai fasilitator independen yang memeriksa kedua belah pihak di waktu dan ruangan yang terpisah secara bergantian.
3. **Persetujuan Penuh Korban (*Informed Consent*):**
   Segala bentuk penyelesaian damai atau musyawarah hanya dapat dipertimbangkan jika korban secara sadar, tanpa tekanan atau intimidasi, mengajukannya secara tertulis.`;
  }

  // 4. Sanksi & Regulasi
  if (qLower.includes('sanksi') || qLower.includes('hukum') || qLower.includes('pasal') || qLower.includes('skorsing') || qLower.includes('drop out') || qLower.includes('do')) {
    return `Berikut kajian rujukan sanksi dan pasal regulasi untuk kasus **${caseId}** (${category}):

1. **Landasan Hukum Utama:**
   - **Permendikbudristek No. 30 Tahun 2021** (Pasal 10 hingga 19 tentang Sanksi Administratif).
   - **UU No. 12 Tahun 2022** tentang Tindak Pidana Kekerasan Seksual (TPKS).
2. **Tingkatan Sanksi Administratif Kampus:**
   - **Sanksi Ringan:** Teguran tertulis dan pernyataan permohonan maaf tertulis internal.
   - **Sanksi Sedang:** Skorsing akademik 1-2 semester, pencabutan hak beasiswa, atau pelepasan jabatan struktural/organisasi.
   - **Sanksi Berat:** Pemberhentian tetap tidak dengan hormat (Drop Out bagi mahasiswa, atau pemecatan bagi tenaga pendidik).
3. **Catatan Satgas:** Pemberian sanksi administratif internal kampus bersifat independen dan tidak menggugurkan hak korban bila ingin menempuh jalur hukum kepolisian.`;
  }

  // 5. Relasi Kuasa / Dosen / Pejabat Kampus
  if (qLower.includes('dosen') || qLower.includes('kuasa') || qLower.includes('pejabat') || qLower.includes('dekan') || qLower.includes('pembimbing') || qLower.includes('senior')) {
    return `🛡️ **Panduan Penanganan Kasus Relasi Kuasa (Kasus ${caseId}):**

1. **Mitigasi Tekanan Akademik:**
   Jika pihak terlapor memiliki kewenangan akademik terhadap korban (misal: dosen pembimbing, penguji, atau dosen pengampu mata kuliah), Satgas wajib segera merekomendasikan penggantian dosen pembimbing/penguji ke pihak dekanat demi menghindari nilai yang disandera (*academic retaliation*).
2. **Independensi Satgas PPKS:**
   Sesuai mandat kementerian, Satgas PPKS bertanggung jawab langsung kepada Rektor, bukan kepada Dekan atau Kepala Program Studi. Hal ini menjamin proses klarifikasi bebas dari intervensi struktural fakultas.
3. **Kerahasiaan Identitas (Zero-Knowledge):**
   Jangan pernah membocorkan identitas saksi atau korban kepada pihak fakultas sebelum ada putusan resmi perlindungan.`;
  }

  // 6. Pendampingan Korban, Trauma & PFA
  if (qLower.includes('korban') || qLower.includes('trauma') || qLower.includes('psikologis') || qLower.includes('pfa') || qLower.includes('cemas') || qLower.includes('takut') || qLower.includes('visum') || qLower.includes('medis')) {
    return `💚 **Protokol Perlindungan & Pendampingan Korban (${caseId}):**

1. **Psychological First Aid (PFA):**
   - Validasi perasaan korban: Dengarkan tanpa menghakimi dan yakinkan bahwa keberanian mereka berbicara sangat dihargai.
   - Rujuk ke Konselor Psikologis Kampus / Layanan Konseling Mitra RuangAman.
2. **Surat Dispensasi Akademik Sementara:**
   Satgas dapat menerbitkan surat rekomendasi dispensasi presensi kuliah atau penundaan ujian selama korban menjalani masa pemulihan trauma.
3. **Fasilitasi Medis / Visum (Jika Diperlukan):**
   Bila kasus melibatkan kontak fisik atau kekerasan yang memerlukan bukti visum *et repertum*, dampingi korban ke fasilitas kesehatan rujukan resmi kampus secara tertutup dan bermartabat.`;
  }

  // 7. Saksi & Intimidasi
  if (qLower.includes('saksi') || qLower.includes('intimidasi') || qLower.includes('ancaman') || qLower.includes('teror') || qLower.includes('lindungi')) {
    return `🚨 **Prosedur Perlindungan Saksi & Anti-Intimidasi (${caseId}):**

1. **Jaminan Kerahasiaan Saksi:**
   Identitas saksi dilindungi dan tidak dicantumkan dalam salinan BAP yang diberikan kepada terlapor.
2. **Peringatan Keras kepada Terlapor:**
   Dalam surat panggilan pertama, sertakan klausul larangan keras (*restraining notice*) untuk menghubungi, mendekati, atau mengintimidasi pelapor maupun saksi, baik secara langsung maupun via media sosial. Pelanggaran terhadap klausul ini otomatis memperberat sanksi akhir.`;
  }

  // 8. General Dynamic Contextual Answer
  return `Halo tim Satgas PPKS, menanggapi pertanyaan Anda terkait kasus **${caseId}** (${category}):

Berdasarkan tinjauan data laporan (Tingkat Urgensi: **${riskLevel}**, Skor: **${caseData.urgencyScore}/100**, Bukti: **${evidenceCount} berkas**):

1. **Analisis Terhadap Pertanyaan Anda:**
   Mengenai hal yang Anda konsultasikan: *" ${question} "*
   Satgas disarankan untuk selalu mengedepankan prinsip kehati-hatian (*duty of care*), memprioritaskan keselamatan fisik dan psikologis korban di lingkungan ${targetFaculty || 'kampus'}, serta mendokumentasikan setiap temuan dalam Berita Acara Pemeriksaan resmi.

2. **Rekomendasi Tindakan Satgas:**
   - Lakukan verifikasi kronologis secara tertutup dan hindari segala potensi konfrontasi langsung dengan terlapor.
   - Pastikan rantai keabsahan bukti digital (${evidenceCount} berkas) tetap terjaga dengan validasi hash SHA-256.
   - Berikan pendampingan psikologis awal (PFA) kepada pihak pelapor jika terindikasi mengalami kecemasan atau trauma.

3. **Langkah Lanjutan:**
   Apakah Anda ingin Ara membantu membuatkan **draf surat panggilan klarifikasi**, **analisis pasal regulasi Permendikbud**, atau **format Berita Acara Pemeriksaan (BAP)** untuk kasus ini?`;
}

// ─── Gemini API Multi-turn Caller ───────────────────────────────────────────

async function callGeminiAdvisorAPI(
  caseData: CaseContextData,
  mode: 'initial_plan' | 'chat',
  question?: string,
  history: { role: 'user' | 'model'; text: string }[] = []
): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY tidak dikonfigurasi.');
  }

  const systemInstruction = `Kamu adalah Ara, AI Satgas Advisor resmi untuk penanganan kasus di platform RuangAman. Kamu bertindak sebagai asisten investigasi, analisis hukum kampus, dan penasihat strategis bagi tim Satgas PPKS (Pencegahan dan Penanganan Kekerasan Seksual).

DATA KASUS AKTIF YANG SEDANG DITANGANI:
- ID Kasus: ${caseData.caseId}
- Kategori Pelanggaran: ${caseData.category}
- Kronologi Kejadian: "${caseData.chronology}"
- Tingkat Risiko: ${caseData.riskLevel} (Skor Urgensi: ${caseData.urgencyScore}/100)
- Fakultas / Unit Terkait: ${caseData.targetFaculty || 'Lingkup Kampus Umum'}
- Tanggal Diterima: ${caseData.receivedAt}
- Status Penanganan: ${caseData.status}
- Ringkasan Bukti Digital: ${caseData.evidenceSummary || 'Tidak ada catatan bukti manipulasi'} (Total: ${caseData.evidenceCount || 0} berkas)

PANDUAN & ATURAN RESPON:
1. IDENTITAS & NADA BICARA:
   - Kamu adalah Ara versi Satgas Advisor: cerdas, objektif, solutif, empatik terhadap korban, tegas terhadap pelanggaran norma kampus, dan berwawasan regulasi perguruan tinggi yang mendalam.
   - Nada bicara: profesional, suportif, berwibawa, dan terstruktur.

2. JAWAB LANGSUNG PERTANYAAN ADMIN:
   - Jawablah SECARA SPESIFIK dan MENDALAM sesuai dengan apa yang ditanyakan admin. DILARANG KERAS memberikan jawaban generik atau шаблон statis.
   - Jika admin menanyakan hal spesifik (misal: bagaimana menangani dosen pembimbing yang terlapor, apakah bukti chat WhatsApp cukup kuat, bagaimana prosedur visum, bagaimana draf surat panggilan), jawab langsung esensi pertanyaan tersebut dengan mengaitkan fakta kasus ${caseData.caseId}.
   - Jika admin meminta saran penanganan menyeluruh (mode initial_plan), berikan rencana strategis komprehensif 4 pilar (Evaluasi Fakta, Rencana Aksi Bertahap, Pemulihan Korban, dan Rekomendasi Sanksi).
   - Jika admin meminta draf surat atau dokumen, berikan draf lengkap siap pakai dalam format Markdown code block.

3. KEPATUHAN REGULASI:
   - Selalu rujuk pada Permendikbudristek No. 30 Tahun 2021 dan UU TPKS No. 12 Tahun 2022.
   - Ingatkan bahwa mediasi tatap muka dilarang untuk kekerasan seksual atau relasi kuasa.

4. FORMATTING:
   - Gunakan format Markdown yang rapi (headings ###, bullet points, bold untuk istilah penting).
   - Pastikan jawaban lengkap dan tuntas, tidak terpotong di tengah jalan.`;

  // Model candidate priority: gemini-3.5-flash-lite, gemini-3.8-flash, gemini-flash-latest
  const candidateModels = [
    'gemini-3.5-flash-lite',
    'gemini-3.8-flash',
    'gemini-flash-latest',
  ];

  let lastError: Error | null = null;

  for (const model of candidateModels) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      let promptText = '';
      if (mode === 'initial_plan') {
        promptText = `Mohon buatkan Saran Rekomendasi Rencana Strategis Penanganan Kasus yang LENGKAP, TUNTAS, dan TERSTRUKTUR untuk kasus register ${caseData.caseId} (${caseData.category}) dengan tingkat risiko ${caseData.riskLevel} (Skor: ${caseData.urgencyScore}/100).
Rincikan secara profesional:
1. Evaluasi Objektif & Analisis Fakta Kasus (berdasarkan kronologi dan status forensik bukti).
2. Rencana Aksi Bertahap Satgas PPKS (Tahap 1: 0-24 Jam Perlindungan Korban, Tahap 2: 1-3 Hari Verifikasi & Wawancara Terpisah, Tahap 3: 3-7 Hari Pemanggilan Terlapor & BAP).
3. Protokol Perlindungan & Pemulihan Korban (Layanan Konseling Psikologis/PFA, Perlindungan Anti-Intimidasi & Retaliasi, serta Dispensasi Akademik).
4. Rekomendasi Sanksi Administratif Sesuai Regulasi Kampus (Permendikbudristek No. 30/2021 & UU TPKS No. 12/2022).
PENTING: Tuliskan secara tuntas dan rapi dengan format markdown yang jelas.`;
      } else {
        promptText = `${question || 'Bagaimana saran langkah penanganan terbaik untuk kasus ini?'}\n(Instruksi Ara: Jawablah langsung, cerdas, solutif, dan spesifik sesuai pertanyaan di atas dengan mempertimbangkan data kasus ${caseData.caseId}).`;
      }

      const contents = [
        ...history.map((msg) => ({
          role: msg.role === 'model' ? ('model' as const) : ('user' as const),
          parts: [{ text: msg.text }],
        })),
        {
          role: 'user' as const,
          parts: [{ text: promptText }],
        },
      ];

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents,
          systemInstruction: {
            parts: [{ text: systemInstruction }],
          },
          generationConfig: {
            temperature: 0.35,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2500,
          },
        }),
        signal: AbortSignal.timeout(15000), // 15 detik timeout
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Gemini API Error [${res.status} on ${model}]: ${errText}`);
      }

      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text || text.trim().length === 0) {
        throw new Error('Gemini API mengembalikan respons kosong.');
      }

      return text.trim();
    } catch (err: unknown) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.warn(`[Case Advisor AI] Model ${model} terkendala:`, lastError.message);
    }
  }

  throw lastError || new Error('Semua model Gemini gagal diakses.');
}

// ─── POST Handler ───────────────────────────────────────────────────────────

export async function POST(req: NextRequest) {
  try {
    const body: CaseAdvisorRequestBody = await req.json();
    const { caseData, mode, question, history = [] } = body;

    if (!caseData || !caseData.caseId) {
      return NextResponse.json(
        { error: 'Data kasus (caseData) wajib disertakan.' },
        { status: 400 }
      );
    }

    let responseText = '';
    let usedFallback = false;

    // Coba via Gemini API terlebih dahulu
    try {
      responseText = await callGeminiAdvisorAPI(caseData, mode, question, history);
    } catch (apiErr) {
      console.warn('[Case Advisor AI] Menggunakan fallback cerdas AI Case Advisor:', apiErr);
      responseText = generateFallbackResponse(caseData, mode, question);
      usedFallback = true;
    }

    return NextResponse.json({
      success: true,
      data: {
        text: responseText,
        caseId: caseData.caseId,
        timestamp: new Date().toISOString(),
        _respondedBy: usedFallback ? 'fallback' : 'gemini',
      },
    });
  } catch (err: unknown) {
    console.error('Error pada /api/admin/case-ai-advisor:', err);
    return NextResponse.json(
      { error: 'Terjadi kesalahan pemrosesan saran AI penanganan kasus.' },
      { status: 500 }
    );
  }
}
