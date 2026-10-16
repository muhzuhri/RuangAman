'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence, type Variants } from 'framer-motion';
import { ShieldCheck } from 'lucide-react';

const FADE_UP: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 }
};

const FADE_UP_TRANSITION = { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const };

const generateCipher = (text: string) => {
  if (!text) return '';
  const buffer = Array.from(text).map(c => c.charCodeAt(0).toString(16)).join('');
  return `enc_v1_${buffer}_x${text.length}ab92`;
};

export default function EncryptionSimulator() {
  const [simInput, setSimInput] = useState('');

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={FADE_UP}
      transition={FADE_UP_TRANSITION}
      className="relative max-w-5xl mx-auto home-block"
    >
      <div className="bg-[#f4f4f4] dark:bg-[#163432] border border-stone-300 dark:border-stone-600 rounded-2xl p-8 md:p-12 shadow-sm space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="w-14 h-14 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-2xl flex items-center justify-center mx-auto">
            <ShieldCheck className="w-8 h-8 text-teal-800 dark:text-teal-400" />
          </div>
          <h2 className="text-3xl md:text-4xl font-semibold text-stone-900 dark:text-white">Simulator enkripsi bukti data</h2>
          <p className="text-stone-500 dark:text-stone-400 text-sm md:text-base leading-relaxed">
            Cobalah mensimulasikan bagaimana teks laporan Anda diubah menjadi data kriptografi rahasia yang tidak dapat dipecahkan tanpa kunci khusus.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 items-stretch bg-stone-50 dark:bg-stone-900 p-6 md:p-8 rounded-2xl border border-stone-100 dark:border-stone-700">
          <div className="space-y-3 flex flex-col">
            <label className="text-xs font-semibold text-stone-600 dark:text-stone-400 uppercase tracking-wider">Input pesan simulasi</label>
            <textarea
              rows={5}
              value={simInput}
              onChange={(e) => setSimInput(e.target.value)}
              placeholder="Ketik contoh isi laporan di sini..."
              className="w-full flex-1 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-600 rounded-xl p-4 text-stone-800 dark:text-stone-100 focus:outline-none focus:border-teal-700 focus:ring-2 focus:ring-teal-800/15 resize-none text-sm placeholder:text-stone-400 font-sans"
            />
          </div>
          <div className="space-y-3 flex flex-col">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-stone-600 dark:text-stone-400 uppercase tracking-wider">Hasil enkripsi (AES-256 mock)</label>
              <span className="text-[10px] text-teal-800 dark:text-teal-300 bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-600 px-2 py-0.5 rounded font-mono font-bold flex items-center gap-1">
                Secure
              </span>
            </div>
            <div className="flex-1 bg-stone-900 rounded-xl p-4 border border-stone-800 font-mono text-xs text-teal-300 break-all overflow-y-auto min-h-[120px] flex items-center leading-relaxed">
              {simInput ? (
                <motion.div
                  key={simInput}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="whitespace-pre-wrap"
                >
                  {generateCipher(simInput).repeat(2) + "7f8b9a2c"}
                </motion.div>
              ) : (
                <span className="text-stone-500 italic font-sans">Hasil enkripsi akan tampil di sini saat Anda mengetik...</span>
              )}
            </div>
          </div>
        </div>

        <AnimatePresence>
          {simInput && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="flex flex-col sm:flex-row items-center justify-between bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-2xl p-5 gap-4"
            >
              <div className="flex items-center gap-3">
                <div className="bg-white dark:bg-stone-800 p-3 rounded-xl border border-stone-200 dark:border-stone-600">
                  <ShieldCheck className="w-5 h-5 text-teal-800 dark:text-teal-400" />
                </div>
                <div>
                  <span className="block text-stone-600 dark:text-stone-400 text-xs font-semibold uppercase tracking-wider mb-0.5">Token pelacakan terbuat</span>
                  <span className="font-mono text-stone-800 dark:text-stone-100 font-bold tracking-widest text-lg">AK-{(simInput.length * 937) % 9000 + 1000}-SEC</span>
                </div>
              </div>
              <span className="text-xs text-stone-600 dark:text-stone-400 font-medium text-center sm:text-right max-w-[220px]">
                Simpan token ini untuk memantau progres tanpa identitas.
              </span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.section>
  );
}
