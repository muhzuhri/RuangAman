'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare,
  Send,
  Lock,
  User,
  ShieldCheck,
  Plus,
  ChevronDown,
  ChevronUp,
  Search,
  CheckCheck,
  Shield,
  Clock,
  Sparkles,
  Info,
} from 'lucide-react';
import { type Report } from '@/lib/types';
import { formatDateID, STATUS_STYLES } from '@/lib/adminUtils';

interface AdminChatTabProps {
  reports: Report[];
  selectedReport: Report | null;
  onSelectReport: (report: Report) => void;
  chatInput: string;
  setChatInput: (input: string) => void;
  onSendSatgasMessage: (e: React.FormEvent) => void;
  internalNotesMap: Record<string, { id: string; text: string; author: string; timestamp: string }[]>;
  internalNoteInput: string;
  setInternalNoteInput: (input: string) => void;
  onAddInternalNote: (e: React.FormEvent) => void;
}

export default function AdminChatTab({
  reports,
  selectedReport,
  onSelectReport,
  chatInput,
  setChatInput,
  onSendSatgasMessage,
  internalNotesMap,
  internalNoteInput,
  setInternalNoteInput,
  onAddInternalNote,
}: AdminChatTabProps) {
  const [showInternalNotes, setShowInternalNotes] = useState(false);
  const [searchSidebar, setSearchSidebar] = useState('');
  const chatScrollContainerRef = useRef<HTMLDivElement>(null);

  const activeCase = selectedReport;
  const messages = activeCase?.messages || [];
  const internalNotes = activeCase ? internalNotesMap[activeCase.caseId] || [] : [];

  // Filtered sidebar cases for instant search
  const filteredSidebarReports = useMemo(() => {
    if (!searchSidebar.trim()) return reports;
    const q = searchSidebar.toLowerCase();
    return reports.filter(
      (r) =>
        r.caseId.toLowerCase().includes(q) ||
        r.anonymousToken.toLowerCase().includes(q) ||
        r.category.toLowerCase().includes(q)
    );
  }, [reports, searchSidebar]);

  // Auto-scroll chat container to bottom when messages change (container-scoped, never scrolls window)
  useEffect(() => {
    if (messages.length > 0 && chatScrollContainerRef.current) {
      chatScrollContainerRef.current.scrollTo({
        top: chatScrollContainerRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, [messages.length, activeCase?.caseId]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* ─── Left Column: Case Selector Sidebar (4 Cols) ────────────────────── */}
      <div className="lg:col-span-4 bg-white/95 dark:bg-gray-700/95 p-4 sm:p-5 rounded-3xl border border-stone-200 dark:border-gray-600 shadow-xl backdrop-blur-xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-200 dark:border-gray-600 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-teal-50 dark:bg-gray-800 rounded-xl border border-teal-200 dark:border-gray-600 text-teal-600 dark:text-teal-400">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-stone-900 dark:text-white text-sm">
                Pilih Berkas Percakapan
              </h3>
              <p className="text-[10px] text-stone-500 dark:text-stone-400 font-mono">
                {reports.length} Kasus Terdaftar
              </p>
            </div>
          </div>
        </div>

        {/* Quick Search within Chat List */}
        <div className="relative flex items-center bg-stone-50 dark:bg-gray-800/90 rounded-2xl border border-stone-200 dark:border-gray-600 px-3 py-2 text-xs focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/20 transition-all">
          <Search className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          <input
            type="text"
            placeholder="Cari ID, Token, Kategori..."
            value={searchSidebar}
            onChange={(e) => setSearchSidebar(e.target.value)}
            className="flex-1 bg-transparent border-none outline-none text-xs text-stone-900 dark:text-stone-100 placeholder:text-stone-400 px-2 min-w-0"
          />
        </div>

        {/* Scrollable Cases List */}
        <div className="space-y-2.5 max-h-[580px] overflow-y-auto pr-1 no-scrollbar">
          {filteredSidebarReports.length === 0 ? (
            <div className="text-center py-8 text-stone-400 text-xs italic">
              Tidak ada berkas yang cocok.
            </div>
          ) : (
            filteredSidebarReports.map((r) => {
              const isSelected = activeCase?.caseId === r.caseId;
              const msgCount = r.messages ? r.messages.length : 0;

              return (
                <div
                  key={r.caseId}
                  onClick={() => onSelectReport(r)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-2 group ${
                    isSelected
                      ? 'bg-gradient-to-br from-teal-500/10 via-teal-500/5 to-transparent dark:from-teal-950/80 dark:to-gray-800/90 border-teal-500 shadow-md ring-1 ring-teal-500/30'
                      : 'bg-stone-50/80 dark:bg-gray-800/80 border-stone-200/90 dark:border-gray-700 hover:border-teal-400 hover:bg-stone-100/80'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-extrabold text-xs text-teal-600 dark:text-teal-400 bg-white/80 dark:bg-gray-800 px-2 py-0.5 rounded-lg border border-teal-200 dark:border-gray-600">
                      {r.caseId}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border shadow-xs ${
                        STATUS_STYLES[r.status] || ''
                      }`}
                    >
                      {r.status}
                    </span>
                  </div>

                  <p className="text-xs font-bold text-stone-800 dark:text-stone-200 truncate group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                    {r.category}
                  </p>

                  <div className="flex items-center justify-between text-[11px] font-mono text-stone-500 dark:text-stone-400 pt-1 border-t border-stone-200/50 dark:border-gray-700/60">
                    <span className="flex items-center gap-1 truncate max-w-[150px]">
                      <Lock className="w-3 h-3 text-stone-400" />
                      <span>{r.anonymousToken}</span>
                    </span>

                    <span
                      className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        msgCount > 0
                          ? 'bg-teal-500/20 text-teal-700 dark:text-teal-300 border border-teal-500/30'
                          : 'text-stone-400'
                      }`}
                    >
                      {msgCount} Pesan
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ─── Right Column: Chat Room Window (8 Cols) ────────────────────────── */}
      <div className="lg:col-span-8 space-y-4">
        {activeCase ? (
          <div className="bg-white/95 dark:bg-gray-700/95 rounded-3xl border border-stone-200 dark:border-gray-600 shadow-xl flex flex-col min-h-[640px] backdrop-blur-xl overflow-hidden">
            {/* Chat Room Header */}
            <div className="p-4 sm:p-5 border-b border-stone-200 dark:border-gray-600 bg-stone-50/70 dark:bg-gray-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono font-black text-sm text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-gray-800 px-3 py-1 rounded-xl border border-teal-200 dark:border-gray-600">
                    {activeCase.caseId}
                  </span>
                  <span
                    className={`text-xs font-bold px-2.5 py-1 rounded-xl border shadow-xs ${
                      STATUS_STYLES[activeCase.status] || ''
                    }`}
                  >
                    {activeCase.status}
                  </span>
                </div>
                <p className="text-xs text-stone-500 dark:text-stone-400 flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-teal-500" />
                  <span>Kanal Komunikasi Terenkripsi Pelapor — Token:</span>
                  <code className="font-mono font-bold text-teal-600 dark:text-teal-400 bg-stone-100 dark:bg-gray-800 px-1.5 py-0.5 rounded border border-stone-200 dark:border-gray-600">
                    {activeCase.anonymousToken}
                  </code>
                </p>
              </div>

              {/* Security Pill Badge */}
              <div className="inline-flex items-center gap-1.5 text-[11px] font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 rounded-xl self-start sm:self-auto shadow-xs">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>P2P Encrypted Session</span>
              </div>
            </div>

            {/* Chat Messages Stream */}
            <div className="flex-1 flex flex-col justify-between p-4 sm:p-6 space-y-4 bg-stone-50/40 dark:bg-gray-800/40">
              <div ref={chatScrollContainerRef} className="flex-1 space-y-3.5 max-h-[380px] overflow-y-auto pr-1 no-scrollbar">
                {messages.length === 0 ? (
                  <div className="text-center py-16 space-y-3">
                    <div className="w-14 h-14 bg-teal-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-gray-600">
                      <MessageSquare className="w-7 h-7" />
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-stone-700 dark:text-stone-300">
                        Belum Ada Pesan Klarifikasi
                      </p>
                      <p className="text-xs text-stone-400 max-w-sm mx-auto leading-relaxed">
                        Gunakan formulir di bawah untuk mengirim pesan klarifikasi resmi dari Satgas kepada pelapor. Pesan dapat diakses pelapor via token anonim.
                      </p>
                    </div>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isSatgas = msg.sender === 'Satgas';

                    return (
                      <div
                        key={msg.id}
                        className={`flex ${isSatgas ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-3xl text-xs space-y-2 shadow-md transition-all ${
                            isSatgas
                              ? 'bg-gradient-to-br from-teal-600 to-teal-700 text-white rounded-br-xs'
                              : 'bg-white dark:bg-gray-800 text-stone-900 dark:text-white rounded-bl-xs border border-stone-200 dark:border-gray-600'
                          }`}
                        >
                          {/* Sender meta */}
                          <div
                            className={`flex items-center justify-between gap-4 text-[10px] pb-1 border-b ${
                              isSatgas
                                ? 'border-teal-500/40 text-teal-100'
                                : 'border-stone-100 dark:border-gray-700 text-stone-500 dark:text-stone-400'
                            }`}
                          >
                            <span className="font-extrabold flex items-center gap-1.5 uppercase tracking-wider">
                              {isSatgas ? (
                                <>
                                  <ShieldCheck className="w-3.5 h-3.5 text-teal-200" />
                                  <span>Satgas PPKS (Resmi)</span>
                                </>
                              ) : (
                                <>
                                  <User className="w-3.5 h-3.5 text-stone-400" />
                                  <span>Pelapor (Anonim)</span>
                                </>
                              )}
                            </span>
                            <span className="font-mono">{formatDateID(msg.timestamp)}</span>
                          </div>

                          {/* Message Body */}
                          <p className="leading-relaxed whitespace-pre-wrap font-medium text-xs sm:text-sm">
                            {msg.text}
                          </p>

                          {/* Read indicator */}
                          <div className="flex justify-end pt-0.5">
                            <span
                              className={`text-[10px] font-mono flex items-center gap-1 ${
                                isSatgas ? 'text-teal-200' : 'text-stone-400'
                              }`}
                            >
                              <CheckCheck className="w-3.5 h-3.5" />
                              <span>Terkirim</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Chat Input Box */}
              <div className="space-y-2 pt-2 border-t border-stone-200 dark:border-gray-600">
                <form
                  onSubmit={onSendSatgasMessage}
                  className="flex items-center gap-2 bg-white dark:bg-gray-800 p-1.5 rounded-2xl border border-stone-200 dark:border-gray-600 focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/20 transition-all shadow-sm"
                >
                  <input
                    type="text"
                    placeholder="Tulis pesan klarifikasi resmi Satgas kepada pelapor..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="flex-1 bg-transparent border-none outline-none text-xs sm:text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 px-3 min-w-0"
                  />

                  <button
                    type="submit"
                    disabled={!chatInput.trim()}
                    className="bg-teal-600 hover:bg-teal-500 disabled:opacity-40 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer shrink-0"
                  >
                    <span>Kirim</span>
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </form>

                <p className="text-[11px] text-stone-500 dark:text-stone-400 flex items-center gap-1 font-mono">
                  <Info className="w-3 h-3 text-teal-500 shrink-0" />
                  <span>Pesan tersinkronisasi langsung ke portal pelacakan korban (/track) secara aman.</span>
                </p>
              </div>
            </div>

            {/* ─── Internal Notes Accordion (Confidential to Satgas) ─────────── */}
            <div className="border-t border-stone-200 dark:border-gray-600 bg-stone-50/80 dark:bg-gray-800/80">
              <button
                type="button"
                onClick={() => setShowInternalNotes(!showInternalNotes)}
                className="w-full flex items-center justify-between px-5 py-3.5 text-xs font-bold text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white transition-all cursor-pointer"
              >
                <span className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-amber-500" />
                  <span>Catatan Investigasi Internal Satgas</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                    {internalNotes.length} Catatan
                  </span>
                  <span className="text-[10px] text-stone-400 font-normal italic hidden sm:inline">
                    (Rahasia internal — tidak tampak pada pelapor)
                  </span>
                </span>
                {showInternalNotes ? (
                  <ChevronUp className="w-4 h-4 text-stone-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-stone-400" />
                )}
              </button>

              <AnimatePresence>
                {showInternalNotes && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden px-5 pb-5 space-y-3.5 border-t border-stone-200 dark:border-gray-700/80 pt-3.5"
                  >
                    <div className="p-3 rounded-2xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2.5">
                      <Lock className="w-4 h-4 text-amber-500 shrink-0" />
                      <span>
                        Seluruh catatan di bagian ini disimpan terpisah dan <strong>100% diisolasi</strong> dari pelapor publik.
                      </span>
                    </div>

                    {/* Notes List */}
                    <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1 no-scrollbar">
                      {internalNotes.length === 0 ? (
                        <p className="text-center text-xs text-stone-400 py-4 italic">
                          Belum ada catatan internal untuk berkas ini.
                        </p>
                      ) : (
                        internalNotes.map((note) => (
                          <div
                            key={note.id}
                            className="p-3 rounded-2xl bg-white dark:bg-gray-800 border border-stone-200 dark:border-gray-700 text-xs space-y-1 shadow-xs"
                          >
                            <div className="flex items-center justify-between text-[10px] text-stone-400 font-mono">
                              <span className="font-extrabold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                <Shield className="w-3 h-3" />
                                {note.author}
                              </span>
                              <span>{formatDateID(note.timestamp)}</span>
                            </div>
                            <p className="text-stone-800 dark:text-stone-200 leading-relaxed whitespace-pre-wrap font-medium">
                              {note.text}
                            </p>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Add Internal Note Input */}
                    <form onSubmit={onAddInternalNote} className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="Tambah catatan investigasi rahasia Satgas..."
                        value={internalNoteInput}
                        onChange={(e) => setInternalNoteInput(e.target.value)}
                        className="flex-1 bg-white dark:bg-gray-800 border border-stone-200 dark:border-gray-600 rounded-2xl px-4 py-2.5 text-xs text-stone-900 dark:text-stone-100 outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all shadow-xs"
                      />
                      <button
                        type="submit"
                        disabled={!internalNoteInput.trim()}
                        className="bg-amber-600 hover:bg-amber-500 disabled:opacity-40 text-white px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-md cursor-pointer shrink-0 flex items-center gap-1.5"
                      >
                        <Plus className="w-4 h-4" />
                        <span>Simpan</span>
                      </button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        ) : (
          /* Empty / Unselected State View */
          <div className="bg-white/95 dark:bg-gray-700/95 p-16 rounded-3xl border border-stone-200 dark:border-gray-600 text-center space-y-4 shadow-xl backdrop-blur-xl">
            <div className="w-16 h-16 bg-teal-50 dark:bg-gray-800 text-teal-600 dark:text-teal-400 rounded-3xl flex items-center justify-center mx-auto border border-teal-200 dark:border-gray-600 shadow-inner">
              <MessageSquare className="w-8 h-8" />
            </div>
            <div className="space-y-1.5 max-w-md mx-auto">
              <h3 className="font-black text-stone-900 dark:text-white text-base sm:text-lg">
                Pilih Berkas untuk Membuka Percakapan
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
                Pilih salah satu berkas aduan dari daftar di sebelah kiri untuk memulai sesi komunikasi klarifikasi anonim dua arah secara langsung dan aman.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
