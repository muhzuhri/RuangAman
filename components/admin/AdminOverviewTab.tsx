'use client';

import React from 'react';
import {
  FileText,
  Clock,
  CheckCircle,
  Building2,
  PieChart,
  Inbox,
  ChevronRight,
} from 'lucide-react';
import { type Report, type CaseStatus } from '@/lib/types';
import { STATUS_STYLES, ALL_STATUSES } from '@/lib/adminUtils';

interface AdminOverviewTabProps {
  reports: Report[];
  onSelectTab: (tab: 'inbox' | 'chat') => void;
  onSelectReport: (report: Report) => void;
}

export default function AdminOverviewTab({
  reports = [],
  onSelectTab,
  onSelectReport,
}: AdminOverviewTabProps) {
  const safeReports = Array.isArray(reports) ? reports.filter(Boolean) : [];

  // Stat Summary calculation — covers all status types cleanly
  const stats = {
    total: safeReports.length,
    diterima: safeReports.filter((r) => r?.status === 'Laporan Diterima').length,
    diproses: safeReports.filter(
      (r) =>
        r?.status === 'Diproses' ||
        r?.status === 'Diverifikasi' ||
        r?.status === 'Mediasi & Konseling' ||
        r?.status === 'Eskalasi ke Komite Etik'
    ).length,
    selesai: safeReports.filter((r) => r?.status === 'Selesai').length,
  };

  // Status breakdown
  const statusCounts = ALL_STATUSES.reduce<Record<CaseStatus, number>>((acc, status) => {
    acc[status] = safeReports.filter((r) => r?.status === status).length;
    return acc;
  }, {} as Record<CaseStatus, number>);

  // Category counts
  const categoryCounts = safeReports.reduce<Record<string, number>>((acc, r) => {
    if (r?.category) {
      acc[r.category] = (acc[r.category] || 0) + 1;
    }
    return acc;
  }, {});

  const recentReports = [...safeReports]
    .sort(
      (a, b) => new Date(b?.receivedAt || 0).getTime() - new Date(a?.receivedAt || 0).getTime()
    )
    .slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white dark:bg-[#163432] p-4 rounded-2xl border border-stone-200 dark:border-teal-900 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-600 dark:text-stone-300">Total Kasus</span>
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-stone-900 dark:text-stone-100 mt-2">{stats.total}</p>
          <span className="text-[11px] text-stone-500 dark:text-stone-400">Tercatat di sistem</span>
        </div>

        <div className="bg-white dark:bg-[#163432] p-4 rounded-2xl border border-stone-200 dark:border-teal-900 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-700 dark:text-amber-300">Baru Diterima</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <Inbox className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-stone-900 dark:text-stone-100 mt-2">{stats.diterima}</p>
          <span className="text-[11px] text-amber-600 dark:text-amber-400">Menunggu verifikasi</span>
        </div>

        <div className="bg-white dark:bg-[#163432] p-4 rounded-2xl border border-stone-200 dark:border-teal-900 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">Sedang Diproses</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-stone-900 dark:text-stone-100 mt-2">{stats.diproses}</p>
          <span className="text-[11px] text-indigo-600 dark:text-indigo-400">Dalam Penyelidikan / Etik</span>
        </div>

        <div className="bg-white dark:bg-[#163432] p-4 rounded-2xl border border-stone-200 dark:border-teal-900 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">Kasus Selesai</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-bold text-stone-900 dark:text-stone-100 mt-2">{stats.selesai}</p>
          <span className="text-[11px] text-emerald-600 dark:text-emerald-400">Telah ditangani</span>
        </div>
      </div>

      {/* Analytics Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-white dark:bg-[#163432] p-5 rounded-2xl border border-stone-200 dark:border-teal-900 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm flex items-center gap-2">
              <PieChart className="w-4 h-4 text-teal-500" />
              <span>Distribusi Status Kasus</span>
            </h3>
            <button
              onClick={() => onSelectTab('inbox')}
              className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline flex items-center gap-1 cursor-pointer"
            >
              Lihat Detail <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {ALL_STATUSES.map((status) => {
              const count = statusCounts[status] || 0;
              const percent = reports.length > 0 ? Math.round((count / reports.length) * 100) : 0;
              return (
                <div key={status} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium text-stone-700 dark:text-stone-300">
                    <span>{status}</span>
                    <span className="font-semibold text-stone-900 dark:text-stone-100">{count} kasus ({percent}%)</span>
                  </div>
                  <div className="w-full bg-stone-100 dark:bg-stone-800 rounded-full h-3.5 overflow-hidden">
                    <div
                      className="bg-teal-500 h-3.5 rounded-full transition-all duration-500"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white dark:bg-[#163432] p-5 rounded-2xl border border-stone-200 dark:border-teal-900 shadow-xs space-y-4">
          <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm flex items-center gap-2">
            <Building2 className="w-4 h-4 text-teal-500" />
            <span>Kategori Laporan Masuk</span>
          </h3>

          <div className="space-y-3">
            {Object.keys(categoryCounts).length === 0 ? (
              <p className="text-xs text-stone-400 py-6 text-center">Belum ada data kategori.</p>
            ) : (
              Object.entries(categoryCounts).map(([cat, count]) => {
                const percent = reports.length > 0 ? Math.round((count / reports.length) * 100) : 0;
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium text-stone-700 dark:text-stone-300">
                      <span className="truncate max-w-[240px]">{cat}</span>
                      <span className="font-semibold text-stone-900 dark:text-stone-100">{count} kasus ({percent}%)</span>
                    </div>
                    <div className="w-full bg-stone-100 dark:bg-stone-800 rounded-full h-3.5 overflow-hidden">
                      <div
                        className="bg-indigo-500 h-3.5 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Recent Activity List */}
      <div className="bg-white dark:bg-[#163432] p-5 rounded-2xl border border-stone-200 dark:border-teal-900 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-stone-900 dark:text-stone-100 text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-teal-500" />
            <span>Laporan Terbaru Masuk</span>
          </h3>
          <button
            onClick={() => onSelectTab('inbox')}
            className="text-xs font-semibold text-teal-600 dark:text-teal-400 hover:underline cursor-pointer"
          >
            Buka Inbox Kasus
          </button>
        </div>

        <div className="divide-y divide-stone-100 dark:divide-stone-800">
          {recentReports.length === 0 ? (
            <p className="text-xs text-stone-400 py-4 text-center">Tidak ada laporan.</p>
          ) : (
            recentReports.map((r) => (
              <div
                key={r.caseId}
                onClick={() => onSelectReport(r)}
                className="py-3 flex items-center justify-between gap-4 hover:bg-stone-50 dark:hover:bg-stone-800/50 px-2 rounded-xl transition-colors cursor-pointer"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-xs text-teal-600 dark:text-teal-400">
                      {r.caseId}
                    </span>
                    <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${STATUS_STYLES[r.status] || ''}`}>
                      {r.status}
                    </span>
                  </div>
                  <p className="text-xs font-semibold text-stone-800 dark:text-stone-200 mt-1 truncate">
                    {r.category}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-stone-400 shrink-0" />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
