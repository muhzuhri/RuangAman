'use client';

import React from 'react';
import { AlertTriangle, Trash2, X } from 'lucide-react';
import { type Report } from '@/lib/types';
import { formatDateID } from '@/lib/adminUtils';

interface AdminDeleteConfirmModalProps {
  report: Report | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmDelete: (report: Report) => void;
}

export default function AdminDeleteConfirmModal({
  report,
  isOpen,
  onClose,
  onConfirmDelete,
}: AdminDeleteConfirmModalProps) {
  if (!isOpen || !report) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/65 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white dark:bg-[#163432] border border-stone-200 dark:border-teal-900 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between gap-3 bg-red-50/50 dark:bg-red-950/20">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-red-100 dark:bg-red-950/80 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/60 shadow-xs">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 dark:text-stone-100 text-base">
                Konfirmasi Hapus Kasus
              </h3>
              <p className="text-xs text-stone-500 dark:text-stone-400">
                Tindakan ini memerlukan verifikasi Anda
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            title="Batal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4">
          <p className="text-xs text-stone-700 dark:text-stone-300 leading-relaxed font-medium">
            Apakah Anda yakin ingin menghapus kasus ini? Data yang telah dihapus <strong className="text-red-600 dark:text-red-400 font-bold">tidak dapat dikembalikan</strong>.
          </p>

          {/* Report Detail Preview Box */}
          <div className="p-4 rounded-2xl bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-teal-900/80 space-y-2.5 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-stone-500 dark:text-stone-400 font-medium">Case ID:</span>
              <span className="font-mono font-bold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2 py-0.5 rounded-lg border border-teal-200 dark:border-teal-900">
                {report.caseId}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-stone-500 dark:text-stone-400 font-medium">Token Anonim:</span>
              <span className="font-mono font-bold text-stone-800 dark:text-stone-200">
                {report.anonymousToken}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-stone-500 dark:text-stone-400 font-medium">Kategori:</span>
              <span className="font-semibold text-stone-800 dark:text-stone-200">
                {report.category}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-stone-500 dark:text-stone-400 font-medium">Status:</span>
              <span className="font-bold text-stone-700 dark:text-stone-300">
                {report.status}
              </span>
            </div>

            {report.receivedAt && (
              <div className="flex items-center justify-between pt-1 border-t border-stone-200/60 dark:border-stone-800">
                <span className="text-stone-500 dark:text-stone-400 font-medium">Diterima:</span>
                <span className="text-stone-600 dark:text-stone-400">
                  {formatDateID(report.receivedAt)}
                </span>
              </div>
            )}
          </div>

          {/* Permanent Warning */}
          <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200/60 dark:border-red-900/40 text-red-800 dark:text-red-300 text-[11px] leading-relaxed flex items-start gap-2">
            <Trash2 className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
            <span>
              Penghapusan ini akan menghapus catatan laporan dari sistem admin serta database Supabase.
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 sm:p-5 bg-stone-50/80 dark:bg-stone-900/40 border-t border-stone-100 dark:border-stone-800 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800 hover:bg-stone-100 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-200 font-bold text-xs transition-all cursor-pointer shadow-xs"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirmDelete(report);
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-xs transition-all cursor-pointer shadow-md shadow-red-600/20 inline-flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            <span>Ya, Hapus Kasus</span>
          </button>
        </div>
      </div>
    </div>
  );
}
