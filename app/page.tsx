'use client';

import React from 'react';
import { motion } from 'framer-motion';
import HeroSection from '@/components/home/HeroSection';
import HomeQuickSafetySection from '@/components/home/HomeQuickSafetySection';
import HomeCategoryDistributionSection from '@/components/home/HomeCategoryDistributionSection';
import PipelineRoadmapSection from '@/components/home/PipelineRoadmapSection';
import EncryptionSimulator from '@/components/home/EncryptionSimulator';
import HomeChatbotSection from '@/components/home/HomeChatbotSection';
import Home3DCubesBackground from '@/components/home/Home3DCubesBackground';

const sectionAnimation = {
  initial: { opacity: 0, y: 35 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.12 },
  transition: { duration: 0.5 },
};

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-transparent text-stone-900 dark:text-stone-100 font-sans relative overflow-hidden">
      {/* 3D Floating Interactive Cubes Background — Lightweight Canvas */}
      <Home3DCubesBackground />

      <main className="relative z-10 pt-24 pb-20 px-6 md:px-16 lg:px-24 max-w-7xl mx-auto space-y-20 md:space-y-28">
        <motion.div {...sectionAnimation}>
          <HeroSection />
        </motion.div>

        {/* 1. Panduan Tindakan Cepat Pengamanan Diri (dari Layanan) */}
        <motion.div {...sectionAnimation}>
          <HomeQuickSafetySection />
        </motion.div>

        {/* 2. Distribusi Kategori Laporan Publik Data Riil (dari Transparansi) */}
        <motion.div {...sectionAnimation}>
          <HomeCategoryDistributionSection />
        </motion.div>

        {/* 3. Peta Alur Kerja & Proteksi RuangAman Platform */}
        <motion.div {...sectionAnimation}>
          <PipelineRoadmapSection />
        </motion.div>

        <motion.div {...sectionAnimation}>
          <EncryptionSimulator />
        </motion.div>

        {/* 4. Konsultasi & Ruang Curhat Aman Bersama AI Chatbot Ara */}
        <motion.div {...sectionAnimation}>
          <HomeChatbotSection />
        </motion.div>
      </main>
    </div>
  );
}
