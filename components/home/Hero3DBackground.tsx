'use client';

import React, { useEffect, useRef } from 'react';

interface Particle3D {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  radius: number;
  baseAlpha: number;
}

/**
 * Interactive 3D Canvas Background — Khusus Halaman Beranda (Homepage Only)
 * Bergerak interaktif mengikuti pergerakan kursor mouse dengan partikel 3D & garis jaringan.
 */
export default function Hero3DBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef<{ x: number; y: number; rx: number; ry: number }>({
    x: 0,
    y: 0,
    rx: 0,
    ry: 0,
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || window.innerHeight);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener('resize', handleResize);

    // Mouse Move listener attached to window to capture cursor across homepage
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const relativeX = e.clientX - rect.left;
      const relativeY = e.clientY - rect.top;

      mouseRef.current.x = relativeX;
      mouseRef.current.y = relativeY;

      // Target 3D rotation angles based on cursor offset from center
      const centerX = width / 2;
      const centerY = height / 2;
      mouseRef.current.rx = ((relativeY - centerY) / centerY) * 0.4;
      mouseRef.current.ry = ((relativeX - centerX) / centerX) * 0.4;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Initialize 3D Particles
    const particleCount = Math.min(65, Math.floor((width * height) / 14000));
    const particles: Particle3D[] = [];

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: (Math.random() - 0.5) * width * 1.2,
        y: (Math.random() - 0.5) * height * 1.2,
        z: Math.random() * 600 + 100, // Depth from 100 to 700
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        vz: (Math.random() - 0.5) * 0.5,
        radius: Math.random() * 2.2 + 1.2,
        baseAlpha: Math.random() * 0.5 + 0.35,
      });
    }

    let currentRx = 0;
    let currentRy = 0;

    const focalLength = 400; // 3D Perspective Focal Length

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth interpolation for 3D rotation angles
      currentRx += (mouseRef.current.rx - currentRx) * 0.05;
      currentRy += (mouseRef.current.ry - currentRy) * 0.05;

      const cosX = Math.cos(currentRx);
      const sinX = Math.sin(currentRx);
      const cosY = Math.cos(currentRy);
      const sinY = Math.sin(currentRy);

      const projectedPoints: { x: number; y: number; z: number; alpha: number; radius: number }[] = [];

      // Update & Transform 3D Points
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        p.x += p.vx;
        p.y += p.vy;
        p.z += p.vz;

        // Boundary bounce inside 3D volume
        const halfW = (width * 1.2) / 2;
        const halfH = (height * 1.2) / 2;
        if (Math.abs(p.x) > halfW) p.vx *= -1;
        if (Math.abs(p.y) > halfH) p.vy *= -1;
        if (p.z < 80 || p.z > 750) p.vz *= -1;

        // Apply 3D Rotation Y then X
        let x1 = p.x * cosY - p.z * sinY;
        let z1 = p.z * cosY + p.x * sinY;

        let y1 = p.y * cosX - z1 * sinX;
        let z2 = z1 * cosX + p.y * sinX;

        // 3D Perspective Projection to 2D Screen
        const scale = focalLength / (focalLength + z2);
        const projX = x1 * scale + width / 2;
        const projY = y1 * scale + height / 2;

        const alpha = Math.max(0.1, Math.min(1, scale * p.baseAlpha));
        const projRadius = Math.max(0.8, p.radius * scale);

        projectedPoints.push({
          x: projX,
          y: projY,
          z: z2,
          alpha,
          radius: projRadius,
        });
      }

      // Draw Constellation Lines in 3D Space
      for (let i = 0; i < projectedPoints.length; i++) {
        for (let j = i + 1; j < projectedPoints.length; j++) {
          const p1 = projectedPoints[i];
          const p2 = projectedPoints[j];

          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 135) {
            const lineAlpha = (1 - dist / 135) * 0.28 * Math.min(p1.alpha, p2.alpha);
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = `rgba(13, 148, 136, ${lineAlpha})`; // Teal accent #0d9488
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        }
      }

      // Draw 3D Glowing Nodes
      for (let i = 0; i < projectedPoints.length; i++) {
        const pt = projectedPoints[i];

        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(13, 148, 136, ${pt.alpha})`;
        ctx.fill();

        // Node specular glow aura
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, pt.radius * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(45, 212, 191, ${pt.alpha * 0.18})`;
        ctx.fill();
      }

      animFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animFrameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      <canvas ref={canvasRef} className="w-full h-full block opacity-70 dark:opacity-85" />
    </div>
  );
}
