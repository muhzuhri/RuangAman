'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText,
  Clock,
  CheckCircle,
  Inbox,
  ChevronRight,
  Sparkles,
  TrendingUp,
  AlertTriangle,
  ShieldAlert,
  Building2,
  Calendar,
  Layers,
  ArrowUpRight,
  Shield,
  Activity,
  Filter,
} from 'lucide-react';
import { type Report, type CaseStatus } from '@/lib/types';
import { ALL_STATUSES, STATUS_STYLES, formatDateID } from '@/lib/adminUtils';

// ─── Status Configuration Colors & Meta ──────────────────────────────────────
const STATUS_METAS: Record<
  CaseStatus,
  { label: string; color: string; bgSoft: string; border: string; glow: string }
> = {
  'Laporan Diterima': {
    label: 'Baru Diterima',
    color: '#f59e0b',
    bgSoft: 'rgba(245, 158, 11, 0.12)',
    border: 'rgba(245, 158, 11, 0.4)',
    glow: 'rgba(245, 158, 11, 0.5)',
  },
  Diverifikasi: {
    label: 'Diverifikasi',
    color: '#0284c7',
    bgSoft: 'rgba(2, 132, 199, 0.12)',
    border: 'rgba(2, 132, 199, 0.4)',
    glow: 'rgba(2, 132, 199, 0.5)',
  },
  Diproses: {
    label: 'Sedang Diproses',
    color: '#6366f1',
    bgSoft: 'rgba(99, 102, 241, 0.12)',
    border: 'rgba(99, 102, 241, 0.4)',
    glow: 'rgba(99, 102, 241, 0.5)',
  },
  'Mediasi & Konseling': {
    label: 'Mediasi & Konseling',
    color: '#8b5cf6',
    bgSoft: 'rgba(139, 92, 246, 0.12)',
    border: 'rgba(139, 92, 246, 0.4)',
    glow: 'rgba(139, 92, 246, 0.5)',
  },
  'Eskalasi ke Komite Etik': {
    label: 'Eskalasi Komite Etik',
    color: '#e11d48',
    bgSoft: 'rgba(225, 29, 72, 0.12)',
    border: 'rgba(225, 29, 72, 0.4)',
    glow: 'rgba(225, 29, 72, 0.5)',
  },
  Selesai: {
    label: 'Kasus Tuntas',
    color: '#10b981',
    bgSoft: 'rgba(16, 185, 129, 0.12)',
    border: 'rgba(16, 185, 129, 0.4)',
    glow: 'rgba(16, 185, 129, 0.5)',
  },
};

const CATEGORY_PALETTE = [
  { from: '#0d9488', to: '#14b8a6', accent: '#0d9488' },
  { from: '#0284c7', to: '#38bdf8', accent: '#0284c7' },
  { from: '#6366f1', to: '#818cf8', accent: '#6366f1' },
  { from: '#f59e0b', to: '#fbbf24', accent: '#f59e0b' },
  { from: '#e11d48', to: '#fb7185', accent: '#e11d48' },
  { from: '#8b5cf6', to: '#a78bfa', accent: '#8b5cf6' },
  { from: '#10b981', to: '#34d399', accent: '#10b981' },
];

// ─── Smooth Animated Number Counter ──────────────────────────────────────────
function AnimatedNumber({ value, duration = 0.9 }: { value: number; duration?: number }) {
  const [current, setCurrent] = React.useState(0);

  React.useEffect(() => {
    let start: number | null = null;
    const startVal = 0;
    const endVal = value;

    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / (duration * 1000), 1);
      const easeOut = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCurrent(Math.floor(startVal + (endVal - startVal) * easeOut));
      if (progress < 1) requestAnimationFrame(step);
    };

    requestAnimationFrame(step);
  }, [value, duration]);

  return <span>{current}</span>;
}

// ─── Interactive SVG Curved Area Chart ──────────────────────────────────────
interface TimelineDataPoint {
  dateKey: string;
  displayLabel: string;
  count: number;
  categories: string[];
}

function ModernTimelineAreaChart({
  reports,
  timeframe,
  setTimeframe,
}: {
  reports: Report[];
  timeframe: '7d' | '30d' | 'all';
  setTimeframe: (tf: '7d' | '30d' | 'all') => void;
}) {
  const [hoveredPoint, setHoveredPoint] = useState<TimelineDataPoint | null>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  // Group and sort reports by date
  const timelinePoints: TimelineDataPoint[] = useMemo(() => {
    const daysCount = timeframe === '7d' ? 7 : timeframe === '30d' ? 30 : 14;
    const now = new Date();
    const result: TimelineDataPoint[] = [];

    // Map existing reports into date map
    const dateMap: Record<string, { count: number; categories: string[] }> = {};
    reports.forEach((r) => {
      if (!r?.receivedAt) return;
      const d = new Date(r.receivedAt);
      if (isNaN(d.getTime())) return;
      const key = d.toISOString().slice(0, 10);
      if (!dateMap[key]) dateMap[key] = { count: 0, categories: [] };
      dateMap[key].count += 1;
      if (r.category && !dateMap[key].categories.includes(r.category)) {
        dateMap[key].categories.push(r.category);
      }
    });

    if (timeframe === 'all') {
      // Collect all recorded dates sorted
      const sortedKeys = Object.keys(dateMap).sort();
      if (sortedKeys.length === 0) {
        // Fallback dummy days for smooth chart look
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(now.getDate() - i);
          const key = d.toISOString().slice(0, 10);
          result.push({
            dateKey: key,
            displayLabel: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
            count: 0,
            categories: [],
          });
        }
      } else {
        sortedKeys.forEach((key) => {
          const d = new Date(key);
          result.push({
            dateKey: key,
            displayLabel: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
            count: dateMap[key]?.count || 0,
            categories: dateMap[key]?.categories || [],
          });
        });
      }
    } else {
      for (let i = daysCount - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        result.push({
          dateKey: key,
          displayLabel: d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short' }),
          count: dateMap[key]?.count || 0,
          categories: dateMap[key]?.categories || [],
        });
      }
    }

    return result;
  }, [reports, timeframe]);

  const maxVal = Math.max(...timelinePoints.map((p) => p.count), 4);
  const chartWidth = 620;
  const chartHeight = 210;
  const paddingX = 35;
  const paddingY = 25;

  const innerW = chartWidth - paddingX * 2;
  const innerH = chartHeight - paddingY * 2;

  // Compute (x, y) coordinates for each point
  const pointsWithCoords = timelinePoints.map((pt, i) => {
    const x =
      timelinePoints.length > 1
        ? paddingX + (i / (timelinePoints.length - 1)) * innerW
        : paddingX + innerW / 2;
    const y = chartHeight - paddingY - (pt.count / maxVal) * innerH;
    return { ...pt, x, y };
  });

  // Generate Smooth Bezier Curve Path
  const linePath = useMemo(() => {
    if (pointsWithCoords.length === 0) return '';
    if (pointsWithCoords.length === 1) {
      return `M ${pointsWithCoords[0].x} ${pointsWithCoords[0].y}`;
    }

    let d = `M ${pointsWithCoords[0].x} ${pointsWithCoords[0].y}`;
    for (let i = 0; i < pointsWithCoords.length - 1; i++) {
      const p0 = pointsWithCoords[i === 0 ? 0 : i - 1];
      const p1 = pointsWithCoords[i];
      const p2 = pointsWithCoords[i + 1];
      const p3 = pointsWithCoords[i + 2] || p2;

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p2.x} ${p2.y}`;
    }
    return d;
  }, [pointsWithCoords]);

  const areaPath = useMemo(() => {
    if (!linePath || pointsWithCoords.length === 0) return '';
    const last = pointsWithCoords[pointsWithCoords.length - 1];
    const first = pointsWithCoords[0];
    const bottomY = chartHeight - paddingY;
    return `${linePath} L ${last.x} ${bottomY} L ${first.x} ${bottomY} Z`;
  }, [linePath, pointsWithCoords]);

  const totalPeriodCount = timelinePoints.reduce((acc, p) => acc + p.count, 0);
  const peakPoint = [...pointsWithCoords].sort((a, b) => b.count - a.count)[0];

  return (
    <div className="bg-white/95 dark:bg-gray-700/95 border border-stone-200 dark:border-gray-600 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden backdrop-blur-xl">
      {/* Decorative gradient glow */}
      <div className="absolute top-0 right-0 w-60 h-60 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Linimasa Intelijen Masuk</span>
          </div>
          <h3 className="text-base sm:text-lg font-black text-stone-900 dark:text-white flex items-center gap-2">
            <span>Tren Pelaporan Kasus</span>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-700">
              {totalPeriodCount} Kasus Masuk
            </span>
          </h3>
        </div>

        {/* Timeframe switch buttons */}
        <div className="flex items-center gap-1 bg-stone-100 dark:bg-gray-800 p-1 rounded-2xl border border-stone-200 dark:border-gray-600 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setTimeframe('7d')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              timeframe === '7d'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            7 Hari
          </button>
          <button
            type="button"
            onClick={() => setTimeframe('30d')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              timeframe === '30d'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            30 Hari
          </button>
          <button
            type="button"
            onClick={() => setTimeframe('all')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              timeframe === 'all'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            Semua
          </button>
        </div>
      </div>

      {/* Main SVG Area Chart Canvas */}
      <div className="relative w-full overflow-hidden select-none">
        <svg
          viewBox={`0 0 ${chartWidth} ${chartHeight}`}
          className="w-full h-auto overflow-visible"
        >
          <defs>
            <linearGradient id="adminAreaGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0d9488" stopOpacity="0.45" />
              <stop offset="60%" stopColor="#0284c7" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#0d9488" stopOpacity="0.0" />
            </linearGradient>

            <linearGradient id="adminLineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#0d9488" />
              <stop offset="50%" stopColor="#14b8a6" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>

            <filter id="adminGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
            const y = chartHeight - paddingY - ratio * innerH;
            const val = Math.round(ratio * maxVal);
            return (
              <g key={ratio}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={chartWidth - paddingX}
                  y2={y}
                  stroke="currentColor"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                  className="text-stone-200 dark:text-gray-600 opacity-60"
                />
                <text
                  x={paddingX - 8}
                  y={y + 3}
                  textAnchor="end"
                  className="text-[9px] fill-stone-400 dark:fill-stone-500 font-mono"
                >
                  {val}
                </text>
              </g>
            );
          })}

          {/* Area Fill */}
          {areaPath && (
            <motion.path
              d={areaPath}
              fill="url(#adminAreaGradient)"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
            />
          )}

          {/* Curved Line Stroke */}
          {linePath && (
            <motion.path
              d={linePath}
              fill="none"
              stroke="url(#adminLineGradient)"
              strokeWidth="3.2"
              filter="url(#adminGlow)"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.9, ease: 'easeOut' }}
            />
          )}

          {/* Vertical Guide Line when Hovered */}
          {hoverIndex !== null && pointsWithCoords[hoverIndex] && (
            <line
              x1={pointsWithCoords[hoverIndex].x}
              y1={paddingY}
              x2={pointsWithCoords[hoverIndex].x}
              y2={chartHeight - paddingY}
              stroke="#0d9488"
              strokeWidth="1.5"
              strokeDasharray="3 3"
              className="opacity-80"
            />
          )}

          {/* Interactive Data Point Dots */}
          {pointsWithCoords.map((pt, i) => {
            const isHovered = hoverIndex === i;
            const isPeak = pt.count > 0 && pt.count === peakPoint?.count;

            return (
              <g
                key={pt.dateKey + i}
                className="cursor-pointer"
                onMouseEnter={() => {
                  setHoverIndex(i);
                  setHoveredPoint(pt);
                }}
                onMouseLeave={() => {
                  setHoverIndex(null);
                  setHoveredPoint(null);
                }}
              >
                {/* Hit area */}
                <circle cx={pt.x} cy={pt.y} r="14" fill="transparent" />

                {/* Outer ring if hovered or peak */}
                {isHovered && (
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="8.5"
                    fill="none"
                    stroke="#14b8a6"
                    strokeWidth="2.5"
                    className="animate-ping opacity-75"
                  />
                )}

                {/* Center dot */}
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={isHovered ? 5.5 : pt.count > 0 ? 4 : 2.5}
                  fill={isHovered ? '#38bdf8' : pt.count > 0 ? '#0d9488' : '#64748b'}
                  stroke={isHovered ? '#ffffff' : '#042f2e'}
                  strokeWidth={isHovered ? 2 : 1.2}
                  className="transition-all duration-200"
                />

                {/* X-axis label (selective based on data count) */}
                {(pointsWithCoords.length <= 10 || i % Math.ceil(pointsWithCoords.length / 7) === 0 || i === pointsWithCoords.length - 1) && (
                  <text
                    x={pt.x}
                    y={chartHeight - 6}
                    textAnchor="middle"
                    className={`text-[9px] font-mono transition-colors ${
                      isHovered
                        ? 'fill-teal-500 font-bold'
                        : 'fill-stone-400 dark:fill-stone-400'
                    }`}
                  >
                    {pt.displayLabel}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip Card */}
        {hoveredPoint && hoverIndex !== null && pointsWithCoords[hoverIndex] && (
          <motion.div
            initial={{ opacity: 0, y: 5, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="absolute z-20 pointer-events-none bg-gray-900/95 dark:bg-gray-800/95 text-white border border-teal-500/50 p-2.5 rounded-2xl shadow-2xl backdrop-blur-md text-xs min-w-[140px]"
            style={{
              left: Math.min(
                Math.max(
                  (pointsWithCoords[hoverIndex].x / chartWidth) * 100,
                  15
                ),
                85
              ) + '%',
              top: '12%',
              transform: 'translateX(-50%)',
            }}
          >
            <div className="flex items-center justify-between gap-3 border-b border-gray-700 pb-1.5 mb-1.5">
              <span className="font-bold text-teal-300 font-mono text-[11px]">
                {hoveredPoint.displayLabel}
              </span>
              <span className="px-1.5 py-0.2 rounded-full bg-teal-500/20 text-teal-300 font-mono font-bold text-[10px]">
                {hoveredPoint.count} Kasus
              </span>
            </div>

            {hoveredPoint.categories.length > 0 ? (
              <div className="space-y-1">
                <span className="text-[10px] text-stone-400">Kategori:</span>
                <div className="flex flex-wrap gap-1">
                  {hoveredPoint.categories.map((c) => (
                    <span
                      key={c}
                      className="px-1.5 py-0.5 rounded-md bg-stone-800 text-[9px] text-stone-200 border border-stone-700"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <span className="text-[10px] text-stone-400 italic">Nihil aduan</span>
            )}
          </motion.div>
        )}
      </div>

      {/* Mini Insights Bar */}
      <div className="mt-3 pt-3 border-t border-stone-200 dark:border-gray-600 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-stone-600 dark:text-stone-300">
          <Calendar className="w-3.5 h-3.5 text-teal-500" />
          <span>Titik Puncak Insiden:</span>
          <span className="font-bold text-stone-900 dark:text-white font-mono">
            {peakPoint?.count || 0} Kasus ({peakPoint?.displayLabel || '-'})
          </span>
        </div>

        <div className="flex items-center gap-1.5 font-mono text-[11px] text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-gray-800 px-3 py-1 rounded-xl border border-teal-200 dark:border-teal-700">
          <Sparkles className="w-3 h-3 text-teal-500" />
          <span>Visualisasi Kurva Spline Dinamis</span>
        </div>
      </div>
    </div>
  );
}

// ─── Interactive SVG Donut Chart with Status Filter ──────────────────────────
function ModernStatusDonutChart({
  reports,
  onFilterStatus,
}: {
  reports: Report[];
  onFilterStatus?: (status: string) => void;
}) {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const statusData = useMemo(() => {
    const total = reports.length;
    return ALL_STATUSES.map((st) => {
      const count = reports.filter((r) => r?.status === st).length;
      const percentage = total > 0 ? Math.round((count / total) * 100) : 0;
      const meta = STATUS_METAS[st];
      return {
        status: st,
        count,
        percentage,
        ...meta,
      };
    });
  }, [reports]);

  const totalReports = reports.length;
  const size = 230;
  const strokeWidth = 24;
  const radius = (size - strokeWidth) / 2 - 8;
  const circumference = 2 * Math.PI * radius;
  const center = size / 2;

  let accumulatedPercentage = 0;

  // Active status being inspected (either hovered or the largest one)
  const activeStatus =
    hoveredIndex !== null ? statusData[hoveredIndex] : null;

  return (
    <div className="bg-white/95 dark:bg-gray-700/95 border border-stone-200 dark:border-gray-600 rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden backdrop-blur-xl flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-1">
              <Layers className="w-3.5 h-3.5" />
              <span>Pipeline Penanganan</span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-stone-900 dark:text-white">
              Status Kasus Satgas
            </h3>
          </div>

          <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-stone-100 dark:bg-gray-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-gray-600">
            6 Tahapan
          </span>
        </div>

        {/* Circular Donut Canvas */}
        <div className="relative flex items-center justify-center my-2">
          <svg
            width={size}
            height={size}
            viewBox={`0 0 ${size} ${size}`}
            className="transform -rotate-90 select-none overflow-visible"
          >
            <defs>
              <filter id="adminDonutGlow" x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation="4.5" result="blur" />
                <feComposite in="SourceGraphic" in2="blur" operator="over" />
              </filter>
            </defs>

            {/* Background base circle */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="none"
              stroke="currentColor"
              strokeWidth={strokeWidth}
              className="text-stone-200/70 dark:text-gray-800"
            />

            {/* Segments */}
            {statusData.map((st, idx) => {
              const strokeDashoffset = -((accumulatedPercentage / 100) * circumference);
              const segmentLength = (Math.max(st.percentage, 1) / 100) * circumference;
              accumulatedPercentage += st.percentage;

              const isHovered = hoveredIndex === idx;

              return (
                <circle
                  key={st.status}
                  cx={center}
                  cy={center}
                  r={radius}
                  fill="none"
                  stroke={st.color}
                  strokeWidth={isHovered ? strokeWidth + 7 : strokeWidth}
                  strokeDasharray={`${segmentLength} ${circumference}`}
                  strokeDashoffset={strokeDashoffset}
                  filter={isHovered ? 'url(#adminDonutGlow)' : undefined}
                  className="transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  onClick={() => onFilterStatus?.(st.status)}
                />
              );
            })}
          </svg>

          {/* Central Status Display */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none p-3">
            {activeStatus ? (
              <motion.div
                key={activeStatus.status}
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="space-y-0.5"
              >
                <span
                  className="text-3xl sm:text-4xl font-black font-mono leading-none tracking-tight"
                  style={{ color: activeStatus.color }}
                >
                  {activeStatus.count}
                </span>
                <p className="text-[11px] font-bold text-stone-800 dark:text-stone-200 line-clamp-1 max-w-[130px]">
                  {activeStatus.label}
                </p>
                <span
                  className="inline-block px-1.5 py-0.2 rounded-md text-[9px] font-mono font-bold text-white"
                  style={{ backgroundColor: activeStatus.color }}
                >
                  {activeStatus.percentage}%
                </span>
              </motion.div>
            ) : (
              <div className="space-y-0.5">
                <span className="text-3xl sm:text-4xl font-black font-mono text-stone-900 dark:text-white leading-none tracking-tight">
                  {totalReports}
                </span>
                <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider block">
                  Kasus Total
                </span>
                <span className="text-[9px] text-stone-400 font-mono">
                  Arahkan Kursor
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Segment Legend Grid */}
      <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-stone-200 dark:border-gray-600">
        {statusData.map((st, idx) => {
          const isHovered = hoveredIndex === idx;
          return (
            <button
              key={st.status}
              type="button"
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              onClick={() => onFilterStatus?.(st.status)}
              className={`p-2 rounded-xl text-left border transition-all cursor-pointer flex items-center justify-between ${
                isHovered
                  ? 'bg-stone-100 dark:bg-gray-800 border-teal-500 ring-1 ring-teal-500/30'
                  : 'bg-stone-50/70 dark:bg-gray-800/70 border-stone-200/80 dark:border-gray-700 hover:border-teal-400'
              }`}
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: st.color }}
                />
                <span className="text-[11px] font-semibold text-stone-800 dark:text-stone-200 truncate">
                  {st.label}
                </span>
              </div>
              <span className="text-[11px] font-mono font-bold text-stone-900 dark:text-white shrink-0 ml-1">
                {st.count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Main AdminOverviewTab Component ─────────────────────────────────────────
interface AdminOverviewTabProps {
  reports: Report[];
  onSelectTab: (tab: 'inbox' | 'chat') => void;
  onSelectReport: (report: Report) => void;
  onFilterStatus?: (status: string) => void;
  onFilterCategory?: (category: string) => void;
}

export default function AdminOverviewTab({
  reports = [],
  onSelectTab,
  onSelectReport,
  onFilterStatus,
  onFilterCategory,
}: AdminOverviewTabProps) {
  const safeReports = Array.isArray(reports) ? reports.filter(Boolean) : [];
  const [timeframe, setTimeframe] = useState<'7d' | '30d' | 'all'>('7d');

  // Key KPI stats
  const total = safeReports.length;
  const diterima = safeReports.filter((r) => r?.status === 'Laporan Diterima').length;
  const diproses = safeReports.filter(
    (r) =>
      r?.status === 'Diproses' ||
      r?.status === 'Diverifikasi' ||
      r?.status === 'Mediasi & Konseling' ||
      r?.status === 'Eskalasi ke Komite Etik'
  ).length;
  const selesai = safeReports.filter((r) => r?.status === 'Selesai').length;
  const resolutionRate = total > 0 ? Math.round((selesai / total) * 100) : 0;

  // Category counts sorted
  const categoryCounts = useMemo(() => {
    const map: Record<string, number> = {};
    safeReports.forEach((r) => {
      const c = r?.category || 'Lainnya';
      map[c] = (map[c] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [safeReports]);

  // AI Triage Risk Level counts
  const riskCounts = useMemo(() => {
    const map: Record<string, number> = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0 };
    safeReports.forEach((r) => {
      const lvl = r?.aiTriage?.riskLevel || 'MEDIUM';
      if (map[lvl] !== undefined) {
        map[lvl]++;
      } else {
        map['MEDIUM']++;
      }
    });
    return map;
  }, [safeReports]);

  // Faculty counts
  const facultyCounts = useMemo(() => {
    const map: Record<string, number> = {};
    safeReports.forEach((r) => {
      const fac = r?.targetFaculty || 'Fakultas / Unit Umum';
      map[fac] = (map[fac] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [safeReports]);

  // Recent 5 reports
  const recentReports = useMemo(() => {
    return [...safeReports]
      .sort((a, b) => new Date(b?.receivedAt || 0).getTime() - new Date(a?.receivedAt || 0).getTime())
      .slice(0, 5);
  }, [safeReports]);

  return (
    <div className="space-y-6">
      {/* ─── 1. Welcome & Operational Intel Banner ──────────────────────────── */}
      <div className="relative overflow-hidden bg-gradient-to-r from-gray-900 via-slate-800 to-gray-900 text-white rounded-3xl p-6 sm:p-8 border border-gray-700 shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-teal-500/15 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-teal-500/20 border border-teal-500/40 text-teal-300 px-3.5 py-1 rounded-full text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-teal-400" />
              <span>Satgas Intelligence & Analytics Center • PPKS UINIC</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              Ringkasan Kasus & Intelijen Satgas
            </h2>
            <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
              Monitoring real-time alur masuk berkas aduan, klasifikasi resiko hukum otomatis dengan AI Smart Triage, serta analisis resolusi kasus berbasis bukti digital.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onSelectTab('inbox')}
              className="bg-teal-600 hover:bg-teal-500 text-white font-bold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 transition-all shadow-lg hover:shadow-teal-500/25 cursor-pointer hover:scale-[1.02]"
            >
              <Inbox className="w-4 h-4" />
              <span>Buka Inbox Kasus</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => onSelectTab('chat')}
              className="bg-gray-800/90 hover:bg-gray-700 text-stone-200 border border-gray-600 font-semibold px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <Activity className="w-4 h-4 text-amber-400" />
              <span>Pesan Pelapor</span>
            </button>
          </div>
        </div>
      </div>

      {/* ─── 2. Top KPI Stat Bento Cards (4 Cards) ─────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Reports */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="relative overflow-hidden bg-white/95 dark:bg-gray-700/95 p-5 rounded-3xl border border-stone-200 dark:border-gray-600 shadow-xl backdrop-blur-xl group hover:border-teal-500/60 transition-all"
        >
          {/* Subtle SVG Wave Sparkline in Background */}
          <div className="absolute -bottom-2 inset-x-0 h-16 opacity-20 pointer-events-none text-teal-500">
            <svg viewBox="0 0 200 60" className="w-full h-full preserve-3d">
              <path
                d="M 0 45 Q 50 15, 100 35 T 200 20 L 200 60 L 0 60 Z"
                fill="currentColor"
              />
            </svg>
          </div>

          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400 flex items-center gap-1.5">
              <FileText className="w-4 h-4" /> Total Kasus
            </span>
            <span className="px-2 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 text-[10px] font-mono font-bold border border-teal-200 dark:border-teal-700">
              Database
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <p className="text-3xl sm:text-4xl font-black text-stone-900 dark:text-white font-mono tracking-tight">
              <AnimatedNumber value={total} />
            </p>
            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">Berkas Masuk</span>
          </div>
          <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-2">
            Seluruh berkas terdaftar pada sistem
          </p>
        </motion.div>

        {/* Card 2: Baru Diterima */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          onClick={() => onFilterStatus?.('Laporan Diterima')}
          className="relative overflow-hidden bg-white/95 dark:bg-gray-700/95 p-5 rounded-3xl border border-stone-200 dark:border-gray-600 shadow-xl backdrop-blur-xl group hover:border-amber-500/60 transition-all cursor-pointer"
        >
          <div className="absolute -bottom-2 inset-x-0 h-16 opacity-20 pointer-events-none text-amber-500">
            <svg viewBox="0 0 200 60" className="w-full h-full preserve-3d">
              <path
                d="M 0 50 Q 50 25, 100 40 T 200 15 L 200 60 L 0 60 Z"
                fill="currentColor"
              />
            </svg>
          </div>

          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 flex items-center gap-1.5">
              <Inbox className="w-4 h-4" /> Butuh Verifikasi
            </span>
            {diterima > 0 ? (
              <span className="px-2 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 text-[10px] font-mono font-bold border border-amber-200 dark:border-amber-700 animate-pulse">
                Antrean
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-[10px] font-mono font-bold">
                Bersih
              </span>
            )}
          </div>

          <div className="flex items-baseline gap-2">
            <p className="text-3xl sm:text-4xl font-black text-amber-600 dark:text-amber-400 font-mono tracking-tight">
              <AnimatedNumber value={diterima} />
            </p>
            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">Kasus Baru</span>
          </div>
          <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-2">
            Menunggu pemeriksaan awal Satgas
          </p>
        </motion.div>

        {/* Card 3: Sedang Diproses */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.15 }}
          onClick={() => onSelectTab('inbox')}
          className="relative overflow-hidden bg-white/95 dark:bg-gray-700/95 p-5 rounded-3xl border border-stone-200 dark:border-gray-600 shadow-xl backdrop-blur-xl group hover:border-indigo-500/60 transition-all cursor-pointer"
        >
          <div className="absolute -bottom-2 inset-x-0 h-16 opacity-20 pointer-events-none text-indigo-500">
            <svg viewBox="0 0 200 60" className="w-full h-full preserve-3d">
              <path
                d="M 0 35 Q 60 50, 110 20 T 200 35 L 200 60 L 0 60 Z"
                fill="currentColor"
              />
            </svg>
          </div>

          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 flex items-center gap-1.5">
              <Clock className="w-4 h-4" /> Investigasi & Etik
            </span>
            <span className="px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 text-[10px] font-mono font-bold border border-indigo-200 dark:border-indigo-700">
              Aktif
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <p className="text-3xl sm:text-4xl font-black text-indigo-600 dark:text-indigo-400 font-mono tracking-tight">
              <AnimatedNumber value={diproses} />
            </p>
            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">Dalam Tindakan</span>
          </div>
          <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-2">
            Penyelidikan fakta & mediasi korban
          </p>
        </motion.div>

        {/* Card 4: Selesai */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.2 }}
          onClick={() => onFilterStatus?.('Selesai')}
          className="relative overflow-hidden bg-white/95 dark:bg-gray-700/95 p-5 rounded-3xl border border-stone-200 dark:border-gray-600 shadow-xl backdrop-blur-xl group hover:border-emerald-500/60 transition-all cursor-pointer"
        >
          <div className="absolute -bottom-2 inset-x-0 h-16 opacity-20 pointer-events-none text-emerald-500">
            <svg viewBox="0 0 200 60" className="w-full h-full preserve-3d">
              <path
                d="M 0 40 Q 50 10, 100 25 T 200 10 L 200 60 L 0 60 Z"
                fill="currentColor"
              />
            </svg>
          </div>

          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4" /> Kasus Tuntas
            </span>
            <span className="px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 text-[10px] font-mono font-bold border border-emerald-200 dark:border-emerald-700">
              {resolutionRate}% Rasio
            </span>
          </div>

          <div className="flex items-baseline gap-2">
            <p className="text-3xl sm:text-4xl font-black text-emerald-600 dark:text-emerald-400 font-mono tracking-tight">
              <AnimatedNumber value={selesai} />
            </p>
            <span className="text-xs font-semibold text-stone-500 dark:text-stone-400">Kasus Ditutup</span>
          </div>
          <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-2">
            Rekomendasi sanksi & pemulihan tuntas
          </p>
        </motion.div>
      </div>

      {/* ─── 3. Main Analytics Grid: Area Curve Chart + Donut Pipeline ─────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Timeline Area Spline Chart (7 Cols) */}
        <div className="lg:col-span-7">
          <ModernTimelineAreaChart
            reports={safeReports}
            timeframe={timeframe}
            setTimeframe={setTimeframe}
          />
        </div>

        {/* Right Column: Donut Pipeline Status (5 Cols) */}
        <div className="lg:col-span-5">
          <ModernStatusDonutChart
            reports={safeReports}
            onFilterStatus={onFilterStatus}
          />
        </div>
      </div>

      {/* ─── 4. Secondary Grid: Categories Ranked & AI Risk Matrix ─────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Ranked Category Distribution (7 Cols) */}
        <div className="lg:col-span-7 bg-white/95 dark:bg-gray-700/95 border border-stone-200 dark:border-gray-600 rounded-3xl p-5 sm:p-6 shadow-xl backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between border-b border-stone-200 dark:border-gray-600 pb-3">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-0.5">
                <Building2 className="w-3.5 h-3.5" />
                <span>Distribusi Kategori Kasus</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-stone-900 dark:text-white">
                Klasifikasi Jenis Insiden Terdeteksi
              </h3>
            </div>

            <button
              type="button"
              onClick={() => onSelectTab('inbox')}
              className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              Filter Kasus <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {categoryCounts.length === 0 ? (
              <p className="text-xs text-stone-400 py-8 text-center italic">
                Belum ada data kategori kasus tercatat.
              </p>
            ) : (
              categoryCounts.map(([cat, count], idx) => {
                const percent = total > 0 ? Math.round((count / total) * 100) : 0;
                const palette = CATEGORY_PALETTE[idx % CATEGORY_PALETTE.length];

                return (
                  <div
                    key={cat}
                    onClick={() => onFilterCategory?.(cat)}
                    className="p-3 rounded-2xl bg-stone-50/80 dark:bg-gray-800/80 border border-stone-200/80 dark:border-gray-700 hover:border-teal-400 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between gap-3 mb-1.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className="w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-black text-white font-mono shadow-xs shrink-0"
                          style={{ backgroundColor: palette.accent }}
                        >
                          #{idx + 1}
                        </span>
                        <span className="text-xs sm:text-sm font-bold text-stone-900 dark:text-white truncate group-hover:text-teal-500 transition-colors">
                          {cat}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-xs font-bold font-mono text-stone-900 dark:text-white">
                          {count} Kasus
                        </span>
                        <span
                          className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold text-white shadow-xs"
                          style={{ backgroundColor: palette.accent }}
                        >
                          {percent}%
                        </span>
                      </div>
                    </div>

                    {/* Animated Progress Bar */}
                    <div className="w-full bg-stone-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full rounded-full"
                        style={{
                          background: `linear-gradient(90deg, ${palette.from}, ${palette.to})`,
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(percent, 3)}%` }}
                        transition={{ duration: 0.6, delay: idx * 0.05 }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* AI Smart Triage Risk & Severity Meter (5 Cols) */}
        <div className="lg:col-span-5 bg-white/95 dark:bg-gray-700/95 border border-stone-200 dark:border-gray-600 rounded-3xl p-5 sm:p-6 shadow-xl backdrop-blur-xl space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-gray-600 pb-3 mb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-0.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                  <span>AI Smart Triage</span>
                </div>
                <h3 className="text-base sm:text-lg font-black text-stone-900 dark:text-white">
                  Matriks Tingkat Risiko
                </h3>
              </div>

              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-700">
                Gemini Flash
              </span>
            </div>

            {/* Segmented Risk Level Bar */}
            <div className="space-y-1.5 mb-5">
              <div className="flex justify-between text-xs font-semibold text-stone-600 dark:text-stone-300">
                <span>Distribusi Keparahan Aduan</span>
                <span className="font-mono">{total} Terklasifikasi</span>
              </div>
              <div className="h-3 w-full bg-stone-200 dark:bg-gray-800 rounded-full overflow-hidden flex">
                <div
                  className="bg-rose-500 h-full transition-all"
                  style={{
                    width: `${total > 0 ? (riskCounts.CRITICAL / total) * 100 : 0}%`,
                  }}
                  title={`Critical: ${riskCounts.CRITICAL}`}
                />
                <div
                  className="bg-amber-500 h-full transition-all"
                  style={{
                    width: `${total > 0 ? (riskCounts.HIGH / total) * 100 : 0}%`,
                  }}
                  title={`High: ${riskCounts.HIGH}`}
                />
                <div
                  className="bg-yellow-400 h-full transition-all"
                  style={{
                    width: `${total > 0 ? (riskCounts.MEDIUM / total) * 100 : 0}%`,
                  }}
                  title={`Medium: ${riskCounts.MEDIUM}`}
                />
                <div
                  className="bg-emerald-500 h-full transition-all"
                  style={{
                    width: `${total > 0 ? (riskCounts.LOW / total) * 100 : 0}%`,
                  }}
                  title={`Low: ${riskCounts.LOW}`}
                />
              </div>
            </div>

            {/* 4 Risk Cards Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              {/* Critical */}
              <div className="p-3 rounded-2xl bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-rose-700 dark:text-rose-400 flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />
                    Kritis
                  </span>
                  <span className="text-base font-black font-mono text-rose-900 dark:text-rose-200">
                    {riskCounts.CRITICAL}
                  </span>
                </div>
                <p className="text-[10px] text-rose-700/80 dark:text-rose-300 leading-tight">
                  Ancaman fisik / pemerasan live
                </p>
              </div>

              {/* High */}
              <div className="p-3 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-amber-700 dark:text-amber-400 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3 text-amber-500" />
                    Tinggi
                  </span>
                  <span className="text-base font-black font-mono text-amber-900 dark:text-amber-200">
                    {riskCounts.HIGH}
                  </span>
                </div>
                <p className="text-[10px] text-amber-700/80 dark:text-amber-300 leading-tight">
                  Intimidasi & relasi kuasa
                </p>
              </div>

              {/* Medium */}
              <div className="p-3 rounded-2xl bg-yellow-50/70 dark:bg-yellow-950/40 border border-yellow-200 dark:border-yellow-800/80 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-yellow-700 dark:text-yellow-400 flex items-center gap-1">
                    <Activity className="w-3 h-3 text-yellow-500" />
                    Sedang
                  </span>
                  <span className="text-base font-black font-mono text-yellow-900 dark:text-yellow-200">
                    {riskCounts.MEDIUM}
                  </span>
                </div>
                <p className="text-[10px] text-yellow-700/80 dark:text-yellow-300 leading-tight">
                  Perundungan verbal / medsos
                </p>
              </div>

              {/* Low */}
              <div className="p-3 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-black uppercase text-emerald-700 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 text-emerald-500" />
                    Rendah
                  </span>
                  <span className="text-base font-black font-mono text-emerald-900 dark:text-emerald-200">
                    {riskCounts.LOW}
                  </span>
                </div>
                <p className="text-[10px] text-emerald-700/80 dark:text-emerald-300 leading-tight">
                  Konsultasi & mediasi ringan
                </p>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-stone-200 dark:border-gray-600 text-[11px] text-stone-500 dark:text-stone-400 font-mono flex items-center justify-between">
            <span>SLA Penanganan Kritis:</span>
            <span className="font-bold text-rose-600 dark:text-rose-400">&lt; 2 Jam Respons</span>
          </div>
        </div>
      </div>

      {/* ─── 5. Bottom Row: Sebaran Fakultas & Feed Berkas Terbaru ─────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sebaran Fakultas / Lokasi (5 Cols) */}
        <div className="lg:col-span-5 bg-white/95 dark:bg-gray-700/95 border border-stone-200 dark:border-gray-600 rounded-3xl p-5 sm:p-6 shadow-xl backdrop-blur-xl space-y-3">
          <div className="flex items-center justify-between border-b border-stone-200 dark:border-gray-600 pb-3">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-0.5">
                <Building2 className="w-3.5 h-3.5" />
                <span>Geografis Kampus</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-stone-900 dark:text-white">
                Sebaran Fakultas / Unit
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-stone-500 dark:text-stone-400">
              {facultyCounts.length} Lokasi
            </span>
          </div>

          <div className="space-y-2.5">
            {facultyCounts.length === 0 ? (
              <p className="text-xs text-stone-400 py-6 text-center italic">
                Belum ada data fakultas terlapor.
              </p>
            ) : (
              facultyCounts.slice(0, 5).map(([fac, count], i) => {
                const percent = total > 0 ? Math.round((count / total) * 100) : 0;
                return (
                  <div
                    key={fac}
                    className="p-2.5 rounded-xl bg-stone-50/70 dark:bg-gray-800/70 border border-stone-200/80 dark:border-gray-700 space-y-1.5"
                  >
                    <div className="flex items-center justify-between text-xs font-semibold text-stone-800 dark:text-stone-200">
                      <span className="truncate max-w-[200px]">{fac}</span>
                      <span className="font-mono font-bold text-stone-900 dark:text-white">
                        {count} Kasus ({percent}%)
                      </span>
                    </div>
                    <div className="w-full bg-stone-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-teal-500 h-full rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Live Incident Activity Stream (7 Cols) */}
        <div className="lg:col-span-7 bg-white/95 dark:bg-gray-700/95 border border-stone-200 dark:border-gray-600 rounded-3xl p-5 sm:p-6 shadow-xl backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between border-b border-stone-200 dark:border-gray-600 pb-3">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider mb-0.5">
                <Activity className="w-3.5 h-3.5" />
                <span>Aktivitas Masuk Terkini</span>
              </div>
              <h3 className="text-base sm:text-lg font-black text-stone-900 dark:text-white">
                5 Berkas Laporan Terbaru
              </h3>
            </div>

            <button
              type="button"
              onClick={() => onSelectTab('inbox')}
              className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              Lihat Semua ({total}) <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="divide-y divide-stone-100 dark:divide-stone-700/60">
            {recentReports.length === 0 ? (
              <p className="text-xs text-stone-400 py-6 text-center italic">
                Tidak ada laporan yang tercatat.
              </p>
            ) : (
              recentReports.map((r) => {
                const meta = STATUS_METAS[r.status] || STATUS_METAS['Laporan Diterima'];

                return (
                  <div
                    key={r.caseId}
                    onClick={() => onSelectReport(r)}
                    className="py-3 flex items-center justify-between gap-3 hover:bg-stone-50/80 dark:hover:bg-gray-800/80 px-2 rounded-2xl transition-all cursor-pointer group"
                  >
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono font-extrabold text-xs text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-gray-800 px-2 py-0.5 rounded-md border border-teal-200 dark:border-teal-700">
                          {r.caseId}
                        </span>
                        <span
                          className="px-2 py-0.5 text-[10px] font-bold rounded-full border shadow-xs"
                          style={{
                            backgroundColor: meta.bgSoft,
                            color: meta.color,
                            borderColor: meta.border,
                          }}
                        >
                          {r.status}
                        </span>
                        <span className="text-[10px] text-stone-400 dark:text-stone-500 font-mono">
                          {r.receivedAt ? formatDateID(r.receivedAt) : '-'}
                        </span>
                      </div>

                      <p className="text-xs font-bold text-stone-900 dark:text-white truncate group-hover:text-teal-500 transition-colors">
                        {r.category}
                      </p>

                      {r.targetFaculty && (
                        <p className="text-[11px] text-stone-500 dark:text-stone-400 truncate">
                          Fakultas: {r.targetFaculty}
                        </p>
                      )}
                    </div>

                    <div className="shrink-0 flex items-center gap-1 text-xs font-bold text-teal-600 dark:text-teal-400 opacity-80 group-hover:opacity-100 group-hover:translate-x-1 transition-all">
                      <span className="hidden sm:inline">Periksa</span>
                      <ArrowUpRight className="w-4 h-4" />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
