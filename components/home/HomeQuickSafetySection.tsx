'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  UserCheck,
  FileText,
  PhoneCall,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  SendHorizontal,
} from 'lucide-react';
import { EMERGENCY_CONTACTS } from '@/data/pfaSupportData';

interface QuickSafetyStepItem {
  number: string;
  title: string;
  tag: string;
  tagColor: string;
  dotColor: string;
  icon: React.ReactNode;
  desc: string;
  actions: string[];
  note: string;
  hasEmergencyHotlines?: boolean;
  hasReportCTA?: boolean;
}

const SAFETY_STEPS_CATALOG: QuickSafetyStepItem[] = [
  {
    number: '01',
    title: 'Amankan Diri Secara Fisik',
    tag: 'Keselamatan Utama',
    tagColor: 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800',
    dotColor: 'bg-amber-500',
    icon: <ShieldAlert className="w-5 h-5 text-amber-500" />,
    desc: 'Jika Anda berada di lokasi yang tidak aman, segera bergerak ke area terbuka yang ramai atau menuju pos keamanan kampus terdekat.',
    actions: [
      'Menjauh ke area publik / pos satpam',
      'Hubungi narahubung darurat rekan terpercaya',
      'Aktifkan alarm darurat ponsel bila terancam',
    ],
    note: 'Keselamatan fisik Anda selalu menjadi prioritas tertinggi sebelum mengumpulkan bukti formal.',
    hasEmergencyHotlines: true,
  },
  {
    number: '02',
    title: 'Dokumentasikan Bukti Digital',
    tag: 'Forensik Digital',
    tagColor: 'bg-cyan-100 dark:bg-cyan-950/80 text-cyan-800 dark:text-cyan-300 border-cyan-300 dark:border-cyan-800',
    dotColor: 'bg-cyan-500',
    icon: <ShieldCheck className="w-5 h-5 text-cyan-500" />,
    desc: 'Ambil tangkapan layar (screenshot) obrolan, tanggal, waktu, dan tautan akun pelaku sebelum konten dihapus atau diblokir.',
    actions: [
      'Screenshot chat lengkap jam & ID akun',
      'Simpan berkas foto/video asli tanpa diedit',
      'Catat tautan profil (URL) akun pelaku',
    ],
    note: 'Sistem RuangAman otomatis melucuti metadata EXIF foto/video agar privasi identitas Anda terjamin.',
  },
  {
    number: '03',
    title: 'Batasi Kontak & Ganti Kunci Akses',
    tag: 'Isolasi Akun',
    tagColor: 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800',
    dotColor: 'bg-indigo-500',
    icon: <Lock className="w-5 h-5 text-indigo-500" />,
    desc: 'Hapus sesi login perangkat publik, aktifkan otentikasi dua langkah (2FA), dan hindari merespons provokasi pelaku.',
    actions: [
      'Aktifkan 2FA di WhatsApp & Google',
      'Log out dari semua peranti publik kampus',
      'Hentikan respons provokasi pihak pelaku',
    ],
    note: 'Memutus jalur kontak memperlambat eskalasi teror sembari proses hukum dan mediasi disiapkan.',
  },
  {
    number: '04',
    title: 'Kirim Laporan Anonim Terenkripsi',
    tag: 'Zero-Knowledge',
    tagColor: 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
    dotColor: 'bg-emerald-500',
    icon: <UserCheck className="w-5 h-5 text-emerald-500" />,
    desc: 'Gunakan formulir RuangAman untuk menyampaikan bukti dengan jaminan EXIF Stripping & SHA-256 tanpa perlu login.',
    actions: [
      'Buka formulir laporan tanpa login/NIM',
      'Enkripsi bukti digital client-side',
      'Simpan Token Akses rahasia pelacak kasus',
    ],
    note: 'Diproses dengan standar proteksi anonimitas Zero-Knowledge & penanggalan jejak EXIF mutlak.',
    hasReportCTA: true,
  },
];

export default function HomeQuickSafetySection() {
  const [expandedStep, setExpandedStep] = useState<string | null>(null);
  const [showEmergencyContacts, setShowEmergencyContacts] = useState(false);

  const toggleStep = (stepNumber: string) => {
    setExpandedStep((prev) => (prev === stepNumber ? null : stepNumber));
  };

  return (
    <section aria-labelledby="quick-safety-catalog-title" className="space-y-6">
      {/* ── SECTION HEADER ── */}
      <div className="space-y-1">
        <h2
          id="quick-safety-catalog-title"
          className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-50 flex items-center gap-2.5 tracking-tight"
        >
          <ShieldCheck className="w-7 h-7 text-teal-600 dark:text-teal-400 shrink-0" />
          <span>Langkah Cepat Pengamanan Diri</span>
        </h2>
        <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 font-medium">
          Langkah awal yang harus dilakukan korban untuk mengamankan fisik dan jejak bukti digital secara mandiri. Tekan pada setiap langkah untuk melihat panduan detail.
        </p>
      </div>

      {/* ── TIMELINE TRACK & CARD LIST ── */}
      <div className="relative pl-5 md:pl-8 border-l-2 border-stone-200 dark:border-stone-600 space-y-4">
        {SAFETY_STEPS_CATALOG.map((item, i) => {
          const isExpanded = expandedStep === item.number;

          return (
            <motion.div
              key={item.number}
              initial={{ opacity: 0, x: -15 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.3, delay: i * 0.08 }}
              className="relative group"
            >
              {/* Timeline Node Pin */}
              <div
                className={`absolute -left-[27px] md:-left-[39px] top-6 w-3.5 h-3.5 rounded-full border-2 transition-all duration-300 ${
                  isExpanded
                    ? 'bg-teal-500 border-teal-200 dark:border-teal-700 ring-4 ring-teal-500/20 scale-125'
                    : 'bg-stone-300 dark:bg-gray-700 border-white dark:border-stone-900 group-hover:bg-teal-500 group-hover:scale-110'
                }`}
              />

              {/* Step Card with Click-to-Expand */}
              <div
                onClick={() => toggleStep(item.number)}
                className={`transition-all duration-300 cursor-pointer rounded-2xl p-5 md:p-6 shadow-xs select-none ${
                  isExpanded
                    ? 'bg-white dark:bg-gray-700 border-2 border-teal-500/70 shadow-md ring-2 ring-teal-500/10'
                    : 'bg-white/90 dark:bg-gray-700 border border-stone-200 dark:border-stone-600/80 hover:border-teal-500/50 hover:shadow-md'
                }`}
              >
                {/* Card Top Row: Number, Icon, Title, Tag & Chevron Indicator */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="font-mono text-xs font-bold text-stone-500 dark:text-stone-400 shrink-0">
                      [{item.number}]
                    </span>
                    <div className="p-1.5 rounded-lg bg-stone-100 dark:bg-stone-800 shrink-0">
                      {item.icon}
                    </div>
                    <div className="flex items-center gap-2.5 flex-wrap min-w-0">
                      <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-50 truncate">
                        {item.title}
                      </h3>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border shrink-0 ${item.tagColor}`}
                      >
                        {item.tag}
                      </span>
                    </div>
                  </div>

                  {/* Toggle Indicator */}
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="hidden sm:inline-block text-[11px] font-medium text-stone-400 dark:text-stone-400">
                      {isExpanded ? 'Tutup Detail' : 'Buka Detail'}
                    </span>
                    <div
                      className={`p-1 rounded-full transition-colors ${
                        isExpanded
                          ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400'
                          : 'text-stone-400 group-hover:text-stone-600 dark:group-hover:text-stone-300'
                      }`}
                    >
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-300 ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </div>
                </div>

                {/* Detail Information (revealed only when pressed/expanded) */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                      className="overflow-hidden space-y-3.5 pt-4 mt-3.5 border-t border-stone-100 dark:border-stone-600/80"
                    >
                      {/* Description */}
                      <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed font-medium pl-0 sm:pl-9">
                        {item.desc}
                      </p>

                      {/* Action Indicators (Horizontal Pills) */}
                      <div className="pl-0 sm:pl-9 pt-1 space-y-1.5">
                        <p className="text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                          Rekomendasi Indikator Tindakan:
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          {item.actions.map((act, idx) => (
                            <div
                              key={idx}
                              className="text-xs text-stone-800 dark:text-stone-200 bg-stone-50 dark:bg-gray-800/60 px-3 py-1.5 rounded-lg border border-stone-200/60 dark:border-stone-600/60 flex items-center gap-2 font-medium"
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${item.dotColor} shrink-0`} />
                              <span className="truncate">{act}</span>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Bottom Row: Note & Tool Trigger */}
                      <div className="pl-0 sm:pl-9 pt-2.5 border-t border-stone-100 dark:border-stone-600/80 text-[11px] text-stone-600 dark:text-stone-400 font-mono flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div className="flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                          <span>
                            Catatan Satgas:{' '}
                            <strong className="text-stone-800 dark:text-stone-200">{item.note}</strong>
                          </span>
                        </div>

                        {/* Optional Action Button */}
                        {item.hasEmergencyHotlines && (
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowEmergencyContacts(!showEmergencyContacts);
                            }}
                            className="self-start sm:self-auto text-amber-700 dark:text-amber-300 hover:text-amber-800 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 font-bold px-3 py-1.5 rounded-xl text-xs inline-flex items-center gap-1.5 cursor-pointer transition-colors shadow-2xs shrink-0"
                          >
                            <PhoneCall className="w-3.5 h-3.5 text-amber-600" />
                            <span>
                              {showEmergencyContacts ? 'Tutup Kontak Darurat' : 'Lihat Kontak Darurat Kampus'}
                            </span>
                          </button>
                        )}

                        {item.hasReportCTA && (
                          <Link
                            href="/report"
                            onClick={(e) => e.stopPropagation()}
                            className="self-start sm:self-auto bg-teal-600 hover:bg-teal-700 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs inline-flex items-center gap-1.5 transition-all shadow-xs shrink-0 cursor-pointer"
                          >
                            <SendHorizontal className="w-3.5 h-3.5" />
                            <span>Buat Laporan Sekarang</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </Link>
                        )}
                      </div>

                      {/* Emergency Contacts Drawer (if opened on Step 01) */}
                      {item.hasEmergencyHotlines && (
                        <AnimatePresence>
                          {showEmergencyContacts && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: 'auto' }}
                              exit={{ opacity: 0, height: 0 }}
                              className="overflow-hidden pt-2 pl-0 sm:pl-9"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-xl p-4 space-y-3">
                                <div className="flex items-center justify-between">
                                  <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider flex items-center gap-1.5">
                                    <PhoneCall className="w-3.5 h-3.5" />
                                    <span>Hotline Siaga & Layanan Darurat Kampus (24/7)</span>
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => setShowEmergencyContacts(false)}
                                    className="text-xs text-amber-700 dark:text-amber-400 hover:underline cursor-pointer font-bold"
                                  >
                                    Tutup
                                  </button>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                                  {EMERGENCY_CONTACTS.map((c, idx) => (
                                    <div
                                      key={idx}
                                      className="bg-white dark:bg-gray-800 border border-amber-200/80 dark:border-stone-600 p-3 rounded-xl space-y-1.5 shadow-2xs"
                                    >
                                      <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-stone-100 dark:bg-gray-700 text-stone-700 dark:text-stone-300">
                                          {c.badge}
                                        </span>
                                        <div className="p-1 rounded bg-stone-50 dark:bg-gray-700 text-teal-600">
                                          {c.icon}
                                        </div>
                                      </div>
                                      <h4 className="text-xs font-bold text-stone-900 dark:text-white truncate">
                                        {c.title}
                                      </h4>
                                      <p className="text-[11px] font-mono font-black text-amber-700 dark:text-amber-400">
                                        {c.phone}
                                      </p>
                                      <a
                                        href={c.waLink}
                                        target="_blank"
                                        rel="noreferrer"
                                        className="inline-flex items-center gap-1 text-[10px] font-bold text-teal-600 dark:text-teal-400 hover:underline"
                                      >
                                        <span>Hubungi WhatsApp</span>
                                        <ExternalLink className="w-2.5 h-2.5" />
                                      </a>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}

