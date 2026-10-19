'use client';

import React, { useCallback, useRef, useState } from 'react';

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  disabled?: boolean;
}

/** Card 3D Interaktif dengan Kemiringan Dinamis, Glare Realistis, & Transform Depth */
export default function TiltCard({
  children,
  className = '',
  maxTilt = 6,
  disabled = false,
}: TiltCardProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>(0);

  const [glareStyle, setGlareStyle] = useState<React.CSSProperties>({ opacity: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Stabilize card to flat neutral state (no rotation, no wobble)
  const stabilizeCard = useCallback(() => {
    const el = cardRef.current;
    if (!el) return;
    cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      el.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
      setGlareStyle({ opacity: 0 });
    });
  }, []);

  const onMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (disabled || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        stabilizeCard();
        return;
      }

      const el = cardRef.current;
      if (!el) return;

      // 1. Jika ada input atau kontrol yang sedang fokus aktif, kuncikan card tetap mantap dan diam!
      if (isFocused) {
        stabilizeCard();
        return;
      }

      // 2. Jika kursor sedang berada di atas elemen interaktif (textarea, tombol quick preset, dsb),
      // kuncikan posisi card agar tidak bergoyang dan mudah diklik/diketik!
      const target = e.target as HTMLElement | null;
      const isOverInteractive = !!target?.closest(
        'button, textarea, input, select, a, [role="button"], [data-no-tilt="true"]'
      );

      if (isOverInteractive) {
        stabilizeCard();
        return;
      }

      const rect = el.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;

      const rotY = (x - 0.5) * maxTilt * 2;
      const rotX = (0.5 - y) * maxTilt * 2;

      cancelAnimationFrame(frameRef.current);
      frameRef.current = requestAnimationFrame(() => {
        el.style.transform = `perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale3d(1.01, 1.01, 1.01)`;
        setGlareStyle({
          opacity: 0.2,
          background: `radial-gradient(circle at ${x * 100}% ${y * 100}%, rgba(45, 212, 191, 0.22) 0%, rgba(255, 255, 255, 0.08) 30%, transparent 75%)`,
        });
      });
    },
    [disabled, maxTilt, isFocused, stabilizeCard],
  );

  const onMouseEnter = () => {
    setIsHovered(true);
  };

  const onMouseLeave = useCallback(() => {
    setIsHovered(false);
    stabilizeCard();
  }, [stabilizeCard]);

  // Handle focus event capture to freeze card when any input inside gains focus
  const handleFocus = useCallback(() => {
    setIsFocused(true);
    stabilizeCard();
  }, [stabilizeCard]);

  const handleBlur = useCallback(
    (e: React.FocusEvent<HTMLDivElement>) => {
      // Hanya nonaktifkan status fokus jika fokus berpindah keluar dari card sepenuhnya
      if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
        setIsFocused(false);
        stabilizeCard();
      }
    },
    [stabilizeCard],
  );

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
        onFocusCapture={handleFocus}
        onBlurCapture={handleBlur}
        className={`relative z-10 will-change-transform transition-transform duration-250 ease-out rounded-2xl shadow-xl border border-stone-200/80 dark:border-stone-700/80 ${className}`}
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
