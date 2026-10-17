'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface AnimatedAraSvgAvatarProps {
  isSpeaking: boolean;
  isListening: boolean;
  mouthOpenRatio?: number; // 0 to 1
  size?: number;
}

export default function AnimatedAraSvgAvatar({
  isSpeaking,
  isListening,
  mouthOpenRatio,
  size = 180,
}: AnimatedAraSvgAvatarProps) {
  const [isBlinking, setIsBlinking] = useState(false);
  const [internalMouthOpen, setInternalMouthOpen] = useState(0);

  // Natural Eye Blinking Timer (every 3.2 to 4.8 seconds for ~160ms)
  useEffect(() => {
    let blinkTimeout: NodeJS.Timeout;
    const triggerBlink = () => {
      setIsBlinking(true);
      setTimeout(() => {
        setIsBlinking(false);
      }, 160);

      const nextDelay = 3200 + Math.random() * 2200;
      blinkTimeout = setTimeout(triggerBlink, nextDelay);
    };

    blinkTimeout = setTimeout(triggerBlink, 3000);
    return () => clearTimeout(blinkTimeout);
  }, []);

  // Internal Lip-Sync Animation while Speaking (avoids parent re-render jitter)
  useEffect(() => {
    if (!isSpeaking) {
      setInternalMouthOpen(0);
      return;
    }

    let isMounted = true;
    const mouthInterval = setInterval(() => {
      if (!isMounted) return;
      setInternalMouthOpen((prev) => {
        const next = 0.2 + Math.random() * 0.7;
        return Math.abs(prev - next) > 0.15 ? next : 0.4;
      });
    }, 125);

    return () => {
      isMounted = false;
      clearInterval(mouthInterval);
    };
  }, [isSpeaking]);

  // Use external ratio if explicitly given (> 0), otherwise use internal cadence
  const mouth =
    mouthOpenRatio !== undefined && mouthOpenRatio > 0
      ? Math.min(Math.max(mouthOpenRatio, 0), 1)
      : Math.min(Math.max(internalMouthOpen, 0), 1);

  return (
    <div
      className="relative flex items-center justify-center select-none"
      style={{ width: size, height: size }}
    >
      {/* ── Outer Calming Halo Rings ────────────────────────────────────── */}
      {(isSpeaking || isListening) && (
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.3, 0.65, 0.3],
          }}
          transition={{
            repeat: Infinity,
            duration: isListening ? 1.6 : 1.2,
            ease: 'easeInOut',
          }}
          className="absolute inset-0 rounded-full border-2 border-teal-400/50 pointer-events-none"
        />
      )}

      {isSpeaking && (
        <motion.div
          animate={{
            scale: [1, 1.26, 1],
            opacity: [0.15, 0.4, 0.15],
          }}
          transition={{
            repeat: Infinity,
            duration: 1.8,
            ease: 'easeInOut',
            delay: 0.2,
          }}
          className="absolute inset-0 rounded-full border border-emerald-400/30 pointer-events-none"
        />
      )}

      {/* ── Main SVG Animated Character: Ara (Female Counselor) ───────────── */}
      <motion.svg
        viewBox="0 0 200 200"
        className="w-full h-full drop-shadow-xl select-none"
        animate={{
          y: isSpeaking ? [0, -2, 0] : [0, -1.5, 0],
        }}
        transition={{
          repeat: Infinity,
          duration: isSpeaking ? 2.4 : 3.6,
          ease: 'easeInOut',
        }}
      >
        <defs>
          {/* Calming Studio Backdrop Gradient */}
          <radialGradient id="araBackdropCircle" cx="50%" cy="40%" r="55%">
            <stop offset="0%" stopColor="#14b8a6" stopOpacity="0.45" />
            <stop offset="65%" stopColor="#0f766e" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#042f2e" stopOpacity="0.98" />
          </radialGradient>

          {/* Natural Warm Indonesian Skin Tone Gradient */}
          <linearGradient id="araSkinTone" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fff1e6" />
            <stop offset="45%" stopColor="#fed7aa" />
            <stop offset="100%" stopColor="#fca5a5" stopOpacity="0.8" />
          </linearGradient>

          {/* Soft Dark Espresso Hair Gradient with Warm Undertone */}
          <linearGradient id="araHairMain" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#291811" />
            <stop offset="55%" stopColor="#1c100b" />
            <stop offset="100%" stopColor="#0a0503" />
          </linearGradient>

          {/* Professional Teal Counselor Blazer Gradient */}
          <linearGradient id="araBlazer" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#14b8a6" />
            <stop offset="50%" stopColor="#0d9488" />
            <stop offset="100%" stopColor="#042f2e" />
          </linearGradient>

          {/* Cream Ivory Inner Blouse */}
          <linearGradient id="araBlouse" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#fffdf5" />
            <stop offset="100%" stopColor="#fef3c7" />
          </linearGradient>

          {/* Soft Radial Blush Glow for Cheeks */}
          <radialGradient id="araCheekBlush" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#f43f5e" stopOpacity="0.38" />
            <stop offset="60%" stopColor="#fb7185" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#fb7185" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* 1. Backdrop Circle with Glow */}
        <circle cx="100" cy="100" r="94" fill="url(#araBackdropCircle)" stroke="#2dd4bf" strokeWidth="2.5" />

        {/* 2. Ambient Particles & Star Sparkles */}
        <circle cx="38" cy="46" r="2.2" fill="#5eead4" opacity="0.75" />
        <circle cx="162" cy="52" r="2.5" fill="#5eead4" opacity="0.65" />
        <circle cx="168" cy="128" r="1.8" fill="#5eead4" opacity="0.5" />
        <circle cx="34" cy="122" r="1.5" fill="#5eead4" opacity="0.5" />

        {/* 3. Back Hair: Beautiful Flowing Locks Framing Neck & Shoulders */}
        {/* Left Shoulder Lock */}
        <path
          d="M 60 85 C 44 105 36 135 42 175 C 50 188 66 185 74 165 C 68 140 66 110 70 85 Z"
          fill="url(#araHairMain)"
        />
        {/* Right Shoulder Lock */}
        <path
          d="M 140 85 C 156 105 164 135 158 175 C 150 188 134 185 126 165 C 132 140 134 110 130 85 Z"
          fill="url(#araHairMain)"
        />
        {/* Back Hair Dome */}
        <path
          d="M 52 90 C 44 46 70 30 100 30 C 130 30 156 46 148 90 C 148 120 138 146 126 155 C 100 162 74 155 52 90 Z"
          fill="url(#araHairMain)"
        />

        {/* 4. Slender Feminine Neck */}
        <rect x="91" y="125" width="18" height="26" rx="4" fill="url(#araSkinTone)" />
        {/* Soft Neck Shadow */}
        <path
          d="M 91 126 C 96 133 104 133 109 126 L 109 132 C 104 138 96 138 91 132 Z"
          fill="#e07a5f"
          opacity="0.25"
        />

        {/* 5. Delicate Gold Pendant Necklace */}
        <path
          d="M 92 143 Q 100 151 108 143"
          stroke="#f59e0b"
          strokeWidth="1.2"
          fill="none"
        />
        <circle cx="100" cy="148" r="2.5" fill="#fbbf24" stroke="#d97706" strokeWidth="0.8" />

        {/* 6. Counselor Attire: Soft Cream Blouse & Tailored Teal Blazer */}
        {/* Inner Blouse */}
        <path
          d="M 80 146 Q 100 166 120 146 L 126 196 L 74 196 Z"
          fill="url(#araBlouse)"
        />
        <path
          d="M 82 147 Q 100 164 118 147"
          stroke="#fde68a"
          strokeWidth="1.2"
          fill="none"
        />

        {/* Teal Counselor Blazer (Feminine Cut) */}
        {/* Left Shoulder & Lapel */}
        <path
          d="M 38 196 C 38 160 58 148 80 146 L 96 178 L 86 196 Z"
          fill="url(#araBlazer)"
          stroke="#0f766e"
          strokeWidth="1"
        />
        {/* Right Shoulder & Lapel */}
        <path
          d="M 162 196 C 162 160 142 148 120 146 L 104 178 L 114 196 Z"
          fill="url(#araBlazer)"
          stroke="#0f766e"
          strokeWidth="1"
        />
        {/* Left Lapel Detail */}
        <path
          d="M 78 146 L 96 178 L 82 176 L 72 154 Z"
          fill="#14b8a6"
          stroke="#0d9488"
          strokeWidth="0.8"
        />
        {/* Right Lapel Detail */}
        <path
          d="M 122 146 L 104 178 L 118 176 L 128 154 Z"
          fill="#14b8a6"
          stroke="#0d9488"
          strokeWidth="0.8"
        />

        {/* Psychology / PFA Counselor Heart Lapel Pin */}
        <circle cx="68" cy="164" r="2.8" fill="#5eead4" stroke="#0f766e" strokeWidth="0.8" />
        <path
          d="M 68 163 L 68 165 M 67 164 L 69 164"
          stroke="#042f2e"
          strokeWidth="0.8"
          strokeLinecap="round"
        />

        {/* 7. Soft Feminine Face Shape (Tapered Gentle Chin) */}
        <path
          d="M 68 82 C 68 58 81 48 100 48 C 119 48 132 58 132 82 C 132 108 123 133 100 137 C 77 133 68 108 68 82 Z"
          fill="url(#araSkinTone)"
        />

        {/* 8. Ears & Pearl Earrings */}
        <ellipse cx="67" cy="92" rx="4.5" ry="7" fill="url(#araSkinTone)" />
        <circle cx="66" cy="96" r="2.5" fill="#fef9c3" stroke="#eab308" strokeWidth="0.6" />
        <ellipse cx="133" cy="92" rx="4.5" ry="7" fill="url(#araSkinTone)" />
        <circle cx="134" cy="96" r="2.5" fill="#fef9c3" stroke="#eab308" strokeWidth="0.6" />

        {/* 9. Soft Empathy Rosy Cheeks */}
        <ellipse cx="78" cy="100" rx="9" ry="5.5" fill="url(#araCheekBlush)" />
        <ellipse cx="122" cy="100" rx="9" ry="5.5" fill="url(#araCheekBlush)" />

        {/* 10. Delicate Feminine Eyebrows */}
        <path
          d="M 73 76 C 79 70 87 71 92 75"
          stroke="#3b2014"
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
        />
        <path
          d="M 108 75 C 113 71 121 70 127 76"
          stroke="#3b2014"
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
        />

        {/* 11. Expressive Eyes with Feminine Eyelashes & Blinking */}
        {isBlinking ? (
          // Eyelids Closed during Blink with Graceful Lashes
          <g>
            <path
              d="M 72 88 Q 82 94 92 88"
              stroke="#1c1917"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 72 87 C 69 84 68 81 67 80"
              stroke="#1c1917"
              strokeWidth="1.8"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 74 89 C 72 87 70 85 69 83"
              stroke="#1c1917"
              strokeWidth="1.4"
              strokeLinecap="round"
              fill="none"
            />

            <path
              d="M 108 88 Q 118 94 128 88"
              stroke="#1c1917"
              strokeWidth="2.5"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 128 87 C 131 84 132 81 133 80"
              stroke="#1c1917"
              strokeWidth="1.8"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 126 89 C 128 87 130 85 131 83"
              stroke="#1c1917"
              strokeWidth="1.4"
              strokeLinecap="round"
              fill="none"
            />
          </g>
        ) : (
          // Eyes Open: Warm, Friendly with Lush Lashes & Bright Catchlights
          <g>
            {/* Left Eye */}
            <path d="M 73 87 C 74 81 89 81 91 87 C 89 93 74 93 73 87 Z" fill="#ffffff" />
            <circle cx="82" cy="87" r="5.5" fill="#451a03" />
            <circle cx="82" cy="87" r="3.2" fill="#1c1917" />
            <circle cx="80.5" cy="85" r="1.8" fill="#ffffff" />
            <circle cx="84" cy="88.5" r="0.9" fill="#ffffff" />
            <path
              d="M 72 87 Q 82 80 92 86"
              stroke="#1c1917"
              strokeWidth="2.6"
              strokeLinecap="round"
              fill="none"
            />
            {/* Curved outer feminine lashes */}
            <path
              d="M 72 87 C 69 84 68 81 67 80"
              stroke="#1c1917"
              strokeWidth="1.8"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 74 85 C 72 82 71 79 70 78"
              stroke="#1c1917"
              strokeWidth="1.4"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 75 88 Q 82 92 89 88"
              stroke="#8d5b4c"
              strokeWidth="0.8"
              strokeLinecap="round"
              fill="none"
            />

            {/* Right Eye */}
            <path d="M 109 87 C 111 81 126 81 127 87 C 126 93 111 93 109 87 Z" fill="#ffffff" />
            <circle cx="118" cy="87" r="5.5" fill="#451a03" />
            <circle cx="118" cy="87" r="3.2" fill="#1c1917" />
            <circle cx="116.5" cy="85" r="1.8" fill="#ffffff" />
            <circle cx="120" cy="88.5" r="0.9" fill="#ffffff" />
            <path
              d="M 108 86 Q 118 80 128 87"
              stroke="#1c1917"
              strokeWidth="2.6"
              strokeLinecap="round"
              fill="none"
            />
            {/* Curved outer feminine lashes */}
            <path
              d="M 128 87 C 131 84 132 81 133 80"
              stroke="#1c1917"
              strokeWidth="1.8"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 126 85 C 128 82 129 79 130 78"
              stroke="#1c1917"
              strokeWidth="1.4"
              strokeLinecap="round"
              fill="none"
            />
            <path
              d="M 111 88 Q 118 92 125 88"
              stroke="#8d5b4c"
              strokeWidth="0.8"
              strokeLinecap="round"
              fill="none"
            />
          </g>
        )}

        {/* 12. Cute Delicate Feminine Nose */}
        <path
          d="M 98 96 Q 100 102 102 101"
          stroke="#e07a5f"
          strokeWidth="1.4"
          strokeLinecap="round"
          fill="none"
          opacity="0.6"
        />
        <circle cx="100" cy="99" r="1.2" fill="#ffffff" opacity="0.4" />

        {/* 13. Feminine Cupid's Bow Lips & Dynamic Lip-Sync */}
        {/* Subtle Cupid's Bow Contour */}
        <path
          d="M 89 116 C 94 114 98 116 100 115 C 102 116 106 114 111 116"
          stroke="#e11d48"
          strokeWidth="1.2"
          fill="none"
        />

        {isSpeaking && mouth > 0.08 ? (
          // Dynamic Lip-Sync Mouth while Speaking
          <g>
            {/* Mouth Cavity */}
            <path
              d={`M 88 116 Q 100 ${116 + mouth * 14} 112 116 Q 100 ${116 - mouth * 5} 88 116`}
              fill="#881337"
              stroke="#e11d48"
              strokeWidth="2"
              strokeLinejoin="round"
            />
            {/* Clean White Teeth */}
            {mouth > 0.2 && (
              <path
                d={`M 91 116 Q 100 ${116 + Math.min(3.5, mouth * 3.5)} 109 116`}
                fill="#ffffff"
              />
            )}
            {/* Soft Tongue Accent */}
            {mouth > 0.35 && (
              <ellipse
                cx="100"
                cy={116 + mouth * 7}
                rx={5.5}
                ry={mouth * 3.5}
                fill="#fb7185"
              />
            )}
          </g>
        ) : (
          // Sweet Reassuring Smile (Idle / Listening)
          <g>
            {/* Full Lower Lip Soft Tone */}
            <path
              d="M 90 117 Q 100 124 110 117 Q 100 120 90 117"
              fill="#f43f5e"
              opacity="0.35"
            />
            {/* Sweet Smile Curve */}
            <path
              d="M 88 116 Q 100 123 112 116"
              stroke="#e11d48"
              strokeWidth="2.4"
              strokeLinecap="round"
              fill="none"
            />
            {/* Subtle Lip Gloss Gleam */}
            <ellipse cx="100" cy="120" rx="3.5" ry="1.2" fill="#ffffff" opacity="0.55" />
            {/* Cheerful Dimple Accents */}
            <circle cx="86" cy="115" r="1.1" fill="#fb7185" opacity="0.6" />
            <circle cx="114" cy="115" r="1.1" fill="#fb7185" opacity="0.6" />
          </g>
        )}

        {/* 14. Front Hair: Chic Side-Swept Bangs & Face-Framing Strands */}
        {/* Soft Bangs Layer */}
        <path
          d="M 68 76 C 72 46 88 40 100 40 C 114 40 128 46 132 72 C 120 54 106 50 95 64 C 84 52 74 58 68 76 Z"
          fill="url(#araHairMain)"
        />
        {/* Soft Face-Framing Tendril Left */}
        <path
          d="M 68 76 C 65 98 67 122 71 132 C 73 124 72 102 71 85 Z"
          fill="url(#araHairMain)"
        />
        {/* Soft Face-Framing Tendril Right */}
        <path
          d="M 132 72 C 135 98 133 122 129 132 C 127 124 128 102 129 85 Z"
          fill="url(#araHairMain)"
        />

        {/* Hair Gloss Sheen Arcs at the Crown */}
        <path
          d="M 76 46 Q 100 38 124 46"
          stroke="#78716c"
          strokeWidth="2.2"
          strokeLinecap="round"
          fill="none"
          opacity="0.5"
        />
        <path
          d="M 82 50 Q 100 44 118 50"
          stroke="#a8a29e"
          strokeWidth="1.4"
          strokeLinecap="round"
          fill="none"
          opacity="0.4"
        />
      </motion.svg>
    </div>
  );
}
