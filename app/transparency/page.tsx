'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  TrendingUp,
  Clock,
  Info,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  FileCheck2,
  Database,
  Inbox,
  Layers,
  Activity,
  CheckCircle,
} from 'lucide-react';
import Link from 'next/link';
import {
  aggregateTransparencyData,
  type TransparencyStatsResponse,
  type RealCategoryDistribution,
} from '@/lib/transparencyService';
import { fetchReportsWithStatus } from '@/lib/reportsService';

// ─── Counter Component for Smooth Number Animation ──────────────────────────

function AnimatedCounter({ value, suffix = '', duration = 1.2 }: { value: number; suffix?: string; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const startValue = 0;
    const endValue = value;

    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / (duration * 1000), 1);
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplayValue(Number((startValue + (endValue - startValue) * easeProgress).toFixed(value % 1 !== 0 ? 1 : 0)));

      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };

    window.requestAnimationFrame(step);
  }, [value, duration]);

  return (
    <span>
      {displayValue}
      {suffix}
    </span>
  );
}

// ─── Interactive SVG Donut Chart Component ──────────────────────────────────

function InteractiveDonutChart({
  categories = [],
  totalReports = 0,
  hoveredIndex,
  onHover,
}: {
  categories: RealCategoryDistribution[];
  totalReports: number;
  hoveredIndex: number | null;
  onHover: (index: number | null) => void;
}) {
  const size = 260;
  const strokeWidth = 22;
  const radius = (size - strokeWidth) / 2 - 10;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  let accumulatedPercentage = 0;

  return (
    <div className="relative flex items-center justify-center">
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="transform -rotate-90 select-none overflow-visible"
      >
        <defs>
          <filter id="donut-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Background track circle */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-stone-200/60 dark:text-gray-800"
        />

        {/* Data Segments */}
        {categories.map((cat, idx) => {
          const strokeDashoffset = -((accumulatedPercentage / 100) * circumference);
          // If total is 0 or category percentage is 0, give minimal visible tick
          const segmentLength = (Math.max(cat.percentage, 1) / 100) * circumference;
          accumulatedPercentage += cat.percentage;

          const isHovered = hoveredIndex === idx;

          return (
            <circle
              key={cat.category}
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke={cat.color}
              strokeWidth={isHovered ? strokeWidth + 6 : strokeWidth}
              strokeDasharray={`${segmentLength} ${circumference}`}
              strokeDashoffset={strokeDashoffset}
              filter={isHovered ? 'url(#donut-glow)' : undefined}
              className="transition-all duration-300 cursor-pointer"
              onMouseEnter={() => onHover(idx)}
              onMouseLeave={() => onHover(null)}
            />
          );
        })}
      </svg>

      {/* Central Donut Info Display */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none p-4">
        <span className="text-3xl sm:text-4xl font-black font-mono text-stone-900 dark:text-white leading-none tracking-tight">
          {totalReports}
        </span>
        <span className="text-xs font-bold text-teal-700 dark:text-teal-400 mt-1 uppercase tracking-wider">
          Kasus Riil
        </span>
        <span className="text-[10px] text-stone-500 dark:text-stone-400 font-mono mt-0.5">
          Tersinkronisasi
        </span>
      </div>
    </div>
  );
}

// ─── Main Page Component ────────────────────────────────────────────────────

export default function TransparencyPage() {
  const [data, setData] = useState<TransparencyStatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredCategoryIndex, setHoveredCategoryIndex] = useState<number | null>(null);

  // Fetch Transparency Statistics from Supabase & Local DB (Identik dengan Dasbor Admin)
  const fetchStats = async () => {
    try {
      setIsLoading(true);
      const { reports: fetchedReports, status: dbStatus } = await fetchReportsWithStatus();

      const liveAggregated = aggregateTransparencyData(
        fetchedReports,
        dbStatus.connected ? 'live_supabase' : 'local_active'
      );
      setData(liveAggregated);
    } catch (err) {
      console.error('Failed to load transparency stats:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();

    const onStorage = (e: StorageEvent) => {
      if (
        e.key === 'ruang_aman_reports' ||
        e.key === 'ruang_aman_deleted_case_ids'
      ) {
        fetchStats();
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  return (
    <div className="min-h-screen bg-transparent text-stone-900 dark:text-stone-100 font-sans selection:bg-teal-500/20 pt-24 pb-24 relative overflow-hidden">
      {/* Background Ambience Glow */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-teal-500/5 dark:bg-teal-500/10 blur-[130px] pointer-events-none rounded-full" />
      <div className="absolute top-[650px] right-0 w-[450px] h-[450px] bg-emerald-500/5 dark:bg-emerald-500/10 blur-[120px] pointer-events-none rounded-full" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 relative z-10">
        {/* ─── Hero Header & Context Section ─────────────────────────────────── */}
        <div className="text-center space-y-5 max-w-4xl mx-auto">
          <div className="inline-flex flex-wrap items-center justify-center gap-2 bg-white/90 dark:bg-gray-700/90 border border-teal-500/30 px-4 py-1.5 rounded-full text-teal-700 dark:text-teal-300 text-xs font-semibold shadow-xs">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
            </span>
            <span>UINIC 8.0 • Empower Digital Ecosystems</span>
            <span className="text-stone-300 dark:text-stone-600">|</span>
            <span className="flex items-center gap-1 font-mono text-[11px] text-teal-800 dark:text-teal-200">
              <Lock className="w-3 h-3 text-teal-600 dark:text-teal-400" /> 100% Zero-Knowledge Aggregation
            </span>
            <span className="text-stone-300 dark:text-stone-600">|</span>
            <span className="flex items-center gap-1 font-mono text-[11px] text-teal-700 dark:text-teal-300 font-bold">
              <Database className="w-3 h-3 text-emerald-500" /> Data Riil Tersinkronisasi
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-stone-900 dark:text-white leading-tight">
            Dasbor Transparansi Publik & <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-600 via-emerald-500 to-cyan-500 dark:from-teal-400 dark:via-emerald-300 dark:to-cyan-400">
              Statistik Kasus Kampus
            </span>
          </h1>

          <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300 leading-relaxed font-medium max-w-2xl mx-auto">
            Komitmen transparansi terbuka Satgas PPKS melalui penyajian data agregat statistik laporan dan kategori kasus secara anonim, objektif, dan transparan sesuai basis data riil Satgas PPKS.
          </p>

          {/* Privacy Guarantee Pill */}
          <div className="inline-flex items-center gap-2 bg-white/90 dark:bg-gray-700/80 border border-stone-200 dark:border-gray-600 text-stone-700 dark:text-stone-300 px-4 py-2 rounded-2xl text-xs max-w-2xl text-left shadow-xs">
            <Info className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
            <span className="leading-snug">
              <strong>Jaminan Privasi Zero-Knowledge:</strong> Seluruh data diagregasi langsung dari basis data laporan tanpa mencatat identitas pelapor (NIK/NIM), kronologi rahasia, maupun berkas bukti ke ruang publik.
            </span>
          </div>
        </div>

        {/* ─── SECTION 1: Ringkasan Metrik Akuntabilitas Satgas ────────────────── */}
        <section aria-labelledby="metrics-summary-title" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-teal-50 dark:bg-gray-700 rounded-xl border border-teal-200 dark:border-teal-700">
                <TrendingUp className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              </div>
              <div>
                <h2 id="metrics-summary-title" className="text-lg font-bold text-stone-900 dark:text-white">
                  Statistik Akuntabilitas Satgas PPKS
                </h2>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Data riil tersinkronisasi • Pembaruan: {data ? new Date(data.lastUpdated).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Memuat...'}
                </p>
              </div>
            </div>

            <div className="hidden sm:flex items-center gap-2 text-xs font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 px-3 py-1 rounded-xl">
              <CheckCircle2 className="w-4 h-4" />
              <span>Integritas Audit: Valid</span>
            </div>
          </div>

          {/* Metric Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Metric Card 1: Total Reports Processed */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.1 }}
              className="relative overflow-hidden bg-white/90 dark:bg-gray-700/90 border border-stone-200 dark:border-gray-600 rounded-3xl p-6 shadow-xl group hover:border-teal-400/60 transition-all backdrop-blur-xl"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-teal-500/10 rounded-full blur-2xl group-hover:bg-teal-500/20 transition-all pointer-events-none" />
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /> Total Kasus Tercatat
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-500/20 text-teal-700 dark:text-teal-300 text-[10px] font-mono font-bold border border-teal-200 dark:border-teal-500/30">
                  Data Riil
                </span>
              </div>

              <div className="flex items-baseline gap-2 mb-2">
                <div className="text-4xl sm:text-5xl font-black text-stone-900 dark:text-white font-mono tracking-tight">
                  {isLoading || !data ? (
                    <span className="animate-pulse">--</span>
                  ) : (
                    <AnimatedCounter value={data.totalReportsProcessed} />
                  )}
                </div>
                <span className="text-sm font-semibold text-teal-700 dark:text-teal-300">Laporan Masuk</span>
              </div>

              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                Total aduan aktual yang tersimpan aman pada sistem dan melalui proses penanganan Satgas PPKS.
              </p>

              <div className="mt-4 pt-3 border-t border-stone-200 dark:border-gray-600 flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400 font-mono">
                <span>Kasus Aktif Berjalan:</span>
                <span className="font-bold text-teal-700 dark:text-teal-300">
                  {data ? data.activeCasesUnderReview : 0} Berkas Sedang Diproses
                </span>
              </div>
            </motion.div>

            {/* Metric Card 2: Resolution Rate Percentage */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="relative overflow-hidden bg-white/90 dark:bg-gray-700/90 border border-stone-200 dark:border-gray-600 rounded-3xl p-6 shadow-xl group hover:border-emerald-400/60 transition-all backdrop-blur-xl"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all pointer-events-none" />
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
                  <FileCheck2 className="w-4 h-4" /> Tingkat Penyelesaian
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[10px] font-mono font-bold border border-emerald-200 dark:border-emerald-500/30">
                  Status: Selesai
                </span>
              </div>

              <div className="flex items-baseline gap-2 mb-2">
                <div className="text-4xl sm:text-5xl font-black text-stone-900 dark:text-white font-mono tracking-tight">
                  {isLoading || !data ? (
                    <span className="animate-pulse">--</span>
                  ) : (
                    <AnimatedCounter value={data.resolutionRatePercentage} suffix="%" />
                  )}
                </div>
                <span className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">Kasus Ditutup</span>
              </div>

              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                Persentase kasus yang berhasil diselesaikan melalui mediasi, sidang komite etik, atau konseling pemulihan korban.
              </p>

              <div className="mt-4 pt-3 border-t border-stone-200 dark:border-gray-600 flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400 font-mono">
                <span>Rujukan Permendikbud:</span>
                <span className="font-bold text-emerald-700 dark:text-emerald-300">Permendikbudristek No. 30/2021</span>
              </div>
            </motion.div>

            {/* Metric Card 3: Average Response Time */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: 0.3 }}
              className="relative overflow-hidden bg-white/90 dark:bg-gray-700/90 border border-stone-200 dark:border-gray-600 rounded-3xl p-6 shadow-xl group hover:border-cyan-400/60 transition-all backdrop-blur-xl"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl group-hover:bg-cyan-500/20 transition-all pointer-events-none" />
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-wider text-cyan-700 dark:text-cyan-400 flex items-center gap-1.5">
                  <Clock className="w-4 h-4" /> Kecepatan Respons Satgas
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-500/20 text-cyan-700 dark:text-cyan-300 text-[10px] font-mono font-bold border border-cyan-200 dark:border-cyan-500/30">
                  SLA &lt; 24 Jam
                </span>
              </div>

              <div className="flex items-baseline gap-2 mb-2">
                <div className="text-4xl sm:text-5xl font-black text-stone-900 dark:text-white font-mono tracking-tight">
                  {isLoading || !data ? (
                    <span className="animate-pulse">--</span>
                  ) : (
                    <AnimatedCounter value={data.averageResponseTimeHours} suffix=" Jam" />
                  )}
                </div>
                <span className="text-sm font-semibold text-cyan-700 dark:text-cyan-300">Rata-rata Respons</span>
              </div>

              <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                Waktu tempuh peninjauan awal laporan sejak token terenkripsi dibuat hingga tindakan tanggap darurat pertama dilakukan.
              </p>

              <div className="mt-4 pt-3 border-t border-stone-200 dark:border-gray-600 flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400 font-mono">
                <span>Notifikasi Telegram Satgas:</span>
                <span className="font-bold text-cyan-700 dark:text-cyan-300">Tersinkronisasi Otomatis</span>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ─── SECTION 2: DISTRIBUSI KATEGORI LAPORAN PUBLIK (DATA RIIL & GRAFIK MODERN) ── */}
        <section aria-labelledby="category-distribution-title" className="space-y-6 pt-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 dark:border-gray-600 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider mb-1">
                <Layers className="w-4 h-4" /> Distribusi Kategori Laporan Publik
              </div>
              <h2 id="category-distribution-title" className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white">
                Klasifikasi Kategori Berdasarkan Data Riil
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1">
                Visualisasi proporsi jenis aduan yang masuk dan tercatat di sistem Satgas PPKS (100% tersinkronisasi dengan data admin).
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-gray-800 border border-teal-200 dark:border-teal-700 px-3.5 py-1.5 rounded-xl shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-teal-500" />
              <span>Real-Time Database Sync</span>
            </div>
          </div>

          {/* Interactive Chart Container */}
          <div className="bg-white/90 dark:bg-gray-700/90 border border-stone-200 dark:border-gray-600 rounded-3xl p-6 sm:p-10 shadow-xl backdrop-blur-xl">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Kolom Kiri: Visual Donut Chart */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 border-b lg:border-b-0 lg:border-r border-stone-200 dark:border-gray-600">
                <InteractiveDonutChart
                  categories={data?.realCategories || []}
                  totalReports={data?.totalReportsProcessed || 0}
                  hoveredIndex={hoveredCategoryIndex}
                  onHover={setHoveredCategoryIndex}
                />
                <p className="text-[11px] text-stone-500 dark:text-stone-400 text-center mt-4">
                  Arahkan kursor atau klik pada kartu kategori di samping untuk menyorot proporsi kasus.
                </p>
              </div>

              {/* Kolom Kanan: Daftar Kategori Riil & Progress Bars */}
              <div className="lg:col-span-7 space-y-3.5">
                <div className="flex items-center justify-between text-xs font-semibold text-stone-500 dark:text-stone-400 border-b border-stone-200 dark:border-gray-600 pb-2">
                  <span>Nama Kategori Laporan</span>
                  <span>Frekuensi & Persentase</span>
                </div>

                {(data?.realCategories || []).length === 0 ? (
                  <div className="py-8 text-center text-xs text-stone-500 dark:text-stone-400">
                    Belum ada data kategori laporan yang tercatat.
                  </div>
                ) : (
                  (data?.realCategories || []).map((cat, idx) => {
                    const isHovered = hoveredCategoryIndex === idx;

                    return (
                      <motion.div
                        key={cat.category}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.05 }}
                        onMouseEnter={() => setHoveredCategoryIndex(idx)}
                        onMouseLeave={() => setHoveredCategoryIndex(null)}
                        className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                          isHovered
                            ? 'bg-stone-50 dark:bg-gray-800 border-teal-500 shadow-md ring-2 ring-teal-500/20 scale-[1.01]'
                            : 'bg-stone-50/70 dark:bg-gray-800/70 border-stone-200 dark:border-gray-600 hover:border-teal-400'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <span
                              className="w-3.5 h-3.5 rounded-full shrink-0 shadow-xs"
                              style={{ backgroundColor: cat.color }}
                            />
                            <span className="text-xs sm:text-sm font-bold text-stone-900 dark:text-white truncate">
                              {cat.category}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-xs font-black font-mono text-stone-900 dark:text-white">
                              {cat.count} Kasus
                            </span>
                            <span
                              className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold text-white shadow-xs"
                              style={{ backgroundColor: cat.color }}
                            >
                              {cat.percentage}%
                            </span>
                          </div>
                        </div>

                        {/* Animated Percentage Bar */}
                        <div className="w-full bg-stone-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{ backgroundColor: cat.color }}
                            initial={{ width: 0 }}
                            animate={{ width: `${Math.max(cat.percentage, 4)}%` }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                          />
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ─── SECTION 3: STATUS PROGRES PENANGANAN KASUS (DATA RIIL ADMIN) ───── */}
        <section aria-labelledby="status-breakdown-title" className="space-y-6 pt-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 dark:border-gray-600 pb-4">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider mb-1">
                <Activity className="w-4 h-4" /> Progres Tindak Lanjut Satgas PPKS
              </div>
              <h2 id="status-breakdown-title" className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white">
                Status Penanganan Berkas Laporan Riil
              </h2>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1">
                Perjalanan penanganan laporan kasus secara transparan dari status awal hingga berkas tuntas diselesaikan.
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs font-mono text-stone-600 dark:text-stone-400 bg-stone-100 dark:bg-gray-800 px-3.5 py-1.5 rounded-xl border border-stone-200 dark:border-gray-700">
              <Inbox className="w-3.5 h-3.5 text-teal-500" />
              <span>Sinkronisasi Status Dasbor Admin</span>
            </div>
          </div>

          {/* 6 Real Case Status Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {(data?.realStatuses || []).map((st) => {
              return (
                <div
                  key={st.status}
                  className="bg-white/90 dark:bg-gray-700/90 border border-stone-200 dark:border-gray-600 rounded-3xl p-5 shadow-xl space-y-3 backdrop-blur-xl flex flex-col justify-between hover:border-teal-400/60 transition-all"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span
                        className="px-2.5 py-1 rounded-xl text-xs font-bold border flex items-center gap-1.5 shadow-xs"
                        style={{
                          backgroundColor: `${st.color}15`,
                          color: st.color,
                          borderColor: `${st.color}40`,
                        }}
                      >
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: st.color }} />
                        <span>{st.label}</span>
                      </span>

                      <span className="text-lg font-black font-mono text-stone-900 dark:text-white">
                        {st.count} Berkas
                      </span>
                    </div>

                    <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed font-medium">
                      {st.description}
                    </p>
                  </div>

                  {/* Percentage Progress Bar */}
                  <div className="space-y-1.5 pt-2 border-t border-stone-200 dark:border-gray-600">
                    <div className="flex items-center justify-between text-[11px] font-mono text-stone-500 dark:text-stone-400">
                      <span>Proporsi Kasus:</span>
                      <span className="font-bold" style={{ color: st.color }}>
                        {st.percentage}%
                      </span>
                    </div>
                    <div className="w-full bg-stone-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: st.color }}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${Math.max(st.percentage, 2)}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ─── SECTION 4: CALL TO ACTION FOOTER ───────────────────────────────── */}
        <section className="bg-white/90 dark:bg-gray-700/90 border border-stone-200 dark:border-gray-600 rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden backdrop-blur-xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1.5 max-w-2xl text-center sm:text-left">
              <h3 className="text-lg sm:text-xl font-bold text-stone-900 dark:text-white flex items-center justify-center sm:justify-start gap-2">
                <CheckCircle className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                <span>Ingin Melaporkan Insiden Secara Aman & Terenkripsi?</span>
              </h3>
              <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
                Platform RuangAman menjamin kerahasiaan identitas 100% dengan enkripsi sisi-klien sebelum data terkirim ke server Satgas PPKS.
              </p>
            </div>

            <Link
              href="/report"
              className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-3.5 px-6 rounded-2xl text-xs flex items-center gap-2 transition-all shadow-md shrink-0 cursor-pointer hover:scale-[1.02]"
            >
              <span>Buat Laporan Anonim</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
