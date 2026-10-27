'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import {
  Bot,
  User,
  Send,
  Loader2,
  ShieldCheck,
  RotateCcw,
  ExternalLink,
  Volume2,
  VolumeX,
  Radio,
  Square,
  MessageSquare,
  Sparkles,
  Mic,
  MicOff,
  AlertCircle,
} from 'lucide-react';
import type { ChatMessage } from '@/app/api/pfa-chat/route';
import AnimatedAraSvgAvatar from '@/components/pfa/AnimatedAraSvgAvatar';
import { FormattedMessageText } from '@/components/pfa/PfaMarkdownFormatter';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface UIMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

// ─── Quick Chips ───────────────────────────────────────────────────────────────

const QUICK_CHIPS = [
  'Saya merasa cemas dan takut',
  'Apakah identitas saya aman?',
  'Langkah apa yang harus saya ambil?',
  'Saya butuh seseorang untuk diajak bicara',
  'Bagaimana proses pelaporan di sini?',
];

const INITIAL_MESSAGE: UIMessage = {
  id: 'init',
  role: 'model',
  text: 'Halo, saya Ara 💚 — asisten Psychological First Aid (PFA) dari RuangAman.\n\nApapun yang sedang Anda rasakan saat ini, Anda tidak sendirian. Ruang ini aman, empatik, dan 100% anonim. Ada yang ingin Anda ceritakan atau butuh bantuan saat ini?',
  timestamp: new Date(),
};

export default function HomeEmbeddedPfaChatbot() {
  const [mounted, setMounted] = useState(false);

  // Dual Mode: 'text' (default) vs 'avatar'
  const [mode, setMode] = useState<'text' | 'avatar'>('text');

  // Messages & Input State
  const [messages, setMessages] = useState<UIMessage[]>([INITIAL_MESSAGE]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Audio & Avatar Speech States
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState('');
  const [currentCaption, setCurrentCaption] = useState(INITIAL_MESSAGE.text);
  const [speechSupported, setSpeechSupported] = useState(false);
  const [ttsSupported, setTtsSupported] = useState(false);
  const [micError, setMicError] = useState<string | null>(null);

  // Refs
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const voicesRef = useRef<SpeechSynthesisVoice[]>([]);

  // Sync refs to avoid stale closures in Web Speech API & callbacks
  const modeRef = useRef(mode);
  modeRef.current = mode;

  const isMutedRef = useRef(isMuted);
  isMutedRef.current = isMuted;

  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  const interimTranscriptRef = useRef(interimTranscript);
  interimTranscriptRef.current = interimTranscript;

  const sendMessageRef = useRef<(text: string, options?: { forceSpeak?: boolean }) => Promise<void>>(async () => {});

  useEffect(() => {
    setMounted(true);
  }, []);

  // ─── Scroll to bottom helper (Container-scoped only, NEVER touches main window) ───
  const scrollContainerToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior,
      });
    }
  }, []);

  // Scroll ONLY when messages count changes beyond initial load
  useEffect(() => {
    if (messages.length > 1) {
      scrollContainerToBottom();
    }
  }, [messages.length, isLoading, scrollContainerToBottom]);

  // ─── Initialize Web Speech API (STT & TTS) ──────────────────────────────────
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRec =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRec) {
        setSpeechSupported(true);
        const recognition = new SpeechRec();
        recognition.continuous = false;
        recognition.interimResults = true;
        recognition.lang = 'id-ID';

        recognition.onstart = () => {
          setIsListening(true);
          setMicError(null);
        };

        recognition.onresult = (event: any) => {
          let final = '';
          let interim = '';
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            const transcriptChunk = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              final += transcriptChunk;
            } else {
              interim += transcriptChunk;
            }
          }
          if (final) {
            interimTranscriptRef.current = '';
            setInterimTranscript('');
            setIsListening(false);
            sendMessageRef.current?.(final, { forceSpeak: true });
          } else {
            interimTranscriptRef.current = interim;
            setInterimTranscript(interim);
          }
        };

        recognition.onerror = (event: any) => {
          console.warn('[SpeechRec Error]', event.error);
          setIsListening(false);
          if (event.error === 'not-allowed') {
            setMicError('Izin mikrofon ditolak. Anda tetap dapat mengetik pesan.');
          } else if (event.error !== 'no-speech') {
            setMicError('Gagal mendengarkan suara. Silakan coba lagi atau ketik pesan.');
          }
        };

        recognition.onend = () => {
          setIsListening(false);
          const pending = interimTranscriptRef.current.trim();
          if (pending) {
            interimTranscriptRef.current = '';
            setInterimTranscript('');
            sendMessageRef.current?.(pending, { forceSpeak: true });
          }
        };

        recognitionRef.current = recognition;
      }

      if ('speechSynthesis' in window) {
        setTtsSupported(true);
        synthRef.current = window.speechSynthesis;
        const loadVoices = () => {
          const list = window.speechSynthesis.getVoices();
          if (list && list.length > 0) {
            voicesRef.current = list;
          }
        };
        loadVoices();
        window.speechSynthesis.onvoiceschanged = loadVoices;
      }
    }

    return () => {
      if (recognitionRef.current) {
        try { recognitionRef.current.abort(); } catch {}
      }
      if (synthRef.current) {
        try { synthRef.current.cancel(); } catch {}
      }
    };
  }, []);

  const pickFemaleVoice = useCallback((voices: SpeechSynthesisVoice[]): SpeechSynthesisVoice | null => {
    if (!voices || voices.length === 0) return null;

    const isMale = (v: SpeechSynthesisVoice) => {
      const text = `${v.name} ${v.voiceURI || ''}`.toLowerCase();
      return (
        text.includes('andika') || // Windows Indonesian male voice
        text.includes('ardi') ||
        text.includes('male') ||
        text.includes('pria') ||
        text.includes('laki') ||
        text.includes('cowok') ||
        text.includes('david') ||
        text.includes('george') ||
        text.includes('mark') ||
        text.includes('richard') ||
        text.includes('stefan') ||
        text.includes('guy') ||
        text.includes('james') ||
        text.includes('ryan') ||
        text.includes('paul')
      );
    };

    const isExplicitFemale = (v: SpeechSynthesisVoice) => {
      const text = `${v.name} ${v.voiceURI || ''}`.toLowerCase();
      return (
        text.includes('gadis') || // Microsoft Gadis (Indonesian female)
        (text.includes('google') && text.includes('indonesia')) || // Google Indonesian female voice
        text.includes('siti') ||
        text.includes('dewi') ||
        text.includes('indah') ||
        text.includes('putri') ||
        text.includes('female') ||
        text.includes('wanita') ||
        text.includes('perempuan') ||
        text.includes('natural') ||
        text.includes('zira') ||
        text.includes('jenny') ||
        text.includes('aria')
      );
    };

    // 1. Indonesian voice explicitly female (Google Bahasa Indonesia, Microsoft Gadis, Siti, etc.)
    const topIdFemale = voices.find((v) => {
      const text = `${v.name} ${v.voiceURI || ''}`.toLowerCase();
      return !isMale(v) && ((text.includes('google') && text.includes('indonesia')) || text.includes('gadis'));
    });
    if (topIdFemale) return topIdFemale;

    // 2. Any Indonesian voice that is explicitly female
    const idFemaleVoice = voices.find((v) => {
      const lang = (v.lang || '').toLowerCase();
      const isId = lang.startsWith('id') || lang.includes('id-') || v.name.toLowerCase().includes('indonesia');
      return isId && !isMale(v) && isExplicitFemale(v);
    });
    if (idFemaleVoice) return idFemaleVoice;

    // 3. Any Indonesian voice that is NOT male
    const anyNonMaleId = voices.find((v) => {
      const lang = (v.lang || '').toLowerCase();
      const isId = lang.startsWith('id') || lang.includes('id-') || v.name.toLowerCase().includes('indonesia');
      return isId && !isMale(v);
    });
    if (anyNonMaleId) return anyNonMaleId;

    // 4. Fallback: Any explicitly female voice across any installed language
    const anyFemale = voices.find((v) => !isMale(v) && isExplicitFemale(v));
    if (anyFemale) return anyFemale;

    // 5. Any voice that is not male
    const anyNonMale = voices.find((v) => !isMale(v));
    return anyNonMale || voices[0] || null;
  }, []);

  const speakText = useCallback(
    (textToSpeak: string) => {
      if (typeof window === 'undefined') return;
      const synth = synthRef.current || (typeof window !== 'undefined' ? window.speechSynthesis : null);
      if (!synth || isMutedRef.current) return;

      const cleanVoiceText = textToSpeak
        .replace(/[*_#`~[\]]/g, '')
        .replace(/http\S+/g, '')
        .replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '')
        .trim();

      if (!cleanVoiceText) return;

      if (synth.paused) {
        try { synth.resume(); } catch {}
      }
      try { synth.cancel(); } catch {}

      setTimeout(() => {
        try {
          if (!synth || isMutedRef.current) return;
          if (synth.paused) {
            try { synth.resume(); } catch {}
          }

          const utterance = new SpeechSynthesisUtterance(cleanVoiceText);
          utterance.lang = 'id-ID';
          utterance.rate = 0.95; // Empathetic, comforting counselor cadence
          utterance.pitch = 1.35; // Distinctly sweet feminine pitch

          let allVoices = synth.getVoices();
          if (!allVoices || allVoices.length === 0) {
            allVoices = voicesRef.current;
          }
          const femaleVoice = pickFemaleVoice(allVoices);
          if (femaleVoice) {
            utterance.voice = femaleVoice;
            utterance.lang = femaleVoice.lang || 'id-ID';
          }

          utterance.onstart = () => setIsSpeaking(true);
          utterance.onend = () => setIsSpeaking(false);
          utterance.onerror = () => setIsSpeaking(false);

          synth.speak(utterance);
        } catch {
          setIsSpeaking(false);
        }
      }, 50);
    },
    [pickFemaleVoice]
  );

  const stopSpeaking = () => {
    if (synthRef.current) {
      try { synthRef.current.cancel(); } catch {}
    }
    setIsSpeaking(false);
  };

  const toggleListening = () => {
    if (!speechSupported) {
      setMicError('Input suara belum didukung di peramban ini. Anda dapat mengetik pesan.');
      return;
    }

    if (isSpeaking) stopSpeaking();

    if (isListening) {
      try {
        recognitionRef.current?.stop();
      } catch {}
      setIsListening(false);
      const pendingText = interimTranscriptRef.current.trim();
      if (pendingText) {
        interimTranscriptRef.current = '';
        setInterimTranscript('');
        sendMessageRef.current?.(pendingText, { forceSpeak: true });
      }
    } else {
      setMicError(null);
      setInterimTranscript('');
      interimTranscriptRef.current = '';
      try {
        if (synthRef.current?.paused) {
          try { synthRef.current.resume(); } catch {}
        }
        recognitionRef.current?.start();
      } catch (err) {
        console.warn('[Start Mic Error]', err);
      }
    }
  };

  const sendMessage = useCallback(
    async (text: string, options?: { forceSpeak?: boolean }) => {
      const trimmed = text.trim();
      if (!trimmed || isLoading) return;

      const userMsg: UIMessage = {
        id: `user-${Date.now()}`,
        role: 'user',
        text: trimmed,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInputValue('');
      setInterimTranscript('');
      interimTranscriptRef.current = '';
      setMicError(null);
      setIsLoading(true);

      const historyForApi: ChatMessage[] = messagesRef.current
        .filter((m) => m.id !== 'init')
        .slice(-6)
        .map((m) => ({ role: m.role, text: m.text }));

      try {
        const response = await fetch('/api/pfa-chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: trimmed,
            history: historyForApi,
          }),
        });

        const data = await response.json();
        const replyText =
          data.reply ||
          'Terima kasih telah berbagi. Apapun yang Anda rasakan saat ini, perasaan Anda valid dan Anda tidak sendirian. Jangan ragu membuat laporan aman di halaman /report agar Satgas PPKS dapat mendampingi Anda.';

        const aiMsg: UIMessage = {
          id: `ai-${Date.now()}`,
          role: 'model',
          text: replyText,
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, aiMsg]);
        setCurrentCaption(replyText);

        const shouldSpeak =
          (modeRef.current === 'avatar' || options?.forceSpeak) && !isMutedRef.current;
        if (shouldSpeak) {
          speakText(replyText);
        }
      } catch {
        const errMsg: UIMessage = {
          id: `err-${Date.now()}`,
          role: 'model',
          text: 'Saya mendengar Anda dengan sepenuh hati. Meskipun saat ini terjadi kendala teknis jaringan, Anda sangat berharga dan berani. Jika butuh pendampingan darurat, silakan buka menu Bantuan di /support atau buat laporan di /report.',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errMsg]);
        setCurrentCaption(errMsg.text);
        if (modeRef.current === 'avatar' || options?.forceSpeak) {
          speakText(errMsg.text);
        }
      } finally {
        setIsLoading(false);
        setTimeout(() => inputRef.current?.focus({ preventScroll: true }), 100);
      }
    },
    [isLoading, speakText]
  );

  sendMessageRef.current = sendMessage;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  const handleResetChat = () => {
    stopSpeaking();
    setMessages([INITIAL_MESSAGE]);
    setCurrentCaption(INITIAL_MESSAGE.text);
    setInputValue('');
    setInterimTranscript('');
    setMicError(null);
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white/98 dark:bg-[#0c2623]/98 border-2 border-teal-500/40 dark:border-teal-600/50 rounded-3xl shadow-2xl shadow-teal-950/20 dark:shadow-teal-950/50 flex flex-col overflow-hidden text-stone-800 dark:text-stone-100 min-h-[580px]">
      {/* ── 1. HEADER BAR (EXACTLY IDENTICAL TO FLOATING CHATBOT) ─────────── */}
      <div className="px-5 py-3.5 bg-gradient-to-r from-teal-800 via-teal-700 to-emerald-800 text-white flex items-center justify-between gap-3 border-b border-teal-600/40 shrink-0">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-9 h-9 rounded-full overflow-hidden bg-emerald-950 border border-emerald-400/50 flex items-center justify-center shadow-inner">
              <Bot className="w-5 h-5 text-emerald-300" />
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-teal-800 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-bold text-base tracking-tight text-white">Ara</h3>
              <span className="px-1.5 py-0.5 rounded-full bg-teal-950/70 text-[9px] font-bold text-emerald-300 border border-emerald-400/30">
                PFA AI
              </span>
            </div>
            <p className="text-[11px] text-teal-100/80">
              Pendamping Psikologis Awal · 100% Anonim
            </p>
          </div>
        </div>

        {/* Action Button: Reset Chat */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetChat}
            title="Mulai Sesi Baru"
            className="p-2 rounded-xl text-teal-200 hover:text-white hover:bg-teal-900/50 transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-semibold"
            aria-label="Reset chat"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Reset Sesi</span>
          </button>
        </div>
      </div>

      {/* ── 2. DUAL-MODE TAB SWITCHER SUBHEADER ───────────────────────────── */}
      <div className="px-4 py-2 bg-stone-100/90 dark:bg-gray-800/90 border-b border-stone-200 dark:border-gray-600 flex items-center justify-between gap-2 shrink-0">
        <div className="flex items-center gap-1.5 bg-stone-200/90 dark:bg-stone-900/90 p-1 rounded-xl border border-stone-300 dark:border-stone-700">
          <button
            type="button"
            onClick={() => {
              stopSpeaking();
              setMode('text');
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              mode === 'text'
                ? 'bg-teal-800 text-white shadow-xs'
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
              if (!isMuted) {
                speakText(currentCaption || INITIAL_MESSAGE.text);
              }
            }}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              mode === 'avatar'
                ? 'bg-teal-800 text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <Radio className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span>🎙️ AI Avatar</span>
          </button>
        </div>

        {mode === 'avatar' && (
          <div className="flex items-center gap-1.5">
            {isSpeaking && (
              <button
                type="button"
                onClick={stopSpeaking}
                className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
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
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isMuted
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : 'bg-stone-200 dark:bg-stone-800 text-stone-600 dark:text-stone-300'
              }`}
              title={isMuted ? 'Nyalakan Suara' : 'Matikan Suara (Bisu)'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
          </div>
        )}
      </div>

      {/* ── 3. BODY VIEW: MODE TEKS vs MODE AVATAR ────────────────────────── */}
      <AnimatePresence mode="wait">
        {mode === 'text' && (
          <motion.div
            key="text-mode"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col flex-1 overflow-hidden"
          >
            {/* Messages Area (Container-scoped scroll) */}
            <div
              ref={messagesContainerRef}
              className="h-[380px] overflow-y-auto p-4 sm:p-5 space-y-3.5 text-xs relative custom-scrollbar"
            >
              {/* Privacy Notice Banner */}
              <div className="p-3 rounded-xl bg-teal-50 dark:bg-[#123632] border border-teal-200/80 dark:border-teal-800/60 text-xs text-teal-800 dark:text-teal-200 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">
                  <b>Ruang Aman & Rahasia:</b> Pesan Anda dienkripsi dan tidak ada identitas yang disimpan. Ara siap mendengarkan tanpa menghakimi.
                </p>
              </div>

              {/* Messages Stream */}
              <AnimatePresence initial={false}>
                {messages.map((msg) => {
                  const isUser = msg.role === 'user';
                  const hasReportLink = !isUser && msg.text.includes('/report');

                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 8, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      transition={{ duration: 0.22 }}
                      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start`}
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 text-xs font-bold shadow-xs ${
                          isUser ? 'bg-teal-700 text-white' : 'bg-emerald-600 text-white'
                        }`}
                      >
                        {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                      </div>

                      <div className={`max-w-[85%] space-y-1 flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                        <div
                          className={`px-4 py-3 rounded-2xl text-xs sm:text-[13px] leading-relaxed ${
                            isUser
                              ? 'bg-teal-700 text-white rounded-tr-xs shadow-xs'
                              : 'bg-stone-100 dark:bg-[#153a35] text-stone-800 dark:text-stone-100 border border-stone-200/80 dark:border-teal-900/60 rounded-tl-xs shadow-xs'
                          }`}
                        >
                          {isUser ? (
                            <p className="whitespace-pre-wrap">{msg.text}</p>
                          ) : (
                            <FormattedMessageText text={msg.text} />
                          )}

                          {hasReportLink && (
                            <div className="mt-2.5 pt-2 border-t border-stone-200/70 dark:border-teal-800/70">
                              <Link
                                href="/report"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 dark:bg-teal-950/80 dark:hover:bg-teal-900 text-teal-800 dark:text-teal-300 text-[11px] font-bold border border-teal-200 dark:border-teal-800 transition-colors"
                              >
                                <span>📝 Buat Laporan Anonim</span>
                                <ExternalLink className="w-3 h-3" />
                              </Link>
                            </div>
                          )}
                        </div>

                        <span
                          className="text-[10px] text-stone-400 dark:text-stone-500 px-1 font-mono"
                          suppressHydrationWarning
                        >
                          {mounted
                            ? msg.timestamp.toLocaleTimeString('id-ID', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : 'Baru saja'}
                        </span>
                      </div>
                    </motion.div>
                  );
                })}

                {isLoading && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex gap-2.5 items-center text-xs text-stone-500 dark:text-stone-400"
                  >
                    <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex items-center gap-1.5 bg-stone-100 dark:bg-[#153a35] px-3.5 py-2 rounded-2xl border border-stone-200/80 dark:border-teal-900/60">
                      <Loader2 className="w-3 h-3 animate-spin text-teal-600 dark:text-teal-400" />
                      <span className="text-[11px] font-medium">Ara sedang mengetik respons empati...</span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Quick Chips Bar */}
            <div className="px-4 py-2.5 border-t border-stone-200/60 dark:border-gray-600 bg-stone-50/50 dark:bg-gray-800/50">
              <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                {QUICK_CHIPS.map((chip) => (
                  <button
                    key={chip}
                    type="button"
                    onClick={() => sendMessage(chip)}
                    disabled={isLoading}
                    className="px-3 py-1.5 rounded-full text-xs font-medium bg-white dark:bg-gray-700 text-stone-700 dark:text-stone-200 border border-stone-200 dark:border-gray-600 hover:bg-teal-50 dark:hover:bg-gray-600 hover:text-teal-700 dark:hover:text-teal-200 shrink-0 transition-colors cursor-pointer disabled:opacity-40"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>

            {/* Input Box */}
            <div className="p-3.5 bg-white dark:bg-gray-800 border-t border-stone-200 dark:border-gray-600 flex items-end gap-2.5 shrink-0">
              <textarea
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ceritakan apa yang Anda rasakan..."
                rows={1}
                disabled={isLoading}
                className="flex-1 bg-stone-50 dark:bg-[#081f1d] border border-stone-300 dark:border-teal-900/60 rounded-xl px-3.5 py-2.5 text-xs sm:text-[13px] text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:border-teal-600 dark:focus:border-teal-500 resize-none min-h-[42px] max-h-28"
              />

              <div className="flex items-center gap-1.5 shrink-0">
                <div className="p-2 rounded-xl text-stone-400 dark:text-stone-500 hidden sm:block">
                  <Bot className="w-4 h-4 text-emerald-600" />
                </div>
                <button
                  type="button"
                  onClick={() => sendMessage(inputValue)}
                  disabled={isLoading || !inputValue.trim()}
                  className="w-10 h-10 rounded-xl bg-teal-600 hover:bg-teal-500 disabled:opacity-30 disabled:hover:bg-teal-600 text-white flex items-center justify-center transition-all cursor-pointer shadow-xs shrink-0"
                  title="Kirim pesan"
                >
                  {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── MODE AVATAR INTERAKTIF (ANIMATED SVG & VOICE CONTROLS) ───────── */}
        {mode === 'avatar' && (
          <motion.div
            key="avatar-mode"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="flex flex-col flex-1 p-4 sm:p-6 justify-between overflow-y-auto no-scrollbar space-y-3.5 bg-gradient-to-b from-[#0a2321] via-[#071c1a] to-[#041210] text-white min-h-[460px]"
          >
            {/* Top Area: Status Indicator, Avatar, Equalizer & Caption */}
            <div className="flex flex-col items-center justify-center space-y-2.5 pt-2">
              {/* Status Indicator */}
              <div className="flex items-center justify-center">
                <div className="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-teal-800/60 text-[11px] shadow-sm">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      isListening
                        ? 'bg-rose-500 animate-pulse'
                        : isSpeaking
                        ? 'bg-emerald-400 animate-ping'
                        : isLoading
                        ? 'bg-amber-400 animate-spin'
                        : 'bg-teal-400'
                    }`}
                  />
                  <span className="font-semibold text-stone-200">
                    {isListening
                      ? (interimTranscript ? `🎙️ "${interimTranscript}"` : '🎙️ Mendengarkan suara Anda...')
                      : isSpeaking
                      ? '🗣️ Ara sedang berbicara...'
                      : isLoading
                      ? '⏳ Memproses jawaban empati...'
                      : '✨ Ara siap mendengarkan'}
                  </span>
                </div>
              </div>

              {/* Animated SVG Avatar */}
              <div className="flex flex-col items-center justify-center py-1 relative shrink-0">
                <AnimatedAraSvgAvatar
                  isSpeaking={isSpeaking}
                  isListening={isListening}
                  size={155}
                />

                {/* Frequency Equalizer Bars */}
                <div className="h-6 flex items-center justify-center gap-1.5 mt-2">
                  {isSpeaking ? (
                    [0.6, 1.0, 0.4, 0.9, 1.2, 0.7, 0.5].map((factor, i) => (
                      <motion.span
                        key={i}
                        animate={{
                          height: [4, Math.round(18 * factor), 4],
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 0.45 + i * 0.08,
                          ease: 'easeInOut',
                        }}
                        className="w-1 bg-gradient-to-t from-teal-400 to-emerald-300 rounded-full"
                      />
                    ))
                  ) : (
                    <div className="h-1 w-12 bg-teal-800/40 rounded-full" />
                  )}
                </div>
              </div>

              {/* Spoken Caption Quote */}
              <p className="text-xs text-stone-300 max-w-lg text-center line-clamp-3 italic px-4 leading-relaxed">
                &ldquo;{currentCaption}&rdquo;
              </p>
            </div>

            {/* Bottom Area: Controls (Mic Button & Fast Text Input - Always Anchored & Visible) */}
            <div className="space-y-2 shrink-0 w-full max-w-lg mx-auto">
              {/* Mic Error Alert */}
              {micError && (
                <div className="bg-rose-950/70 border border-rose-800/80 rounded-xl p-2.5 text-[11px] text-rose-300 flex items-center gap-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{micError}</span>
                </div>
              )}

              {/* Live Speech Interim Preview Chip */}
              {isListening && interimTranscript && (
                <div className="bg-teal-950/80 border border-teal-500/40 rounded-xl px-3 py-1.5 text-[11px] text-teal-200 italic flex items-center gap-2 shadow-inner">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping shrink-0" />
                  <span className="truncate">&ldquo;{interimTranscript}&rdquo;</span>
                </div>
              )}

              {/* VOICE CONTROLS & FAST TEXT INPUT CONTAINER (EXACTLY LIKE SCREENSHOT 2) */}
              <div className="bg-black/50 backdrop-blur-md border border-teal-500/25 rounded-2xl p-3 shadow-xl space-y-2.5">
                {/* Push-to-Talk Mic Button */}
                <button
                  type="button"
                  onClick={toggleListening}
                  disabled={isLoading}
                  className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2.5 shadow-md transition-all active:scale-[0.98] cursor-pointer ${
                    isListening
                      ? 'bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 hover:from-rose-500 hover:to-red-500 text-white animate-pulse ring-4 ring-rose-500/30 border border-rose-300/40'
                      : 'bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 hover:from-teal-500 hover:to-emerald-500 text-white border border-teal-400/30'
                  }`}
                >
                  {isListening ? (
                    <>
                      <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                        <MicOff className="w-3 h-3 text-white" />
                      </div>
                      <span>Mendengarkan... (Klik untuk Selesai & Kirim)</span>
                    </>
                  ) : (
                    <>
                      <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center">
                        <Mic className="w-3 h-3 text-white" />
                      </div>
                      <span>Tekan untuk Bicara (Mic)</span>
                    </>
                  )}
                </button>

                {/* Direct Text Input while in Avatar Mode */}
                <div className="flex items-center gap-2 bg-stone-900/90 dark:bg-[#071d1b]/95 border border-teal-700/50 focus-within:border-teal-400 focus-within:ring-2 focus-within:ring-teal-500/20 rounded-xl px-3 py-1.5 transition-all shadow-inner">
                  <MessageSquare className="w-3.5 h-3.5 text-teal-400/70 shrink-0" />
                  <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        sendMessage(inputValue);
                      }
                    }}
                    placeholder="Atau ketik pesan konsultasi di sini..."
                    disabled={isLoading}
                    className="flex-1 bg-transparent text-xs text-stone-100 placeholder:text-stone-400/80 focus:outline-none min-w-0"
                  />
                  <button
                    type="button"
                    onClick={() => sendMessage(inputValue)}
                    disabled={isLoading || !inputValue.trim()}
                    className="w-7 h-7 rounded-lg bg-teal-600 hover:bg-teal-500 disabled:opacity-30 disabled:hover:bg-teal-600 text-white flex items-center justify-center transition-all cursor-pointer shadow-xs shrink-0"
                    title="Kirim pesan"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
