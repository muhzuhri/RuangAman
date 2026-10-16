-- ============================================================================
-- AMANKAMPUS SUPABASE DATABASE SCHEMA SETUP & SEED DATA
-- Jalankan skrip ini di Supabase Dashboard -> SQL Editor -> Run
-- ============================================================================

-- 1. Buat Tabel 'reports'
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    case_id TEXT NOT NULL UNIQUE,
    anonymous_token TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL,
    incident_time TEXT,
    involved_parties TEXT,
    target_faculty TEXT,
    chronology TEXT NOT NULL,
    evidences JSONB DEFAULT '[]'::jsonb,
    messages JSONB DEFAULT '[]'::jsonb,
    audit_logs JSONB DEFAULT '[]'::jsonb,
    status TEXT NOT NULL DEFAULT 'Laporan Diterima',
    received_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    is_anonymous BOOLEAN DEFAULT true,
    abuse_flags JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Aktifkan Row Level Security (RLS)
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- 3. Kebijakan Keamanan RLS (Row Level Security)

-- Kebijakan 1: Siapapun (Publik & Anonim) dapat mengirimkan laporan baru (INSERT)
DROP POLICY IF EXISTS "Allow public insert to reports" ON public.reports;
CREATE POLICY "Allow public insert to reports"
ON public.reports
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Kebijakan 2: Siapapun (Pelapor untuk Lacak & Admin) dapat membaca laporan (SELECT)
DROP POLICY IF EXISTS "Allow public read of reports" ON public.reports;
CREATE POLICY "Allow public read of reports"
ON public.reports
FOR SELECT
TO anon, authenticated
USING (true);

-- Kebijakan 3: Siapapun (Admin & Pelapor untuk Chat) dapat mengunggah pembaruan status / pesan (UPDATE)
DROP POLICY IF EXISTS "Allow public update of reports" ON public.reports;
CREATE POLICY "Allow public update of reports"
ON public.reports
FOR UPDATE
TO anon, authenticated
USING (true)
WITH CHECK (true);

-- Indexing untuk pencarian cepat berdasarkan token anonim & case_id
CREATE INDEX IF NOT EXISTS idx_reports_anonymous_token ON public.reports(anonymous_token);
CREATE INDEX IF NOT EXISTS idx_reports_case_id ON public.reports(case_id);
CREATE INDEX IF NOT EXISTS idx_reports_received_at ON public.reports(received_at DESC);

-- 4. Sample Seed Data (8 Laporan Sampel untuk Inisialisasi Supabase)
INSERT INTO public.reports (
    case_id,
    anonymous_token,
    category,
    incident_time,
    involved_parties,
    target_faculty,
    chronology,
    evidences,
    messages,
    audit_logs,
    status,
    received_at,
    is_anonymous
) VALUES 
(
    'CASE-2026-00001',
    'AK-2026-X9K2P',
    'Perundungan Verbal & Intimidasi',
    '2 September 2026, Pukul 14.15 WIB',
    'Pengurus organisasi mahasiswa (2 orang)',
    'Fakultas Teknik',
    'Saya mengalami perundungan verbal dan intimidasi psikologis di lingkungan perpustakaan kampus oleh oknum anggota pengurus organisasi. Pelaku mengancam akan menyebarkan rumor tidak benar jika saya tidak menyerahkan data proyek penelitian kelompok.',
    '[{"evidenceId": "EVD-1001", "fileName": "bukti_rekaman_percakapan_dan_chat.png", "fileType": "image/png", "fileSize": 450120, "sha256": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855", "exifStripped": true, "forensicStatus": "Original", "forensicDetails": ["SHA-256 Checksum: Valid & Utuh", "EXIF GPS Metadata: Stripped"], "reporterNote": "Tangkapan layar berisi ancaman intimidasi.", "verificationStatus": "Terverifikasi Valid"}]'::jsonb,
    '[{"id": "MSG-101", "sender": "Pelapor", "text": "Halo Tim Satgas PPKS, mohon jaminan privasi.", "timestamp": "2026-09-02T06:30:00.000Z"}]'::jsonb,
    '[{"id": "AL-101", "action": "Laporan diterima oleh sistem terenkripsi Zero-Knowledge", "actor": "Sistem", "timestamp": "2026-09-02T06:00:00.000Z"}]'::jsonb,
    'Diproses',
    '2026-09-02T06:00:00.000Z',
    true
),
(
    'CASE-2026-00002',
    'AK-2026-B4M1L',
    'Pelecehan Seksual Daring (Cyber Harassment)',
    '31 Agustus 2026, Pukul 22.30 WIB',
    'Akun media sosial anonim',
    'Fakultas MIPA',
    'Menerima pesan tidak pantas dan foto tidak etis secara berulang dari oknum akun anonim melalui media sosial mahasiswa.',
    '[]'::jsonb,
    '[]'::jsonb,
    '[{"id": "AL-201", "action": "Laporan diterima oleh sistem terenkripsi", "actor": "Sistem", "timestamp": "2026-09-01T09:30:00.000Z"}]'::jsonb,
    'Laporan Diterima',
    '2026-09-01T09:30:00.000Z',
    true
),
(
    'CASE-2026-00003',
    'AK-2026-T7Q9X',
    'Intimidasi Akademik & Penyalahgunaan Wewenang',
    '28 Agustus 2026',
    'Oknum pengajar / asisten praktikum',
    'Fakultas Ekonomi',
    'Indikasi pemaksaan pengerjaan tugas di luar silabus praktikum dengan ancaman penurunan nilai akhir mata kuliah jika permintaan tidak dipenuhi.',
    '[]'::jsonb,
    '[{"id": "MSG-301", "sender": "Satgas", "text": "Kasus ini telah diselesaikan secara kekeluargaan.", "timestamp": "2026-08-30T16:00:00.000Z"}]'::jsonb,
    '[{"id": "AL-301", "action": "Laporan diterima oleh sistem", "actor": "Sistem", "timestamp": "2026-08-30T15:00:00.000Z"}]'::jsonb,
    'Selesai',
    '2026-08-30T15:00:00.000Z',
    true
),
(
    'CASE-2026-00004',
    'AK-2026-M8K4W',
    'Diskriminasi & Perlakuan Tidak Adil',
    '3 September 2026, Pukul 10.00 WIB',
    'Pengawas Ujian Laboratorium',
    'Fakultas Ilmu Budaya',
    'Pengabaian dan perlakuan diskriminatif terhadap fasilitas aksesibilitas bagi mahasiswa penyandang disabilitas saat kegiatan ujian laboratorium.',
    '[]'::jsonb,
    '[]'::jsonb,
    '[{"id": "AL-401", "action": "Laporan diterima oleh sistem", "actor": "Sistem", "timestamp": "2026-09-03T11:00:00.000Z"}]'::jsonb,
    'Diverifikasi',
    '2026-09-03T11:00:00.000Z',
    true
),
(
    'CASE-2026-00005',
    'AK-2026-F9X2M',
    'Pemalsuan Bukti Digital & AI Deepfake',
    '4 September 2026, Pukul 19.00 WIB',
    'Akun bot / penyebar konten rekayasa AI',
    'Fakultas Ilmu Komputer',
    'Pelaporan dugaan manipulasi foto dan penyebaran konten buatan AI (Deepfake / Synthesized Image) yang disebarkan untuk merusak reputasi mahasiswa.',
    '[{"evidenceId": "EVD-5001", "fileName": "tangkapan_layar_foto_rekayasa_ai.png", "fileType": "image/png", "fileSize": 1240500, "sha256": "7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069", "exifStripped": true, "forensicStatus": "Manipulated", "forensicDetails": ["⚠️ Indikasi Generatif AI"], "reporterNote": "Berkas bukti pencemaran nama baik.", "verificationStatus": "Tervalidasi Palsu / Ditolak"}]'::jsonb,
    '[]'::jsonb,
    '[{"id": "AL-501", "action": "Laporan diterima oleh sistem terenkripsi", "actor": "Sistem", "timestamp": "2026-09-04T11:50:00.000Z"}]'::jsonb,
    'Eskalasi ke Komite Etik',
    '2026-09-04T11:50:00.000Z',
    true
),
(
    'CASE-2026-00006',
    'AK-2026-P3K7V',
    'Stalking & Penguntitan di Area Kampus',
    '5 September 2026, Pukul 17.30 WIB',
    'Oknum tidak dikenal (Stalker)',
    'Fakultas Hukum',
    'Penguntitan berulang di area parkir gedung perkuliahan dan lorong fakultas oleh oknum yang tidak dikenal.',
    '[{"evidenceId": "EVD-6001", "fileName": "tangkapan_layar_pesan_stalking.png", "fileType": "image/png", "fileSize": 512000, "sha256": "a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0", "exifStripped": true, "forensicStatus": "Original", "forensicDetails": ["SHA-256 Checksum: Valid & Utuh"], "verificationStatus": "Terverifikasi Valid"}]'::jsonb,
    '[]'::jsonb,
    '[{"id": "AL-601", "action": "Laporan diterima oleh sistem terenkripsi", "actor": "Sistem", "timestamp": "2026-09-05T10:30:00.000Z"}]'::jsonb,
    'Diproses',
    '2026-09-05T10:30:00.000Z',
    true
),
(
    'CASE-2026-00007',
    'AK-2026-R8N4L',
    'Pelecehan Fisik di Ruang Laboratorium',
    '6 September 2026, Pukul 19.45 WIB',
    'Asisten Laboratorium',
    'Fakultas Ilmu Komputer',
    'Tindakan kontak fisik yang tidak diinginkan dan ucapan bernada pelecehan saat kegiatan praktikum malam di Laboratorium Komputer.',
    '[]'::jsonb,
    '[]'::jsonb,
    '[{"id": "AL-701", "action": "Laporan diterima oleh sistem terenkripsi", "actor": "Sistem", "timestamp": "2026-09-06T13:00:00.000Z"}]'::jsonb,
    'Diverifikasi',
    '2026-09-06T13:00:00.000Z',
    true
),
(
    'CASE-2026-00008',
    'AK-2026-Z2W9P',
    'Pengancaman & Pemerasan Dokumen Pribadi',
    '7 September 2026, Pukul 21.00 WIB',
    'Oknum akun anonim',
    'Fakultas Kedokteran',
    'Pemerasan dengan ancaman penyebaran dokumen pribadi dan rekaman jika tidak mentransfer sejumlah uang ke rekening tertentu.',
    '[{"evidenceId": "EVD-8001", "fileName": "bukti_transfer_dan_ancaman.png", "fileType": "image/png", "fileSize": 680000, "sha256": "f8e7d6c5b4a392817019283746554433221100ffeeddccbbaa99887766554433", "exifStripped": true, "forensicStatus": "Original", "forensicDetails": ["SHA-256 Checksum: Valid & Utuh"], "verificationStatus": "Terverifikasi Valid"}]'::jsonb,
    '[]'::jsonb,
    '[{"id": "AL-801", "action": "Laporan diterima oleh sistem terenkripsi", "actor": "Sistem", "timestamp": "2026-09-07T15:00:00.000Z"}]'::jsonb,
    'Mediation & Konseling',
    '2026-09-07T15:00:00.000Z',
    true
)
ON CONFLICT (case_id) DO NOTHING;

