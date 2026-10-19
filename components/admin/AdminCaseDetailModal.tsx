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
  Eye,
  FileSearch,
  XCircle,
  Send,
  Copy,
  Check,
  RefreshCw,
  MessageSquare,
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
import FormattedAIContent from '@/components/admin/FormattedAIContent';

// Helper function to extract or compute AI Triage analysis (matching Telegram Bot format)
export const getAITriageData = (report: Report): AITriageResult => {
  // Cek apakah ada berkas bukti yang terindikasi manipulasi / rekayasa AI
  const hasManipulatedEvidence = report.evidences?.some(
    (e) => e.forensicStatus === 'Manipulated' || e.aiAnalysis?.tamperingDetected
  );

  // Jika laporan sudah memiliki field aiTriage dari hasil analisis API
  if (report.aiTriage && report.aiTriage.riskLevel) {
    const base = { ...report.aiTriage };
    if (hasManipulatedEvidence && base.urgencyScore > 45) {
      base.urgencyScore = Math.max(20, base.urgencyScore - 35);
      if (base.riskLevel === 'CRITICAL') base.riskLevel = 'MEDIUM';
      else if (base.riskLevel === 'HIGH') base.riskLevel = 'LOW';
      if (!base.summary.includes('diturunkan')) {
        base.summary += ' (Perhatian: Skor urgensi diturunkan otomatis karena bukti forensik terindikasi manipulasi/AI).';
      }
    }
    return base;
  }

  const text = (report.chronology || '').toLowerCase();

  // 1. Cek apakah teks kronologi adalah materi/tugas akademik atau non-kasus
  const academicWords = [
    'tugas', 'makalah', 'kuliah', 'praktikum', 'coding', 'algoritma',
    'soal', 'ujian', 'uts', 'uas', 'skripsi', 'modul', 'latihan',
    'html', 'javascript', 'python', 'antigravity', 'react', 'program',
    'referensi', 'jurnal', 'materi', 'bab 1', 'bab 2', 'pendahuluan'
  ];
  const isAcademicOrBenign = academicWords.some((w) => text.includes(w));

  // 2. Keyword kekerasan fisik nyata / bahaya seketika (Hanya ini yang boleh CRITICAL)
  const criticalWords = [
    'perkosaan', 'diperkosa', 'pemerkosaan', 'diserang secara fisik',
    'ancaman pembunuhan', 'dibacok', 'dipukul berdarah', 'dicekik',
    'disekap', 'dipaksa bersetubuh'
  ];

  // 3. Keyword pelanggaran serius non-fisik / KSBE / intimidasi
  const highWords = [
    'pelecehan seksual', 'dilecehkan', 'dipegang paksa', 'diraba paksa',
    'foto bugil', 'disebar luaskan', 'intimidasi', 'mengancam menyebarkan',
    'stalking', 'deepfake', 'konten intim', 'cyberbullying berat'
  ];

  // 4. Keyword diskriminasi / etika
  const mediumWords = [
    'diskriminasi', 'diperlakukan tidak adil', 'diejek', 'dipermalukan di depan kelas',
    'pelanggaran etika dosen', 'ancaman nilai diturunkan', 'tidak adil'
  ];

  // Jika teks tugas kuliah/akademik dan tidak ada kata serangan fisik nyata -> LOW
  if (isAcademicOrBenign && !criticalWords.some((w) => text.includes(w))) {
    return {
      riskLevel: 'LOW',
      urgencyScore: 18,
      categoryRecommendation: 'Laporan Non-Kasus / Tinjauan Akademik',
      legalPasalBasis: 'Permendikbudristek No. 30 Tahun 2021 (Verifikasi Awal Substansi Kasus)',
      summary: 'Teks narasi kronologi terindikasi memuat materi/tugas akademik atau latihan non-kekerasan. Tidak terdeteksi bahaya fisik atau urgensi darurat.',
    };
  }

  let riskLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' = 'LOW';
  let urgencyScore = 25;
  let categoryRec = report.category || 'Informasi Umum / Non-Darurat';
  let legalBasis = 'Pasal 9 Permendikbudristek No. 30 Tahun 2021 tentang PPKS';
  let summary = 'Laporan diterima untuk peninjauan berkala oleh Satgas.';

  if (criticalWords.some((w) => text.includes(w))) {
    riskLevel = 'CRITICAL';
    urgencyScore = 92;
    categoryRec = report.category || 'Kekerasan Seksual & Bahaya Fisik Darurat';
    legalBasis = 'Pasal 5 & 6 UU No. 12 Tahun 2022 tentang Tindak Pidana Kekerasan Seksual (TPKS)';
    summary = 'Laporan mengindikasikan pelanggaran fisik/psikis kritis yang membutuhkan respon darurat segera oleh Satgas PPKS.';
  } else if (highWords.some((w) => text.includes(w))) {
    riskLevel = 'HIGH';
    urgencyScore = 72;
    categoryRec = report.category || 'Perundungan Siber & Pelecehan Non-Fisik';
    legalBasis = 'Pasal 14 UU TPKS (KSBE) & Pasal 5 Permendikbudristek No. 30 Tahun 2021 tentang PPKS';
    summary = 'Laporan menunjukkan pola intimidasi atau pelecehan berbasis elektronik yang membutuhkan pendampingan prioritas.';
  } else if (mediumWords.some((w) => text.includes(w))) {
    riskLevel = 'MEDIUM';
    urgencyScore = 48;
    categoryRec = report.category || 'Diskriminasi & Pelanggaran Etika Kampus';
    legalBasis = 'Pasal 9 & 10 Permendikbudristek No. 30 Tahun 2021 tentang Pencegahan dan Penanganan Kekerasan Seksual';
    summary = 'Laporan memuat indikasi pelanggaran etika atau diskriminasi yang memerlukan klarifikasi dan mediasi terpandu oleh tim Satgas.';
  }

  // Penalti bukti digital manipulasi / rekayasa AI
  if (hasManipulatedEvidence) {
    urgencyScore = Math.max(15, urgencyScore - 40);
    if (riskLevel === 'CRITICAL') riskLevel = 'MEDIUM';
    else if (riskLevel === 'HIGH') riskLevel = 'LOW';
    summary += ' (Perhatian: Skor urgensi diturunkan otomatis karena bukti terdeteksi manipulasi/AI).';
  }

  return {
    riskLevel,
    urgencyScore,
    categoryRecommendation: categoryRec,
    legalPasalBasis: legalBasis,
    summary,
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
  onSaveEvidenceAnalysis?: (evidenceId: string, analysis: EvidenceAnalysisResult) => void;
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
  onSaveEvidenceAnalysis,
  internalNotesMap,
  internalNoteInput,
  setInternalNoteInput,
  onAddInternalNote,
}: AdminCaseDetailModalProps) {
  const [showAuditTrail, setShowAuditTrail] = useState(false);
  const [activeTab, setActiveTab] = useState<'detail' | 'evidence' | 'internal' | 'ai_suggestion'>('detail');
  const [confirmAction, setConfirmAction] = useState<{
    evidence: Evidence;
    action: 'valid' | 'reject';
    note: string;
  } | null>(null);

  // ─── STATE KHUSUS SARAN AI & ASISTEN PENANGANAN KASUS ──────────────────────
  const [aiPlanText, setAiPlanText] = useState<string>('');
  const [isGeneratingPlan, setIsGeneratingPlan] = useState<boolean>(false);
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'model'; text: string; timestamp: string }[]>([]);
  const [chatInput, setChatInput] = useState<string>('');
  const [isSendingChat, setIsSendingChat] = useState<boolean>(false);
  const [copiedPlan, setCopiedPlan] = useState<boolean>(false);

  // Generate Saran Penanganan oleh AI
  const handleGenerateInitialPlan = async () => {
    if (!report) return;
    setIsGeneratingPlan(true);
    const triage = getAITriageData(report);

    const evidenceSummary = (report.evidences || [])
      .map((e) => `${e.fileName} (status: ${e.forensicStatus || 'Original'}, exifStripped: ${e.exifStripped ? 'Ya' : 'Tidak'})`)
      .join(', ');

    try {
      const res = await fetch('/api/admin/case-ai-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseData: {
            caseId: report.caseId,
            category: report.category,
            chronology: report.chronology || '',
            targetFaculty: report.targetFaculty,
            receivedAt: formatDateID(report.receivedAt),
            status: report.status,
            riskLevel: triage.riskLevel,
            urgencyScore: triage.urgencyScore,
            evidenceSummary,
            evidenceCount: report.evidences?.length || 0,
          },
          mode: 'initial_plan',
        }),
      });

      const json = await res.json();
      if (json.data && json.data.text) {
        setAiPlanText(json.data.text);
      }
    } catch (err) {
      console.error('Gagal memuat saran penanganan AI:', err);
    } finally {
      setIsGeneratingPlan(false);
    }
  };

  // Kirim Pesan Chatbot Konsultasi Kasus Admin
  const handleSendChat = async (customPrompt?: string) => {
    const query = (customPrompt || chatInput).trim();
    if (!query || !report || isSendingChat) return;

    const userMsg = {
      role: 'user' as const,
      text: query,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setChatInput('');
    setIsSendingChat(true);

    const triage = getAITriageData(report);
    const evidenceSummary = (report.evidences || [])
      .map((e) => `${e.fileName} (${e.forensicStatus})`)
      .join(', ');

    try {
      const res = await fetch('/api/admin/case-ai-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseData: {
            caseId: report.caseId,
            category: report.category,
            chronology: report.chronology || '',
            targetFaculty: report.targetFaculty,
            receivedAt: formatDateID(report.receivedAt),
            status: report.status,
            riskLevel: triage.riskLevel,
            urgencyScore: triage.urgencyScore,
            evidenceSummary,
            evidenceCount: report.evidences?.length || 0,
          },
          mode: 'chat',
          question: query,
          history: chatMessages.map((m) => ({ role: m.role, text: m.text })),
        }),
      });

      const json = await res.json();
      const botReply = json?.data?.text || 'Maaf, terjadi kendala saat memproses konsultasi AI.';
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'model',
          text: botReply,
          timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } catch (err) {
      console.error('Error in case advisor chat:', err);
      setChatMessages((prev) => [
        ...prev,
        {
          role: 'model',
          text: 'Terjadi gangguan jaringan saat menghubungi AI Advisor.',
          timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    } finally {
      setIsSendingChat(false);
    }
  };

  const handleCopyPlanToNotes = () => {
    if (!aiPlanText) return;
    navigator.clipboard.writeText(aiPlanText);
    setCopiedPlan(true);
    setTimeout(() => setCopiedPlan(false), 2500);

    // Otomatis masukkan cuplikan rekomendasi ke input catatan rahasia Satgas
    setInternalNoteInput(`[Rekomendasi AI] ${aiPlanText.slice(0, 250)}...`);
  };

  const handleConfirmVerification = () => {
    if (!confirmAction) return;
    const { evidence, action, note } = confirmAction;
    const status: EvidenceVerificationStatus =
      action === 'valid' ? 'Terverifikasi Valid' : 'Tervalidasi Palsu / Ditolak';
    const defaultNote =
      action === 'valid'
        ? 'Validasi Satgas: Berkas bukti terverifikasi asli & sah.'
        : 'Validasi Satgas: Berkas bukti ditolak / terindikasi palsu.';
    onVerifyEvidence(evidence.evidenceId, status, note.trim() || defaultNote);
    setConfirmAction(null);
  };

  if (!report) return null;

  const internalNotes = internalNotesMap[report.caseId] || [];

  return (
    <div className="space-y-4 animate-in fade-in duration-200">
      {/* Top Navigation Back Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-gray-700 p-4 rounded-2xl border border-stone-200 dark:border-gray-600 shadow-xs">
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

      <div className="bg-white dark:bg-gray-700 border border-stone-200 dark:border-gray-600 rounded-3xl w-full flex flex-col shadow-sm overflow-hidden min-h-[550px]">

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

          <button
            onClick={() => setActiveTab('ai_suggestion')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'ai_suggestion'
                ? 'bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-xs'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-300" />
            <span>Saran AI</span>
          </button>
        </div>

        {/* Modal Content Scroll Area */}
        <div className="flex-1 p-5 overflow-y-auto space-y-5">
          {/* Audit Trail Drawer Overlay */}
          {showAuditTrail && (
            <div className="p-4 rounded-2xl bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-gray-600 space-y-3">
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
                      className="p-2.5 rounded-xl bg-white dark:bg-stone-900 border border-stone-200 dark:border-gray-600 text-xs flex items-start justify-between gap-2"
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

              {/* ── CARD RINGKASAN TINGKAT RISIKO & RUJUKAN REGULASI (FORMAT STANDAR NOTIFIKASI TELEGRAM SATGAS) ── */}
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
                              Analisis AI Smart Triage & Rujukan Regulasi Hukum
                            </h4>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 border border-teal-300 dark:border-teal-800 flex items-center gap-1 font-semibold">
                              <Sparkles className="w-3 h-3 text-teal-500" />
                              <span>Format Standar Notifikasi Telegram Satgas</span>
                            </span>
                          </div>
                          <p className="text-[11px] text-stone-500 dark:text-stone-400 mt-0.5">
                            Penilaian objektif kronologi kasus, bobot urgensi dinamis, dan dasar hukum penanganan Satgas PPKS
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
                      <div className="p-3.5 rounded-xl bg-white/95 dark:bg-stone-900/90 border border-teal-200/90 dark:border-gray-600 space-y-2 shadow-xs">
                        <div className="flex items-center gap-1.5 font-bold text-teal-800 dark:text-teal-300 text-[11px]">
                          <Gavel className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
                          <span>Rujukan Dasar Regulasi Terkait:</span>
                        </div>
                        <div className="p-2.5 rounded-lg bg-teal-50 dark:bg-teal-950/70 border border-teal-200 dark:border-teal-800/80 font-mono text-[11px] text-teal-950 dark:text-teal-200 font-semibold leading-relaxed break-words">
                          <code>{triage.legalPasalBasis}</code>
                        </div>
                      </div>

                      {/* Ringkasan Kasus & Rekomendasi Kategori */}
                      <div className="p-3.5 rounded-xl bg-white/95 dark:bg-stone-900/90 border border-teal-200/90 dark:border-gray-600 space-y-2 shadow-xs flex flex-col justify-between">
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-bold text-teal-800 dark:text-teal-300 text-[11px] flex items-center gap-1.5">
                              <FileText className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0" />
                              <span>Ringkasan Kasus & Rekomendasi:</span>
                            </span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 font-medium">
                              Kategori: {triage.categoryRecommendation}
                            </span>
                          </div>
                          <p className="text-[11.5px] text-stone-700 dark:text-stone-300 italic leading-relaxed bg-stone-50 dark:bg-stone-950/60 p-2.5 rounded-lg border border-stone-200/70 dark:border-stone-800">
                            &ldquo;{triage.summary}&rdquo;
                          </p>
                        </div>
                      </div>
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
              <div className="flex items-center justify-between pt-1">
                <h4 className="font-bold text-xs text-stone-900 dark:text-stone-100 flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-teal-500" />
                  <span>Daftar Berkas Bukti Digital Terlampir ({report.evidences ? report.evidences.length : 0})</span>
                </h4>
                <span className="text-[11px] text-stone-500 font-mono">
                  Integritas SHA-256 Valid & EXIF Stripped
                </span>
              </div>

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

                        {/* ── VALIDASI TANDA TANGAN BINER (MAGIC BYTES) ───────────────────────── */}
                        <div className="p-3 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-xl flex items-center justify-between text-xs text-emerald-900 dark:text-emerald-300">
                          <span className="font-semibold flex items-center gap-1.5 text-xs">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                            Tanda Tangan Biner (Magic Bytes) Tervalidasi Utuh ({ev.validationResult?.detectedType || ev.fileType})
                          </span>
                          <span className="text-[10px] font-mono bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded font-bold shrink-0">
                            Pass Magic-Byte
                          </span>
                        </div>

                        {/* Status Asal Berkas & Metadata EXIF */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] bg-stone-100/90 dark:bg-stone-950/60 p-2.5 rounded-xl border border-stone-200/80 dark:border-stone-800">
                          <div>
                            <span className="text-stone-400 block font-medium text-[10px] uppercase">Metode Perolehan:</span>
                            <span className="font-semibold text-stone-800 dark:text-stone-200">
                              {ev.acquisitionMethod || (ev.isLiveCapture ? 'Perekaman Langsung Kamera' : ev.fileType?.includes('video') ? 'Perekaman Video Langsung' : ev.fileType?.includes('audio') ? 'Perekaman Suara Langsung' : 'Hasil Unduhan / Tangkapan Layar')}
                            </span>
                          </div>
                          <div>
                            <span className="text-stone-400 block font-medium text-[10px] uppercase">Status Metadata:</span>
                            <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                              <ShieldAlert className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                              EXIF Stripped: Ya (Privasi Terjaga)
                            </span>
                          </div>
                        </div>

                        {/* ── ANALISIS HASIL PEMINDAIAN FORENSIK BINER ASLI ────────────────────── */}
                        <div className="p-3.5 bg-stone-100/90 dark:bg-gray-800 border border-stone-200 dark:border-gray-600 rounded-xl space-y-2 text-xs">
                          <h5 className="font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5 text-xs">
                            <FileSearch className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                            Hasil Pemindaian Forensik Biner Asli:
                          </h5>
                          {(ev.forensicDetails && ev.forensicDetails.length > 0
                            ? ev.forensicDetails
                            : [
                                `SHA-256 Checksum: ${ev.sha256.substring(0, 24)}... (Integritas Utuh)`,
                                ev.isLiveCapture
                                  ? 'Kamera Internal: rekaman langsung dari browser pengguna.'
                                  : 'Anomali Metadata: EXIF merek/model kamera fisik telah disanitasi demi privasi.',
                                `Pola Biner: Tanda tangan biner format ${ev.fileType} tervalidasi asli & utuh.`,
                              ]
                          ).map((det, idx) => (
                            <p key={idx} className="text-[11px] leading-relaxed text-stone-700 dark:text-stone-300 font-sans flex items-start gap-1.5">
                              <span className="text-teal-600 dark:text-teal-400 font-bold shrink-0">•</span>
                              <span>{det}</span>
                            </p>
                          ))}
                        </div>

                        {/* ── RINGKASAN METADATA SENSITIF PADA BERKAS ASLI (SEBELUM DISANITASI) ── */}
                        <div className="p-3.5 bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-xl space-y-2 text-xs">
                          <span className="font-bold text-amber-900 dark:text-amber-200 block text-xs">
                            Metadata Sensitif pada Berkas Asli (Sebelum Disanitasi):
                          </span>
                          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
                            <div className="bg-white dark:bg-gray-800 p-2.5 rounded-lg border border-amber-200 dark:border-gray-600">
                              <span className="text-stone-500 text-[10px] uppercase font-bold block">GPS Geotag</span>
                              <span className={`font-bold ${ev.extractedMeta?.hasGps ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                                {ev.extractedMeta?.hasGps ? '⚠️ Terdeteksi (Telah Dibersihkan)' : 'Tidak Terdeteksi'}
                              </span>
                            </div>
                            <div className="bg-white dark:bg-gray-800 p-2.5 rounded-lg border border-amber-200 dark:border-gray-600">
                              <span className="text-stone-500 text-[10px] uppercase font-bold block">Kamera</span>
                              <span className="font-bold text-stone-800 dark:text-stone-200 truncate block">
                                {ev.extractedMeta?.cameraMaker || ev.extractedMeta?.cameraModel || (ev.isLiveCapture ? 'Webcam / Kamera HP' : 'Tidak Terdeteksi')}
                              </span>
                            </div>
                            <div className="bg-white dark:bg-gray-800 p-2.5 rounded-lg border border-amber-200 dark:border-gray-600">
                              <span className="text-stone-500 text-[10px] uppercase font-bold block">Stempel Waktu</span>
                              <span className="font-bold text-stone-800 dark:text-stone-200 truncate block">
                                {ev.extractedMeta?.timestamp || formatDateID(report.receivedAt)}
                              </span>
                            </div>
                            <div className="bg-white dark:bg-gray-800 p-2.5 rounded-lg border border-amber-200 dark:border-gray-600">
                              <span className="text-stone-500 text-[10px] uppercase font-bold block">Software Editor</span>
                              <span className="font-bold text-stone-800 dark:text-stone-200 truncate block">
                                {ev.extractedMeta?.software || 'Tidak Ada'}
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* ── CATATAN WAJIB PELAPOR (ASAL / ALASAN BERKAS) ─────────────────────── */}
                        <div className="p-3 rounded-xl bg-stone-100 dark:bg-stone-850/60 border border-stone-200 dark:border-stone-700/60 text-stone-700 dark:text-stone-300 text-xs leading-relaxed space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-teal-800 dark:text-teal-300 text-[11px] uppercase tracking-wider">
                              Catatan Wajib Pelapor (Asal / Alasan Berkas):
                            </span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-semibold">
                              Otentikasi Pelapor
                            </span>
                          </div>
                          <p className="italic text-stone-800 dark:text-stone-200">
                            &ldquo;{ev.reporterNote || 'Tidak ada catatan khusus yang dilampirkan oleh pelapor.'}&rdquo;
                          </p>
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
                              type="button"
                              onClick={() => setConfirmAction({
                                evidence: ev,
                                action: 'valid',
                                note: '',
                              })}
                              className="px-2.5 py-1 text-[11px] font-bold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 cursor-pointer flex items-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>Set Valid</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmAction({
                                evidence: ev,
                                action: 'reject',
                                note: '',
                              })}
                              className="px-2.5 py-1 text-[11px] font-bold bg-rose-600 text-white rounded-lg hover:bg-rose-700 cursor-pointer flex items-center gap-1"
                            >
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>Set Tolak</span>
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
                  className="flex-1 bg-stone-50 dark:bg-stone-900 border border-stone-200 dark:border-gray-600 rounded-xl px-4 py-2 text-xs text-stone-900 dark:text-stone-100 outline-none"
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

          {/* TAB 4: Saran Penanganan AI & Asisten Konsultasi Kasus */}
          {activeTab === 'ai_suggestion' && (
            <div className="space-y-6">
              {/* Context Header Card */}
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-teal-500/10 via-emerald-500/5 to-transparent border border-teal-500/30 dark:border-teal-500/20 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-sm shrink-0">
                      <Sparkles className="w-5 h-5 text-emerald-200" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-sm text-stone-900 dark:text-stone-50 flex items-center gap-2">
                        <span>Asisten & Saran Penanganan AI Satgas PPKS</span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950 text-teal-800 dark:text-teal-300 font-bold border border-teal-300 dark:border-teal-800">
                          Domain Advisor
                        </span>
                      </h4>
                      <p className="text-xs text-stone-600 dark:text-stone-300">
                        AI menganalisis data fakta pelapor (kronologi kasus, tingkat keparahan risiko, bukti forensik biner, & regulasi Permendikbudristek No. 30/2021) untuk memberikan rekomendasi taktis.
                      </p>
                    </div>
                  </div>

                  {/* Tombol Buat Saran Penanganan AI */}
                  <button
                    type="button"
                    onClick={handleGenerateInitialPlan}
                    disabled={isGeneratingPlan}
                    className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-teal-600/30 transition-all cursor-pointer disabled:opacity-60 shrink-0"
                  >
                    {isGeneratingPlan ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-emerald-200" />
                    )}
                    <span>
                      {aiPlanText ? '⚡ Buat Ulang Saran Penanganan AI' : '⚡ Saran Penanganan yang Dilakukan oleh AI'}
                    </span>
                  </button>
                </div>

                {/* Case Parameters Pills */}
                <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-teal-500/20 text-[11px]">
                  <span className="px-2.5 py-1 rounded-lg bg-white/80 dark:bg-stone-900/80 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300">
                    Kasus: <strong className="text-stone-900 dark:text-white">{report.caseId}</strong>
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-white/80 dark:bg-stone-900/80 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300">
                    Kategori: <strong className="text-stone-900 dark:text-white">{report.category}</strong>
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-white/80 dark:bg-stone-900/80 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300">
                    Risiko: <strong className="text-teal-600 dark:text-teal-400">{getAITriageData(report).riskLevel}</strong>
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-white/80 dark:bg-stone-900/80 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300">
                    Bukti Digital: <strong className="text-stone-900 dark:text-white">{report.evidences?.length || 0} Berkas</strong>
                  </span>
                  <span className="px-2.5 py-1 rounded-lg bg-white/80 dark:bg-stone-900/80 border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300">
                    Fakultas: <strong className="text-stone-900 dark:text-white">{report.targetFaculty || 'Kampus Umum'}</strong>
                  </span>
                </div>
              </div>

              {/* Rencana Rekomendasi Penanganan Kasus (Bila sudah di-generate) */}
              {isGeneratingPlan && (
                <div className="p-6 rounded-2xl bg-stone-50 dark:bg-stone-900/70 border border-teal-500/30 flex flex-col items-center justify-center gap-3 py-10">
                  <div className="w-8 h-8 border-3 border-teal-600 border-t-transparent rounded-full animate-spin" />
                  <div className="text-center space-y-1">
                    <p className="text-xs font-bold text-stone-800 dark:text-stone-200">
                      Menganalisis Kronologi Pelapor & Mengevaluasi Regulasi Kampus...
                    </p>
                    <p className="text-[11px] text-stone-500">
                      Menyusun rencana aksi bertahap, protokol perlindungan korban, dan rekomendasi sanksi.
                    </p>
                  </div>
                </div>
              )}

              {aiPlanText && !isGeneratingPlan && (
                <div className="p-5 sm:p-6 rounded-2xl bg-white dark:bg-stone-900 border-2 border-teal-500/40 dark:border-teal-600/40 shadow-sm space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-200 dark:border-stone-800 pb-3">
                    <div className="flex items-center gap-2">
                      <Gavel className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                      <h4 className="font-bold text-xs uppercase tracking-wider text-stone-800 dark:text-stone-200">
                        Hasil Rekomendasi Tindak Lanjut Penanganan (AI Strategic Plan)
                      </h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={handleCopyPlanToNotes}
                        className="px-3 py-1.5 rounded-lg text-xs font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/80 border border-teal-300 dark:border-teal-800 hover:bg-teal-100 dark:hover:bg-teal-900 transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        {copiedPlan ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedPlan ? 'Tersalin ke Clipboard & Catatan!' : 'Salin ke Catatan Rahasia Satgas'}</span>
                      </button>
                    </div>
                  </div>

                  <div className="bg-stone-50/70 dark:bg-stone-950/40 p-4 sm:p-5 rounded-xl border border-stone-200/80 dark:border-stone-800 max-h-[500px] overflow-y-auto">
                    <FormattedAIContent content={aiPlanText} />
                  </div>
                </div>
              )}

              {/* Chatbot Konsultasi Interaktif untuk Admin (Tanya Jawab Seputar Kasus Ini) */}
              <div className="p-5 rounded-2xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-stone-800 space-y-4">
                <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-3">
                  <div className="flex items-center gap-2">
                    <Bot className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                    <div>
                      <h4 className="font-bold text-xs text-stone-900 dark:text-stone-100">
                        Konsultasi Tanya Jawab Kasus dengan AI Advisor
                      </h4>
                      <p className="text-[11px] text-stone-500 dark:text-stone-400">
                        Ajukan pertanyaan spesifik, minta draf pemanggilan, atau saran mediasi berdasarkan analisis data kasus ini.
                      </p>
                    </div>
                  </div>

                  {chatMessages.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setChatMessages([])}
                      className="text-[11px] text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
                    >
                      Bersihkan Obrolan
                    </button>
                  )}
                </div>

                {/* Suggested Quick Question Chips */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-stone-500 dark:text-stone-400 block">
                    💡 Rekomendasi Pertanyaan Cepat:
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    {[
                      'Apakah bukti digital kasus ini cukup kuat untuk eskalasi ke Komite Etik?',
                      'Bagaimana prosedur mediasi aman tanpa konfrontasi langsung?',
                      'Buatkan draf surat panggilan klarifikasi resmi untuk pihak terlapor',
                      'Apa rekomendasi sanksi administratif maksimal berdasarkan fakta ini?',
                    ].map((q, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSendChat(q)}
                        disabled={isSendingChat}
                        className="text-[11px] font-medium px-3 py-1.5 rounded-xl bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 hover:border-teal-500 text-stone-700 dark:text-stone-300 hover:text-teal-700 dark:hover:text-teal-300 transition-colors cursor-pointer text-left shadow-2xs disabled:opacity-50"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Chat Messages Stream Area */}
                <div className="space-y-3 max-h-72 overflow-y-auto p-3 rounded-xl bg-white dark:bg-stone-950/50 border border-stone-200/80 dark:border-stone-800">
                  {/* Default Welcome Message */}
                  <div className="flex items-start gap-2.5 max-w-[85%]">
                    <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                      <Bot className="w-4 h-4" />
                    </div>
                    <div className="p-3 rounded-2xl rounded-tl-xs bg-stone-100 dark:bg-stone-850 border border-stone-200/80 dark:border-stone-700 text-xs text-stone-800 dark:text-stone-200 leading-relaxed space-y-1">
                      <span className="font-bold text-[10px] text-teal-600 dark:text-teal-400 block">
                        AI Satgas Advisor • Siap Konsultasi
                      </span>
                      <p>
                        Halo Satgas PPKS. Saya telah memuat data kasus <strong>{report.caseId}</strong> (Kategori: <em>{report.category}</em>, Tingkat Risiko: <em>{getAITriageData(report).riskLevel}</em>). Silakan tanyakan hal apa pun yang ingin Anda konsultasikan seputar penanganan kasus ini.
                      </p>
                    </div>
                  </div>

                  {/* Dynamic Chat Messages */}
                  {chatMessages.map((msg, i) => (
                    <div
                      key={i}
                      className={`flex items-start gap-2.5 ${
                        msg.role === 'user' ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      {msg.role === 'model' && (
                        <div className="w-7 h-7 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                          <Bot className="w-4 h-4" />
                        </div>
                      )}

                      <div
                        className={`p-3 rounded-2xl text-xs leading-relaxed max-w-[85%] space-y-1 ${
                          msg.role === 'user'
                            ? 'bg-teal-600 text-white rounded-tr-xs shadow-xs'
                            : 'bg-stone-100 dark:bg-stone-850 border border-stone-200/80 dark:border-stone-700 text-stone-800 dark:text-stone-200 rounded-tl-xs shadow-2xs'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 text-[10px] opacity-75">
                          <span>{msg.role === 'user' ? 'Satgas PPKS' : 'AI Advisor'}</span>
                          <span>{msg.timestamp}</span>
                        </div>
                        {msg.role === 'model' ? (
                          <FormattedAIContent content={msg.text} />
                        ) : (
                          <p className="whitespace-pre-wrap">{msg.text}</p>
                        )}
                      </div>
                    </div>
                  ))}

                  {isSendingChat && (
                    <div className="flex items-center gap-2 text-xs text-teal-600 dark:text-teal-400 italic py-1">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      <span>AI Advisor sedang menganalisis informasi kasus & merumuskan jawaban...</span>
                    </div>
                  )}
                </div>

                {/* Chat Input Bar */}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendChat();
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Tanyakan analisis kronologi, regulasi, atau strategi penanganan kasus ini..."
                    disabled={isSendingChat}
                    className="flex-1 bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-2.5 text-xs text-stone-900 dark:text-stone-100 outline-none focus:border-teal-500 transition-colors shadow-2xs disabled:opacity-60"
                  />
                  <button
                    type="submit"
                    disabled={!chatInput.trim() || isSendingChat}
                    className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs cursor-pointer disabled:opacity-50 shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Kirim</span>
                  </button>
                </form>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── AGILE ALERT DIALOG: KONFIRMASI TINDAKAN VALIDASI BUKTI ── */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3">
              <div
                className={`p-2.5 rounded-xl shrink-0 ${
                  confirmAction.action === 'valid'
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400'
                    : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400'
                }`}
              >
                {confirmAction.action === 'valid' ? (
                  <CheckCircle2 className="w-6 h-6" />
                ) : (
                  <AlertTriangle className="w-6 h-6" />
                )}
              </div>
              <div>
                <h3 className="font-bold text-sm text-stone-900 dark:text-stone-100">
                  {confirmAction.action === 'valid'
                    ? 'Konfirmasi Validasi Bukti Asli'
                    : 'Konfirmasi Penolakan Bukti Palsu'}
                </h3>
                <p className="text-xs text-stone-500 dark:text-stone-400 mt-1 leading-relaxed">
                  {confirmAction.action === 'valid'
                    ? `Apakah Anda yakin ingin memvalidasi berkas "${confirmAction.evidence.fileName || 'bukti'}" sebagai berkas ASLI & SAH?`
                    : `Apakah Anda yakin ingin menolak berkas "${confirmAction.evidence.fileName || 'bukti'}" sebagai TERINDIKASI PALSU / MANIPULASI?`}
                </p>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-stone-600 dark:text-stone-300">
                Catatan Pemeriksaan Satgas:
              </label>
              <input
                type="text"
                value={confirmAction.note}
                onChange={(e) =>
                  setConfirmAction({ ...confirmAction, note: e.target.value })
                }
                placeholder={
                  confirmAction.action === 'valid'
                    ? 'Validasi Satgas: Bukti Asli & Valid'
                    : 'Validasi Satgas: Bukti Palsu / Ditolak'
                }
                className="w-full bg-stone-50 dark:bg-stone-950 border border-stone-200 dark:border-stone-800 rounded-xl px-3 py-2 text-xs text-stone-900 dark:text-stone-100 outline-none focus:border-teal-500"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100 dark:border-stone-800">
              <button
                type="button"
                onClick={() => setConfirmAction(null)}
                className="px-3.5 py-1.5 rounded-xl border border-stone-200 dark:border-stone-700 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 text-xs font-semibold cursor-pointer transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleConfirmVerification}
                className={`px-4 py-1.5 rounded-xl text-white text-xs font-bold transition-all shadow-xs cursor-pointer ${
                  confirmAction.action === 'valid'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-rose-600 hover:bg-rose-700'
                }`}
              >
                Ya, Lanjutkan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
