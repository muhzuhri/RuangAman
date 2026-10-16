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

        {/* Mobile Hamburger & Theme Button */}
        <div className="flex items-center gap-2 md:hidden">
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
    </header>
  );
}
