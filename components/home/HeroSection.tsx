'use client';

import React from 'react';
import { motion, type Variants } from 'framer-motion';
import GlowingHeadline from '@/components/hero/GlowingHeadline';
import GlassmorphismCTA from '@/components/hero/GlassmorphismCTA';
import AntiGravityCard from '@/components/hero/AntiGravityCard';
import TiltCard from '@/components/hero/TiltCard';
import Hero3DBackground from '@/components/home/Hero3DBackground';

const STAGGER: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.1,
    },
  },
};

export default function HeroSection() {
  return (
    <div className="relative min-h-[72vh] flex items-center justify-center pt-4 home-block">
      {/* Hero Content Foreground Container */}
      <motion.section
        initial="hidden"
        animate="visible"
        variants={STAGGER}
        className="relative z-10 w-full max-w-7xl mx-auto py-8 lg:py-16 grid lg:grid-cols-12 gap-12 lg:gap-8 items-center"
      >
        {/* Left Column: Headline, Description & CTAs */}
        <div className="lg:col-span-7 space-y-8">
          <GlowingHeadline />
          <GlassmorphismCTA />
        </div>

        {/* Right Column: Floating Interactive Encryption Demo Card */}
        <div className="lg:col-span-5 relative flex justify-center lg:justify-end">
          <div className="relative z-10 w-full">
            <TiltCard>
              <AntiGravityCard />
            </TiltCard>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
