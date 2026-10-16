'use client';

import React, { useCallback, useRef, useState } from 'react';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
}

/** Card 3D Interaktif dengan Kemiringan Dinamis, Glare Realistis, & Transform Depth */
export default function TiltCard({ children, className = '', maxTilt = 12 }: TiltCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>(0);

  const [glareStyle, setGlareStyle] = useState<React.CSSProperties>({ opacity: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const onMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const el = cardRef.current;
      if (!el) return;

      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      const rotY = (x - 0.5) * maxTilt * 2;
      const rotX = (0.5 - y) * maxTilt * 2;

      cancelAnimationFrame(frameRef.current);
      frameRef.current = requestAnimationFrame(() => {
        el.style.transform = `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`;
        setGlareStyle({
          opacity: 0.35,
          background: `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(45, 212, 191, 0.3) 0%, rgba(255, 255, 255, 0.12) 30%, transparent 75%)`,
        });
      });
    },
    [maxTilt],
  );

  const onMouseEnter = () => {
    setIsHovered(true);
  };

  const onMouseLeave = useCallback(() => {
    setIsHovered(false);
    const el = cardRef.current;
    if (!el) return;
    cancelAnimationFrame(frameRef.current);
    el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    setGlareStyle({ opacity: 0 });
  }, []);

  return (
    <div ref={containerRef} className="w-full relative group" style={{ perspective: '1000px' }}>
      {/* 3D Glow aura behind card */}
      <div
        className={`absolute -inset-1 rounded-3xl bg-gradient-to-r from-teal-500/30 via-emerald-500/20 to-teal-600/30 blur-xl transition-opacity duration-500 pointer-events-none ${
          isHovered ? 'opacity-90' : 'opacity-30'
        }`}
      />

      <div
        ref={cardRef}
        onMouseMove={onMove}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className={`relative z-10 will-change-transform transition-all duration-200 ease-out rounded-2xl shadow-xl border border-stone-200/80 dark:border-stone-700/80 ${className}`}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Interactive Specular Glare Layer */}
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none z-30 transition-opacity duration-300"
          style={glareStyle}
        />
        {children}
      </div>
    </div>
  );
}
