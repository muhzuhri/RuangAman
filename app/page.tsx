'use client';

import React from 'react';
import { motion } from 'framer-motion';
import HeroSection from '@/components/home/HeroSection';
import ViolationsCatalogSection from '@/components/home/ViolationsCatalogSection';
import TrustAndSecuritySection from '@/components/home/TrustAndSecuritySection';
import PipelineRoadmapSection from '@/components/home/PipelineRoadmapSection';
import EncryptionSimulator from '@/components/home/EncryptionSimulator';
import MentalHealthModule from '@/components/home/MentalHealthModule';
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

        <motion.div {...sectionAnimation}>
          <ViolationsCatalogSection />
        </motion.div>

        {/* <motion.div {...sectionAnimation}>
          <TrustAndSecuritySection />
        </motion.div> */}

        <motion.div {...sectionAnimation}>
          <PipelineRoadmapSection />
        </motion.div>

        <motion.div {...sectionAnimation}>
          <EncryptionSimulator />
        </motion.div>

        <motion.div {...sectionAnimation}>
          <MentalHealthModule />
        </motion.div>
      </main>
    </div>
  );
}
