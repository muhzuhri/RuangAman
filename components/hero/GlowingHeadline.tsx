'use client';

import React from 'react';
import { motion, type Variants } from 'framer-motion';
import { Lock, ShieldCheck, Fingerprint } from 'lucide-react';

const FADE_UP: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

const FADE_UP_TRANSITION = { duration: 0.4, ease: [0.215, 0.61, 0.355, 1] as const };

export default function GlowingHeadline() {
  return (
    <div className="space-y-7 relative z-10 text-left">
      <motion.div
        variants={FADE_UP}
        transition={FADE_UP_TRANSITION}
        className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-stone-300 dark:border-gray-600 bg-[#f0f0f0] dark:bg-gray-700 text-stone-700 dark:text-stone-200 text-xs md:text-sm font-medium"
      >
        <span className="inline-flex rounded-full h-2 w-2 bg-teal-700" />
        <span>Pelaporan anonim terenkripsi untuk civitas kampus</span>
      </motion.div>

      <motion.div variants={FADE_UP} transition={FADE_UP_TRANSITION} className="space-y-2">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-tight leading-[1.12] text-stone-800 dark:text-stone-50">
          Ruang Aman{' '}
          <span className="text-teal-800 dark:text-teal-400">Tanpa Rasa Takut</span>
          <br />
          <span className="text-stone-700 dark:text-stone-200">untuk Seluruh Sivitas Akademika.</span>
        </h1>
      </motion.div>

      <motion.p
        variants={FADE_UP}
        transition={FADE_UP_TRANSITION}
        className="text-base sm:text-lg text-stone-600 dark:text-stone-400 leading-relaxed max-w-xl"
      >
        Sistem pengaduan rahasia berbasis Zero-Knowledge Architecture. Melindungi pelapor dari perundungan, intimidasi, dan kekerasan tanpa mencatat identitas diri di server.
      </motion.p>

      <motion.div
        variants={FADE_UP}
        transition={FADE_UP_TRANSITION}
        className="flex flex-wrap items-center gap-5 text-xs sm:text-sm text-stone-600 dark:text-stone-400 font-medium pt-1"
      >
        <div className="flex items-center gap-2">
          <Fingerprint className="w-4 h-4 text-teal-800 dark:text-teal-400" />
          <span>Tanpa login / Informasi Pribasi</span>
        </div>
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-teal-800 dark:text-teal-400" />
          <span>Keamanan sisi klien </span>
        </div>
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-teal-800 dark:text-teal-400" />
          <span>PPKS compliant</span>
        </div>
      </motion.div>
    </div>
  );
}
