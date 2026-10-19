// Shared types for the RuangAman reporting system
import type { ExtractedMetadata, FileValidationResult } from '@/lib/crypto';

// ─── AI Triage ─────────────────────────────────────────────────────────────────

export type TriageRiskLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export interface AITriageResult {
  riskLevel: TriageRiskLevel;
  urgencyScore: number;
  categoryRecommendation: string;
  legalPasalBasis: string;
  summary: string;
}

// ─── Status ────────────────────────────────────────────────────────────────

/** Status yang tersedia untuk laporan */
export type CaseStatus =
  | 'Laporan Diterima'  // status awal – dari formulir mahasiswa
  | 'Diverifikasi'      // satgas sudah memverifikasi laporan
  | 'Diproses'          // sedang dalam penyelidikan
  | 'Mediasi & Konseling'  // penanganan secara psikologis/sosial
  | 'Eskalasi ke Komite Etik' // penanganan disipliner kampus
  | 'Selesai';          // kasus ditutup

// ─── Chat & Audit ──────────────────────────────────────────────────────────

export type Message = {
  id: string;
  sender: 'Pelapor' | 'Satgas';
  text: string;
  timestamp: string; // ISO string
};

export type AuditLog = {
  id: string;
  action: string;
  actor: 'Sistem' | 'Satgas' | 'Pelapor';
  timestamp: string; // ISO string
};

// ─── Evidence & Forensics ──────────────────────────────────────────────────

/** Status Verifikasi Bukti oleh Satgas */
export type EvidenceVerificationStatus =
  | 'Belum Diverifikasi'
  | 'Terverifikasi Valid'
  | 'Tervalidasi Palsu / Ditolak';

/** Metadata bukti yang diunggah pelapor */
export type Evidence = {
  /** Identitas unik file bukti */
  evidenceId: string;
  /** Nama asli file */
  fileName: string;
  /** Tipe MIME file */
  fileType: string;
  /** Ukuran file dalam bytes */
  fileSize: number;
  /** SHA-256 hash (hex) dari isi file – untuk verifikasi integritas mutlak */
  sha256: string;
  /** Flag jika EXIF metadata lokasi/perangkat telah dibersihkan demi privasi */
  exifStripped?: boolean;
  /** Data URL (base64) gambar asli / file asli untuk diunduh admin secara utuh */
  dataUrl?: string;
  /** Flag jika file diambil real-time dari kamera */
  isLiveCapture?: boolean;
  /** Metode perolehan berkas (Hasil Unduhan / Tangkapan Layar / Perekaman Langsung) */
  acquisitionMethod?: string;
  /** Status AI Forensic */
  forensicStatus?: 'Original' | 'Needs Review' | 'Manipulated';
  /** Detail forensic (contoh: log EXIF, GPS, SHA256 integrity, dll) */
  forensicDetails?: string[];
  /** Catatan / Alasan tambahan dari Pelapor mengenai berkas bukti */
  reporterNote?: string;
  /** Status keputusan verifikasi keaslian bukti dari Satgas PPKS */
  verificationStatus?: EvidenceVerificationStatus;
  /** Catatan penilaian keaslian bukti oleh Satgas */
  verificationNote?: string;
  /** Hasil analisis multimodal AI forensik (Gemini Vision / Groq) */
  aiAnalysis?: EvidenceAnalysisResult;
  /** Metadata sensitif asli sebelum disanitasi */
  extractedMeta?: ExtractedMetadata;
  /** Hasil validasi biner magic bytes */
  validationResult?: FileValidationResult;
};

/** Hasil Analisis Berkas Multimodal AI Forensik */
export interface EvidenceAnalysisResult {
  mediaType: 'IMAGE' | 'AUDIO' | 'VIDEO';
  /** Deskripsi ringkas isi visual / audio berkas bukti */
  visualDescription?: string;
  extractedText: string;
  keyFindings: string[];
  emotionalContext: string;
  authenticityScore: number;
  tamperingDetected: boolean;
  forensicNotes: string;
}

// ─── Report ────────────────────────────────────────────────────────────────

/** Laporan lengkap yang tersimpan di sistem */
export type Report = {
  /** Case ID unik, contoh: CASE-2026-00001 */
  caseId: string;
  /** Token anonim pelapor, contoh: AK-2026-X7K92 */
  anonymousToken: string;

  /** Kategori kasus */
  category: string;
  /** Kronologi kejadian */
  chronology: string;
  /** Waktu kejadian (string ISO atau deskripsi) */
  incidentTime: string;
  /** Pihak yang terlibat (opsional, hanya deskripsi umum) */
  involvedParties?: string;
  /** Lingkup / Fakultas (opsional) */
  targetFaculty?: string;

  /** Daftar bukti yang diunggah */
  evidences: Evidence[];

  /** Pesan komunikasi dua arah */
  messages?: Message[];
  /** Riwayat jejak audit */
  auditLogs?: AuditLog[];

  /** Waktu laporan diterima sistem (ISO string) */
  receivedAt: string;
  /** Status saat ini */
  status: CaseStatus;

  /** Apakah pelapor bersifat anonim (selalu true pada fase ini) */
  isAnonymous: true;

  /** Bendera penyalahgunaan yang diisi sistem (bukti AI, hash duplikat, dll.) */
  abuseFlags?: string[];

  /** Hasil analisis AI Smart Triage (risk level, urgency, basis hukum) */
  aiTriage?: AITriageResult;
};

// ─── Modular Data Re-export ──────────────────────────────────────────────────

import { MOCK_REPORTS } from '@/data/adminReportsData';
export { MOCK_REPORTS };
