'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import TiltCard from '@/components/hero/TiltCard';
import {
  ShieldCheck,
  Lock,
  FileCheck,
  EyeOff,
  Cpu,
  UserCheck,
  Scale,
  Fingerprint,
  CheckCircle,
  FileSearch,
  MessageSquare,
  Sparkles,
  Zap,
} from 'lucide-react';

export default function TrustAndSecuritySection() {
  const [activeTab, setActiveTab] = useState<'flow' | 'security' | 'antiTamper'>('flow');

  const containerVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, staggerChildren: 0.1 } },
  };

  const childVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <section className="relative z-10 space-y-14 home-block">
      {/* SECTION HEADER */}
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, margin: '-100px' }}
        variants={containerVariants}
        className="text-center space-y-4 max-w-3xl mx-auto"
      >
        <motion.div variants={childVariants} className="inline-flex items-center gap-2 bg-white dark:bg-[#163432] border border-stone-200 dark:border-teal-900 px-4 py-1.5 rounded-full">
          <ShieldCheck className="w-4 h-4 text-teal-800 dark:text-teal-400" />
          <span className="text-xs font-semibold text-stone-700 dark:text-stone-300 tracking-wider uppercase">Jaminan keamanan & integritas</span>
        </motion.div>

        <motion.h2 variants={childVariants} className="text-3xl md:text-4xl font-semibold tracking-tight text-stone-900 dark:text-white leading-tight">
          Mengapa Anda Dapat Merekam Laporan Tanpa Keraguan?
        </motion.h2>

        <motion.p variants={childVariants} className="text-stone-600 dark:text-stone-400 text-base md:text-lg leading-relaxed">
          AmanKampus dibangun di atas fondasi <strong className="text-teal-800 dark:text-teal-400 font-semibold">zero-knowledge architecture</strong> dan kriptografi SHA-256. Privasi korban dilindungi, bukti tidak mudah direkayasa.
        </motion.p>
      </motion.div>

      {/* PERSUASIVE NARRATIVE BANNER */}
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative overflow-hidden bg-[#f4f4f4] dark:bg-[#163432] border border-stone-300 dark:border-teal-900 rounded-2xl p-8 md:p-12 shadow-sm text-stone-800 dark:text-stone-100"
      >
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7 space-y-5">
            <div className="inline-flex items-center gap-2 bg-stone-100 dark:bg-[#0a2220] border border-stone-200 dark:border-teal-900 rounded-lg px-3 py-1 text-xs font-mono text-stone-700 dark:text-stone-300">
              <Lock className="w-3.5 h-3.5 text-teal-800" /> Proteksi ganda: anonimitas korban & akurasi bukti
            </div>
            <h3 className="text-2xl md:text-3xl font-semibold tracking-tight text-stone-900 dark:text-white leading-tight">
              Bukan tempat persekusi publik, melainkan portal resmi penanganan kasus
            </h3>
            <p className="text-stone-600 dark:text-stone-400 text-sm md:text-base leading-relaxed">
              Banyak korban enggan melapor karena takut identitasnya bocor, dan banyak instansi ragu karena takut aduan dijadikan alat saling menjatuhkan. <strong className="text-stone-800 dark:text-stone-200">AmanKampus memecahkan kedua masalah tersebut sekaligus:</strong>
            </p>
            <ul className="space-y-2 text-xs md:text-sm text-stone-600 dark:text-stone-400">
              <li className="flex items-center gap-2.5">
                <CheckCircle className="w-4 h-4 text-teal-800 shrink-0" />
                <span><strong className="text-stone-800 dark:text-stone-200">Bagi pelapor:</strong> Identitas (nama/NIM/IP) tidak dicatat atau disimpan di server mana pun.</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle className="w-4 h-4 text-teal-800 shrink-0" />
                <span><strong className="text-stone-800 dark:text-stone-200">Bagi verifikasi kasus:</strong> Setiap file terhitung nilai SHA-256 hash mutlak & dipindai forensik digital.</span>
              </li>
              <li className="flex items-center gap-2.5">
                <CheckCircle className="w-4 h-4 text-teal-800 shrink-0" />
                <span><strong className="text-stone-800 dark:text-stone-200">Bagi proses hukum/etik:</strong> Tidak dipublikasikan ke umum. Hanya diulas oleh Satgas PPKS resmi.</span>
              </li>
            </ul>
          </div>

          <div className="lg:col-span-5 bg-stone-50 dark:bg-[#0a2220] border border-stone-200 dark:border-teal-900 rounded-2xl p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-stone-200 dark:border-teal-900 pb-3">
              <span className="text-xs font-semibold font-mono text-teal-800 dark:text-teal-400 uppercase tracking-widest flex items-center gap-1.5">
                <Fingerprint className="w-4 h-4" /> Proof-of-authenticity
              </span>
              <span className="text-[10px] bg-white dark:bg-[#163432] text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-600 px-2 py-0.5 rounded font-mono">
                Cryptographic
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="bg-white dark:bg-[#163432] p-3 rounded-xl border border-stone-200 dark:border-teal-900 space-y-1">
                <p className="text-stone-500 text-[10px]">VERIFIKASI INTEGRITAS FILE</p>
                <p className="text-stone-800 dark:text-stone-200 font-semibold break-all">SHA256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</p>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div className="bg-white dark:bg-[#163432] p-2.5 rounded-lg border border-stone-200 dark:border-teal-900">
                  <p className="text-stone-500 text-[10px]">EXIF PRIVACY</p>
                  <p className="text-teal-800 dark:text-teal-400 font-semibold">Location stripped</p>
                </div>
                <div className="bg-white dark:bg-[#163432] p-2.5 rounded-lg border border-stone-200 dark:border-teal-900">
                  <p className="text-stone-500 text-[10px]">FORENSIC SCORE</p>
                  <p className="text-teal-800 dark:text-teal-400 font-semibold">Native capture</p>
                </div>
              </div>
            </div>

            <p className="text-[11px] text-stone-500 italic text-center pt-1">
              Setiap byte data dilindungi enkripsi otomatis di perangkat pelapor.
            </p>
          </div>
        </div>
      </motion.div>

      {/* INTERACTIVE NAVIGATION TABS */}
      <div className="flex justify-center">
        <div className="bg-stone-100 dark:bg-[#163432] p-1.5 rounded-2xl border border-stone-200 dark:border-teal-900 inline-flex gap-1 flex-wrap justify-center">
          <button
            onClick={() => setActiveTab('flow')}
            className={`px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'flow'
                ? 'bg-white dark:bg-[#0a2220] text-teal-800 dark:text-teal-300 shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <Zap className="w-4 h-4" /> Alur Penggunaan Platform
          </button>
          <button
            onClick={() => setActiveTab('security')}
            className={`px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'security'
                ? 'bg-white dark:bg-[#0a2220] text-teal-800 dark:text-teal-300 shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <Lock className="w-4 h-4" /> Detail Keamanan Privasi
          </button>
          <button
            onClick={() => setActiveTab('antiTamper')}
            className={`px-5 py-2.5 rounded-xl text-xs md:text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'antiTamper'
                ? 'bg-white dark:bg-[#0a2220] text-teal-800 dark:text-teal-300 shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900 dark:hover:text-white'
            }`}
          >
            <FileSearch className="w-4 h-4" /> Validasi Anti-Fitnah & Bukti
          </button>
        </div>
      </div>

      {/* TAB CONTENT CARDS */}
      <motion.div key={activeTab} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>

        {/* TAB 1: ALUR PENGGUNAAN */}
        {activeTab === 'flow' && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <StepCard
              num="01"
              title="Akses & Relaksasi"
              desc="Masuk tanpa perlu login/daftar. Tersedia modul relaksasi penenang cemas sebelum pelaporan."
              icon={<EyeOff className="w-6 h-6 text-teal-600 dark:text-teal-400" />}
            />
            <StepCard
              num="02"
              title="Pengisian & Enkripsi"
              desc="Isi kronologi. Foto/berkas dibersihkan dari EXIF lokasi & dihitung SHA-256 Hash di browser."
              icon={<Cpu className="w-6 h-6 text-teal-800 dark:text-teal-400" />}
            />
            <StepCard
              num="03"
              title="Terima Token Unik"
              desc="Sistem menerbitkan Token Anonim (misal: AK-2026-X9K2P). Simpan token sebagai kunci tunggal."
              icon={<Fingerprint className="w-6 h-6 text-amber-600 dark:text-amber-400" />}
            />
            <StepCard
              num="04"
              title="Pelacakan & Chat"
              desc="Gunakan token di menu /track untuk melihat progres Satgas & melakukan pesan klarifikasi."
              icon={<MessageSquare className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />}
            />
          </div>
        )}

        {/* TAB 2: DETAIL KEAMANAN */}
        {activeTab === 'security' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard
              title="Zero-Knowledge Architecture"
              desc="Server tidak mencatat alamat IP, identitas akun, NIK, atau cookie pelacak. Identitas Anda benar-benar anonim."
              icon={<EyeOff className="w-6 h-6 text-teal-600 dark:text-teal-400" />}
            />
            <FeatureCard
              title="Client-Side AES-256 Encryption"
              desc="Informasi sensitif disandikan di dalam browser Anda sebelum dikirimkan ke jaringan internet."
              icon={<Lock className="w-6 h-6 text-teal-800 dark:text-teal-400" />}
            />
            <FeatureCard
              title="Anti-Spam & Bot Rate-Limiting"
              desc="Dilengkapi tantangan kalkulasi manusia & pembatasan frekuensi untuk mencegah serangan bot otomatis."
              icon={<Sparkles className="w-6 h-6 text-amber-600 dark:text-amber-400" />}
            />
          </div>
        )}

        {/* TAB 3: VALIDASI ANTI-FITNAH */}
        {activeTab === 'antiTamper' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FeatureCard
              title="SHA-256 Immutability Checksum"
              desc="Mencetak sidik jari kriptografi unik file bukti. Perubahan 1 piksel pun akan merusak hash dan terdeteksi."
              icon={<FileCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />}
            />
            <FeatureCard
              title="Pembersihan Metadata EXIF"
              desc="Menghapus tag lokasi GPS & tipe kamera dari foto bukti agar pelapor tidak dapat dilacak oleh pihak lain."
              icon={<UserCheck className="w-6 h-6 text-teal-600 dark:text-teal-400" />}
            />
            <FeatureCard
              title="Triangulasi Verifikasi Satgas"
              desc="Kasus tidak diproses dari 1 aduan saja. Satgas memverifikasi keaslian file & klaim saksi sebelum tindakan."
              icon={<Scale className="w-6 h-6 text-rose-600 dark:text-rose-400" />}
            />
            <FeatureCard
              title="Defense-in-Depth Anti-Fitnah"
              desc="Lapisan berlapis: forensik biner (bukan sekadar nama file), hash duplikat, batas laju laporan, tantangan manusia, dan kronologi wajib substansial. Bukti AI tidak otomatis valid."
              icon={<ShieldCheck className="w-6 h-6 text-teal-700 dark:text-teal-400" />}
            />
          </div>
        )}

      </motion.div>
    </section>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StepCard({ num, title, desc, icon }: { num: string; title: string; desc: string; icon: React.ReactNode; }) {
  return (
    <TiltCard maxTilt={6}>
      <div className="bg-[#f4f4f4] dark:bg-[#163432] border border-stone-300 dark:border-teal-900 rounded-2xl p-6 space-y-4 shadow-sm h-full">
        <div className="flex items-center justify-between">
          <div className="w-12 h-12 bg-white dark:bg-[#0a2220] rounded-xl flex items-center justify-center border border-stone-200 dark:border-teal-900">
            {icon}
          </div>
          <span className="font-mono text-2xl font-bold text-stone-300 dark:text-stone-500">{num}</span>
        </div>
        <div className="space-y-1.5">
          <h4 className="font-semibold text-stone-800 dark:text-stone-50 text-base">{title}</h4>
          <p className="text-xs text-stone-600 dark:text-stone-300 leading-relaxed">{desc}</p>
        </div>
      </div>
    </TiltCard>
  );
}

function FeatureCard({ title, desc, icon }: { title: string; desc: string; icon: React.ReactNode; }) {
  return (
    <TiltCard maxTilt={6}>
      <div className="bg-[#f4f4f4] dark:bg-[#163432] border border-stone-300 dark:border-teal-900 rounded-2xl p-7 space-y-4 shadow-sm h-full">
        <div className="w-12 h-12 bg-white dark:bg-[#0a2220] rounded-xl flex items-center justify-center border border-stone-200 dark:border-teal-900">
          {icon}
        </div>
        <div className="space-y-2">
          <h4 className="font-semibold text-stone-800 dark:text-stone-50 text-lg">{title}</h4>
          <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed">{desc}</p>
        </div>
      </div>
    </TiltCard>
  );
}
