'use client';

import React from 'react';
import { Activity, FileText, Code, AlertCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Footer() {
  const pathname = usePathname();

  if (pathname?.startsWith('/admin')) {
    return null;
  }
  return (
    <footer className="relative z-10 border-t border-stone-800 dark:border-teal-800 bg-teal-950 dark:bg-mauve-900 pt-16 pb-10 w-full text-stone-300">
      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-16 mb-12">
        <div className="col-span-1 md:col-span-2 space-y-5">
          <div className="flex items-center gap-2">
            <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0">
              <Image
                src="/images/logii.png"
                alt="AmanKampus Logo"
                width={36}
                height={36}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-xl font-bold tracking-tight text-white dark:text-stone-50">AmanKampus</span>
          </div>
          <p className="text-stone-400 dark:text-stone-400 text-sm max-w-md leading-relaxed">
            Membangun ruang aman digital untuk mahasiswa. Kami berfokus melindungi mereka yang memegang keberanian untuk berbicara melawan ketidakadilan institusional.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <div className="bg-stone-800 dark:bg-stone-800 border border-stone-700 dark:border-stone-700 p-3.5 rounded-xl flex items-center gap-3">
              <Activity className="w-5 h-5 text-teal-400 dark:text-teal-400 shrink-0" />
              <div>
                <div className="text-[10px] uppercase font-bold text-teal-400 dark:text-teal-400 tracking-wider">Mendukung SDG 3</div>
                <div className="text-xs font-semibold text-stone-200 dark:text-stone-300 mt-0.5">Kesehatan Mental & Kesejahteraan</div>
              </div>
            </div>
            <div className="bg-stone-800 dark:bg-stone-800 border border-stone-700 dark:border-stone-700 p-3.5 rounded-xl flex items-center gap-3">
              <FileText className="w-5 h-5 text-stone-400 dark:text-stone-400 shrink-0" />
              <div>
                <div className="text-[10px] uppercase font-bold text-stone-400 tracking-wider">Mendukung SDG 16</div>
                <div className="text-xs font-semibold text-stone-200 dark:text-stone-300 mt-0.5">Kelembagaan yang Tangguh</div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-5">
          <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest">Navigasi</h4>
          <ul className="space-y-3 text-sm text-stone-400 dark:text-stone-400">
            <li><Link href="/" className="hover:text-teal-400 transition-colors font-medium">Beranda Sistem</Link></li>
            <li><Link href="/report" className="hover:text-teal-400 transition-colors font-medium">Buat Laporan</Link></li>
            <li><Link href="/track" className="hover:text-teal-400 transition-colors font-medium">Tracker Anonim</Link></li>
            <li><Link href="/support" className="hover:text-teal-400 transition-colors font-medium">Bantuan & PFA</Link></li>
            <li><Link href="/education" className="hover:text-teal-400 transition-colors font-medium">Edukasi</Link></li>
          </ul>
        </div>

        <div className="space-y-5">
          <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest">Legal & Privasi</h4>
          <ul className="space-y-3 text-sm text-stone-400 dark:text-stone-400">
            <li><Link href="/education" className="hover:text-teal-400 transition-colors font-medium">Kebijakan Privasi & Hak Pelapor</Link></li>
            <li><Link href="/support" className="hover:text-teal-400 transition-colors font-medium">Bantuan & Layanan Satgas</Link></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 md:px-12 lg:px-20 pt-6 border-t border-stone-800 dark:border-stone-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-stone-400 font-medium">
        <p>© 2026 AmanKampus Initiative. All data remains client-owned.</p>
        
      </div>
    </footer>
  );
}
