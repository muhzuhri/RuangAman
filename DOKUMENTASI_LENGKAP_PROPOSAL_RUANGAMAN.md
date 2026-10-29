# 📄 Proposal Konseptual & Dokumentasi Teknis: RuangAman

> **Platform Ekosistem Digital Interoperabel, Aman, dan Berbasis AI untuk Pencegahan & Penanganan Kekerasan Seksual di Lingkungan Perguruan Tinggi**  
> *Implementasi Mandat Permendikbudristek No. 30 Tahun 2021 & UU Tindak Pidana Kekerasan Seksual (TPKS) No. 12 Tahun 2022.*

---

## 1. Latar Belakang & Urgensi Masalah

Kekerasan seksual di lingkungan perguruan tinggi masih sering dianalogikan sebagai **fenomena gunung es (*iceberg phenomenon*)**. Sebagian besar korban memilih untuk tidak melaporkan insiden karena berbagai faktor:
1. **Kekhawatiran terhadap Kebocoran Identitas:** Stigma sosial dan potensi intimidasi relasi kuasa.
2. **Ketiadaan Saluran Pelaporan yang Terjamin Anonim:** Sistem pelaporan konvensional seringkali menuntut data diri sebelum laporan diterima.
3. **Keterbatasan Kapasitas Respon Cepat:** Posko pengaduan fisik sering terbatas jam operasional dan beban penanganan kasus awal.
4. **Resiko Rekayasa Bukti Digital:** Masifnya deepfake audio (voice cloning) dan video AI mempersulit verifikasi otentisitas bukti digital.

**RuangAman** hadir sebagai solusi berbasis teknologi web mutakhir dengan pendekatan **Zero-Knowledge Architecture**, **Multimodal AI Incident Triage**, dan **Forensik Bukti Digital**.

---

## 2. Arsitektur Solusi & Keunggulan Inovasi

### 2.1. Pelaporan Anonim Kriptografis (Zero-Knowledge Anonymous Reporting)
- Pelapor tidak memerlukan akun atau nomor identitas mahasiswa.
- Setiap laporan diikat dengan token rahasia 64-karakter acak berkeamanan tinggi yang hanya diketahui oleh pelapor.
- Token digunakan untuk melacak progres verifikasi Satgas dan berkomunikasi secara dua arah tanpa membuka identitas pelapor.

### 2.2. Smart AI Incident Triage (Gemini 2.0 Flash)
- Mengklasifikasikan insiden ke dalam matriks keparahan (*Critical, High, Medium, Low*).
- Mendeteksi indikator bahaya diri atau ancaman keselamatan fisik untuk memicu eskalasi siaga.
- Merekomendasikan rujukan hukum pasal-pasal Permendikbudristek No. 30/2021 dan UU TPKS No. 12/2022 secara otomatis.

### 2.3. Pendampingan Psikologis Awal (Psychological First Aid - Ara)
- Agen AI pendampingan emosional berstandar WHO (*Look, Listen, Link*).
- Beroperasi 24/7 untuk stabilisasi emosional awal pelapor dalam situasi krisis.

### 2.4. Forensik Bukti Digital & Sanitasi Klien
- **EXIF & GPS Sanitizer:** Membersihkan metadata sensitif (koordinat GPS, model perangkat kamera) secara instan di sisi klien sebelum bukti dikirim ke jaringan.
- **Deteksi Heuristik AI (Deepfake Detector):** Memeriksa jejak tanda tangan spektral audio ElevenLabs dan artefak video Sora/Gen-AI.

### 2.5. Interoperabilitas Ekosistem Kampus (OpenAPI 3.0 & Open Data)
- Menyediakan endpoint OpenAPI 3.0 (`/api/openapi`) untuk integrasi dengan SIAKAD dan portal LLDIKTI.
- Agregasi statistik publik berlisensi CC0 (`/api/v1/open-data/statistics`) untuk transparansi tanpa kompromi privasi.

---

## 3. Spesifikasi Teknologi

| Layer | Teknologi |
| :--- | :--- |
| **Frontend Framework** | Next.js 16 (App Router) & React 19 |
| **Bahasa Pemrograman** | TypeScript 5 (Strict Mode) |
| **Styling & Visual** | Tailwind CSS v4 & Framer Motion |
| **3D Rendering** | Three.js & React Three Fiber |
| **Basis Data & Keamanan** | Supabase PostgreSQL dengan Row-Level Security (RLS) |
| **Kecerdasan Buatan** | Google Gemini 2.0 Flash API |
| **Komunikasi Darurat** | Telegram Bot Alert Dispatcher |
| **Kriptografi** | Web Crypto API (HMAC-SHA256, HS256 Session) |

---

## 4. Pengujian & Verifikasi

Seluruh modul keamanan telah diuji melalui automated test suite:
- Uji verifikasi HMAC-SHA256 dan token tamper protection.
- Uji sliding-window rate limiting.
- Uji deteksi manipulasi biner forensik video dan audio.
- Uji alur submission dan dispatch real-time Telegram.

---

*Dokumen disusun oleh Tim Pengembang RuangAman untuk evaluasi teknis dan implementasi ekosistem kampus terintegrasi.*
