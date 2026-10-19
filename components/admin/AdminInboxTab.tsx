"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  Filter,
  Eye,
  Inbox,
  Trash2,
  Lock,
  Calendar,
  X,
  Layers,
  Sparkles,
  ArrowUpDown,
  ShieldAlert,
} from "lucide-react";
import {
  type Report,
  type CaseStatus,
  type EvidenceVerificationStatus,
} from "@/lib/types";
import {
  formatDateID,
  STATUS_STYLES,
  ALL_STATUSES,
} from "@/lib/adminUtils";

import AdminDeleteConfirmModal from "./AdminDeleteConfirmModal";
import { getAITriageData, getRiskBadgeConfig } from "./AdminCaseDetailModal";

interface AdminInboxTabProps {
  reports: Report[];
  filteredReports: Report[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  categoryFilter: string;
  setCategoryFilter: (category: string) => void;
  completionFilter: "semua" | "selesai" | "belum";
  setCompletionFilter: (filter: "semua" | "selesai" | "belum") => void;
  onSelectReport: (report: Report) => void;
  onUpdateStatus: (report: Report, newStatus: CaseStatus) => void;
  onVerifyEvidence: (
    report: Report,
    evidenceId: string,
    status: EvidenceVerificationStatus,
    note: string,
  ) => void;
  onDeleteReport: (report: Report) => void;
  allCategories: string[];
}

export default function AdminInboxTab({
  reports,
  filteredReports,
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  categoryFilter,
  setCategoryFilter,
  completionFilter,
  setCompletionFilter,
  onSelectReport,
  onUpdateStatus,
  onVerifyEvidence,
  onDeleteReport,
  allCategories,
}: AdminInboxTabProps) {
  const [reportToDelete, setReportToDelete] = useState<Report | null>(null);

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    statusFilter !== "Semua Status" ||
    categoryFilter !== "Semua Kategori" ||
    completionFilter !== "semua";

  const handleResetFilters = () => {
    setSearchQuery("");
    setStatusFilter("Semua Status");
    setCategoryFilter("Semua Kategori");
    setCompletionFilter("semua");
  };

  const pendingCount = reports.filter((r) => r.status !== "Selesai").length;
  const completedCount = reports.filter((r) => r.status === "Selesai").length;

  return (
    <div className="space-y-5">
      {/* ─── Control Bar: Search & Advanced Filters ─────────────────────────── */}
      <div className="bg-white/95 dark:bg-gray-700/95 border border-stone-200 dark:border-gray-600 rounded-3xl p-5 sm:p-6 shadow-xl backdrop-blur-xl space-y-4">
        {/* Top Search & Dropdowns Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
          {/* Search Box (6 Cols) */}
          <div className="md:col-span-6 relative flex items-center bg-stone-50/90 dark:bg-gray-800/90 rounded-2xl border border-stone-200 dark:border-gray-600 px-3.5 py-2.5 focus-within:border-teal-500 focus-within:ring-2 focus-within:ring-teal-500/20 transition-all">
            <Search className="w-4 h-4 text-teal-600 dark:text-teal-400 shrink-0" />
            <input
              type="text"
              placeholder="Cari ID Kasus, Token Anonim, Kronologi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-xs sm:text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 px-2.5 min-w-0"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="p-1 rounded-full text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 transition-colors"
                title="Hapus pencarian"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Status Filter Dropdown (3 Cols) */}
          <div className="md:col-span-3 relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full h-full bg-stone-50/90 dark:bg-gray-800/90 border border-stone-200 dark:border-gray-600 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-stone-900 dark:text-stone-100 outline-none cursor-pointer truncate appearance-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all pr-8"
            >
              <option
                value="Semua Status"
                className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-semibold"
              >
                Semua Status ({reports.length})
              </option>
              {ALL_STATUSES.map((st) => (
                <option
                  key={st}
                  value={st}
                  className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-semibold"
                >
                  {st}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
              <ArrowUpDown className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Category Filter Dropdown (3 Cols) */}
          <div className="md:col-span-3 relative">
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full h-full bg-stone-50/90 dark:bg-gray-800/90 border border-stone-200 dark:border-gray-600 rounded-2xl px-3.5 py-2.5 text-xs font-bold text-stone-900 dark:text-stone-100 outline-none cursor-pointer truncate appearance-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all pr-8"
            >
              <option
                value="Semua Kategori"
                className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-semibold"
              >
                Semua Kategori ({allCategories.length})
              </option>
              {allCategories.map((cat) => (
                <option
                  key={cat}
                  value={cat}
                  className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-semibold"
                >
                  {cat}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-stone-400">
              <ArrowUpDown className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Sub-Filter Bar: Completion Pills & Results Tally */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-stone-200/80 dark:border-gray-600/80 pt-3.5 gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs font-bold text-stone-600 dark:text-stone-300 mr-1">
              <Filter className="w-3.5 h-3.5 text-teal-500" />
              <span>Status Penanganan:</span>
            </div>

            <div className="inline-flex items-center gap-1 bg-stone-100 dark:bg-gray-800 p-1 rounded-2xl border border-stone-200 dark:border-gray-600">
              <button
                type="button"
                onClick={() => setCompletionFilter("semua")}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  completionFilter === "semua"
                    ? "bg-teal-600 text-white shadow-xs"
                    : "text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white"
                }`}
              >
                <span>Semua</span>
                <span className="text-[10px] opacity-80 font-mono">({reports.length})</span>
              </button>

              <button
                type="button"
                onClick={() => setCompletionFilter("belum")}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  completionFilter === "belum"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white"
                }`}
              >
                <span>Aktif/Belum</span>
                <span className="text-[10px] opacity-80 font-mono">({pendingCount})</span>
              </button>

              <button
                type="button"
                onClick={() => setCompletionFilter("selesai")}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
                  completionFilter === "selesai"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white"
                }`}
              >
                <span>Tuntas</span>
                <span className="text-[10px] opacity-80 font-mono">({completedCount})</span>
              </button>
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-xs text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1 font-semibold ml-2 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset Filter</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-stone-500 dark:text-stone-400">
            <span>Ditemukan:</span>
            <span className="font-extrabold text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-gray-800 px-2.5 py-0.5 rounded-lg border border-teal-200 dark:border-gray-600">
              {filteredReports.length} dari {reports.length} Kasus
            </span>
          </div>
        </div>
      </div>

      {/* ─── Case List: Empty State vs Data Views ────────────────────────────── */}
      {filteredReports.length === 0 ? (
        <div className="bg-white/95 dark:bg-gray-700/95 border-2 border-dashed border-stone-300 dark:border-gray-600 rounded-3xl p-12 text-center space-y-4 shadow-sm backdrop-blur-xl">
          <div className="w-14 h-14 bg-teal-50 dark:bg-gray-800 rounded-2xl flex items-center justify-center mx-auto text-teal-600 dark:text-teal-400 border border-teal-200 dark:border-gray-600">
            <Inbox className="w-7 h-7" />
          </div>
          <div className="space-y-1">
            <h4 className="text-base font-bold text-stone-800 dark:text-stone-200">
              Tidak Ada Berkas yang Cocok
            </h4>
            <p className="text-xs text-stone-500 dark:text-stone-400 max-w-sm mx-auto leading-relaxed">
              Tidak ditemukan aduan dengan kriteria pencarian atau filter yang dipilih. Coba sesuaikan kata kunci atau reset filter.
            </p>
          </div>
          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              Reset Semua Filter
            </button>
          )}
        </div>
      ) : (
        <>
          {/* ─── Mobile View: Modern Cards (Small Screens) ───────────────────── */}
          <div className="space-y-3.5 md:hidden">
            {filteredReports.map((report) => {
              const triage = getAITriageData(report);
              const risk = getRiskBadgeConfig(triage.riskLevel);

              return (
                <div
                  key={report.caseId}
                  className="bg-white/95 dark:bg-gray-700/95 p-4 rounded-3xl border border-stone-200 dark:border-gray-600 shadow-lg space-y-3.5 backdrop-blur-xl group hover:border-teal-400 transition-all"
                >
                  {/* Top Bar: Case ID & Status Selector */}
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono font-black text-xs text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-gray-800 px-3 py-1 rounded-xl border border-teal-200 dark:border-gray-600">
                      {report.caseId}
                    </span>

                    <select
                      value={report.status}
                      onChange={(e) =>
                        onUpdateStatus(report, e.target.value as CaseStatus)
                      }
                      className={`text-[11px] font-bold px-3 py-1.5 rounded-xl border outline-none cursor-pointer max-w-[170px] shadow-xs ${
                        STATUS_STYLES[report.status] || ""
                      }`}
                    >
                      {ALL_STATUSES.map((st) => (
                        <option
                          key={st}
                          value={st}
                          className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-semibold"
                        >
                          {st}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Category & AI Risk Pill */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="px-2.5 py-1 rounded-xl bg-stone-100 dark:bg-gray-800 text-stone-800 dark:text-stone-200 text-xs font-bold border border-stone-200 dark:border-gray-600">
                        {report.category}
                      </span>
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${risk.badgeCls}`}
                      >
                        <span>{risk.badgeIcon}</span>
                        <span>{risk.riskBadge}</span>
                      </span>
                    </div>

                    <p className="text-xs text-stone-600 dark:text-stone-300 line-clamp-2 leading-relaxed">
                      {report.chronology || "Tidak ada narasi kronologi."}
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400 pt-1 font-mono">
                      <span className="flex items-center gap-1">
                        <Lock className="w-3 h-3 text-teal-500" />
                        <span>Token: <strong>{report.anonymousToken}</strong></span>
                      </span>
                      <span>{formatDateID(report.receivedAt)}</span>
                    </div>
                  </div>

                  {/* Actions Group */}
                  <div className="pt-2.5 border-t border-stone-100 dark:border-gray-600/80 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setReportToDelete(report)}
                      className="py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/70 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                      title="Hapus berkas ini"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Hapus</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => onSelectReport(report)}
                      className="flex-1 py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Periksa Berkas</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ─── Desktop View: Modern Glassmorphic Table (md & above) ────────── */}
          <div className="hidden md:block bg-white/95 dark:bg-gray-700/95 rounded-3xl border border-stone-200 dark:border-gray-600 shadow-xl overflow-hidden backdrop-blur-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-50/90 dark:bg-gray-800/90 border-b border-stone-200 dark:border-gray-600 text-stone-500 dark:text-stone-400 font-extrabold uppercase tracking-wider text-[11px]">
                    <th className="py-4 px-5">ID Kasus</th>
                    <th className="py-4 px-5">Token Anonim</th>
                    <th className="py-4 px-5">Kategori & AI Triage</th>
                    <th className="py-4 px-5">Waktu Laporan</th>
                    <th className="py-4 px-5">Status Tindak Lanjut</th>
                    <th className="py-4 px-5 text-right">Aksi Satgas</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-stone-100 dark:divide-gray-600/80">
                  {filteredReports.map((report) => {
                    const triage = getAITriageData(report);
                    const risk = getRiskBadgeConfig(triage.riskLevel);

                    return (
                      <tr
                        key={report.caseId}
                        className="hover:bg-stone-50/70 dark:hover:bg-gray-800/60 transition-colors group"
                      >
                        {/* Case ID */}
                        <td className="py-4 px-5 font-mono font-extrabold text-teal-600 dark:text-teal-400 whitespace-nowrap">
                          <span className="bg-teal-50 dark:bg-gray-800 px-3 py-1.5 rounded-xl border border-teal-200 dark:border-gray-600 shadow-xs inline-block">
                            {report.caseId}
                          </span>
                        </td>

                        {/* Token */}
                        <td className="py-4 px-5 font-mono font-semibold text-stone-700 dark:text-stone-300 whitespace-nowrap">
                          <span className="flex items-center gap-1.5">
                            <Lock className="w-3.5 h-3.5 text-stone-400 dark:text-stone-500 shrink-0" />
                            <span>{report.anonymousToken}</span>
                          </span>
                        </td>

                        {/* Category & Risk */}
                        <td className="py-4 px-5 text-stone-800 dark:text-stone-200 font-medium">
                          <div className="flex flex-col gap-1.5 items-start">
                            <span className="px-2.5 py-0.5 rounded-xl bg-stone-100 dark:bg-gray-800 text-stone-800 dark:text-stone-200 text-xs font-bold border border-stone-200 dark:border-gray-600">
                              {report.category}
                            </span>
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${risk.badgeCls}`}
                            >
                              <span>{risk.badgeIcon}</span>
                              <span>{risk.riskBadge}</span>
                            </span>
                          </div>
                        </td>

                        {/* Time */}
                        <td className="py-4 px-5 text-stone-600 dark:text-stone-300 font-medium whitespace-nowrap font-mono text-[11px]">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-teal-500 shrink-0" />
                            <span>{formatDateID(report.receivedAt)}</span>
                          </span>
                        </td>

                        {/* Status Dropdown */}
                        <td className="py-4 px-5 whitespace-nowrap">
                          <select
                            value={report.status}
                            onChange={(e) =>
                              onUpdateStatus(report, e.target.value as CaseStatus)
                            }
                            className={`text-xs font-bold px-3 py-1.5 rounded-xl border outline-none cursor-pointer shadow-xs transition-all ${
                              STATUS_STYLES[report.status] || ""
                            }`}
                          >
                            {ALL_STATUSES.map((st) => (
                              <option
                                key={st}
                                value={st}
                                className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-semibold"
                              >
                                {st}
                              </option>
                            ))}
                          </select>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-5 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => onSelectReport(report)}
                              className="px-3.5 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold transition-all shadow-md inline-flex items-center gap-1.5 cursor-pointer hover:scale-[1.02]"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Periksa</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => setReportToDelete(report)}
                              className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:hover:bg-rose-900/60 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/70 text-xs font-medium transition-all inline-flex items-center cursor-pointer"
                              title="Hapus berkas ini"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Modal */}
      <AdminDeleteConfirmModal
        report={reportToDelete}
        isOpen={!!reportToDelete}
        onClose={() => setReportToDelete(null)}
        onConfirmDelete={onDeleteReport}
      />
    </div>
  );
}
