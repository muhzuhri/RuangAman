'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Lock, User, Eye, EyeOff, ShieldAlert, LogIn, ArrowLeft, ShieldCheck, Sparkles, KeyRound, Sun, Moon, RotateCcw } from 'lucide-react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { checkIsAdminAuthenticated, setAdminAuthSession, clearAdminAuthSession } from '@/lib/adminUtils';

const DEMO_USER = 'admin';
const DEMO_PASS = 'satgas2026';

export default function AdminLoginPage() {
  const router = useRouter();
  const { setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    setMounted(true);
    setIsCheckingAuth(false);
  }, []);

  const isDark = resolvedTheme === 'dark';

  const loginAndRedirect = () => {
    setAdminAuthSession();
    router.push('/admin');
  };

  const handleResetSession = () => {
    clearAdminAuthSession();
    setError('Sesi autentikasi telah di-reset. Silakan login kembali.');
    setIsCheckingAuth(false);
  };

  const handleFillDemo = () => {
    setUsername(DEMO_USER);
    setPassword(DEMO_PASS);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok && data.success) {
        setAdminAuthSession();
        router.push('/admin');
      } else {
        setError(data.error || 'Username atau password salah. Gunakan kredensial demo Satgas.');
        setIsLoading(false);
      }
    } catch {
      // Fallback local jika offline total
      if (username === DEMO_USER && password === DEMO_PASS) {
        loginAndRedirect();
      } else {
        setError('Gagal menghubungi server autentikasi.');
        setIsLoading(false);
      }
    }
  };

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-transparent flex flex-col items-center justify-center gap-4 text-stone-500 dark:text-stone-400 px-4 text-center">
        <div className="w-9 h-9 border-3 border-teal-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-xs font-semibold tracking-wide">Memeriksa Hak Akses Admin...</p>
        <button
          type="button"
          onClick={handleResetSession}
          className="text-xs text-teal-700 dark:text-teal-400 underline hover:opacity-80 mt-2 cursor-pointer flex items-center gap-1.5"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Klik di sini jika halaman tertahan atau ingin reset sesi
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-transparent text-stone-800 dark:text-stone-100 flex flex-col justify-between px-4 py-8 relative overflow-hidden selection:bg-teal-500/20">
      <div className="max-w-6xl mx-auto w-full flex items-center justify-between relative z-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600 dark:text-stone-300 hover:text-stone-900 dark:hover:text-white bg-white/80 dark:bg-stone-800/80 hover:bg-stone-100 dark:hover:bg-stone-700 border border-stone-300 dark:border-stone-600 rounded-xl px-4 py-2.5 transition-all shadow-xs"
        >
          <ArrowLeft className="w-4 h-4 text-teal-700 dark:text-teal-400" />
          <span>Kembali ke Beranda Utama</span>
        </Link>

        <div className="flex items-center gap-2">
          <div className="hidden sm:flex items-center gap-2 bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 px-3.5 py-1.5 rounded-full text-[11px] font-semibold text-teal-800 dark:text-teal-300">
            <ShieldCheck className="w-3.5 h-3.5 text-teal-700 dark:text-teal-400" />
            <span>Satgas PPKS Dedicated Portal</span>
          </div>
          {mounted && (
            <button
              type="button"
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className="p-2 rounded-xl border border-stone-300 dark:border-stone-600 bg-[#f0f0f0] hover:bg-stone-200 dark:bg-stone-700 dark:hover:bg-stone-600 text-stone-700 dark:text-stone-200 transition-colors cursor-pointer"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-stone-700" />}
            </button>
          )}
        </div>
      </div>

      <div className="my-auto py-12 flex justify-center items-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8 space-y-3">
            <div className="w-20 h-20 rounded-2xl bg-gray-700 dark:bg-gray-700 border border-gray-600 flex items-center justify-center mx-auto shadow-lg p-2.5">
              <Image
                src="/images/loogooo.png"
                alt="RuangAman Logo"
                width={64}
                height={64}
                className="w-full h-full object-contain"
                priority
              />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-stone-900 dark:text-white tracking-tight">
                Portal Internal Satgas
              </h1>
              <p className="text-stone-500 dark:text-stone-400 text-xs sm:text-sm mt-1.5">
                Autentikasi Aman Verifikasi Kasus PPKS RuangAman
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-700 backdrop-blur-xl rounded-3xl border border-stone-200 dark:border-gray-600 p-6 sm:p-8 shadow-xl space-y-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-stone-600 dark:text-stone-300 uppercase tracking-wider block">
                  Username / Email Internal
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Masukkan username"
                    className="w-full bg-stone-50 dark:bg-gray-800 border border-stone-200 dark:border-gray-600 rounded-xl pl-11 pr-4 py-3.5 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all font-medium"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-stone-600 dark:text-stone-300 uppercase tracking-wider block">
                  Kata Sandi (Password)
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-stone-50 dark:bg-gray-800 border border-stone-200 dark:border-gray-600 rounded-xl pl-11 pr-12 py-3.5 text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all font-medium"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 transition-colors p-1"
                    title={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="text-rose-700 dark:text-rose-300 text-xs font-semibold bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 rounded-xl px-4 py-3 flex items-center gap-2"
                >
                  <ShieldAlert className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-teal-600 hover:bg-teal-500 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl transition-all shadow-md flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                    </svg>
                    Memverifikasi Hak Akses...
                  </span>
                ) : (
                  <>
                    <LogIn className="w-4 h-4" />
                    Masuk ke Dasbor Satgas
                  </>
                )}
              </button>
            </form>

            <div className="bg-stone-50 dark:bg-gray-800/90 border border-stone-200 dark:border-gray-600 rounded-2xl p-4 text-center space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-500 dark:text-stone-400 font-semibold flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" /> Akses Mode Demo:
                </span>
                <span className="text-[11px] font-mono text-teal-700 dark:text-teal-300 font-bold bg-teal-50 dark:bg-teal-950/50 border border-teal-200 dark:border-teal-800 px-2 py-0.5 rounded-md">
                  Satgas 2026
                </span>
              </div>

              <div className="text-xs text-stone-500 dark:text-stone-400 text-left bg-white dark:bg-gray-900 p-2.5 rounded-xl border border-stone-200 dark:border-gray-700 font-mono space-y-1">
                <p>Username: <strong className="text-stone-800 dark:text-stone-200">admin</strong></p>
                <p>Password: <strong className="text-stone-800 dark:text-stone-200">satgas2026</strong></p>
              </div>

              <button
                type="button"
                onClick={handleFillDemo}
                className="w-full bg-stone-100 hover:bg-stone-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-teal-700 dark:text-teal-300 border border-stone-300 dark:border-gray-500 font-semibold py-2 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                Isi Otomatis Kredensial Demo
              </button>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="relative z-10 text-center py-2 text-xs text-stone-500 dark:text-stone-400 font-medium">
        <p>RuangAman — Platform Keamanan & Forensik Digital Satgas PPKS</p>
      </div>
    </div>
  );
}
