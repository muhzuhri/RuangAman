'use client';

import React from 'react';
import { Database, Zap, RefreshCw, Code } from 'lucide-react';
import { type SupabaseStatusInfo } from '@/lib/reportsService';

interface AdminDatabaseBannerProps {
  dbStatus: SupabaseStatusInfo | null;
  isSyncing: boolean;
  syncMessage: { type: 'success' | 'error' | 'info'; text: string } | null;
  handleSyncToSupabase: () => void;
  setShowSqlGuide: (show: boolean) => void;
  resetMockReports: () => void;
}

export default function AdminDatabaseBanner({
  dbStatus,
  isSyncing,
  syncMessage,
  handleSyncToSupabase,
  setShowSqlGuide,
  resetMockReports,
}: AdminDatabaseBannerProps) {
  return (
    <div className="bg-white dark:bg-[#163432] border border-stone-200 dark:border-teal-900 rounded-2xl p-4 sm:p-5 shadow-xs transition-all">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left Status Info */}
        <div className="flex items-start sm:items-center gap-3">
          <div className={`p-2.5 rounded-xl shrink-0 ${
            dbStatus?.connected
              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
          }`}>
            <Database className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm sm:text-base">
                Koneksi Database Supabase REST API
              </h3>
              <span className={`px-2 py-0.5 text-[11px] font-bold rounded-full ${
                dbStatus?.connected
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800'
                  : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
              }`}>
                {dbStatus?.connected ? '✅ Terhubung (Terverifikasi)' : '⚠️ Mode Fallback LocalStorage'}
              </span>
            </div>
            <p className="text-stone-600 dark:text-stone-400 text-xs mt-1">
              {dbStatus?.connected
                ? `Tersambung ke project Supabase (${dbStatus.url || 'Configured'}). Total ${dbStatus.count} data laporan tersimpan di cloud.`
                : dbStatus?.isConfigured
                ? `Supabase terkonfigurasi di env tetapi mengalami isu jaringan. (${dbStatus.error || 'Check connectivity'})`
                : 'Supabase URL/Key belum dikonfigurasi di file .env.local. Sistem menggunakan browser LocalStorage.'}
            </p>
          </div>
        </div>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          <button
            onClick={handleSyncToSupabase}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-xl bg-teal-600 hover:bg-teal-700 text-white shadow-xs transition-all disabled:opacity-50 cursor-pointer"
          >
            {isSyncing ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Zap className="w-3.5 h-3.5 text-amber-300" />
            )}
            <span>{isSyncing ? 'Mengunggah...' : 'Sinkronkan Data Sampel ke Supabase'}</span>
          </button>

          <button
            onClick={() => setShowSqlGuide(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-stone-100 dark:bg-stone-800 hover:bg-stone-200 dark:hover:bg-stone-700 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 transition-all cursor-pointer"
          >
            <Code className="w-3.5 h-3.5 text-teal-500" />
            <span>Skema SQL Supabase</span>
          </button>
        </div>
      </div>

      {syncMessage && (
        <div className={`mt-3 p-3 rounded-xl text-xs font-medium border ${
          syncMessage.type === 'success'
            ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
            : 'bg-rose-50 dark:bg-rose-950/50 text-rose-800 dark:text-rose-300 border-rose-200 dark:border-rose-800'
        }`}>
          {syncMessage.text}
        </div>
      )}
    </div>
  );
}
