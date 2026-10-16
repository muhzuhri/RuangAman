'use client';

import React, { useEffect, useState } from 'react';
import { Command } from 'cmdk';
import { useTheme } from 'next-themes';
import { useRouter } from 'next/navigation';
import { Sun, Moon, Search, Laptop, ShieldCheck, Home, Map, Command as CmdIcon, HeartHandshake, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const { setTheme, theme } = useTheme();
  const router = useRouter();

  // Toggle Command Palette (Ctrl+K or Cmd+K)
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const handleSelect = (action: () => void) => {
    setOpen(false);
    action();
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-md flex items-start justify-center pt-24 px-4"
            onClick={() => setOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -10 }}
              transition={{ duration: 0.15 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-white dark:bg-[#163432] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
            >
              <Command className="w-full h-full flex flex-col overflow-hidden text-slate-800 dark:text-slate-100">
                <div className="flex items-center px-4 py-3.5 border-b border-slate-100 dark:border-slate-800" cmdk-input-wrapper="">
                  <Search className="w-5 h-5 mr-3 text-slate-400 dark:text-slate-500" />
                  <Command.Input
                    autoFocus
                    placeholder="Ketik perintah atau cari..."
                    className="flex-1 bg-transparent border-none outline-none text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 dark:placeholder:text-slate-500"
                  />
                  <div className="text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-1 rounded-md font-mono border border-slate-200 dark:border-slate-700">
                    ESC
                  </div>
                </div>

                <Command.List className="max-h-[320px] overflow-y-auto p-2.5 custom-scrollbar">
                  <Command.Empty className="py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                    Perintah tidak ditemukan.
                  </Command.Empty>

                  <Command.Group heading="Navigasi Halaman" className="text-[11px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500 px-3 py-2">
                    <Command.Item
                      onSelect={() => handleSelect(() => router.push('/'))}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold cursor-pointer text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-teal-900 hover:text-teal-900 dark:hover:text-teal-300 my-1 aria-selected:bg-teal-50 dark:aria-selected:bg-teal-900 aria-selected:text-teal-900 dark:aria-selected:text-teal-300 transition-colors"
                    >
                      <Home className="w-4 h-4 text-slate-500 dark:text-slate-400" /> Beranda
                    </Command.Item>
                    <Command.Item
                      onSelect={() => handleSelect(() => router.push('/report'))}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold cursor-pointer text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-slate-800 hover:text-teal-900 dark:hover:text-teal-300 my-1 aria-selected:bg-teal-50 dark:aria-selected:bg-teal-900 aria-selected:text-teal-900 dark:aria-selected:text-teal-300 transition-colors"
                    >
                      <ShieldCheck className="w-4 h-4 text-teal-600 dark:text-teal-400" /> Buat Laporan Anonim
                    </Command.Item>
                    <Command.Item
                      onSelect={() => handleSelect(() => router.push('/track'))}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold cursor-pointer text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-slate-800 hover:text-teal-900 dark:hover:text-teal-300 my-1 aria-selected:bg-teal-50 dark:aria-selected:bg-teal-900 aria-selected:text-teal-900 dark:aria-selected:text-teal-300 transition-colors"
                    >
                      <Map className="w-4 h-4 text-emerald-600 dark:text-emerald-400" /> Lacak Progres Laporan
                    </Command.Item>

                    <Command.Item
                      onSelect={() => handleSelect(() => router.push('/support'))}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold cursor-pointer text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-slate-800 hover:text-teal-900 dark:hover:text-teal-300 my-1 aria-selected:bg-teal-50 dark:aria-selected:bg-teal-900 aria-selected:text-teal-900 dark:aria-selected:text-teal-300 transition-colors"
                    >
                      <HeartHandshake className="w-4 h-4 text-rose-500" /> Pusat Bantuan & PFA
                    </Command.Item>
                    <Command.Item
                      onSelect={() => handleSelect(() => router.push('/education'))}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold cursor-pointer text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-slate-800 hover:text-teal-900 dark:hover:text-teal-300 my-1 aria-selected:bg-teal-50 dark:aria-selected:bg-teal-900 aria-selected:text-teal-900 dark:aria-selected:text-teal-300 transition-colors"
                    >
                      <BookOpen className="w-4 h-4 text-indigo-500" /> Edukasi & Hak Korban
                    </Command.Item>
                  </Command.Group>

                  <Command.Group heading="Pilihan Tema" className="text-[11px] font-bold tracking-wider uppercase text-slate-400 dark:text-slate-500 px-3 py-2 mt-2 border-t border-slate-100 dark:border-slate-800">
                    <Command.Item
                      onSelect={() => handleSelect(() => setTheme('light'))}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold cursor-pointer text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-slate-800 hover:text-teal-900 dark:hover:text-teal-300 my-1 aria-selected:bg-teal-50 dark:aria-selected:bg-teal-900 aria-selected:text-teal-900 dark:aria-selected:text-teal-300 transition-colors"
                    >
                      <Sun className="w-4 h-4 text-amber-500" />
                      Ganti Tema (Mode Terang)
                      {theme === 'light' && <span className="ml-auto text-xs text-amber-700 font-bold bg-amber-100 dark:bg-amber-500/20 px-2 py-0.5 rounded-md">Aktif</span>}
                    </Command.Item>
                    <Command.Item
                      onSelect={() => handleSelect(() => setTheme('dark'))}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold cursor-pointer text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-slate-800 hover:text-teal-900 dark:hover:text-teal-300 my-1 aria-selected:bg-teal-50 dark:aria-selected:bg-teal-900 aria-selected:text-teal-900 dark:aria-selected:text-teal-300 transition-colors"
                    >
                      <Moon className="w-4 h-4 text-indigo-400" />
                      Ganti Tema (Mode Gelap)
                      {theme === 'dark' && <span className="ml-auto text-xs text-indigo-400 font-bold bg-indigo-500/20 px-2 py-0.5 rounded-md">Aktif</span>}
                    </Command.Item>
                    <Command.Item
                      onSelect={() => handleSelect(() => setTheme('system'))}
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold cursor-pointer text-slate-700 dark:text-slate-200 hover:bg-teal-50 dark:hover:bg-slate-800 hover:text-teal-900 dark:hover:text-teal-300 my-1 aria-selected:bg-teal-50 dark:aria-selected:bg-teal-900 aria-selected:text-teal-900 dark:aria-selected:text-teal-300 transition-colors"
                    >
                      <Laptop className="w-4 h-4 text-slate-500 dark:text-slate-400" />
                      Tema Mengikuti Sistem
                      {theme === 'system' && <span className="ml-auto text-xs text-slate-600 dark:text-slate-400 font-bold bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">Aktif</span>}
                    </Command.Item>
                  </Command.Group>
                </Command.List>

                <div className="border-t border-slate-100 dark:border-slate-800 px-4 py-3 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-900/50">
                  <span className="flex items-center gap-1.5 font-medium"><CmdIcon className="w-3.5 h-3.5"/> Pusat Perintah & Navigasi</span>
                  <span className="font-semibold text-teal-600 dark:text-teal-400">AmanKampus</span>
                </div>
              </Command>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
