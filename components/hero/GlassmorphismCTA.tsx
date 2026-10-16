'use client';

import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { ChevronRight, ShieldAlert, KeyRound, Download } from 'lucide-react';
import Link from 'next/link';

const FADE_UP: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

const FADE_UP_TRANSITION = { duration: 0.4, ease: [0.215, 0.61, 0.355, 1] as const };

export default function GlassmorphismCTA() {
  return (
    <motion.div
      variants={FADE_UP}
      transition={FADE_UP_TRANSITION}
      className="flex flex-col items-stretch gap-3 pt-2 relative z-10"
    >
      {/* Baris Pertama: Mulai Pelaporan & Cek Status */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <Link
          href="/report"
          className="inline-flex items-center justify-center gap-2.5 bg-teal-800 hover:bg-teal-900 text-white font-semibold px-7 py-3.5 rounded-xl transition-colors border border-teal-900 text-sm"
        >
          <ShieldAlert className="w-5 h-5 text-teal-100" />
          <span>Mulai pelaporan aman</span>
          <ChevronRight className="w-5 h-5" />
        </Link>

        <Link
          href="/track"
          className="inline-flex items-center justify-center gap-2.5 bg-[#f0f0f0] hover:bg-stone-200 dark:bg-[#163432] dark:hover:bg-[#1e4e4a] text-stone-800 hover:text-stone-900 dark:text-stone-100 font-semibold px-7 py-3.5 rounded-xl transition-colors border border-stone-300 dark:border-teal-900 text-sm"
        >
          <KeyRound className="w-4 h-4 text-teal-800 dark:text-teal-400" />
          <span>Cek status token</span>
        </Link>
      </div>

      {/* Baris Kedua: Tombol Unduh Panduan dengan Gaya Kotak yang Sama */}
      <div className="flex">
        <a
          href="/Panduan.pdf" // Ganti dengan nama file Anda di folder public
          download="Panduan-Penggunaan-AmanKampus.pdf"
          className="inline-flex items-center justify-center gap-2.5 bg-[#e7dede] hover:bg-stone-200 dark:bg-teal-600 dark:hover:bg-stone-600 text-stone-800 hover:text-stone-900 dark:text-stone-100 font-semibold px-7 py-3.5 rounded-xl transition-colors border border-stone-300 dark:border-stone-500 text-sm w-full sm:w-auto"
        >
          <Download className="w-4 h-4 text-teal-800 dark:text-teal-400" />
          <span>Unduh Panduan Penggunaan (PDF)</span>
        </a>
      </div>
    </motion.div>
  );
}