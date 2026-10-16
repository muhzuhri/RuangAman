"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  ShieldCheck,
  FileText,
  HelpCircle,
  ChevronDown,
  ShieldAlert,
  Clock,
  Calendar,
  X,
  Share2,
  Check,
  ChevronRight,
  BookMarked,
} from "lucide-react";
import Image from "next/image";
import {
  VIOLATIONS_CATALOG,
  ARTICLES_DATA,
  EDU_FAQS,
  VICTIM_RIGHTS,
  type Article,
} from "@/data/educationData";

// ─── Main Education Page ──────────────────────────────────────────────────────

export default function EducationPage() {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Close modal on ESC key & disable background scroll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedArticle(null);
      }
    };
    if (selectedArticle) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [selectedArticle]);

  const toggleFaq = (idx: number) => {
    setOpenFaqIndex(openFaqIndex === idx ? null : idx);
  };

  const handleCopyShare = () => {
    if (selectedArticle) {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  return (
    <div className="min-h-screen bg-transparent text-stone-900 dark:text-stone-100 font-sans selection:bg-[#163432] pt-24 pb-20">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 space-y-16 relative z-10">
        {/* Hero Banner */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 px-4 py-1.5 rounded-full text-indigo-700 dark:text-indigo-300 text-xs font-bold shadow-xs">
            <BookOpen className="w-4 h-4" /> Literasi & Edukasi Pelindungan
            Mahasiswa
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-stone-900 dark:text-stone-50">
            Pahami Hak Anda & Kenali Bentuk Pelanggaran
          </h1>
          <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300 leading-relaxed font-medium">
            Edukasi komprehensif mengenai batasan hukum, bentuk kekerasan
            digital/akademik, serta jaminan perlindungan mutlak bagi seluruh
            civitas akademika AmanKampus.
          </p>
        </div>

        {/* KATALOG BENTUK PELANGGARAN */}
        <div className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold text-stone-900 dark:text-stone-50 flex items-center gap-2.5">
              <ShieldAlert className="w-6 h-6 text-rose-600 dark:text-rose-400" />{" "}
              Katalog Bentuk Pelanggaran
            </h2>
            <p className="text-sm text-stone-600 dark:text-stone-300 font-medium">
              Pelajari kategori kekerasan digital & akademik yang dilindungi
              oleh peraturan kampus dan undang-undang nasional.
            </p>
          </div>

          <div className="relative pl-4 md:pl-6 border-l-2 border-stone-200 dark:border-stone-600 space-y-4">
            {VIOLATIONS_CATALOG.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -15 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.3, delay: i * 0.08 }}
                className="relative group"
              >
                <div className="absolute -left-[21px] md:-left-[29px] top-5 w-3.5 h-3.5 rounded-full bg-stone-300 dark:bg-[#163432] border-2 border-white dark:border-stone-950 group-hover:bg-teal-500 group-hover:scale-125 transition-all duration-300" />

                <div className="bg-white/90 dark:bg-[#163432] backdrop-blur-xl border border-stone-200 dark:border-stone-600/80 rounded-2xl p-5 md:p-6 space-y-3 shadow-xs hover:border-teal-500/50 hover:shadow-md transition-all">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-xs font-bold text-stone-500 dark:text-stone-400">
                        [{item.number}]
                      </span>
                      <div className="p-1.5 rounded-lg bg-stone-100 dark:bg-stone-700 shrink-0">
                        {item.icon}
                      </div>
                      <h3 className="text-base sm:text-lg font-bold text-stone-900 dark:text-stone-50">
                        {item.category}
                      </h3>
                    </div>
                    <span className="self-start sm:self-auto text-[10px] font-bold px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-700 text-stone-800 dark:text-stone-300 border border-stone-200 dark:border-stone-500">
                      {item.tag}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 leading-relaxed font-medium pl-0 sm:pl-9">
                    {item.desc}
                  </p>

                  <div className="pl-0 sm:pl-9 pt-1 space-y-1.5">
                    <p className="text-[10px] font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
                      Contoh Indikator Tindakan:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {item.examples.map((ex, idx) => (
                        <div
                          key={idx}
                          className="text-xs text-stone-800 dark:text-stone-200 bg-stone-50 dark:bg-[#14302c]/60 px-3 py-1.5 rounded-lg border border-stone-200/60 dark:border-stone-600/60 flex items-center gap-1.5 font-medium"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                          <span className="truncate">{ex}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pl-0 sm:pl-9 pt-2 border-t border-stone-100 dark:border-stone-600/80 text-[11px] text-stone-600 dark:text-stone-400 font-mono flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                    <span>
                      Landasan Hukum:{" "}
                      <strong className="text-stone-800 dark:text-stone-200">
                        {item.legalBasis}
                      </strong>
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* HAK-HAK KORBAN & JAMINAN PERLINDUNGAN */}
        <div className="bg-white/90 dark:bg-[#163432] backdrop-blur-xl border border-stone-200 dark:border-stone-600 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold text-stone-900 dark:text-stone-50 flex items-center gap-2.5">
              <ShieldCheck className="w-6 h-6 text-teal-600 dark:text-teal-400" />{" "}
              Hak Korban & Jaminan Perlindungan Mutlak
            </h2>
            <p className="text-sm text-stone-600 dark:text-stone-300 font-medium">
              Prinsip-prinsip pelindungan yang dijamin oleh peraturan rektor dan
              Satgas PPKS untuk seluruh mahasiswa.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {VICTIM_RIGHTS.map((right, idx) => (
              <div
                key={idx}
                className="bg-stone-50/80 dark:bg-[#14302c]/60 border-l-4 border-l-teal-500 border-t border-r border-b border-stone-200/80 dark:border-stone-600/80 rounded-xl p-4 space-y-1.5 hover:bg-stone-100/80 dark:hover:bg-stone-900/80 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 bg-white dark:bg-stone-800 rounded-lg border border-stone-200 dark:border-stone-600 shrink-0">
                    {right.icon}
                  </div>
                  <h3 className="font-bold text-sm text-stone-900 dark:text-stone-50">
                    {right.title}
                  </h3>
                </div>
                <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed font-medium pl-8">
                  {right.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* FAQ EDUKATIF (ACCORDION) */}
        <div className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold text-stone-900 dark:text-stone-50 flex items-center gap-2.5">
              <HelpCircle className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />{" "}
              Pertanyaan Umum & Prosedur Etik (FAQ)
            </h2>
            <p className="text-sm text-stone-600 dark:text-stone-300 font-medium">
              Jawaban resmi mengenai kerahasiaan, investigasi bukti, dan
              kepastian hukum dalam penanganan kasus.
            </p>
          </div>

          <div className="space-y-3">
            {EDU_FAQS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className="bg-white/90 dark:bg-[#163432] backdrop-blur-xl border border-stone-200 dark:border-stone-600 rounded-2xl overflow-hidden shadow-xs"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(idx)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 font-bold text-sm text-stone-900 dark:text-stone-50 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-teal-600 dark:text-teal-400 transition-transform duration-200 shrink-0 ${isOpen ? "rotate-180" : ""}`}
                    />
                  </button>

                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="px-6 pb-5 pt-1 text-xs text-stone-600 dark:text-stone-300 font-medium leading-relaxed border-t border-stone-100 dark:border-stone-600/80">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── 6 ARTIKEL EDUKASI TERKINI (2 COLUMNS GRID LAYOUT WITH THUMBNAIL IMAGES) ─ */}
        <div className="space-y-8 pt-8 border-t border-stone-200 dark:border-stone-600/80">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 px-3 py-1 rounded-full text-xs font-bold text-teal-700 dark:text-teal-300">
              <BookMarked className="w-3.5 h-3.5" /> Artikel & Panduan Resmi
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-stone-900 dark:text-stone-50 flex items-center gap-3">
              <span>Artikel & Literasi Hukum Terkini</span>
            </h2>
            <p className="text-sm text-stone-600 dark:text-stone-300 font-medium max-w-2xl">
              6 artikel dan panduan praktis penanganan kasus, keamanan siber
              digital, serta perlindungan hak-hak mahasiswa. Klik artikel untuk
              membaca detail selengkapnya.
            </p>
          </div>

          {/* 2-Column Grid Layout for Compact & Balanced View */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {ARTICLES_DATA.map((art, idx) => (
              <motion.div
                key={art.id}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.35, delay: idx * 0.06 }}
                onClick={() => setSelectedArticle(art)}
                className="group bg-white/90 dark:bg-[#163432] backdrop-blur-xl border border-stone-200 dark:border-stone-600 rounded-3xl overflow-hidden shadow-xs hover:shadow-xl hover:border-teal-500/50 transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                {/* Compact Thumbnail Image Header (h-28 sm:h-32) */}
                <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-stone-100 dark:bg-[#163432]">
                  <Image
                    src={art.image}
                    alt={art.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-stone-950/20 to-transparent" />

                  <div className="absolute top-2.5 left-3 flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/90 dark:bg-stone-800/90 text-teal-700 dark:text-teal-300 backdrop-blur-md border border-white/20 shadow-xs">
                      [{art.number}] {art.category}
                    </span>
                  </div>

                  <span className="absolute bottom-2.5 right-3 text-[10px] font-mono text-white/90 bg-stone-950/70 px-2 py-0.5 rounded border border-white/10 backdrop-blur-xs">
                    {art.readTime}
                  </span>
                </div>

                {/* Card Content Body */}
                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[11px] font-mono text-stone-500 dark:text-stone-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-teal-500" />
                        {art.date}
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-stone-900 dark:text-stone-50 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors leading-snug line-clamp-2">
                      {art.title}
                    </h3>

                    <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed font-medium line-clamp-2">
                      {art.excerpt}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-stone-100 dark:border-stone-600/80 flex items-center justify-between text-xs">
                    <span className="text-[11px] text-stone-500 dark:text-stone-400 font-mono truncate max-w-[180px]">
                      {art.author}
                    </span>

                    <span className="inline-flex items-center gap-1 font-bold text-teal-600 dark:text-teal-400 group-hover:translate-x-1 transition-transform shrink-0">
                      <span>Baca Detail</span>
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Footer CTA */}
        {/* <div className="bg-gradient-to-r from-teal-900 to-slate-900 rounded-3xl p-8 text-center text-white space-y-4 shadow-xl relative overflow-hidden">
          <div className="relative z-10 space-y-3 max-w-xl mx-auto">
            <h3 className="text-2xl font-black">Siap Menyampaikan Laporan Aman?</h3>
            <p className="text-xs text-teal-100/90 leading-relaxed font-medium">
              Setiap laporan Anda diproses secara anonim dengan sertifikasi SHA-256 dan perlindungan metadata penuh.
            </p>
            <div className="pt-2">
              <Link
                href="/report"
                className="inline-flex items-center gap-2 bg-teal-500 hover:bg-teal-400 text-stone-950 font-extrabold px-6 py-3 rounded-xl text-xs transition-all shadow-lg cursor-pointer"
              >
                <span>Buat Laporan Anonim Sekarang</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div> */}
      </main>

      {/* ─── ARTICLE DETAIL MODAL ──────────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedArticle && (
          <>
            {/* Backdrop — covers full screen */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedArticle(null)}
              className="fixed inset-0 z-150 bg-stone-950/80 backdrop-blur-md"
            />

            {/* Modal wrapper — fixed, starts below navbar, above footer */}
            {/* Modal wrapper — fixed, starts below navbar, above footer */}
            <div className="fixed inset-x-3 bottom-3 z-200 flex items-end justify-center sm:inset-x-4 sm:bottom-4 sm:items-center sm:top-20">
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 30 }}
                transition={{ duration: 0.25 }}
                // Tambahkan overflow-hidden di sini agar konten di dalamnya ikut terpotong mengikuti lengkungan card
                className="relative w-full max-w-3xl mx-auto bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-600 rounded-3xl shadow-2xl z-10 flex flex-col overflow-hidden"
                style={{ maxHeight: "calc(100vh - 88px)" }}
              >
                {/* Modal Header Bar */}
                {/* Tambahkan rounded-t-3xl agar bagian atasnya melengkung sempurna */}
                <div className="p-6 border-b border-stone-200 dark:border-stone-600 flex items-start justify-between gap-4 bg-stone-50 dark:bg-[#14302c] rounded-t-3xl">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                        {selectedArticle.category}
                      </span>
                      <span className="text-xs font-mono text-stone-600 dark:text-stone-300 flex items-center gap-1 font-medium">
                        <Clock className="w-3.5 h-3.5 text-teal-500" />{" "}
                        {selectedArticle.readTime}
                      </span>
                      <span className="text-xs font-mono text-stone-600 dark:text-stone-300 flex items-center gap-1 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-teal-500" />{" "}
                        {selectedArticle.date}
                      </span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-50 leading-snug">
                      {selectedArticle.title}
                    </h2>

                    <p className="text-xs text-stone-600 dark:text-stone-400 font-mono">
                      Penulis:{" "}
                      <strong className="text-stone-800 dark:text-stone-200">
                        {selectedArticle.author}
                      </strong>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSelectedArticle(null)}
                    className="p-2 rounded-xl bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-700 text-stone-800 dark:text-stone-200 transition-colors cursor-pointer shrink-0"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Modal Body Content (Scrollable with explicit contrast) */}
                <div className="p-6 md:p-8 overflow-y-auto space-y-6 text-stone-800 dark:text-stone-200 text-sm leading-relaxed custom-scrollbar">
                  {/* Excerpt callout */}
                  <div className="bg-teal-50 dark:bg-teal-950/60 border-l-4 border-teal-500 p-4 rounded-r-xl text-xs sm:text-sm font-medium text-teal-950 dark:text-teal-100 leading-relaxed">
                    {selectedArticle.excerpt}
                  </div>

                  {/* Article Content Paragraphs */}
                  {selectedArticle.content.map((sec, sIdx) => (
                    <div key={sIdx} className="space-y-2.5">
                      <h3 className="text-base font-extrabold text-stone-900 dark:text-stone-50 flex items-center gap-2">
                        <span className="w-1.5 h-5 bg-teal-500 rounded-full" />
                        {sec.heading}
                      </h3>
                      <p className="text-xs sm:text-sm text-stone-700 dark:text-stone-300 leading-relaxed font-normal">
                        {sec.body}
                      </p>

                      {sec.points && (
                        <ul className="space-y-1.5 pt-1 pl-4">
                          {sec.points.map((pt, pIdx) => (
                            <li
                              key={pIdx}
                              className="text-xs text-stone-700 dark:text-stone-300 flex items-start gap-2 font-normal"
                            >
                              <span className="text-teal-500 font-bold">•</span>
                              <span>{pt}</span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}

                  {/* Legal Reference Note */}
                  {selectedArticle.legalRef && (
                    <div className="pt-4 border-t border-stone-200 dark:border-stone-600 text-xs font-mono text-stone-600 dark:text-stone-400 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-teal-500 shrink-0" />
                      <span>
                        Referensi Legal:{" "}
                        <strong className="text-stone-900 dark:text-stone-200">
                          {selectedArticle.legalRef}
                        </strong>
                      </span>
                    </div>
                  )}
                </div>

                {/* Modal Footer Actions */}
                <div className="p-4 sm:p-6 border-t border-stone-200 dark:border-stone-600 bg-stone-50 dark:bg-[#14302c] flex items-center justify-between gap-4">
                  <button
                    type="button"
                    onClick={handleCopyShare}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-stone-200 dark:bg-stone-700 hover:bg-stone-300 dark:hover:bg-stone-700 text-xs font-bold text-stone-900 dark:text-stone-50 transition-colors cursor-pointer"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-500" />
                        <span>Link Tersalin!</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-4 h-4 text-stone-500 dark:text-stone-400" />
                        <span>Bagikan Artikel</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedArticle(null)}
                    className="px-5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all cursor-pointer shadow-md"
                  >
                    Tutup Artikel
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
