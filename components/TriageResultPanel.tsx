'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  ShieldAlert,
  Shield,
  ShieldCheck,
  Brain,
  Gavel,
  Gauge,
  Sparkles,
  Loader2,
} from 'lucide-react';
import { type AITriageResult, type TriageRiskLevel } from '@/lib/types';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface TriageResultPanelProps {
  isLoading: boolean;
  result: AITriageResult | null;
  error: string | null;
}

// ─── Risk Config ───────────────────────────────────────────────────────────────

const RISK_CONFIG: Record<
  TriageRiskLevel,
  {
    label: string;
    icon: React.ReactNode;
    badgeCls: string;
    borderCls: string;
    bgCls: string;
    barCls: string;
    dotCls: string;
  }
> = {
  CRITICAL: {
    label: 'Kritis — Butuh Penanganan Segera',
    icon: <AlertTriangle className="w-4 h-4" />,
    badgeCls: 'bg-red-100 dark:bg-red-950/80 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800',
    borderCls: 'border-red-300 dark:border-red-800',
    bgCls: 'bg-red-50/60 dark:bg-red-950/20',
    barCls: 'bg-red-500',
    dotCls: 'bg-red-500 animate-pulse',
  },
  HIGH: {
    label: 'Tinggi — Prioritas Investigasi',
    icon: <ShieldAlert className="w-4 h-4" />,
    badgeCls: 'bg-orange-100 dark:bg-orange-950/80 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800',
    borderCls: 'border-orange-300 dark:border-orange-800',
    bgCls: 'bg-orange-50/60 dark:bg-orange-950/20',
    barCls: 'bg-orange-500',
    dotCls: 'bg-orange-500 animate-pulse',
  },
  MEDIUM: {
    label: 'Sedang — Mediasi & Evaluasi',
    icon: <Shield className="w-4 h-4" />,
    badgeCls: 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
    borderCls: 'border-amber-300 dark:border-amber-700',
    bgCls: 'bg-amber-50/60 dark:bg-amber-950/20',
    barCls: 'bg-amber-500',
    dotCls: 'bg-amber-500',
  },
  LOW: {
    label: 'Rendah — Tinjauan Standar',
    icon: <ShieldCheck className="w-4 h-4" />,
    badgeCls: 'bg-teal-100 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800',
    borderCls: 'border-teal-300 dark:border-teal-800',
    bgCls: 'bg-teal-50/60 dark:bg-teal-950/20',
    barCls: 'bg-teal-500',
    dotCls: 'bg-teal-500',
  },
};

// ─── Urgency Progress Bar ──────────────────────────────────────────────────────

function UrgencyBar({ score, barCls }: { score: number; barCls: string }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[10px] font-semibold text-stone-500 dark:text-stone-400 uppercase tracking-wider">
        <span className="flex items-center gap-1">
          <Gauge className="w-3 h-3" /> Skor Urgensi AI
        </span>
        <span className="font-mono font-black text-stone-700 dark:text-stone-200">{score}/100</span>
      </div>
      <div className="h-2 w-full bg-stone-200 dark:bg-stone-700 rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${barCls}`}
          initial={{ width: 0 }}
          animate={{ width: `${score}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export default function TriageResultPanel({
  isLoading,
  result,
  error,
}: TriageResultPanelProps) {
  if (!isLoading && !result && !error) return null;

  return (
    <AnimatePresence mode="wait">
      {isLoading && (
        <motion.div
          key="loading"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="flex items-center gap-3 p-4 bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200/80 dark:border-teal-800/60 rounded-2xl text-xs text-teal-800 dark:text-teal-300"
        >
          <Loader2 className="w-4 h-4 animate-spin text-teal-600 dark:text-teal-400 shrink-0" />
          <div>
            <p className="font-bold">AI Smart Triage sedang menganalisis...</p>
            <p className="text-teal-700/80 dark:text-teal-400/80 mt-0.5">
              Mengevaluasi tingkat risiko & dasar hukum yang relevan
            </p>
          </div>
        </motion.div>
      )}

      {!isLoading && error && (
        <motion.div
          key="error"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="flex items-center gap-3 p-3 bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-700 rounded-2xl text-xs text-stone-500 dark:text-stone-400"
        >
          <Brain className="w-4 h-4 shrink-0" />
          <span>Analisis AI tidak tersedia saat ini. Laporan Anda tetap akan diproses oleh Satgas PPKS.</span>
        </motion.div>
      )}

      {!isLoading && result && (
        <motion.div
          key="result"
          initial={{ opacity: 0, y: 10, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35 }}
          className={`rounded-2xl border ${RISK_CONFIG[result.riskLevel].borderCls} ${RISK_CONFIG[result.riskLevel].bgCls} overflow-hidden`}
        >
          {/* Header */}
          <div className="px-4 pt-4 pb-3 flex items-center justify-between gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <div className={`relative`}>
                <span className={`flex h-2.5 w-2.5 rounded-full ${RISK_CONFIG[result.riskLevel].dotCls}`} />
              </div>
              <span className="text-[10px] font-black uppercase tracking-wider text-stone-500 dark:text-stone-400 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-teal-500" />
                AI Smart Triage — Hasil Analisis Risiko
              </span>
            </div>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold ${RISK_CONFIG[result.riskLevel].badgeCls}`}
            >
              {RISK_CONFIG[result.riskLevel].icon}
              {result.riskLevel}
            </span>
          </div>

          {/* Body */}
          <div className="px-4 pb-4 space-y-3">
            {/* Risk Label */}
            <p className="text-xs font-bold text-stone-700 dark:text-stone-200">
              {RISK_CONFIG[result.riskLevel].label}
            </p>

            {/* Urgency Bar */}
            <UrgencyBar
              score={result.urgencyScore}
              barCls={RISK_CONFIG[result.riskLevel].barCls}
            />

            <div className="grid grid-cols-1 gap-2.5 pt-1">
              {/* Summary */}
              <div className="p-3 bg-white/70 dark:bg-stone-900/50 rounded-xl border border-stone-200/60 dark:border-stone-700/50 space-y-1">
                <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                  Ringkasan AI
                </p>
                <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed">
                  {result.summary}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Category */}
                <div className="p-3 bg-white/70 dark:bg-stone-900/50 rounded-xl border border-stone-200/60 dark:border-stone-700/50 space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500">
                    Rekomendasi Kategori
                  </p>
                  <p className="text-xs font-semibold text-stone-700 dark:text-stone-300">
                    {result.categoryRecommendation}
                  </p>
                </div>

                {/* Legal Basis */}
                <div className="p-3 bg-white/70 dark:bg-stone-900/50 rounded-xl border border-stone-200/60 dark:border-stone-700/50 space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 flex items-center gap-1">
                    <Gavel className="w-2.5 h-2.5" /> Dasar Hukum
                  </p>
                  <p className="text-xs font-semibold text-stone-700 dark:text-stone-300 leading-relaxed">
                    {result.legalPasalBasis}
                  </p>
                </div>
              </div>
            </div>

            <p className="text-[10px] text-stone-400 dark:text-stone-600 italic">
              * Analisis AI bersifat indikatif. Keputusan akhir tetap berada di tangan Satgas PPKS yang terlatih.
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
