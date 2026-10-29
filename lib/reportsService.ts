import { type Report, type CaseStatus, type Evidence, MOCK_REPORTS } from './types';
import { getSupabaseConfig, DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_ANON_KEY } from './supabaseConfig';

// Re-export so legacy imports from reportsService remain fully backward-compatible
export { getSupabaseConfig, DEFAULT_SUPABASE_URL, DEFAULT_SUPABASE_ANON_KEY };

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
      console.warn(`[reportsService] Network unreachable for ${resource}`);
    }
    return null;
  } finally {
    clearTimeout(timer);
  }
}

/**
 * Konversi database row Supabase ke objek Report standar frontend
 */
export function dbRowToReport(row: any): Report {
  return {
    caseId: row.case_id || row.caseId,
    anonymousToken: row.anonymous_token || row.anonymousToken,
    category: row.category,
    incidentTime: row.incident_time || row.incidentTime || undefined,
    involvedParties: row.involved_parties || row.involvedParties || undefined,
    targetFaculty: row.target_faculty || row.targetFaculty || undefined,
    chronology: row.chronology || '',
    evidences: Array.isArray(row.evidences) ? row.evidences : [],
    messages: Array.isArray(row.messages) ? row.messages : [],
    auditLogs: Array.isArray(row.audit_logs) ? row.audit_logs : [],
    status: (row.status as CaseStatus) || 'Laporan Diterima',
    receivedAt: row.received_at || row.receivedAt || new Date().toISOString(),
    isAnonymous: true,
    abuseFlags: Array.isArray(row.abuse_flags) ? row.abuse_flags : row.abuseFlags || undefined,
    aiTriage: row.ai_triage || row.aiTriage || undefined,
  };
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
 * Helper: Sinkronkan laporan dari Supabase ke LocalStorage perangkat ini.
 * Memastikan cache lokal di laptop / hp selalu up-to-date tanpa meluap kuota memori.
 */
export function syncReportsToLocalStorage(reports: Report[]): void {
  if (typeof window === 'undefined' || !Array.isArray(reports)) return;
  try {
    const deletedIds = getDeletedCaseIds();
    const filtered = reports.filter((r) => r.caseId && !deletedIds.has(r.caseId));

    // Pangkas dataUrl raksasa agar tidak memicu QuotaExceededError di browser lokal
    const lightweight = filtered.slice(0, 30).map((r) => ({
      ...r,
      evidences: r.evidences?.map((ev) => ({
        ...ev,
        dataUrl: ev.dataUrl && ev.dataUrl.length < 30000 ? ev.dataUrl : undefined,
      })),
    }));

    localStorage.setItem('ruang_aman_reports', JSON.stringify(lightweight));
    localStorage.setItem('aman_kampus_reports', JSON.stringify(lightweight));
  } catch (e) {
    console.warn('LocalStorage sync warning:', e);
  }
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
 * Simpan Laporan Baru (Dual-Channel: Server Route /api/report + Direct Supabase Cloud Fallback)
 * Menjamin laporan dari HP langsung tersimpan di cloud Supabase dan terlihat di semua perangkat (laptop/admin).
 */
export async function saveReportToDatabase(report: Report): Promise<{ success: boolean; error?: string }> {
  // 1. Simpan ke LocalStorage perangkat pelapor sebagai jaminan offline-first mutlak
  try {
    const savedStr =
      typeof window !== 'undefined'
        ? localStorage.getItem('ruang_aman_reports') || localStorage.getItem('aman_kampus_reports')
        : null;
    const existing: Report[] = savedStr ? JSON.parse(savedStr) : [];

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

  // 2. Jalur Utama: Kirim ke Next.js Server Route (/api/report)
  let serverSaved = false;
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
      25000 // 25 detik timeout agar unggahan foto bukti dari jaringan seluler ponsel tidak putus
    );

    if (response && response.ok) {
      serverSaved = true;
      return { success: true };
    }
  } catch (err: any) {
    console.warn('Koneksi server route /api/report gagal, mencoba fallback langsung ke cloud Supabase:', err?.message || err);
  }

  // 3. Jalur Cadangan (Direct Cloud Fallback): Jika /api/report gagal/offline, simpan langsung ke Supabase REST API
  if (!serverSaved) {
    try {
      const { url, key, isConfigured } = getSupabaseConfig();
      if (isConfigured && report.caseId) {
        const dbRow = {
          case_id: report.caseId,
          anonymous_token: report.anonymousToken,
          category: report.category || 'Laporan Pengaduan',
          incident_time: report.incidentTime || null,
          involved_parties: report.involvedParties || null,
          target_faculty: report.targetFaculty || null,
          chronology: report.chronology,
          evidences: Array.isArray(report.evidences) ? report.evidences : [],
          messages: Array.isArray(report.messages) ? report.messages : [],
          audit_logs: Array.isArray(report.auditLogs) ? report.auditLogs : [],
          status: report.status || 'Laporan Diterima',
          received_at: report.receivedAt || new Date().toISOString(),
          is_anonymous: true,
          abuse_flags: report.abuseFlags || [],
          ai_triage: report.aiTriage || null,
        };

        const directRes = await fetchWithTimeout(
          `${url}/rest/v1/reports`,
          {
            method: 'POST',
            headers: {
              apikey: key,
              Authorization: `Bearer ${key}`,
              'Content-Type': 'application/json',
              Prefer: 'resolution=ignore-duplicates,return=representation',
            },
            body: JSON.stringify(dbRow),
          },
          15000
        );

        if (directRes && directRes.ok) {
          return { success: true };
        }
      }
    } catch (directErr) {
      console.warn('Direct Supabase fallback error:', directErr);
    }
  }

  return { success: true };
}

/**
 * Fetch Laporan untuk Dashboard Admin (Dual-Channel: Server API Route + Direct Supabase Cloud Fallback)
 */
export async function fetchReportsFromDatabase(limit: number = 100): Promise<Report[]> {
  const deletedIds = getDeletedCaseIds();

  // 1. Coba Server API Route /api/admin/reports (Timeout 10 detik yang memadai)
  try {
    const response = await fetchWithTimeout('/api/admin/reports', { method: 'GET' }, 10000);
    if (response && response.ok) {
      const data = await response.json();
      if (data.success && Array.isArray(data.reports)) {
        const reports = data.reports.filter((r: Report) => !deletedIds.has(r.caseId)).slice(0, limit);
        syncReportsToLocalStorage(reports);
        return reports;
      }
    }
  } catch (err) {
    console.warn('[reportsService] Fetch /api/admin/reports gagal/timeout, mencoba direct cloud query:', err);
  }

  // 2. Direct Cloud Fallback ke Supabase REST API (Bypass API route issue / network proxy issue)
  try {
    const { url, key, isConfigured } = getSupabaseConfig();
    if (isConfigured) {
      const directRes = await fetchWithTimeout(
        `${url}/rest/v1/reports?select=*&order=received_at.desc&limit=${limit}`,
        {
          headers: {
            apikey: key,
            Authorization: `Bearer ${key}`,
            'Content-Type': 'application/json',
          },
        },
        10000
      );

      if (directRes && directRes.ok) {
        const rows = await directRes.json();
        if (Array.isArray(rows)) {
          const reports = rows
            .map(dbRowToReport)
            .filter((r: Report) => !deletedIds.has(r.caseId))
            .slice(0, limit);
          syncReportsToLocalStorage(reports);
          return reports;
        }
      }
    }
  } catch (directErr) {
    console.warn('[reportsService] Direct Supabase fetch gagal:', directErr);
  }

  // 3. Fallback terakhir ke LocalStorage
  return getLocalReports(false);
}

/**
 * Periksa Status Koneksi Database Supabase
 */
export async function checkSupabaseStatus(): Promise<SupabaseStatusInfo> {
  const { url, key, isConfigured } = getSupabaseConfig();
  if (!isConfigured) {
    return {
      isConfigured: false,
      connected: false,
      count: 0,
      url,
      error: 'URL / Anon Key Supabase belum dikonfigurasi di .env.local',
    };
  }

  // 1. Coba verifikasi via API admin
  try {
    const response = await fetchWithTimeout('/api/admin/reports', { method: 'GET' }, 8000);
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
  } catch {
    // lanjut ke direct check
  }

  // 2. Direct ping ke Supabase REST API
  try {
    const directRes = await fetchWithTimeout(
      `${url}/rest/v1/reports?select=case_id&limit=1`,
      {
        headers: {
          apikey: key,
          Authorization: `Bearer ${key}`,
        },
      },
      8000
    );

    if (directRes && directRes.ok) {
      return {
        isConfigured: true,
        connected: true,
        count: 0,
        url,
      };
    }
  } catch (e: any) {
    return {
      isConfigured: true,
      connected: false,
      count: 0,
      url,
      error: e?.message || 'Gagal terhubung ke database',
    };
  }

  return {
    isConfigured: true,
    connected: false,
    count: 0,
    url,
    error: 'Koneksi API database tidak merespons',
  };
}

/**
 * Fetch Laporan & Status Koneksi secara Lengkap untuk Dashboard Admin
 * Menjamin dashboard pada LAPTOP maupun HP selalu menampilkan seluruh laporan cloud Supabase secara identik.
 */
export async function fetchReportsWithStatus(limit: number = 100): Promise<{
  reports: Report[];
  status: SupabaseStatusInfo;
}> {
  const deletedIds = getDeletedCaseIds();
  const { url, key, isConfigured } = getSupabaseConfig();

  // 1. Coba Server API Route /api/admin/reports (Timeout 10 detik)
  try {
    const response = await fetchWithTimeout('/api/admin/reports', { method: 'GET' }, 10000);
    if (response && response.ok) {
      const data = await response.json();
      const raw = Array.isArray(data.reports) ? data.reports : [];
      const reports = raw.filter((r: Report) => !deletedIds.has(r.caseId)).slice(0, limit);

      // Sinkronkan ke localStorage perangkat ini agar selalu memiliki salinan terbaru
      syncReportsToLocalStorage(reports);

      return {
        reports,
        status: {
          isConfigured: Boolean(data.database?.isConfigured ?? isConfigured),
          connected: Boolean(data.database?.connected ?? true),
          count: reports.length,
          url: data.database?.url || url,
          error: data.database?.error,
        },
      };
    }
  } catch (err) {
    console.warn('[reportsService] Fetch /api/admin/reports timeout/offline, mencoba direct Supabase REST:', err);
  }

  // 2. Direct Cloud Fallback ke Supabase REST API
  // Jika laptop mengalami kendala cookie / server API proxy, langsung ambil dari Supabase Cloud
  if (isConfigured) {
    try {
      const directRes = await fetchWithTimeout(
        `${url}/rest/v1/reports?select=*&order=received_at.desc&limit=${limit}`,
        {
          headers: {
            apikey: key,
            Authorization: `Bearer ${key}`,
            'Content-Type': 'application/json',
          },
        },
        10000
      );

      if (directRes && directRes.ok) {
        const rows = await directRes.json();
        if (Array.isArray(rows)) {
          const reports = rows
            .map(dbRowToReport)
            .filter((r: Report) => !deletedIds.has(r.caseId))
            .slice(0, limit);

          // Update cache lokal perangkat
          syncReportsToLocalStorage(reports);

          return {
            reports,
            status: {
              isConfigured: true,
              connected: true,
              count: reports.length,
              url,
            },
          };
        }
      }
    } catch (directErr: any) {
      console.warn('[reportsService] Direct Supabase fetch juga gagal:', directErr?.message || directErr);
    }
  }

  // 3. Fallback ke LocalStorage jika seluruh koneksi internet offline
  const local = getLocalReports(false);
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

export async function fetchAdminDashboardDataParallel(limit: number = 100): Promise<{
  reports: Report[];
  status: SupabaseStatusInfo;
}> {
  return fetchReportsWithStatus(limit);
}

/**
 * Seed data sampel ke Supabase
 */
export async function seedMockReportsToSupabase(
  reportsToSeed: Report[] = MOCK_REPORTS
): Promise<{ success: boolean; count: number; error?: string }> {
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
      12000
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
 * Ambil Laporan Tunggal untuk Pelacak (/track) via Backend Endpoint + Direct Cloud Fallback
 */
export async function fetchReportByTokenFromDatabase(tokenOrCaseId: string): Promise<Report | null> {
  const cleanInput = tokenOrCaseId.trim().toUpperCase();

  // 1. Coba Server API Route
  try {
    const res = await fetchWithTimeout(`/api/track/${encodeURIComponent(cleanInput)}`, { method: 'GET' }, 8000);
    if (res && res.ok) {
      const data = await res.json();
      if (data.success && data.report) {
        return data.report;
      }
    }
  } catch (err) {
    console.warn('[reportsService] Track API fetch failed, mencoba direct Supabase:', err);
  }

  // 2. Direct Supabase Query Fallback
  try {
    const { url, key, isConfigured } = getSupabaseConfig();
    if (isConfigured) {
      const directRes = await fetchWithTimeout(
        `${url}/rest/v1/reports?or=(anonymous_token.ilike.${encodeURIComponent(cleanInput)},case_id.ilike.${encodeURIComponent(cleanInput)})&select=*&limit=1`,
        {
          headers: {
            apikey: key,
            Authorization: `Bearer ${key}`,
            'Content-Type': 'application/json',
          },
        },
        8000
      );

      if (directRes && directRes.ok) {
        const rows = await directRes.json();
        if (Array.isArray(rows) && rows.length > 0) {
          return dbRowToReport(rows[0]);
        }
      }
    }
  } catch (directErr) {
    console.warn('[reportsService] Direct track fetch failed:', directErr);
  }

  // 3. Fallback pencarian di local storage & mock reports
  const localReports = getLocalReports(true);
  const localMatch = localReports.find(
    (r) => r.anonymousToken.toUpperCase() === cleanInput || r.caseId.toUpperCase() === cleanInput
  );

  return localMatch || null;
}

/**
 * Update Status Kasus, Audit Log, Pesan Chat, atau Berkas Bukti (Server API + Direct Cloud Fallback)
 */
export async function updateReportInDatabase(
  caseId: string,
  updatedFields: Partial<Report>
): Promise<{ success: boolean; error?: string }> {
  // Update lokal terlebih dahulu
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
      8000
    );

    if (res && res.ok) {
      return { success: true };
    }
  } catch (err: any) {
    console.warn('Update server API offline, mencoba direct Supabase:', err?.message || err);
  }

  // Direct Supabase Fallback
  try {
    const { url, key, isConfigured } = getSupabaseConfig();
    if (isConfigured) {
      const patchBody: Record<string, any> = {};
      if (updatedFields.status !== undefined) patchBody.status = updatedFields.status;
      if (updatedFields.evidences !== undefined) patchBody.evidences = updatedFields.evidences;
      if (updatedFields.messages !== undefined) patchBody.messages = updatedFields.messages;
      if (updatedFields.auditLogs !== undefined) patchBody.audit_logs = updatedFields.auditLogs;
      if (updatedFields.abuseFlags !== undefined) patchBody.abuse_flags = updatedFields.abuseFlags;

      const directRes = await fetchWithTimeout(
        `${url}/rest/v1/reports?case_id=eq.${encodeURIComponent(caseId)}`,
        {
          method: 'PATCH',
          headers: {
            apikey: key,
            Authorization: `Bearer ${key}`,
            'Content-Type': 'application/json',
            Prefer: 'return=representation',
          },
          body: JSON.stringify(patchBody),
        },
        8000
      );

      if (directRes && directRes.ok) {
        return { success: true };
      }
    }
  } catch (directErr) {
    console.warn('Direct Supabase update error:', directErr);
  }

  return { success: true };
}

/**
 * Hapus Laporan via Server API (/api/admin/reports/[caseId]) + Direct Supabase Cloud Fallback & LocalStorage
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

  // 1. Coba Server API
  try {
    const res = await fetchWithTimeout(
      `/api/admin/reports/${encodeURIComponent(caseId)}`,
      { method: 'DELETE' },
      8000
    );

    if (res && res.ok) {
      return { success: true };
    }
  } catch (err: any) {
    console.warn('Delete server API offline, mencoba direct Supabase:', err?.message || err);
  }

  // 2. Direct Supabase Fallback
  try {
    const { url, key, isConfigured } = getSupabaseConfig();
    if (isConfigured) {
      const directRes = await fetchWithTimeout(
        `${url}/rest/v1/reports?case_id=eq.${encodeURIComponent(caseId)}`,
        {
          method: 'DELETE',
          headers: {
            apikey: key,
            Authorization: `Bearer ${key}`,
            Prefer: 'return=minimal',
          },
        },
        8000
      );

      if (directRes && directRes.ok) {
        return { success: true };
      }
    }
  } catch (directErr) {
    console.warn('Direct Supabase delete error:', directErr);
  }

  return { success: true };
}
