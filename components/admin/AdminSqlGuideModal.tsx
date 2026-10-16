'use client';

import React, { useState } from 'react';
import { X, Code, Copy, Check } from 'lucide-react';

interface AdminSqlGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SQL_SCHEMA_SCRIPT = `-- Skema Tabel Database Laporan Satgas PPKS AmanKampus
CREATE TABLE IF NOT EXISTS public.reports (
    case_id TEXT PRIMARY KEY,
    anonymous_token TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    incident_time TEXT,
    involved_parties TEXT,
    target_faculty TEXT,
    chronology TEXT NOT NULL,
    evidences JSONB DEFAULT '[]'::jsonb,
    messages JSONB DEFAULT '[]'::jsonb,
    audit_logs JSONB DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'Laporan Diterima',
    received_at TIMESTAMPTZ DEFAULT NOW(),
    is_anonymous BOOLEAN DEFAULT true,
    abuse_flags JSONB DEFAULT '[]'::jsonb
);

-- Indeks Performa untuk Pencarian Cepat Token & Status Kasus
CREATE INDEX IF NOT EXISTS idx_reports_token ON public.reports(anonymous_token);
CREATE INDEX IF NOT EXISTS idx_reports_case_id ON public.reports(case_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);

-- Aktifkan Row Level Security (RLS)
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- Kebijakan Akses Publik Anonim & Admin (SELECT, INSERT, UPDATE, & DELETE)
CREATE POLICY "Public Read Access by Token/CaseID" ON public.reports
    FOR SELECT USING (true);

CREATE POLICY "Public Submit Report Access" ON public.reports
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Public Update Report Messages" ON public.reports
    FOR UPDATE USING (true);

CREATE POLICY "Public Delete Report Access" ON public.reports
    FOR DELETE USING (true);
`;

export default function AdminSqlGuideModal({ isOpen, onClose }: AdminSqlGuideModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(SQL_SCHEMA_SCRIPT);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#163432] border border-stone-200 dark:border-teal-900 rounded-3xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-100 dark:border-stone-800 flex items-center justify-between gap-3 bg-stone-50/80 dark:bg-stone-900/40">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <Code className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm sm:text-base">
                Skema SQL Supabase AmanKampus
              </h3>
              <p className="text-xs text-stone-500">Salin skema di bawah ke SQL Editor di Dasbor Supabase Anda</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Code Content Area */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-600 dark:text-stone-400">DDL Table Schema & Indexes:</span>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin!' : 'Salin SQL Script'}</span>
            </button>
          </div>

          <pre className="p-4 rounded-2xl bg-stone-950 text-teal-300 font-mono text-xs overflow-x-auto border border-stone-800 leading-relaxed no-scrollbar selection:bg-teal-500/30">
            <code>{SQL_SCHEMA_SCRIPT}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
