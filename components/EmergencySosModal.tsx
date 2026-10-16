'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  ShieldAlert,
  MapPin,
  Phone,
  CheckCircle2,
  X,
  Loader2,
  ExternalLink,
  Radio,
  Navigation,
  RefreshCw,
  Info,
} from 'lucide-react';

interface EmergencySosModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SosStep = 'confirm' | 'locating' | 'sending' | 'success' | 'error';

interface SosResponseData {
  alertId?: string;
  timestamp?: string;
  locationStatus?: string;
  hasCoordinates?: boolean;
  coordinates?: {
    latitude: number;
    longitude: number;
    accuracy?: number | null;
    mapsUrl: string;
  } | null;
  telegramNotified?: boolean;
  telegramError?: string | null;
  isSimulated?: boolean;
  message?: string;
}

export default function EmergencySosModal({ isOpen, onClose }: EmergencySosModalProps) {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState<SosStep>('confirm');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [clientNote, setClientNote] = useState<string>('');
  const [resultData, setResultData] = useState<SosResponseData | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');

  useEffect(() => {
    setMounted(true);
  }, []);

  // Reset modal state saat dibuka kembali
  useEffect(() => {
    if (isOpen) {
      setStep('confirm');
      setStatusMessage('');
      setClientNote('');
      setResultData(null);
      setErrorMessage('');
    }
  }, [isOpen]);

  const handleTriggerSOS = async () => {
    setStep('locating');
    setStatusMessage('Mengakses GPS & koordinat lokasi perangkat Anda...');

    // Cek ketersediaan Geolocation API di browser
    if (typeof window === 'undefined' || !navigator.geolocation) {
      await sendSosPayload({
        latitude: null,
        longitude: null,
        accuracy: null,
        locationStatus: 'not_supported',
      });
      return;
    }

    let hasResponded = false;

    // Timeout proteksi: Beri waktu 12 detik agar sensor GPS / Wi-Fi lokasi stabil
    const locationTimeout = setTimeout(async () => {
      if (!hasResponded) {
        hasResponded = true;
        console.warn('[SOS Geolocation] Timeout menunggu izin lokasi, melanjutkan tanpa koordinat');
        await sendSosPayload({
          latitude: null,
          longitude: null,
          accuracy: null,
          locationStatus: 'timeout',
        });
      }
    }, 12000);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        if (hasResponded) return;
        hasResponded = true;
        clearTimeout(locationTimeout);

        await sendSosPayload({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          locationStatus: 'granted',
        });
      },
      async (geoError) => {
        if (hasResponded) return;
        hasResponded = true;
        clearTimeout(locationTimeout);

        let status = 'unavailable';
        if (geoError.code === geoError.PERMISSION_DENIED) {
          status = 'denied';
        } else if (geoError.code === geoError.TIMEOUT) {
          status = 'timeout';
        }

        console.warn('[SOS Geolocation] GPS tidak didapatkan:', geoError.message, `(status: ${status})`);

        // Graceful fallback: Sinyal SOS TETAP dikirim meski izin lokasi ditolak
        await sendSosPayload({
          latitude: null,
          longitude: null,
          accuracy: null,
          locationStatus: status,
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 11500,
        maximumAge: 0,
      }
    );
  };

  const sendSosPayload = async (coords: {
    latitude: number | null;
    longitude: number | null;
    accuracy?: number | null;
    locationStatus: string;
  }) => {
    setStep('sending');
    setStatusMessage('Meneruskan sinyal darurat ke Keamanan Kampus & Satgas...');

    try {
      const response = await fetch('/api/sos-alert', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracy: coords.accuracy,
          locationStatus: coords.locationStatus,
          clientNote: clientNote.trim() || undefined,
          timestamp: new Date().toISOString(),
        }),
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data?.error || 'Gagal menyiarkan panggilan darurat.');
      }

      setResultData(data);
      setStep('success');
    } catch (err: any) {
      console.error('[SOS Trigger] Error saat mengirimkan sinyal:', err);
      setErrorMessage(
        err?.message || 'Gagal menghubungi server darurat. Silakan hubungi langsung nomor darurat di bawah.'
      );
      setStep('error');
    }
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop dengan blur dan aksen merah krisis */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => {
            if (step !== 'locating' && step !== 'sending') {
              onClose();
            }
          }}
          className="fixed inset-0 bg-stone-950/80 backdrop-blur-md transition-opacity"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 16 }}
          transition={{ type: 'spring', damping: 25, stiffness: 320 }}
          className="relative w-full max-w-lg bg-stone-900 border-2 border-red-500/80 rounded-2xl shadow-2xl shadow-red-950/60 text-white overflow-hidden z-10"
          role="dialog"
          aria-modal="true"
        >
          {/* Header Bar dengan Garis Merah Darurat */}
          <div className="bg-gradient-to-r from-red-700 via-red-600 to-rose-700 px-6 py-4 flex items-center justify-between border-b border-red-500/40">
            <div className="flex items-center gap-2.5">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-80" />
                <span className="relative inline-flex rounded-full h-3 w-3 bg-white" />
              </span>
              <div className="flex items-center gap-1.5 font-black text-sm tracking-widest text-white uppercase">
                <ShieldAlert className="w-5 h-5 text-amber-300" />
                <span>Panggilan Darurat Kampus (SOS)</span>
              </div>
            </div>

            {step !== 'locating' && step !== 'sending' && (
              <button
                onClick={onClose}
                className="p-1 rounded-lg text-red-100 hover:text-white hover:bg-red-800/60 transition-colors"
                aria-label="Tutup modal"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Modal Body */}
          <div className="p-6 space-y-5">
            {/* ── STEP 1: CONFIRMATION ──────────────────────────── */}
            {step === 'confirm' && (
              <div className="space-y-5 text-center sm:text-left">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-red-950/80 border-2 border-red-600 flex items-center justify-center shrink-0 shadow-inner">
                    <Radio className="w-7 h-7 text-red-500 animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-lg sm:text-xl font-bold text-white">
                      Kirim Sinyal Bahaya Darurat ke Keamanan Kampus?
                    </h3>
                    <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                      Tombol ini digunakan untuk situasi krisis, ancaman fisik, atau kondisi darurat di lingkungan kampus.
                    </p>
                  </div>
                </div>

                {/* Box Penjelasan & Geolocation Info */}
                <div className="p-3.5 rounded-xl bg-stone-950/70 border border-stone-800 text-xs text-stone-300 space-y-2">
                  <div className="flex items-center gap-2 text-amber-400 font-semibold">
                    <Navigation className="w-4 h-4 shrink-0 text-amber-400" />
                    <span>Transmisi Titik Koordinat Real-Time</span>
                  </div>
                  <p className="leading-relaxed">
                    Browser Anda akan meminta izin akses GPS untuk mengirimkan link Google Maps lokasi Anda langsung ke tim patroli keamanan & Satgas PPKS.
                  </p>
                  <p className="text-[11px] text-stone-400 italic">
                    *Jika akses lokasi ditolak, sinyal darurat SOS tetap akan terkirim dengan status darurat aktif.
                  </p>
                </div>

                {/* Input Lokasi Spesifik / Gedung */}
                <div className="space-y-1.5 text-left">
                  <label className="text-[11px] font-bold text-stone-300 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 text-amber-300">
                      <Navigation className="w-3.5 h-3.5" />
                      <span>Gedung / Lokasi Spesifik Anda:</span>
                    </span>
                    <span className="text-stone-400 font-normal text-[10px]">Opsional</span>
                  </label>
                  <input
                    type="text"
                    value={clientNote}
                    onChange={(e) => setClientNote(e.target.value)}
                    placeholder="Contoh: Gedung Kuliah A Lt. 2, Depan Kantin..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-stone-950/80 border border-stone-700 text-xs text-white placeholder:text-stone-500 focus:outline-none focus:border-red-500 transition-colors"
                  />
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {[
                      'Kampus Indralaya (Ogan Ilir)',
                      'Kampus Bukit Palembang',
                      'Kos / Kontrakan Mahasiswa',
                      'Gedung Kuliah / Kelas',
                      'Perpustakaan',
                    ].map((preset) => (
                      <button
                        key={preset}
                        type="button"
                        onClick={() => {
                          setClientNote((prev) => (prev ? `${prev}, ${preset}` : preset));
                        }}
                        className="text-[10px] px-2 py-1 rounded-md bg-stone-800/90 hover:bg-stone-700 text-stone-300 border border-stone-700/60 transition-colors cursor-pointer"
                      >
                        + {preset}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-amber-300/90">
                    💡 <b>Sangat disarankan diisi jika mengakses via Laptop</b> (karena laptop mengandalkan estimasi Wi-Fi/IP provider ±500m) agar petugas langsung menuju ke gedung, lantai, atau ruangan yang tepat.
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="w-full sm:w-1/3 py-3 px-4 rounded-xl text-sm font-semibold bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition-colors cursor-pointer"
                  >
                    Batalkan
                  </button>
                  <button
                    type="button"
                    onClick={handleTriggerSOS}
                    className="w-full sm:w-2/3 py-3.5 px-4 rounded-xl text-sm font-bold bg-gradient-to-r from-red-600 via-red-500 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-lg shadow-red-700/50 flex items-center justify-center gap-2 active:scale-98 transition-all cursor-pointer border border-red-400/40"
                  >
                    <AlertTriangle className="w-4 h-4 animate-bounce" />
                    <span>KIRIM SINYAL SOS SEKARANG</span>
                  </button>
                </div>
              </div>
            )}

            {/* ── STEP 2 & 3: LOCATING & SENDING ─────────────────── */}
            {(step === 'locating' || step === 'sending') && (
              <div className="py-8 text-center space-y-5">
                <div className="relative mx-auto w-20 h-20 flex items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-600/40 opacity-75" />
                  <div className="w-16 h-16 rounded-full bg-red-950/90 border border-red-500 flex items-center justify-center relative z-10 shadow-lg shadow-red-900/50">
                    <Loader2 className="w-8 h-8 text-red-400 animate-spin" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-base sm:text-lg font-bold text-white tracking-wide">
                    {step === 'locating' ? 'Mendeteksi Lokasi GPS...' : 'Mengirim Sinyal ke Satgas...'}
                  </h4>
                  <p className="text-xs sm:text-sm text-stone-300 max-w-sm mx-auto">
                    {statusMessage}
                  </p>
                  <p className="text-[11px] text-amber-300/80 animate-pulse">
                    Mohon tunggu beberapa detik, jangan menutup jendela ini...
                  </p>
                </div>
              </div>
            )}

            {/* ── STEP 4: SUCCESS ───────────────────────────────── */}
            {step === 'success' && (
              <div className="space-y-4 text-left">
                {/* Status Transmisi Telegram & Sistem */}
                {resultData?.telegramNotified ? (
                  <div className="flex items-center gap-3 p-3.5 rounded-xl bg-emerald-950/70 border border-emerald-500/50 text-emerald-300">
                    <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                    <div>
                      <h4 className="text-sm font-bold text-white">Sinyal Bahaya Darurat Berhasil Disiarkan!</h4>
                      <p className="text-xs text-emerald-300">
                        Notifikasi real-time telah terkirim ke Telegram Tim Keamanan & Satgas PPKS Kampus.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-amber-950/70 border border-amber-600/60 text-amber-200 text-xs space-y-2">
                    <div className="flex items-center gap-2 font-bold text-white">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Sinyal SOS Tersimpan di Sistem Kampus</span>
                    </div>
                    <p className="text-stone-300 leading-relaxed">
                      Sinyal darurat Anda dengan ID <b className="text-amber-300">{resultData?.alertId}</b> telah tercatat di server.
                      Namun pesan otomatis ke Telegram Satgas terkendala:
                    </p>
                    <div className="p-2 rounded bg-amber-900/40 border border-amber-700/40 font-mono text-[11px] text-amber-200 leading-relaxed">
                      {resultData?.telegramError || 'Chat not found'}
                    </div>
                    <div className="pt-1 flex flex-col gap-1.5">
                      <a
                        href="https://t.me/ruangaman_alert_bot"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-sky-900/60 hover:bg-sky-800/80 border border-sky-500/50 text-sky-200 text-xs font-semibold transition-colors"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Buka Bot @ruangaman_alert_bot di Telegram (Tekan START)</span>
                      </a>
                      <p className="text-[10px] text-stone-400 italic">
                        💡 Bot Telegram tidak dapat mengirim pesan sebelum Anda menekan tombol START di chat bot, atau memasukkan bot ke grup Satgas.
                      </p>
                    </div>
                  </div>
                )}

                {/* Detail Koordinat & ID */}
                <div className="p-3.5 rounded-xl bg-stone-950/80 border border-stone-800 space-y-2 text-xs">
                  <div className="flex justify-between items-center text-stone-300 border-b border-stone-800/80 pb-1.5">
                    <span className="text-stone-400">ID Panggilan Darurat:</span>
                    <span className="font-mono font-bold text-amber-400">{resultData?.alertId}</span>
                  </div>

                  {clientNote && (
                    <div className="flex items-start justify-between text-stone-300 border-b border-stone-800/80 pb-1.5">
                      <span className="text-stone-400">Lokasi / Gedung:</span>
                      <span className="font-bold text-right text-stone-100">{clientNote}</span>
                    </div>
                  )}

                  {resultData?.hasCoordinates && resultData.coordinates ? (
                    <div className="space-y-2.5 pt-1">
                      <div className="flex items-start justify-between text-stone-300">
                        <span className="text-stone-400">Titik Koordinat:</span>
                        <span className="font-mono text-right text-stone-200">
                          {resultData.coordinates.latitude.toFixed(6)}, {resultData.coordinates.longitude.toFixed(6)}
                          {resultData.coordinates.accuracy && (
                            <span className="text-amber-300 text-[11px] block font-sans">
                              (Radius Estimasi: ±{Math.round(resultData.coordinates.accuracy)} meter)
                            </span>
                          )}
                        </span>
                      </div>

                      {resultData.coordinates.accuracy && resultData.coordinates.accuracy > 100 && (
                        <div className="p-2.5 rounded-lg bg-stone-900 border border-stone-800 text-[11px] text-stone-300 flex items-start gap-2">
                          <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                          <div className="leading-relaxed">
                            <b className="text-amber-300">Mengapa titik peta bergeser dari posisi Anda?</b><br />
                            Laptop/PC tidak memiliki chip antena GPS satelit fisik, sehingga browser mengandalkan estimasi IP Provider / Wi-Fi (akurasi ±{Math.round(resultData.coordinates.accuracy)}m). Hal ini wajar dan bukan karena lokasi Anda tidak terdaftar di Google Maps. Jika diakses melalui <b>Smartphone/HP</b>, sensor GPS satelit akan mengunci titik presisi hingga 5-10 meter.
                          </div>
                        </div>
                      )}

                      <a
                        href={resultData.coordinates.mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center justify-center gap-1.5 w-full py-2.5 px-3 rounded-lg bg-teal-900/60 hover:bg-teal-800/80 border border-teal-500/40 text-teal-200 text-xs font-semibold transition-colors mt-1"
                      >
                        <MapPin className="w-3.5 h-3.5 text-teal-400" />
                        <span>Buka Titik Lokasi di Google Maps</span>
                        <ExternalLink className="w-3 h-3 text-teal-400" />
                      </a>
                    </div>
                  ) : (
                    <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-600/30 text-amber-200 text-[11px] leading-relaxed">
                      ⚠️ <b>Lokasi tidak diizinkan oleh perangkat.</b> Sinyal darurat tetap berhasil dikirim ke petugas keamanan dengan ID kasus di atas.
                    </div>
                  )}

                  {resultData?.isSimulated && (
                    <div className="text-[10px] text-stone-400 italic pt-1 text-center">
                      (Mode simulasi Telegram: token bot belum dikonfigurasi di server)
                    </div>
                  )}
                </div>

                {/* Hubungi Langsung Kontak Darurat Kampus */}
                <div className="space-y-2 pt-1">
                  <span className="text-xs font-bold text-stone-300 uppercase tracking-wide">
                    Hubungi Langsung Posko Darurat:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <a
                      href="tel:112"
                      className="flex items-center gap-2 p-2.5 rounded-xl bg-red-950/50 hover:bg-red-900/60 border border-red-700/60 text-white transition-colors"
                    >
                      <Phone className="w-4 h-4 text-red-400 shrink-0" />
                      <div className="text-left">
                        <div className="text-[11px] text-stone-300">Darurat Nasional</div>
                        <div className="font-bold text-sm text-red-300">112 / 110</div>
                      </div>
                    </a>

                    <a
                      href="tel:081123456789"
                      className="flex items-center gap-2 p-2.5 rounded-xl bg-teal-950/50 hover:bg-teal-900/60 border border-teal-700/60 text-white transition-colors"
                    >
                      <Phone className="w-4 h-4 text-teal-400 shrink-0" />
                      <div className="text-left">
                        <div className="text-[11px] text-stone-300">Hotline Satgas PPKS</div>
                        <div className="font-bold text-xs text-teal-300">0811-2345-6789</div>
                      </div>
                    </a>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full mt-2 py-2.5 px-4 rounded-xl text-sm font-semibold bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white transition-colors cursor-pointer"
                >
                  Tutup Jendela
                </button>
              </div>
            )}

            {/* ── STEP 5: ERROR FALLBACK ─────────────────────────── */}
            {step === 'error' && (
              <div className="space-y-4 text-left">
                <div className="p-3.5 rounded-xl bg-red-950/80 border border-red-600/70 text-red-200 space-y-1">
                  <div className="flex items-center gap-2 font-bold text-sm text-white">
                    <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
                    <span>Gagal Mengirim Sinyal Otomatis</span>
                  </div>
                  <p className="text-xs text-red-300 leading-relaxed">{errorMessage}</p>
                </div>

                <div className="space-y-2">
                  <p className="text-xs font-semibold text-stone-300">
                    Segera hubungi nomor darurat di bawah ini melalui telepon seluler:
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <a
                      href="tel:112"
                      className="flex items-center gap-2 p-3 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-sm justify-center transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                      <span>Telepon 112 (Darurat)</span>
                    </a>
                    <button
                      type="button"
                      onClick={handleTriggerSOS}
                      className="flex items-center gap-2 p-3 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-200 font-semibold text-sm justify-center transition-colors cursor-pointer"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Coba Kirim Ulang</span>
                    </button>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-stone-900 border border-stone-800 text-stone-400 hover:text-white transition-colors cursor-pointer"
                >
                  Tutup
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>,
    document.body
  );
}
