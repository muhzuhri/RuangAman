import { type Report, type CaseStatus, type Message, type AuditLog, type Evidence, MOCK_REPORTS } from './types';

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

/**
 * 1. Fetch helper dengan AbortController timeout yang KETAT.
 * Timeout default dipangkas menjadi 3.000ms (3 detik) untuk mencegah hanging request.
 */
async function fetchWithTimeout(
  resource: string,
  options: RequestInit = {},
  timeoutMs: number = 3000
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(resource, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(timer);
  }
}

// Shared headers for all Supabase REST calls
function supabaseHeaders(key: string): Record<string, string> {
  return {
    'apikey': key,
    'Authorization': `Bearer ${key}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    'Accept-Profile': 'public',
  };
}

// Transform DB JSON row to frontend Report object
function dbRowToReport(row: any): Report {
  return {
    caseId: row.case_id || row.caseId,
    anonymousToken: row.anonymous_token || row.anonymousToken,
    category: row.category,
    incidentTime: row.incident_time || row.incidentTime || undefined,
    involvedParties: row.involved_parties || row.involvedParties || undefined,
    targetFaculty: row.target_faculty || row.targetFaculty || undefined,
    chronology: row.chronology,
    evidences: Array.isArray(row.evidences) ? row.evidences : [],
    messages: Array.isArray(row.messages) ? row.messages : [],
    auditLogs: Array.isArray(row.audit_logs) ? row.audit_logs : [],
    status: (row.status as CaseStatus) || 'Laporan Diterima',
    receivedAt: row.received_at || row.receivedAt || new Date().toISOString(),
    isAnonymous: row.is_anonymous ?? row.isAnonymous ?? true,
    abuseFlags: Array.isArray(row.abuse_flags) ? row.abuse_flags : row.abuseFlags || undefined,
    aiTriage: row.ai_triage || row.aiTriage || undefined,
  };
}

// Transform frontend Report object to DB JSON row
function reportToDbRow(report: Report) {
  return {
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
  };
}

/**
 * Helper: Ambil daftar ID kasus yang telah dihapus admin (agar tidak muncul lagi walau mock data terload)
 */
export function getDeletedCaseIds(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const deletedStr = localStorage.getItem('aman_kampus_deleted_case_ids');
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
 * Hanya memuat MOCK_REPORTS jika includeMocks === true (misal saat offline/fallback).
 */
export function getLocalReports(includeMocks: boolean = false): Report[] {
  let localReports: Report[] = [];
  if (typeof window !== 'undefined') {
    const savedStr = localStorage.getItem('aman_kampus_reports');
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
 * Simpan Laporan Baru ke Supabase & LocalStorage
 */
export async function saveReportToDatabase(report: Report): Promise<{ success: boolean; error?: string }> {
  // Always update local storage first as local mirror
  try {
    const savedStr = typeof window !== 'undefined' ? localStorage.getItem('aman_kampus_reports') : null;
    const existing: Report[] = savedStr ? JSON.parse(savedStr) : [];
    const filtered = existing.filter((r) => r.caseId !== report.caseId);
    filtered.unshift(report);
    if (typeof window !== 'undefined') {
      localStorage.setItem('aman_kampus_reports', JSON.stringify(filtered));
    }
  } catch (e) {
    console.warn('LocalStorage save error (likely quota):', e);
  }

  const { url, key, isConfigured } = getSupabaseConfig();
  if (!isConfigured) {
    console.warn('Supabase URL / Key belum dikonfigurasi di .env.local. Laporan tersimpan di LocalStorage browser.');
    return { success: true };
  }

  console.time('[Perf Debug] saveReportToDatabase');
  try {
    const response = await fetchWithTimeout(`${url}/rest/v1/reports`, {
      method: 'POST',
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=representation',
      },
      body: JSON.stringify(reportToDbRow(report)),
    }, 3000);

    console.timeEnd('[Perf Debug] saveReportToDatabase');
    if (!response.ok) {
      const errText = await response.text();
      console.error('Gagal mengirim ke Supabase REST API:', errText);
      return { success: false, error: errText };
    }

    return { success: true };
  } catch (err: any) {
    console.timeEnd('[Perf Debug] saveReportToDatabase');
    console.error('Network Error saat menyimpan ke Supabase:', err);
    return { success: false, error: err?.message || 'Gagal koneksi ke database' };
  }
}

/**
 * Fetch Data Laporan Utama (Max Timeout 3s + Instan Local Fallback)
 */
export async function fetchReportsFromDatabase(limit: number = 50): Promise<Report[]> {
  const { url, key, isConfigured } = getSupabaseConfig();

  if (isConfigured) {
    console.time('[Perf Debug] fetchReportsFromDatabase');
    try {
      const fetchUrl = `${url}/rest/v1/reports?select=*&order=received_at.desc&limit=${limit}`;
      const response = await fetchWithTimeout(
        fetchUrl,
        { method: 'GET', headers: supabaseHeaders(key) },
        3000 // Maksimal 3 detik timeout
      );

      console.timeEnd('[Perf Debug] fetchReportsFromDatabase');
      if (response.ok) {
        const rows = await response.json();
        if (Array.isArray(rows) && rows.length > 0) {
          const deletedIds = getDeletedCaseIds();
          return rows.map(dbRowToReport).filter((r) => !deletedIds.has(r.caseId));
        }
        return [];
      }
    } catch (err: any) {
      console.timeEnd('[Perf Debug] fetchReportsFromDatabase');
      console.warn('[Perf Debug] Koneksi Supabase timeout (>3s), beralih ke local fallback instan:', err?.message || err);
    }
  }

  // Fallback instan jika Supabase timeout/error (<10ms)
  return getLocalReports(false);
}

export type SupabaseStatusInfo = {
  isConfigured: boolean;
  connected: boolean;
  count: number;
  error?: string;
  url?: string;
};

/**
 * Health Check DB Terisolasi dengan Fast Timeout (1.5s max).
 * Fungsi ini memiliki timeout ultra-cepat agar tidak pernah memblokir UI.
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

  console.time('[Perf Debug] checkSupabaseStatus');
  try {
    const response = await fetchWithTimeout(
      `${url}/rest/v1/reports?select=case_id&limit=1`,
      {
        method: 'GET',
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
      },
      1500 // Ultra-fast 1.5s max timeout for ping status
    );

    console.timeEnd('[Perf Debug] checkSupabaseStatus');
    if (!response.ok) {
      const errText = await response.text();
      return {
        isConfigured: true,
        connected: false,
        count: 0,
        url,
        error: `Supabase error (${response.status}): ${errText}`,
      };
    }

    const rows = await response.json();
    return {
      isConfigured: true,
      connected: true,
      count: Array.isArray(rows) ? rows.length : 0,
      url,
    };
  } catch (err: any) {
    console.timeEnd('[Perf Debug] checkSupabaseStatus');
    return {
      isConfigured: true,
      connected: false,
      count: 0,
      url,
      error: err?.name === 'AbortError' ? 'Ping Supabase timeout (>1.5s)' : (err?.message || 'Gagal terhubung ke Supabase'),
    };
  }
}

/**
 * Single-request Fetcher: Langsung menyimpulkan status DB dari response data
 * tanpa melempar ping status tambahan.
 */
export async function fetchReportsWithStatus(limit: number = 50): Promise<{
  reports: Report[];
  status: SupabaseStatusInfo;
}> {
  const { url, key, isConfigured } = getSupabaseConfig();

  if (!isConfigured) {
    return {
      reports: getLocalReports(false),
      status: {
        isConfigured: false,
        connected: false,
        count: 0,
        url,
        error: 'URL / Anon Key Supabase belum dikonfigurasi di .env.local',
      },
    };
  }

  console.time('[Perf Debug] fetchReportsWithStatus');
  try {
    const fetchUrl = `${url}/rest/v1/reports?select=*&order=received_at.desc&limit=${limit}`;
    const response = await fetchWithTimeout(
      fetchUrl,
      { method: 'GET', headers: supabaseHeaders(key) },
      3000 // Maksimal 3 detik
    );

    console.timeEnd('[Perf Debug] fetchReportsWithStatus');
    if (!response.ok) {
      const errText = await response.text();
      return {
        reports: getLocalReports(false),
        status: {
          isConfigured: true,
          connected: false,
          count: 0,
          url,
          error: `Supabase error (${response.status}): ${errText}`,
        },
      };
    }

    const rows = await response.json();
    const deletedIds = getDeletedCaseIds();
    const rawReports = Array.isArray(rows) ? rows.map(dbRowToReport) : [];
    const reports = rawReports.filter((r) => !deletedIds.has(r.caseId));

    return {
      reports,
      status: {
        isConfigured: true,
        connected: true,
        count: reports.length,
        url,
      },
    };
  } catch (err: any) {
    console.timeEnd('[Perf Debug] fetchReportsWithStatus');
    console.warn('[Perf Debug] Supabase fetch timed out (>3s), fallback ke LocalStorage instan.');
    return {
      reports: getLocalReports(false),
      status: {
        isConfigured: true,
        connected: false,
        count: 0,
        url,
        error: err?.name === 'AbortError' ? 'Koneksi ke Supabase timeout (>3s)' : (err?.message || 'Gagal terhubung ke Supabase'),
      },
    };
  }
}

/**
 * Isolated Non-Blocking Parallel Data Fetcher (Menggunakan Promise.allSettled)
 */
export async function fetchAdminDashboardDataParallel(limit: number = 50): Promise<{
  reports: Report[];
  status: SupabaseStatusInfo;
}> {
  console.time('[Perf Debug] Parallel Fetch Total');
  
  // Memakai Promise.allSettled agar kegagalan/timeout pada health check TIDAK MENAHAN data laporan
  const [reportsResult, statusResult] = await Promise.allSettled([
    fetchReportsFromDatabase(limit),
    checkSupabaseStatus(),
  ]);

  console.timeEnd('[Perf Debug] Parallel Fetch Total');

  const reports = reportsResult.status === 'fulfilled' ? reportsResult.value : getLocalReports(false);
  const status = statusResult.status === 'fulfilled' ? statusResult.value : {
    isConfigured: true,
    connected: false,
    count: 0,
    error: 'Health check timeout',
  };

  return { reports, status };
}

/**
 * Seed / Sinkronkan data sampel ke Supabase
 */
export async function seedMockReportsToSupabase(reportsToSeed: Report[] = MOCK_REPORTS): Promise<{ success: boolean; count: number; error?: string }> {
  const { url, key, isConfigured } = getSupabaseConfig();
  if (!isConfigured) return { success: false, count: 0, error: 'Supabase belum dikonfigurasi di .env.local' };

  console.time('[Perf Debug] seedMockReportsToSupabase');
  try {
    const rows = reportsToSeed.map(reportToDbRow);
    const response = await fetchWithTimeout(`${url}/rest/v1/reports`, {
      method: 'POST',
      headers: {
        'apikey': key,
        'Authorization': `Bearer ${key}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=ignore-duplicates,return=representation',
      },
      body: JSON.stringify(rows),
    }, 4000);

    console.timeEnd('[Perf Debug] seedMockReportsToSupabase');
    if (!response.ok) {
      const errText = await response.text();
      return { success: false, count: 0, error: errText };
    }

    const inserted = await response.json();
    return { success: true, count: Array.isArray(inserted) ? inserted.length : reportsToSeed.length };
  } catch (err: any) {
    console.timeEnd('[Perf Debug] seedMockReportsToSupabase');
    return { success: false, count: 0, error: err?.message || 'Error seeding DB' };
  }
}

/**
 * Ambil Laporan Tunggal (untuk /track) — Respons Instan & Fleksibel (Max 3s timeout)
 */
export async function fetchReportByTokenFromDatabase(tokenOrCaseId: string): Promise<Report | null> {
  const cleanInput = tokenOrCaseId.trim().toUpperCase();
  const { url, key, isConfigured } = getSupabaseConfig();

  if (isConfigured) {
    console.time('[Perf Debug] fetchReportByTokenFromDatabase');
    try {
      const response = await fetchWithTimeout(
        `${url}/rest/v1/reports?or=(anonymous_token.ilike.${encodeURIComponent(cleanInput)},case_id.ilike.${encodeURIComponent(cleanInput)})&select=*&limit=1`,
        {
          method: 'GET',
          headers: {
            'apikey': key,
            'Authorization': `Bearer ${key}`,
            'Content-Type': 'application/json',
          },
        },
        3000
      );

      console.timeEnd('[Perf Debug] fetchReportByTokenFromDatabase');
      if (response.ok) {
        const rows = await response.json();
        if (Array.isArray(rows) && rows.length > 0) {
          return dbRowToReport(rows[0]);
        }
      }
    } catch (err) {
      console.timeEnd('[Perf Debug] fetchReportByTokenFromDatabase');
      console.warn('Supabase fetch single report timed out, checking local:', err);
    }
  }

  // Fallback pencarian di local storage & mock reports berdasarkan Token ATAU Case ID
  const localReports = getLocalReports(true);
  const localMatch = localReports.find(
    (r) => r.anonymousToken.toUpperCase() === cleanInput || r.caseId.toUpperCase() === cleanInput
  );

  return localMatch || null;
}

/**
 * Update Status Kasus, Audit Log, Pesan Chat, atau Berkas Bukti ke Database
 */
export async function updateReportInDatabase(
  caseId: string,
  updatedFields: Partial<Report>
): Promise<{ success: boolean; error?: string }> {
  if (typeof window !== 'undefined') {
    try {
      const savedStr = localStorage.getItem('aman_kampus_reports');
      const reports: Report[] = savedStr ? JSON.parse(savedStr) : [...MOCK_REPORTS];
      const idx = reports.findIndex((r) => r.caseId === caseId);
      if (idx !== -1) {
        reports[idx] = { ...reports[idx], ...updatedFields };
        localStorage.setItem('aman_kampus_reports', JSON.stringify(reports));
      }
    } catch (e) {
      console.warn('LocalStorage update failed:', e);
    }
  }

  const { url, key, isConfigured } = getSupabaseConfig();
  if (!isConfigured) {
    return { success: true };
  }

  console.time('[Perf Debug] updateReportInDatabase');
  try {
    const patchBody: Record<string, any> = {};
    if (updatedFields.status !== undefined) patchBody.status = updatedFields.status;
    if (updatedFields.evidences !== undefined) patchBody.evidences = updatedFields.evidences;
    if (updatedFields.messages !== undefined) patchBody.messages = updatedFields.messages;
    if (updatedFields.auditLogs !== undefined) patchBody.audit_logs = updatedFields.auditLogs;
    if (updatedFields.abuseFlags !== undefined) patchBody.abuse_flags = updatedFields.abuseFlags;

    const response = await fetchWithTimeout(
      `${url}/rest/v1/reports?case_id=eq.${encodeURIComponent(caseId)}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': key,
          'Authorization': `Bearer ${key}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify(patchBody),
      },
      3000
    );

    console.timeEnd('[Perf Debug] updateReportInDatabase');
    if (!response.ok) {
      const errText = await response.text();
      console.error('Gagal update Supabase REST API:', errText);
      return { success: false, error: errText };
    }

    return { success: true };
  } catch (err: any) {
    console.timeEnd('[Perf Debug] updateReportInDatabase');
    console.error('Error update DB:', err);
    return { success: false, error: err?.message || 'Error update database' };
  }
}

/**
 * Hapus Laporan dari Supabase & LocalStorage
 */
export async function deleteReportFromDatabase(
  caseId: string
): Promise<{ success: boolean; error?: string }> {
  if (typeof window !== 'undefined') {
    try {
      const deletedStr = localStorage.getItem('aman_kampus_deleted_case_ids');
      const deletedList: string[] = deletedStr ? JSON.parse(deletedStr) : [];
      if (!deletedList.includes(caseId)) {
        deletedList.push(caseId);
        localStorage.setItem('aman_kampus_deleted_case_ids', JSON.stringify(deletedList));
      }

      const savedStr = localStorage.getItem('aman_kampus_reports');
      if (savedStr) {
        const reports: Report[] = JSON.parse(savedStr);
        const filtered = reports.filter((r) => r.caseId !== caseId);
        localStorage.setItem('aman_kampus_reports', JSON.stringify(filtered));
      }
    } catch (e) {
      console.warn('LocalStorage delete failed:', e);
    }
  }

  const { url, key, isConfigured } = getSupabaseConfig();
  if (!isConfigured) {
    return { success: true };
  }

  console.time('[Perf Debug] deleteReportFromDatabase');
  try {
    const response = await fetchWithTimeout(
      `${url}/rest/v1/reports?case_id=eq.${encodeURIComponent(caseId)}`,
      {
        method: 'DELETE',
        headers: {
          ...supabaseHeaders(key),
          'Prefer': 'return=minimal',
        },
      },
      3000
    );

    console.timeEnd('[Perf Debug] deleteReportFromDatabase');
    if (!response.ok) {
      const errText = await response.text();
      console.error(`Gagal menghapus dari Supabase REST API [HTTP ${response.status}]:`, errText);
      return { success: false, error: `HTTP ${response.status}: ${errText}` };
    }

    return { success: true };
  } catch (err: any) {
    console.timeEnd('[Perf Debug] deleteReportFromDatabase');
    console.error('Error delete DB:', err);
    return { success: false, error: err?.message || 'Error menghapus dari database' };
  }
}
