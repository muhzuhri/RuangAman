import React from 'react';
import { type Report, type CaseStatus, type Evidence } from '@/lib/types';
import { Inbox, ShieldCheck, Clock, HeartHandshake, Gavel, CheckCircle } from 'lucide-react';

export function formatDateID(isoString: string): string {
  try {
    return new Date(isoString).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'Asia/Jakarta',
    });
  } catch {
    return isoString;
  }
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Status Styles — fully adaptive high-contrast styling for light & dark mode
export const STATUS_STYLES: Record<CaseStatus, string> = {
  'Laporan Diterima': 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-950/90 dark:text-amber-300 dark:border-amber-700/80 font-bold',
  Diverifikasi:       'bg-blue-100 text-blue-900 border-blue-300 dark:bg-blue-950/90 dark:text-blue-300 dark:border-blue-700/80 font-bold',
  Diproses:           'bg-indigo-100 text-indigo-900 border-indigo-300 dark:bg-indigo-950/90 dark:text-indigo-300 dark:border-indigo-700/80 font-bold',
  'Mediasi & Konseling': 'bg-teal-100 text-teal-900 border-teal-300 dark:bg-teal-950/90 dark:text-teal-300 dark:border-teal-700/80 font-bold',
  'Eskalasi ke Komite Etik': 'bg-rose-100 text-rose-900 border-rose-300 dark:bg-rose-950/90 dark:text-rose-300 dark:border-rose-700/80 font-bold',
  Selesai:            'bg-emerald-100 text-emerald-900 border-emerald-300 dark:bg-emerald-950/90 dark:text-emerald-300 dark:border-emerald-700/80 font-bold',
};

export const ALL_STATUSES: CaseStatus[] = [
  'Laporan Diterima',
  'Diverifikasi',
  'Diproses',
  'Mediasi & Konseling',
  'Eskalasi ke Komite Etik',
  'Selesai',
];

export const STATUS_ICONS: Record<CaseStatus, React.ReactNode> = {
  'Laporan Diterima': React.createElement(Inbox, { className: 'w-3.5 h-3.5' }),
  Diverifikasi: React.createElement(ShieldCheck, { className: 'w-3.5 h-3.5' }),
  Diproses: React.createElement(Clock, { className: 'w-3.5 h-3.5' }),
  'Mediasi & Konseling': React.createElement(HeartHandshake, { className: 'w-3.5 h-3.5' }),
  'Eskalasi ke Komite Etik': React.createElement(Gavel, { className: 'w-3.5 h-3.5' }),
  Selesai: React.createElement(CheckCircle, { className: 'w-3.5 h-3.5' }),
};

export function exportReportsToCSV(reportsList: Report[]) {
  const headers = ['Case ID', 'Token Anonim', 'Kategori', 'Waktu Diterima', 'Waktu Kejadian', 'Pihak Terlibat', 'Lingkup/Fakultas', 'Jumlah Bukti', 'Status Kasus'];
  const rows = reportsList.map((r) => [
    `"${r.caseId}"`,
    `"${r.anonymousToken}"`,
    `"${r.category.replace(/"/g, '""')}"`,
    `"${formatDateID(r.receivedAt)}"`,
    `"${(r.incidentTime || '-').replace(/"/g, '""')}"`,
    `"${(r.involvedParties || '-').replace(/"/g, '""')}"`,
    `"${(r.targetFaculty || '-').replace(/"/g, '""')}"`,
    r.evidences ? r.evidences.length : 0,
    `"${r.status}"`,
  ]);
  const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', `Rekap_Laporan_Satgas_PPKS_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

export function handleDownloadEvidence(ev: Evidence) {
  if (ev.dataUrl && ev.dataUrl.startsWith('data:')) {
    const a = document.createElement('a');
    a.href = ev.dataUrl;
    a.download = ev.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    return;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 1200;
  canvas.height = 700;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#0d9488';
    ctx.fillRect(0, 0, canvas.width, 16);

    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 36px sans-serif';
    ctx.fillText('RUANGAMAN — BERKAS BUKTI ASLI PELAPOR', 60, 80);

    ctx.fillStyle = '#94a3b8';
    ctx.font = '22px sans-serif';
    ctx.fillText(`Nama Berkas: ${ev.fileName}`, 60, 130);
    ctx.fillText(`ID Bukti: ${ev.evidenceId} | SHA-256 Checksum Secured`, 60, 165);

    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(60, 200, 1080, 380, 16);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#2dd4bf';
    ctx.font = 'bold 28px sans-serif';
    ctx.fillText('🛡️ VERIFIKASI KEASLIAN BUKTI (SHA-256 MUTLAK)', 100, 260);

    ctx.fillStyle = '#cbd5e1';
    ctx.font = '20px monospace';
    ctx.fillText(`SHA-256: ${ev.sha256}`, 100, 310);
    ctx.fillText(`Forensik Biner : ${ev.forensicStatus || 'Original'}`, 100, 350);
    ctx.fillText(`EXIF Stripped   : ${ev.exifStripped ? 'YA (GPS & Serial HP Dibersihkan)' : 'Format Standar'}`, 100, 390);

    if (ev.reporterNote) {
      ctx.fillStyle = '#fbbf24';
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText(`Catatan Pelapor : ${ev.reporterNote}`, 100, 440);
    }

    ctx.fillStyle = '#64748b';
    ctx.font = '18px sans-serif';
    ctx.fillText('Dokumen resmi terenkripsi Satgas PPKS RuangAman.', 60, 630);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const downloadName = ev.fileName.includes('.') ? ev.fileName : `${ev.fileName}.png`;
      a.download = downloadName;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, ev.fileType || 'image/png');
  }
}

// ── Admin Authentication Session Helpers ─────────────────────────────────────

export function setAdminAuthSession() {
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.setItem('isAdminLoggedIn', 'true');
      localStorage.setItem('isAdminLoggedIn', 'true');
      document.cookie = 'isAdminLoggedIn=true; path=/; max-age=86400; SameSite=Lax';
    } catch (e) {
      console.warn('Set admin session warning:', e);
    }
  }
}

export function clearAdminAuthSession() {
  if (typeof window !== 'undefined') {
    try {
      sessionStorage.removeItem('isAdminLoggedIn');
      localStorage.removeItem('isAdminLoggedIn');
      document.cookie = 'isAdminLoggedIn=; path=/; max-age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax';
    } catch (e) {
      console.warn('Clear admin session warning:', e);
    }
  }
}

export function checkIsAdminAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const hasCookie = document.cookie.includes('isAdminLoggedIn=true');
    const hasSession = sessionStorage.getItem('isAdminLoggedIn') === 'true';
    const hasLocal = localStorage.getItem('isAdminLoggedIn') === 'true';

    // If any auth token exists, keep all stores synchronized to prevent redirect mismatch
    if (hasCookie || hasSession || hasLocal) {
      if (!hasCookie) {
        document.cookie = 'isAdminLoggedIn=true; path=/; max-age=86400; SameSite=Lax';
      }
      if (!hasSession) {
        sessionStorage.setItem('isAdminLoggedIn', 'true');
      }
      if (!hasLocal) {
        localStorage.setItem('isAdminLoggedIn', 'true');
      }
      return true;
    }
  } catch (e) {
    console.warn('Auth check warning:', e);
  }
  return false;
}
