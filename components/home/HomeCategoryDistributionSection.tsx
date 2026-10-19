'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Layers, Sparkles, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import {
  aggregateTransparencyData,
  type TransparencyStatsResponse,
  type RealCategoryDistribution,
} from '@/lib/transparencyService';
import { fetchReportsWithStatus } from '@/lib/reportsService';

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
          <filter id="home-donut-glow" x="-20%" y="-20%" width="140%" height="140%">
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
              filter={isHovered ? 'url(#home-donut-glow)' : undefined}
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

// ─── Main Category Distribution Section for Homepage ────────────────────────

export default function HomeCategoryDistributionSection() {
  const [data, setData] = useState<TransparencyStatsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredCategoryIndex, setHoveredCategoryIndex] = useState<number | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        setIsLoading(true);
        const { reports: fetchedReports, status: dbStatus } = await fetchReportsWithStatus();
        if (!isMounted) return;

        const liveAggregated = aggregateTransparencyData(
          fetchedReports,
          dbStatus.connected ? 'live_supabase' : 'local_active'
        );
        setData(liveAggregated);
      } catch (err) {
        console.error('Failed to load category distribution for homepage:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    loadData();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section aria-labelledby="home-category-distribution-title" className="space-y-6">
      {/* Header Info */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-stone-200 dark:border-gray-600 pb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-700 dark:text-teal-400 uppercase tracking-wider mb-1">
            <Layers className="w-4 h-4" /> Distribusi Kategori Laporan Publik
          </div>
          <h2
            id="home-category-distribution-title"
            className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white"
          >
            Klasifikasi Kategori Berdasarkan Data Riil
          </h2>
          <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-400 mt-1">
            Visualisasi proporsi jenis aduan yang masuk dan tercatat di sistem Satgas PPKS (100% tersinkronisasi dengan data admin).
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-gray-800 border border-teal-200 dark:border-teal-700 px-3.5 py-1.5 rounded-xl shadow-xs shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-teal-500" />
            <span>Real-Time Database Sync</span>
          </div>
          <Link
            href="/transparency"
            className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:text-teal-700 dark:hover:text-teal-300 flex items-center gap-1 transition-colors shrink-0"
          >
            <span>Selengkapnya</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Interactive Chart Container Card */}
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

            {isLoading ? (
              <div className="py-12 flex flex-col items-center justify-center gap-2">
                <div className="w-7 h-7 border-3 border-teal-600 border-t-transparent rounded-full animate-spin" />
                <span className="text-xs text-stone-500 dark:text-stone-400">
                  Memuat data distribusi kategori riil...
                </span>
              </div>
            ) : (data?.realCategories || []).length === 0 ? (
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
  );
}
