'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import {
  ShieldAlert,
  Sun,
  Moon,
  LogOut,
  RefreshCw,
  BarChart3,
  Inbox,
  MessageSquare,
  Menu,
  X,
  FileSpreadsheet,
} from 'lucide-react';
import { type Report } from '@/lib/types';

interface AdminHeaderProps {
  activeTab: 'overview' | 'inbox' | 'chat';
  setActiveTab: (tab: 'overview' | 'inbox' | 'chat') => void;
  reportsCount: number;
  selectedReport: Report | null;
  setSelectedReport: (report: Report | null) => void;
  loadReports: () => void;
  handleLogout: () => void;
  onExportCSV: () => void;
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

  const handleTabClick = (tab: 'overview' | 'inbox' | 'chat') => {
    setActiveTab(tab);
    setSelectedReport(null);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-teal-950/95 dark:bg-stone-900/95 backdrop-blur-md border-b border-stone-800 dark:border-teal-900/50 shadow-md text-white max-w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Logo & Title */}
          <div className="flex items-center gap-2.5">
            <Link
              href="/"
              className="p-1.5 rounded-xl bg-stone-900/60 dark:bg-stone-800/80 border border-stone-700/80 text-teal-400 hover:text-teal-300 transition-colors"
            >
              <ShieldAlert className="w-5 h-5" />
            </Link>
            <div>
              <h1 className="font-bold tracking-tight text-white text-sm sm:text-base leading-tight">
                Dasbor Satgas PPKS
              </h1>
              <p className="text-[10px] text-teal-400 font-medium hidden sm:block leading-tight">
                Portal Internal Verifikasi Laporan
              </p>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <div className="hidden md:flex items-center gap-1.5 p-1 rounded-2xl bg-stone-900/60 border border-stone-800">
            <button
              type="button"
              onClick={() => handleTabClick('overview')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'overview' && !selectedReport
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Overview</span>
            </button>

            <button
              type="button"
              onClick={() => handleTabClick('inbox')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'inbox' || selectedReport
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
              }`}
            >
              <Inbox className="w-4 h-4" />
              <span>Daftar Kasus</span>

            </button>

            <button
              type="button"
              onClick={() => handleTabClick('chat')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'chat' && !selectedReport
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-stone-300 hover:text-white hover:bg-stone-800/60'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-amber-300" />
              <span>Pesan Anonim</span>
            </button>
          </div>

          {/* Desktop Right Action Controls */}
          <div className="hidden md:flex items-center gap-2">
            
            <button
              type="button"
              onClick={loadReports}
              className="p-2 text-stone-300 hover:text-white hover:bg-stone-800/80 rounded-xl transition-colors cursor-pointer"
              title="Muat ulang laporan"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            {mounted && (
              <button
                type="button"
                onClick={() => setTheme(isDark ? 'light' : 'dark')}
                className="p-2 rounded-xl border border-stone-700 bg-stone-800/80 hover:bg-stone-700 text-stone-200 transition-colors cursor-pointer"
                aria-label="Toggle theme"
              >
                {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-amber-200" />}
              </button>
            )}
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 text-xs bg-stone-800/80 border border-stone-700 text-stone-200 hover:text-rose-400 hover:border-rose-800 hover:bg-rose-950/60 font-semibold px-3 py-2 rounded-xl transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar</span>
            </button>
          </div>

          {/* Mobile Hamburger Menu Toggle Button */}
          <div className="flex items-center gap-2 md:hidden">
            {mounted && (
              <button
                type="button"
                onClick={() => setTheme(isDark ? 'light' : 'dark')}
                className="p-2 rounded-xl border border-stone-700/80 bg-stone-900/60 text-stone-200 cursor-pointer"
                aria-label="Toggle theme"
              >
                {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-amber-200" />}
              </button>
            )}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl bg-teal-800/80 hover:bg-teal-700 border border-teal-700 text-white transition-all cursor-pointer shadow-xs"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-Down Hamburger Drawer Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pt-3 pb-2 mt-3 border-t border-stone-800 animate-in slide-in-from-top-2 duration-200 space-y-3">
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider px-2">
                Menu Utama Admin
              </span>

              <button
                type="button"
                onClick={() => handleTabClick('overview')}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                  activeTab === 'overview' && !selectedReport
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-stone-300 hover:text-white bg-stone-900/40 hover:bg-stone-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <BarChart3 className="w-4 h-4 text-teal-300" />
                  <span>Overview & Analisis</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleTabClick('inbox')}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                  activeTab === 'inbox' || selectedReport
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-stone-300 hover:text-white bg-stone-900/40 hover:bg-stone-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Inbox className="w-4 h-4 text-teal-300" />
                  <span>Daftar Kasus Masuk</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => handleTabClick('chat')}
                className={`w-full px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-between cursor-pointer ${
                  activeTab === 'chat' && !selectedReport
                    ? 'bg-teal-600 text-white shadow-xs'
                    : 'text-stone-300 hover:text-white bg-stone-900/40 hover:bg-stone-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <MessageSquare className="w-4 h-4 text-amber-300" />
                  <span>Klarifikasi Pesan Anonim</span>
                </div>
              </button>
            </div>

            {/* Quick Action Footer in Mobile Menu */}
            <div className="pt-2 border-t border-stone-800/80 flex items-center justify-between gap-2 px-1">
              <button
                type="button"
                onClick={() => {
                  loadReports();
                  setMobileMenuOpen(false);
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-stone-900/80 hover:bg-stone-800 border border-stone-700/80 text-stone-200 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5 text-teal-400" />
                <span>Refresh Data</span>
              </button>


              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="flex-1 py-2 px-3 rounded-xl bg-rose-950/60 hover:bg-rose-900 border border-rose-800/80 text-rose-300 text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer"
                title="Keluar"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Keluar</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
