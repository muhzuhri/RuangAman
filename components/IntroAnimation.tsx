'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { usePathname } from 'next/navigation';

export default function IntroAnimation() {
  const pathname = usePathname();
  const [phase, setPhase] = useState<'idle' | 'center' | 'fly' | 'done'>('idle');
  const [targetPos, setTargetPos] = useState({ x: -160, y: -300, scale: 0.16 });

  useEffect(() => {
    // Only run on the homepage
    if (pathname !== '/') {
      setPhase('done');
      return;
    }

    // Calculate exact GPU-friendly pixel offset to navbar logo (top-left)
    const updateTarget = () => {
      const isMobile = window.innerWidth < 768;
      // Target top-left navbar logo center offset relative to screen center
      const navX = isMobile ? -window.innerWidth / 2 + 36 : -window.innerWidth / 2 + 100;
      const navY = -window.innerHeight / 2 + 36;
      // Logo in hero is ~176px (w-44), target in nav is ~48px
      const scale = isMobile ? 44 / 176 : 48 / 176;

      setTargetPos({ x: navX, y: navY, scale });
    };

    updateTarget();
    setPhase('center');

    // Timers
    const flyTimer = setTimeout(() => setPhase('fly'), 1400);
    const doneTimer = setTimeout(() => setPhase('done'), 2700);

    return () => {
      clearTimeout(flyTimer);
      clearTimeout(doneTimer);
    };
  }, [pathname]);

  if (phase === 'idle' || phase === 'done') return null;

  return (
    <AnimatePresence>
      {(phase === 'center' || phase === 'fly') && (
        <motion.div
          key="intro-overlay"
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden pointer-events-none"
          style={{
            backgroundColor: '#061f1d',
            willChange: 'opacity',
          }}
          initial={{ opacity: 1 }}
          animate={{ opacity: phase === 'fly' ? 0 : 1 }}
          transition={{ duration: 0.9, ease: 'easeInOut', delay: phase === 'fly' ? 0.4 : 0 }}
        >
          {/* Subtle glow (optimised blur for mobile GPU) */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: phase === 'center' ? 1 : 0 }}
            transition={{ duration: 0.6 }}
            style={{
              background:
                'radial-gradient(circle at 50% 50%, rgba(20,184,166,0.15) 0%, transparent 65%)',
            }}
          />

          {/* Pulsing rings — only render in center phase to free GPU */}
          {phase === 'center' && (
            <>
              <motion.div
                className="absolute rounded-full border border-teal-500/20"
                initial={{ scale: 0.6, opacity: 0.6 }}
                animate={{ scale: 2.2, opacity: 0 }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut' }}
                style={{ width: 176, height: 176, willChange: 'transform, opacity' }}
              />
              <motion.div
                className="absolute rounded-full border border-teal-400/15"
                initial={{ scale: 0.6, opacity: 0.4 }}
                animate={{ scale: 2.6, opacity: 0 }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeOut', delay: 0.3 }}
                style={{ width: 176, height: 176, willChange: 'transform, opacity' }}
              />
            </>
          )}

          {/* Central Animated Logo Container */}
          <motion.div
            className="flex flex-col items-center gap-4 select-none"
            style={{
              willChange: 'transform, opacity',
              transform: 'translateZ(0)', // Force Hardware Acceleration (GPU layer)
            }}
            initial={{ scale: 1, opacity: 0, x: 0, y: 0 }}
            animate={
              phase === 'center'
                ? { scale: 1, opacity: 1, x: 0, y: 0 }
                : {
                    scale: targetPos.scale,
                    opacity: 0,
                    x: targetPos.x,
                    y: targetPos.y,
                  }
            }
            transition={
              phase === 'center'
                ? { duration: 0.6, ease: [0.22, 1, 0.36, 1] }
                : { duration: 0.75, ease: [0.4, 0, 0.2, 1] } // Smooth hardware-accelerated Bezier curve
            }
          >
            {/* Shield Logo */}
            <div className="relative">
              {/* Lighter glow shadow for 60fps mobile rendering */}
              <div
                className="relative w-44 h-44 rounded-2xl overflow-hidden border-2 border-teal-700/60 shadow-lg"
                style={{ boxShadow: '0 8px 32px rgba(20,184,166,0.3)' }}
              >
                <Image
                  src="/images/logii.png"
                  alt="AmanKampus Logo"
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>

            {/* Brand Text */}
            <motion.div
              className="flex flex-col items-center"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: phase === 'center' ? 1 : 0, y: phase === 'center' ? 0 : 10 }}
              transition={{ duration: 0.5, delay: phase === 'center' ? 0.2 : 0 }}
            >
              <span
                className="text-4xl font-extrabold tracking-tight text-white"
                style={{ textShadow: '0 2px 12px rgba(20,184,166,0.4)' }}
              >
                AmanKampus
              </span>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
