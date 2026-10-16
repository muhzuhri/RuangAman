'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Copy,
  Check,
  FileSearch,
  XCircle,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';
import {
  type ExtractedMetadata,
  type FileValidationResult,
} from '@/lib/crypto';

export interface ForensicFileItem {
  file: File;
  cleanFile: File;
  isLiveCapture: boolean;
  exifStripped: boolean;
  sha256: string;
  forensicStatus: 'Original' | 'Needs Review' | 'Manipulated';
  forensicDetails: string[];
  reporterNote: string;
  extractedMeta?: ExtractedMetadata;
  validationResult?: FileValidationResult;
}

interface EvidenceSecurityPanelProps {
  item: ForensicFileItem;
  index: number;
  onUpdateNote: (index: number, note: string) => void;
  onRemove: (index: number) => void;
}

export function EvidenceSecurityPanel({
  item,
  index,
  onUpdateNote,
  onRemove,
}: EvidenceSecurityPanelProps) {
  const [copiedHash, setCopiedHash] = useState(false);

  const handleCopyHash = () => {
    navigator.clipboard.writeText(item.sha256);
    setCopiedHash(true);
    setTimeout(() => setCopiedHash(false), 2000);
  };

  const meta = item.extractedMeta;
  const validation = item.validationResult;

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="bg-white/90 dark:bg-[#163432] backdrop-blur-xl border border-stone-200 dark:border-teal-900 rounded-2xl p-5 sm:p-6 space-y-4 shadow-sm">
      {/* ── HEADER: File Info & Remove Button ─────────────────────────────── */}
      <div className="flex items-start justify-between gap-3 border-b border-stone-200 dark:border-teal-900/80 pb-4">
        <div className="space-y-1 min-w-0 pr-4">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-mono font-bold text-teal-700 dark:text-teal-300 bg-teal-50 dark:bg-teal-950/80 px-2.5 py-0.5 rounded-md border border-teal-200 dark:border-teal-800">
              Bukti #{index + 1}
            </span>
            <span className="text-xs text-stone-500 font-mono">
              {formatBytes(item.cleanFile.size)} • {item.cleanFile.type || 'Media'}
            </span>
          </div>
          <h4 className="text-base font-bold text-stone-900 dark:text-white truncate">
            {item.cleanFile.name}
          </h4>
        </div>
        <button
          type="button"
          onClick={() => onRemove(index)}
          className="px-3 py-1.5 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 text-xs font-semibold transition-colors cursor-pointer shrink-0"
        >
          Hapus Berkas
        </button>
      </div>

      {/* ── VALIDASI TANDA TANGAN BINER (MAGIC BYTES) ───────────────────────── */}
      {validation && !validation.valid && (
        <div className="p-3.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-800 rounded-xl space-y-1 text-rose-900 dark:text-rose-200 text-xs">
          <p className="font-bold flex items-center gap-1.5">
            <XCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
            Keamanan Berkas Ditolak
          </p>
          <p className="text-[11px] leading-relaxed">{validation.message}</p>
        </div>
      )}

      {validation && validation.valid && (
        <div className="p-3 bg-emerald-50/80 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 rounded-xl flex items-center justify-between text-xs text-emerald-900 dark:text-emerald-300">
          <span className="font-semibold flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
            Tanda Tangan Biner (Magic Bytes) Tervalidasi Utuh ({validation.detectedType})
          </span>
          <span className="text-[10px] font-mono bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded font-bold">
            Pass Magic-Byte
          </span>
        </div>
      )}

      {/* ── ANALISIS METADATA & FORENSIK ───────────────────────────────────── */}
      <div className="space-y-3">
        <div className="p-4 bg-stone-50 dark:bg-[#0a2220] border border-stone-200 dark:border-teal-900 rounded-xl space-y-2 text-xs">
          <h5 className="font-bold text-stone-800 dark:text-stone-200 flex items-center gap-1.5 text-xs">
            <FileSearch className="w-4 h-4 text-teal-600 dark:text-teal-400" />
            Hasil Pemindaian Forensik Biner Asli:
          </h5>
          {item.forensicDetails.map((det, idx) => (
            <p key={idx} className="text-[11px] leading-relaxed text-stone-700 dark:text-stone-300 font-sans flex items-start gap-1.5">
              <span className="text-teal-600 dark:text-teal-400 font-bold">•</span>
              <span>{det}</span>
            </p>
          ))}
        </div>

        {/* Ringkasan Metadata Sensitif Terdeteksi */}
        <div className="p-4 bg-amber-50/60 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/50 rounded-xl space-y-2 text-xs">
          <span className="font-bold text-amber-900 dark:text-amber-200 block">
            Metadata Sensitif pada Berkas Asli (Sebelum Disanitasi):
          </span>
          {meta && (meta.hasGps || meta.cameraMaker || meta.timestamp || meta.software) ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
              <div className="bg-white dark:bg-[#061e1c] p-2.5 rounded-lg border border-amber-200 dark:border-amber-900/60">
                <span className="text-stone-500 text-[10px] uppercase font-bold block">GPS Geotag</span>
                <span className={`font-bold ${meta.hasGps ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                  {meta.hasGps ? '⚠️ Terdeteksi (Telah Dibersihkan)' : 'Tidak Terdeteksi'}
                </span>
              </div>
              <div className="bg-white dark:bg-[#061e1c] p-2.5 rounded-lg border border-amber-200 dark:border-amber-900/60">
                <span className="text-stone-500 text-[10px] uppercase font-bold block">Kamera</span>
                <span className="font-bold text-stone-800 dark:text-stone-200 truncate block">
                  {meta.cameraMaker || 'Tidak Terdeteksi'}
                </span>
              </div>
              <div className="bg-white dark:bg-[#061e1c] p-2.5 rounded-lg border border-amber-200 dark:border-amber-900/60">
                <span className="text-stone-500 text-[10px] uppercase font-bold block">Stempel Waktu</span>
                <span className="font-bold text-stone-800 dark:text-stone-200 truncate block">
                  {meta.timestamp || 'Tidak Ada'}
                </span>
              </div>
              <div className="bg-white dark:bg-[#061e1c] p-2.5 rounded-lg border border-amber-200 dark:border-amber-900/60">
                <span className="text-stone-500 text-[10px] uppercase font-bold block">Software Editor</span>
                <span className="font-bold text-stone-800 dark:text-stone-200 truncate block">
                  {meta.software || 'Tidak Ada'}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-emerald-700 dark:text-emerald-400 font-semibold text-xs flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> No metadata sensitif terdeteksi pada struktur berkas.
            </p>
          )}
        </div>
      </div>

      {/* ── REPORTER REASON/NOTE INPUT (REQUIRED IF AI OR NO EXIF) ─────────── */}
      <div className="space-y-1.5 border-t border-stone-200 dark:border-teal-900/80 pt-3">
        <label className="text-xs font-bold text-stone-700 dark:text-stone-300 flex items-center justify-between">
          <span>
            {item.forensicStatus === 'Original'
              ? 'Catatan Opsional Pelapor untuk Bukti Ini:'
              : 'Catatan Wajib Pelapor (Minimal 5 karakter) — jelaskan asal/alasan berkas ini:'}
          </span>
          {item.forensicStatus !== 'Original' && (
            <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold uppercase tracking-wider">
              Wajib Alasan
            </span>
          )}
        </label>
        <textarea
          rows={2}
          value={item.reporterNote}
          onChange={(e) => onUpdateNote(index, e.target.value)}
          placeholder={
            item.forensicStatus === 'Original'
              ? 'Misal: "Tangkapan layar bukti obrolan grup"'
              : 'Jelaskan mengapa berkas ini terindikasi tanpa EXIF/AI (minimal 5 karakter)...'
          }
          className={`w-full bg-white dark:bg-[#061e1c] border rounded-xl p-3 text-xs text-stone-800 dark:text-stone-200 placeholder:text-stone-400 focus:outline-none font-medium transition-all ${
            item.forensicStatus !== 'Original' && item.reporterNote.trim().length < 5
              ? 'border-rose-400 dark:border-rose-600 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20'
              : 'border-stone-300 dark:border-teal-900 focus:border-teal-500'
          }`}
        />
        {item.forensicStatus !== 'Original' && (
          <div className="flex items-center justify-between text-[11px] font-medium pt-0.5">
            <span className={item.reporterNote.trim().length >= 5 ? 'text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1' : 'text-rose-600 dark:text-rose-400 font-bold'}>
              {item.reporterNote.trim().length >= 5 ? '✓ Alasan sudah terisi (minimal 5 karakter)' : `* Wajib isi alasan (tersisa ${Math.max(0, 5 - item.reporterNote.trim().length)} karakter lagi)`}
            </span>
            <span className="text-stone-400 font-mono text-[10px]">{item.reporterNote.trim().length}/5 min</span>
          </div>
        )}
      </div>
    </div>
  );
}
