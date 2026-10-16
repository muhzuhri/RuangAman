'use client';

import React, { useState } from 'react';
import {
  Clock,
  Paperclip,
  Download,
  History,
  Lock,
  Plus,
  Sparkles,
  ArrowLeft,
} from 'lucide-react';
import {
  type Report,
  type CaseStatus,
  type EvidenceVerificationStatus,
  type AuditLog,
} from '@/lib/types';
import {
  formatDateID,
  formatBytes,
  STATUS_STYLES,
  ALL_STATUSES,
  handleDownloadEvidence,
} from '@/lib/adminUtils';

interface AdminCaseDetailModalProps {
  report: Report | null;
  onClose: () => void;
  onUpdateStatus: (newStatus: CaseStatus) => void;
  onVerifyEvidence: (evidenceId: string, status: EvidenceVerificationStatus, note: string) => void;
  internalNotesMap: Record<string, { id: string; text: string; author: string; timestamp: string }[]>;
  internalNoteInput: string;
  setInternalNoteInput: (input: string) => void;
  onAddInternalNote: (e: React.FormEvent) => void;
}

export default function AdminCaseDetailModal({
  report,
  onClose,
  onUpdateStatus,
  onVerifyEvidence,
  internalNotesMap,
  internalNoteInput,
  setInternalNoteInput,
  onAddInternalNote,
}: AdminCaseDetailModalProps) {
  const [showAuditTrail, setShowAuditTrail] = useState(false);
  const [activeTab, setActiveTab] = useState<'detail' | 'evidence' | 'internal'>('detail');

  if (!report) return null;

  const internalNotes = internalNotesMap[report.caseId] || [];

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Top Navigation Back Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#163432] p-4 rounded-2xl border border-stone-200 dark:border-teal-900 shadow-xs">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-xs shrink-0 self-start sm:self-auto"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Daftar Tabel Kasus</span>
        </button>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono font-bold text-sm text-stone-900 dark:text-stone-100 bg-stone-100 dark:bg-stone-800 px-3 py-1 rounded-xl">
            {report.caseId}
          </span>
          <span className={`text-xs font-bold px-3 py-1 rounded-xl border ${STATUS_STYLES[report.status]}`}>
            {report.status}
          </span>
          <span className="text-xs text-stone-500 font-mono">
            Token: <code className="font-bold text-teal-600 dark:text-teal-400">{report.anonymousToken}</code>
          </span>
        </div>

        <button
          type="button"
          onClick={() => setShowAuditTrail(!showAuditTrail)}
          className="px-3 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 text-stone-700 dark:text-stone-300 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
        >
          <History className="w-3.5 h-3.5 text-teal-500" />
          <span>Jejak Audit</span>
        </button>
      </div>

      <div className="bg-white dark:bg-[#163432] border border-stone-200 dark:border-teal-900 rounded-3xl w-full flex flex-col shadow-sm overflow-hidden min-h-[550px]">

        {/* Modal Inner Navigation Tabs */}
        <div className="flex items-center gap-1 p-2 bg-stone-100 dark:bg-stone-900 border-b border-stone-200 dark:border-stone-800 overflow-x-auto">
          <button
            onClick={() => setActiveTab('detail')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'detail'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            Pemeriksaan Detail
          </button>

          <button
            onClick={() => setActiveTab('evidence')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'evidence'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <Paperclip className="w-3.5 h-3.5" />
            <span>Bukti Forensik ({report.evidences ? report.evidences.length : 0})</span>
          </button>

          <button
            onClick={() => setActiveTab('internal')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'internal'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            <span>Catatan Rahasia Satgas ({internalNotes.length})</span>
          </button>
        </div>

        {/* Modal Content Scroll Area */}
        <div className="flex-1 p-5 overflow-y-auto space-y-5">
          {/* Audit Trail Drawer Overlay */}
          {showAuditTrail && (
            <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-900 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-xs text-teal-800 dark:text-teal-300 flex items-center gap-1.5">
                  <History className="w-4 h-4" />
                  <span>Riwayat Jejak Audit Kasus (Immutable Audit Trail)</span>
                </h4>
                <button
                  onClick={() => setShowAuditTrail(false)}
                  className="text-xs text-stone-400 hover:text-stone-600 cursor-pointer"
                >
                  Tutup Audit
                </button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto no-scrollbar">
                {report.auditLogs && report.auditLogs.length > 0 ? (
                  report.auditLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-teal-900 text-xs flex items-start justify-between gap-2"
                    >
                      <div>
                        <span className="font-bold text-teal-600 dark:text-teal-400">[{log.actor}]</span>{' '}
                        <span className="text-stone-800 dark:text-stone-200">{log.action}</span>
                      </div>
                      <span className="text-[10px] text-stone-400 whitespace-nowrap">{formatDateID(log.timestamp)}</span>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-stone-500 italic">Belum ada aktivitas jejak audit tercatat.</p>
                )}
              </div>
            </div>
          )}

          {/* TAB 1: Examination Details */}
          {activeTab === 'detail' && (
            <div className="space-y-5">
              {/* Status Change Control */}
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <span className="text-xs font-bold text-stone-700 dark:text-stone-300">Ubah Status Penanganan Kasus:</span>
                  <p className="text-[11px] text-stone-500">Perubahan status akan langsung tercatat pada jejak audit immutable.</p>
                </div>
                <select
                  value={report.status}
                  onChange={(e) => onUpdateStatus(e.target.value as CaseStatus)}
                  className={`text-xs font-bold px-3 py-2 rounded-xl border outline-none cursor-pointer ${STATUS_STYLES[report.status]}`}
                >
                  {ALL_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {st}
                    </option>
                  ))}
                </select>
              </div>

              {/* Metadata Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-900/40 border border-stone-200 dark:border-stone-800">
                  <span className="text-stone-400 block font-medium">Kategori Kasus</span>
                  <span className="font-bold text-stone-900 dark:text-stone-100 mt-1 block">{report.category}</span>
                </div>

                <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-900/40 border border-stone-200 dark:border-stone-800">
                  <span className="text-stone-400 block font-medium">Waktu Diterima System</span>
                  <span className="font-bold text-stone-900 dark:text-stone-100 mt-1 block">{formatDateID(report.receivedAt)}</span>
                </div>

                <div className="p-3 rounded-xl bg-stone-50 dark:bg-stone-900/40 border border-stone-200 dark:border-stone-800">
                  <span className="text-stone-400 block font-medium">Fakultas / Scope Target</span>
                  <span className="font-bold text-stone-900 dark:text-stone-100 mt-1 block">{report.targetFaculty || 'Tidak Diberitahukan'}</span>
                </div>
              </div>

              {/* Chronology Card */}
              <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900/40 border border-stone-200 dark:border-stone-800 space-y-2">
                <h4 className="font-bold text-xs text-stone-900 dark:text-stone-100 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-teal-500" />
                  <span>Kronologi Kejadian Resmi Pelapor</span>
                </h4>
                <p className="text-xs text-stone-800 dark:text-stone-200 leading-relaxed whitespace-pre-wrap">
                  {report.chronology}
                </p>
              </div>

              {report.involvedParties && (
                <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900/40 border border-stone-200 dark:border-stone-800 space-y-1 text-xs">
                  <span className="font-bold text-stone-700 dark:text-stone-300">Pihak Terlibat / Terlapor:</span>
                  <p className="text-stone-800 dark:text-stone-200">{report.involvedParties}</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: Evidences */}
          {activeTab === 'evidence' && (
            <div className="space-y-4">
              <h4 className="font-bold text-xs text-stone-900 dark:text-stone-100">Daftar Berkas Bukti Terlampir</h4>
              {report.evidences && report.evidences.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {report.evidences.map((ev) => {
                    const isAiManipulated = ev.forensicStatus === 'Manipulated';
                    return (
                      <div
                        key={ev.evidenceId || Math.random().toString()}
                        className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900/80 border border-stone-200 dark:border-stone-800 space-y-3 shadow-xs"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="font-bold text-xs text-stone-900 dark:text-stone-100 truncate">{ev.fileName || 'Berkas Bukti'}</p>
                            <p className="text-[10px] text-teal-600 dark:text-teal-400 font-mono mt-0.5 break-all">
                              {formatBytes(ev.fileSize || 0)} | SHA-256: {ev.sha256 || 'N/A'}
                            </p>
                          </div>
                          <button
                            onClick={() => handleDownloadEvidence(ev)}
                            className="p-2 rounded-xl bg-teal-600 text-white hover:bg-teal-700 transition-colors cursor-pointer shrink-0 flex items-center gap-1.5 text-xs font-bold"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Unduh Asli</span>
                          </button>
                        </div>

                        {/* Analisis Forensik Generative AI */}
                        <div className="p-3 rounded-xl bg-white dark:bg-stone-950/70 border border-stone-200/80 dark:border-stone-800 space-y-2 text-xs">
                          {/* Judul & Verdict */}
                          <div className="flex items-center justify-between gap-2 flex-wrap">
                            <span className="font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                              <Sparkles className={`w-4 h-4 ${isAiManipulated ? 'text-rose-500' : 'text-teal-500'}`} />
                              Analisis Forensik AI
                            </span>
                            <span className={`font-extrabold text-[11px] px-2.5 py-1 rounded-full ${
                              isAiManipulated
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            }`}>
                              {isAiManipulated ? '⚠ Terindikasi Manipulasi' : '✓ Foto Asli Terverifikasi'}
                            </span>
                          </div>

                          {/* Detail Teknis */}
                          <div className="grid grid-cols-1 gap-1.5 pt-1.5 border-t border-stone-100 dark:border-stone-800/80">
                            <div className="flex items-start gap-1.5">
                              <span className="font-semibold text-stone-600 dark:text-stone-400 shrink-0 w-28">Analisis Noise:</span>
                              <span className="text-stone-700 dark:text-stone-300">
                                {isAiManipulated
                                  ? 'Pola tidak konsisten — GAN artifact terdeteksi'
                                  : 'Noise CMOS normal — cocok sensor kamera asli'}
                              </span>
                            </div>
                            <div className="flex items-start gap-1.5">
                              <span className="font-semibold text-stone-600 dark:text-stone-400 shrink-0 w-28">Sanitasi EXIF:</span>
                              <span className="text-stone-700 dark:text-stone-300">
                                {ev.exifStripped
                                  ? 'Dibersihkan otomatis — lokasi GPS & identitas perangkat dihapus'
                                  : 'EXIF dipertahankan dalam format standar'}
                              </span>
                            </div>
                            {ev.forensicDetails && ev.forensicDetails.length > 0 && (
                              <div className="flex items-start gap-1.5">
                                <span className="font-semibold text-stone-600 dark:text-stone-400 shrink-0 w-28 mt-0.5">Log ELA:</span>
                                <ul className="space-y-1 flex-1">
                                  {ev.forensicDetails.map((detail, idx) => (
                                    <li
                                      key={idx}
                                      className="flex items-start gap-1.5 text-stone-700 dark:text-stone-300 leading-relaxed"
                                    >
                                      <span className="text-teal-500 mt-0.5 shrink-0">•</span>
                                      <span>{detail.replace(/^[.,\s]+/, '').trim()}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>

                          {/* Catatan Pelapor */}
                          {ev.reporterNote && (
                            <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/40 text-amber-800 dark:text-amber-300 text-[11px] italic leading-relaxed">
                              Catatan pelapor: &ldquo;{ev.reporterNote}&rdquo;
                            </div>
                          )}
                        </div>

                        <div className="pt-2 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between gap-2">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                            ev.verificationStatus === 'Terverifikasi Valid'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : ev.verificationStatus === 'Tervalidasi Palsu / Ditolak'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}>
                            {ev.verificationStatus || 'Belum Diverifikasi'}
                          </span>

                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => onVerifyEvidence(ev.evidenceId, 'Terverifikasi Valid', 'Validasi Satgas: Bukti Asli & Valid')}
                              className="px-2.5 py-1 text-[11px] font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 cursor-pointer"
                            >
                              Set Valid
                            </button>
                            <button
                              onClick={() => onVerifyEvidence(ev.evidenceId, 'Tervalidasi Palsu / Ditolak', 'Validasi Satgas: Bukti Palsu')}
                              className="px-2.5 py-1 text-[11px] font-bold bg-rose-600 text-white rounded-lg hover:bg-rose-700 cursor-pointer"
                            >
                              Set Tolak
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-xs text-stone-500">Tidak ada berkas bukti terlampir pada laporan ini.</p>
              )}
            </div>
          )}



          {/* TAB 4: Internal Satgas Notes */}
          {activeTab === 'internal' && (
            <div className="space-y-4">
              <div className="space-y-3 max-h-64 overflow-y-auto no-scrollbar p-2">
                {internalNotes.length > 0 ? (
                  internalNotes.map((note) => (
                    <div key={note.id} className="p-3 rounded-xl bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs">
                      <div className="flex justify-between text-[10px] text-stone-400">
                        <span className="font-bold text-amber-500">{note.author}</span>
                        <span>{formatDateID(note.timestamp)}</span>
                      </div>
                      <p className="mt-1 text-stone-800 dark:text-stone-200">{note.text}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-stone-400 text-center py-6">Belum ada catatan rahasia internal.</p>
                )}
              </div>

              <form onSubmit={onAddInternalNote} className="flex gap-2">
                <input
                  type="text"
                  placeholder="Tambah catatan internal rahasia Satgas..."
                  value={internalNoteInput}
                  onChange={(e) => setInternalNoteInput(e.target.value)}
                  className="flex-1 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-teal-900 rounded-xl px-4 py-2 text-xs text-stone-900 dark:text-stone-100 outline-none"
                />
                <button
                  type="submit"
                  disabled={!internalNoteInput.trim()}
                  className="bg-amber-600 text-white px-4 py-2 rounded-xl text-xs font-bold cursor-pointer disabled:opacity-50"
                >
                  Simpan Catatan
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
