import { NextResponse } from 'next/server';

export async function GET() {
  const openApiSpec = {
    openapi: '3.0.3',
    info: {
      title: 'RuangAman Campus Safety & Interoperability API',
      version: '1.0.0',
      description:
        'Spesifikasi API resmi RuangAman untuk interoperabilitas ekosistem kampus terinterkoneksi. Dirancang untuk pertukaran data yang aman, efisien, dan berbasis arsitektur Zero-Knowledge & Multimodal AI.',
      contact: {
        name: 'Tim Pengembang RuangAman',
        email: 'satgas-ppks@kampus.ac.id',
      },
      license: {
        name: 'MIT License',
      },
    },
    servers: [
      {
        url: '/',
        description: 'Server Utama RuangAman',
      },
    ],
    tags: [
      { name: 'Open Data Kampus', description: 'Endpoint interoperabilitas agregat untuk ekosistem universitas (CC0-1.0)' },
      { name: 'Pelaporan Anonim', description: 'Pengiriman dan pelacakan laporan korban berbasis Zero-Knowledge' },
      { name: 'AI & Forensik Digital', description: 'Analisis cerdas multimodal (Triage, Deepfake Detection, OCR)' },
      { name: 'Kedaruratan (SOS)', description: 'Sinyal darurat GPS real-time ke posko keamanan' },
      { name: 'Administrasi Satgas PPKS', description: 'Endpoint terotentikasi untuk manajemen investigasi kasus' },
    ],
    paths: {
      '/api/v1/health': {
        get: {
          tags: ['Open Data Kampus'],
          summary: 'Status Kesehatan & Kesiapan Sistem',
          description: 'Memeriksa ketersediaan database PostgreSQL, model AI, dan gateway Telegram.',
          responses: {
            '200': {
              description: 'Sistem beroperasi normal',
            },
          },
        },
      },
      '/api/v1/open-data/statistics': {
        get: {
          tags: ['Open Data Kampus'],
          summary: 'Agregat Statistik Kasus Kampus (Zero-Knowledge)',
          description: 'Menyediakan data statistik anonim teragregasi tanpa data pribadi (PII) untuk keperluan akuntabilitas publik dan riset.',
          responses: {
            '200': {
              description: 'Data statistik agregat berhasil diambil',
            },
          },
        },
      },
      '/api/v1/open-data/safety-index': {
        get: {
          tags: ['Open Data Kampus'],
          summary: 'Indeks Kerawanan & Keamanan Civitas Akademika',
          description: 'Zonasi risiko per fakultas/wilayah kampus untuk langkah mitigasi proaktif.',
          responses: {
            '200': {
              description: 'Indeks zonasi berhasil diambil',
            },
          },
        },
      },
      '/api/report': {
        post: {
          tags: ['Pelaporan Anonim'],
          summary: 'Kirim Laporan Pengaduan Baru',
          description: 'Menerima laporan terenkripsi anonim, menyimpannya di basis data relasional, dan menyiarkan notifikasi ke Satgas.',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['anonymousToken', 'category', 'chronology'],
                  properties: {
                    caseId: { type: 'string', example: 'CASE-2026-00001' },
                    anonymousToken: { type: 'string', example: 'AK-2026-X7K92' },
                    category: { type: 'string', example: 'Pelecehan Seksual Daring (KSBE)' },
                    chronology: { type: 'string', example: 'Uraian kejadian secara konkret...' },
                    incidentTime: { type: 'string', example: '24 Oktober 2026, 14:00 WIB' },
                    targetFaculty: { type: 'string', example: 'Fakultas Teknik' },
                    involvedParties: { type: 'string', example: 'Oknum mahasiswa senior' },
                  },
                },
              },
            },
          },
          responses: {
            '200': { description: 'Laporan berhasil dicatat di sistem' },
            '400': { description: 'Parameter wajib belum terpenuhi' },
            '429': { description: 'Batas rate-limit tercapai' },
          },
        },
      },
      '/api/track/{token}': {
        get: {
          tags: ['Pelaporan Anonim'],
          summary: 'Lacak Status Kasus Berbasis Token Kriptografis',
          parameters: [
            {
              name: 'token',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'Token anonim pelapor (misal: AK-2026-XXXXX) atau Case ID',
            },
          ],
          responses: {
            '200': { description: 'Data status dan linimasa kasus ditemukan' },
            '404': { description: 'Laporan tidak ditemukan' },
          },
        },
      },
      '/api/ai-triage': {
        post: {
          tags: ['AI & Forensik Digital'],
          summary: 'AI Smart Triage & Klasifikasi Risiko Urgensi',
          description: 'Menganalisis teks kronologi secara objektif, menentukan skor risiko (1-100), tingkat urgensi, serta rujukan pasal hukum.',
          responses: {
            '200': { description: 'Hasil triase risiko berhasil dianalisis' },
          },
        },
      },
      '/api/evidence-analysis': {
        post: {
          tags: ['AI & Forensik Digital'],
          summary: 'Pemeriksaan Forensik Bukti Multimodal AI',
          description: 'Analisis visual OCR, keaslian dokumen, verifikasi audio/video, dan deteksi manipulasi Deepfake.',
          responses: {
            '200': { description: 'Hasil analisis forensik berkas bukti' },
          },
        },
      },
      '/api/sos-alert': {
        post: {
          tags: ['Kedaruratan (SOS)'],
          summary: 'Kirim Panggilan Darurat SOS Berbasis GPS',
          description: 'Menyiarkan koordinat lokasi darurat secara real-time ke posko keamanan kampus.',
          responses: {
            '200': { description: 'Sinyal darurat disiarkan' },
          },
        },
      },
    },
  };

  return NextResponse.json(openApiSpec, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'public, s-maxage=300',
    },
  });
}
