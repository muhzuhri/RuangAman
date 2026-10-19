'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, type Variants } from 'framer-motion';
import {
  Sparkles,
  ShieldAlert,
  Scale,
  Brain,
  Cpu,
  CornerDownLeft,
  RefreshCw,
} from 'lucide-react';

const FADE_UP: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

const FADE_UP_TRANSITION = { duration: 0.4, ease: [0.215, 0.61, 0.355, 1] as const };

// ─── Preset Data Definitions ────────────────────────────────────────────────

interface PresetItem {
  id: number;
  label: string;
  badgeLabel: string;
  text: string;
  riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  riskBadge: string;
  urgencyScore: number;
  category: string;
  legalBasis: string;
  summary: string;
}

const QUICK_PRESETS: PresetItem[] = [
  {
    id: 1,
    label: 'Preset 1',
    badgeLabel: 'Pemerasan Foto',
    text: 'Kamu kalau gak nurut tak sebar foto kamu',
    riskLevel: 'CRITICAL',
    riskBadge: 'HIGH RISK / KRITIS',
    urgencyScore: 88,
    category: 'Indikasi Pengancaman / Kekerasan Seksual Berbasis Elektronik (KSBE)',
    legalBasis: 'Pasal 14 UU TPKS No. 12 Tahun 2022 & Permendikbudristek No. 30/2021',
    summary: 'Terdeteksi ancaman pemerasan penyebaran konten intim non-konsensual berunsur intimidasi relasi kuasa.',
  },
  {
    id: 2,
    label: 'Preset 2',
    badgeLabel: 'Pungli / Intimidasi',
    text: 'Senior menyuruh saya transfer uang setiap minggu',
    riskLevel: 'MEDIUM',
    riskBadge: 'MEDIUM RISK / WASPADA',
    urgencyScore: 65,
    category: 'Indikasi Pemerasan Finansial & Perundungan Relasi Kuasa (Bullying)',
    legalBasis: 'Pasal 368 KUHP & Permendikbudristek No. 30/2021',
    summary: 'Terdeteksi pemaksaan transfer dana berkala berbasis relasi kuasa senioritas di lingkungan kampus.',
  },
  {
    id: 3,
    label: 'Preset 3',
    badgeLabel: 'Konflik Akademik',
    text: 'Hanya sekadar menyampaikan pendapat di kelas',
    riskLevel: 'LOW',
    riskBadge: 'LOW RISK / NON-KASUS',
    urgencyScore: 12,
    category: 'Laporan Non-Kasus / Aktivitas Akademik Normal',
    legalBasis: 'Pasal 28E UUD 1945 (Kebebasan Berpendapat Akademik)',
    summary: 'Penyampaian pendapat wajar dalam kegiatan perkuliahan, tidak memuat unsur kekerasan maupun ancaman.',
  },
];

// Fallback rule-based analyzer for custom text input
function analyzeLocalFallback(input: string): Omit<PresetItem, 'id' | 'label' | 'badgeLabel' | 'text'> {
  const text = input.toLowerCase();

  // 1. Critical / High KSBE & Sexual violence
  if (
    text.includes('sebar foto') ||
    text.includes('foto kamu') ||
    text.includes('telanjang') ||
    text.includes('perkosa') ||
    text.includes('ancam') ||
    text.includes('mati') ||
    text.includes('bunuh') ||
    text.includes('sebar video')
  ) {
    return {
      riskLevel: 'CRITICAL',
      riskBadge: 'HIGH RISK / KRITIS',
      urgencyScore: 88,
      category: 'Indikasi Pengancaman / Kekerasan Seksual Berbasis Elektronik (KSBE)',
      legalBasis: 'Pasal 14 UU TPKS No. 12 Tahun 2022 & Permendikbudristek No. 30/2021',
      summary: 'Terdeteksi ancaman serius penyebaran materi pribadi tanpa persetujuan dengan potensi intimidasi psikologis.',
    };
  }

  // 2. Medium Bullying / Extortion / Power relation
  if (
    text.includes('senior') ||
    text.includes('transfer') ||
    text.includes('uang') ||
    text.includes('bayar') ||
    text.includes('tugas') ||
    text.includes('himpunan') ||
    text.includes('dosen') ||
    text.includes('intimidasi')
  ) {
    return {
      riskLevel: 'MEDIUM',
      riskBadge: 'MEDIUM RISK / WASPADA',
      urgencyScore: 65,
      category: 'Indikasi Pemerasan Finansial & Perundungan Relasi Kuasa (Bullying)',
      legalBasis: 'Pasal 368 KUHP & Permendikbudristek No. 30/2021',
      summary: 'Terdeteksi indikasi penyalahgunaan wewenang senioritas/organisasi yang menimbulkan tekanan finansial atau mental.',
    };
  }

  // 3. Low / Normal academic
  return {
    riskLevel: 'LOW',
    riskBadge: 'LOW RISK / NON-KASUS',
    urgencyScore: 12,
    category: 'Laporan Non-Kasus / Aktivitas Akademik Normal',
    legalBasis: 'Pasal 28E UUD 1945 (Kebebasan Berpendapat Akademik)',
    summary: 'Narasi teks diklasifikasikan wajar dan tidak terindikasi tindak kekerasan seksual maupun perundungan.',
  };
}

export default function AITriageSimulator() {
  const [inputText, setInputText] = useState(QUICK_PRESETS[0].text);
  const [activePresetId, setActivePresetId] = useState<number | null>(1);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);

  const [triageOutput, setTriageOutput] = useState<{
    riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    riskBadge: string;
    urgencyScore: number;
    category: string;
    legalBasis: string;
    summary: string;
  }>({
    riskLevel: QUICK_PRESETS[0].riskLevel,
    riskBadge: QUICK_PRESETS[0].riskBadge,
    urgencyScore: QUICK_PRESETS[0].urgencyScore,
    category: QUICK_PRESETS[0].category,
    legalBasis: QUICK_PRESETS[0].legalBasis,
    summary: QUICK_PRESETS[0].summary,
  });

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Trigger analysis either via live API or intelligent instant analyzer
  const triggerAnalysis = async (text: string, presetMatch?: PresetItem) => {
    if (!text.trim()) {
      setTriageOutput({
        riskLevel: 'LOW',
        riskBadge: 'STANDBY / MENUNGGU INPUT',
        urgencyScore: 0,
        category: 'Menunggu teks contoh laporan...',
        legalBasis: 'Rujukan hukum akan tampil otomatis sesuai teks kasus',
        summary: 'Ketik pesan atau pilih salah satu preset di atas untuk melihat simulasi analisis AI.',
      });
      return;
    }

    setIsAnalyzing(true);

    // If matches a preset, we can render preset immediately while validating via API
    if (presetMatch) {
      setTriageOutput({
        riskLevel: presetMatch.riskLevel,
        riskBadge: presetMatch.riskBadge,
        urgencyScore: presetMatch.urgencyScore,
        category: presetMatch.category,
        legalBasis: presetMatch.legalBasis,
        summary: presetMatch.summary,
      });
    }

    try {
      const res = await fetch('/api/ai-triage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ kronologi: text }),
      });

      if (res.ok) {
        const data = await res.json();
        let badge = 'LOW RISK / NON-KASUS';
        if (data.riskLevel === 'CRITICAL' || data.riskLevel === 'HIGH') {
          badge = 'HIGH RISK / KRITIS';
        } else if (data.riskLevel === 'MEDIUM') {
          badge = 'MEDIUM RISK / WASPADA';
        }

        setTriageOutput({
          riskLevel: data.riskLevel,
          riskBadge: badge,
          urgencyScore: data.urgencyScore || 88,
          category: data.categoryRecommendation || 'Indikasi Kasus Terverifikasi',
          legalBasis: data.legalPasalBasis || 'Pasal 14 UU TPKS No. 12 Tahun 2022 & Permendikbudristek No. 30/2021',
          summary: data.summary || 'Analisis teks kronologi diselesaikan oleh Gemini 2.0 / 2.5 Flash.',
        });
      } else {
        // Fallback local heuristic
        const fallback = analyzeLocalFallback(text);
        setTriageOutput(fallback);
      }
    } catch {
      // Offline fallback
      const fallback = analyzeLocalFallback(text);
      setTriageOutput(fallback);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectPreset = (preset: PresetItem) => {
    setActivePresetId(preset.id);
    setInputText(preset.text);
    triggerAnalysis(preset.text, preset);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInputText(val);
    setActivePresetId(null);

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      triggerAnalysis(val);
    }, 450);
  };

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  const getRiskStyle = (level: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW') => {
    switch (level) {
      case 'CRITICAL':
      case 'HIGH':
        return {
          badgeBg: 'bg-rose-500/15 text-rose-600 dark:text-rose-300 border-rose-500/40',
          barColor: 'bg-gradient-to-r from-rose-500 via-red-500 to-yellow-500',
          textColor: 'text-rose-600 dark:text-rose-400',
          iconColor: 'text-rose-500',
          dotColor: 'bg-rose-500',
        };
      case 'MEDIUM':
        return {
          badgeBg: 'bg-amber-500/15 text-amber-700 dark:text-amber-300 border-amber-500/40',
          barColor: 'bg-gradient-to-r from-amber-500 to-yellow-400',
          textColor: 'text-amber-600 dark:text-amber-400',
          iconColor: 'text-amber-500',
          dotColor: 'bg-amber-500',
        };
      case 'LOW':
      default:
        return {
          badgeBg: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/40',
          barColor: 'bg-gradient-to-r from-emerald-500 to-teal-400',
          textColor: 'text-emerald-600 dark:text-emerald-400',
          iconColor: 'text-emerald-500',
          dotColor: 'bg-emerald-500',
        };
    }
  };

  const riskStyle = getRiskStyle(triageOutput.riskLevel);

  return (
    <motion.div
      variants={FADE_UP}
      transition={FADE_UP_TRANSITION}
      className="relative z-10 w-full"
    >
      <div
        className="relative rounded-2xl border border-stone-300 dark:border-gray-600 bg-white/95 dark:bg-gray-700/95 p-5 sm:p-7 shadow-2xl space-y-4 overflow-hidden backdrop-blur-xl"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Subtle background ambient glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-teal-500/10 dark:bg-teal-400/10 rounded-full blur-2xl pointer-events-none" />

        {/* ─── 1. HEADER KARTU WIDGET ─────────────────────────────────────── */}
        <div
          className="flex items-center justify-between border-b border-stone-200 dark:border-gray-600 pb-3.5"
          style={{ transform: 'translateZ(25px)' }}
        >
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-50 dark:bg-gray-800 border border-teal-200 dark:border-teal-700 text-teal-600 dark:text-teal-400 shadow-xs">
              <Brain className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-stone-900 dark:text-white flex items-center gap-1.5 leading-tight">
                <span>Simulasi AI Smart Triage (Live)</span>
              </h3>
              <p className="text-[11px] text-stone-500 dark:text-stone-300 font-medium mt-0.5">
                Demonstrasi live klasifikasi risiko & pemetaan pasal hukum berbasis AI
              </p>
            </div>
          </div>

          {/* Badge Atas: GEMINI 2.0 / 2.5 FLASH (Aksen Teal/Cyan) */}
          <span className="inline-flex items-center gap-1.5 text-[10px] font-mono tracking-wider font-extrabold bg-gradient-to-r from-teal-500/15 to-cyan-500/15 text-teal-700 dark:text-teal-300 border border-teal-500/30 px-2.5 py-1 rounded-full shadow-xs shrink-0">
            <Sparkles className="w-3 h-3 text-teal-500 animate-spin" style={{ animationDuration: '6s' }} />
            <span>GEMINI 2.0 / 2.5 FLASH</span>
          </span>
        </div>

        {/* ─── 2. INPUT PRESET & TEKS BEBAS ───────────────────────────────── */}
        <div className="space-y-2.5" style={{ transform: 'translateZ(30px)' }}>
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-wider text-stone-600 dark:text-stone-300 flex items-center gap-1">
              <Cpu className="w-3 h-3 text-teal-600 dark:text-teal-400" />
              <span>Contoh Kalimat Cepat (Quick Presets):</span>
            </span>
            {isInputFocused ? (
              <span className="text-[10px] text-teal-600 dark:text-teal-400 font-mono font-bold flex items-center gap-1 animate-pulse">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                <span>Input Aktif (Terkunci Mantap)</span>
              </span>
            ) : isAnalyzing ? (
              <span className="text-[10px] text-teal-600 dark:text-teal-300 font-mono font-bold flex items-center gap-1">
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span>Menganalisis...</span>
              </span>
            ) : null}
          </div>

          {/* 3 Tombol Contoh Kalimat Cepat */}
          <div className="grid grid-cols-3 gap-1.5">
            {QUICK_PRESETS.map((p) => {
              const isSelected = activePresetId === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  data-no-tilt="true"
                  onClick={() => handleSelectPreset(p)}
                  className={`px-2 py-2 rounded-xl text-[11px] font-bold transition-all text-center truncate cursor-pointer border ${
                    isSelected
                      ? 'bg-gray-700 text-white border-teal-600 shadow-sm scale-[1.02]'
                      : 'bg-stone-50 dark:bg-gray-800 text-stone-700 dark:text-stone-200 border-stone-200 dark:border-gray-600 hover:border-teal-400 hover:bg-stone-100 dark:hover:bg-gray-600'
                  }`}
                  title={p.text}
                >
                  {p.badgeLabel}
                </button>
              );
            })}
          </div>

          {/* Kolom Input Teks (Textarea) */}
          <div className="relative">
            <textarea
              rows={2}
              data-no-tilt="true"
              value={inputText}
              onChange={handleInputChange}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setIsInputFocused(false)}
              placeholder="Ketik contoh pesan/ancaman di sini..."
              className={`w-full bg-stone-50 dark:bg-gray-800 border rounded-xl px-3.5 py-2.5 text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-400 focus:outline-none text-xs sm:text-sm font-medium shadow-xs transition-all resize-none leading-relaxed ${
                isInputFocused
                  ? 'border-teal-500 ring-2 ring-teal-500/25 dark:border-teal-400'
                  : 'border-stone-300 dark:border-gray-600 focus:border-teal-600'
              }`}
            />
            <div className="absolute right-2.5 bottom-2.5 text-[10px] text-stone-400 font-mono pointer-events-none flex items-center gap-0.5">
              <span>Enter</span>
              <CornerDownLeft className="w-2.5 h-2.5" />
            </div>
          </div>
        </div>

        {/* ─── 3. WIDGET HASIL ANALISIS REAL-TIME (OUTPUT CONTAINER) ─────── */}
        <div
          className="rounded-2xl border border-stone-200 dark:border-gray-600 bg-stone-50/90 dark:bg-gray-800/90 p-3.5 space-y-3 shadow-inner"
          style={{ transform: 'translateZ(35px)' }}
        >
          {/* Baris 1: Risk Badge & Skor Urgensi */}
          <div className="flex items-center justify-between gap-2">
            <span
              className={`px-2.5 py-1 rounded-lg text-xs font-black border flex items-center gap-1.5 shadow-xs ${riskStyle.badgeBg}`}
            >
              <span className={`w-2 h-2 rounded-full ${riskStyle.dotColor} animate-ping`} />
              <span>{triageOutput.riskBadge}</span>
            </span>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400">Skor Urgensi:</span>
              <span className={`text-base font-black font-mono ${riskStyle.textColor}`}>
                {triageOutput.urgencyScore}
                <span className="text-[11px] text-stone-400 font-normal"> / 100</span>
              </span>
            </div>
          </div>

          {/* Skor Urgensi: Progress Bar Animasi */}
          <div className="w-full bg-stone-200 dark:bg-gray-700 h-2.5 rounded-full overflow-hidden p-0.5">
            <motion.div
              className={`h-full rounded-full ${riskStyle.barColor}`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(Math.max(triageOutput.urgencyScore, 5), 100)}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>

          {/* Baris 2: Indikasi Kasus & Dasar Hukum Otomatis */}
          <div className="space-y-1.5 pt-0.5 text-xs">
            <div className="flex items-start gap-1.5">
              <ShieldAlert className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${riskStyle.iconColor}`} />
              <div className="leading-snug">
                <span className="font-bold text-stone-800 dark:text-stone-200">Kategori Terdeteksi: </span>
                <span className="text-stone-700 dark:text-stone-300 font-medium">
                  {triageOutput.category}
                </span>
              </div>
            </div>

            <div className="flex items-start gap-1.5">
              <Scale className="w-3.5 h-3.5 shrink-0 mt-0.5 text-teal-600 dark:text-teal-400" />
              <div className="leading-snug">
                <span className="font-bold text-teal-800 dark:text-teal-300">Dasar Hukum Otomatis: </span>
                <span className="text-stone-700 dark:text-stone-300 font-medium font-mono text-[11px]">
                  {triageOutput.legalBasis}
                </span>
              </div>
            </div>
          </div>
        </div>

        
      </div>
    </motion.div>
  );
}
