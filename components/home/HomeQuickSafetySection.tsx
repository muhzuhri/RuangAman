'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  UserCheck,
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  PhoneCall,
  Sparkles,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  FileCheck,
  SendHorizontal,
} from 'lucide-react';
import { EMERGENCY_CONTACTS } from '@/data/pfaSupportData';

interface SafetyActionStep {
  step: string;
  title: string;
  tag: string;
  urgency: string;
  desc: string;
  theme: {
    color: string;
    borderHover: string;
    borderActive: string;
    bgAccent: string;
    badgeBg: string;
    badgeText: string;
    barColor: string;
    pillBg: string;
  };
  icon: React.ReactNode;
  checklist: string[];
  tacticalTip: string;
}

const SAFETY_STEPS: SafetyActionStep[] = [
  {
    step: '01',
    title: 'Amankan Diri Secara Fisik',
    tag: 'Keselamatan Utama',
    urgency: 'Prioritas Kritis',
    desc: 'Jika Anda berada di lokasi yang tidak aman, segera bergerak ke area terbuka yang ramai atau menuju pos keamanan kampus terdekat.',
    theme: {
      color: 'text-amber-500',
      borderHover: 'hover:border-amber-500/70',
      borderActive: 'border-amber-500 ring-2 ring-amber-500/20',
      bgAccent: 'from-amber-500/10 via-amber-500/5 to-transparent',
      badgeBg: 'bg-amber-100 dark:bg-amber-950/80',
      badgeText: 'text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800',
      barColor: 'bg-amber-500',
      pillBg: 'bg-amber-50 dark:bg-amber-950/50',
    },
    icon: <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0" />,
    checklist: [
      'Segera berpindah ke area publik, kantin, perpustakaan, atau pos satpam kampus.',
      'Hubungi narahubung darurat atau rekan terdekat yang Anda percayai.',
      'Bila terancam langsung, segera aktifkan rekaman suara atau alarm darurat ponsel.',
    ],
    tacticalTip: 'Keselamatan fisik Anda selalu menjadi prioritas tertinggi sebelum mengumpulkan bukti hukum.',
  },
  {
    step: '02',
    title: 'Dokumentasikan Bukti Digital',
    tag: 'Forensik Digital',
    urgency: 'Penting & Mendesak',
    desc: 'Ambil tangkapan layar (screenshot) obrolan, tanggal, waktu, dan tautan akun pelaku sebelum konten dihapus atau diblokir.',
    theme: {
      color: 'text-cyan-500',
      borderHover: 'hover:border-cyan-500/70',
      borderActive: 'border-cyan-500 ring-2 ring-cyan-500/20',
      bgAccent: 'from-cyan-500/10 via-cyan-500/5 to-transparent',
      badgeBg: 'bg-cyan-100 dark:bg-cyan-950/80',
      badgeText: 'text-cyan-700 dark:text-cyan-300 border-cyan-300 dark:border-cyan-800',
      barColor: 'bg-cyan-500',
      pillBg: 'bg-cyan-50 dark:bg-cyan-950/50',
    },
    icon: <ShieldCheck className="w-5 h-5 text-cyan-500 shrink-0" />,
    checklist: [
      'Ambil tangkapan layar chat lengkap dengan jam, tanggal, dan nomor/ID akun.',
      'Simpan berkas asli (foto, video, voice note) tanpa diedit atau dicrop.',
      'Catat tautan profil (URL) akun pelaku dan rekam layar percakapan bila perlu.',
    ],
    tacticalTip: 'Sistem RuangAman akan otomatis melucuti data lokasi/EXIF saat bukti diunggah agar identitas Anda terlindungi.',
  },
  {
    step: '03',
    title: 'Batasi Kontak & Ganti Kunci Akses',
    tag: 'Isolasi Akun',
    urgency: 'Perlindungan Akun',
    desc: 'Hapus sesi login perangkat publik, aktifkan otentikasi dua langkah (2FA), dan hindari merespons provokasi pelaku.',
    theme: {
      color: 'text-indigo-500',
      borderHover: 'hover:border-indigo-500/70',
      borderActive: 'border-indigo-500 ring-2 ring-indigo-500/20',
      bgAccent: 'from-indigo-500/10 via-indigo-500/5 to-transparent',
      badgeBg: 'bg-indigo-100 dark:bg-indigo-950/80',
      badgeText: 'text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800',
      barColor: 'bg-indigo-500',
      pillBg: 'bg-indigo-50 dark:bg-indigo-950/50',
    },
    icon: <Lock className="w-5 h-5 text-indigo-500 shrink-0" />,
    checklist: [
      'Aktifkan Verifikasi Dua Langkah (2FA) di WhatsApp, Google, dan media sosial.',
      'Pilih opsi "Keluar dari semua perangkat lain" (Log out from all sessions).',
      'Hindari membalas provokasi agar pelaku tidak memperoleh bahan intimidasi baru.',
    ],
    tacticalTip: 'Memutus jalur komunikasi memperlambat eskalasi teror sembari penanganan resmi disiapkan.',
  },
  {
    step: '04',
    title: 'Kirim Laporan Anonim Terenkripsi',
    tag: 'Zero-Knowledge',
    urgency: 'Tindakan Solutif',
    desc: 'Gunakan formulir RuangAman untuk menyampaikan bukti dengan jaminan EXIF Stripping & SHA-256 tanpa perlu login.',
    theme: {
      color: 'text-emerald-500',
      borderHover: 'hover:border-emerald-500/70',
      borderActive: 'border-emerald-500 ring-2 ring-emerald-500/20',
      bgAccent: 'from-emerald-500/10 via-emerald-500/5 to-transparent',
      badgeBg: 'bg-emerald-100 dark:bg-emerald-950/80',
      badgeText: 'text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
      barColor: 'bg-emerald-500',
      pillBg: 'bg-emerald-50 dark:bg-emerald-950/50',
    },
    icon: <UserCheck className="w-5 h-5 text-emerald-500 shrink-0" />,
    checklist: [
      'Buka formulir pelaporan RuangAman tanpa perlu login akun atau NIM.',
      'Unggah bukti yang sudah disiapkan; bukti akan dienkripsi secara klien (client-side).',
      'Simpan Kode Laporan & Token Akses untuk memantau investigasi secara rahasia.',
    ],
    tacticalTip: 'Hanya Anda dan Satgas PPKS terverifikasi yang memegang kunci untuk membaca isi kronologi kasus.',
  },
];

export default function HomeQuickSafetySection() {
  // Hanya item yang diklik yang terbuka (accordion-style). Default item 0 terbuka sebagai contoh.
  const [expandedStepIdx, setExpandedStepIdx] = useState<number | null>(0);
  const [showEmergencyContacts, setShowEmergencyContacts] = useState(false);

  // Interactive Checklist State: Track completed items (key: "stepIdx-checkIdx")
  const [completedChecks, setCompletedChecks] = useState<Record<string, boolean>>({});

  const totalChecklistItems = SAFETY_STEPS.reduce((acc, curr) => acc + curr.checklist.length, 0);
  const completedCount = Object.values(completedChecks).filter(Boolean).length;
  const readinessPercentage = Math.round((completedCount / totalChecklistItems) * 100);

  const toggleExpand = (idx: number) => {
    setExpandedStepIdx((prev) => (prev === idx ? null : idx));
  };

  const toggleCheck = (stepIdx: number, checkIdx: number) => {
    const key = `${stepIdx}-${checkIdx}`;
    setCompletedChecks((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const markStepAll = (stepIdx: number) => {
    const nextChecks = { ...completedChecks };
    const stepItems = SAFETY_STEPS[stepIdx].checklist;
    const allDone = stepItems.every((_, i) => completedChecks[`${stepIdx}-${i}`]);

    stepItems.forEach((_, i) => {
      nextChecks[`${stepIdx}-${i}`] = !allDone;
    });
    setCompletedChecks(nextChecks);
  };

  const resetAllChecks = () => {
    setCompletedChecks({});
  };

  return (
    <section aria-label="Langkah Cepat Pengamanan Diri" className="w-full">
      <div className="bg-white/95 dark:bg-gray-700/95 backdrop-blur-2xl border border-stone-200 dark:border-stone-600 rounded-3xl p-6 sm:p-9 shadow-2xl space-y-7 relative overflow-hidden transition-all">
        {/* Glow ambient latar belakang */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-teal-500/10 dark:bg-teal-400/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-indigo-500/10 dark:bg-indigo-400/5 rounded-full blur-3xl pointer-events-none" />

        {/* ─── HEADER BAR: JUDUL + LIVE READINESS WIDGET ─── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5 border-b border-stone-200 dark:border-stone-600 pb-6 relative z-10">
          <div className="space-y-1.5 max-w-xl">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                <Sparkles className="w-3.5 h-3.5 text-teal-500" />
                <span>Panduan Interaktif Pelapor</span>
              </span>
              <span className="text-xs font-medium text-stone-500 dark:text-stone-400">
                • 4 Tahap Perlindungan
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-50 flex items-center gap-2.5 tracking-tight">
              <ShieldCheck className="w-7 h-7 text-teal-600 dark:text-teal-400 shrink-0" />
              <span>Langkah Cepat Pengamanan Diri</span>
            </h2>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
              Klik pada salah satu langkah di bawah untuk melihat rincian panduan, rekomendasi taktis, dan checklist tindakan mandiri.
            </p>
          </div>

          {/* Live Readiness Widget */}
          <div className="bg-stone-50/90 dark:bg-gray-800/90 border border-stone-200 dark:border-stone-600 rounded-2xl p-3 px-4 flex items-center gap-3.5 shadow-xs shrink-0 self-start sm:self-auto">
            <div className="relative w-11 h-11 flex items-center justify-center shrink-0">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                <path
                  className="text-stone-200 dark:text-gray-700"
                  strokeWidth="3.5"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <path
                  className="text-teal-600 dark:text-teal-400 transition-all duration-500 ease-out"
                  strokeDasharray={`${readinessPercentage}, 100`}
                  strokeWidth="3.5"
                  strokeLinecap="round"
                  stroke="currentColor"
                  fill="none"
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                />
              </svg>
              <span className="absolute text-[11px] font-mono font-black text-stone-900 dark:text-white">
                {readinessPercentage}%
              </span>
            </div>

            <div className="space-y-0.5">
              <div className="flex items-center gap-2 text-[11px] font-bold text-stone-900 dark:text-stone-100">
                <span>Kesiapan Mandiri</span>
                <span className="text-teal-600 dark:text-teal-400 font-mono">
                  {completedCount}/{totalChecklistItems}
                </span>
              </div>
              <p className="text-[10px] text-stone-500 dark:text-stone-400">
                {readinessPercentage === 100
                  ? '🎉 100% Terproteksi!'
                  : readinessPercentage > 0
                  ? 'Tindakan Berjalan'
                  : 'Centang checklist detail'}
              </p>
            </div>

            {completedCount > 0 && (
              <button
                type="button"
                onClick={resetAllChecks}
                title="Reset Checklist"
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 hover:bg-stone-200/50 dark:hover:bg-gray-700 transition-colors ml-1 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* ─── LIST ITEM SECTION: KLIK UNTUK MELIHAT DETAIL INFORMASINYA ─── */}
        <div className="space-y-3 relative z-10">
          {SAFETY_STEPS.map((act, idx) => {
            const isExpanded = expandedStepIdx === idx;
            const stepCompleted = act.checklist.every((_, i) => completedChecks[`${idx}-${i}`]);
            const stepCompletedCount = act.checklist.filter((_, i) => completedChecks[`${idx}-${i}`]).length;

            return (
              <div
                key={act.step}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isExpanded
                    ? `bg-stone-50 dark:bg-gray-800/90 ${act.theme.borderActive} shadow-lg ring-1 ring-stone-300 dark:ring-gray-600`
                    : `bg-stone-50/70 dark:bg-gray-800/60 border-stone-200 dark:border-stone-600 ${act.theme.borderHover} hover:shadow-sm`
                }`}
              >
                {/* ── LIST ITEM HEADER (Selalu terlihat sebagai baris list item) ── */}
                <button
                  type="button"
                  onClick={() => toggleExpand(idx)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between gap-4 text-left cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    {/* Step Number Badge */}
                    <span
                      className={`font-mono text-xs sm:text-sm font-black px-3 py-1.5 rounded-xl border shrink-0 transition-colors ${
                        isExpanded
                          ? `${act.theme.badgeBg} ${act.theme.badgeText}`
                          : 'bg-stone-200/80 dark:bg-gray-700 text-stone-700 dark:text-stone-300 border-transparent'
                      }`}
                    >
                      {act.step}
                    </span>

                    {/* Step Icon */}
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border transition-colors ${
                        isExpanded
                          ? 'bg-white dark:bg-gray-700 border-stone-300 dark:border-stone-600 shadow-xs'
                          : 'bg-white/80 dark:bg-gray-700/60 border-stone-200 dark:border-stone-700'
                      }`}
                    >
                      {act.icon}
                    </div>

                    {/* Step Title & Subtitle */}
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-bold text-sm sm:text-base text-stone-900 dark:text-stone-50 truncate">
                          {act.title}
                        </h3>
                        <span
                          className={`hidden sm:inline-block text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${act.theme.badgeBg} ${act.theme.badgeText}`}
                        >
                          {act.urgency}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500 dark:text-stone-400 truncate">
                        {act.tag} •{' '}
                        {stepCompleted ? (
                          <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                            ✓ Selesai ({stepCompletedCount}/{act.checklist.length})
                          </span>
                        ) : (
                          <span>
                            {stepCompletedCount > 0
                              ? `${stepCompletedCount}/${act.checklist.length} checklist dicentang`
                              : isExpanded
                              ? 'Rincian informasi aktif'
                              : 'Klik untuk melihat detail informasi'}
                          </span>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Right Status Badge & Chevron Icon */}
                  <div className="flex items-center gap-3 shrink-0">
                    {stepCompleted ? (
                      <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-full">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Selesai</span>
                      </span>
                    ) : (
                      <span className="text-xs font-mono text-stone-400 dark:text-stone-500 hidden sm:inline">
                        {stepCompletedCount}/{act.checklist.length}
                      </span>
                    )}

                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center transition-transform duration-200 ${
                        isExpanded
                          ? 'rotate-180 bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300'
                          : 'bg-stone-200/60 dark:bg-gray-700 text-stone-500 dark:text-stone-400'
                      }`}
                    >
                      <ChevronDown className="w-4 h-4" />
                    </div>
                  </div>
                </button>

                {/* ── DETAIL INFORMASI (HANYA DITAMPILKAN SAAT DI-KLIK) ── */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25 }}
                      className="border-t border-stone-200/80 dark:border-stone-700/80 p-5 sm:p-6 space-y-5 bg-white/50 dark:bg-gray-800/40"
                    >
                      {/* Deskripsi Lengkap Panduan */}
                      <div className="space-y-1">
                        <span className="text-[11px] font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider block">
                          Instruksi Pengamanan:
                        </span>
                        <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-200 leading-relaxed">
                          {act.desc}
                        </p>
                      </div>

                      {/* Tactical Tip Box */}
                      <div className="p-3.5 rounded-xl bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200/70 dark:border-teal-800/70 flex items-start gap-2.5 text-xs text-teal-950 dark:text-teal-200 leading-relaxed">
                        <span className="text-base shrink-0 leading-none">💡</span>
                        <div className="space-y-0.5">
                          <strong className="font-bold text-teal-900 dark:text-teal-100 block">
                            Catatan Taktis Satgas:
                          </strong>
                          <span>{act.tacticalTip}</span>
                        </div>
                      </div>

                      {/* Interactive Checklist (Dapat Dicentang Pengguna) */}
                      <div className="space-y-2.5 pt-1">
                        <div className="flex items-center justify-between text-xs font-bold text-stone-800 dark:text-stone-200">
                          <span className="flex items-center gap-1.5">
                            <FileCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                            <span>Checklist Tindakan Mandiri ({act.step}):</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => markStepAll(idx)}
                            className="text-[11px] text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
                          >
                            {stepCompleted ? 'Batal Centang Semua' : 'Tandai Semua Selesai'}
                          </button>
                        </div>

                        <div className="space-y-2">
                          {act.checklist.map((item, checkIdx) => {
                            const isChecked = !!completedChecks[`${idx}-${checkIdx}`];

                            return (
                              <div
                                key={checkIdx}
                                onClick={() => toggleCheck(idx, checkIdx)}
                                className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer select-none ${
                                  isChecked
                                    ? 'bg-teal-50 dark:bg-teal-950/50 border-teal-300 dark:border-teal-700 text-stone-900 dark:text-white shadow-2xs'
                                    : 'bg-white dark:bg-gray-700/60 border-stone-200 dark:border-stone-600 text-stone-700 dark:text-stone-300 hover:border-teal-400'
                                }`}
                              >
                                <span
                                  className={`mt-0.5 w-4 h-4 rounded-md border flex items-center justify-center shrink-0 transition-all ${
                                    isChecked
                                      ? 'bg-teal-600 border-teal-600 text-white shadow-xs'
                                      : 'border-stone-300 dark:border-stone-500 bg-white dark:bg-gray-800'
                                  }`}
                                >
                                  {isChecked && <CheckCircle2 className="w-3.5 h-3.5" />}
                                </span>
                                <span
                                  className={`text-xs leading-relaxed ${
                                    isChecked ? 'line-through opacity-75' : ''
                                  }`}
                                >
                                  {item}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Tool Spesifik per Langkah */}
                      <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-stone-200/60 dark:border-stone-700/60">
                        {idx === 0 ? (
                          <button
                            type="button"
                            onClick={() => setShowEmergencyContacts(!showEmergencyContacts)}
                            className="text-amber-700 dark:text-amber-300 hover:text-amber-800 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 font-bold px-3.5 py-2 rounded-xl text-xs inline-flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-2xs"
                          >
                            <PhoneCall className="w-4 h-4 text-amber-600" />
                            <span>
                              {showEmergencyContacts
                                ? 'Tutup Kontak Darurat'
                                : 'Lihat Kontak Darurat Kampus (Satgas/Medis)'}
                            </span>
                          </button>
                        ) : idx === 3 ? (
                          <Link
                            href="/report"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-xl text-xs inline-flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer"
                          >
                            <span>Lanjut Buat Laporan Terenkripsi</span>
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        ) : (
                          <span className="text-[11px] text-stone-500 dark:text-stone-400">
                            ✓ Lakukan tindakan di atas sebelum berpindah ke langkah selanjutnya.
                          </span>
                        )}

                        {idx < SAFETY_STEPS.length - 1 && (
                          <button
                            type="button"
                            onClick={() => setExpandedStepIdx(idx + 1)}
                            className="text-xs font-bold text-teal-600 dark:text-teal-400 hover:underline inline-flex items-center gap-1 cursor-pointer self-end sm:self-auto"
                          >
                            <span>Buka Langkah {SAFETY_STEPS[idx + 1].step}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        {/* ─── INLINE EMERGENCY CONTACTS DRAWER (Bila Dipilih pada Langkah 01) ─── */}
        <AnimatePresence>
          {showEmergencyContacts && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden border-t border-amber-200 dark:border-amber-800/80 pt-5 relative z-10"
            >
              <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-extrabold text-amber-800 dark:text-amber-300 uppercase tracking-wider">
                    <PhoneCall className="w-4 h-4 text-amber-600" />
                    <span>Narahubung Cepat & Hotline Penanganan Darurat</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowEmergencyContacts(false)}
                    className="text-xs text-amber-700 dark:text-amber-400 hover:underline cursor-pointer font-bold"
                  >
                    Tutup
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {EMERGENCY_CONTACTS.map((c, i) => (
                    <div
                      key={i}
                      className="bg-white dark:bg-gray-800 border border-amber-200/80 dark:border-stone-600 p-3.5 rounded-xl space-y-2 shadow-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-stone-100 dark:bg-gray-700 text-stone-700 dark:text-stone-300">
                          {c.badge}
                        </span>
                        <div className="p-1 rounded-md bg-stone-50 dark:bg-gray-700 text-teal-600">
                          {c.icon}
                        </div>
                      </div>
                      <h4 className="text-xs font-bold text-stone-900 dark:text-white leading-snug">
                        {c.title}
                      </h4>
                      <p className="text-[11px] font-mono font-black text-amber-700 dark:text-amber-400">
                        {c.phone}
                      </p>
                      <a
                        href={c.waLink}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-600 dark:text-teal-400 hover:underline pt-1"
                      >
                        <span>Hubungi WhatsApp</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── FOOTER BAR: ZERO-KNOWLEDGE NOTICE + UTAMA CTA ACTION ─── */}
        <div className="pt-5 border-t border-stone-200 dark:border-stone-600 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-10">
          <div className="flex items-center gap-2.5 text-xs text-stone-500 dark:text-stone-400 font-medium">
            <AlertCircle className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
            <span>
              Semua laporan diproses dengan standar proteksi anonimitas <strong>Zero-Knowledge</strong> & penanggalan jejak EXIF.
            </span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link
              href="/report"
              className="w-full sm:w-auto bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-xl text-xs flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-teal-600/30 shrink-0 cursor-pointer"
            >
              <SendHorizontal className="w-4 h-4" />
              <span>Buat Laporan Sekarang</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
