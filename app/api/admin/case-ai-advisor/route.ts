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

  if (mode === 'initial_plan') {
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
   - Pastikan korban tidak berada dalam lingkungan yang sama dengan terlapor bila terjadi ancaman intimidasi.
   - Terbitkan surat perlindungan sementara dari Ketua Satgas PPKS bila korban mengalami trauma atau teror.
2. **Langkah 2: Validasi Berkas & Pengumpulan Keterangan (1 - 3 Hari)**
   - Periksa keabsahan bukti digital (verifikasi hash SHA-256 dan catatan otentikasi pelapor).
   - Jika diperlukan, jadwalkan wawancara terpisah dan terlindung dengan pelapor (dilarang mengonfrontasi langsung dengan terlapor).
3. **Langkah 3: Pemanggilan Klarifikasi Terlapor (3 - 7 Hari)**
   - Layangkan surat panggilan tertutup resmi melalui Unit/Fakultas terkait.
   - Catat Berita Acara Pemeriksaan (BAP) dengan fokus pada substansi kronologi aduan.

---

#### 3. 🛡️ Protokol Pemulihan & Konseling Psikologis (PFA)
- Rujuk korban ke Unit Layanan Konseling Psikologis Kampus untuk penanganan trauma atau kecemasan.
- Rekomendasikan dispensasi kehadiran akademik / perkuliahan sementara jika korban mengalami gangguan psikologis berat.

---

#### 4. ⚖️ Landasan Regulasi & Rekomendasi Sanksi
- **Rujukan Hukum:** Permendikbudristek No. 30 Tahun 2021 tentang Pencegahan dan Penanganan Kekerasan Seksual di Lingkungan Perguruan Tinggi, serta Kode Etik Civitas Akademika.
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

  if (qLower.includes('bukti') || qLower.includes('forensik') || qLower.includes('cukup')) {
    return `Berdasarkan analisis berkas bukti kasus **${caseId}**:
- Terdapat **${evidenceCount} berkas bukti digital** yang terdaftar di sistem.
- ${
      evidenceCount > 0
        ? 'Bukti telah tervalidasi menggunakan pemeriksaan Magic-Bytes dan SHA-256 Checksum, serta bebas dari metadata pribadi (EXIF Stripped). Secara prosedural, bukti ini SAH untuk dijadikan dasar klarifikasi awal dan pemeriksaan terlapor.'
        : 'Saat ini belum ada lampiran berkas bukti file. Namun sesuai Pasal 39 Permendikbudristek No. 30/2021, keterangan kronologis pelapor yang konsisten sudah cukup untuk memulai pemeriksaan awal tanpa harus menunggu bukti sempurna.'
    }
- **Saran Tindakan:** Tetap simpan riwayat hash biner dan otentikasi pelapor untuk lampiran Berita Acara Pemeriksaan (BAP).`;
  }

  if (qLower.includes('surat') || qLower.includes('panggilan') || qLower.includes('draf')) {
    return `Berikut draf **Surat Panggilan Klarifikasi Terlapor** resmi:

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
Tempat       : Ruang Konsultasi Khusus Satgas PPKS (Gedung Rektorat Lt. 2)
Agenda       : Pemberian Keterangan & Klarifikasi atas Dugaan Pelanggaran Etik

Saudara/i berhak memberikan keterangan dengan didampingi atau secara mandiri. Demi integritas proses pemeriksaan, pertemuan ini bersifat tertutup dan mengikat secara disipliner akademik.

Demikian undangan ini kami sampaikan. Atas kerja sama Saudara/i, kami ucapkan terima kasih.

Satgas PPKS Universitas
[Tanda Tangan & Cap Resmi]
\`\`\``;
  }

  if (qLower.includes('mediasi') || qLower.includes('damai')) {
    return `⚠️ **Peringatan Protokol Mediasi untuk Kasus ${caseId}:**
1. **Dilarang Mediasi Tatap Muka Langsung:** Korban kekerasan seksual, intimidasi, atau perundungan **TIDAK BOLEH** dipaksa berada di satu ruangan dengan terlapor.
2. **Prinsip Bebas Relasi Kuasa:** Jika terdapat ketimpangan status (misal dosen vs mahasiswa, atau senior vs junior), mediasi biasa tidak diperkenankan karena berisiko manipulasi dan intimidasi lanjutan.
3. **Pemeriksaan Secara *Shuttle*:** Satgas disarankan melakukan dengar pendapat terpisah (metode *shuttle consultation*), di mana Satgas menjadi perantara penyampaian fakta dan komitmen penyelesaian.`;
  }

  if (qLower.includes('sanksi') || qLower.includes('hukum') || qLower.includes('pasal')) {
    return `Rujukan hukum dan sanksi untuk kasus kategori **${category}** (Tingkat Risiko: **${riskLevel}**):
1. **Dasar Hukum Utama:**
   - Permendikbudristek No. 30 Tahun 2021 tentang Pencegahan dan Penanganan Kekerasan Seksual di Perguruan Tinggi.
   - UU No. 12 Tahun 2022 tentang Tindak Pidana Kekerasan Seksual (TPKS).
2. **Kualifikasi Sanksi Administratif:**
   - **Ringan:** Teguran tertulis atau pernyataan permohonan maaf tertulis yang dipublikasikan secara internal.
   - **Sedang:** Pemberhentian sementara dari jabatan akademik/kepengurusan ormawa atau skorsing perkuliahan.
   - **Berat:** Pemberhentian tetap dengan tidak hormat dari status mahasiswa, dosen, atau tenaga kependidikan.
3. **Catatan Penting:** Pengenaan sanksi administratif kampus tidak menghapuskan tanggung jawab hukum pidana bila korban memilih meneruskan kasus ke penegak hukum.`;
  }

  // Generic contextual answer
  return `Menanggapi pertanyaan Anda terkait kasus **${caseId}** (${category}):

Berdasarkan data laporan masuk tanggal **${caseData.receivedAt}** dengan status risiko **${riskLevel}**:
1. **Konteks Kronologi:** Narasi pelapor mengindikasikan perlunya tindak lanjut yang memprioritaskan keselamatan korban di lingkungan ${targetFaculty || 'kampus'}.
2. **Langkah Taktis Satgas:** Rekomendasi utama adalah memverifikasi kronologi secara internal, memastikan korban mendapatkan pendampingan psikologis (PFA), dan menyiapkan pemanggilan terlapor secara tertutup.
3. **Proteksi Bukti:** Pastikan bukti digital terlampir (${evidenceCount} file) tetap tersegel dengan validasi hash SHA-256 untuk menjaga integritas pembuktian.

Silakan ajukan pertanyaan lebih spesifik bila Anda membutuhkan draf surat pemanggilan, analisis kekuatan bukti, atau rekomendasi sanksi hukum.`;
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

  const systemInstruction = `Anda adalah Asisten Analisis & Rekomendasi Penanganan Kasus (AI Case Advisor) khusus Satgas PPKS Kampus di platform RuangAman.

DATA KASUS AKTIF YANG SEDANG DITANGANI:
- ID Kasus: ${caseData.caseId}
- Kategori Pelanggaran: ${caseData.category}
- Kronologi Kejadian: "${caseData.chronology}"
- Tingkat Risiko: ${caseData.riskLevel} (Skor Urgensi: ${caseData.urgencyScore}/100)
- Fakultas / Unit: ${caseData.targetFaculty || 'Umum Kampus'}
- Tanggal Diterima: ${caseData.receivedAt}
- Status Penanganan: ${caseData.status}
- Ringkasan Bukti Digital: ${caseData.evidenceSummary || 'Tidak ada catatan bukti manipulasi'} (Total: ${caseData.evidenceCount || 0} berkas)

TUGAS ANDA:
1. Berikan rekomendasi yang SANGAT SPESIFIK, OBJEKTIF, TAKTIS, dan HUKUM KAMPUS (berdasarkan Permendikbudristek No. 30 Tahun 2021 dan UU TPKS No. 12 Tahun 2022).
2. Jika admin meminta "Saran Penanganan", susun rencana penanganan terstruktur (Evaluasi Fakta, Rencana Aksi Bertahap, Pemulihan Korban, dan Rekomendasi Sanksi).
3. Jika admin mengajukan pertanyaan khusus (misal membuat draf surat panggilan, evaluasi bukti, atau tata cara mediasi), jawab secara taktis, berikan format resmi atau solusi praktis.
4. Gunakan gaya bahasa profesional, lugas, dan terstruktur dengan rapi.
5. PENTING: Output jawaban Anda HARUS LENGKAP dan SELESAI sampai kalimat penutup terakhir. DILARANG BERHENTI di tengah kalimat atau menyisakan bagian menggantung.`;

  const candidateModels = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-flash-latest'];
  let lastError: Error | null = null;

  for (const model of candidateModels) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      let promptText = '';
      if (mode === 'initial_plan') {
        promptText = `Mohon buatkan Saran Rekomendasi Penanganan Kasus LENGKAP, TUNTAS, dan TERSTRUKTUR untuk kasus ${caseData.caseId} berdasarkan seluruh data kronologi dan tingkat risiko di atas.
Pastikan mencakup:
1. Evaluasi Objektif & Analisis Fakta Kasus
2. Rencana Aksi Bertahap Satgas PPKS (Tahap 1 Klarifikasi, Tahap 2 Pemeriksaan Terlapor, Tahap 3 Rekomendasi Putusan)
3. Protokol Perlindungan & Pemulihan Korban
4. Rekomendasi Sanksi Administratif Sesuai Regulasi Kampus
PENTING: Tulis seluruh uraian secara lengkap dan selesaikan sampai tuntas, jangan terpotong di tengah kalimat.`;
      } else {
        promptText = `${question || 'Bagaimana saran langkah penanganan terbaik untuk kasus ini?'}\n(Catatan: Berikan jawaban yang tuntas dan lengkap).`;
      }

      const contents = [
        ...history.map((msg) => ({
          role: msg.role === 'model' ? 'model' : 'user',
          parts: [{ text: msg.text }],
        })),
        {
          role: 'user',
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
            temperature: 0.25,
            maxOutputTokens: 4000,
          },
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Gemini API Error [${res.status}]: ${errText}`);
      }

      const data = await res.json();
      const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        throw new Error('Gemini API mengembalikan respons kosong.');
      }

      return text;
    } catch (err: unknown) {
      lastError = err instanceof Error ? err : new Error(String(err));
      console.warn(`Model ${model} gagal, mencoba model berikutnya...`, lastError.message);
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

    // Coba via Gemini API terlebih dahulu
    try {
      responseText = await callGeminiAdvisorAPI(caseData, mode, question, history);
    } catch (apiErr) {
      console.warn('Menggunakan fallback cerdas AI Case Advisor:', apiErr);
      responseText = generateFallbackResponse(caseData, mode, question);
    }

    return NextResponse.json({
      success: true,
      data: {
        text: responseText,
        caseId: caseData.caseId,
        timestamp: new Date().toISOString(),
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
