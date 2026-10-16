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
} from 'lucide-react';
import Link from 'next/link';

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

  // Play a soft 528 Hz Solfeggio chime tone
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
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      let ctx = audioCtxRef.current;
      if (!ctx || ctx.state === 'closed') {
        ctx = new AudioCtx();
        audioCtxRef.current = ctx;
      }

      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      // Stop existing oscillators if running
      oscNodesRef.current.forEach((o: OscillatorNode) => {
        try { o.stop(); } catch {}
      });
      oscNodesRef.current = [];

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.001, ctx.currentTime);
      masterGain.gain.linearRampToValueAtTime(0.45, ctx.currentTime + 1.0);
      gainNodeRef.current = masterGain;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(550, ctx.currentTime);

      // Calming binaural 432Hz ambient chord
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

      // LFO for slow breathing wave effect
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

      // Play introductory chime
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

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioCtxRef.current) {
        try { audioCtxRef.current.close(); } catch {}
      }
    };
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (isActive) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            // Next phase
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

  // Circle animation parameters based on phase
  const getCircleScale = () => {
    if (!isActive) return 1;
    if (currentPhase.action === 'Inhale') return 1.35;
    if (currentPhase.action === 'Hold') return 1.35;
    return 1;
  };

  return (
    <div className="bg-white/90 dark:bg-[#163432] backdrop-blur-xl border border-teal-500/30 rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden space-y-6">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 dark:border-stone-600 pb-4">
        <div>
          <div className="inline-flex items-center gap-2 bg-teal-50 dark:[#163432] border border-teal-200 dark:border-teal-800 px-3 py-1 rounded-full text-teal-700 dark:text-teal-300 text-xs font-bold mb-1">
            <Wind className="w-3.5 h-3.5" /> Widget Relaksasi Mandiri (4-7-8 Technique)
          </div>
          <h2 className="text-xl font-extrabold text-stone-900 dark:text-stone-50">Panduan Pernapasan Penenang Kepanikan</h2>
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
            {isPlayingAudio ? <Volume2 className="w-4 h-4 text-teal-600 dark:text-teal-400 animate-pulse" /> : <VolumeX className="w-4 h-4" />}
            <span className="hidden sm:inline">{isPlayingAudio ? 'Audio 432Hz Aktif' : 'Suara Relax'}</span>
          </button>

          <div className="flex items-center gap-2 bg-stone-100 dark:bg-stone-700 px-3 py-2 rounded-xl text-xs font-semibold text-stone-700 dark:text-stone-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Siklus: <strong>{cyclesCompleted}</strong></span>
          </div>
        </div>
      </div>

      {/* Animated Breathing Circle */}
      <div className="py-8 flex flex-col items-center justify-center relative">
        <div className="relative w-56 h-56 flex items-center justify-center">
          {/* Glowing Aura Ring */}
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

          {/* Inner Circle Content */}
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
          {isActive ? currentPhase.text : 'Tekan tombol Mulai di bawah untuk memulai sesi pernapasan terarah & audio relaksasi.'}
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

import { EMERGENCY_CONTACTS, QUICK_SAFETY_ACTIONS } from '@/data/pfaSupportData';

// ─── Main Support Page ────────────────────────────────────────────────────────

export default function SupportPage() {
  const emergencyContacts = EMERGENCY_CONTACTS;
  const quickActions = QUICK_SAFETY_ACTIONS;

  return (
    <div className="min-h-screen bg-transparent text-stone-900 dark:text-stone-100 font-sans selection:bg-teal-500/20 pt-24 pb-20">
      
      <main className="max-w-5xl mx-auto px-4 sm:px-6 space-y-12 relative z-10">

        {/* Hero Banner */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 bg-teal-50 dark:bg-[#163432] border border-teal-200 dark:border-teal-800 px-4 py-1.5 rounded-full text-teal-700 dark:text-teal-300 text-xs font-bold shadow-xs">
            <HeartHandshake className="w-4 h-4" /> Pusat Bantuan & Psychological First Aid (PFA)
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-stone-900 dark:text-stone-50">
            Anda Tidak Sendirian. Kami Ada di Sini.
          </h1>
          <p className="text-sm sm:text-base text-stone-600 dark:text-stone-300 max-w-2xl mx-auto leading-relaxed">
            Halaman ini didedikasikan untuk memberikan pertolongan pertama penenang kecemasan, panduan amankan diri, serta nomor darurat yang siap mendampingi Anda kapan saja.
          </p>
        </div>

        {/* WIDGET RELAKSASI MANDIRI (4-7-8 BREATHING) */}
        <BreathingWidget />

        {/* DAFTAR KONTAK DARURAT KAMPUS */}
        <div className="space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold text-stone-900 dark:text-stone-50 flex items-center gap-2.5">
              <PhoneCall className="w-6 h-6 text-teal-600 dark:text-teal-400" /> Kontak Darurat & Hotline Satgas
            </h2>
            <p className="text-sm text-stone-600 dark:text-stone-400">
              Tim pendamping siap menerima panggilan atau pesan pesan instan untuk memberikan perlindungan darurat.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {emergencyContacts.map((contact, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: i * 0.1 }}
                className={`bg-white/90 dark:bg-[#163432] backdrop-blur-xl border ${contact.bg} rounded-3xl p-6 space-y-4 shadow-lg flex flex-col justify-between`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-3 bg-white dark:bg-[#163432] rounded-2xl border border-stone-200 dark:border-stone-600 shadow-xs">
                      {contact.icon}
                    </div>
                    <span className="px-3 py-1 bg-white/80 dark:bg-[#163432]/80 rounded-full text-[11px] font-bold text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-600">
                      {contact.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-base text-stone-900 dark:text-stone-50 leading-snug">{contact.title}</h3>
                    <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">{contact.subtitle}</p>
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

        {/* PANDUAN TINDAKAN CEPT (FAST EMERGENCY ACTIONS) */}
        <div className="bg-white/90 dark:bg-[#163432] backdrop-blur-xl border border-stone-200 dark:border-stone-600 rounded-3xl p-6 sm:p-8 shadow-xl space-y-6">
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
              <div key={i} className="bg-stone-50 dark:bg-[#14302c]/60 border border-stone-200 dark:border-stone-600 rounded-2xl p-5 space-y-2 flex items-start gap-4">
                <span className="font-mono text-2xl font-black text-teal-600 dark:text-teal-400 shrink-0">{act.step}</span>
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

      </main>
    </div>
  );
}
