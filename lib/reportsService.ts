import { type Report, type CaseStatus, type Evidence, MOCK_REPORTS } from './types';

// Helper to check if Supabase is properly configured in environment variables
export function getSupabaseConfig() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const isConfigured =
    Boolean(url) &&
    Boolean(key) &&
    !url.includes('your-supabase-project') &&
    !key.includes('your-supabase-anon-key');

  return { url, key, isConfigured };
}

export type SupabaseStatusInfo = {
  isConfigured: boolean;
  connected: boolean;
  count: number;
  error?: string;
  url?: string;
};

/**
 * Fetch helper dengan AbortController timeout & penanganan error jaringan yang aman.
 */
async function fetchWithTimeout(
  resource: string,
  options: RequestInit = {},
  timeoutMs: number = 15000
): Promise<Response | null> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      console.warn(`[reportsService] Request timeout (> ${timeoutMs}ms) to ${resource}`);
    } else {
      console.warn(`[reportsService] Network unreachable for ${resource}, fallback ke penyimpanan lokal.`);
    }
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Helper: Ambil daftar ID kasus yang telah dihapus admin
 */
export function getDeletedCaseIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const deletedStr =
      localStorage.getItem('ruang_aman_deleted_case_ids') ||
      localStorage.getItem('aman_kampus_deleted_case_ids');
    if (deletedStr) {
      const parsed = JSON.parse(deletedStr);
      if (Array.isArray(parsed)) return new Set(parsed);
    }
  } catch {
    // ignore
  }
  return new Set();
}

/**
 * Helper: Ambil laporan lokal dari LocalStorage.
 */
export function getLocalReports(includeMocks: boolean = false): Report[] {
  let localReports: Report[] = [];
  if (typeof window !== 'undefined') {
    const savedStr =
      localStorage.getItem('ruang_aman_reports') ||
      localStorage.getItem('aman_kampus_reports');
    if (savedStr) {
      try {
        const parsed = JSON.parse(savedStr);
        if (Array.isArray(parsed)) localReports = parsed;
      } catch (e) {
        console.warn('Failed to parse local reports:', e);
      }
    }
  }

  const deletedIds = getDeletedCaseIds();
  const reportMap = new Map<string, Report>();
  if (includeMocks) {
    MOCK_REPORTS.forEach((r) => {
      if (!deletedIds.has(r.caseId)) reportMap.set(r.caseId, r);
    });
  }
  localReports.forEach((r) => {
    if (r.caseId && r.anonymousToken && !deletedIds.has(r.caseId)) {
      reportMap.set(r.caseId, r);
    }
  });

  return Array.from(reportMap.values()).sort(
    (a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime()
  );
}

/**
 * Simpan Laporan Baru (Menggunakan Next.js Secure Server Route /api/report)
 */
export async function saveReportToDatabase(report: Report): Promise<{ success: boolean; error?: string }> {
  // 1. Selalu simpan ke LocalStorage terlebih dahulu sebagai jaminan offline-first mutlak
  try {
    const savedStr =
      typeof window !== 'undefined'
        ? localStorage.getItem('ruang_aman_reports') || localStorage.getItem('aman_kampus_reports')
      : null;
    const existing: Report[] = savedStr ? JSON.parse(savedStr) : [];
    
    // Buat salinan hemat memori untuk localStorage tanpa base64 dataUrl raksasa (mencegah QuotaExceededError di HP)
    const reportForStorage: Report = {
      ...report,
      evidences: report.evidences?.map((ev) => ({
        ...ev,
        dataUrl: ev.dataUrl && ev.dataUrl.length < 30000 ? ev.dataUrl : undefined,
      })),
    };

    const filtered = existing.filter((r) => r.caseId !== report.caseId);
    filtered.unshift(reportForStorage);
    const trimmed = filtered.slice(0, 25);

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('ruang_aman_reports', JSON.stringify(trimmed));
        localStorage.setItem('aman_kampus_reports', JSON.stringify(trimmed));
      } catch (quotaErr) {
        // Fallback jika kuota localStorage ponsel penuh: bersihkan seluruh dataUrl bukti lama
        const stripped = trimmed.slice(0, 10).map((r) => ({
          ...r,
          evidences: r.evidences?.map((ev) => ({ ...ev, dataUrl: undefined })),
        }));
        localStorage.setItem('ruang_aman_reports', JSON.stringify(stripped));
        localStorage.setItem('aman_kampus_reports', JSON.stringify(stripped));
      }
    }
  } catch (e) {
    console.warn('LocalStorage save error:', e);
  }

  // 2. Kirim ke Server Route Next.js (/api/report) yang menangani penyimpanan server-side dan Telegram
  try {
    const response = await fetchWithTimeout(
      '/api/report',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: report.anonymousToken,
          anonymousToken: report.anonymousToken,
          caseId: report.caseId,
          category: report.category,
          incidentTime: report.incidentTime,
          involvedParties: report.involvedParties,
          targetFaculty: report.targetFaculty,
          chronology: report.chronology,
          evidences: report.evidences,
          evidencesCount: report.evidences?.length || 0,
          aiTriage: report.aiTriage,
          receivedAt: report.receivedAt,
          abuseFlags: report.abuseFlags,
          auditLogs: report.auditLogs,
          messages: report.messages,
        }),
      },
      25000 // 25 detik timeout agar unggahan foto dari jaringan seluler ponsel tidak putus di tengah jalan
    );

    if (response && response.ok) {
      return { success: true };
    }
    return { success: true }; // offline fallback tetap sukses
  } catch (err: any) {
    console.warn('Koneksi server route offline, laporan tetap tersimpan di lokal:', err?.message || err);
    return { success: true };
  }
}

/**
 * Fetch Laporan untuk Dashboard Admin via Secure Backend Route (/api/admin/reports)
 */
export async function fetchReportsFromDatabase(limit: number = 50): Promise<Report[]> {
  try {
    const response = await fetchWithTimeout('/api/admin/reports', { method: 'GET' }, 3000);
    if (response && response.ok) {
      const data = await response.json();
      if (data.success && Array.isArray(data.reports)) {
        const deletedIds = getDeletedCaseIds();
        return data.reports.filter((r: Report) => !deletedIds.has(r.caseId)).slice(0, limit);
      }
    }
  } catch (err) {
    console.warn('[reportsService] Gagal fetch dari server API admin, menggunakan local fallback:', err);
  }

  // Fallback instan ke lokal
  return getLocalReports(false);
}

/**
 * Periksa Status Koneksi Database
 */
export async function checkSupabaseStatus(): Promise<SupabaseStatusInfo> {
  const { url, isConfigured } = getSupabaseConfig();
  if (!isConfigured) {
    return {
      isConfigured: false,
      connected: false,
      count: 0,
      url,
      error: 'URL / Anon Key Supabase belum dikonfigurasi di .env.local',
    };
  }

  try {
    const response = await fetchWithTimeout('/api/admin/reports', { method: 'GET' }, 2000);
    if (response && response.ok) {
      const data = await response.json();
      return {
        isConfigured: true,
        connected: Boolean(data.database?.connected),
        count: Array.isArray(data.reports) ? data.reports.length : 0,
        url,
        error: data.database?.error,
      };
    }
    return {
      isConfigured: true,
      connected: false,
      count: 0,
      url,
      error: 'Koneksi API database tidak merespons',
    };
  } catch (err: any) {
    return {
      isConfigured: true,
      connected: false,
      count: 0,
      url,
      error: err?.message || 'Gagal terhubung ke database',
    };
  }
}

/**
 * Fetch Laporan & Status Koneksi secara Paralel/Bersamaan
 */
export async function fetchReportsWithStatus(limit: number = 50): Promise<{
  reports: Report[];
  status: SupabaseStatusInfo;
}> {
  try {
    const response = await fetchWithTimeout('/api/admin/reports', { method: 'GET' }, 3000);
    if (response && response.ok) {
      const data = await response.json();
      const deletedIds = getDeletedCaseIds();
      const raw = Array.isArray(data.reports) ? data.reports : [];
      const reports = raw.filter((r: Report) => !deletedIds.has(r.caseId)).slice(0, limit);

      return {
        reports,
        status: {
          isConfigured: Boolean(data.database?.isConfigured),
          connected: Boolean(data.database?.connected),
          count: reports.length,
          url: data.database?.url,
          error: data.database?.error,
        },
      };
    }
  } catch (err) {
    console.warn('[reportsService] Fetch reports with status timed out, falling back to local');
  }

  const local = getLocalReports(false);
  const { url, isConfigured } = getSupabaseConfig();
  return {
    reports: local,
    status: {
      isConfigured,
      connected: false,
      count: local.length,
      url,
      error: 'Server offline / fallback lokal aktif',
    },
  };
}

export async function fetchAdminDashboardDataParallel(limit: number = 50): Promise<{
  reports: Report[];
  status: SupabaseStatusInfo;
}> {
  return fetchReportsWithStatus(limit);
}

/**
 * Seed data sampel ke Supabase
 */
export async function seedMockReportsToSupabase(reportsToSeed: Report[] = MOCK_REPORTS): Promise<{ success: boolean; count: number; error?: string }> {
  const { url, key, isConfigured } = getSupabaseConfig();
  if (!isConfigured) return { success: false, count: 0, error: 'Supabase belum dikonfigurasi di .env.local' };

  try {
    const rows = reportsToSeed.map((report) => ({
      case_id: report.caseId,
      anonymous_token: report.anonymousToken,
      category: report.category,
      incident_time: report.incidentTime || null,
      involved_parties: report.involvedParties || null,
      target_faculty: report.targetFaculty || null,
      chronology: report.chronology,
      evidences: report.evidences || [],
      messages: report.messages || [],
      audit_logs: report.auditLogs || [],
      status: report.status,
      received_at: report.receivedAt,
      is_anonymous: report.isAnonymous,
      abuse_flags: report.abuseFlags || [],
      ai_triage: report.aiTriage || null,
    }));

    const response = await fetchWithTimeout(
      `${url}/rest/v1/reports`,
      {
        method: 'POST',
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
          Prefer: 'resolution=ignore-duplicates,return=representation',
        },
        body: JSON.stringify(rows),
      },
      4000
    );

    if (response && response.ok) {
      return { success: true, count: rows.length };
    }
    return { success: false, count: 0, error: 'Gagal mengunggah data sampel ke Supabase' };
  } catch (err: any) {
    return { success: false, count: 0, error: err?.message || 'Error seeding database' };
  }
}

/**
 * Ambil Laporan Tunggal untuk Pelacak (/track) via Secure Backend Endpoint (/api/track/[token])
 */
export async function fetchReportByTokenFromDatabase(tokenOrCaseId: string): Promise<Report | null> {
  const cleanInput = tokenOrCaseId.trim().toUpperCase();

  try {
    const res = await fetchWithTimeout(`/api/track/${encodeURIComponent(cleanInput)}`, { method: 'GET' }, 3000);
    if (res && res.ok) {
      const data = await res.json();
      if (data.success && data.report) {
        return data.report;
      }
    }
  } catch (err) {
    console.warn('[reportsService] Track API fetch failed, fallback ke local storage:', err);
  }

  // Fallback pencarian di local storage & mock reports
  const localReports = getLocalReports(true);
  const localMatch = localReports.find(
    (r) => r.anonymousToken.toUpperCase() === cleanInput || r.caseId.toUpperCase() === cleanInput
  );

  return localMatch || null;
}

/**
 * Update Status Kasus, Audit Log, Pesan Chat, atau Berkas Bukti via Server API (/api/admin/reports/[caseId])
 */
export async function updateReportInDatabase(
  caseId: string,
  updatedFields: Partial<Report>
): Promise<{ success: boolean; error?: string }> {
  // Update lokal
  if (typeof window !== 'undefined') {
    try {
      const savedStr =
        localStorage.getItem('ruang_aman_reports') ||
        localStorage.getItem('aman_kampus_reports');
      const reports: Report[] = savedStr ? JSON.parse(savedStr) : [...MOCK_REPORTS];
      const idx = reports.findIndex((r) => r.caseId === caseId);
      if (idx !== -1) {
        reports[idx] = { ...reports[idx], ...updatedFields };
        localStorage.setItem('ruang_aman_reports', JSON.stringify(reports));
        localStorage.setItem('aman_kampus_reports', JSON.stringify(reports));
      }
    } catch (e) {
      console.warn('LocalStorage update failed:', e);
    }
  }

  // Update via Server API
  try {
    const res = await fetchWithTimeout(
      `/api/admin/reports/${encodeURIComponent(caseId)}`,
      {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedFields),
      },
      3000
    );

    if (res && res.ok) {
      return { success: true };
    }
    return { success: true }; // offline fallback sukses
  } catch (err: any) {
    console.warn('Update server API offline:', err?.message || err);
    return { success: true };
  }
}

/**
 * Hapus Laporan via Server API (/api/admin/reports/[caseId]) & LocalStorage
 */
export async function deleteReportFromDatabase(
  caseId: string
): Promise<{ success: boolean; error?: string }> {
  if (typeof window !== 'undefined') {
    try {
      const deletedStr =
        localStorage.getItem('ruang_aman_deleted_case_ids') ||
        localStorage.getItem('aman_kampus_deleted_case_ids');
      const deletedList: string[] = deletedStr ? JSON.parse(deletedStr) : [];
      if (!deletedList.includes(caseId)) {
        deletedList.push(caseId);
        localStorage.setItem('ruang_aman_deleted_case_ids', JSON.stringify(deletedList));
        localStorage.setItem('aman_kampus_deleted_case_ids', JSON.stringify(deletedList));
      }

      const savedStr =
        localStorage.getItem('ruang_aman_reports') ||
        localStorage.getItem('aman_kampus_reports');
      if (savedStr) {
        const reports: Report[] = JSON.parse(savedStr);
        const filtered = reports.filter((r) => r.caseId !== caseId);
        localStorage.setItem('ruang_aman_reports', JSON.stringify(filtered));
        localStorage.setItem('aman_kampus_reports', JSON.stringify(filtered));
      }
    } catch (e) {
      console.warn('LocalStorage delete failed:', e);
    }
  }

  try {
    const res = await fetchWithTimeout(
      `/api/admin/reports/${encodeURIComponent(caseId)}`,
      { method: 'DELETE' },
      3000
    );

    if (res && res.ok) {
      return { success: true };
    }
    return { success: true };
  } catch (err: any) {
    console.warn('Delete server API offline:', err?.message || err);
    return { success: true };
  }
}
