'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sun, Moon, AlertTriangle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import EmergencySosModal from '@/components/EmergencySosModal';

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [isSosModalOpen, setIsSosModalOpen] = useState(false);

  const { setTheme, resolvedTheme } = useTheme();

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setIsScrolled(window.scrollY > 12);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (pathname?.startsWith('/admin')) {
    return null;
  }

  const navLinks = [
    { name: 'Beranda', path: '/' },
    { name: 'Formulir', path: '/report' },
    { name: 'Pelacakan', path: '/track' },
    { name: 'Bantuan & PFA', path: '/support' },
    { name: 'Edukasi', path: '/education' },
  ];

  const isDark = resolvedTheme === 'dark';

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 bg-teal-900 dark:bg-mauve-900 backdrop-blur-md transition-colors ${
        isScrolled
          ? 'border-b border-stone-800 dark:border-teal-900 shadow-md'
          : 'border-b border-stone-800/80 dark:border-teal-800/80'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 h-18 flex items-center justify-between py-4">
        <Link href="/" className="flex items-center gap-1 group">
          <div className="w-13 h-12 rounded-xl overflow-hidden shrink-0 group-hover:opacity-90 transition-opacity">
            <Image
              src="/images/logii.png"
              alt="AmanKampus Logo"
              width={48}
              height={48}
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-lg font-bold tracking-tight text-white dark:text-white group-hover:text-teal-400 dark:group-hover:text-teal-400 transition-colors">
            AmanKampus
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
          {navLinks.map((link) => {
            const isActive = pathname === link.path;
            return (
              <Link
                key={link.name}
                href={link.path}
                className={`relative px-4 py-2 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'text-teal-300 dark:text-teal-400 font-semibold bg-teal-950/60 dark:bg-teal-950/50'
                    : 'text-stone-300 dark:text-stone-300 hover:text-white dark:hover:text-white hover:bg-stone-800 dark:hover:bg-stone-800'
                }`}
              >
                {link.name}
                {isActive && (
                  <motion.div
                    layoutId="active-pill"
                    className="absolute inset-0 border border-teal-500/50 dark:border-teal-700 rounded-lg"
                    initial={false}
                    transition={{ type: "spring", stiffness: 350, damping: 32 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {/* Tombol SOS / Darurat (Desktop) - Gaya visual krisis dengan aksen merah menyala & glowing */}
          <button
            onClick={() => setIsSosModalOpen(true)}
            className="group relative flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-red-600 via-rose-600 to-red-600 hover:from-red-500 hover:to-rose-500 text-white shadow-lg shadow-red-700/40 border border-red-400/60 transition-all duration-200 active:scale-95 cursor-pointer overflow-hidden animate-pulse hover:animate-none"
            aria-label="Tombol Darurat SOS Kampus"
            title="Kirim Sinyal Bahaya Darurat SOS ke Keamanan Kampus"
          >
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-80" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-300" />
            </span>
            <AlertTriangle className="w-4 h-4 text-amber-200 shrink-0" />
            <span className="font-extrabold text-white drop-shadow-sm">SOS / Darurat</span>
          </button>

          {/* Theme Toggle Button */}
          {mounted && (
            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className="p-2 rounded-xl border border-stone-700 dark:border-stone-600 bg-[#163432] hover:bg-stone-700 dark:bg-[#163432] dark:hover:bg-stone-900 text-stone-200 dark:text-stone-200 hover:text-teal-400 transition-colors cursor-pointer"
              aria-label="Toggle theme"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? (
                <Sun className="w-4.5 h-4.5 text-amber-400" />
              ) : (
                <Moon className="w-4.5 h-4.5 text-amber-200" />
              )}
            </button>
          )}

          {/* Command Palette Trigger Button */}
          <button
            onClick={() => {
              document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }));
            }}
            className="flex items-center gap-2.5 text-xs font-semibold bg-[#163432] hover:bg-stone-700 border border-stone-700 text-stone-200 hover:text-white rounded-xl px-3.5 py-2 transition-colors dark:bg-[#163432] dark:hover:bg-stone-900 dark:border-stone-600 dark:text-stone-200 cursor-pointer"
          >
            <span>Pusat Perintah</span>
            <span className="flex items-center gap-0.5 border border-stone-600 dark:border-stone-600 rounded-md bg-[#163432] dark:bg-stone-900 px-1.5 py-0.5 font-sans text-stone-200 dark:text-stone-200 font-bold text-[11px]">
              <span>⌘</span>K
            </span>
          </button>
        </div>

        {/* Mobile Controls (SOS + Theme + Hamburger) */}
        <div className="flex items-center gap-2 md:hidden">
          {/* Tombol SOS Cepat (Mobile Top Bar) */}
          <button
            onClick={() => setIsSosModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-950/60 border border-red-400/60 active:scale-95 transition-transform cursor-pointer"
            aria-label="Tombol Darurat SOS"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-80" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-300" />
            </span>
            <AlertTriangle className="w-3.5 h-3.5 text-amber-200" />
            <span>SOS</span>
          </button>

          {mounted && (
            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className="p-2 rounded-lg border border-stone-700 dark:border-stone-700 bg-stone-800 dark:bg-stone-800 text-stone-200 dark:text-stone-300"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-amber-200" />}
            </button>
          )}
          <button
            className="p-2 text-stone-300 dark:text-stone-300 hover:text-white dark:hover:text-white hover:bg-stone-800 dark:hover:bg-stone-800 rounded-lg transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden bg-[#e4e4e4] dark:bg-[#0c2b29] border-b border-stone-300 dark:border-teal-900/60"
          >
            <div className="px-6 py-5 space-y-2 flex flex-col">
              {/* Tombol SOS Utama di Mobile Menu */}
              <div className="pb-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setIsSosModalOpen(true);
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-600 via-rose-600 to-red-600 text-white font-extrabold py-3 rounded-xl shadow-lg shadow-red-900/50 border border-red-400/50 transition-all active:scale-98 cursor-pointer"
                >
                  <AlertTriangle className="w-4 h-4 text-amber-300 animate-pulse" />
                  <span>KIRIM SINYAL DARURAT (SOS)</span>
                </button>
              </div>

              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    pathname === link.path
                      ? 'bg-teal-50 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
                      : 'text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-3 mt-1 border-t border-stone-100 dark:border-stone-800">
                <Link
                  href="/report"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex justify-center bg-teal-600 text-white font-bold py-3 rounded-xl hover:bg-teal-700 transition-colors"
                >
                  Buat Laporan Anonim
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Emergency SOS Modal Dialog */}
      <EmergencySosModal
        isOpen={isSosModalOpen}
        onClose={() => setIsSosModalOpen(false)}
      />
    </header>
  );
}
