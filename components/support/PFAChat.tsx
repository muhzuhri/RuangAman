'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  User,
  Send,
  Loader2,
  Sparkles,
  ShieldCheck,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  RotateCcw,
  MessageSquare,
  Video,
  Radio,
  ExternalLink,
  Square,
  AlertCircle,
  Headphones,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import type { ChatMessage } from '@/app/api/pfa-chat/route';

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface UIMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

// ─── Quick Prompt Chips ───────────────────────────────────────────────────────

const QUICK_CHIPS = [
  'Saya merasa sangat cemas dan butuh teman bicara',
  'Apakah pelaporan di RuangAman benar-benar 100% anonim?',
  'Bagaimana langkah terbaik menenangkan diri saat panik?',
  'Saya takut melapor karena ancaman, apa yang harus saya lakukan?',
  'Bantu saya memahami proses perlindungan oleh Satgas PPKS',
];

const INITIAL_MESSAGE: UIMessage = {
  id: 'init',
  role: 'model',
  text: 'Halo, saya Ara 💚 — Pendamping Psychological First Aid (PFA) resmi dari RuangAman.\n\nSaya di sini untuk mendengarkan Anda dengan empati penuh, tanpa menghakimi. Anda berada di tempat yang aman dan identitas Anda 100% terlindungi secara anonim.\n\nBagaimana kondisi atau perasaan Anda saat ini?',
  timestamp: new Date(),
};

export default function PFAChat() {
  // Mode: 'text' (default, lightweight & quota-friendly) or 'avatar' (interactive voice/avatar)
  const [mode, setMode] = useState<'text' | 'avatar'>('text');

  // Conversation State
  const [messages, setMessages] = useState<UIMessage[]>([INITIAL_MESSAGE]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Avatar & Voice States
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [currentCaption, setCurrentCaption] = useState(INITIAL_MESSAGE.text);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [ttsSupported, setTtsSupported] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);

  // Audio Equalizer & Lip-sync Simulation State
  const [mouthOpenRatio, setMouthOpenRatio] = useState(0);

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const lipSyncIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // ─── Auto-scroll text chat ──────────────────────────────────────────────────
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    if (mode === 'text') {
      scrollToBottom();
    }
  }, [messages, isLoading, mode, scrollToBottom]);

  // ─── Initialize Web Speech API (STT & TTS) ──────────────────────────────────
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check SpeechRecognition
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        setSpeechSupported(true);
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'id-ID';

        recognition.onstart = () => {
          setIsListening(true);
          setMicError(null);
          setInterimTranscript('');
        };

        recognition.onresult = (event: any) => {
          let interim = '';
          let final = '';

          for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
              final += event.results[i][0].transcript;
            } else {
              interim += event.results[i][0].transcript;
            }
          }

          if (interim) setInterimTranscript(interim);
          if (final) {
            setTranscript(final);
            setInterimTranscript('');
            handleSendMessage(final);
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('[SpeechRecognition Error]', event.error);
          setIsListening(false);
          if (event.error === 'not-allowed') {
            setMicError('Izin mikrofon ditolak. Silakan izinkan akses mikrofon di peramban Anda.');
          } else if (event.error === 'network') {
            setMicError('Koneksi suara terganggu. Anda tetap dapat mengetik pesan.');
          } else if (event.error !== 'no-speech') {
            setMicError('Tidak dapat mendengar suara. Silakan coba lagi atau gunakan teks.');
          }
        };

        recognition.onend = () => {
          setIsListening(false);
          setInterimTranscript('');
        };

        recognitionRef.current = recognition;
      }

      // Check SpeechSynthesis (TTS)
      if ('speechSynthesis' in window) {
        synthRef.current = window.speechSynthesis;
        setTtsSupported(true);
      }
    }

    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
      }
      if (synthRef.current) {
        synthRef.current.cancel();
      }
      if (lipSyncIntervalRef.current) {
        clearInterval(lipSyncIntervalRef.current);
      }
    };
  }, []);

  // ─── Speak AI Response (Text-to-Speech & Lip-Sync Animation) ───────────────
  const speakText = useCallback(
    (textToSpeak: string) => {
      if (!synthRef.current || isMuted) return;

      synthRef.current.cancel();
      if (lipSyncIntervalRef.current) clearInterval(lipSyncIntervalRef.current);

      // Clean markdown tags, emojis, and asterisks for natural voice flow
      const cleanVoiceText = textToSpeak
        .replace(/[*_#`~[\]]/g, '')
        .replace(/http\S+/g, '')
        .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
        .trim();

      if (!cleanVoiceText) return;

      const utterance = new SpeechSynthesisUtterance(cleanVoiceText);
      utterance.lang = 'id-ID';
      utterance.rate = 0.95; // Soothing, gentle cadence for Psychological First Aid
      utterance.pitch = 1.05;

      // Select Indonesian voice if available
      const voices = synthRef.current.getVoices();
      const idVoice = voices.find(
        (v) => v.lang.startsWith('id') || v.lang.includes('ID') || v.name.toLowerCase().includes('indonesia')
      );
      if (idVoice) utterance.voice = idVoice;

      utterance.onstart = () => {
        setIsSpeaking(true);
        // Start Lip-sync oscillation simulation
        lipSyncIntervalRef.current = setInterval(() => {
          setMouthOpenRatio((prev) => {
            // Natural speech cadence variation between 0.15 and 0.85
            const next = 0.2 + Math.random() * 0.65;
            return Math.abs(prev - next) > 0.1 ? next : prev;
          });
        }, 110);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setMouthOpenRatio(0);
        if (lipSyncIntervalRef.current) clearInterval(lipSyncIntervalRef.current);
      };

      utterance.onerror = (e) => {
        console.warn('[SpeechSynthesis Error]', e);
        setIsSpeaking(false);
        setMouthOpenRatio(0);
        if (lipSyncIntervalRef.current) clearInterval(lipSyncIntervalRef.current);
      };

      utteranceRef.current = utterance;
      synthRef.current.speak(utterance);
    },
    [isMuted]
  );

  const stopSpeaking = () => {
    if (synthRef.current) synthRef.current.cancel();
    setIsSpeaking(false);
    setMouthOpenRatio(0);
    if (lipSyncIntervalRef.current) clearInterval(lipSyncIntervalRef.current);
  };

  // ─── Toggle Microphone Recording ───────────────────────────────────────────
  const toggleListening = () => {
    if (!speechSupported) {
      setMicError('Browser Anda belum mendukung input suara otomatis. Silakan gunakan chat teks.');
      return;
    }

    if (isSpeaking) stopSpeaking();

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      setMicError(null);
      try {
        recognitionRef.current?.start();
      } catch (err) {
        console.warn('[Start Mic Error]', err);
      }
    }
  };

  // ─── Handle Sending Message (Shared by Both Modes) ─────────────────────────
  const handleSendMessage = async (textToSend?: string) => {
    const messageContent = (textToSend !== undefined ? textToSend : input).trim();
    if (!messageContent || isLoading) return;

    setInput('');
    setTranscript('');
    setInterimTranscript('');
    setMicError(null);

    const userMessage: UIMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: messageContent,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Build history for Gemini multi-turn
      const historyPayload: ChatMessage[] = messages
        .filter((m) => m.id !== 'init')
        .slice(-6)
        .map((m) => ({
          role: m.role,
          text: m.text,
        }));

      const res = await fetch('/api/pfa-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageContent,
          history: historyPayload,
        }),
      });

      const data = await res.json();
      const replyText =
        data.reply ||
        'Terima kasih telah berbagi dengan saya. Apapun yang Anda hadapi, perasaan Anda valid dan Anda tidak sendirian. Jangan ragu membuat laporan anonim di halaman /report agar tim Satgas PPKS dapat mendampingi Anda secara aman.';

      const botMessage: UIMessage = {
        id: `bot-${Date.now()}`,
        role: 'model',
        text: replyText,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, botMessage]);
      setCurrentCaption(replyText);

      // In Avatar mode, automatically speak the empathetic response with lip-sync
      if (mode === 'avatar' && !isMuted) {
        speakText(replyText);
      }
    } catch (err) {
      console.error('[PFAChat] Error calling API:', err);
      const fallbackMessage: UIMessage = {
        id: `bot-${Date.now()}`,
        role: 'model',
        text: 'Saya mendengar Anda dengan sepenuh hati. Meskipun saat ini terjadi kendala teknis jaringan, ketahuilah bahwa Anda sangat berharga dan berani. Jika Anda membutuhkan bantuan darurat segera, silakan hubungi Hotline Satgas di bagian bawah halaman ini atau buat laporan aman di /report.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, fallbackMessage]);
      setCurrentCaption(fallbackMessage.text);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleResetChat = () => {
    stopSpeaking();
    setMessages([INITIAL_MESSAGE]);
    setCurrentCaption(INITIAL_MESSAGE.text);
    setInput('');
    setTranscript('');
    setInterimTranscript('');
    setMicError(null);
  };

  return (
    <div className="w-full bg-[#f4f4f4] dark:bg-[#163432] backdrop-blur-2xl border border-stone-300 dark:border-teal-900/80 rounded-3xl shadow-xl overflow-hidden flex flex-col transition-all">
      
      {/* ── 1. HEADER & DUAL-MODE TOGGLE SWITCH ─────────────────────────────── */}
      <div className="px-5 py-4 border-b border-stone-200 dark:border-teal-900/60 bg-white/80 dark:bg-[#0c2422]/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Assistant Brand Status */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative shrink-0">
            <div className="w-11 h-11 rounded-2xl overflow-hidden ring-2 ring-teal-500/40 shadow-xs relative">
              <Image
                src="/images/ara_avatar.jpg"
                alt="Ara Avatar Portrait"
                width={44}
                height={44}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white dark:border-[#0c2422] rounded-full" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-sm sm:text-base text-stone-900 dark:text-white">
                Ara — Pendamping PFA
              </h3>
              <span className="text-[10px] bg-teal-50 dark:bg-teal-950/80 border border-teal-200 dark:border-teal-800 text-teal-800 dark:text-teal-300 font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                100% Anonim
              </span>
            </div>
            <p className="text-xs text-stone-500 dark:text-stone-400">
              Psychological First Aid & Panduan Aman Kampus
            </p>
          </div>
        </div>

        {/* Dual Mode Switcher Tabs */}
        <div className="flex items-center gap-1.5 bg-stone-200/80 dark:bg-stone-900/90 p-1 rounded-2xl border border-stone-300 dark:border-stone-700 w-full sm:w-auto justify-center">
          <button
            type="button"
            onClick={() => {
              stopSpeaking();
              setMode('text');
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              mode === 'text'
                ? 'bg-teal-800 text-white shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>💬 Chat Teks</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setMode('avatar');
              if (!isMuted && ttsSupported) {
                // Read current caption on entering avatar mode
                speakText(currentCaption);
              }
            }}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              mode === 'avatar'
                ? 'bg-teal-800 text-white shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>🎙️ AI Avatar Interaktif</span>
          </button>

          <button
            type="button"
            onClick={handleResetChat}
            title="Reset Percakapan"
            className="p-2 text-stone-500 hover:text-stone-800 dark:text-stone-400 dark:hover:text-stone-200 transition-colors rounded-xl cursor-pointer ml-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ── 2. MODE BODY: TEKS vs AVATAR ────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        
        {/* ── TAB A: MODE CHAT TEKS (DEFAULT & RINGAN) ──────────────────────── */}
        {mode === 'text' && (
          <motion.div
            key="text-mode"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col flex-1"
          >
            {/* Messages Scroll Area */}
            <div className="h-[430px] overflow-y-auto p-5 sm:p-6 space-y-4 custom-scrollbar">
              {messages.map((msg) => {
                const isUser = msg.role === 'user';
                return (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.25 }}
                    className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 shadow-xs ${
                        isUser
                          ? 'bg-teal-700 text-white'
                          : 'bg-emerald-600 text-white'
                      }`}
                    >
                      {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                    </div>

                    <div className={`max-w-[85%] sm:max-w-[78%] space-y-1.5 flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                      <div
                        className={`px-4.5 py-3.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
                          isUser
                            ? 'bg-teal-700 text-white rounded-tr-xs'
                            : 'bg-white dark:bg-[#1a3e3a] text-stone-900 dark:text-stone-100 border border-stone-200 dark:border-teal-900/60 rounded-tl-xs shadow-xs'
                        }`}
                      >
                        {msg.text}

                        {/* CTA Shortcut if message mentions /report */}
                        {!isUser && msg.text.includes('/report') && (
                          <div className="mt-3 pt-2.5 border-t border-stone-100 dark:border-teal-800/60">
                            <Link
                              href="/report"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/80 dark:hover:bg-teal-900 text-teal-800 dark:text-teal-300 text-xs font-bold border border-teal-200 dark:border-teal-800 transition-colors"
                            >
                              <span>📝 Buka Formulir Laporan Anonim</span>
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          </div>
                        )}
                      </div>

                      <span className="text-[10px] text-stone-400 px-1 font-mono">
                        {msg.timestamp.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </motion.div>
                );
              })}

              {isLoading && (
                <div className="flex gap-3 items-center text-xs text-stone-500 dark:text-stone-400">
                  <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="flex items-center gap-2 bg-white dark:bg-[#1a3e3a] px-4 py-2.5 rounded-2xl border border-stone-200 dark:border-teal-900/60">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-teal-600" />
                    <span>Ara sedang memikirkan respons terbaik...</span>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Quick Chips Bar */}
            <div className="px-5 py-2.5 bg-stone-100/60 dark:bg-stone-900/40 border-t border-stone-200 dark:border-teal-900/40 flex items-center gap-2 overflow-x-auto no-scrollbar">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-teal-600" /> Topik Cepat:
              </span>
              {QUICK_CHIPS.map((chip, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSendMessage(chip)}
                  disabled={isLoading}
                  className="shrink-0 text-xs px-3 py-1.5 rounded-xl bg-white dark:bg-[#163432] hover:bg-teal-50 dark:hover:bg-teal-950/80 text-stone-700 dark:text-stone-300 hover:text-teal-800 dark:hover:text-teal-200 border border-stone-300 dark:border-stone-700 transition-all font-medium cursor-pointer"
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <div className="p-4 bg-white/90 dark:bg-[#0c2422]/90 border-t border-stone-200 dark:border-teal-900/60 flex items-end gap-3">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Tuliskan apa yang Anda rasakan atau tanyakan... (Enter untuk kirim)"
                rows={2}
                disabled={isLoading}
                className="flex-1 bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-2xl p-3 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:border-teal-600 focus:ring-1 focus:ring-teal-600 resize-none font-medium"
              />

              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={isLoading || !input.trim()}
                className="h-11 px-5 rounded-2xl bg-teal-800 hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md shrink-0 cursor-pointer"
              >
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span className="hidden sm:inline">Kirim</span>
              </button>
            </div>
          </motion.div>
        )}

        {/* ── TAB B: MODE AI AVATAR INTERAKTIF (VOICE & ANIMATION) ──────────── */}
        {mode === 'avatar' && (
          <motion.div
            key="avatar-mode"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            className="flex flex-col flex-1 p-5 sm:p-8 space-y-6"
          >
            {/* AVATAR HERO STAGE CONTAINER */}
            <div className="relative rounded-3xl overflow-hidden bg-gradient-to-b from-stone-900 via-[#0a2321] to-[#041513] border border-teal-800/60 p-6 sm:p-8 flex flex-col items-center justify-center min-h-[380px] text-white shadow-2xl">
              
              {/* Audio Visualizer Halo Waves (Active when Ara speaks or listens) */}
              {(isSpeaking || isListening) && (
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div className="w-64 h-64 rounded-full border-2 border-teal-500/25 animate-ping" />
                  <div className="w-80 h-80 rounded-full border border-teal-400/15 animate-pulse" />
                </div>
              )}

              {/* Status Header Badge on Top of Avatar Frame */}
              <div className="absolute top-4 inset-x-0 flex items-center justify-between px-6 z-20">
                <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-teal-800/60 text-xs">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      isListening
                        ? 'bg-rose-500 animate-pulse'
                        : isSpeaking
                        ? 'bg-emerald-400 animate-ping'
                        : isLoading
                        ? 'bg-amber-400 animate-spin'
                        : 'bg-teal-400'
                    }`}
                  />
                  <span className="font-semibold text-stone-200 text-[11px]">
                    {isListening
                      ? '🎙️ Mendengarkan Suara Anda...'
                      : isSpeaking
                      ? '🗣️ Ara Sedang Berbicara...'
                      : isLoading
                      ? '⏳ Memproses Jawaban Empati...'
                      : '✨ Ara Siap Mendengarkan Anda'}
                  </span>
                </div>

                {/* Audio Controls */}
                <div className="flex items-center gap-1.5">
                  {isSpeaking && (
                    <button
                      type="button"
                      onClick={stopSpeaking}
                      className="px-2.5 py-1 rounded-xl bg-rose-600/80 hover:bg-rose-700 text-white text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Square className="w-3 h-3" /> Stop
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      const newMuted = !isMuted;
                      setIsMuted(newMuted);
                      if (newMuted) stopSpeaking();
                    }}
                    className={`p-2 rounded-xl transition-colors cursor-pointer ${
                      isMuted
                        ? 'bg-rose-500/30 text-rose-300 border border-rose-500/50'
                        : 'bg-black/50 text-stone-300 hover:text-white border border-teal-800/60'
                    }`}
                    title={isMuted ? 'Nyalakan Suara' : 'Matikan Suara (Bisu)'}
                  >
                    {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* AVATAR PORTRAIT FRAME WITH LIP-SYNC OVERLAY */}
              <div className="relative my-4 z-10">
                <div
                  className={`w-40 h-40 sm:w-48 sm:h-48 rounded-full p-1.5 transition-all duration-300 shadow-[0_0_50px_rgba(13,148,136,0.35)] ${
                    isSpeaking
                      ? 'ring-4 ring-emerald-400/80 scale-105'
                      : isListening
                      ? 'ring-4 ring-teal-400 animate-pulse'
                      : 'ring-2 ring-teal-600/50'
                  } bg-gradient-to-tr from-teal-700 via-emerald-500 to-cyan-400`}
                >
                  <div className="w-full h-full rounded-full overflow-hidden relative bg-stone-900">
                    <Image
                      src="/images/ara_avatar.jpg"
                      alt="Ara Virtual Avatar"
                      width={192}
                      height={192}
                      className="w-full h-full object-cover"
                      priority
                    />

                    {/* Dynamic Lip-Sync Mouth Mesh Overlay */}
                    {isSpeaking && (
                      <div
                        className="absolute left-1/2 -translate-x-1/2 pointer-events-none rounded-full bg-[#3d1814] opacity-85 transition-all duration-75 border border-[#803328]"
                        style={{
                          top: '59.5%',
                          width: `${18 + mouthOpenRatio * 8}px`,
                          height: `${4 + mouthOpenRatio * 14}px`,
                        }}
                      />
                    )}
                  </div>
                </div>

                {/* Pulsing Audio Frequency Equalizer Bars (Below Avatar Portrait) */}
                {isSpeaking && (
                  <div className="flex items-center justify-center gap-1 mt-3">
                    {[0.6, 1.0, 0.4, 0.8, 1.2, 0.7, 0.9, 0.5].map((factor, i) => (
                      <motion.div
                        key={i}
                        animate={{
                          height: [6, Math.max(8, 26 * factor * (mouthOpenRatio || 0.4)), 6],
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 0.35 + i * 0.05,
                          ease: 'easeInOut',
                        }}
                        className="w-1 bg-gradient-to-t from-teal-500 to-emerald-300 rounded-full"
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* LIVE SPOKEN SUBTITLES / CAPTIONS BAR */}
              <div className="w-full max-w-2xl bg-black/55 backdrop-blur-md border border-teal-800/60 rounded-2xl p-4 text-center z-10 space-y-2">
                <p className="text-xs sm:text-sm text-stone-200 leading-relaxed font-medium max-h-24 overflow-y-auto custom-scrollbar">
                  {isLoading ? (
                    <span className="inline-flex items-center gap-2 text-teal-300">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Ara sedang menyiapkan respons empati...
                    </span>
                  ) : isListening && interimTranscript ? (
                    <span className="italic text-teal-300">&ldquo;{interimTranscript}&rdquo;</span>
                  ) : (
                    currentCaption
                  )}
                </p>

                {/* Subtitle Action Links */}
                <div className="flex items-center justify-center gap-3 pt-1">
                  {currentCaption.includes('/report') && (
                    <Link
                      href="/report"
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-[11px] font-bold shadow-xs transition-colors"
                    >
                      <span>📝 Laporkan Sekarang (100% Anonim)</span>
                    </Link>
                  )}

                  {!isSpeaking && !isLoading && currentCaption && (
                    <button
                      type="button"
                      onClick={() => speakText(currentCaption)}
                      className="inline-flex items-center gap-1 text-[11px] text-teal-400 hover:text-teal-300 underline cursor-pointer"
                    >
                      <Volume2 className="w-3 h-3" /> Ulangi Suara Ara
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Error / Warning Alert if Microphone permission issue */}
            {micError && (
              <div className="bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 rounded-2xl p-3.5 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{micError}</span>
              </div>
            )}

            {/* INTERACTIVE VOICE CONTROLS & DIRECT TEXT INPUT IN AVATAR MODE */}
            <div className="bg-white/80 dark:bg-[#0c2422]/80 border border-stone-200 dark:border-teal-900/60 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center gap-4">
              
              {/* Push-to-Talk Mic Button */}
              <button
                type="button"
                onClick={toggleListening}
                disabled={isLoading}
                className={`w-full sm:w-auto px-6 py-4 rounded-2xl font-bold text-xs sm:text-sm flex items-center justify-center gap-3 shadow-lg transition-all duration-300 transform active:scale-95 cursor-pointer shrink-0 ${
                  isListening
                    ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse ring-4 ring-rose-500/30'
                    : 'bg-teal-800 hover:bg-teal-700 text-white hover:shadow-teal-900/40'
                }`}
              >
                {isListening ? (
                  <>
                    <MicOff className="w-5 h-5 text-rose-200" />
                    <span>Selesai Bicara (Kirim Suara)</span>
                  </>
                ) : (
                  <>
                    <Mic className="w-5 h-5 text-teal-300" />
                    <span>Tekan & Mulai Bicara</span>
                  </>
                )}
              </button>

              {/* Alternative Text Input while in Avatar Mode */}
              <div className="flex-1 w-full flex items-center gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Atau ketik pesan di sini (Ara akan menjawab dengan suara)..."
                  disabled={isLoading}
                  className="flex-1 bg-stone-50 dark:bg-stone-950 border border-stone-300 dark:border-stone-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:border-teal-600 font-medium"
                />

                <button
                  type="button"
                  onClick={() => handleSendMessage()}
                  disabled={isLoading || !input.trim()}
                  className="h-10 px-4 rounded-xl bg-teal-800 hover:bg-teal-700 disabled:opacity-50 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">Kirim</span>
                </button>
              </div>
            </div>

            {/* Quick Helper Badge */}
            <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 px-2">
              <span className="flex items-center gap-1.5">
                <Headphones className="w-3.5 h-3.5 text-teal-600" />
                Gunakan earphone/headset untuk pengalaman pendampingan suara terbaik.
              </span>
              <span className="font-mono text-[11px] text-teal-700 dark:text-teal-400 font-bold">
                Speech API Active
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
