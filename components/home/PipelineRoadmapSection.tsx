'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert,
  FileCheck,
  Cpu,
  ShieldCheck,
  Lock,
  Key,
  Database,
  UserCheck,
  History,
  Sparkles,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
} from 'lucide-react';

export const PIPELINE_STEPS = [
  {
    step: 'STEP 01',
    date: 'Inisiasi Pelapor',
    title: 'Inisiasi Pelaporan Anonim',
    desc: 'Sistem menerbitkan ID Kasus unik dan Token Akses terisolasi langsung di peranti pelapor tanpa meminta identitas diri (Tanpa Nama/NIM/Email).',
    icon: ShieldAlert,
    tag: 'Client-Side Start',
    color: 'from-teal-500 to-emerald-500',
  },
  {
    step: 'STEP 02',
    date: 'Verifikasi Anti-Bot',
    title: 'Validasi Form & Anti-Spam',
    desc: 'Verifikasi kualitas substansi kronologi serta tantangan matematika anti-bot interaktif untuk mencegah serangan otomatis dan penyalahgunaan formulir.',
    icon: FileCheck,
    tag: 'Anti-Spam Defense',
    color: 'from-cyan-500 to-teal-500',
  },
  {
    step: 'STEP 03',
    date: 'Biner Magic-Bytes',
    title: 'Pemindaian Signature Biner',
    desc: 'Memeriksa header biner asli (Magic-Bytes) untuk menangkal pemalsuan ekstensi/MIME spoofing, biner eksekusi (.exe/.sh), dan skrip XSS SVG.',
    icon: Cpu,
    tag: 'Magic-Byte Inspection',
    color: 'from-emerald-500 to-teal-600',
  },
  {
    step: 'STEP 04',
    date: 'Proteksi Lokasi',
    title: 'Stripping EXIF/GPS & Sanitasi',
    desc: 'Menggambar ulang gambar via HTML5 Canvas Redraw & atom clearing untuk menghapus koordinat GPS, serial kamera, dan stempel waktu privasi.',
    icon: ShieldCheck,
    tag: 'EXIF Location Stripping',
    color: 'from-teal-600 to-cyan-600',
  },
  {
    step: 'STEP 05',
    date: 'Integritas Mutlak',
    title: 'Generasi SHA-256 Digest',
    desc: 'Menghitung nilai hash kriptografi 64-karakter hex mutlak menggunakan Web Crypto API native untuk mengunci integritas byte berkas.',
    icon: Lock,
    tag: 'Web Crypto SHA-256',
    color: 'from-cyan-600 to-blue-600',
  },
  {
    step: 'STEP 06',
    date: 'Hak Akses Pelapor',
    title: 'Isolasi Case Token',
    desc: 'Menerbitkan Anonymous Case Token (misal: AK-2026-XXXXX) sebagai kunci tunggal pelapor untuk memantau progres tanpa pembuatan akun.',
    icon: Key,
    tag: 'Anonymous Token Lock',
    color: 'from-blue-600 to-indigo-600',
  },
  {
    step: 'STEP 07',
    date: 'Penyimpanan Aman',
    title: 'Enkripsi & Proteksi Transmisi',
    desc: 'Data laporan terkompresi dan terenkripsi disimpan secara terisolasi dengan proteksi ruang penyimpanan peramban pelapor.',
    icon: Database,
    tag: 'Isolated Storage',
    color: 'from-indigo-600 to-teal-600',
  },
  {
    step: 'STEP 08',
    date: 'Verifikasi Satgas',
    title: 'Akses Satgas Terverifikasi',
    desc: 'Tim Satgas PPKS dapat meninjau laporan, memverifikasi keabsahan bukti forensik, dan memberikan balasan dua arah secara anonim.',
    icon: UserCheck,
    tag: 'Verified PPKS Access',
    color: 'from-teal-600 to-emerald-600',
  },
  {
    step: 'STEP 09',
    date: 'Rantai Transparansi',
    title: 'Audit Trail Kronologis',
    desc: 'Setiap aksi perubahan status dan balasan pesan dicatat secara kronologis dalam jejak audit tanpa mengungkap identitas pelapor.',
    icon: History,
    tag: 'Audit Trail Trail',
    color: 'from-emerald-600 to-teal-500',
  },
];

/**
 * Generate Serpentine Circuit Snake Path with rounded 90-degree corners
 * Matches the user-provided diagram:
 * Card 1 (Right) -> horizontal cross -> Card 2 (Left) -> horizontal cross -> Card 3 (Right) -> etc.
 */
function generateSerpentinePath(count: number, startOnRight: boolean = true): string {
  if (count <= 1) return '';
  const x_left = 23;
  const x_right = 77;
  const r = 6; // Corner radius in SVG viewBox coordinates
  const getX = (i: number) =>
    startOnRight ? (i % 2 === 0 ? x_right : x_left) : i % 2 === 0 ? x_left : x_right;

  const startX = getX(0);
  let d = `M ${startX} 0`;

  for (let i = 0; i < count - 1; i++) {
    const curX = getX(i);
    const nextX = getX(i + 1);
    const y_mid = (i + 1) * 100;
    const goingLeft = nextX < curX;

    // 1. Line straight down through current card up to the turn
    d += ` L ${curX} ${y_mid - r}`;

    // 2. First 90-degree rounded turn towards the opposite column
    const turn1TargetX = goingLeft ? curX - r : curX + r;
    d += ` Q ${curX} ${y_mid}, ${turn1TargetX} ${y_mid}`;

    // 3. Horizontal span straight across to the next column
    const turn2StartX = goingLeft ? nextX + r : nextX - r;
    d += ` L ${turn2StartX} ${y_mid}`;

    // 4. Second 90-degree rounded turn downwards into the next card
    d += ` Q ${nextX} ${y_mid}, ${nextX} ${y_mid + r}`;
  }

  // 5. Final vertical line exiting the bottom of the last card
  const lastX = getX(count - 1);
  d += ` L ${lastX} ${count * 100}`;
  return d;
}

export default function PipelineRoadmapSection() {
  const [isExpanded, setIsExpanded] = useState(false);
  const INITIAL_COUNT = 5;
  const visibleCount = isExpanded ? PIPELINE_STEPS.length : INITIAL_COUNT;

  // Serpentine path matching user's sketch (Starts on Right: Card 1 Right -> Card 2 Left -> Card 3 Right...)
  const serpentinePath = useMemo(
    () => generateSerpentinePath(visibleCount, true),
    [visibleCount]
  );

  const renderStepCard = (item: (typeof PIPELINE_STEPS)[0], idx: number) => {
    // Step 01 (idx = 0) is on the RIGHT, Step 02 (idx = 1) is on the LEFT, as per diagram
    const isRight = idx % 2 === 0;
    const IconComponent = item.icon;

    return (
      <div key={item.step} className="relative w-full flex items-center">
        <div
          className={`w-full md:w-[46%] relative z-20 ${
            isRight ? 'md:ml-auto' : 'md:mr-auto'
          }`}
        >
          <div className="group relative bg-[#f4f4f4]/95 dark:bg-gray-700/95 backdrop-blur-xl border border-stone-300 dark:border-gray-600 hover:border-teal-500/60 dark:hover:border-teal-500/60 rounded-3xl p-6 sm:p-7 shadow-md hover:shadow-xl transition-all duration-300">
            {/* Top Accent Gradient Bar */}
            <div className={`h-1.5 w-16 rounded-full bg-gradient-to-r ${item.color} mb-5`} />

            {/* Header: Step Number, Date/Phase, Title, & Icon */}
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span className="font-mono text-xs font-extrabold tracking-wider text-teal-800 dark:text-teal-300 uppercase bg-teal-50 dark:bg-teal-950/80 px-2.5 py-1 rounded-lg border border-teal-200 dark:border-teal-800 shrink-0">
                    {item.step}
                  </span>
                  <span className="text-[11px] font-semibold text-stone-500 dark:text-stone-400 font-mono">
                    {item.date}
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-white pt-1 group-hover:text-teal-700 dark:group-hover:text-teal-400 transition-colors">
                  {item.title}
                </h3>
              </div>

              {/* Embedded Step Icon Chip (inside card) */}
              <div className={`w-11 h-11 rounded-2xl p-0.5 shadow-xs bg-gradient-to-br ${item.color} shrink-0`}>
                <div className="w-full h-full bg-white dark:bg-stone-900 rounded-[14px] flex items-center justify-center text-teal-700 dark:text-teal-400">
                  <IconComponent className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Description (Always Expanded Detail) */}
            <p className="text-stone-600 dark:text-stone-300 text-sm leading-relaxed font-normal mt-4">
              {item.desc}
            </p>

            {/* Bottom Meta & Verification Tag */}
            <div className="flex items-center justify-between pt-4 mt-5 border-t border-stone-200 dark:border-teal-900/60">
              <div className="flex items-center gap-1.5 text-xs font-bold text-teal-800 dark:text-teal-300">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{item.tag}</span>
              </div>
              <span className="text-[11px] font-mono font-medium text-stone-400 dark:text-stone-500">
                Phase 0{idx + 1}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <section className="relative py-12 md:py-20 space-y-16">
      {/* Dynamic Keyframes for Continuous Flowing Dashed Line */}
      <style jsx global>{`
        @keyframes flowDash {
          from {
            stroke-dashoffset: 0;
          }
          to {
            stroke-dashoffset: -36;
          }
        }
        .flowing-dash-line {
          animation: flowDash 2.5s linear infinite;
        }
      `}</style>

      {/* Background Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-teal-500/10 dark:bg-teal-400/5 rounded-full blur-3xl pointer-events-none -z-10" />

      {/* SECTION HEADER */}
      <div className="text-center space-y-4 max-w-3xl mx-auto px-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 dark:bg-teal-950/80 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 text-xs font-bold tracking-wide uppercase shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-teal-500" />
          <span>Alur Perjalanan & Proteksi Laporan</span>
        </div>

        <h2 className="text-3xl md:text-5xl font-extrabold text-stone-900 dark:text-white tracking-tight leading-tight">
          Peta Alur Kerja & Proteksi <br />
          <span className="text-stone-900 dark:text-white font-extrabold">
            RuangAman Platform
          </span>
        </h2>

        <p className="text-stone-600 dark:text-stone-300 text-base md:text-lg leading-relaxed font-medium">
          Alur komprehensif pelaporan anonim dan proteksi data zero-knowledge yang berjalan di peranti Anda.
        </p>
      </div>

      {/* ── ROADMAP PIPELINE CONTAINER ─────────────────────────────────────── */}
      <div className="relative max-w-5xl mx-auto px-4">
        {/* DESKTOP SERPENTINE CIRCUIT FLOWING DASHED LINE (Z-INDEX: 0 / BEHIND CARDS) */}
        <div className="hidden md:block absolute inset-0 pointer-events-none z-0">
          <svg
            className="w-full h-full overflow-visible"
            viewBox={`0 0 100 ${visibleCount * 100}`}
            preserveAspectRatio="none"
          >
            <defs>
              <linearGradient id="curveFlowGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#0f766e" stopOpacity="0.85" />
                <stop offset="35%" stopColor="#14b8a6" stopOpacity="0.95" />
                <stop offset="70%" stopColor="#06b6d4" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.85" />
              </linearGradient>
            </defs>

            {/* Ambient Glow Trail Behind */}
            <path
              d={serpentinePath}
              fill="none"
              stroke="currentColor"
              className="text-teal-500/15 dark:text-teal-400/20"
              strokeWidth="6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Active Animated Dashed Serpentine Flow */}
            <path
              d={serpentinePath}
              fill="none"
              stroke="url(#curveFlowGradient)"
              strokeWidth="2.5"
              strokeDasharray="10 8"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="flowing-dash-line"
            />
          </svg>
        </div>

        {/* MOBILE FLOWING DASHED LINE (Z-INDEX: 0 / BEHIND CARDS) */}
        <div className="md:hidden absolute left-6 top-10 bottom-10 w-1 pointer-events-none z-0">
          <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
            <line
              x1="50%"
              y1="0"
              x2="50%"
              y2="100%"
              stroke="currentColor"
              className="text-teal-600/60 dark:text-teal-400/50 flowing-dash-line"
              strokeWidth="2.5"
              strokeDasharray="10 8"
            />
          </svg>
        </div>

        {/* STEP CARDS CONTAINER */}
        <div className="space-y-8 md:space-y-12 relative z-10">
          {/* Initial 5 Steps */}
          {PIPELINE_STEPS.slice(0, INITIAL_COUNT).map((item, idx) => renderStepCard(item, idx))}

          {/* Remaining Steps 6 - 9 (Smoothly Animated on Toggle) */}
          <AnimatePresence initial={false}>
            {isExpanded && (
              <motion.div
                key="remaining-steps"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-8 md:space-y-12 overflow-hidden pt-8 md:pt-12"
              >
                {PIPELINE_STEPS.slice(INITIAL_COUNT).map((item, index) => {
                  const idx = index + INITIAL_COUNT;
                  return renderStepCard(item, idx);
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* TOGGLE EXPAND / COLLAPSE BUTTON */}
        <div className="pt-12 text-center relative z-20">
          <button
            type="button"
            onClick={() => setIsExpanded(!isExpanded)}
            className="group inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-teal-800 hover:bg-teal-700 dark:bg-teal-900/90 dark:hover:bg-teal-800 text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 cursor-pointer border border-teal-700 dark:border-teal-600"
          >
            {isExpanded ? (
              <>
                <span>Sembunyikan Alur (Tampilkan 5 Langkah Utama)</span>
                <ChevronUp className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
              </>
            ) : (
              <>
                <span>Lihat Seluruh Alur Sistem (9 Langkah)</span>
                <ChevronDown className="w-4 h-4 transition-transform group-hover:translate-y-0.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </section>
  );
}
