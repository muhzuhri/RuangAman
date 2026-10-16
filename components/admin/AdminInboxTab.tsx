"use client";

import React, { useState } from "react";
import {
  Search,
  Filter,
  Eye,
  Inbox,
  Trash2,
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

  return (
    <div className="space-y-4">
      {/* Search & Filter Control Bar */}
      <div className="bg-white dark:bg-[#163432] p-4 rounded-2xl border border-stone-200 dark:border-teal-900 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Search Box */}
          <div className="flex items-center bg-stone-50 dark:bg-stone-900/60 rounded-xl border border-stone-200 dark:border-teal-900 px-3 py-2">
            <Search className="w-4 h-4 text-stone-400 shrink-0" />
            <input
              type="text"
              placeholder="Cari Case ID, Token, Kronologi..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1 bg-transparent border-none outline-none text-xs text-stone-900 dark:text-stone-100 placeholder:text-stone-400 px-2 min-w-0"
            />
          </div>

          {/* Status Filter Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-teal-900 rounded-xl px-3 py-2 text-xs font-semibold text-stone-900 dark:text-stone-100 outline-none cursor-pointer truncate"
          >
            <option value="Semua Status" className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-semibold">
              Semua Status ({reports.length})
            </option>
            {ALL_STATUSES.map((st) => (
              <option key={st} value={st} className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-semibold">
                {st}
              </option>
            ))}
          </select>

          {/* Category Filter Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full bg-stone-50 dark:bg-stone-900/60 border border-stone-200 dark:border-teal-900 rounded-xl px-3 py-2 text-xs font-semibold text-stone-900 dark:text-stone-100 outline-none cursor-pointer truncate"
          >
            <option value="Semua Kategori" className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-semibold">
              Semua Kategori
            </option>
            {allCategories.map((cat) => (
              <option key={cat} value={cat} className="bg-white dark:bg-stone-900 text-stone-900 dark:text-stone-100 font-semibold">
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Sub-Filter (Selesai vs Belum Selesai) */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-t border-stone-100 dark:border-stone-800/80 pt-3 gap-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <div className="flex items-center gap-1.5 shrink-0">
              <Filter className="w-3.5 h-3.5 text-teal-500" />
              <span className="text-xs font-semibold text-stone-600 dark:text-stone-400">
                Filter Penanganan:
              </span>
            </div>
            <div className="grid grid-cols-3 sm:flex items-center gap-1 bg-stone-100 dark:bg-stone-900/80 p-1 rounded-xl border border-stone-200 dark:border-stone-800">
              <button
                type="button"
                onClick={() => setCompletionFilter("semua")}
                className={`px-2.5 py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer text-center ${
                  completionFilter === "semua"
                    ? "bg-teal-600 text-white shadow-xs"
                    : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
                }`}
              >
                Semua ({reports.length})
              </button>
              <button
                type="button"
                onClick={() => setCompletionFilter("belum")}
                className={`px-2.5 py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer text-center ${
                  completionFilter === "belum"
                    ? "bg-amber-600 text-white shadow-xs"
                    : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
                }`}
              >
                Belum ({reports.filter((r) => r.status !== "Selesai").length})
              </button>
              <button
                type="button"
                onClick={() => setCompletionFilter("selesai")}
                className={`px-2.5 py-1.5 text-[11px] font-bold rounded-lg transition-all cursor-pointer text-center ${
                  completionFilter === "selesai"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-stone-100"
                }`}
              >
                Selesai ({reports.filter((r) => r.status === "Selesai").length})
              </button>
            </div>
          </div>

          <span className="text-[11px] sm:text-xs font-medium text-stone-500 dark:text-stone-400 text-right sm:text-left">
            Menampilkan{" "}
            <strong className="text-teal-600 dark:text-teal-400 font-bold">
              {filteredReports.length}
            </strong>{" "}
            dari {reports.length} kasus
          </span>
        </div>
      </div>

      {/* Case List Data View */}
      {filteredReports.length === 0 ? (
        <div className="bg-white dark:bg-[#163432] border border-stone-200 dark:border-teal-900 border-dashed rounded-2xl p-10 text-center space-y-3">
          <Inbox className="w-10 h-10 text-stone-400 mx-auto" />
          <h4 className="font-bold text-stone-700 dark:text-stone-300">
            Tidak ada laporan yang cocok
          </h4>
          <p className="text-xs text-stone-500 max-w-sm mx-auto">
            Coba sesuaikan kata kunci pencarian atau reset filter status dan
            kategori di atas.
          </p>
        </div>
      ) : (
        <>
          {/* Mobile Case Cards View (Clean, responsive layout on small screens) */}
          <div className="space-y-3 md:hidden">
            {filteredReports.map((report) => (
              <div
                key={report.caseId}
                className="bg-white dark:bg-[#163432] p-4 rounded-2xl border border-stone-200 dark:border-teal-900 shadow-xs space-y-3"
              >
                {/* Header: Case ID & Status Dropdown */}
                <div className="flex items-center justify-between gap-2">
                  <span className="font-mono font-bold text-xs text-teal-600 dark:text-teal-400 bg-teal-50 dark:bg-teal-950/60 px-2.5 py-1 rounded-lg border border-teal-200 dark:border-teal-900">
                    {report.caseId}
                  </span>
                  <select
                    value={report.status}
                    onChange={(e) =>
                      onUpdateStatus(report, e.target.value as CaseStatus)
                    }
                    className={`text-[11px] font-bold px-2.5 py-1.5 rounded-lg border outline-none cursor-pointer max-w-[160px] ${
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

                {/* Category & Details */}
                <div className="space-y-1.5">
                  <span className="inline-block px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-[11px] font-semibold">
                    {report.category}
                  </span>

                  <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400 pt-1">
                    <span>
                      Token:{" "}
                      <strong className="font-mono text-stone-800 dark:text-stone-200">
                        {report.anonymousToken}
                      </strong>
                    </span>
                    <span>{formatDateID(report.receivedAt)}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 border-t border-stone-100 dark:border-stone-800/80 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setReportToDelete(report)}
                    className="flex-1 py-2 px-3 rounded-xl bg-red-50 hover:bg-red-100 dark:bg-red-950/50 dark:hover:bg-red-900/70 text-red-600 dark:text-red-300 border border-red-200 dark:border-red-900 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Hapus</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onSelectReport(report)}
                    className="flex-1 py-2 px-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Periksa Kasus</span>
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Case Data Table (Visible on md breakpoint and above) */}
          <div className="hidden md:block bg-white dark:bg-[#163432] rounded-2xl border border-stone-200 dark:border-teal-900 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-stone-50/80 dark:bg-stone-900/60 border-b border-stone-200 dark:border-teal-900/60 text-stone-500 dark:text-stone-400 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3.5 px-4">Case ID</th>
                    <th className="py-3.5 px-4">Token Anonim</th>
                    <th className="py-3.5 px-4">Kategori Kasus</th>
                    <th className="py-3.5 px-4">Waktu Diterima</th>
                    <th className="py-3.5 px-4">Status Kasus</th>
                    <th className="py-3.5 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100 dark:divide-teal-900/40">
                  {filteredReports.map((report) => (
                    <tr
                      key={report.caseId}
                      className="hover:bg-stone-50/80 dark:hover:bg-teal-950/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-teal-600 dark:text-teal-400 whitespace-nowrap">
                        <span className="bg-teal-50 dark:bg-teal-950/60 px-2.5 py-1 rounded-lg border border-teal-200 dark:border-teal-900">
                          {report.caseId}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-semibold text-stone-700 dark:text-stone-300 whitespace-nowrap">
                        {report.anonymousToken}
                      </td>

                      <td className="py-3.5 px-4 text-stone-800 dark:text-stone-200 font-medium">
                        <span className="px-2.5 py-1 rounded-full bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 text-[11px] font-semibold">
                          {report.category}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-stone-600 dark:text-stone-300 font-medium whitespace-nowrap">
                        {formatDateID(report.receivedAt)}
                      </td>

                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <select
                          value={report.status}
                          onChange={(e) =>
                            onUpdateStatus(report, e.target.value as CaseStatus)
                          }
                          className={`text-xs font-bold px-2.5 py-1.5 rounded-lg border outline-none cursor-pointer ${STATUS_STYLES[report.status] || ""}`}
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

                      <td className="py-3.5 px-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          {/* Tombol Periksa */}
                          <button
                            type="button"
                            onClick={() => onSelectReport(report)}
                            className="px-3 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-medium transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Periksa</span>
                          </button>

                          {/* Tombol Hapus */}
                          <button
                            type="button"
                            onClick={() => setReportToDelete(report)}
                            className="px-3.5 py-2 rounded-lg bg-red-50 hover:bg-red-100 dark:bg-red-950/40 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 border border-red-200/80 dark:border-red-900/80 text-xs font-medium transition-all inline-flex items-center gap-1.5 cursor-pointer"
                            title="Hapus kasus ini"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Hapus</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Pop Up Modal Konfirmasi Hapus Kasus */}
      <AdminDeleteConfirmModal
        report={reportToDelete}
        isOpen={!!reportToDelete}
        onClose={() => setReportToDelete(null)}
        onConfirmDelete={onDeleteReport}
      />
    </div>
  );
}
