'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sun,
  Moon,
  LogOut,
  RefreshCw,
  BarChart3,
  Inbox,
  MessageSquare,
  Menu,
  X,
  Shield,
} from 'lucide-react';
import { type Report } from '@/lib/types';

interface AdminHeaderProps {
  activeTab: 'overview' | 'inbox' | 'chat';
  setActiveTab: (tab: 'overview' | 'inbox' | 'chat') => void;
  reportsCount: number;
  selectedReport: Report | null;
  setSelectedReport: (report: Report | null) => void;
  loadReports: () => void | Promise<void>;
  handleLogout: () => void;
  onExportCSV?: () => void;
  mounted: boolean;
}

export default function AdminHeader({
  activeTab,
  setActiveTab,
  reportsCount,
  selectedReport,
  setSelectedReport,
  loadReports,
  handleLogout,
  onExportCSV,
  mounted,
}: AdminHeaderProps) {
  const { setTheme, resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);

  const handleTabClick = (tab: 'overview' | 'inbox' | 'chat') => {
    setActiveTab(tab);
    setSelectedReport(null);
    setMobileMenuOpen(false);
  };

  const handleManualRefresh = async () => {
    setIsSpinning(true);
    try {
      await loadReports();
    } finally {
      setTimeout(() => setIsSpinning(false), 650);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-gray-700/95 dark:bg-slate-800/95 backdrop-blur-xl border-b border-gray-600/90 shadow-lg text-white max-w-full transition-colors">
      {/* Sleek bottom accent glow line */}
      <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-teal-400 to-transparent opacity-80" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5 sm:py-3">
        <div className="flex items-center justify-between gap-4">
          {/* ─── Left: Brand & Portal Badge ───────────────────────────────────── */}
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2.5 group"
              title="Kembali ke Halaman Publik"
            >
              <div className="relative w-10 h-10 rounded-xl overflow-hidden shrink-0 bg-gray-800/90 border border-gray-600/90 p-0.5 group-hover:border-teal-400 group-hover:shadow-[0_0_15px_rgba(45,212,191,0.35)] transition-all">
                <img
                  src="/images/logo.png"
                  alt="RuangAman Logo"
                  className="w-full h-full object-contain"
                />
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <h1 className="font-extrabold tracking-tight text-white text-sm sm:text-base leading-tight group-hover:text-teal-300 transition-colors flex items-center gap-1.5">
                    Dasbor Satgas PPKS
                  </h1>
                  <span className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-teal-500/15 text-teal-300 border border-teal-500/30">
                    <Shield className="w-2.5 h-2.5 text-teal-400" />
                    ADMIN
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[10px] text-teal-400/90 font-medium leading-tight mt-0.5">
                  <span className="flex h-1.5 w-1.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                  </span>
                  <span className="hidden sm:inline">Live Monitor Data</span>
                  <span className="hidden sm:inline text-gray-500">•</span>
                  <span className="text-stone-300">UINIC 8.0</span>
                </div>
              </div>
            </Link>
          </div>

          {/* ─── Center: Desktop Segmented Navigation Tabs ────────────────────── */}
          <nav className="hidden md:flex items-center gap-1 p-1 rounded-2xl bg-gray-800/90 border border-gray-600/90 shadow-inner">
            {/* Tab: Overview */}
            <button
              type="button"
              onClick={() => handleTabClick('overview')}
              className={`relative px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'overview' && !selectedReport
                  ? 'text-white'
                  : 'text-stone-300 hover:text-white hover:bg-gray-700/60'
              }`}
            >
              {activeTab === 'overview' && !selectedReport && (
                <motion.div
                  layoutId="admin-active-tab-pill"
                  className="absolute inset-0 bg-gradient-to-r from-teal-600 to-teal-500 rounded-xl shadow-md border border-teal-400/40"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-teal-300" />
                <span>Beranda</span>
              </span>
            </button>

            {/* Tab: Daftar Kasus */}
            <button
              type="button"
              onClick={() => handleTabClick('inbox')}
              className={`relative px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'inbox' || selectedReport
                  ? 'text-white'
                  : 'text-stone-300 hover:text-white hover:bg-gray-700/60'
              }`}
            >
              {(activeTab === 'inbox' || selectedReport) && (
                <motion.div
                  layoutId="admin-active-tab-pill"
                  className="absolute inset-0 bg-gradient-to-r from-teal-600 to-teal-500 rounded-xl shadow-md border border-teal-400/40"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <Inbox className="w-4 h-4 text-teal-300" />
                <span>Daftar Kasus</span>
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold ${
                    activeTab === 'inbox' || selectedReport
                      ? 'bg-white/20 text-white'
                      : 'bg-teal-500/20 text-teal-300 border border-teal-500/30'
                  }`}
                >
                  {reportsCount}
                </span>
              </span>
            </button>

            {/* Tab: Pesan Anonim */}
            <button
              type="button"
              onClick={() => handleTabClick('chat')}
              className={`relative px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'chat' && !selectedReport
                  ? 'text-white'
                  : 'text-stone-300 hover:text-white hover:bg-gray-700/60'
              }`}
            >
              {activeTab === 'chat' && !selectedReport && (
                <motion.div
                  layoutId="admin-active-tab-pill"
                  className="absolute inset-0 bg-gradient-to-r from-teal-600 to-teal-500 rounded-xl shadow-md border border-teal-400/40"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}
              <span className="relative z-10 flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-amber-300" />
                <span>Percakapan</span>
              </span>
            </button>
          </nav>

          {/* ─── Right: Quick Action Controls & Utilities ─────────────────────── */}
          <div className="hidden md:flex items-center gap-2">
            {/* Refresh Data Button */}
            <button
              type="button"
              onClick={handleManualRefresh}
              disabled={isSpinning}
              className="p-2 text-stone-200 hover:text-white hover:bg-gray-700 bg-gray-800/90 border border-gray-600/90 rounded-xl transition-all cursor-pointer shadow-xs"
              title="Sinkronisasi & Segarkan Data Laporan"
            >
              <RefreshCw className={`w-4 h-4 text-teal-400 ${isSpinning ? 'animate-spin' : ''}`} />
            </button>

            {/* Theme Mode Toggle Button */}
            {mounted && (
              <button
                type="button"
                onClick={() => setTheme(isDark ? 'light' : 'dark')}
                className="p-2 rounded-xl border border-gray-600/90 bg-gray-800/90 hover:bg-gray-700 text-stone-200 transition-all cursor-pointer shadow-xs"
                aria-label="Ganti Tema Tampilan"
                title={isDark ? 'Beralih ke Mode Terang' : 'Beralih ke Mode Gelap'}
              >
                {isDark ? (
                  <Sun className="w-4 h-4 text-amber-400 animate-in spin-in-90 duration-300" />
                ) : (
                  <Moon className="w-4 h-4 text-cyan-300 animate-in spin-in-90 duration-300" />
                )}
              </button>
            )}

            {/* Logout Button */}
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs bg-gray-800/90 border border-gray-600/90 text-stone-200 hover:text-rose-300 hover:border-rose-500/60 hover:bg-rose-950/60 font-semibold px-3.5 py-2 rounded-xl transition-all cursor-pointer shadow-xs"
              title="Keluar dari Dasbor Satgas"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span>Keluar</span>
            </button>
          </div>

          {/* ─── Mobile Actions Group ────────────────────────────────────────── */}
          <div className="flex items-center gap-2 md:hidden">
            {mounted && (
              <button
                type="button"
                onClick={() => setTheme(isDark ? 'light' : 'dark')}
                className="p-2 rounded-xl border border-gray-600 bg-gray-800 text-stone-200 cursor-pointer shadow-xs"
                aria-label="Toggle theme"
              >
                {isDark ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-cyan-300" />
                )}
              </button>
            )}

            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 border border-gray-600 text-white transition-all cursor-pointer shadow-xs"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-teal-400" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* ─── Mobile Slide-Down Drawer Menu ───────────────────────────────── */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
              className="md:hidden overflow-hidden pt-3 pb-2 mt-3 border-t border-gray-600/80 space-y-3"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between px-2 text-[10px] font-bold text-teal-400 uppercase tracking-wider">
                  <span>Menu Navigasi Satgas</span>
                  <span className="font-mono text-stone-400">{reportsCount} Total Berkas</span>
                </div>

                <button
                  type="button"
                  onClick={() => handleTabClick('overview')}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                    activeTab === 'overview' && !selectedReport
                      ? 'bg-gradient-to-r from-teal-600 to-teal-500 text-white shadow-md'
                      : 'text-stone-200 hover:text-white bg-gray-800/90 hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <BarChart3 className="w-4 h-4 text-teal-300" />
                    <span>Beranda</span>
                  </div>
                  <span className="text-[10px] opacity-75 font-mono">KPI & Grafik</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTabClick('inbox')}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                    activeTab === 'inbox' || selectedReport
                      ? 'bg-gradient-to-r from-teal-600 to-teal-500 text-white shadow-md'
                      : 'text-stone-200 hover:text-white bg-gray-800/90 hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Inbox className="w-4 h-4 text-teal-300" />
                    <span>Daftar Kasus Masuk</span>
                  </div>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-teal-500/20 text-teal-300 border border-teal-500/30">
                    {reportsCount} Kasus
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTabClick('chat')}
                  className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                    activeTab === 'chat' && !selectedReport
                      ? 'bg-gradient-to-r from-teal-600 to-teal-500 text-white shadow-md'
                      : 'text-stone-200 hover:text-white bg-gray-800/90 hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <MessageSquare className="w-4 h-4 text-amber-300" />
                    <span>Klarifikasi Pesan Anonim</span>
                  </div>
                  <span className="text-[10px] opacity-75 font-mono">Chat Terenkripsi</span>
                </button>

              </div>

              {/* Mobile Quick Action Buttons (Refresh & Keluar) */}
              <div className="pt-2 border-t border-gray-600/80 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    handleManualRefresh();
                    setMobileMenuOpen(false);
                  }}
                  className="py-2 px-2.5 rounded-xl bg-gray-800/90 hover:bg-gray-700 border border-gray-600 text-stone-200 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-teal-400 ${isSpinning ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    handleLogout();
                  }}
                  className="py-2 px-2.5 rounded-xl bg-gray-800/90 hover:bg-rose-950/70 border border-gray-600 hover:border-rose-700 text-rose-300 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  title="Keluar"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Keluar</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
