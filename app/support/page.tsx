'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HeartHandshake,
  PhoneCall,
  Wind,
  ShieldCheck,
  AlertCircle,
  LifeBuoy,
  MessageCircle,
  CheckCircle2,
  Sparkles,
  Play,
  Pause,
  RotateCcw,
  Lock,
  ArrowRight,
  ShieldAlert,
  UserCheck,
  Volume2,
  VolumeX,
  BookOpen,
  FileText,
  HelpCircle,
  ChevronDown,
  Clock,
  Calendar,
  X,
  Share2,
  Check,
  ChevronRight,
  BookMarked,
  Layers,
  Scale,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

import { EMERGENCY_CONTACTS, QUICK_SAFETY_ACTIONS } from '@/data/pfaSupportData';
import {
  VIOLATIONS_CATALOG,
  ARTICLES_DATA,
  EDU_FAQS,
  VICTIM_RIGHTS,
  type Article,
} from '@/data/educationData';

// ─── 4-7-8 Breathing Exercise Timer with Web Audio API Ambient Sound ────────

const BREATH_PHASES = [
  { name: 'Tarik Napas...', duration: 4, action: 'Inhale', text: 'Tarik napas perlahan melalui hidung Anda' },
  { name: 'Tahan Napas...', duration: 7, action: 'Hold', text: 'Tahan napas dan tenangkan pikiran Anda' },
  { name: 'Hembuskan...', duration: 8, action: 'Exhale', text: 'Hembuskan perlahan melalui mulut dengan lembut' },
];

function BreathingWidget() {
  const [isActive, setIsActive] = useState(false);
  const [phaseIndex, setPhaseIndex] = useState(0);
  const [secondsLeft, setSecondsLeft] = useState(BREATH_PHASES[0].duration);
  const [cyclesCompleted, setCyclesCompleted] = useState(0);

  // Web Audio API Ambient Relaxation Synthesizer
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const oscNodesRef = useRef<OscillatorNode[]>([]);

  // Play a soft 528 Hz chime tone
  const playCalmChime = (ctx: AudioContext) => {
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(528, ctx.currentTime);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1.8);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 1.8);
    } catch (e) {
      console.error('Chime audio error:', e);
    }
  };

  const startAmbientAudio = async () => {
    try {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      let ctx = audioCtxRef.current;
      if (!ctx || ctx.state === 'closed') {
        ctx = new AudioCtx();
        audioCtxRef.current = ctx;
      }

      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      oscNodesRef.current.forEach((o: OscillatorNode) => {
        try {
          o.stop();
        } catch {}
      });
      oscNodesRef.current = [];

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.001, ctx.currentTime);
      masterGain.gain.linearRampToValueAtTime(0.45, ctx.currentTime + 1.0);
      gainNodeRef.current = masterGain;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(550, ctx.currentTime);

      const frequencies = [216, 432, 648];
      const oscs: OscillatorNode[] = [];

      frequencies.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        const oscGain = ctx.createGain();
        oscGain.gain.setValueAtTime(idx === 0 ? 0.35 : 0.25, ctx.currentTime);
        osc.connect(oscGain);
        oscGain.connect(filter);
        osc.start();
        oscs.push(osc);
      });

      const lfo = ctx.createOscillator();
      lfo.type = 'sine';
      lfo.frequency.setValueAtTime(0.12, ctx.currentTime);
      const lfoGain = ctx.createGain();
      lfoGain.gain.setValueAtTime(0.12, ctx.currentTime);
      lfo.connect(lfoGain);
      lfoGain.connect(masterGain.gain);
      lfo.start();
      oscs.push(lfo);

      filter.connect(masterGain);
      masterGain.connect(ctx.destination);
      oscNodesRef.current = oscs;
      setIsPlayingAudio(true);

      playCalmChime(ctx);
    } catch (e) {
      console.error('Web Audio API error:', e);
    }
  };

  const stopAmbientAudio = () => {
    if (audioCtxRef.current && gainNodeRef.current) {
      const ctx = audioCtxRef.current;
      gainNodeRef.current.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
      setTimeout(() => {
        try {
          oscNodesRef.current.forEach((osc: OscillatorNode) => osc.stop());
          audioCtxRef.current?.close();
        } catch {}
        audioCtxRef.current = null;
        oscNodesRef.current = [];
        setIsPlayingAudio(false);
      }, 500);
    } else {
      setIsPlayingAudio(false);
    }
  };

  const toggleAmbientAudio = () => {
    if (isPlayingAudio) stopAmbientAudio();
    else startAmbientAudio();
  };

  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        try {
          audioCtxRef.current.close();
        } catch {}
      }
    };
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            const nextIdx = (phaseIndex + 1) % BREATH_PHASES.length;
            if (nextIdx === 0) {
              setCyclesCompleted((c) => c + 1);
            }
            setPhaseIndex(nextIdx);
            return BREATH_PHASES[nextIdx].duration;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, phaseIndex]);

  const toggleTimer = () => {
    if (!isActive) {
      setIsActive(true);
      startAmbientAudio();
    } else {
      setIsActive(false);
      stopAmbientAudio();
    }
  };

  const resetTimer = () => {
    setIsActive(false);
    stopAmbientAudio();
    setPhaseIndex(0);
    setSecondsLeft(BREATH_PHASES[0].duration);
    setCyclesCompleted(0);
  };

  const currentPhase = BREATH_PHASES[phaseIndex];

  const getCircleScale = () => {
    if (!isActive) return 1;
    if (currentPhase.action === 'Inhale') return 1.35;
    if (currentPhase.action === 'Hold') return 1.35;
    return 1;
  };

  return (
    <div className="bg-white/90 dark:bg-gray-700 backdrop-blur-xl border border-teal-500/30 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 dark:border-stone-600 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-teal-50 dark:bg-gray-800 border border-teal-200 dark:border-teal-800 px-3 py-1 rounded-full text-teal-700 dark:text-teal-300 text-xs font-bold mb-1">
            <Wind className="w-3.5 h-3.5" /> Widget Relaksasi Mandiri (4-7-8 Technique)
          </div>
          <h2 className="text-xl font-extrabold text-stone-900 dark:text-stone-50">
            Panduan Pernapasan Penenang Kepanikan
          </h2>
        </div>
        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            type="button"
            onClick={toggleAmbientAudio}
            title={isPlayingAudio ? 'Matikan Suara Ambient' : 'Putar Suara Ambient (432Hz)'}
            className={`p-2 rounded-xl border text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
              isPlayingAudio
                ? 'bg-teal-50 dark:bg-teal-950/80 border-teal-300 dark:border-teal-700 text-teal-700 dark:text-teal-300 shadow-xs'
                : 'bg-stone-100 dark:bg-stone-700 border-stone-200 dark:border-stone-500 text-stone-600 dark:text-stone-400 hover:bg-stone-200 dark:hover:bg-stone-700'
            }`}
          >
            {isPlayingAudio ? (
              <Volume2 className="w-4 h-4 text-teal-600 dark:text-teal-400 animate-pulse" />
            ) : (
              <VolumeX className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">{isPlayingAudio ? 'Audio 432Hz Aktif' : 'Suara Relax'}</span>
          </button>

          <div className="flex items-center gap-2 bg-stone-100 dark:bg-stone-700 px-3 py-2 rounded-xl text-xs font-semibold text-stone-700 dark:text-stone-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>
              Siklus: <strong>{cyclesCompleted}</strong>
            </span>
          </div>
        </div>
      </div>

      {/* Animated Breathing Circle */}
      <div className="py-8 flex flex-col items-center justify-center relative">
        <div className="relative w-56 h-56 flex items-center justify-center">
          <motion.div
            animate={{ scale: getCircleScale() }}
            transition={{
              duration: currentPhase.action === 'Hold' ? 0 : currentPhase.duration,
              ease: 'easeInOut',
            }}
            className={`absolute inset-0 rounded-full ${
              currentPhase.action === 'Inhale'
                ? 'bg-teal-500/20 dark:bg-teal-500/30 border-2 border-teal-400'
                : currentPhase.action === 'Hold'
                ? 'bg-indigo-500/20 dark:bg-indigo-500/30 border-2 border-indigo-400'
                : 'bg-emerald-500/20 dark:bg-emerald-500/30 border-2 border-emerald-400'
            } backdrop-blur-xs`}
          />

          <div className="relative z-10 flex flex-col items-center text-center p-4">
            <p className="text-xs uppercase tracking-widest font-bold text-stone-400 mb-1">
              {isActive ? currentPhase.action : 'Siap Mulai'}
            </p>
            <h3 className="text-2xl font-black text-stone-900 dark:text-stone-50 mb-1">
              {isActive ? currentPhase.name : '4-7-8 Breathing'}
            </h3>
            <span className="text-4xl font-extrabold font-mono text-teal-600 dark:text-teal-400">
              {secondsLeft}s
            </span>
          </div>
        </div>

        <p className="mt-6 text-sm text-stone-600 dark:text-stone-300 font-medium text-center max-w-md h-10">
          {isActive
            ? currentPhase.text
            : 'Tekan tombol Mulai di bawah untuk memulai sesi pernapasan terarah & audio relaksasi.'}
        </p>
      </div>

      {/* Controls */}
      <div className="flex items-center justify-center gap-3 pt-2">
        <button
          type="button"
          onClick={toggleTimer}
          className={`px-6 py-3 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-md cursor-pointer ${
            isActive
              ? 'bg-amber-500 hover:bg-amber-600 text-white'
              : 'bg-teal-600 hover:bg-teal-700 text-white shadow-teal-600/30'
          }`}
        >
          {isActive ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current" />}
          <span>{isActive ? 'Jeda Pernapasan' : 'Mulai Latihan'}</span>
        </button>

        <button
          type="button"
          onClick={resetTimer}
          className="px-4 py-3 rounded-xl border border-stone-200 dark:border-stone-600 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-700 font-semibold text-sm transition-colors flex items-center gap-1.5 cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" /> Reset
        </button>
      </div>
    </div>
  );
}

// ─── Main Layanan & Informasi Page ───────────────────────────────────────────

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState<'all' | 'pfa' | 'catalog' | 'articles' | 'faq'>('all');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);

  // Close modal on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedArticle(null);
      }
    };
    if (selectedArticle) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
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

  const emergencyContacts = EMERGENCY_CONTACTS;
  const quickActions = QUICK_SAFETY_ACTIONS;

  return (
    <div className="min-h-screen bg-transparent text-stone-900 dark:text-stone-100 font-sans selection:bg-teal-500/20 pt-24 pb-24">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12 relative z-10">
        {/* ─── Hero Header Section ──────────────────────────────────────────── */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-teal-50 dark:bg-gray-700 border border-teal-200 dark:border-teal-800 px-4 py-1.5 rounded-full text-teal-700 dark:text-teal-300 text-xs font-bold shadow-xs">
            <HeartHandshake className="w-4 h-4" /> Pusat Layanan & Edukasi Informasi Terpadu
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-stone-900 dark:text-stone-50 leading-tight">
            Layanan Bantuan, Pendampingan & <br className="hidden sm:block" />
            <span className="text-teal-600 dark:text-teal-400">Edukasi Hak Sivitas Kampus</span>
          </h1>
          <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300 leading-relaxed font-medium">
            Satu ekosistem lengkap: pertolongan pertama kepanikan (PFA), hotline darurat Satgas PPKS, katalog bentuk
            kekerasan, literasi regulasi hukum, dan jaminan pelindungan mutlak bagi seluruh mahasiswa.
          </p>
        </div>

        {/* ─── Category Navigation Tab Bar ──────────────────────────────────── */}
        <div className="flex items-center justify-center">
          <div className="flex flex-wrap items-center justify-center gap-2 bg-stone-100 dark:bg-stone-900/80 p-1.5 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-inner">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'all'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" /> Semua Konten
            </button>
            <button
              onClick={() => setActiveTab('pfa')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'pfa'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <Wind className="w-3.5 h-3.5" /> Bantuan & PFA
            </button>
            <button
              onClick={() => setActiveTab('catalog')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'catalog'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <Scale className="w-3.5 h-3.5" /> Pelanggaran 
            </button>
            <button
              onClick={() => setActiveTab('articles')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'articles'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" /> Artikel & Literasi
            </button>
            <button
              onClick={() => setActiveTab('faq')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'faq'
                  ? 'bg-teal-600 text-white shadow-md'
                  : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" /> Tanya Jawab (FAQ)
            </button>
          </div>
        </div>

        {/* ─── TAB CONTENT 1: BANTUAN & PFA ───────────────────────────────────── */}
        {(activeTab === 'all' || activeTab === 'pfa') && (
          <section className="space-y-12">
            {/* WIDGET RELAKSASI MANDIRI (4-7-8 BREATHING) */}
            <BreathingWidget />

            {/* DAFTAR KONTAK DARURAT KAMPUS */}
            <div className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-2xl font-extrabold text-stone-900 dark:text-stone-50 flex items-center gap-2.5">
                  <PhoneCall className="w-6 h-6 text-teal-600 dark:text-teal-400" /> Kontak Darurat & Hotline Satgas
                </h2>
                <p className="text-sm text-stone-600 dark:text-stone-400">
                  Tim pendamping siap menerima panggilan atau pesan instan untuk memberikan perlindungan darurat 24 jam.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {emergencyContacts.map((contact, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.1 }}
                    className={`bg-white/90 dark:bg-gray-700 backdrop-blur-xl border ${contact.bg} rounded-3xl p-6 space-y-4 shadow-lg flex flex-col justify-between`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="p-3 bg-white dark:bg-gray-800 rounded-2xl border border-stone-200 dark:border-stone-600 shadow-xs">
                          {contact.icon}
                        </div>
                        <span className="px-3 py-1 bg-white/80 dark:bg-gray-800/80 rounded-full text-[11px] font-bold text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-600">
                          {contact.badge}
                        </span>
                      </div>

                      <div>
                        <h3 className="font-extrabold text-base text-stone-900 dark:text-stone-50 leading-snug">
                          {contact.title}
                        </h3>
                        <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">
                          {contact.subtitle}
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 space-y-2">
                      <a
                        href={contact.waLink}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-xs"
                      >
                        <MessageCircle className="w-3.5 h-3.5" /> Chat WhatsApp Darurat
                      </a>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* PANDUAN TINDAKAN CEPAT (FAST EMERGENCY ACTIONS) */}
            <div className="bg-white/90 dark:bg-gray-700 backdrop-blur-xl border border-stone-200 dark:border-stone-600 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
              <div className="space-y-1">
                <h2 className="text-2xl font-extrabold text-stone-900 dark:text-stone-50 flex items-center gap-2.5">
                  <ShieldCheck className="w-6 h-6 text-teal-600 dark:text-teal-400" /> Langkah Cepat Pengamanan Diri
                </h2>
                <p className="text-sm text-stone-600 dark:text-stone-400">
                  Langkah awal yang harus dilakukan korban untuk mengamankan fisik dan jejak bukti digital secara mandiri.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {quickActions.map((act, i) => (
                  <div
                    key={i}
                    className="bg-stone-50 dark:bg-gray-800/60 border border-stone-200 dark:border-stone-600 rounded-2xl p-5 space-y-2 flex items-start gap-4"
                  >
                    <span className="font-mono text-2xl font-black text-teal-600 dark:text-teal-400 shrink-0">
                      {act.step}
                    </span>
                    <div className="space-y-1">
                      <h3 className="font-bold text-sm text-stone-900 dark:text-stone-50 flex items-center gap-2">
                        {act.icon} {act.title}
                      </h3>
                      <p className="text-xs text-stone-600 dark:text-stone-400 leading-relaxed">{act.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-stone-100 dark:border-stone-600 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 font-medium">
                  <AlertCircle className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                  <span>Semua laporan yang masuk diproses dengan standar proteksi anonimitas Zero-Knowledge.</span>
                </div>
                <Link
                  href="/report"
                  className="bg-teal-600 hover:bg-teal-700 text-white font-bold py-3 px-6 rounded-xl text-xs flex items-center gap-2 transition-all shadow-md shrink-0 cursor-pointer"
                >
                  <span>Buat Laporan Sekarang</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* ─── TAB CONTENT 2: KATALOG PELANGGARAN & HAK KORBAN ────────────────── */}
        {(activeTab === 'all' || activeTab === 'catalog') && (
          <section className="space-y-12">
            {/* KATALOG BENTUK PELANGGARAN */}
            <div className="space-y-6">
              <div className="space-y-1">
                <h2 className="text-2xl font-extrabold text-stone-900 dark:text-stone-50 flex items-center gap-2.5">
                  <ShieldAlert className="w-6 h-6 text-rose-600 dark:text-rose-400" /> Katalog Bentuk Pelanggaran
                </h2>
                <p className="text-sm text-stone-600 dark:text-stone-300 font-medium">
                  Pelajari kategori kekerasan digital & akademik yang dilindungi oleh peraturan kampus dan
                  undang-undang nasional.
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
                    <div className="absolute -left-[21px] md:-left-[29px] top-5 w-3.5 h-3.5 rounded-full bg-stone-300 dark:bg-gray-700 border-2 border-white dark:border-stone-950 group-hover:bg-teal-500 group-hover:scale-125 transition-all duration-300" />

                    <div className="bg-white/90 dark:bg-gray-700 backdrop-blur-xl border border-stone-200 dark:border-stone-600/80 rounded-2xl p-5 md:p-6 space-y-3 shadow-xs hover:border-teal-500/50 hover:shadow-md transition-all">
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
                              className="text-xs text-stone-800 dark:text-stone-200 bg-stone-50 dark:bg-gray-800/60 px-3 py-1.5 rounded-lg border border-stone-200/60 dark:border-stone-600/60 flex items-center gap-1.5 font-medium"
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
                          Landasan Hukum:{' '}
                          <strong className="text-stone-800 dark:text-stone-200">{item.legalBasis}</strong>
                        </span>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

           
          </section>
        )}

        {/* ─── TAB CONTENT 3: 6 ARTIKEL EDUKASI & LITERASI HUKUM ──────────────── */}
        {(activeTab === 'all' || activeTab === 'articles') && (
          <section className="space-y-8 pt-4">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 px-3 py-1 rounded-full text-xs font-bold text-teal-700 dark:text-teal-300">
                <BookMarked className="w-3.5 h-3.5" /> Artikel & Panduan Resmi
              </div>
              <h2 className="text-2xl md:text-3xl font-black text-stone-900 dark:text-stone-50 flex items-center gap-3">
                <span>Artikel & Literasi Hukum Terkini</span>
              </h2>
              <p className="text-sm text-stone-600 dark:text-stone-300 font-medium max-w-2xl">
                6 artikel dan panduan praktis penanganan kasus, keamanan siber digital, serta perlindungan hak-hak
                mahasiswa. Klik artikel untuk membaca selengkapnya.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {ARTICLES_DATA.map((art, idx) => (
                <motion.div
                  key={art.id}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: idx * 0.06 }}
                  onClick={() => setSelectedArticle(art)}
                  className="group bg-white/90 dark:bg-gray-700 backdrop-blur-xl border border-stone-200 dark:border-stone-600 rounded-3xl overflow-hidden shadow-xs hover:shadow-xl hover:border-teal-500/50 transition-all duration-300 cursor-pointer flex flex-col justify-between"
                >
                  <div className="relative h-48 sm:h-56 w-full overflow-hidden bg-stone-100 dark:bg-gray-800">
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
          </section>
        )}

        {/* ─── TAB CONTENT 4: FAQ EDUKATIF ──────────────────────────────────── */}
        {(activeTab === 'all' || activeTab === 'faq') && (
          <section className="space-y-6 pt-4">
            <div className="space-y-1">
              <h2 className="text-2xl font-extrabold text-stone-900 dark:text-stone-50 flex items-center gap-2.5">
                <HelpCircle className="w-6 h-6 text-indigo-600 dark:text-indigo-400" /> Pertanyaan Umum & Prosedur Etik
                (FAQ)
              </h2>
              <p className="text-sm text-stone-600 dark:text-stone-300 font-medium">
                Jawaban resmi mengenai kerahasiaan, investigasi bukti, dan kepastian hukum dalam penanganan kasus.
              </p>
            </div>

            <div className="space-y-3">
              {EDU_FAQS.map((faq, idx) => {
                const isOpen = openFaqIndex === idx;
                return (
                  <div
                    key={idx}
                    className="bg-white/90 dark:bg-gray-700 backdrop-blur-xl border border-stone-200 dark:border-stone-600 rounded-2xl overflow-hidden shadow-xs"
                  >
                    <button
                      type="button"
                      onClick={() => toggleFaq(idx)}
                      className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 font-bold text-sm text-stone-900 dark:text-stone-50 hover:bg-stone-50 dark:hover:bg-stone-800/50 transition-colors cursor-pointer"
                    >
                      <span>{faq.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-teal-600 dark:text-teal-400 transition-transform duration-200 shrink-0 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    <AnimatePresence>
                      {isOpen && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
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
          </section>
        )}
      </main>

      {/* ─── ARTICLE DETAIL MODAL ──────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedArticle && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedArticle(null)}
              className="fixed inset-0 z-150 bg-stone-950/80 backdrop-blur-md"
            />

            <div className="fixed inset-x-3 bottom-3 z-200 flex items-end justify-center sm:inset-x-4 sm:bottom-4 sm:items-center sm:top-20">
              <motion.div
                initial={{ opacity: 0, scale: 0.96, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: 30 }}
                transition={{ duration: 0.25 }}
                className="relative w-full max-w-3xl mx-auto bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-600 rounded-3xl shadow-2xl z-10 flex flex-col overflow-hidden"
                style={{ maxHeight: 'calc(100vh - 88px)' }}
              >
                {/* Modal Header Bar */}
                <div className="p-6 border-b border-stone-200 dark:border-stone-600 flex items-start justify-between gap-4 bg-stone-50 dark:bg-gray-800 rounded-t-3xl">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
                        {selectedArticle.category}
                      </span>
                      <span className="text-xs font-mono text-stone-600 dark:text-stone-300 flex items-center gap-1 font-medium">
                        <Clock className="w-3.5 h-3.5 text-teal-500" /> {selectedArticle.readTime}
                      </span>
                      <span className="text-xs font-mono text-stone-600 dark:text-stone-300 flex items-center gap-1 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-teal-500" /> {selectedArticle.date}
                      </span>
                    </div>

                    <h2 className="text-xl sm:text-2xl font-black text-stone-900 dark:text-stone-50 leading-snug">
                      {selectedArticle.title}
                    </h2>

                    <p className="text-xs text-stone-600 dark:text-stone-400 font-mono">
                      Penulis: <strong className="text-stone-800 dark:text-stone-200">{selectedArticle.author}</strong>
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

                {/* Modal Body Content */}
                <div className="p-6 md:p-8 overflow-y-auto space-y-6 text-stone-800 dark:text-stone-200 text-sm leading-relaxed custom-scrollbar">
                  <div className="bg-teal-50 dark:bg-teal-950/60 border-l-4 border-teal-500 p-4 rounded-r-xl text-xs sm:text-sm font-medium text-teal-950 dark:text-teal-100 leading-relaxed">
                    {selectedArticle.excerpt}
                  </div>

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

                  {selectedArticle.legalRef && (
                    <div className="pt-4 border-t border-stone-200 dark:border-stone-600 text-xs font-mono text-stone-600 dark:text-stone-400 flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                      <span>
                        Referensi Legal:{' '}
                        <strong className="text-stone-900 dark:text-stone-200">{selectedArticle.legalRef}</strong>
                      </span>
                    </div>
                  )}
                </div>

                {/* Modal Footer Actions */}
                <div className="p-4 sm:p-6 border-t border-stone-200 dark:border-stone-600 bg-stone-50 dark:bg-gray-800 flex items-center justify-between gap-4">
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
