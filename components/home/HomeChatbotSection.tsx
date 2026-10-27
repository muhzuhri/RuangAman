'use client';

import React from 'react';
import { Bot, MessageSquareHeart, Sparkles } from 'lucide-react';
import HomeEmbeddedPfaChatbot from '@/components/home/HomeEmbeddedPfaChatbot';

export default function HomeChatbotSection() {
  return (
    <section aria-labelledby="home-pfa-chatbot-title" className="space-y-6">
      {/* ── SECTION HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-stone-200 dark:border-gray-600 pb-4">
        <div className="space-y-1 max-w-3xl">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Pendamping Psikologis Awal (PFA AI)</span>
          </div>
          <h2
            id="home-pfa-chatbot-title"
            className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-stone-50 flex items-center gap-2.5 tracking-tight"
          >
            <MessageSquareHeart className="w-7 h-7 text-teal-600 dark:text-teal-400 shrink-0" />
            <span>Konsultasi & Ruang Curhat Aman Bersama Ara</span>
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 font-medium leading-relaxed">
            Ara adalah asisten AI Psychological First Aid kami yang siap mendengarkan 24/7 dengan empati penuh, aman, dan 100% anonim. Bagikan keluh kesah Anda untuk meredakan kecemasan dan memperoleh panduan langkah awal.
          </p>
        </div>

        <div className="hidden sm:flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-full bg-teal-50 dark:bg-teal-950/70 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 shrink-0 self-start md:self-end">
          <Bot className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
          <span>Tersedia Chat Teks & Avatar Suara</span>
        </div>
      </div>

      {/* ── EMBEDDED PFA CHATBOT (SAMA PERSIS DENGAN CHATBOT POJOK KANAN BAWAH) ── */}
      <div className="relative">
        <HomeEmbeddedPfaChatbot />
      </div>
    </section>
  );
}
