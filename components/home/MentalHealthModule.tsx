'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, type Variants } from 'framer-motion';
import { HeartPulse, Volume2, VolumeX } from 'lucide-react';

const FADE_UP: Variants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0 }
};

const FADE_UP_TRANSITION = { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const };

export default function MentalHealthModule() {
  const [isBreathing, setIsBreathing] = useState(false);
  const [breathPhase, setBreathPhase] = useState<'idle' | 'inhale' | 'hold' | 'exhale'>('idle');
  const [breathTimer, setBreathTimer] = useState(0);

  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const oscNodesRef = useRef<OscillatorNode[]>([]);

  // Play a soft calming chime tone
  const playCalmChime = (ctx: AudioContext) => {
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(528, ctx.currentTime); // 528 Hz Solfeggio frequency
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
      oscNodesRef.current.forEach(o => {
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
          oscNodesRef.current.forEach(osc => osc.stop());
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

  const handleToggleBreathing = () => {
    if (!isBreathing) {
      setIsBreathing(true);
      startAmbientAudio();
    } else {
      setIsBreathing(false);
      stopAmbientAudio();
    }
  };

  useEffect(() => {
    if (!isBreathing) {
      setBreathPhase('idle');
      setBreathTimer(0);
      return;
    }
    let isMounted = true;
    const runCycle = async () => {
      while (isMounted && isBreathing) {
        setBreathPhase('inhale');
        for (let i = 4; i > 0; i--) { if (!isMounted || !isBreathing) break; setBreathTimer(i); await new Promise(r => setTimeout(r, 1000)); }
        if (!isMounted || !isBreathing) break;
        setBreathPhase('hold');
        for (let i = 7; i > 0; i--) { if (!isMounted || !isBreathing) break; setBreathTimer(i); await new Promise(r => setTimeout(r, 1000)); }
        if (!isMounted || !isBreathing) break;
        setBreathPhase('exhale');
        for (let i = 8; i > 0; i--) { if (!isMounted || !isBreathing) break; setBreathTimer(i); await new Promise(r => setTimeout(r, 1000)); }
      }
    };
    runCycle();
    return () => { isMounted = false; };
  }, [isBreathing]);

  useEffect(() => {
    return () => { audioCtxRef.current?.close().catch(() => {}); };
  }, []);

  return (
    <motion.section
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={FADE_UP}
      transition={FADE_UP_TRANSITION}
      id="emergency"
      className="max-w-3xl mx-auto text-center space-y-8 py-6 home-block"
    >
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-stone-200 dark:border-stone-600 bg-white dark:bg-[#163432] text-stone-700 dark:text-stone-300 text-xs font-semibold uppercase tracking-widest">
          <HeartPulse className="w-4 h-4" />
          <span>Modul Pertolongan Pertama Emosional</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-semibold text-stone-900 dark:text-white">Sedang merasa panik atau cemas?</h2>
        <p className="text-stone-600 dark:text-stone-400 text-base leading-relaxed max-w-xl mx-auto">
          Istirahat sejenak. Gunakan irama pernapasan 4-7-8 dan nada relaksasi sintetis kami untuk menenangkan kecemasan akut sebelum Anda mulai melaporkan.
        </p>
      </div>

      <div className="relative bg-[#f4f4f4] dark:bg-[#163432] rounded-2xl border border-stone-300 dark:border-stone-600 p-8 sm:p-12 shadow-sm space-y-8">

        {/* Audio Toggle */}
        <div className="flex justify-center">
          <button
            type="button"
            onClick={toggleAmbientAudio}
            className={`flex items-center gap-3 px-5 py-2.5 rounded-full text-xs font-bold transition-all border cursor-pointer ${
              isPlayingAudio
                ? 'bg-teal-50 dark:bg-teal-950 border-teal-300 dark:border-teal-700 text-teal-700 dark:text-teal-300 shadow-md'
                : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-300 hover:border-teal-400'
            }`}
          >
            {isPlayingAudio ? (
              <>
                <Volume2 className="w-4 h-4 text-teal-600 dark:text-teal-400 animate-pulse" />
                <span>Suara Ambient Aktif (Klik untuk Matikan)</span>
              </>
            ) : (
              <>
                <VolumeX className="w-4 h-4" />
                <span>Putar Suara Relaksasi / Ambient Calm</span>
              </>
            )}
          </button>
        </div>

        {/* Breathing Circle */}
        <div className="relative h-64 flex items-center justify-center">
          {isBreathing ? (
            <motion.div
              animate={{
                scale: breathPhase === 'inhale' ? 1.65 : breathPhase === 'hold' ? 1.65 : 1,
                backgroundColor:
                  breathPhase === 'inhale' ? 'rgba(13, 148, 136, 0.20)' :
                  breathPhase === 'hold' ? 'rgba(5, 150, 105, 0.18)' :
                  'rgba(244, 63, 94, 0.12)'
              }}
              transition={{
                duration: breathPhase === 'inhale' ? 4 : breathPhase === 'hold' ? 7 : 8,
                ease: "easeInOut"
              }}
              className="w-40 h-40 rounded-full flex flex-col items-center justify-center backdrop-blur-sm border-2 border-teal-500/40 shadow-lg"
            >
              <span className="font-extrabold text-slate-900 dark:text-white tracking-widest text-lg uppercase">
                {breathPhase === 'inhale' && 'Tarik Napas'}
                {breathPhase === 'hold' && 'Tahan Napas'}
                {breathPhase === 'exhale' && 'Hembuskan'}
              </span>
              <span className="text-2xl font-bold font-mono text-teal-600 dark:text-teal-400 mt-1">
                {breathTimer}s
              </span>
            </motion.div>
          ) : (
            <div className="w-40 h-40 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-700 flex flex-col items-center justify-center hover:border-teal-400 transition-colors">
              <HeartPulse className="w-10 h-10 text-teal-500 mb-2" />
              <span className="text-xs text-slate-700 dark:text-slate-300 font-bold uppercase tracking-widest">Siap Modul</span>
            </div>
          )}
        </div>

        {/* Start/Stop Button */}
        <div className="pt-2">
          <button
            type="button"
            onClick={handleToggleBreathing}
            className={`px-8 py-3.5 rounded-xl text-sm font-bold transition-all shadow-md cursor-pointer ${
              isBreathing
                ? 'bg-rose-600 hover:bg-rose-700 text-white'
                : 'bg-teal-600 hover:bg-teal-500 text-white'
            }`}
          >
            {isBreathing ? 'Hentikan Modul Pernapasan' : 'Mulai Relaksasi 4-7-8 Sekarang'}
          </button>
        </div>
      </div>
    </motion.section>
  );
}
