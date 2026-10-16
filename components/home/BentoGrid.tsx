'use client';

import React from 'react';
import { motion, type Variants } from 'framer-motion';
import {
  Lock,
  EyeOff,
  HeartPulse,
  KeyRound,
  ArrowUpRight
} from 'lucide-react';

const FADE_UP: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 }
};

const FADE_UP_TRANSITION = { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const };

const STAGGER: Variants = {
  visible: { transition: { staggerChildren: 0.1 } }
};

export default function BentoGrid() {
  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.15 }}
      variants={STAGGER}
      className="space-y-10"
    >
      <motion.div variants={FADE_UP} transition={FADE_UP_TRANSITION} className="text-center space-y-4 max-w-2xl mx-auto">
        <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          Infrastruktur{' '}
          <span className="bg-gradient-to-r from-teal-600 to-emerald-500 dark:from-teal-400 dark:to-emerald-400 bg-clip-text text-transparent">
            Nir-Percaya
          </span>
        </h2>
        <p className="text-slate-600 dark:text-slate-400 text-base md:text-lg leading-relaxed">
          Platform dirancang khusus berstandar keamanan siber tingkat tinggi. Menghilangkan ketergantungan pada kepercayaan individu demi keamanan yang absolut.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-6xl mx-auto">

        {/* Card 1: Zero Knowledge — Span 2 */}
        <motion.div
          variants={FADE_UP}
          transition={FADE_UP_TRANSITION}
          whileHover={{ y: -4 }}
          className="md:col-span-2 group relative overflow-hidden rounded-2xl bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 p-8 sm:p-10 hover:border-teal-300 dark:hover:border-teal-500/50 hover:shadow-lg dark:hover:shadow-[0_10px_30px_rgba(13,148,136,0.15)] transition-all cursor-pointer"
        >
          <div className="absolute -top-8 -right-8 opacity-5 dark:opacity-10 group-hover:opacity-10 dark:group-hover:opacity-20 transition-opacity">
            <EyeOff className="w-48 h-48 text-teal-600 dark:text-teal-400 group-hover:rotate-12 transition-transform duration-700" />
          </div>
          <div className="relative z-10 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-teal-50 dark:bg-teal-500/10 border border-teal-200 dark:border-teal-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <EyeOff className="w-6 h-6 text-teal-600 dark:text-teal-400" />
            </div>
            <h3 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Zero-Knowledge Identity
              <ArrowUpRight className="w-5 h-5 text-slate-400 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
            </h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm md:text-base leading-relaxed max-w-lg">
              Tanpa formulir registrasi, Nama, Email, NIK, maupun NIM. Kami memisahkan data identitas dari laporan secara sistematis. Bahkan pengelola server tidak memiliki akses log IP pelapor.
            </p>
          </div>
        </motion.div>

        {/* Card 2: E2E Encryption */}
        <motion.div
          variants={FADE_UP}
          transition={FADE_UP_TRANSITION}
          whileHover={{ y: -4 }}
          className="group relative overflow-hidden rounded-2xl bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 p-8 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-lg transition-all cursor-pointer"
        >
          <div className="relative z-10 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Lock className="w-6 h-6 text-slate-700 dark:text-slate-300" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Client-Side E2E Encryption</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              Seluruh berkas bukti dan kronologi tersandi secara lokal di dalam browser Anda sebelum dikirimkan melalui protokol aman.
            </p>
          </div>
        </motion.div>

        {/* Card 3: Anonymous Tracking */}
        <motion.div
          variants={FADE_UP}
          transition={FADE_UP_TRANSITION}
          whileHover={{ y: -4 }}
          className="group relative overflow-hidden rounded-2xl bg-white/80 dark:bg-slate-900/60 backdrop-blur-xl border border-slate-200 dark:border-slate-800 p-8 hover:border-emerald-200 dark:hover:border-emerald-500/50 hover:shadow-lg transition-all cursor-pointer"
        >
          <div className="relative z-10 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <KeyRound className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">Anonymous Tracking Token</h3>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              Lacak status penanganan kasus Anda tanpa perlu login, cukup menggunakan Token Unik Kriptografi yang dibuat otomatis.
            </p>
          </div>
        </motion.div>

        {/* Card 4: Psychological First Aid — Span 2 */}
        <motion.div
          variants={FADE_UP}
          transition={FADE_UP_TRANSITION}
          whileHover={{ y: -4 }}
          className="md:col-span-2 group relative overflow-hidden rounded-2xl bg-rose-50/80 dark:bg-rose-950/20 backdrop-blur-xl border border-rose-100 dark:border-rose-900/40 p-8 sm:p-10 hover:border-rose-200 dark:hover:border-rose-800 transition-all cursor-pointer"
        >
          <div className="relative z-10 flex flex-col md:flex-row gap-7 items-center">
            <div className="w-16 h-16 rounded-2xl bg-white dark:bg-slate-900 border border-rose-200 dark:border-rose-800/60 shrink-0 flex items-center justify-center shadow-xs">
              <HeartPulse className="w-8 h-8 text-rose-500 dark:text-rose-400" />
            </div>
            <div className="space-y-2 text-center md:text-left">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-slate-100">Psychological First Aid & Support</h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm md:text-base leading-relaxed">
                Kami memprioritaskan kondisi psikologis pelapor. Platform dilengkapi panduan penanganan kecemasan awal serta modul relaksasi mandiri yang dapat diakses kapan saja sebelum menuliskan aduan.
              </p>
            </div>
          </div>
        </motion.div>

      </div>
    </motion.section>
  );
}
