'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import {
  type Report,
  type CaseStatus,
  type EvidenceVerificationStatus,
  type Message,
  type AuditLog,
  MOCK_REPORTS,
} from '@/lib/types';
import {
  fetchReportsWithStatus,
  seedMockReportsToSupabase,
  updateReportInDatabase,
  deleteReportFromDatabase,
  type SupabaseStatusInfo,
} from '@/lib/reportsService';
import { exportReportsToCSV, checkIsAdminAuthenticated, clearAdminAuthSession } from '@/lib/adminUtils';

import AdminHeader from '@/components/admin/AdminHeader';
import AdminDatabaseBanner from '@/components/admin/AdminDatabaseBanner';
import AdminOverviewTab from '@/components/admin/AdminOverviewTab';
import AdminInboxTab from '@/components/admin/AdminInboxTab';
import AdminChatTab from '@/components/admin/AdminChatTab';
import AdminCaseDetailModal from '@/components/admin/AdminCaseDetailModal';
import AdminSqlGuideModal from '@/components/admin/AdminSqlGuideModal';

export default function AdminDashboard() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthChecked, setIsAuthChecked] = useState(false);
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoadingReports, setIsLoadingReports] = useState(true);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [chatSelectedReport, setChatSelectedReport] = useState<Report | null>(null);
  const [chatInput, setChatInput] = useState('');

  // Dashboard Navigation & Filtering State
  const [activeTab, setActiveTab] = useState<'overview' | 'inbox' | 'chat'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('Semua Status');
  const [categoryFilter, setCategoryFilter] = useState<string>('Semua Kategori');
  const [completionFilter, setCompletionFilter] = useState<'semua' | 'selesai' | 'belum'>('semua');
  const [internalNoteInput, setInternalNoteInput] = useState('');
  const [internalNotesMap, setInternalNotesMap] = useState<Record<string, { id: string; text: string; author: string; timestamp: string }[]>>({});

  // Supabase Database Connection & Migration State
  const [dbStatus, setDbStatus] = useState<SupabaseStatusInfo | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [showSqlGuide, setShowSqlGuide] = useState(false);

  // ── Auth & Data Initializer ───────────────────────────────────────────────
  useEffect(() => {
    setMounted(true);
    try {
      if (!checkIsAdminAuthenticated()) {
        router.replace('/admin/login');
        return;
      }
    } catch (e) {
      console.warn('Storage check exception:', e);
    }
    setIsAuthenticated(true);
    setIsAuthChecked(true);

    // Fetch live data directly from Supabase — no stale mock pre-fill
    loadReports();

    // Load internal Satgas confidential notes from localStorage
    const savedNotes = typeof window !== 'undefined' ? localStorage.getItem('aman_kampus_internal_notes') : null;
    if (savedNotes) {
      try {
        setInternalNotesMap(JSON.parse(savedNotes));
      } catch {
        setInternalNotesMap({});
      }
    }

    const onStorage = (e: StorageEvent) => {
      if (e.key === 'aman_kampus_reports') loadReports();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, [router]);

  const loadReports = async () => {
    setIsLoadingReports(true);
    try {
      // Single HTTP request — no more duplicate checkSupabaseStatus call
      const { reports: fetched, status } = await fetchReportsWithStatus();
      setDbStatus(status);
      setReports(Array.isArray(fetched) ? fetched : []);
    } catch (e) {
      console.warn('Error loading reports in admin:', e);
      setReports([]);
    } finally {
      setIsLoadingReports(false);
    }
  };

  const handleSyncToSupabase = async () => {
    setIsSyncing(true);
    setSyncMessage(null);
    try {
      const result = await seedMockReportsToSupabase(MOCK_REPORTS);
      if (result.success) {
        setSyncMessage({
          type: 'success',
          text: `Berhasil mengunggah ${result.count} data sampel ke database Supabase!`,
        });
        await loadReports();
      } else {
        setSyncMessage({
          type: 'error',
          text: `Gagal mengunggah ke Supabase: ${result.error || 'Terjadi kesalahan'}`,
        });
      }
    } catch (err: any) {
      setSyncMessage({
        type: 'error',
        text: `Error sinkronisasi: ${err?.message || 'Koneksi terputus'}`,
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const resetMockReports = () => {
    localStorage.setItem('aman_kampus_reports', JSON.stringify(MOCK_REPORTS));
    setReports(MOCK_REPORTS);
    setSelectedReport(null);
  };

  const handleLogout = () => {
    clearAdminAuthSession();
    setIsAuthenticated(false);
    router.replace('/admin/login?logout=true');
  };

  const handleDeleteReport = async (reportToDelete: Report) => {
    // Optimistic update — remove from UI immediately
    setReports((prev) => prev.filter((r) => r.caseId !== reportToDelete.caseId));
    if (selectedReport?.caseId === reportToDelete.caseId) setSelectedReport(null);
    if (chatSelectedReport?.caseId === reportToDelete.caseId) setChatSelectedReport(null);

    const result = await deleteReportFromDatabase(reportToDelete.caseId);
    if (!result.success) {
      console.error('Gagal menghapus kasus dari database:', result.error);
      // Re-fetch to restore accurate state if delete failed
      loadReports();
    }
  };

  // ── Status & Evidence Handlers ────────────────────────────────────────────
  const handleUpdateStatus = (reportToUpdate: Report, newStatus: CaseStatus) => {
    const auditEntry: AuditLog = {
      id: `AL-${Date.now()}`,
      action: `Status diubah: "${reportToUpdate.status}" → "${newStatus}"`,
      actor: 'Satgas',
      timestamp: new Date().toISOString(),
    };
    const logs = reportToUpdate.auditLogs ? [...reportToUpdate.auditLogs, auditEntry] : [auditEntry];
    const updatedReport = { ...reportToUpdate, status: newStatus, auditLogs: logs };

    const updated = reports.map((r) => (r.caseId === reportToUpdate.caseId ? updatedReport : r));
    setReports(updated);
    if (selectedReport?.caseId === reportToUpdate.caseId) {
      setSelectedReport(updatedReport);
    }
    updateReportInDatabase(reportToUpdate.caseId, { status: newStatus, auditLogs: logs });
  };

  const handleVerifyEvidence = (reportToVerify: Report, evidenceId: string, status: EvidenceVerificationStatus, note: string = '') => {
    const evidenceItem = reportToVerify.evidences.find((e) => e.evidenceId === evidenceId);
    if (!evidenceItem) return;

    const auditEntry: AuditLog = {
      id: `AL-${Date.now()}`,
      action: `Satgas memverifikasi berkas "${evidenceItem.fileName}": Status Keaslian -> ${status}`,
      actor: 'Satgas',
      timestamp: new Date().toISOString(),
    };

    const newEvidences = reportToVerify.evidences.map((ev) => {
      if (ev.evidenceId === evidenceId) {
        return {
          ...ev,
          verificationStatus: status,
          verificationNote: note || (status === 'Terverifikasi Valid' ? 'Bukti tervalidasi asli & tidak terdeteksi manipulasi.' : 'Berkas ditandai mencurigakan atau tidak valid.'),
        };
      }
      return ev;
    });

    const logs = reportToVerify.auditLogs ? [...reportToVerify.auditLogs, auditEntry] : [auditEntry];
    const updatedReport = { ...reportToVerify, evidences: newEvidences, auditLogs: logs };

    const updated = reports.map((r) => (r.caseId === reportToVerify.caseId ? updatedReport : r));
    setReports(updated);
    if (selectedReport?.caseId === reportToVerify.caseId) {
      setSelectedReport(updatedReport);
    }
    updateReportInDatabase(reportToVerify.caseId, { evidences: newEvidences, auditLogs: logs });
  };

  const handleSendSatgasMessage = (e: React.FormEvent) => {
    e.preventDefault();
    const activeCase = selectedReport || (activeTab === 'chat' ? chatSelectedReport : null);
    if (!chatInput.trim() || !activeCase) return;

    const newMsg: Message = {
      id: `MSG-${Date.now()}`,
      sender: 'Satgas',
      text: chatInput,
      timestamp: new Date().toISOString(),
    };
    const auditEntry: AuditLog = {
      id: `AL-${Date.now()}`,
      action: 'Satgas mengirim pesan klarifikasi kepada pelapor',
      actor: 'Satgas',
      timestamp: new Date().toISOString(),
    };

    const msgs = activeCase.messages ? [...activeCase.messages, newMsg] : [newMsg];
    const logs = activeCase.auditLogs ? [...activeCase.auditLogs, auditEntry] : [auditEntry];
    const updatedReport = { ...activeCase, messages: msgs, auditLogs: logs };

    const updated = reports.map((r) => (r.caseId === activeCase.caseId ? updatedReport : r));
    setReports(updated);
    if (selectedReport?.caseId === activeCase.caseId) {
      setSelectedReport(updatedReport);
    }
    if (chatSelectedReport?.caseId === activeCase.caseId) {
      setChatSelectedReport(updatedReport);
    }
    setChatInput('');
    updateReportInDatabase(activeCase.caseId, { messages: msgs, auditLogs: logs });
  };

  const handleAddInternalNote = (e: React.FormEvent) => {
    e.preventDefault();
    const activeCase = selectedReport || (activeTab === 'chat' ? chatSelectedReport : null);
    if (!internalNoteInput.trim() || !activeCase) return;
    const caseId = activeCase.caseId;
    const newNote = {
      id: `NOTE-${Date.now()}`,
      text: internalNoteInput.trim(),
      author: 'Satgas Admin',
      timestamp: new Date().toISOString(),
    };
    const updatedMap = {
      ...internalNotesMap,
      [caseId]: [...(internalNotesMap[caseId] || []), newNote],
    };
    setInternalNotesMap(updatedMap);
    localStorage.setItem('aman_kampus_internal_notes', JSON.stringify(updatedMap));
    setInternalNoteInput('');
  };

  // Filtered reports computation for Instant Search & Filters (Fully Null-Safe)
  const safeReports = Array.isArray(reports) ? reports.filter(Boolean) : [];

  const filteredReports = safeReports.filter((r) => {
    const caseId = r.caseId || '';
    const token = r.anonymousToken || '';
    const cat = r.category || '';
    const chron = r.chronology || '';

    const matchesSearch =
      searchQuery === '' ||
      caseId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      token.toLowerCase().includes(searchQuery.toLowerCase()) ||
      cat.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chron.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'Semua Status' || r.status === statusFilter;
    const matchesCategory = categoryFilter === 'Semua Kategori' || r.category === categoryFilter;
    const matchesCompletion =
      completionFilter === 'semua' ||
      (completionFilter === 'selesai' && r.status === 'Selesai') ||
      (completionFilter === 'belum' && r.status !== 'Selesai');

    return matchesSearch && matchesStatus && matchesCategory && matchesCompletion;
  });

  const allCategories = Array.from(new Set(safeReports.map((r) => r.category).filter(Boolean)));

  // Auth Loading View
  if (!isAuthChecked || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-transparent flex flex-col items-center justify-center gap-4 text-stone-500 dark:text-stone-400">
        <div className="w-9 h-9 border-3 border-teal-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold tracking-wide">Memeriksa Hak Akses Admin...</p>
      </div>
    );
  }

  // Reports Loading Skeleton — shown while Supabase fetch is in-flight
  const ReportsLoadingSkeleton = () => (
    <div className="space-y-4 animate-pulse">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white dark:bg-[#163432] p-4 rounded-2xl border border-stone-200 dark:border-teal-900 h-24" />
        ))}
      </div>
      <div className="bg-white dark:bg-[#163432] p-5 rounded-2xl border border-stone-200 dark:border-teal-900 h-48" />
      <div className="bg-white dark:bg-[#163432] p-5 rounded-2xl border border-stone-200 dark:border-teal-900 h-64" />
    </div>
  );

  return (
    <div className="min-h-screen max-w-full overflow-x-hidden bg-[#ececec] dark:bg-[#061f1d] text-stone-900 dark:text-stone-100 relative z-10 font-sans selection:bg-teal-500/20">
      {/* 1. Navbar / Header */}
      <AdminHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        reportsCount={reports.length}
        selectedReport={selectedReport}
        setSelectedReport={setSelectedReport}
        loadReports={loadReports}
        handleLogout={handleLogout}
        onExportCSV={() => exportReportsToCSV(reports)}
        mounted={mounted}
      />

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6">
        {selectedReport ? (
          /* Full Page View: Case Examination Detail */
          <AdminCaseDetailModal
            report={selectedReport}
            onClose={() => setSelectedReport(null)}
            onUpdateStatus={(status) => handleUpdateStatus(selectedReport, status)}
            onVerifyEvidence={(evidenceId, status, note) => handleVerifyEvidence(selectedReport, evidenceId, status, note)}
            internalNotesMap={internalNotesMap}
            internalNoteInput={internalNoteInput}
            setInternalNoteInput={setInternalNoteInput}
            onAddInternalNote={handleAddInternalNote}
          />
        ) : (
          /* Main Dashboard Tabs with React Suspense Boundary for non-blocking rendering */
          <Suspense fallback={<ReportsLoadingSkeleton />}>
            {activeTab === 'overview' && (
              isLoadingReports ? <ReportsLoadingSkeleton /> : (
                <AdminOverviewTab
                  reports={reports}
                  onSelectTab={(tab) => setActiveTab(tab)}
                  onSelectReport={(report) => setSelectedReport(report)}
                />
              )
            )}

            {activeTab === 'inbox' && (
              isLoadingReports ? <ReportsLoadingSkeleton /> : (
                <AdminInboxTab
                  reports={reports}
                  filteredReports={filteredReports}
                  searchQuery={searchQuery}
                  setSearchQuery={setSearchQuery}
                  statusFilter={statusFilter}
                  setStatusFilter={setStatusFilter}
                  categoryFilter={categoryFilter}
                  setCategoryFilter={setCategoryFilter}
                  completionFilter={completionFilter}
                  setCompletionFilter={setCompletionFilter}
                  onSelectReport={(report) => setSelectedReport(report)}
                  onUpdateStatus={(report, status) => handleUpdateStatus(report, status)}
                  onVerifyEvidence={(report, evidenceId, status, note) => handleVerifyEvidence(report, evidenceId, status, note)}
                  onDeleteReport={handleDeleteReport}
                  allCategories={allCategories}
                />
              )
            )}

            {activeTab === 'chat' && (
              isLoadingReports ? <ReportsLoadingSkeleton /> : (
                <AdminChatTab
                  reports={reports}
                  selectedReport={chatSelectedReport}
                  onSelectReport={(report) => setChatSelectedReport(report)}
                  chatInput={chatInput}
                  setChatInput={setChatInput}
                  onSendSatgasMessage={handleSendSatgasMessage}
                  internalNotesMap={internalNotesMap}
                  internalNoteInput={internalNoteInput}
                  setInternalNoteInput={setInternalNoteInput}
                  onAddInternalNote={handleAddInternalNote}
                />
              )
            )}
          </Suspense>
        )}
      </main>

      <AdminSqlGuideModal
        isOpen={showSqlGuide}
        onClose={() => setShowSqlGuide(false)}
      />
    </div>
  );
}
