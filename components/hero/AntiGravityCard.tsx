'use client';

import React, { useState } from 'react';
import { motion, type Variants } from 'framer-motion';
import { Activity, ShieldCheck, Terminal, CheckCircle2, Cpu } from 'lucide-react';

const FADE_UP: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

const FADE_UP_TRANSITION = { duration: 0.4, ease: [0.215, 0.61, 0.355, 1] as const };

const generateCipher = (text: string) => {
  if (!text) return '';
  const buffer = Array.from(text).map((c) => c.charCodeAt(0).toString(16)).join('');
  return `enc_v2_ai_${buffer}_x${text.length}ff99a0`;
};

export default function AntiGravityCard() {
  const [heroInput, setHeroInput] = useState('');

  return (
    <motion.div
      variants={FADE_UP}
      transition={FADE_UP_TRANSITION}
      className="relative z-10 w-full"
    >
      <div
        className="relative rounded-2xl border border-stone-300 dark:border-teal-900 bg-[#f7f7f7] dark:bg-[#163432] p-6 sm:p-8 shadow-2xl space-y-6 overflow-hidden"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Subtle background gradient highlight */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

        {/* Card Header with 3D Depth */}
        <div
          className="flex items-center justify-between border-b border-stone-200 dark:border-stone-700 pb-4"
          style={{ transform: 'translateZ(25px)' }}
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/80 border border-teal-200 dark:border-teal-800 text-teal-700 dark:text-teal-400 shadow-sm">
              <Activity className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                <span>Simulasi Enkripsi Kriptografi</span>
                <span className="inline-block w-2 h-2 rounded-full bg-teal-500 animate-ping" />
              </h3>
              <p className="text-[11px] text-stone-500 dark:text-stone-400 font-medium">Transformasi sandi instan di perangkat Anda</p>
            </div>
          </div>
          <span className="text-[10px] font-mono tracking-wider uppercase bg-teal-50 dark:bg-stone-900 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 px-2.5 py-1 rounded-full font-bold shadow-xs">
            Client-side AES
          </span>
        </div>

        {/* Input & Output Area with 3D Depth */}
        <div className="space-y-4" style={{ transform: 'translateZ(35px)' }}>
          <div>
            <label className="text-xs font-bold text-stone-700 dark:text-stone-300 mb-2 flex items-center gap-1.5 tracking-wider uppercase">
              <Terminal className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
              <span>Input Pesan Rahasia</span>
            </label>
            <input
              type="text"
              value={heroInput}
              onChange={(e) => setHeroInput(e.target.value)}
              placeholder="Ketik contoh laporan di sini..."
              className="w-full bg-white dark:bg-stone-900 border border-stone-300 dark:border-stone-600 focus:border-teal-600 rounded-xl px-4 py-3.5 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-600/20 font-mono text-xs sm:text-sm shadow-xs transition-all"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-stone-700 dark:text-stone-300 mb-2 flex items-center justify-between tracking-wider uppercase">
              <span className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
                <span>Hasil Cipher Hash</span>
              </span>
              <span className="text-[10px] text-teal-700 dark:text-teal-400 font-mono font-bold">SHA-256 Mock</span>
            </label>
            <div className="w-full bg-stone-900 border border-stone-800 rounded-xl px-4 py-4 text-teal-300 font-mono text-xs break-all min-h-[64px] flex items-center leading-relaxed shadow-inner">
              {heroInput ? (
                <span className="tracking-wide text-teal-300 font-bold">{generateCipher(heroInput)}</span>
              ) : (
                <span className="text-stone-500 italic font-sans text-xs">
                  Ketik teks di atas untuk melihat transformasi kriptografi 3D...
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Card Footer with 3D Depth */}
        <div
          className="pt-3 flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 border-t border-stone-200 dark:border-stone-700"
          style={{ transform: 'translateZ(20px)' }}
        >
          <span className="flex items-center gap-1.5 text-stone-700 dark:text-stone-300 font-semibold text-[11px]">
            <CheckCircle2 className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
            Kunci dekripsi 100% lokal di browser
          </span>
          <span className="text-teal-700 dark:text-teal-400 font-bold flex items-center gap-1 text-[11px]">
            <ShieldCheck className="w-4 h-4" /> Anonimitas Terjamin
          </span>
        </div>
      </div>
    </motion.div>
  );
}
