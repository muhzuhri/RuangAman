'use client';

import React from 'react';
import { Shield } from 'lucide-react';

/** Perisai CSS 3D — transform GPU, tanpa Three.js / WebGL. */
export default function CssShield3D() {
  return (
    <div className="ak-float hidden lg:flex items-center justify-center pointer-events-none select-none" aria-hidden="true">
      <div className="ak-perspective">
        <div className="ak-shield-scene">
          <div className="ak-shield-face">
            <Shield className="w-10 h-10 text-teal-800" strokeWidth={1.6} />
          </div>
          <div className="ak-shield-face is-back">
            <Shield className="w-10 h-10 text-teal-900" strokeWidth={1.6} />
          </div>
        </div>
      </div>
    </div>
  );
}
