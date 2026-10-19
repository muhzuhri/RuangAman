'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Sun, Moon } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);

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
    { name: 'Pelaporan', path: '/report' },
    { name: 'Pelacakan', path: '/track' },
    { name: 'Layanan & Informasi', path: '/support' },
    { name: 'Transparansi', path: '/transparency' },
  ];

  const isDark = resolvedTheme === 'dark';

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 bg-gray-700 dark:bg-slate-800 backdrop-blur-md transition-colors ${
        isScrolled
          ? 'border-b border-gray-600 shadow-md'
          : 'border-b border-gray-600/80'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 h-18 flex items-center justify-between py-4">
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-14 h-14 rounded-xl overflow-hidden shrink-0 group-hover:opacity-90 transition-opacity">
            <Image
              src="/images/loogooo.png"
              alt="RuangAman Logo"
              width={50}
              height={50}
              className="w-full h-full object-contain"
            />
          </div>
          <span className="text-lg font-bold tracking-tight text-white group-hover:text-teal-400 transition-colors">
            RuangAman
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
                    ? 'text-teal-300 font-semibold bg-gray-600/80 shadow-xs'
                    : 'text-stone-200 hover:text-white hover:bg-gray-600/60'
                }`}
              >
                {link.name}
                {isActive && (
                  <motion.div
                    layoutId="active-pill"
                    className="absolute inset-0 border border-teal-400/50 rounded-lg"
                    initial={false}
                    transition={{ type: "spring", stiffness: 350, damping: 32 }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          {/* Theme Toggle Button */}
          {mounted && (
            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className="p-2 rounded-xl border border-gray-600 bg-gray-800 hover:bg-gray-600 text-stone-200 hover:text-teal-400 transition-colors cursor-pointer"
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
            className="flex items-center gap-2.5 text-xs font-semibold bg-gray-800 hover:bg-gray-600 border border-gray-600 text-stone-200 hover:text-white rounded-xl px-3.5 py-2 transition-colors cursor-pointer"
          >
            <span>Pusat Perintah</span>
            <span className="flex items-center gap-0.5 border border-gray-500 rounded-md bg-gray-700 px-1.5 py-0.5 font-sans text-stone-200 font-bold text-[11px]">
              <span>⌘</span>K
            </span>
          </button>
        </div>

        {/* Mobile Controls (Theme + Hamburger) */}
        <div className="flex items-center gap-2 md:hidden">
          {mounted && (
            <button
              onClick={() => setTheme(isDark ? 'light' : 'dark')}
              className="p-2 rounded-lg border border-gray-600 bg-gray-800 text-stone-200"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-amber-200" />}
            </button>
          )}
          <button
            className="p-2 text-stone-200 hover:text-white hover:bg-gray-600 rounded-lg transition-colors"
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
            className="md:hidden overflow-hidden bg-gray-700 border-b border-gray-600 text-white"
          >
            <div className="px-6 py-5 space-y-2 flex flex-col">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.path}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`block px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                    pathname === link.path
                      ? 'bg-gray-600 text-teal-300 border border-gray-500 font-semibold'
                      : 'text-stone-200 hover:bg-gray-600/70'
                  }`}
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-3 mt-1 border-t border-gray-600 space-y-2">
                <Link
                  href="/report"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex justify-center bg-teal-600 text-white font-bold py-3 rounded-xl hover:bg-teal-700 transition-colors"
                >
                  Buat Laporan Anonim
                </Link>
                <Link
                  href="/admin/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-center gap-1.5 text-xs font-semibold text-stone-300 hover:text-teal-300 py-2 transition-colors"
                >
                  Portal Internal Satgas (Admin)
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
