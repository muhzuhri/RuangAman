'use client';

import React, { useState } from 'react';
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
  CheckCircle2,
} from 'lucide-react';

const PIPELINE_STEPS = [
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

export default function PipelineRoadmapSection() {
  const [openStep, setOpenStep] = useState<number | null>(null);

  const toggleStep = (idx: number) => {
    setOpenStep((prev) => (prev === idx ? null : idx));
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
            stroke-dashoffset: -40;
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
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-teal-50 dark:bg-teal-950/80 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-300 text-xs font-bold tracking-wide uppercase shadow-xs">
          <Sparkles className="w-3.5 h-3.5 text-teal-500" />
          <span>Alur Perjalanan & Proteksi Laporan</span>
        </div>
        
        <h2 className="text-3xl md:text-5xl font-extrabold text-stone-900 dark:text-white tracking-tight leading-tight">
          Peta Alur 9-Tahap Proteksi <br />
          <span className="text-stone-900 dark:text-white font-extrabold">
            AmanKampus Platform
          </span>
        </h2>
        
        <p className="text-stone-600 dark:text-stone-300 text-base md:text-lg leading-relaxed font-medium">
          Tekan setiap tahap untuk melihat detail proteksi data yang berjalan di peranti Anda.
        </p>
      </div>

      {/* ── ROADMAP PIPELINE CONTAINER ─────────────────────────────────────── */}
      <div className="relative max-w-5xl mx-auto px-4">
        
        {/* CENTER CONTINUOUS FLOWING DASHED LINE (DESKTOP) */}
        <div className="hidden md:block absolute left-1/2 top-10 bottom-10 -translate-x-1/2 w-1 pointer-events-none z-0">
          <svg className="w-full h-full overflow-visible" preserveAspectRatio="none">
            <line
              x1="50%"
              y1="0"
              x2="50%"
              y2="100%"
              stroke="currentColor"
              className="text-teal-500/60 dark:text-teal-400/50 flowing-dash-line"
              strokeWidth="3.5"
              strokeDasharray="12 10"
            />
          </svg>
        </div>

        {/* STEP CARDS GRID (ZIGZAG LAYOUT) */}
        <div className="space-y-8 md:space-y-12 relative z-10">
          {PIPELINE_STEPS.map((item, idx) => {
            const isEven = idx % 2 === 0;
            const isOpen = openStep === idx;
            const IconComponent = item.icon;

            return (
              <div
                key={idx}
                className={`flex flex-col md:flex-row items-center gap-6 md:gap-8 ${
                  isEven ? 'md:flex-row-reverse' : ''
                }`}
              >
                {/* CARD CONTENT (CLICK TO EXPAND DETAILS) */}
                <div className="w-full md:w-1/2 px-2">
                  <div
                    onClick={() => toggleStep(idx)}
                    className={`group cursor-pointer relative bg-white/90 dark:bg-[#163432] backdrop-blur-xl border rounded-3xl p-5 sm:p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-0.5 ${
                      isOpen
                        ? 'border-teal-500 ring-2 ring-teal-500/20 shadow-xl'
                        : 'border-stone-200 dark:border-teal-900 hover:border-teal-400/60'
                    }`}
                  >
                    {/* Top Accent Bar */}
                    <div className={`h-1.5 w-16 rounded-full bg-gradient-to-r ${item.color} mb-4`} />

                    {/* Step Card Header */}
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-extrabold tracking-wider text-teal-700 dark:text-teal-300 uppercase bg-teal-50 dark:bg-teal-950 px-2.5 py-1 rounded-lg border border-teal-200 dark:border-teal-800 shrink-0">
                          {item.step}
                        </span>
                        <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                          {item.title}
                        </h3>
                      </div>

                      <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-stone-100 dark:bg-[#0a2220] text-stone-600 dark:text-stone-300 transition-transform duration-300 shrink-0 ${isOpen ? 'rotate-180 bg-teal-50 dark:bg-teal-950 text-teal-600' : ''}`}>
                        <ChevronDown className="w-4 h-4" />
                      </div>
                    </div>

                    {/* EXPANDABLE DETAILS (SLIDE IN UPON CLICK) */}
                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden pt-4 mt-4 border-t border-stone-100 dark:border-stone-800 space-y-4"
                        >
                          <p className="text-stone-600 dark:text-stone-300 text-sm leading-relaxed font-medium">
                            {item.desc}
                          </p>

                          <div className="flex items-center justify-between pt-1">
                            <div className="flex items-center gap-1.5 text-xs font-bold text-teal-700 dark:text-teal-300">
                              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                              <span>{item.tag}</span>
                            </div>

                            <span className="text-[11px] font-semibold text-stone-400 font-mono">
                              {item.date}
                            </span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>

                {/* CENTRAL ROADMAP NODE CIRCLE */}
                <div
                  onClick={() => toggleStep(idx)}
                  className="relative shrink-0 flex items-center justify-center my-1 md:my-0 cursor-pointer"
                >
                  <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl p-0.5 shadow-md transition-all duration-300 ${isOpen ? 'scale-110 ring-4 ring-teal-500/30' : 'hover:scale-105'} bg-gradient-to-br ${item.color}`}>
                    <div className="w-full h-full bg-stone-900 rounded-[14px] flex items-center justify-center text-teal-400">
                      <IconComponent className="w-6 h-6" />
                    </div>
                  </div>
                </div>

                {/* EMPTY BALANCING COLUMN (DESKTOP) */}
                <div className="hidden md:block w-1/2" />
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
