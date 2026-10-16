import React from 'react';
import {
  MessageSquareWarning,
  UserX,
  ShieldAlert,
  Scale,
  Award,
  Lock,
  UserCheck,
} from 'lucide-react';
import { VIOLATIONS_CATALOG, type ViolationCatalogItem } from '@/data/violationsData';
export { VIOLATIONS_CATALOG, type ViolationCatalogItem };

export interface ArticleContentSection {
  heading: string;
  body: string;
  points?: string[];
}

export interface Article {
  id: string;
  number: string;
  title: string;
  category: string;
  readTime: string;
  date: string;
  author: string;
  excerpt: string;
  image: string;
  content: ArticleContentSection[];
  legalRef?: string;
}

export interface EduFaqItem {
  q: string;
  a: string;
}

export interface VictimRightItem {
  title: string;
  desc: string;
  icon: React.ReactNode;
}

// ─── 6 Detailed Articles Data ─────────────────────────────────────────────────

export const ARTICLES_DATA: Article[] = [
  {
    id: 'metadata-digital-forensics',
    number: '01',
    title: 'Panduan Lengkap Perlindungan Metadata & Forensik Digital Pelapor',
    category: 'Keamanan & Privasi',
    readTime: '6 min baca',
    date: '4 Sep 2026',
    author: 'Tim Forensik Kriptografi AmanKampus',
    image: '/images/1.png',
    excerpt: 'Bagaimana pembersihan otomatis EXIF metadata, enkripsi SHA-256, dan Zero-Knowledge Architecture melindungi identitas pelapor secara mutlak.',
    content: [
      {
        heading: '1. Mengapa Metadata Digital Berbahaya Bagi Pelapor?',
        body: 'Setiap foto atau video yang diambil menggunakan smartphone memuat data EXIF (Exchangeable Image File Format) seperti koordinat GPS lokasi akurat, waktu pengambilan hingga detik, model perangkat, serta serial number. Pihak tidak bertanggung jawab dapat memanfaatkan data ini untuk mengidentifikasi keberadaan pelapor.',
      },
      {
        heading: '2. Pembersihan Metadata di Browser Pelapor (Client-Side Stripping)',
        body: 'Sebelum berkas bukti diunggah ke server AmanKampus, skrip khusus di peramban (browser) Anda memisahkan piksel gambar dari tag metadata EXIF. Identitas fisik dan lokasi geografis Anda dibersihkan secara permanen sebelum berkas keluar dari perangkat pribadi Anda.',
      },
      {
        heading: '3. Penjaminan Keaslian Bukti Menggunakan SHA-256 Binary Hash',
        body: 'Untuk mencegah klaim bahwa bukti merupakan rekayasa atau suntingan (anti-fitnah), sistem menghitung sidik jari kriptografi SHA-256 256-bit unik. Jika ada 1 piksel saja yang diubah, nilai checksum hash akan rusak dan terdeteksi. Ini memberikan kepastian hukum yang kokoh.',
        points: [
          'Nilai Hash dihitung sebelum pengiriman data',
          'Sertifikasi sidik jari digital tersimpan di log terenkripsi',
          'Pemeriksaan forensik biner menjamin keutuhan bukti di mata Satgas'
        ]
      },
      {
        heading: '4. Rekomendasi Praktis Bagi Pelapor',
        body: 'Ambil tangkapan layar (screenshot) atau foto asli tanpa perlu mengedit isi gambar. Biarkan sistem AmanKampus yang secara otomatis mengamankan privasi serta integritas berkas Anda.',
      }
    ],
    legalRef: 'Permendikbudristek No. 30/2021 & Standar Kriptografi ISO/IEC 27001'
  },
  {
    id: 'ppks-case-workflow',
    number: '02',
    title: 'Prosedur Standar Penanganan Kasus oleh Satgas PPKS Kampus',
    category: 'Alur & Penanganan',
    readTime: '8 min baca',
    date: '3 Sep 2026',
    author: 'Satgas Pencegahan & Penanganan Kekerasan Seksual',
    image: '/images/2.png',
    excerpt: 'Langkah demi langkah dari penerimaan laporan anonim, verifikasi bukti digital, pendampingan psikologis, hingga rekomendasi sanksi etik.',
    content: [
      {
        heading: '1. Tahap 1: Penerimaan & Verifikasi Awal (0 - 24 Jam)',
        body: 'Laporan masuk melalui portal terenkripsi AmanKampus. Tim Satgas memverifikasi keutuhan kronologi awal dan keabsahan berkas bukti tanpa pernah mengakses identitas pribadi pelapor.',
      },
      {
        heading: '2. Tahap 2: Bantuan Darurat & Pendampingan Psikologis (PFA)',
        body: 'Sebelum proses investigasi lanjutan, pelapor diprioritaskan mendapatkan bantuan pemulihan trauma, layanan konseling profesional gratis, serta dispensasi perkuliahan resmi dari kampus.',
      },
      {
        heading: '3. Tahap 3: Investigasi Forensik & Verifikasi Saksi',
        body: 'Tim investigasi memeriksa bukti digital melalui algoritma SHA-256 Hash. Saksi-saksi dipanggil dalam pemeriksaan tertutup dengan menerapkan asas praduga tak bersalah dan menjaga kerahasiaan penuh.',
        points: [
          'Pemeriksaan dilakukan oleh konselor independen yang tersumpah',
          'Pelapor berhak didampingi oleh wali atau pendamping hukum',
          'Seluruh catatan investigasi dienkripsi dengan kunci akses terbatas'
        ]
      },
      {
        heading: '4. Tahap 4: Rekomendasi Sanksi Etik & Jaminan Pemulihan Korban',
        body: 'Jika terlapor terbukti melakukan pelanggaran, Satgas menerbitkan rekomendasi sanksi administratif (skorsing hingga pemberhentian) kepada Rektor. Korban dijamin mendapatkan pemulihan nilai akademik dan perlindungan dari pembalasan.',
      }
    ],
    legalRef: 'Pasal 25-38 Permendikbudristek No. 30 Tahun 2021'
  },
  {
    id: 'victim-rights-legal-protection',
    number: '03',
    title: 'Mengenal Hak-Hak Korban & Saksi Berdasarkan Regulasi Resmi',
    category: 'Hukum & Regulasi',
    readTime: '5 min baca',
    date: '1 Sep 2026',
    author: 'Divisi Bantuan Hukum Civitas Akademika',
    image: '/images/3.png',
    excerpt: 'Penjelasan komprehensif mengenai landasan hukum nasional yang menjamin kerahasiaan identitas, bantuan legal gratis, dan perlindungan retaliasi.',
    content: [
      {
        heading: '1. Payung Hukum Pelindungan Mahasiswa di Perguruan Tinggi',
        body: 'Permendikbudristek No. 30 Tahun 2021 dan UU TPKS No. 12 Tahun 2022 mengharuskan perguruan tinggi menyediakan mekanisme penanganan kasus yang aman, responsif, dan berpihak pada pemulihan korban.',
      },
      {
        heading: '2. Jaminan Anti-Retaliasi Pasca Pelaporan',
        body: 'Pelapor dan saksi sering khawatir akan dipersulit dalam kelulusan atau diturunkan nilainya. Undang-undang memberikan ancaman sanksi etik berat bagi dosen, pengurus, atau mahasiswa terlapor yang mencoba melakukan pembalasan (retaliasi).',
        points: [
          'Perlindungan nilai mata kuliah & keberlanjutan skripsi',
          'Perlindungan status keorganisasian dan beasiswa',
          'Sanksi tegas bagi pihak yang melakukan intimidasi susulan'
        ]
      },
      {
        heading: '3. Akses Layanan Medis, Konseling, & Advokasi Gratis',
        body: 'Seluruh fasilitas konseling psikologis, pendampingan medis pasca-kejadian, hingga advokasi hukum disediakan tanpa dipungut biaya sedikit pun.',
      },
      {
        heading: '4. Hak Cuti Pemulihan Akademik Khusus',
        body: 'Mahasiswa yang memerlukan waktu pemulihan trauma dapat mengambil Cuti Akademik Pemulihan Khusus tanpa mengurangi batas maksimal masa studi di universitas.',
      }
    ],
    legalRef: 'UU TPKS No. 12/2022 & Permendikbudristek No. 30/2021'
  },
  {
    id: 'pfa-trauma-grounding',
    number: '04',
    title: 'Pertolongan Pertama Psikologis (PFA): Mengatasi Trauma & Kecemasan',
    category: 'Kesehatan Mental',
    readTime: '7 min baca',
    date: '28 Agt 2026',
    author: 'Tim Psikolog Klinis PFA AmanKampus',
    image: '/images/4.jpg',
    excerpt: 'Teknik praktis grounding 5-4-3-2-1, pengaturan napas diafragma, dan langkah pertolongan diri mandiri saat mengalami serangan cemas.',
    content: [
      {
        heading: '1. Memahami Respon Alami Tubuh Pasca Trauma',
        body: 'Saat mengalami kekerasan atau ancaman, tubuh secara alami mengaktifkan respon fight, flight, atau freeze. Pertolongan Pertama Psikologis (PFA) membantu menenangkan sistem saraf yang terstimulasi berlebihan.',
      },
      {
        heading: '2. Teknik Grounding 5-4-3-2-1 untuk Menstabilkan Emosi',
        body: 'Saat merasa cemas atau panic attack, gunakan indra Anda untuk kembali ke momen saat ini:',
        points: [
          '5 hal yang dapat Anda LIHAT di sekitar Anda',
          '4 hal yang dapat Anda SENTUH atau rasakan teksturnya',
          '3 suara yang dapat Anda DENGARKAN dengan tenang',
          '2 aroma yang dapat Anda CIUM di udara',
          '1 rasa yang dapat Anda RASAKAN pada lidah Anda'
        ]
      },
      {
        heading: '3. Metode Pernapasan Diafragma (Box Breathing 4-4-4-4)',
        body: 'Hirup napas perlahan melalui hidung (4 detik), tahan napas (4 detik), hembuskan perlahan lewat mulut (4 detik), dan tahan kosong (4 detik). Ulangi 4 siklus hingga detak jantung kembali stabil.',
      },
      {
        heading: '4. Kapan Harus Mengakses Konselor Profesional?',
        body: 'Jika kecemasan mengganggu tidur, menimbulkan kilas balik (flashback), atau menghambat aktivitas belajar, manfaatkan fitur konsultasi anonim PFA yang tersedia di portal ini.',
      }
    ],
    legalRef: 'Standar Pertolongan Pertama Psikologis WHO & Himpunan Psikologi Indonesia'
  },
  {
    id: 'cybersecurity-doxing-prevention',
    number: '05',
    title: 'Keamanan Siber Pribadi: Cara Mengamankan Jejak Digital & Mencegah Doxing',
    category: 'Edukasi Digital',
    readTime: '6 min baca',
    date: '25 Agt 2026',
    author: 'Tim Siber & Privasi Komunitas AmanKampus',
    image: '/images/5.png',
    excerpt: 'Panduan langkah demi langkah mengamankan akun sosial media, 2FA, mengunci privasi nomor telepon, dan membersihkan jejak digital.',
    content: [
      {
        heading: '1. Apa Itu Doxing & Mengapa Harus Diwaspadai?',
        body: 'Doxing adalah tindakan mengumpulkan dan mempublikasikan data pribadi seseorang (alamat, nomor HP, NIK, foto identitas) tanpa izin dengan maksud meneror atau mempermalukan di ruang publik.',
      },
      {
        heading: '2. Mengamankan Akun Pesan Instan & Sosial Media',
        body: 'Lakukan langkah pengamanan ketat pada perangkat digital Anda:',
        points: [
          'Aktifkan Authenticator 2-Step Verification (2FA) pada WhatsApp, Email, & Instagram',
          'Sembunyikan foto profil dan status WhatsApp dari nomor yang tidak tersimpan',
          'Hindari membagikan lokasi tempat tinggal atau jadwal kuliah real-time di medsos',
          'Gunakan kata sandi unik dan kombinasikan huruf besar, angka, serta simbol'
        ]
      },
      {
        heading: '3. Menghapus Dokumen Pribadi dari Pencarian Publik',
        body: 'Periksa nama lengkap Anda di mesin pencari. Jika ada daftar pengumuman kampus yang memuat nomor HP atau alamat rumah, ajukan permohonan penghapusan (Google Search Removal Request).',
      },
      {
        heading: '4. Langkah Penanganan Jika Anda Menjadi Korban Doxing',
        body: 'Dokumentasikan bukti tangkapan layar unggahan doxing, alihkan seluruh akun ke mode privat, dan laporkan segera melalui platform AmanKampus agar Satgas dapat memberikan perlindungan.',
      }
    ],
    legalRef: 'UU Perlindungan Data Pribadi No. 27/2022 & UU ITE'
  },
  {
    id: 'safe-campus-bystander-culture',
    number: '06',
    title: 'Membangun Budaya Ruang Aman & Active Bystander Intervention di Kampus',
    category: 'Komunitas & Edukasi',
    readTime: '5 min baca',
    date: '20 Agt 2026',
    author: 'Pengurus Aliansi Mahasiswa Peduli Ruang Aman',
    image: '/images/6.png',
    excerpt: 'Strategi 5D (Distract, Delegate, Document, Direct, Delay) untuk mengintervensi tindak pelecehan secara aman saat menjadi saksi.',
    content: [
      {
        heading: '1. Peran Penting Saksi (Bystander) dalam Lingkungan Akademik',
        body: 'Sikap acuh tak acuh saat melihat pelecehan memberi ruang bagi pelaku. Pendekatan Active Bystander melatih civitas akademika untuk bertindak secara aman tanpa membahayakan diri sendiri.',
      },
      {
        heading: '2. Penerapan Metode Intervensi 5D',
        body: 'Lima cara taktis bagi saksi untuk menghentikan dugaan pelecehan atau perundungan:',
        points: [
          'Distract (Alihkan): Buat gangguan kecil (misal: menanyakan arah jam atau waktu) untuk memecah perhatian pelaku',
          'Delegate (Delegasikan): Minta bantuan dosen, petugas keamanan kampus, atau pengurus organisasi terdekat',
          'Document (Dokumentasikan): Catat waktu, lokasi, dan ambil foto/video bukti untuk mendukung laporan korban',
          'Direct (Tegur Langsung): Jika kondisi dipastikan aman, katakan dengan tegas bahwa tindakan pelaku tidak pantas',
          'Delay (Dampingi Nanti): Hambat dampak kecemasan dengan menghampiri korban setelah kejadian dan tawarkan bantuan'
        ]
      },
      {
        heading: '3. Mewujudkan Organisasi Mahasiswa Bebas Perundungan',
        body: 'Setiap pengurus organisasi, panitia makrab, dan komunitas kampus dianjurkan menandatangani Pakta Integritas Anti-Kekerasan Seksual & Perundungan demi menciptakan lingkungan akademis yang aman.',
      }
    ],
    legalRef: 'Kode Etik Kemahasiswaan & Panduan Satgas PPKS'
  }
];

// ─── FAQ Data ─────────────────────────────────────────────────────────────────

export const EDU_FAQS: EduFaqItem[] = [
  {
    q: 'Bagaimana jika saya tidak memiliki bukti tangkapan layar (screenshot) yang lengkap?',
    a: 'Anda tetap dapat membuat laporan. Satgas PPKS akan melakukan investigasi mendalam, pengumpulan saksi, serta verifikasi forensik digital. Setiap informasi kronologi awal sangat berharga untuk memulai pendampingan.',
  },
  {
    q: 'Apakah terlapor akan mengetahui siapa yang melaporkan kasus ini?',
    a: 'Tidak. Sistem AmanKampus menerapkan skema Zero-Knowledge Anonymous Reporting. Identitas Anda (seperti IP address, GPS, dan metadata berkas) dihapus secara permanen sebelum laporan diterima oleh Satgas.',
  },
  {
    q: 'Bagaimana asas praduga tak bersalah diterapkan dalam investigasi Satgas?',
    a: 'Satgas PPKS bertindak secara independen dan objektif. Semua bukti fisik & digital diverifikasi nilai SHA-256 dan pemeriksaan forensik binernya sebelum mengambil tindakan etik atau hukum, menjaga hak semua pihak.',
  },
  {
    q: 'Apa yang terjadi jika ada ancaman pembalasan (retaliasi) dari pihak terlapor?',
    a: 'Kampus memberikan perlindungan hukum & akademik mutlak. Segala bentuk ancaman atau tindak retaliasi terhadap pelapor/saksi dikategorikan sebagai pelanggaran etik berat dengan sanksi skorsing hingga pemberhentian.',
  },
  {
    q: 'Apakah kerahasiaan berkas bukti saya dijamin tidak dapat diakses pihak luar?',
    a: 'Ya. Seluruh bukti terenkripsi secara aman dan hanya dapat diakses oleh anggota Satgas PPKS yang telah disumpah menjaga kerahasiaan dokumen sesuai standar regulasi nasional.',
  },
];

// ─── Victim Rights Data ───────────────────────────────────────────────────────

export const VICTIM_RIGHTS: VictimRightItem[] = [
  {
    title: 'Jaminan Anti-Retaliasi & Perlindungan Nilai',
    desc: 'Pelapor & saksi dilindungi sepenuhnya dari ancaman penurun nilai, penundaan skripsi, atau intimidasi organisasi.',
    icon: <Award className="w-5 h-5 text-teal-600 dark:text-teal-400" />,
  },
  {
    title: 'Kerahasiaan Identitas (Zero-Knowledge)',
    desc: 'Sistem menghapus EXIF metadata dan GPS lokasi secara otomatis. Identitas Anda tidak akan pernah dipublikasikan.',
    icon: <Lock className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
  },
  {
    title: 'Pendampingan Psikologis & Hukum Gratis',
    desc: 'Korban berhak mendapatkan layanan konseling, pendampingan medis, serta bantuan hukum dari tim konselor profesional.',
    icon: <UserCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
  },
  {
    title: 'Penyesuaian Beban & Kehadiran Akademik',
    desc: 'Selama proses pemulihan trauma, korban berhak mengajukan kelonggaran dispensasi perkuliahan resmi dari kampus.',
    icon: <Scale className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
  },
];
