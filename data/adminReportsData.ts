import type { Report } from '@/lib/types';

// ─── Admin Reports Data (Data Laporan & Forensik Bukti Admin/Track) ───────────

export const MOCK_REPORTS: Report[] = [
  {
    caseId: 'CASE-2026-00001',
    anonymousToken: 'AK-2026-X9K2P',
    category: 'Perundungan Verbal & Intimidasi',
    chronology:
      'Saya mengalami perundungan verbal dan intimidasi psikologis di lingkungan perpustakaan kampus oleh oknum anggota pengurus organisasi. Pelaku mengancam akan menyebarkan rumor tidak benar jika saya tidak menyerahkan data proyek penelitian kelompok.',
    incidentTime: '2 September 2026, Pukul 14.15 WIB',
    involvedParties: 'Pengurus organisasi mahasiswa (2 orang)',
    targetFaculty: 'Fakultas Teknik',
    evidences: [
      {
        evidenceId: 'EVD-1001',
        fileName: 'bukti_rekaman_percakapan_dan_chat.png',
        fileType: 'image/png',
        fileSize: 450120,
        sha256: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
        exifStripped: true,
        forensicStatus: 'Original',
        forensicDetails: [
          'SHA-256 Checksum: Valid & Utuh (Bebas Modifikasi Bytes)',
          'EXIF GPS Metadata: Stripped Demi Privasi Pelapor',
          'Format Berkas: Native Capture PNG Image',
        ],
        reporterNote: 'Tangkapan layar berisi ancaman intimidasi dari grup WhatsApp angkatan.',
        verificationStatus: 'Terverifikasi Valid',
        verificationNote: 'Timestamp berkas konsisten dengan bukti obrolan saksi pendukung.',
      },
    ],
    messages: [
      {
        id: 'MSG-101',
        sender: 'Pelapor',
        text: 'Halo Tim Satgas PPKS, saya sudah melampirkan bukti tangkapan layar chat intimidasi. Mohon jaminan privasi identitas saya.',
        timestamp: '2026-09-02T06:30:00.000Z',
      },
      {
        id: 'MSG-102',
        sender: 'Satgas',
        text: 'Terima kasih atas laporan Anda. Identitas Anda 100% terenkripsi dan terlindungi anonimitasnya. Berkas bukti telah diverifikasi valid.',
        timestamp: '2026-09-02T07:15:00.000Z',
      },
    ],
    auditLogs: [
      {
        id: 'AL-101',
        action: 'Laporan diterima oleh sistem terenkripsi Zero-Knowledge',
        actor: 'Sistem',
        timestamp: '2026-09-02T06:00:00.000Z',
      },
      {
        id: 'AL-102',
        action: 'Satgas memverifikasi berkas "bukti_rekaman_percakapan_dan_chat.png": Status Keaslian -> Terverifikasi Valid',
        actor: 'Satgas',
        timestamp: '2026-09-02T07:20:00.000Z',
      },
      {
        id: 'AL-103',
        action: 'Status diubah: "Laporan Diterima" → "Diproses"',
        actor: 'Satgas',
        timestamp: '2026-09-02T07:30:00.000Z',
      },
    ],
    receivedAt: '2026-09-02T06:00:00.000Z',
    status: 'Diproses',
    isAnonymous: true,
  },
  {
    caseId: 'CASE-2026-00002',
    anonymousToken: 'AK-2026-B4M1L',
    category: 'Pelecehan Seksual Daring (Cyber Harassment)',
    chronology:
      'Menerima pesan tidak pantas dan foto tidak etis secara berulang dari oknum akun anonim melalui media sosial mahasiswa, disertai pemaksaan untuk bertemu di luar jam perkuliahan.',
    incidentTime: '31 Agustus 2026, Pukul 22.30 WIB',
    involvedParties: 'Akun media sosial anonim',
    targetFaculty: 'Fakultas MIPA',
    evidences: [
      {
        evidenceId: 'EVD-2001',
        fileName: 'tangkapan_layar_pesan_daring.jpg',
        fileType: 'image/jpeg',
        fileSize: 312000,
        sha256: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
        exifStripped: true,
        forensicStatus: 'Original',
        forensicDetails: [
          'SHA-256 Hash Checksum: Valid',
          'Analisis EXIF: Stripped GPS Data',
          'Integritas Berkas: Native Capture Format',
        ],
        reporterNote: 'Bukti screenshot pesan tidak pantas berulang.',
        verificationStatus: 'Belum Diverifikasi',
      },
    ],
    messages: [
      {
        id: 'MSG-201',
        sender: 'Pelapor',
        text: 'Mohon bantuan Satgas untuk menindaklanjuti akun yang terus mengirim pesan tidak pantas ini.',
        timestamp: '2026-09-01T10:00:00.000Z',
      },
    ],
    auditLogs: [
      {
        id: 'AL-201',
        action: 'Laporan diterima oleh sistem terenkripsi',
        actor: 'Sistem',
        timestamp: '2026-09-01T09:30:00.000Z',
      },
    ],
    receivedAt: '2026-09-01T09:30:00.000Z',
    status: 'Laporan Diterima',
    isAnonymous: true,
  },
  {
    caseId: 'CASE-2026-00003',
    anonymousToken: 'AK-2026-T7Q9X',
    category: 'Intimidasi Akademik & Penyalahgunaan Wewenang',
    chronology:
      'Indikasi pemaksaan pengerjaan tugas di luar silabus praktikum dengan ancaman penurunan nilai akhir mata kuliah jika permintaan tidak dipenuhi.',
    incidentTime: '28 Agustus 2026',
    involvedParties: 'Oknum pengajar / asisten praktikum',
    targetFaculty: 'Fakultas Ekonomi',
    evidences: [],
    messages: [
      {
        id: 'MSG-301',
        sender: 'Satgas',
        text: 'Kasus ini telah ditindaklanjuti dan diselesaikan secara kekeluargaan & administratif bersama Komite Etik Dekanat.',
        timestamp: '2026-08-30T16:00:00.000Z',
      },
    ],
    auditLogs: [
      {
        id: 'AL-301',
        action: 'Laporan diterima oleh sistem',
        actor: 'Sistem',
        timestamp: '2026-08-30T15:00:00.000Z',
      },
      {
        id: 'AL-302',
        action: 'Status diubah: "Mediasi & Konseling" → "Selesai"',
        actor: 'Satgas',
        timestamp: '2026-08-30T16:00:00.000Z',
      },
    ],
    receivedAt: '2026-08-30T15:00:00.000Z',
    status: 'Selesai',
    isAnonymous: true,
  },
  {
    caseId: 'CASE-2026-00004',
    anonymousToken: 'AK-2026-M8K4W',
    category: 'Diskriminasi & Perlakuan Tidak Adil',
    chronology:
      'Pengabaian dan perlakuan diskriminatif terhadap fasilitas aksesibilitas bagi mahasiswa penyandang disabilitas saat kegiatan ujian laboratorium.',
    incidentTime: '3 September 2026, Pukul 10.00 WIB',
    involvedParties: 'Pengawas Ujian Laboratorium',
    targetFaculty: 'Fakultas Ilmu Budaya',
    evidences: [],
    messages: [],
    auditLogs: [
      {
        id: 'AL-401',
        action: 'Laporan diterima oleh sistem',
        actor: 'Sistem',
        timestamp: '2026-09-03T11:00:00.000Z',
      },
    ],
    receivedAt: '2026-09-03T11:00:00.000Z',
    status: 'Diverifikasi',
    isAnonymous: true,
  },
  {
    caseId: 'CASE-2026-00005',
    anonymousToken: 'AK-2026-F9X2M',
    category: 'Pemalsuan Bukti Digital & AI Deepfake',
    chronology:
      'Pelaporan dugaan manipulasi foto dan penyebaran konten buatan AI (Deepfake / Synthesized Image) yang disebarkan untuk merusak reputasi mahasiswa di grup media sosial kampus.',
    incidentTime: '4 September 2026, Pukul 19.00 WIB',
    involvedParties: 'Akun bot / penyebar konten rekayasa AI',
    targetFaculty: 'Fakultas Ilmu Komputer',
    evidences: [
      {
        evidenceId: 'EVD-5001',
        fileName: 'tangkapan_layar_foto_rekayasa_ai.png',
        fileType: 'image/png',
        fileSize: 1240500,
        sha256: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
        exifStripped: true,
        forensicStatus: 'Manipulated',
        forensicDetails: [
          '⚠️ Indikasi Generatif AI: Terdeteksi artefak Midjourney/DALL-E v3 (98.4% Likelihood)',
          '⚠️ Manipulasi Pixel Grid: Anomali frekuensi spasial tinggi & distorsi pencahayaan wajah',
          '⚠️ Metadata Anomali: CWT Generator Signature ditemukan pada header file biner',
        ],
        reporterNote: 'Berkas bukti diserahkan pelapor untuk memverifikasi pencemaran nama baik berbasis foto AI Deepfake.',
        verificationStatus: 'Tervalidasi Palsu / Ditolak',
        verificationNote: 'Hasil scan forensik biner mengonfirmasi foto merupakan hasil sintesis AI (Deepfake) dan ditandai sebagai bukti tidak valid.',
      },
    ],
    messages: [
      {
        id: 'MSG-501',
        sender: 'Pelapor',
        text: 'Mohon Satgas memeriksa apakah foto yang beredar ini asli atau rekayasa AI.',
        timestamp: '2026-09-04T12:00:00.000Z',
      },
      {
        id: 'MSG-502',
        sender: 'Satgas',
        text: 'Hasil verifikasi forensik biner mengonfirmasi foto tersebut 98.4% buatan AI (Deepfake) dan bukan gambar asli. Laporan pemalsuan ini kami teruskan ke Komite Etik.',
        timestamp: '2026-09-04T12:30:00.000Z',
      },
    ],
    auditLogs: [
      {
        id: 'AL-501',
        action: 'Laporan diterima oleh sistem terenkripsi',
        actor: 'Sistem',
        timestamp: '2026-09-04T11:50:00.000Z',
      },
      {
        id: 'AL-502',
        action: 'Satgas memverifikasi berkas "tangkapan_layar_foto_rekayasa_ai.png": Status Keaslian -> Tervalidasi Palsu / Ditolak (Sintesis AI Detected)',
        actor: 'Satgas',
        timestamp: '2026-09-04T12:25:00.000Z',
      },
      {
        id: 'AL-503',
        action: 'Status diubah: "Diverifikasi" → "Eskalasi ke Komite Etik"',
        actor: 'Satgas',
        timestamp: '2026-09-04T12:35:00.000Z',
      },
    ],
    receivedAt: '2026-09-04T11:50:00.000Z',
    status: 'Eskalasi ke Komite Etik',
    isAnonymous: true,
  },
  {
    caseId: 'CASE-2026-00006',
    anonymousToken: 'AK-2026-P3K7V',
    category: 'Stalking & Penguntitan di Area Kampus',
    chronology:
      'Penguntitan berulang di area parkir gedung perkuliahan dan lorong fakultas oleh oknum yang tidak dikenal, disertai pengiriman foto-foto keberadaan pelapor secara tersembunyi.',
    incidentTime: '5 September 2026, Pukul 17.30 WIB',
    involvedParties: 'Oknum tidak dikenal (Stalker)',
    targetFaculty: 'Fakultas Hukum',
    evidences: [
      {
        evidenceId: 'EVD-6001',
        fileName: 'tangkapan_layar_pesan_stalking.png',
        fileType: 'image/png',
        fileSize: 512000,
        sha256: 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0',
        exifStripped: true,
        forensicStatus: 'Original',
        forensicDetails: [
          'SHA-256 Checksum: Valid & Utuh',
          'EXIF GPS Metadata: Stripped Demi Keamanan',
        ],
        reporterNote: 'Tangkapan layar berisi pesan penguntitan.',
        verificationStatus: 'Terverifikasi Valid',
        verificationNote: 'Laporan tervalidasi dan penambahan pengawasan satpam di titik lokasi parkir.',
      },
    ],
    messages: [
      {
        id: 'MSG-601',
        sender: 'Pelapor',
        text: 'Mohon penambahan pengamanan di sekitar gedung fakultas hukum.',
        timestamp: '2026-09-05T11:00:00.000Z',
      },
    ],
    auditLogs: [
      {
        id: 'AL-601',
        action: 'Laporan diterima oleh sistem terenkripsi',
        actor: 'Sistem',
        timestamp: '2026-09-05T10:30:00.000Z',
      },
    ],
    receivedAt: '2026-09-05T10:30:00.000Z',
    status: 'Diproses',
    isAnonymous: true,
  },
  {
    caseId: 'CASE-2026-00007',
    anonymousToken: 'AK-2026-R8N4L',
    category: 'Pelecehan Fisik di Ruang Laboratorium',
    chronology:
      'Tindakan kontak fisik yang tidak diinginkan dan ucapan bernada pelecehan saat kegiatan praktikum malam di Laboratorium Komputer.',
    incidentTime: '6 September 2026, Pukul 19.45 WIB',
    involvedParties: 'Asisten Laboratorium',
    targetFaculty: 'Fakultas Ilmu Komputer',
    evidences: [],
    messages: [],
    auditLogs: [
      {
        id: 'AL-701',
        action: 'Laporan diterima oleh sistem terenkripsi',
        actor: 'Sistem',
        timestamp: '2026-09-06T13:00:00.000Z',
      },
      {
        id: 'AL-702',
        action: 'Status diubah: "Laporan Diterima" → "Diverifikasi"',
        actor: 'Satgas',
        timestamp: '2026-09-06T14:00:00.000Z',
      },
    ],
    receivedAt: '2026-09-06T13:00:00.000Z',
    status: 'Diverifikasi',
    isAnonymous: true,
  },
  {
    caseId: 'CASE-2026-00008',
    anonymousToken: 'AK-2026-Z2W9P',
    category: 'Pengancaman & Pemerasan Dokumen Pribadi',
    chronology:
      'Pemerasan dengan ancaman penyebaran dokumen pribadi dan rekaman jika tidak mentransfer sejumlah uang ke rekening tertentu.',
    incidentTime: '7 September 2026, Pukul 21.00 WIB',
    involvedParties: 'Oknum akun anonim',
    targetFaculty: 'Fakultas Kedokteran',
    evidences: [
      {
        evidenceId: 'EVD-8001',
        fileName: 'bukti_transfer_dan_ancaman.png',
        fileType: 'image/png',
        fileSize: 680000,
        sha256: 'f8e7d6c5b4a392817019283746554433221100ffeeddccbbaa99887766554433',
        exifStripped: true,
        forensicStatus: 'Original',
        forensicDetails: [
          'SHA-256 Checksum: Valid & Utuh',
          'Analisis Forensik: Bukti percakapan asli tanpa rekayasa AI',
        ],
        reporterNote: 'Bukti obrolan pemerasan dan nomor rekening pelaku.',
        verificationStatus: 'Terverifikasi Valid',
        verificationNote: 'Diteruskan ke tim hukum dan cyber kepolisian setempat.',
      },
    ],
    messages: [
      {
        id: 'MSG-801',
        sender: 'Satgas',
        text: 'Tim Satgas PPKS telah mengoordinasikan kasus ini dengan pihak kepolisian cyber.',
        timestamp: '2026-09-08T08:00:00.000Z',
      },
    ],
    auditLogs: [
      {
        id: 'AL-801',
        action: 'Laporan diterima oleh sistem terenkripsi',
        actor: 'Sistem',
        timestamp: '2026-09-07T15:00:00.000Z',
      },
      {
        id: 'AL-802',
        action: 'Status diubah: "Diverifikasi" → "Mediasi & Konseling"',
        actor: 'Satgas',
        timestamp: '2026-09-08T08:05:00.000Z',
      },
    ],
    receivedAt: '2026-09-07T15:00:00.000Z',
    status: 'Mediasi & Konseling',
    isAnonymous: true,
  },
];

