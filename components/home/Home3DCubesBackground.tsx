'use client';

import React, { useEffect, useRef } from 'react';

interface Cube3D {
  x: number;
  y: number;
  z: number;
  size: number;
  rx: number;
  ry: number;
  rz: number;
  vrx: number;
  vry: number;
  vrz: number;
  vx: number;
  vy: number;
  vz: number;
  baseAlpha: number;
  colorType: 'teal' | 'indigo' | 'emerald';
}

/**
 * Optimized 3D Floating Small Cubes Background — Lightweight wireframe background
 */
export default function Home3DCubesBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef<{ rx: number; ry: number }>({ rx: 0, ry: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    const handleMouseMove = (e: MouseEvent) => {
      const centerX = width / 2;
      const centerY = height / 2;
      mouseRef.current.rx = ((e.clientY - centerY) / centerY) * 0.25;
      mouseRef.current.ry = ((e.clientX - centerX) / centerX) * 0.25;
    };

    window.addEventListener('mousemove', handleMouseMove);

    // Cube unit 3D vertices
    const unitVertices = [
      [-1, -1, -1], [1, -1, -1], [1, 1, -1], [-1, 1, -1],
      [-1, -1, 1], [1, -1, 1], [1, 1, 1], [-1, 1, 1],
    ];

    // 12 Edges
    const edges = [
      [0, 1], [1, 2], [2, 3], [3, 0],
      [4, 5], [5, 6], [6, 7], [7, 4],
      [0, 4], [1, 5], [2, 6], [3, 7],
    ];

    // Reduced cube count (28 cubes) for silky 60fps performance
    const cubeCount = 28;
    const cubes: Cube3D[] = [];
    const colorOptions: ('teal' | 'indigo' | 'emerald')[] = ['teal', 'teal', 'emerald', 'indigo'];

    for (let i = 0; i < cubeCount; i++) {
      cubes.push({
        x: (Math.random() - 0.5) * width * 1.3,
        y: (Math.random() - 0.5) * height * 1.3,
        z: Math.random() * 600 + 100,
        size: Math.random() * 12 + 8,
        rx: Math.random() * Math.PI * 2,
        ry: Math.random() * Math.PI * 2,
        rz: Math.random() * Math.PI * 2,
        vrx: (Math.random() - 0.5) * 0.01,
        vry: (Math.random() - 0.5) * 0.01,
        vrz: (Math.random() - 0.5) * 0.008,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        vz: (Math.random() - 0.5) * 0.2,
        baseAlpha: Math.random() * 0.45 + 0.35,
        colorType: colorOptions[Math.floor(Math.random() * colorOptions.length)],
      });
    }

    let currentCamRx = 0;
    let currentCamRy = 0;
    const focalLength = 450;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      currentCamRx += (mouseRef.current.rx - currentCamRx) * 0.03;
      currentCamRy += (mouseRef.current.ry - currentCamRy) * 0.03;

      const cosCamX = Math.cos(currentCamRx);
      const sinCamX = Math.sin(currentCamRx);
      const cosCamY = Math.cos(currentCamRy);
      const sinCamY = Math.sin(currentCamRy);

      for (let i = 0; i < cubes.length; i++) {
        const c = cubes[i];

        c.x += c.vx;
        c.y += c.vy;
        c.z += c.vz;
        c.rx += c.vrx;
        c.ry += c.vry;
        c.rz += c.vrz;

        const halfW = (width * 1.3) / 2;
        const halfH = (height * 1.3) / 2;
        if (Math.abs(c.x) > halfW) c.vx *= -1;
        if (Math.abs(c.y) > halfH) c.vy *= -1;
        if (c.z < 80 || c.z > 700) c.vz *= -1;

        const cosRx = Math.cos(c.rx), sinRx = Math.sin(c.rx);
        const cosRy = Math.cos(c.ry), sinRy = Math.sin(c.ry);
        const cosRz = Math.cos(c.rz), sinRz = Math.sin(c.rz);

        const projectedVertices: { x: number; y: number }[] = [];

        for (let v = 0; v < unitVertices.length; v++) {
          const [ux, uy, uz] = unitVertices[v];
          const vx = ux * c.size;
          const vy = uy * c.size;
          const vz = uz * c.size;

          const y1 = vy * cosRx - vz * sinRx;
          const z1 = vz * cosRx + vy * sinRx;
          const x1 = vx * cosRy + z1 * sinRy;
          const z2 = z1 * cosRy - vx * sinRy;
          const x2 = x1 * cosRz - y1 * sinRz;
          const y2 = y1 * cosRz + x1 * sinRz;

          const wx = x2 + c.x;
          const wy = y2 + c.y;
          const wz = z2 + c.z;

          const cx1 = wx * cosCamY - wz * sinCamY;
          const cz1 = wz * cosCamY + wx * sinCamY;
          const cy1 = wy * cosCamX - cz1 * sinCamX;
          const cz2 = cz1 * cosCamX + wy * sinCamX;

          const scale = focalLength / (focalLength + cz2);
          const px = cx1 * scale + width / 2;
          const py = cy1 * scale + height / 2;

          projectedVertices.push({ x: px, y: py });
        }

        const scale = focalLength / (focalLength + c.z);
        const alpha = Math.max(0.1, Math.min(0.7, scale * c.baseAlpha));

        let strokeColor = `rgba(45, 212, 191, ${alpha})`;
        if (c.colorType === 'indigo') strokeColor = `rgba(129, 140, 248, ${alpha})`;
        if (c.colorType === 'emerald') strokeColor = `rgba(52, 211, 153, ${alpha})`;

        ctx.beginPath();
        for (let e = 0; e < edges.length; e++) {
          const p1 = projectedVertices[edges[e][0]];
          const p2 = projectedVertices[edges[e][1]];
          ctx.moveTo(p1.x, p1.y);
          ctx.lineTo(p2.x, p2.y);
        }
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = Math.max(0.8, 1.4 * scale);
        ctx.stroke();
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
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
      <canvas ref={canvasRef} className="w-full h-full block opacity-60 dark:opacity-75" />
    </div>
  );
}
