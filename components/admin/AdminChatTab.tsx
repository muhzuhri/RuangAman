'use client';

import React, { useState } from 'react';
import {
  MessageSquare,
  Send,
  Lock,
  User,
  ShieldCheck,
  Plus,
  ChevronDown,
  ChevronUp,
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

  const activeCase = selectedReport;
  const messages = activeCase?.messages || [];
  const internalNotes = activeCase ? internalNotesMap[activeCase.caseId] || [] : [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Left Sidebar: Case List */}
      <div className="bg-white dark:bg-[#163432] p-4 rounded-2xl border border-stone-200 dark:border-teal-900 shadow-xs space-y-3">
        <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-teal-500" />
          <span>Pilih Kasus</span>
        </h3>
        <p className="text-[11px] text-stone-400 leading-relaxed">
          Klik salah satu kasus di bawah ini untuk membuka percakapan langsung dengan pelapor/anonim.
        </p>

        <div className="space-y-2 max-h-[500px] overflow-y-auto no-scrollbar">
          {reports.map((r) => {
            const isSelected = activeCase?.caseId === r.caseId;
            const msgCount = r.messages ? r.messages.length : 0;
            return (
              <div
                key={r.caseId}
                onClick={() => onSelectReport(r)}
                className={`p-3 rounded-xl border transition-all cursor-pointer space-y-1.5 ${
                  isSelected
                    ? 'bg-teal-50 dark:bg-teal-950/80 border-teal-500 text-stone-900 dark:text-stone-100 shadow-xs'
                    : 'bg-stone-50 dark:bg-stone-900/40 border-stone-200 dark:border-stone-800 hover:border-teal-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono font-bold text-xs text-teal-600 dark:text-teal-400">
                    {r.caseId}
                  </span>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${STATUS_STYLES[r.status]}`}>
                    {r.status}
                  </span>
                </div>
                <p className="text-xs font-medium text-stone-700 dark:text-stone-300 truncate">
                  {r.category}
                </p>
                <div className="flex items-center justify-between text-[10px] text-stone-400 pt-1">
                  <span>Token: {r.anonymousToken}</span>
                  <span className={`font-bold ${msgCount > 0 ? 'text-teal-500' : 'text-stone-400'}`}>
                    {msgCount} Pesan
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Right Column: Direct Chat with Reporter */}
      <div className="lg:col-span-2 space-y-4">
        {activeCase ? (
          <div className="bg-white dark:bg-[#163432] rounded-2xl border border-stone-200 dark:border-teal-900 shadow-xs flex flex-col min-h-[520px]">
            {/* Chat Header */}
            <div className="p-4 border-b border-stone-100 dark:border-stone-800 bg-stone-50/50 dark:bg-stone-900/30 rounded-t-2xl space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <MessageSquare className="w-4 h-4 text-teal-500" />
                <span className="font-mono font-bold text-sm text-teal-600 dark:text-teal-400">
                  {activeCase.caseId}
                </span>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${STATUS_STYLES[activeCase.status]}`}>
                  {activeCase.status}
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Percakapan anonim dengan pelapor — Token:{' '}
                <code className="font-mono font-bold text-teal-500">{activeCase.anonymousToken}</code>
              </p>
            </div>

            {/* Messages Thread */}
            <div className="flex-1 flex flex-col justify-between p-4 space-y-4">
              <div className="flex-1 space-y-3 max-h-85 overflow-y-auto no-scrollbar p-2">
                {messages.length === 0 ? (
                  <div className="text-center py-10 text-stone-400 text-xs space-y-2">
                    <MessageSquare className="w-8 h-8 mx-auto text-stone-300 dark:text-stone-600" />
                    <p>Belum ada pesan pada kasus ini.</p>
                    <p className="text-[11px] text-stone-500">
                      Tulis pesan di bawah untuk menghubungi pelapor secara anonim.
                    </p>
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
                          className={`max-w-[80%] p-3 rounded-2xl text-xs space-y-1 ${
                            isSatgas
                              ? 'bg-teal-700 text-white rounded-br-none shadow-xs'
                              : 'bg-stone-200 dark:bg-stone-800 text-stone-900 dark:text-stone-100 rounded-bl-none border border-stone-300 dark:border-stone-700'
                          }`}
                        >
                          <div className={`flex items-center justify-between gap-3 text-[10px] ${isSatgas ? 'text-teal-100' : 'text-stone-600 dark:text-stone-400'}`}>
                            <span className="font-bold flex items-center gap-1">
                              {isSatgas ? <ShieldCheck className="w-3 h-3" /> : <User className="w-3 h-3" />}
                              {msg.sender}
                            </span>
                            <span>{formatDateID(msg.timestamp)}</span>
                          </div>
                          <p className="leading-relaxed whitespace-pre-wrap font-medium">{msg.text}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Message Input */}
              <form onSubmit={onSendSatgasMessage} className="flex items-center gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
                <input
                  type="text"
                  placeholder="Tulis pesan resmi Satgas kepada pelapor/anonim..."
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  className="flex-1 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-teal-900 rounded-xl px-4 py-2.5 text-xs text-stone-900 dark:text-stone-100 outline-none focus:border-teal-400"
                />
                <button
                  type="submit"
                  disabled={!chatInput.trim()}
                  className="bg-teal-600 hover:bg-teal-700 text-white p-2.5 rounded-xl transition-all disabled:opacity-50 cursor-pointer shrink-0"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>

            {/* Internal Notes Accordion */}
            <div className="border-t border-stone-100 dark:border-stone-800">
              <button
                type="button"
                onClick={() => setShowInternalNotes(!showInternalNotes)}
                className="w-full flex items-center justify-between px-4 py-3 text-xs font-bold text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white hover:bg-stone-50 dark:hover:bg-stone-900/30 transition-all cursor-pointer rounded-b-2xl"
              >
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-500" />
                  Catatan Internal Satgas ({internalNotes.length})
                  <span className="text-[10px] text-stone-400 font-normal italic">— tidak terlihat oleh pelapor</span>
                </span>
                {showInternalNotes ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>

              {showInternalNotes && (
                <div className="px-4 pb-4 space-y-3 border-t border-stone-100 dark:border-stone-800 pt-3">
                  <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
                    <Lock className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                    <span>Catatan ini bersifat rahasia internal Satgas PPKS dan <strong>TIDAK AKAN PERNAH</strong> dapat dilihat oleh pelapor.</span>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
                    {internalNotes.length === 0 ? (
                      <p className="text-center text-xs text-stone-400 py-4">Belum ada catatan internal untuk kasus ini.</p>
                    ) : (
                      internalNotes.map((note) => (
                        <div
                          key={note.id}
                          className="p-3 rounded-xl bg-stone-50 dark:bg-stone-900/80 border border-stone-200 dark:border-stone-800 text-xs space-y-1"
                        >
                          <div className="flex items-center justify-between text-[10px] text-stone-400">
                            <span className="font-bold text-amber-600 dark:text-amber-400">{note.author}</span>
                            <span>{formatDateID(note.timestamp)}</span>
                          </div>
                          <p className="text-stone-800 dark:text-stone-200 leading-relaxed whitespace-pre-wrap">{note.text}</p>
                        </div>
                      ))
                    )}
                  </div>

                  <form onSubmit={onAddInternalNote} className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Tambah catatan internal rahasia Satgas..."
                      value={internalNoteInput}
                      onChange={(e) => setInternalNoteInput(e.target.value)}
                      className="flex-1 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-teal-900 rounded-xl px-4 py-2.5 text-xs text-stone-900 dark:text-stone-100 outline-none focus:border-amber-400"
                    />
                    <button
                      type="submit"
                      disabled={!internalNoteInput.trim()}
                      className="bg-amber-600 hover:bg-amber-700 text-white px-3 py-2.5 rounded-xl text-xs font-bold transition-all disabled:opacity-50 cursor-pointer shrink-0 flex items-center gap-1"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Simpan</span>
                    </button>
                  </form>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#163432] p-12 rounded-3xl border border-stone-200 dark:border-teal-900 text-center space-y-3 shadow-xs my-auto">
            <div className="w-14 h-14 bg-teal-500/10 text-teal-600 dark:text-teal-400 rounded-2xl flex items-center justify-center mx-auto border border-teal-500/20">
              <MessageSquare className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm">Pilih Kasus Terlebih Dahulu</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
                Klik salah satu kasus dari daftar di sebelah kiri untuk langsung membuka percakapan anonim dengan pelapor.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
