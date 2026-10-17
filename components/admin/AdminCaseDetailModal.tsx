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
  Loader2,
  ShieldAlert,
  CheckCircle2,
  FileText,
  Volume2,
  Video,
  Image as ImageIcon,
  Bot,
  Gavel,
  Shield,
  AlertTriangle,
} from 'lucide-react';
import {
  type Report,
  type CaseStatus,
  type EvidenceVerificationStatus,
  type AuditLog,
  type EvidenceAnalysisResult,
  type Evidence,
  type AITriageResult,
} from '@/lib/types';
import {
  formatDateID,
  formatBytes,
  STATUS_STYLES,
  ALL_STATUSES,
  handleDownloadEvidence,
} from '@/lib/adminUtils';

// Helper function to extract or compute AI Triage analysis (matching Telegram Bot format)
export const getAITriageData = (report: Report): AITriageResult => {
  if (report.aiTriage && report.aiTriage.riskLevel) {
    return report.aiTriage;
  }

  const cat = (report.category || '').toLowerCase();
  const text = (report.chronology || '').toLowerCase();

  if (
    cat.includes('fisik') ||
    cat.includes('kekerasan seksual') ||
    cat.includes('pelecehan') ||
    text.includes('paksa') ||
    text.includes('ancam') ||
    text.includes('perkosa') ||
    text.includes('sentuh')
  ) {
    return {
      riskLevel: 'CRITICAL',
      urgencyScore: 95,
      categoryRecommendation: report.category || 'Kekerasan Seksual & Intimidasi Berat',
      legalPasalBasis: 'Pasal 5 & 6 UU No. 12 Tahun 2022 tentang Tindak Pidana Kekerasan Seksual (TPKS) & Permendikbudristek No. 30 Tahun 2021',
      summary: 'Laporan mengindikasikan pelanggaran kritis dengan potensi ancaman fisik/psikis langsung yang membutuhkan penanganan darurat segera oleh Satgas PPKS.',
    };
  }

  if (
    cat.includes('perundungan') ||
    cat.includes('daring') ||
    cat.includes('harassment') ||
    cat.includes('intimidasi') ||
    cat.includes('cyber')
  ) {
    return {
      riskLevel: 'HIGH',
      urgencyScore: 82,
      categoryRecommendation: report.category || 'Perundungan & Pelecehan Daring (KSBE)',
      legalPasalBasis: 'Pasal 14 UU No. 12 Tahun 2022 (KSBE) & Pasal 5 Permendikbudristek No. 30 Tahun 2021 tentang PPKS',
      summary: 'Laporan menunjukkan pola intimidasi berulang dan perundungan berbasis elektronik yang berdampak pada psikis korban.',
    };
  }

  return {
    riskLevel: 'MEDIUM',
    urgencyScore: 65,
    categoryRecommendation: report.category || 'Pelanggaran Etika & Relasi Kuasa',
    legalPasalBasis: 'Pasal 6, 9 & 10 Permendikbudristek No. 30 Tahun 2021 tentang Pencegahan dan Penanganan Kekerasan Seksual (PPKS)',
    summary: 'Laporan memuat indikasi pelanggaran etika akademik atau diskriminasi yang memerlukan klarifikasi dan mediasi terpandu oleh tim Satgas.',
  };
};

export const getRiskBadgeConfig = (riskLevel: string) => {
  switch (riskLevel) {
    case 'CRITICAL':
      return {
        badgeIcon: '🚨',
        riskBadge: '🔴 KRITIS (CRITICAL)',
        badgeCls: 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800',
        bgGradient: 'from-rose-500/15 via-rose-500/5 to-transparent',
        dotCls: 'bg-rose-500 animate-ping',
      };
    case 'HIGH':
      return {
        badgeIcon: '⚠️',
        riskBadge: '🟠 TINGGI (HIGH)',
        badgeCls: 'bg-orange-50 text-orange-800 border-orange-300 dark:bg-orange-950/80 dark:text-orange-300 dark:border-orange-800',
        bgGradient: 'from-orange-500/15 via-orange-500/5 to-transparent',
        dotCls: 'bg-orange-500 animate-pulse',
      };
    case 'MEDIUM':
      return {
        badgeIcon: '🟡',
        riskBadge: '🟡 MENENGAH (MEDIUM)',
        badgeCls: 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800',
        bgGradient: 'from-amber-500/15 via-amber-500/5 to-transparent',
        dotCls: 'bg-amber-500',
      };
    case 'LOW':
    default:
      return {
        badgeIcon: 'ℹ️',
        riskBadge: '🟢 RENDAH (LOW)',
        badgeCls: 'bg-teal-50 text-teal-800 border-teal-300 dark:bg-teal-950/80 dark:text-teal-300 dark:border-teal-800',
        bgGradient: 'from-teal-500/15 via-teal-500/5 to-transparent',
        dotCls: 'bg-teal-500',
      };
  }
};

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
  const [analyzingEvId, setAnalyzingEvId] = useState<string | null>(null);
  const [liveAnalysisMap, setLiveAnalysisMap] = useState<Record<string, EvidenceAnalysisResult>>({});

  const handleRunAiAnalysis = async (ev: Evidence) => {
    setAnalyzingEvId(ev.evidenceId);
    try {
      const res = await fetch('/api/evidence-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mediaBase64: ev.dataUrl || 'dummy_media_bytes',
          mimeType: ev.fileType || 'image/png',
          fileName: ev.fileName,
          context: ev.reporterNote || '',
        }),
      });
      const json = await res.json();
      if (json.data) {
        setLiveAnalysisMap((prev) => ({ ...prev, [ev.evidenceId]: json.data }));
      }
    } catch (err) {
      console.error('Gagal menjalankan analisis AI:', err);
    } finally {
      setAnalyzingEvId(null);
    }
  };

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

              {/* Compact AI Smart Triage Banner in Detail Tab (Format Telegram) */}
              {(() => {
                const triage = getAITriageData(report);
                const risk = getRiskBadgeConfig(triage.riskLevel);
                return (
                  <div className="p-3.5 rounded-xl bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-900/60 flex items-center justify-between gap-3 flex-wrap text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-teal-800 dark:text-teal-300 flex items-center gap-1.5">
                        <Bot className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                        AI Smart Triage:
                      </span>
                      <span className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold border ${risk.badgeCls}`}>
                        {risk.badgeIcon} {risk.riskBadge} (Urgensi: {triage.urgencyScore}/100)
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] font-mono text-teal-900 dark:text-teal-200 truncate max-w-md">
                      <Gavel className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                      <span className="truncate">{triage.legalPasalBasis}</span>
                    </div>
                  </div>
                );
              })()}

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
              {/* ── CARD RINGKASAN TINGKAT RISIKO & RUJUKAN REGULASI (FORMAT NOTIFIKASI TELEGRAM SATGAS) ── */}
              {(() => {
                const triage = getAITriageData(report);
                const risk = getRiskBadgeConfig(triage.riskLevel);

                return (
                  <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-teal-50/90 via-emerald-50/50 to-teal-100/40 dark:from-[#0d2a27] dark:via-[#09201e] dark:to-[#071816] border-2 border-teal-500/50 dark:border-teal-600/60 shadow-xs space-y-3.5">
                    {/* Header: Title + Risk Badge */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-teal-200/80 dark:border-teal-800/80 pb-3">
                      <div className="flex items-start gap-2.5">
                        <div className="p-2 rounded-xl bg-teal-600 text-white shadow-xs shrink-0 mt-0.5">
                          <Bot className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-bold text-xs sm:text-sm text-stone-900 dark:text-stone-100">
                              Analisis AI Smart Triage & Bukti Forensik
                            </h4>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-800 flex items-center gap-1 font-semibold">
                              <Sparkles className="w-3 h-3 text-teal-500" />
                              <span>Format Standar Notifikasi Telegram</span>
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                            Penilaian objektif tingkat urgensi kasus dan rujukan dasar regulasi hukum penanganan Satgas PPKS
                          </p>
                        </div>
                      </div>

                      {/* Risk Badge & Urgency Score */}
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={`px-3 py-1 rounded-xl text-xs font-black border flex items-center gap-1.5 shadow-xs ${risk.badgeCls}`}>
                          <span>{risk.badgeIcon}</span>
                          <span>{risk.riskBadge}</span>
                        </span>
                        <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-200 shadow-xs">
                          Skor Urgensi: <b className="text-teal-600 dark:text-teal-400">{triage.urgencyScore}/100</b>
                        </span>
                      </div>
                    </div>

                    {/* Content Grid: Rujukan Regulasi & Ringkasan Kasus */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      {/* Rujukan Dasar Regulasi */}
                      <div className="p-3.5 rounded-xl bg-white/95 dark:bg-stone-900/90 border border-teal-200/90 dark:border-teal-900/80 space-y-2 shadow-xs">
                        <div className="flex items-center gap-1.5 font-bold text-teal-800 dark:text-teal-300 text-[11px]">
                          <Gavel className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                          <span>Rujukan Dasar Regulasi Hukum:</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-teal-50 dark:bg-teal-950/70 border border-teal-200 dark:border-teal-800/80 font-mono text-[11px] text-teal-950 dark:text-teal-200 font-semibold leading-relaxed break-words">
                          <code>{triage.legalPasalBasis}</code>
                        </div>
                      </div>

                      {/* Ringkasan Kasus & Rekomendasi Kategori */}
                      <div className="p-3.5 rounded-xl bg-white/95 dark:bg-stone-900/90 border border-teal-200/90 dark:border-teal-900/80 space-y-2 shadow-xs flex flex-col justify-between">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-teal-800 dark:text-teal-300 text-[11px] flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                              <span>Ringkasan Kasus:</span>
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-medium">
                              Kategori: {triage.categoryRecommendation}
                            </span>
                          </div>
                          <p className="text-[11.5px] text-stone-700 dark:text-stone-300 italic leading-relaxed bg-stone-50 dark:bg-stone-950/60 p-2 rounded-lg border border-stone-200/70 dark:border-stone-800">
                            &ldquo;{triage.summary}&rdquo;
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })()}

              <div className="flex items-center justify-between pt-2">
                <h4 className="font-bold text-xs text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-teal-500" />
                  <span>Daftar Berkas Bukti Digital Terlampir ({report.evidences ? report.evidences.length : 0})</span>
                </h4>
                <span className="text-[11px] text-stone-500 font-mono">
                  Tervalidasi SHA-256 & EXIF Stripped
                </span>
              </div>

              {report.evidences && report.evidences.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {report.evidences.map((ev) => {
                    const isAiManipulated = ev.forensicStatus === 'Manipulated';
                    const triage = getAITriageData(report);
                    const risk = getRiskBadgeConfig(triage.riskLevel);

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

                        {/* Analisis Forensik Multimodal AI */}
                        {(() => {
                          const analysis = liveAnalysisMap[ev.evidenceId] || ev.aiAnalysis;
                          const isScanning = analyzingEvId === ev.evidenceId;

                          if (analysis) {
                            const isHighAuth = analysis.authenticityScore >= 80;
                            const isMedAuth = analysis.authenticityScore >= 50 && analysis.authenticityScore < 80;

                            return (
                              <div className="p-3.5 rounded-xl bg-white dark:bg-stone-950/70 border border-stone-200/80 dark:border-stone-800 space-y-2.5 text-xs">
                                {/* Header Analysis */}
                                <div className="flex items-center justify-between gap-2 flex-wrap border-b border-stone-100 dark:border-stone-800/80 pb-2">
                                  <div className="flex items-center gap-1.5 font-bold text-stone-800 dark:text-stone-200">
                                    <Sparkles className="w-4 h-4 text-teal-500" />
                                    <span>Pemeriksaan Multimodal AI</span>
                                    <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 flex items-center gap-1">
                                      {analysis.mediaType === 'IMAGE' && <ImageIcon className="w-3 h-3" />}
                                      {analysis.mediaType === 'AUDIO' && <Volume2 className="w-3 h-3" />}
                                      {analysis.mediaType === 'VIDEO' && <Video className="w-3 h-3" />}
                                      <span>{analysis.mediaType}</span>
                                    </span>
                                  </div>

                                  <div className="flex items-center gap-1.5">
                                    {/* Authenticity Score Badge */}
                                    <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] border ${
                                      isHighAuth
                                        ? 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-950/80 dark:text-emerald-300 dark:border-emerald-800'
                                        : isMedAuth
                                        ? 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/80 dark:text-amber-300 dark:border-amber-800'
                                        : 'bg-rose-50 text-rose-800 border-rose-300 dark:bg-rose-950/80 dark:text-rose-300 dark:border-rose-800'
                                    }`}>
                                      Keaslian: {analysis.authenticityScore}%
                                    </span>

                                    {/* Tampering Badge */}
                                    <span className={`font-bold text-[10px] px-2 py-0.5 rounded-full ${
                                      analysis.tamperingDetected
                                        ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                                        : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                                    }`}>
                                      {analysis.tamperingDetected ? '⚠ Manipulasi' : '✓ Otentik'}
                                    </span>
                                  </div>
                                </div>

                                {/* Tingkat Risiko & Rujukan Regulasi Terkait Bukti (Standar Notifikasi Telegram) */}
                                <div className="p-2.5 rounded-lg bg-teal-50/70 dark:bg-[#071f1c] border border-teal-200/80 dark:border-teal-900/70 space-y-1.5">
                                  <div className="flex items-center justify-between gap-1.5 flex-wrap">
                                    <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300 flex items-center gap-1">
                                      <Gavel className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                                      Rujukan Dasar Regulasi Terkait Bukti Ini:
                                    </span>
                                    <span className={`px-2 py-0.5 rounded-full text-[9.5px] font-bold border ${risk.badgeCls}`}>
                                      {risk.riskBadge}
                                    </span>
                                  </div>
                                  <div className="text-[10.5px] font-mono text-teal-900 dark:text-teal-200 bg-white dark:bg-teal-950/70 p-1.5 rounded border border-teal-200/60 dark:border-teal-800/60 break-words leading-relaxed">
                                    <code>{triage.legalPasalBasis}</code>
                                  </div>
                                </div>

                                {/* Extracted Text (OCR / Speech-to-Text) */}
                                {analysis.extractedText && (
                                  <div className="space-y-1">
                                    <span className="font-semibold text-stone-500 dark:text-stone-400 text-[10px] uppercase tracking-wider flex items-center gap-1">
                                      <FileText className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                                      Hasil Ekstraksi (OCR / Transkripsi):
                                    </span>
                                    <div className="p-2.5 rounded-lg bg-stone-50 dark:bg-[#07201d] border border-stone-200/80 dark:border-teal-900/60 font-mono text-[11px] text-stone-800 dark:text-stone-200 whitespace-pre-wrap leading-relaxed">
                                      {analysis.extractedText}
                                    </div>
                                  </div>
                                )}

                                {/* Key Findings */}
                                {analysis.keyFindings && analysis.keyFindings.length > 0 && (
                                  <div className="space-y-1">
                                    <span className="font-semibold text-stone-500 dark:text-stone-400 text-[10px] uppercase tracking-wider">
                                      Temuan Kunci Forensik:
                                    </span>
                                    <ul className="space-y-1">
                                      {analysis.keyFindings.map((finding, idx) => (
                                        <li key={idx} className="flex items-start gap-1.5 text-stone-700 dark:text-stone-300 text-[11px] leading-relaxed">
                                          <span className="text-teal-500 mt-1 shrink-0">•</span>
                                          <span>{finding}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}

                                {/* Emotional Context & Tone */}
                                {analysis.emotionalContext && (
                                  <div className="p-2 rounded-lg bg-teal-50/70 dark:bg-teal-950/40 border border-teal-200/70 dark:border-teal-900/50 text-[11px] text-teal-900 dark:text-teal-200 leading-relaxed">
                                    <span className="font-bold">Konteks Emosional & Nada: </span>
                                    <span>{analysis.emotionalContext}</span>
                                  </div>
                                )}

                                {/* Forensic Notes */}
                                {analysis.forensicNotes && (
                                  <div className="text-[10px] text-stone-500 dark:text-stone-400 border-t border-stone-100 dark:border-stone-800 pt-1.5">
                                    <span className="font-bold">Catatan Integritas: </span>
                                    <span>{analysis.forensicNotes}</span>
                                  </div>
                                )}

                                {/* Re-run Button */}
                                <div className="pt-1 flex justify-end">
                                  <button
                                    type="button"
                                    onClick={() => handleRunAiAnalysis(ev)}
                                    disabled={isScanning}
                                    className="px-2.5 py-1 text-[10px] font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950 border border-teal-300 dark:border-teal-800 rounded-md hover:bg-teal-100 dark:hover:bg-teal-900 transition-colors flex items-center gap-1 cursor-pointer disabled:opacity-50"
                                  >
                                    {isScanning ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                                    <span>{isScanning ? 'Memindai Ulang...' : 'Pindai Ulang AI'}</span>
                                  </button>
                                </div>
                              </div>
                            );
                          }

                          // Fallback jika belum dianalisis
                          return (
                            <div className="p-3 rounded-xl bg-white dark:bg-stone-950/70 border border-stone-200/80 dark:border-stone-800 space-y-2 text-xs">
                              {/* Rujukan Regulasi Fallback */}
                              <div className="p-2 rounded-lg bg-teal-50/70 dark:bg-[#071f1c] border border-teal-200/80 dark:border-teal-900/70 space-y-1">
                                <div className="flex items-center justify-between gap-1.5 flex-wrap">
                                  <span className="text-[10px] font-bold uppercase tracking-wider text-teal-800 dark:text-teal-300 flex items-center gap-1">
                                    <Gavel className="w-3 h-3 text-teal-600 dark:text-teal-400" />
                                    Rujukan Dasar Regulasi Terkait:
                                  </span>
                                  <span className={`px-2 py-0.5 rounded-full text-[9.5px] font-bold border ${risk.badgeCls}`}>
                                    {risk.riskBadge}
                                  </span>
                                </div>
                                <div className="text-[10.5px] font-mono text-teal-900 dark:text-teal-200 break-words leading-relaxed">
                                  <code>{triage.legalPasalBasis}</code>
                                </div>
                              </div>

                              <div className="flex items-center justify-between gap-2 pt-1">
                                <span className="font-bold text-stone-700 dark:text-stone-300 flex items-center gap-1.5">
                                  <Sparkles className="w-4 h-4 text-teal-500" />
                                  Pemeriksaan AI Belum Dijalankan
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleRunAiAnalysis(ev)}
                                  disabled={isScanning}
                                  className="px-2.5 py-1 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                                >
                                  {isScanning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                                  <span>{isScanning ? 'Menganalisis Media...' : '⚡ Pindai Forensik AI'}</span>
                                </button>
                              </div>
                              <p className="text-[11px] text-stone-500">
                                Klik tombol di atas untuk menjalankan ekstraksi OCR, transkripsi audio/video, deteksi keaslian, dan audit integritas berkas.
                              </p>
                              {ev.reporterNote && (
                                <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200/60 dark:border-amber-900/40 text-amber-800 dark:text-amber-300 text-[11px] italic leading-relaxed">
                                  Catatan pelapor: &ldquo;{ev.reporterNote}&rdquo;
                                </div>
                              )}
                            </div>
                          );
                        })()}

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
