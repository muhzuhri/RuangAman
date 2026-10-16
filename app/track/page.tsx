'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ShieldCheck,
  Clock,
  CheckCircle2,
  MessageSquare,
  AlertCircle,
  Loader2,
  HeartPulse,
  Lock,
  Sparkles,
  Shield,
  Send,
  Paperclip,
  CheckCircle,
  XCircle,
  Hash
} from 'lucide-react';
import Link from 'next/link';
import { Report, Message, MOCK_REPORTS } from '@/lib/types';
import { fetchReportByTokenFromDatabase, updateReportInDatabase } from '@/lib/reportsService';

export default function TrackPage() {
  const [tokenInput, setTokenInput] = useState('');
  const [searchStatus, setSearchStatus] = useState<'idle' | 'loading' | 'found' | 'notFound' | 'error'>('idle');
  const [foundReport, setFoundReport] = useState<Report | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [isSending, setIsSending] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = tokenInput.trim().toUpperCase();
    if (!trimmed) return;

    if (trimmed.length < 3) {
      setSearchStatus('error');
      setFoundReport(null);
      return;
    }

    setSearchStatus('loading');

    try {
      const match = await fetchReportByTokenFromDatabase(trimmed);
      if (match) {
        setFoundReport(match);
        setSearchStatus('found');
      } else {
        setFoundReport(null);
        setSearchStatus('notFound');
      }
    } catch (err) {
      console.error(err);
      setFoundReport(null);
      setSearchStatus('notFound');
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || !foundReport) return;
    setIsSending(true);

    const newMsg: Message = { id: `MSG-${Date.now()}`, sender: 'Pelapor', text: chatInput, timestamp: new Date().toISOString() };
    const msgs = foundReport.messages ? [...foundReport.messages, newMsg] : [newMsg];
    const auditEntry = { id: `AL-${Date.now()}`, action: 'Pelapor mengirim balasan anonim', actor: 'Pelapor' as const, timestamp: new Date().toISOString() };
    const logs = foundReport.auditLogs ? [...foundReport.auditLogs, auditEntry] : [auditEntry];

    const updatedReport = { ...foundReport, messages: msgs, auditLogs: logs };
    setFoundReport(updatedReport);
    setChatInput('');

    await updateReportInDatabase(foundReport.caseId, { messages: msgs, auditLogs: logs });
    setIsSending(false);
  };

  const formatDate = (iso: string) => {
    try { return new Date(iso).toLocaleString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta' }); }
    catch { return iso; }
  };

  const getTimelineSteps = (report: Report) => {
    const received = formatDate(report.receivedAt);
    const s = report.status;
    const base = [{ label: "Laporan Diterima", date: received, status: "completed" as const }];

    if (s === 'Laporan Diterima') {
      return [...base,
        { label: "Verifikasi Satgas & Validasi Forensik", date: "Menunggu Verifikasi", status: "current" as const },
        { label: "Dalam Investigasi", date: "-", status: "pending" as const },
        { label: "Resolusi / Tindak Lanjut", date: "-", status: "pending" as const },
      ];
    }

    base.push({ label: "Verifikasi Satgas & Validasi Forensik", date: "Selesai Diverifikasi", status: "completed" });

    if (s === 'Diverifikasi') {
      return [...base,
        { label: "Dalam Investigasi", date: "Menunggu Proses", status: "current" as const },
        { label: "Resolusi / Tindak Lanjut", date: "-", status: "pending" as const },
      ];
    }
    if (s === 'Diproses') {
      return [...base,
        { label: "Dalam Investigasi", date: "Sedang Berjalan", status: "current" as const },
        { label: "Resolusi / Tindak Lanjut", date: "-", status: "pending" as const },
      ];
    }

    base.push({ label: "Dalam Investigasi", date: "Investigasi Tuntas", status: "completed" });

    if (s === 'Mediasi & Konseling') {
      return [...base,
        { label: "Mediasi Aman & Konseling", date: "Proses Mediasi Berlangsung", status: "current" as const },
        { label: "Kasus Selesai", date: "-", status: "pending" as const },
      ];
    }
    if (s === 'Eskalasi ke Komite Etik') {
      return [...base,
        { label: "Eskalasi ke Komite Etik Kampus", date: "Dalam Penanganan Komite", status: "current" as const },
        { label: "Kasus Selesai", date: "-", status: "pending" as const },
      ];
    }

    return [...base,
      { label: "Resolusi / Tindak Lanjut", date: "Tindakan Selesai", status: "completed" as const },
      { label: "Kasus Selesai", date: "Kasus Ditutup", status: "completed" as const },
    ];
  };

  const FADE_IN = {
    hidden: { opacity: 0, y: 16 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  return (
    <div className="min-h-screen bg-transparent text-stone-900 dark:text-stone-100 font-sans">
      <main className="max-w-3xl mx-auto px-6 pt-24 pb-16 relative z-10 flex-1">

        {/* SEARCH SECTION */}
        <motion.div initial="hidden" animate="visible" variants={FADE_IN} className="text-center mb-10 space-y-3">
          <div className="w-14 h-14 bg-teal-50 dark:bg-teal-950 border border-teal-200 dark:border-teal-800 rounded-2xl flex items-center justify-center mx-auto">
            <ShieldCheck className="w-8 h-8 text-teal-600 dark:text-teal-400" />
          </div>
          <h2 className="text-3xl font-bold text-stone-900 dark:text-stone-50">Lacak Progres Secara Aman</h2>
          <p className="text-stone-600 dark:text-stone-400 max-w-lg mx-auto text-sm">
            Masukkan Token Pelacakan Anonim atau Case ID Anda. Sistem kami akan mencari status terbaru tanpa meminta identitas, nama, atau kredensial login.
          </p>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          onSubmit={handleSearch}
          className="relative max-w-xl mx-auto flex flex-col sm:flex-row gap-3 items-stretch"
        >
          <div className="flex-1 flex items-center bg-white dark:bg-[#0a2220] rounded-xl border border-stone-200 dark:border-teal-900 px-4 shadow-xs focus-within:border-teal-400 focus-within:ring-2 focus-within:ring-teal-500/30 transition-all">
            <Search className="w-5 h-5 text-stone-400 shrink-0" />
            <input
              type="text"
              placeholder="Contoh: AK-2026-X9K2P atau CASE-2026-00001"
              value={tokenInput}
              onChange={(e) => {
                setTokenInput(e.target.value);
                if (searchStatus === 'error' || searchStatus === 'notFound') setSearchStatus('idle');
              }}
              className="flex-1 bg-transparent border-none outline-none focus:outline-none focus-visible:outline-none focus:ring-0 focus-visible:ring-0 text-stone-900 dark:text-stone-100 font-mono placeholder:font-sans placeholder:text-stone-400 px-3 py-3.5"
              required
            />
          </div>
          <button
            type="submit"
            disabled={searchStatus === 'loading' || !tokenInput}
            className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-6 py-3.5 rounded-xl transition-all shadow-xs disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 whitespace-nowrap cursor-pointer"
          >
            {searchStatus === 'loading' ? (<><Loader2 className="w-4 h-4 animate-spin" /> Mencari...</>) : "Cek Status"}
          </button>
        </motion.form>

        {searchStatus === 'error' && (
          <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="text-rose-600 dark:text-rose-400 text-sm text-center mt-4 flex items-center justify-center gap-2 font-medium">
            <AlertCircle className="w-4 h-4" /> Format Token atau Case ID tidak valid.
          </motion.div>
        )}

        <div className="mt-10">
          <AnimatePresence mode="wait">

            {/* DEFAULT STATE */}
            {searchStatus === 'idle' && (
              <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="bg-white/80 dark:bg-[#163432] backdrop-blur-xl border border-stone-200 dark:border-teal-900 border-dashed rounded-2xl p-8 text-center max-w-xl mx-auto"
              >
                <div className="text-stone-300 dark:text-stone-700 mb-4 flex justify-center"><Clock className="w-10 h-10" /></div>
                <h4 className="font-semibold text-stone-700 dark:text-stone-300 mb-2">Menunggu Input Token / Case ID</h4>
                <p className="text-stone-400 text-sm">Masukkan Token atau Case ID Anda di area pencarian di atas untuk melacak perkembangan penanganan kasus Anda.</p>
              </motion.div>
            )}

            {/* NOT FOUND STATE */}
            {searchStatus === 'notFound' && (
              <motion.div key="notFound" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="bg-white dark:bg-stone-800 border border-rose-200 dark:border-rose-900/50 rounded-2xl p-8 text-center max-w-xl mx-auto space-y-3 shadow-md"
              >
                <div className="w-12 h-12 bg-rose-50 dark:bg-rose-950/60 rounded-full flex items-center justify-center mx-auto text-rose-500">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-stone-900 dark:text-stone-50 text-lg">Laporan Tidak Ditemukan</h4>
                <p className="text-stone-600 dark:text-stone-400 text-sm leading-relaxed">
                  Token / Case ID <code className="text-rose-600 dark:text-rose-400 font-mono font-bold bg-rose-50 dark:bg-rose-950 px-2 py-0.5 rounded">{tokenInput.toUpperCase()}</code> tidak terdaftar pada sistem AmanKampus. Silakan periksa kembali penulisan Token / Case ID atau buat laporan baru.
                </p>
              </motion.div>
            )}

            {/* FOUND STATE */}
            {searchStatus === 'found' && foundReport && (
              <motion.div key="found" initial="hidden" animate="visible" exit={{ opacity: 0 }}
                variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
                className="space-y-6"
              >

                {/* Meta Info */}
                <motion.div variants={FADE_IN} className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white/90 dark:bg-[#163432] backdrop-blur-xl border border-stone-200 dark:border-teal-900 rounded-2xl p-6 shadow-md">
                  <div>
                    <p className="text-xs text-stone-400 dark:text-stone-500 uppercase tracking-widest font-semibold mb-1">Status Penanganan</p>
                    <div className="flex items-center gap-3">
                      <div className="flex h-3 w-3 relative">
                        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                          foundReport.status === 'Selesai' ? 'bg-emerald-400' : 'bg-teal-400'
                        }`} />
                        <span className={`relative inline-flex rounded-full h-3 w-3 ${
                          foundReport.status === 'Selesai' ? 'bg-emerald-500' : 'bg-teal-500'
                        }`} />
                      </div>
                      <h3 className="text-xl font-bold text-stone-900 dark:text-stone-50">{foundReport.status}</h3>
                    </div>
                  </div>
                  <div className="flex gap-6 text-sm">
                    <div className="text-right">
                      <p className="text-stone-400 mb-1">Kategori</p>
                      <p className="text-stone-700 dark:text-stone-300 font-medium">{foundReport.category}</p>
                    </div>
                    <div className="text-right border-l border-stone-100 dark:border-stone-600 pl-6">
                      <p className="text-stone-400 mb-1">Case ID</p>
                      <p className="font-mono text-xs text-teal-700 dark:text-teal-400 font-bold">{foundReport.caseId}</p>
                    </div>
                  </div>
                </motion.div>

                {/* Timeline */}
                <motion.div variants={FADE_IN} className="bg-white/90 dark:bg-[#163432] backdrop-blur-xl border border-stone-200 dark:border-teal-900 rounded-2xl p-8 shadow-md">
                  <h3 className="text-lg font-bold mb-7 flex items-center gap-2 text-stone-900 dark:text-stone-50">
                    <Clock className="w-5 h-5 text-teal-600 dark:text-teal-400" /> Timeline Penanganan Kasus
                  </h3>
                  <div className="relative border-l-2 border-stone-200 dark:border-stone-600 ml-3 space-y-7">
                    {getTimelineSteps(foundReport).map((step, idx) => (
                      <div key={idx} className="relative pl-8">
                        {step.status === 'completed' && (
                          <div className="absolute -left-[11px] top-0 w-5 h-5 rounded-full bg-emerald-50 dark:bg-emerald-950 border-2 border-emerald-500 flex items-center justify-center">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          </div>
                        )}
                        {step.status === 'current' && (
                          <div className="absolute -left-[11px] top-0 w-5 h-5 rounded-full bg-teal-500 border-2 border-white dark:border-stone-900 shadow-md flex items-center justify-center animate-pulse" />
                        )}
                        {step.status === 'pending' && (
                          <div className="absolute -left-[7px] top-1 w-3 h-3 rounded-full bg-stone-100 dark:bg-stone-700 border-2 border-stone-300 dark:border-stone-500" />
                        )}
                        <div className={step.status === 'pending' ? 'opacity-40' : 'opacity-100'}>
                          <h4 className={`font-semibold ${
                            step.status === 'current' ? 'text-teal-700 dark:text-teal-400 text-lg' :
                            step.status === 'completed' ? 'text-stone-800 dark:text-stone-200' : 'text-stone-400'
                          }`}>{step.label}</h4>
                          <p className="text-xs text-stone-400 mt-0.5">{step.date}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Evidence Verification Status (Features 1 & 5) */}
                {foundReport.evidences && foundReport.evidences.length > 0 && (
                  <motion.div variants={FADE_IN} className="bg-white/90 dark:bg-[#163432] backdrop-blur-xl border border-stone-200 dark:border-teal-900 rounded-2xl p-7 shadow-md space-y-4">
                    <h3 className="text-lg font-bold text-stone-900 dark:text-stone-50 flex items-center gap-2">
                      <Paperclip className="w-5 h-5 text-teal-600 dark:text-teal-400" /> Status Integritas & Verifikasi Bukti
                    </h3>
                    <div className="space-y-3">
                      {foundReport.evidences.map((ev) => {
                        const status = ev.verificationStatus || 'Belum Diverifikasi';
                        return (
                          <div key={ev.evidenceId} className="bg-stone-50 dark:bg-[#14302c] border border-stone-200 dark:border-stone-600 rounded-xl p-4 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="font-semibold text-sm text-stone-800 dark:text-stone-200 truncate max-w-[240px]">{ev.fileName}</span>
                              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border flex items-center gap-1 ${
                                status === 'Terverifikasi Valid' ? 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' :
                                status === 'Tervalidasi Palsu / Ditolak' ? 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800' :
                                'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                              }`}>
                                {status === 'Terverifikasi Valid' && <CheckCircle className="w-3 h-3" />}
                                {status === 'Tervalidasi Palsu / Ditolak' && <XCircle className="w-3 h-3" />}
                                {status === 'Belum Diverifikasi' && <Clock className="w-3 h-3" />}
                                {status}
                              </span>
                            </div>
                            <p className="text-[11px] font-mono text-stone-500 dark:text-stone-400 flex items-center gap-1">
                              <Hash className="w-3 h-3" /> SHA-256 Checksum: {ev.sha256.substring(0, 24)}...
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* Chat Section */}
                <motion.div variants={FADE_IN} className="bg-white/90 dark:bg-[#163432] backdrop-blur-xl border border-stone-200 dark:border-teal-900 rounded-2xl p-7 shadow-md">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-lg font-bold text-stone-900 dark:text-stone-50 flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-teal-600 dark:text-teal-400" /> Komunikasi Aman (Dua-Arah)
                    </h3>
                  </div>

                  <div className="space-y-4 mb-5 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                    {/* System Greeting */}
                    <div className="bg-stone-50 dark:bg-[#14302c]/60 border border-stone-200 dark:border-stone-600 rounded-xl p-4 text-stone-700 dark:text-stone-300 text-sm">
                      <div className="flex items-center gap-2 text-teal-600 dark:text-teal-400 text-xs font-mono font-semibold mb-2">
                        <Sparkles className="w-3.5 h-3.5" /> SISTEM AMANKAMPUS
                      </div>
                      <p>Laporan Anda dengan token <strong className="text-stone-900 dark:text-stone-50 font-mono">{foundReport.anonymousToken}</strong> telah tercatat. Identitas Anda tidak disimpan. Satgas akan meninjau laporan dan memberikan instruksi melalui kotak masuk ini.</p>
                    </div>

                    {/* Messages */}
                    {foundReport.messages && foundReport.messages.map((msg) => (
                      <div key={msg.id} className={`flex flex-col ${msg.sender === 'Pelapor' ? 'items-end' : 'items-start'} gap-1 mt-3`}>
                        <div className="text-[10px] text-stone-400 font-mono font-bold uppercase flex items-center gap-2">
                          {msg.sender === 'Satgas' && <Shield className="w-3 h-3 text-teal-500" />}
                          {msg.sender}
                          <span className="opacity-60">{formatDate(msg.timestamp)}</span>
                        </div>
                        <div className={`p-3.5 rounded-xl max-w-[85%] text-sm leading-relaxed ${
                          msg.sender === 'Pelapor'
                            ? 'bg-teal-600 text-white rounded-tr-xs font-medium shadow-xs'
                            : 'bg-stone-100 dark:bg-stone-700 border border-stone-200 dark:border-stone-500 text-stone-700 dark:text-stone-200 rounded-tl-xs'
                        }`}>
                          {msg.text}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Reply Input */}
                  <div className="pt-4 border-t border-stone-100 dark:border-stone-600">
                    <form onSubmit={handleSendMessage} className="flex gap-3">
                      <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        placeholder="Balas pesan atau tambahkan informasi secara anonim..."
                        className="flex-1 bg-stone-50 dark:bg-[#14302c] border border-stone-200 dark:border-stone-600 rounded-xl px-4 py-3 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 dark:placeholder:text-stone-500 focus:outline-none focus:border-teal-400 transition-all font-medium"
                        required
                      />
                      <button
                        type="submit"
                        disabled={isSending || !chatInput.trim()}
                        className="bg-teal-600 hover:bg-teal-700 text-white p-3 rounded-xl transition-all shadow-xs disabled:opacity-50 flex items-center justify-center shrink-0 cursor-pointer"
                      >
                        {isSending ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                      </button>
                    </form>
                    <p className="mt-3 text-[10px] text-stone-400 flex items-center gap-1.5">
                      <Lock className="w-3 h-3" /> Tanggapan terenkripsi dan anonim. Identitas Anda tidak tersimpan.
                    </p>
                  </div>
                </motion.div>

              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* EMERGENCY PFA LINK */}
        <div className="mt-16 border-t border-stone-200 dark:border-stone-600 pt-8 text-center">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 }} className="inline-flex flex-col items-center gap-3">
            <p className="text-sm text-stone-400">Pengecekan status laporan terkadang menimbulkan kecemasan.</p>
            <Link href="/#emergency" className="flex items-center gap-2 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 px-6 py-2.5 rounded-full transition-colors font-medium text-sm border border-rose-200 dark:border-rose-900/50">
              <HeartPulse className="w-4 h-4" /> Beralih ke Titik Penenang Darurat
            </Link>
          </motion.div>
        </div>

      </main>
    </div>
  );
}
