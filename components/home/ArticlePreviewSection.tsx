'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Clock, ArrowRight, Sparkles, Calendar, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface ArticlePreview {
  id: string;
  title: string;
  category: string;
  readTime: string;
  date: string;
  excerpt: string;
  image: string;
}

const PREVIEW_ARTICLES: ArticlePreview[] = [
  {
    id: 'metadata-digital-forensics',
    title: 'Panduan Lengkap Perlindungan Metadata & Forensik Digital Pelapor',
    category: 'Keamanan & Privasi',
    readTime: '6 min baca',
    date: '4 Sep 2026',
    excerpt: 'Pembersihan otomatis EXIF metadata lokasi GPS dan sertifikasi SHA-256 hash untuk perlindungan mutlak identitas pelapor.',
    image: '/images/article_cybersecurity.png',
  },
  {
    id: 'ppks-case-workflow',
    title: 'Prosedur Standar Penanganan Kasus oleh Satgas PPKS Kampus',
    category: 'Alur & Penanganan',
    readTime: '8 min baca',
    date: '3 Sep 2026',
    excerpt: 'Langkah transparan penerimaan aduan anonim, verifikasi bukti forensik, pendampingan PFA, hingga sanksi administratif Rektor.',
    image: '/images/article_ppks.png',
  },
  {
    id: 'pfa-trauma-grounding',
    title: 'Pertolongan Pertama Psikologis (PFA): Mengatasi Trauma & Cemas',
    category: 'Kesehatan Mental',
    readTime: '7 min baca',
    date: '28 Agt 2026',
    excerpt: 'Panduan praktis grounding 5-4-3-2-1 dan pernapasan diafragma 4-7-8 untuk meredakan kepanikan secara mandiri.',
    image: '/images/article_mental_health.png',
  },
];

export default function ArticlePreviewSection() {
  return (
    <section className="relative z-10 space-y-10">
      {/* SECTION HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 px-3.5 py-1 rounded-full text-xs font-bold text-teal-700 dark:text-teal-300">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Literasi & Panduan Resmi</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
            Artikel & Edukasi Terkini
          </h2>
          <p className="text-sm md:text-base text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
            Pelajari panduan keamanan digital, perlindungan hukum civitas akademika, serta bantuan kesehatan emosional.
          </p>
        </div>

        <Link
          href="/education"
          className="inline-flex items-center gap-2 text-xs font-bold text-teal-600 dark:text-teal-400 hover:text-teal-500 dark:hover:text-teal-300 transition-colors group cursor-pointer shrink-0"
        >
          <span>Lihat Semua Artikel</span>
          <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* 3 ARTICLES GRID (1 ROW) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PREVIEW_ARTICLES.map((item, idx) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: idx * 0.1 }}
            className="group bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200 dark:border-slate-800 rounded-3xl overflow-hidden shadow-sm hover:shadow-xl hover:border-teal-500/50 transition-all duration-300 flex flex-col justify-between"
          >
            {/* Card Thumbnail Image */}
            <div className="relative aspect-video w-full overflow-hidden bg-slate-100 dark:bg-slate-800">
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-80" />
              
              <span className="absolute top-3 left-3 px-3 py-1 rounded-full text-[10px] font-bold bg-white/90 dark:bg-slate-900/90 text-teal-700 dark:text-teal-300 backdrop-blur-md border border-white/20 shadow-xs">
                {item.category}
              </span>
            </div>

            {/* Card Body */}
            <div className="p-6 space-y-3 flex-1 flex flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-teal-500" />
                    {item.readTime}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {item.date}
                  </span>
                </div>

                <h3 className="text-base font-extrabold text-slate-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors line-clamp-2 leading-snug">
                  {item.title}
                </h3>

                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed line-clamp-3 font-medium">
                  {item.excerpt}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80">
                <Link
                  href="/education"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 dark:text-teal-400 group-hover:translate-x-1 transition-transform cursor-pointer"
                >
                  <span>Baca Artikel Selengkapnya</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* BOTTOM BUTTON: LIHAT SEMUA ARTIKEL */}
      <div className="pt-4 flex justify-center">
        <Link
          href="/education"
          className="inline-flex items-center gap-3 bg-teal-600 hover:bg-teal-500 text-white font-bold text-sm px-8 py-3.5 rounded-2xl shadow-lg shadow-teal-600/20 hover:shadow-teal-600/40 transition-all hover:scale-[1.02] cursor-pointer"
        >
          <BookOpen className="w-4 h-4 text-teal-200" />
          <span>Lihat Semua Artikel Edukasi</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}
