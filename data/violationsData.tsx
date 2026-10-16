import React from 'react';
import {
  MessageSquareWarning,
  UserX,
  ShieldAlert,
  Scale,
} from 'lucide-react';

export interface ViolationCatalogItem {
  number: string;
  category: string;
  desc: string;
  examples: string[];
  legalBasis: string;
  tag: string;
  icon: React.ReactNode;
}

// ─── Violations Catalog Data (Katalog Pelanggaran Kampus & Siber) ──────────────

export const VIOLATIONS_CATALOG: ViolationCatalogItem[] = [
  {
    number: '01',
    category: 'Perundungan Siber (Cyberbullying)',
    desc: 'Tindakan intimidasi, pelecehan, atau ejekan secara sistematis di platform digital, media sosial, atau grup percakapan.',
    examples: ['Mengirim pesan ancaman berulang', 'Membuat grup untuk mengolok-olok korban', 'Menyebarkan rumor palsu di medsos'],
    legalBasis: 'Permendikbudristek No. 30/2021 & Pasal 27 ayat (3) UU ITE',
    tag: 'Siber & Medsos',
    icon: <MessageSquareWarning className="w-5 h-5 text-indigo-500" />,
  },
  {
    number: '02',
    category: 'Doxing & Pelanggaran Privasi',
    desc: 'Menyebarkan data pribadi (alamat, nomor HP, foto dokumen identitas) tanpa persetujuan untuk tujuan teror atau mempermalukan.',
    examples: ['Membocorkan nomor telepon ke publik', 'Menyebarkan lokasi rumah atau jadwal kuliah', 'Menyebar foto pribadi tanpa izin'],
    legalBasis: 'UU Perlindungan Data Pribadi (PDP) No. 27/2022',
    tag: 'Privasi Digital',
    icon: <UserX className="w-5 h-5 text-rose-500" />,
  },
  {
    number: '03',
    category: 'Pelecehan & Kekerasan Seksual',
    desc: 'Tindakan verbal, non-fisik, fisik, maupun berbasis elektronik yang bernada seksual tanpa persetujuan (non-consensual).',
    examples: ['Siulan/catcalling di area kampus', 'Komentar bernada seksual di media sosial', 'Ancaman penyebaran konten intim (KSBE)'],
    legalBasis: 'UU Tindak Pidana Kekerasan Seksual (TPKS) No. 12/2022',
    tag: 'Kekerasan Seksual',
    icon: <ShieldAlert className="w-5 h-5 text-teal-500" />,
  },
  {
    number: '04',
    category: 'Intimidasi Akademik & Penyalahgunaan Wewenang',
    desc: 'Penggunaan posisi struktural (dosen/senior/pengurus) untuk mengancam nilai, kelulusan, atau status keorganisasian.',
    examples: ['Mengancam tidak meluluskan jika tidak menuruti keinginan pribadi', 'Memaksa tugas di luar akademik', 'Penyalahgunaan wewenang organisasi'],
    legalBasis: 'Kode Etik Civitas Akademika & Peraturan Senat Akademik',
    tag: 'Etik & Akademik',
    icon: <Scale className="w-5 h-5 text-amber-500" />,
  },
];
