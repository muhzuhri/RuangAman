'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bot,
  User,
  Send,
  Loader2,
  MessageSquareHeart,
  Sparkles,
  ChevronDown,
  ShieldCheck,
} from 'lucide-react';
import type { ChatMessage } from '@/app/api/pfa-chat/route';

// ─── Types ─────────────────────────────────────────────────────────────────────

interface UIMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
}

// ─── Quick Chips ───────────────────────────────────────────────────────────────

const QUICK_CHIPS = [
  'Saya merasa cemas dan tidak tahu harus bagaimana',
  'Apakah identitas saya benar-benar terlindungi?',
  'Langkah apa yang harus saya ambil sekarang?',
  'Saya takut tidak dipercaya',
  'Bagaimana cara melacak laporan saya?',
  'Saya butuh seseorang untuk diajak bicara',
];

const INITIAL_MESSAGE: UIMessage = {
  id: 'init',
  role: 'model',
  text: 'Halo, saya Ara 💚 — pendamping Psychological First Aid dari AmanKampus. Saya di sini untuk mendengarkan Anda dengan penuh empati dan tanpa menghakimi siapapun.\n\nApapun yang Anda rasakan saat ini, Anda tidak sendirian. Identitas Anda sepenuhnya terlindungi. Bagaimana kondisi Anda sekarang?',
  timestamp: new Date(),
};

// ─── Message Bubble ────────────────────────────────────────────────────────────

function MessageBubble({ msg }: { msg: UIMessage }) {
  const isUser = msg.role === 'user';
  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.28 }}
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 ${
          isUser
            ? 'bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
            : 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Bubble */}
      <div className={`max-w-[80%] space-y-1 ${isUser ? 'items-end' : 'items-start'} flex flex-col`}>
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ${
            isUser
              ? 'bg-teal-600 text-white rounded-tr-sm'
              : 'bg-white dark:bg-[#1a3e3a] text-stone-800 dark:text-stone-100 border border-stone-200 dark:border-teal-900/60 rounded-tl-sm shadow-xs'
          }`}
        >
          {msg.text}
        </div>
        <p className="text-[10px] text-stone-400 dark:text-stone-600 px-1">
          {msg.timestamp.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </div>
    </motion.div>
  );
}

// ─── Typing Indicator ──────────────────────────────────────────────────────────

function TypingIndicator() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex gap-3 items-end"
    >
      <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-300 shrink-0">
        <Bot className="w-4 h-4" />
      </div>
      <div className="px-4 py-3 bg-white dark:bg-[#1a3e3a] border border-stone-200 dark:border-teal-900/60 rounded-2xl rounded-tl-sm shadow-xs">
        <div className="flex items-center gap-1 h-4">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="w-1.5 h-1.5 bg-emerald-500 rounded-full"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// ─── Main Chat Component ───────────────────────────────────────────────────────

export default function AIAssistantChat() {
  const [messages, setMessages] = useState<UIMessage[]>([INITIAL_MESSAGE]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showScrollDown, setShowScrollDown] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = useCallback((behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior, block: 'end' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, scrollToBottom]);

  const handleScroll = () => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollDown(distanceFromBottom > 80);
  };

  const sendMessage = useCallback(
    async (text: string) => {
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
      setIsLoading(true);

      // Build history for API (exclude initial system message)
      const historyForApi: ChatMessage[] = messages
        .filter((m) => m.id !== 'init')
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

        const aiMsg: UIMessage = {
          id: `ai-${Date.now()}`,
          role: 'model',
          text: data.reply || 'Maaf, terjadi kesalahan. Silakan coba lagi.',
          timestamp: new Date(),
        };

        setMessages((prev) => [...prev, aiMsg]);
      } catch {
        const errMsg: UIMessage = {
          id: `err-${Date.now()}`,
          role: 'model',
          text: 'Maaf, koneksi terputus sementara. Anda dapat mencoba lagi atau menghubungi Satgas secara langsung melalui WhatsApp yang tersedia di halaman ini.',
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, errMsg]);
      } finally {
        setIsLoading(false);
        setTimeout(() => inputRef.current?.focus(), 100);
      }
    },
    [isLoading, messages]
  );

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(inputValue);
    }
  };

  return (
    <div className="flex flex-col bg-white/95 dark:bg-[#0f2926] backdrop-blur-xl border border-teal-200 dark:border-teal-900/60 rounded-3xl shadow-xl overflow-hidden">
      
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="px-5 py-4 bg-emerald-50/80 dark:bg-[#0a201e] border-b border-teal-100 dark:border-teal-900/60 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-300">
              <Bot className="w-5 h-5" />
            </div>
            {/* Online indicator */}
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white dark:border-[#0a201e]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <p className="font-extrabold text-sm text-stone-900 dark:text-stone-100">Ara</p>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-teal-100 dark:bg-teal-950/80 border border-teal-200 dark:border-teal-800 rounded-full text-[10px] font-bold text-teal-700 dark:text-teal-300">
                <Sparkles className="w-2.5 h-2.5" /> AI PFA
              </span>
            </div>
            <p className="text-[11px] text-stone-500 dark:text-stone-400">
              Pendamping Psychological First Aid · AmanKampus
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800/60">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Anonim & Aman</span>
        </div>
      </div>

      {/* ── Messages ───────────────────────────────────────────────────────── */}
      <div
        ref={messagesContainerRef}
        onScroll={handleScroll}
        className="relative flex-1 overflow-y-auto p-4 space-y-4 min-h-80 max-h-105 scroll-smooth"
        style={{ scrollbarWidth: 'thin' }}
      >
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <MessageBubble key={msg.id} msg={msg} />
          ))}
          {isLoading && <TypingIndicator key="typing" />}
        </AnimatePresence>
        <div ref={messagesEndRef} />

        {/* Scroll to bottom button */}
        <AnimatePresence>
          {showScrollDown && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={() => scrollToBottom()}
              className="absolute bottom-4 right-4 w-8 h-8 bg-white dark:bg-teal-900 border border-stone-200 dark:border-teal-700 rounded-full shadow-md flex items-center justify-center text-stone-500 dark:text-teal-300 hover:bg-stone-100 dark:hover:bg-teal-800 transition-colors cursor-pointer"
            >
              <ChevronDown className="w-4 h-4" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* ── Quick Chips ────────────────────────────────────────────────────── */}
      <div className="px-4 py-2 border-t border-stone-100 dark:border-teal-900/40">
        <p className="text-[10px] text-stone-400 dark:text-stone-500 font-semibold uppercase tracking-wider mb-2">
          Topik Cepat
        </p>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_CHIPS.map((chip) => (
            <button
              key={chip}
              type="button"
              onClick={() => sendMessage(chip)}
              disabled={isLoading}
              className="px-3 py-1.5 rounded-full text-[11px] font-semibold bg-stone-100 dark:bg-teal-950/60 text-stone-700 dark:text-teal-300 border border-stone-200 dark:border-teal-800/60 hover:bg-teal-50 dark:hover:bg-teal-950 hover:border-teal-300 dark:hover:border-teal-700 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {chip}
            </button>
          ))}
        </div>
      </div>

      {/* ── Input Area ─────────────────────────────────────────────────────── */}
      <div className="px-4 py-3 border-t border-stone-100 dark:border-teal-900/40 flex items-end gap-2">
        <div className="flex-1 relative">
          <textarea
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Tulis pesan Anda... (Enter untuk kirim, Shift+Enter untuk baris baru)"
            rows={1}
            disabled={isLoading}
            className="w-full bg-stone-50 dark:bg-[#0a201e] border border-stone-200 dark:border-teal-900/60 rounded-2xl px-4 py-3 pr-4 text-sm text-stone-800 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-600 focus:outline-none focus:border-teal-400 dark:focus:border-teal-600 transition-colors resize-none disabled:opacity-60"
            style={{ minHeight: '44px', maxHeight: '120px' }}
            onInput={(e) => {
              const el = e.currentTarget;
              el.style.height = 'auto';
              el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
            }}
          />
        </div>
        <button
          type="button"
          onClick={() => sendMessage(inputValue)}
          disabled={!inputValue.trim() || isLoading}
          className="w-11 h-11 bg-teal-600 hover:bg-teal-700 active:bg-teal-800 disabled:bg-stone-300 dark:disabled:bg-stone-700 rounded-2xl flex items-center justify-center text-white transition-all cursor-pointer disabled:cursor-not-allowed shadow-sm shrink-0 mb-0.5"
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Send className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* ── Privacy Footer ─────────────────────────────────────────────────── */}
      <div className="px-4 py-2 bg-stone-50/60 dark:bg-[#061e1c]/60 border-t border-stone-100 dark:border-teal-900/30 flex items-center gap-2">
        <MessageSquareHeart className="w-3.5 h-3.5 text-teal-500 shrink-0" />
        <p className="text-[10px] text-stone-400 dark:text-stone-500 leading-relaxed">
          Percakapan ini bersifat anonim sepenuhnya. Tidak ada data pribadi yang tersimpan. Ara bukan pengganti konsultasi profesional.
        </p>
      </div>
    </div>
  );
}
