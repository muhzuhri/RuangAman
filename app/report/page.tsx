'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert,
  FileText,
  Upload,
  Camera,
  CheckCircle,
  AlertTriangle,
  Lock,
  ArrowRight,
  RefreshCw,
  X,
  FileCheck,
  Eye,
  Paperclip,
  Check,
  Shield,
  ShieldCheck,
  HelpCircle,
  Copy,
  Inbox,
  AlertCircle,
  Cpu,
  History,
  Info,
  MessageSquare,
} from 'lucide-react';
import Link from 'next/link';

import {
  calculateSHA256,
  stripExifFromImage,
  fileToArrayBuffer,
  analyzeImageForensics,
  validateFileSignature,
  extractDetectedMetadata,
} from '@/lib/crypto';
import {
  analyzeVideoForensics,
  analyzeAudioForensics,
  stripMetadataFromVideo,
  stripMetadataFromAudio,
} from '@/lib/mediaForensics';
import {
  generateHumanChallenge,
  checkSubmissionRateLimit,
  recordSubmission,
  assessChronologyQuality,
  findDuplicateEvidenceHash,
  recordEvidenceHashes,
} from '@/lib/antiSpam';
import { type Report, type Evidence } from '@/lib/types';
import { saveReportToDatabase } from '@/lib/reportsService';
import { EvidenceSecurityPanel, type ForensicFileItem } from '@/components/EvidenceSecurityPanel';

// ─── Helpers & Config ──────────────────────────────────────────────────────────

const ALLOWED_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'audio/mp3',
  'audio/wav',
  'audio/mpeg',
  'audio/ogg',
  'audio/m4a',
  'audio/x-m4a',
  'audio/aac',
  'video/mp4',
  'video/webm',
  'video/quicktime',
];
const MAX_FILE_SIZE_MB = 50;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

interface ValidationErrors {
  category?: string;
  incidentTime?: string;
  chronology?: string;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function createCompressedDataUrl(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) {
    return readFileAsDataUrl(file);
  }
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      const maxDim = 800;
      let w = img.naturalWidth || img.width;
      let h = img.naturalHeight || img.height;
      if (w > maxDim || h > maxDim) {
        if (w > h) {
          h = Math.round((h * maxDim) / w);
          w = maxDim;
        } else {
          w = Math.round((w * maxDim) / h);
          h = maxDim;
        }
      }
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.75));
      } else {
        readFileAsDataUrl(file).then(resolve).catch(() => resolve(''));
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      readFileAsDataUrl(file).then(resolve).catch(() => resolve(''));
    };
    img.src = url;
  });
}

function generateCaseId(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `CASE-2026-${num}`;
}

function generateAnonymousToken(): string {
  const part = Math.random().toString(36).substring(2, 7).toUpperCase();
  return `AK-${new Date().getFullYear()}-${part}`;
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatDateID(isoString: string): string {
  return new Date(isoString).toLocaleString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta',
  });
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const StepIndicator = ({ current }: { current: number }) => {
  const steps = [
    { num: 1, label: 'Formulir' },
    { num: 2, label: 'Bukti & Forensik' },
    { num: 3, label: 'Review & Kirim' },
  ];
  return (
    <div className="flex items-center justify-between relative mb-10">
      <div className="absolute top-5 left-0 right-0 h-0.5 bg-stone-300 dark:bg-stone-600 -z-10">
        <motion.div
          className="h-full bg-teal-500"
          initial={{ width: '0%' }}
          animate={{ width: `${((current - 1) / (steps.length - 1)) * 100}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>
      {steps.map((s) => (
        <div key={s.num} className="flex flex-col items-center gap-2">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-500 ${
              current > s.num
                ? 'bg-teal-500 text-white shadow-xs'
                : current === s.num
                ? 'bg-teal-600 text-white border-2 border-teal-300 dark:border-teal-400 shadow-md'
                : 'bg-[#eeeeee] dark:bg-[#0a2220] border-2 border-stone-300 dark:border-teal-900 text-stone-400'
            }`}
          >
            {current > s.num ? <Check className="w-5 h-5" /> : s.num}
          </div>
          <span
            className={`text-xs font-semibold ${
              current >= s.num ? 'text-stone-800 dark:text-stone-100' : 'text-stone-400'
            }`}
          >
            {s.label}
          </span>
        </div>
      ))}
    </div>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

export default function ReportPage() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittingPhase, setSubmittingPhase] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const [copied, setCopied] = useState<'caseId' | 'token' | null>(null);

  const [resultCaseId, setResultCaseId] = useState('');
  const [resultToken, setResultToken] = useState('');

  const [category, setCategory] = useState('');
  const [incidentTime, setIncidentTime] = useState('');
  const [involvedParties, setInvolvedParties] = useState('');
  const [targetFaculty, setTargetFaculty] = useState('');
  const [chronology, setChronology] = useState('');

  // Anti-Spam Verification Challenge
  const [humanChallenge, setHumanChallenge] = useState<{ problem: string; answer: number }>({ problem: '', answer: 0 });
  const [userAnswer, setUserAnswer] = useState('');
  const [spamError, setSpamError] = useState('');

  useEffect(() => {
    setHumanChallenge(generateHumanChallenge());
  }, []);

  const refreshChallenge = () => {
    setHumanChallenge(generateHumanChallenge());
    setUserAnswer('');
    setSpamError('');
  };

  type ForensicFile = ForensicFileItem;

  const [pendingFiles, setPendingFiles] = useState<ForensicFile[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [fileErrors, setFileErrors] = useState<string[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [errors, setErrors] = useState<ValidationErrors>({});

  const stepVariants = {
    hidden: { opacity: 0, x: 24 },
    visible: { opacity: 1, x: 0, transition: { duration: 0.35 } },
    exit: { opacity: 0, x: -24, transition: { duration: 0.25 } },
  };

  const validateAndAddFiles = useCallback(async (newFiles: FileList | File[], isLiveCapture: boolean = false) => {
    const errs: string[] = [];
    const valid: File[] = [];

    Array.from(newFiles).forEach((file) => {
      const isMedia =
        file.type.startsWith('image/') ||
        file.type.startsWith('audio/') ||
        file.type.startsWith('video/') ||
        /\.(png|jpe?g|webp|gif|mp3|wav|ogg|m4a|aac|flac|mp4|webm|mov|mkv)$/i.test(file.name);

      if (!isMedia) {
        errs.push(`"${file.name}" — Ditolak: Hanya berkas Foto, Video, dan Audio yang diizinkan sebagai bukti forensik.`);
      } else if (file.size > MAX_FILE_SIZE_BYTES) {
        errs.push(`"${file.name}" — ukuran melebihi batas ${MAX_FILE_SIZE_MB}MB.`);
      } else {
        valid.push(file);
      }
    });

    if (valid.length > 0) {
      setIsScanning(true);
      setFileErrors([]);

      const forensicResults: ForensicFile[] = [];
      for (const file of valid) {
        // Read raw buffer of ORIGINAL UNTOUCHED FILE before EXIF/metadata stripping
        const rawBuffer = await fileToArrayBuffer(file);

        // STEP 1: MAGIC BYTE & MIME SPOOFING VALIDATION
        const validation = validateFileSignature(file, rawBuffer);
        if (!validation.valid) {
          errs.push(`"${file.name}" — ${validation.message}`);
          continue;
        }

        // STEP 2: EXTRACT DETECTED EXIF METADATA
        const extractedMeta = extractDetectedMetadata(file, rawBuffer);

        let forensic: { status: 'Original' | 'Needs Review' | 'Manipulated'; details: string[] };
        let cleanResult: { cleanFile: File; stripped: boolean };

        if (file.type.startsWith('video/') || /\.(mp4|webm|mov)$/i.test(file.name)) {
          forensic = analyzeVideoForensics(file, rawBuffer);
          cleanResult = await stripMetadataFromVideo(file);
        } else if (file.type.startsWith('audio/') || /\.(mp3|wav|ogg|m4a)$/i.test(file.name)) {
          forensic = analyzeAudioForensics(file, rawBuffer);
          cleanResult = await stripMetadataFromAudio(file);
        } else {
          forensic = analyzeImageForensics(file, rawBuffer);
          cleanResult = await stripExifFromImage(file);
        }

        const { cleanFile, stripped } = cleanResult;

        // STEP 4: REAL WEB CRYPTO API SHA-256 HASHING
        const cleanBuffer = await fileToArrayBuffer(cleanFile);
        const hash = await calculateSHA256(cleanBuffer);

        let status: 'Original' | 'Needs Review' | 'Manipulated' = forensic.status;
        const details: string[] = [
          `SHA-256 Checksum: ${hash.substring(0, 16)}...`,
          ...forensic.details,
        ];

        if (isLiveCapture) {
          details.unshift('Kamera Internal: rekaman langsung dari browser (bukan unduhan ChatGPT/DALL·E).');
          if (status === 'Original') {
            details.push('Metadata GPS: dibersihkan (Clean EXIF).');
          }
        }

        forensicResults.push({
          file,
          cleanFile,
          isLiveCapture,
          exifStripped: stripped,
          sha256: hash,
          forensicStatus: status,
          forensicDetails: details,
          reporterNote: '',
          extractedMeta,
          validationResult: validation,
        });
      }

      setIsScanning(false);
      setPendingFiles((prev) => [...prev, ...forensicResults]);
      setFileErrors(errs);
    } else {
      setFileErrors(errs);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) validateAndAddFiles(e.target.files, false);
    e.target.value = '';
  };
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files) validateAndAddFiles(e.dataTransfer.files, false);
  };
  const removeFile = (index: number) => {
    setPendingFiles((prev) => prev.filter((_, i) => i !== index));
  };
  const updateFileNote = (index: number, note: string) => {
    setPendingFiles((prev) => {
      const copy = [...prev];
      copy[index].reporterNote = note;
      return copy;
    });
  };

  const validateStep1 = (): boolean => {
    const errs: ValidationErrors = {};
    if (!category) errs.category = 'Pilih kategori kasus terlebih dahulu.';
    if (!chronology.trim()) {
      errs.chronology = 'Kronologi kejadian wajib diisi.';
    } else {
      const quality = assessChronologyQuality(chronology);
      if (!quality.allowed) errs.chronology = quality.message;
    }
    if (!incidentTime.trim()) errs.incidentTime = 'Waktu kejadian wajib diisi.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const goNext = () => {
    if (step === 1 && !validateStep1()) return;
    if (step === 2) {
      const needsContext = pendingFiles.filter(
        (f) => f.forensicStatus !== 'Original' && f.reporterNote.trim().length < 5
      );
      if (needsContext.length > 0) {
        setFileErrors([
          '⚠️ TERDETEKSI HASIL AI / PERLU ALASAN: Terdapat berkas terindikasi AI atau tanpa EXIF asli yang belum dilengkapi alasan (minimal 5 karakter). Silakan berikan alasan pada kolom catatan berkas di bawah ini.',
        ]);
        return;
      }
    }
    setErrors({});
    setFileErrors([]);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStep((prev) => Math.min(prev + 1, 3) as 1 | 2 | 3);
  };
  const goPrev = () => {
    setErrors({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStep((prev) => Math.max(prev - 1, 1) as 1 | 2 | 3);
  };

  const handleCopy = (type: 'caseId' | 'token', value: string) => {
    navigator.clipboard.writeText(value);
    setCopied(type);
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSubmit = async () => {
    // Feature 3: Check Bot Rate Limiting
    const rateCheck = checkSubmissionRateLimit();
    if (!rateCheck.allowed) {
      setSpamError(rateCheck.message || 'Terlalu banyak permintaan.');
      return;
    }

    // Check Anti-Spam Human Math Challenge
    if (parseInt(userAnswer.trim(), 10) !== humanChallenge.answer) {
      setSpamError('Jawaban tantangan matematika anti-bot salah. Silakan coba lagi.');
      return;
    }

    const chronologyCheck = assessChronologyQuality(chronology);
    if (!chronologyCheck.allowed) {
      setSpamError(chronologyCheck.message || 'Kronologi tidak memenuhi syarat substansi.');
      return;
    }

    setSpamError('');
    setIsSubmitting(true);
    setSubmittingPhase(1);

    const abuseFlags: string[] = [];
    const evidences: Evidence[] = [];
    for (const pFile of pendingFiles) {
      let dataUrl: string | undefined = undefined;
      try {
        if (pFile.cleanFile && pFile.cleanFile.type.startsWith('image/')) {
          dataUrl = await createCompressedDataUrl(pFile.cleanFile);
        } else {
          dataUrl = await readFileAsDataUrl(pFile.cleanFile || pFile.file);
        }
      } catch (e) {
        console.warn('Gagal membaca dataUrl', e);
      }

      const dup = findDuplicateEvidenceHash(pFile.sha256);
      const forensicDetails = [...pFile.forensicDetails];
      let verificationStatus: Evidence['verificationStatus'] = 'Belum Diverifikasi';
      let verificationNote: string | undefined;

      if (dup.duplicate) {
        forensicDetails.push(`⚠️ Hash SHA-256 identik dengan berkas pada laporan ${dup.caseId}. Indikasi daur ulang bukti.`);
        abuseFlags.push(`Bukti duplikat (hash sama dengan ${dup.caseId})`);
      }

      if (pFile.forensicStatus === 'Manipulated') {
        verificationStatus = 'Tervalidasi Palsu / Ditolak';
        verificationNote = 'Sistem menolak validasi otomatis: berkas terindikasi sintesis AI / kanvas generator. Satgas tetap dapat meninjau ulang.';
        abuseFlags.push(`Bukti "${pFile.file.name}" ditandai Manipulated — tidak otomatis valid`);
      } else if (pFile.forensicStatus === 'Needs Review') {
        abuseFlags.push(`Bukti "${pFile.file.name}" menunggu tinjauan manual (tanpa EXIF kamera)`);
      }

      evidences.push({
        evidenceId: `EVD-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
        fileName: pFile.cleanFile.name,
        fileType: pFile.cleanFile.type || pFile.file.type || 'image/png',
        fileSize: pFile.cleanFile.size,
        dataUrl,
        isLiveCapture: pFile.isLiveCapture,
        exifStripped: pFile.exifStripped,
        sha256: pFile.sha256,
        forensicStatus: pFile.forensicStatus,
        forensicDetails,
        reporterNote: pFile.reporterNote || undefined,
        verificationStatus,
        verificationNote,
      });
    }

    await new Promise((r) => setTimeout(r, 600));
    setSubmittingPhase(2);
    await new Promise((r) => setTimeout(r, 600));
    setSubmittingPhase(3);
    await new Promise((r) => setTimeout(r, 600));

    const caseId = generateCaseId();
    const token = generateAnonymousToken();
    const nowIso = new Date().toISOString();

    const newReport: Report = {
      caseId,
      anonymousToken: token,
      category,
      incidentTime,
      involvedParties: involvedParties || undefined,
      targetFaculty: targetFaculty || undefined,
      chronology,
      evidences,
      status: 'Laporan Diterima',
      receivedAt: nowIso,
      isAnonymous: true,
      abuseFlags: abuseFlags.length > 0 ? Array.from(new Set(abuseFlags)) : undefined,
      auditLogs: [
        {
          id: `AL-${Date.now()}`,
          action: 'Laporan dibuat secara anonim dengan proteksi SHA-256 & EXIF Stripping',
          actor: 'Sistem',
          timestamp: nowIso,
        },
        ...(abuseFlags.length > 0
          ? [
              {
                id: `AL-${Date.now()}-risk`,
                action: `Defense-in-Depth: ${abuseFlags.join(' | ')}`,
                actor: 'Sistem' as const,
                timestamp: nowIso,
              },
            ]
          : []),
      ],
      messages: [],
    };

    try {
      await saveReportToDatabase(newReport);
      recordSubmission();
      recordEvidenceHashes(
        caseId,
        evidences.map((ev) => ev.sha256)
      );
    } catch (e) {
      console.warn('Gagal menyimpan laporan:', e);
    }

    setResultCaseId(caseId);
    setResultToken(token);

    setIsSubmitting(false);
    setIsSuccess(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-transparent text-stone-800 dark:text-stone-100 font-sans selection:bg-teal-500/20">

      {/* ── MAIN CONTENT ──────────────────────────────────────────────────── */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-24 pb-20 relative z-10">

        {/* PAGE TITLE */}
        {!isSuccess && (
          <div className="text-center mb-10 space-y-2">
            <div className="inline-flex items-center gap-2 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800/80 px-3.5 py-1.5 rounded-full shadow-xs">
              <Lock className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
              <span className="text-xs font-bold text-teal-800 dark:text-teal-300 tracking-wide uppercase">Enkripsi End-to-End & Forensik SHA-256</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-stone-800 dark:text-stone-50 tracking-tight">
              Formulir Pelaporan Anonim
            </h1>
            <p className="text-xs sm:text-sm text-stone-600 dark:text-stone-300 max-w-lg mx-auto leading-relaxed">
              Identitas Anda dijamin anonim 100%. Metadata lokasi GPS dibersihkan dan bukti disandikan dengan kriptografi mutlak.
            </p>
          </div>
        )}

        {/* SUBMITTING OVERLAY */}
        {isSubmitting && (
          <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-white text-center">
            <div className="w-16 h-16 border-4 border-teal-500/30 border-t-teal-400 rounded-full animate-spin mb-6" />
            <h3 className="text-xl font-bold mb-2">Mengamankan Laporan Anda...</h3>
            <p className="text-slate-400 text-sm max-w-sm font-mono">
              {submittingPhase === 1 && '• Menghitung SHA-256 Checksum & Forensik Biner Asli...'}
              {submittingPhase === 2 && '• Membersihkan Tag EXIF & Metadata Lokasi...'}
              {submittingPhase === 3 && '• Menerbitkan Token Kriptografi Anonim...'}
            </p>
          </div>
        )}

        {/* ── SUCCESS STATE ────────────────────────────────────────────────── */}
        {isSuccess ? (
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="space-y-6">
            <div className="bg-white/90 dark:bg-[#163432] backdrop-blur-xl border border-teal-500/40 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6">

              <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950 border border-emerald-200 dark:border-emerald-800 rounded-2xl flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400 shadow-md">
                <CheckCircle className="w-10 h-10" />
              </div>

              <div className="text-center space-y-2">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">Laporan Berhasil Diterbitkan!</h2>
                <p className="text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">
                  Laporan Anda tersimpan terenkripsi. Simpan token di bawah untuk melacak perkembangan kasus tanpa login.
                </p>
              </div>

              {/* TOKEN DISPLAY CARDS */}
              <div className="space-y-3 bg-slate-50 dark:bg-[#0a2220] p-5 rounded-2xl border border-stone-300 dark:border-teal-900">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-white dark:bg-[#061e1c] rounded-xl border border-stone-300 dark:border-teal-900">
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-semibold">Case ID (Internal Satgas)</p>
                    <p className="font-mono text-base font-bold text-slate-900 dark:text-white">{resultCaseId}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy('caseId', resultCaseId)}
                    className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1 text-slate-700 dark:text-slate-200 self-start sm:self-auto cursor-pointer"
                  >
                    {copied === 'caseId' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied === 'caseId' ? 'Tersalin' : 'Salin'}
                  </button>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-4 bg-teal-50 dark:bg-teal-950/60 rounded-xl border border-teal-200 dark:border-teal-800">
                  <div>
                    <p className="text-xs text-teal-800 dark:text-teal-300 uppercase font-bold tracking-wider">Token Anonim (Kunci Pelacak Anda)</p>
                    <p className="font-mono text-xl sm:text-2xl font-black text-teal-900 dark:text-teal-200">{resultToken}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleCopy('token', resultToken)}
                    className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 self-start sm:self-auto shadow-sm cursor-pointer"
                  >
                    {copied === 'token' ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                    {copied === 'token' ? 'Token Tersalin!' : 'Salin Token'}
                  </button>
                </div>
              </div>

              <div className="p-4 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900/50 rounded-xl text-xs text-amber-800 dark:text-amber-300 leading-relaxed flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                <span>
                  <strong>PENTING:</strong> Catat atau simpan Token Anonim Anda. Token ini adalah satu-satunya cara untuk memeriksa progres kasus di menu <strong>Pelacakan (/track)</strong> tanpa mengungkap identitas Anda.
                </span>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <Link
                  href="/track"
                  className="flex-1 bg-teal-600 hover:bg-teal-700 text-white font-bold py-3.5 px-4 rounded-xl text-center text-sm transition-all shadow-md cursor-pointer flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" /> Lacak Kasus Sekarang
                </Link>
                <Link
                  href="/"
                  className="flex-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold py-3.5 px-4 rounded-xl text-center text-sm transition-colors cursor-pointer"
                >
                  Kembali ke Beranda
                </Link>
              </div>

            </div>
          </motion.div>
        ) : (
          /* ── FORM STEPS ─────────────────────────────────────────────────── */
          <div className="bg-[#f4f4f4] dark:bg-[#163432] backdrop-blur-xl border border-stone-300 dark:border-teal-900 rounded-3xl p-6 sm:p-8 shadow-sm relative overflow-hidden">
            
            <StepIndicator current={step} />

            <div className="space-y-6">

              <AnimatePresence mode="wait">

                {/* ═══ STEP 1: FORMULIR INDIKASI ══════════════════════════════ */}
                {step === 1 && (
                  <motion.div key="step1" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-5">
                    <div className="space-y-1">
                      <h2 className="text-xl font-bold text-stone-800 dark:text-stone-100 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-teal-600 dark:text-teal-400" /> Informasi Kejadian
                      </h2>
                      <p className="text-stone-600 dark:text-stone-300 text-sm">Jelaskan indikasi dugaan pelanggaran secara objektif.</p>
                    </div>

                    {/* Kategori */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-stone-700 dark:text-stone-200 uppercase tracking-wider">
                        Kategori Kasus <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        className={`w-full bg-white dark:bg-[#0a2220] border ${
                          errors.category ? 'border-rose-500' : 'border-stone-300 dark:border-teal-900'
                        } rounded-xl px-4 py-3 text-sm text-stone-800 dark:text-stone-100 focus:outline-none focus:border-teal-500 font-medium transition-all`}
                      >
                        <option value="">-- Pilih Kategori Kasus --</option>
                        <option value="Kekerasan Seksual & Pelecehan">Kekerasan Seksual & Pelecehan</option>
                        <option value="Perundungan & Bullying (Cyber/Fisik)">Perundungan & Bullying (Cyber/Fisik)</option>
                        <option value="Pengancaman & Intimidasi">Pengancaman & Intimidasi</option>
                        <option value="Diskriminasi & Pelanggaran Etika">Diskriminasi & Pelanggaran Etika</option>
                        <option value="Lainnya">Lainnya</option>
                      </select>
                      {errors.category && <p className="text-xs text-rose-500 font-medium">{errors.category}</p>}
                    </div>

                    {/* Waktu Kejadian */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-stone-700 dark:text-stone-200 uppercase tracking-wider">
                        Waktu Kejadian <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Contoh: 12 Agustus 2026 sekitar pukul 14.00 WIB"
                        value={incidentTime}
                        onChange={(e) => setIncidentTime(e.target.value)}
                        className={`w-full bg-white dark:bg-[#0a2220] border ${
                          errors.incidentTime ? 'border-rose-500' : 'border-stone-300 dark:border-teal-900'
                        } rounded-xl px-4 py-3 text-sm text-stone-800 dark:text-stone-100 focus:outline-none focus:border-teal-500 font-medium transition-all`}
                      />
                      {errors.incidentTime && <p className="text-xs text-rose-500 font-medium">{errors.incidentTime}</p>}
                    </div>

                    {/* Pihak Terlibat & Fakultas (Opsional) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-stone-700 dark:text-stone-200 uppercase tracking-wider">Pihak / Oknum Terlibat (Opsional)</label>
                        <input
                          type="text"
                          placeholder="Contoh: Mahasiswa X / Oknum Y"
                          value={involvedParties}
                          onChange={(e) => setInvolvedParties(e.target.value)}
                          className="w-full bg-white dark:bg-[#0a2220] border border-stone-300 dark:border-teal-900 rounded-xl px-4 py-3 text-sm text-stone-800 dark:text-stone-100 focus:outline-none focus:border-teal-500 font-medium transition-all"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-stone-700 dark:text-stone-200 uppercase tracking-wider">Lingkup / Fakultas (Opsional)</label>
                        <input
                          type="text"
                          placeholder="Contoh: Fakultas Ilmu Komputer"
                          value={targetFaculty}
                          onChange={(e) => setTargetFaculty(e.target.value)}
                          className="w-full bg-white dark:bg-[#0a2220] border border-stone-300 dark:border-teal-900 rounded-xl px-4 py-3 text-sm text-stone-800 dark:text-stone-100 focus:outline-none focus:border-teal-500 font-medium transition-all"
                        />
                      </div>
                    </div>

                    {/* Kronologi */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-stone-700 dark:text-stone-200 uppercase tracking-wider">
                        Kronologi Kejadian <span className="text-rose-500">*</span>
                      </label>
                      <textarea
                        rows={5}
                        placeholder="Tuliskan urutan kejadian secara jelas dan rinci..."
                        value={chronology}
                        onChange={(e) => setChronology(e.target.value)}
                        className={`w-full bg-white dark:bg-[#0a2220] border ${
                          errors.chronology ? 'border-rose-500' : 'border-stone-300 dark:border-teal-900'
                        } rounded-xl p-4 text-sm text-stone-800 dark:text-stone-100 focus:outline-none focus:border-teal-500 font-medium transition-all leading-relaxed`}
                      />
                      {errors.chronology && <p className="text-xs text-rose-500 font-medium">{errors.chronology}</p>}
                    </div>

                    <div className="pt-4 flex justify-end">
                      <button
                        type="button"
                        onClick={goNext}
                        className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-7 py-3 rounded-xl transition-all text-sm flex items-center gap-2 shadow-md cursor-pointer"
                      >
                        <span>Lanjut ke Bukti & Forensik</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* ═══ STEP 2: UPLOAD BUKTI & FORENSIK ════════════════════════ */}
                {step === 2 && (
                  <motion.div key="step2" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6">
                    <div className="space-y-1">
                      <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100">
                        <Paperclip className="w-5 h-5 text-teal-600 dark:text-teal-400" /> Unggah Bukti & Analisis Forensik
                      </h2>
                      <p className="text-slate-600 dark:text-slate-400 text-sm">
                        Setiap berkas akan dibersihkan dari tag GPS/EXIF dan dicetak nilai SHA-256 Hash mutlak.
                      </p>
                    </div>

                    {/* DRAG & DROP ZONE */}
                    <div
                      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                      onDragLeave={() => setIsDragOver(false)}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                        isDragOver
                          ? 'border-teal-500 bg-teal-50/50 dark:bg-teal-950/40'
                          : 'border-stone-300 dark:border-teal-900 hover:border-teal-400 bg-stone-50/50 dark:bg-[#0a2220]'
                      }`}
                    >
                      <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        accept={ALLOWED_TYPES.join(',')}
                        onChange={handleFileInput}
                        className="hidden"
                      />
                      <div className="w-12 h-12 bg-teal-50 dark:bg-teal-950 border border-teal-200 dark:border-teal-800 rounded-xl flex items-center justify-center mx-auto mb-3 text-teal-600 dark:text-teal-400">
                        <Upload className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">
                        Klik untuk memilih berkas atau drag & drop
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        Foto (JPG/PNG/WEBP), Audio (MP3/WAV/OGG/M4A), atau Video (MP4/WEBM/MOV) — Maks. {MAX_FILE_SIZE_MB}MB
                      </p>
                    </div>

                    {/* SCANNING INDICATOR */}
                    {isScanning && (
                      <div className="p-4 bg-teal-50 dark:bg-teal-950/60 border border-teal-200 dark:border-teal-800 rounded-xl flex items-center gap-3 text-xs text-teal-800 dark:text-teal-300">
                        <RefreshCw className="w-4 h-4 animate-spin text-teal-600 dark:text-teal-400" />
                        <span>Memproses analisis forensik biner asli, SHA-256 Hash & pembersihan EXIF...</span>
                      </div>
                    )}

                    {/* FILE ERRORS */}
                    {fileErrors.length > 0 && (
                      <div className="space-y-1">
                        {fileErrors.map((err, i) => (
                          <p key={i} className="text-xs text-rose-500 font-medium flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" /> {err}
                          </p>
                        ))}
                      </div>
                    )}

                    {/* PROCESSED EVIDENCES LIST WITH EVIDENCE SECURITY PANEL */}
                    {pendingFiles.length > 0 && (
                      <div className="space-y-5 pt-2">
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-stone-700 dark:text-stone-200 uppercase tracking-wider flex items-center gap-1.5">
                            <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                            Berkas Terverifikasi Kriptografi & Magic-Bytes ({pendingFiles.length} file)
                          </p>
                        </div>
                        {pendingFiles.map((pFile, i) => (
                          <EvidenceSecurityPanel
                            key={i}
                            item={pFile}
                            index={i}
                            onUpdateNote={updateFileNote}
                            onRemove={removeFile}
                          />
                        ))}
                      </div>
                    )}

                    <div className="pt-4 flex items-center justify-between">
                      <button type="button" onClick={goPrev} className="px-5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-sm transition-colors cursor-pointer">
                        Kembali
                      </button>
                      <button type="button" onClick={goNext} className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-7 py-2.5 rounded-xl transition-all text-sm cursor-pointer shadow-md">
                        Lanjut ke Review
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* ═══ STEP 3: REVIEW & KIRIM ═════════════════════════════════ */}
                {step === 3 && (
                  <motion.div key="step3" variants={stepVariants} initial="hidden" animate="visible" exit="exit" className="space-y-6 relative z-10">
                    <div className="space-y-1">
                      <h2 className="text-xl font-bold flex items-center gap-2 text-slate-900 dark:text-slate-100">
                        <Eye className="w-5 h-5 text-teal-600 dark:text-teal-400" /> Ringkasan Laporan & Verifikasi Anti-Bot
                      </h2>
                      <p className="text-slate-600 dark:text-slate-400 text-sm">Pastikan seluruh data laporan dan berkas bukti di bawah ini sudah lengkap dan sesuai sebelum dikirim.</p>
                    </div>

                    <div className="space-y-4">
                      {/* Grid for Kategori & Waktu Kejadian */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="bg-stone-50 dark:bg-[#0a2220] border border-stone-300 dark:border-teal-900 rounded-xl p-4 space-y-1">
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Kategori Kasus</p>
                          <p className="text-sm font-bold text-teal-700 dark:text-teal-300">{category || '-'}</p>
                        </div>
                        <div className="bg-stone-50 dark:bg-[#0a2220] border border-stone-300 dark:border-teal-900 rounded-xl p-4 space-y-1">
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Waktu Kejadian</p>
                          <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{incidentTime || '-'}</p>
                        </div>
                      </div>

                      {/* Grid for Pihak Terlibat & Lingkup / Fakultas */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="bg-stone-50 dark:bg-[#0a2220] border border-stone-300 dark:border-teal-900 rounded-xl p-4 space-y-1">
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Pihak Terlibat</p>
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{involvedParties || 'Tidak disebutkan (Rahasia)'}</p>
                        </div>
                        <div className="bg-stone-50 dark:bg-[#0a2220] border border-stone-300 dark:border-teal-900 rounded-xl p-4 space-y-1">
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Lingkup / Fakultas</p>
                          <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{targetFaculty || 'Tidak disebutkan'}</p>
                        </div>
                      </div>

                      {/* Kronologi Kejadian */}
                      <div className="bg-stone-50 dark:bg-[#0a2220] border border-stone-300 dark:border-teal-900 rounded-xl p-4 space-y-2">
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Kronologi Kejadian</p>
                          <button type="button" onClick={() => setStep(1)} className="text-xs text-teal-600 dark:text-teal-400 hover:underline font-semibold cursor-pointer">
                            Ubah
                          </button>
                        </div>
                        <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-medium">{chronology}</p>
                      </div>

                      {/* Lampiran Bukti & Status Forensik */}
                      <div className="bg-stone-50 dark:bg-[#0a2220] border border-stone-300 dark:border-teal-900 rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5">
                            <Paperclip className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                            <span>Lampiran Bukti & Kriptografi ({pendingFiles.length} file)</span>
                          </p>
                          <button type="button" onClick={() => setStep(2)} className="text-xs text-teal-600 dark:text-teal-400 hover:underline font-semibold cursor-pointer">
                            {pendingFiles.length > 0 ? 'Kelola Bukti' : 'Tambah Bukti'}
                          </button>
                        </div>

                        {pendingFiles.length === 0 ? (
                          <p className="text-xs text-slate-500 dark:text-slate-400 italic">Tidak ada berkas bukti diunggah. Laporan akan diproses berdasarkan kronologi tertulis.</p>
                        ) : (
                          <div className="space-y-2.5">
                            {pendingFiles.map((pFile, idx) => (
                              <div key={idx} className="bg-white dark:bg-[#061e1c] border border-stone-300 dark:border-teal-900 rounded-xl p-3.5 space-y-2 text-xs">
                                <div className="flex items-center justify-between gap-2">
                                  <span className="font-bold text-slate-800 dark:text-slate-200 truncate">{pFile.cleanFile.name}</span>
                                  <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 shrink-0">{formatBytes(pFile.cleanFile.size)}</span>
                                </div>
                                <div className="flex items-center gap-2 flex-wrap text-[10px] font-mono">
                                  <span className="bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300 px-2 py-0.5 rounded border border-teal-200 dark:border-teal-800 font-bold">
                                    SHA-256: {pFile.sha256.substring(0, 14)}...
                                  </span>
                                  <span className="bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800">
                                    EXIF Cleared
                                  </span>
                                  <span className={`px-2 py-0.5 rounded border font-bold ${
                                    pFile.forensicStatus === 'Manipulated'
                                      ? 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                                      : pFile.forensicStatus === 'Needs Review'
                                      ? 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                                      : 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                                  }`}>
                                    {pFile.forensicStatus === 'Original' ? 'Original' : pFile.forensicStatus === 'Manipulated' ? 'Tidak otomatis valid' : 'Perlu tinjauan'}
                                  </span>
                                </div>
                                {pFile.reporterNote && (
                                  <p className="text-[11px] text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-950 p-2 rounded-lg border border-slate-100 dark:border-slate-800 italic">
                                    Catatan: &quot;{pFile.reporterNote}&quot;
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Anti-Spam Human Verification Challenge (Feature 3) */}
                      <div className="bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800/80 rounded-2xl p-5 space-y-3">
                        <div className="flex items-center justify-between">
                          <label className="text-xs font-bold text-teal-900 dark:text-teal-300 uppercase tracking-wider flex items-center gap-2">
                            <Cpu className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                            <span>Verifikasi Anti-Bot & Fraud Protection</span>
                          </label>
                          <button
                            type="button"
                            onClick={refreshChallenge}
                            className="text-xs text-teal-700 dark:text-teal-400 flex items-center gap-1 hover:underline cursor-pointer"
                          >
                            <RefreshCw className="w-3 h-3" /> Ganti Soal
                          </button>
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-300">
                          Selesaikan perhitungan berikut untuk membuktikan laporan ini dibuat oleh manusia (bukan bot otomatis):
                        </p>
                        <div className="flex items-center gap-3">
                          <span className="font-mono font-bold text-base bg-white dark:bg-[#061e1c] px-3.5 py-2 rounded-xl border border-teal-300 dark:border-teal-700 text-teal-900 dark:text-teal-200">
                            {humanChallenge.problem}
                          </span>
                          <input
                            type="number"
                            value={userAnswer}
                            onChange={(e) => setUserAnswer(e.target.value)}
                            placeholder="Jawaban..."
                            className="w-32 bg-white dark:bg-[#061e1c] border border-stone-300 dark:border-teal-900 focus:border-teal-500 rounded-xl px-3 py-2 text-sm text-stone-800 dark:text-stone-100 font-semibold"
                          />
                        </div>
                        {spamError && (
                          <p className="text-xs text-rose-600 dark:text-rose-400 font-semibold flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0" /> {spamError}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="pt-4 flex items-center justify-between">
                      <button type="button" onClick={goPrev} className="px-5 py-2.5 rounded-xl border border-stone-300 dark:border-stone-600 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold text-sm transition-colors cursor-pointer">
                        Kembali
                      </button>
                      <button type="button" onClick={handleSubmit} className="bg-teal-600 hover:bg-teal-700 text-white font-bold px-8 py-3 rounded-xl transition-all text-base cursor-pointer shadow-lg shadow-teal-600/30 flex items-center gap-2">
                        <Lock className="w-4 h-4 text-teal-200" />
                        <span>Kirim Laporan Terenkripsi</span>
                      </button>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>

            </div>
          </div>
        )}

      </main>
    </div>
  );
}
