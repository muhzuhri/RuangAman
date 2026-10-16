import React from 'react';
import {
  PhoneCall,
  HeartHandshake,
  LifeBuoy,
  ShieldAlert,
  ShieldCheck,
  Lock,
  UserCheck,
} from 'lucide-react';

export interface EmergencyContact {
  title: string;
  subtitle: string;
  phone: string;
  waLink: string;
  icon: React.ReactNode;
  badge: string;
  bg: string;
}

export interface QuickActionStep {
  step: string;
  title: string;
  desc: string;
  icon: React.ReactNode;
}

// ─── PFA Support & Emergency Contacts Data (Menu Pusat Bantuan PFA) ─────────────

export const EMERGENCY_CONTACTS: EmergencyContact[] = [
  {
    title: 'Hotline Resmi Satgas PPKS (24 Jam)',
    subtitle: 'Penanganan Darurat, Pendampingan Hukum & Pengaduan Langsung',
    phone: '0812-9900-PPKS',
    waLink: 'https://wa.me/6281299007757',
    icon: <PhoneCall className="w-5 h-5 text-teal-600 dark:text-teal-400" />,
    badge: 'Respon Cepat 24/7',
    bg: 'bg-teal-50 dark:bg-teal-950/60 border-teal-200 dark:border-teal-800',
  },
  {
    title: 'Layanan Konseling Psikologi Kampus',
    subtitle: 'Dukungan Kesehatan Mental, PFA & Pendampingan Trauma',
    phone: '0813-8877-KONSUL',
    waLink: 'https://wa.me/6281388775665',
    icon: <HeartHandshake className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />,
    badge: 'Rahasia & Komfidesial',
    bg: 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-200 dark:border-indigo-800',
  },
  {
    title: 'Unit Layanan Krisis & Medis Pertama',
    subtitle: 'Penanganan Medis Fisik Darurat & Evakuasi Aman',
    phone: '119 / 0811-MEDIS-KAMPUS',
    waLink: 'https://wa.me/628116334778',
    icon: <LifeBuoy className="w-5 h-5 text-rose-600 dark:text-rose-400" />,
    badge: 'Darurat Medis',
    bg: 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800',
  },
];

export const QUICK_SAFETY_ACTIONS: QuickActionStep[] = [
  {
    step: '01',
    title: 'Amankan Diri Secara Fisik',
    desc: 'Jika Anda berada di lokasi yang tidak aman, segera bergerak ke area terbuka yang ramai atau menuju pos keamanan kampus terdekat.',
    icon: <ShieldAlert className="w-5 h-5 text-amber-500" />,
  },
  {
    step: '02',
    title: 'Dokumentasikan Bukti Digital',
    desc: 'Ambil tangkapan layar (screenshot) obrolan, tanggal, waktu, dan tautan akun pelaku sebelum konten dihapus atau diblokir.',
    icon: <ShieldCheck className="w-5 h-5 text-teal-500" />,
  },
  {
    step: '03',
    title: 'Batasi Kontak & Ganti Kunci Akses',
    desc: 'Hapus sesi login perangkat publik, aktifkan otentikasi dua langkah (2FA), dan hindari merespons provokasi pelaku.',
    icon: <Lock className="w-5 h-5 text-indigo-500" />,
  },
  {
    step: '04',
    title: 'Kirim Laporan Anonim Terenkripsi',
    desc: 'Gunakan formulir AmanKampus untuk menyampaikan bukti dengan jaminan EXIF Stripping & SHA-256 tanpa perlu login.',
    icon: <UserCheck className="w-5 h-5 text-emerald-500" />,
  },
];
