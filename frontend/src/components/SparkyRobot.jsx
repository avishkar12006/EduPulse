import { useEffect, useRef } from 'react';

/**
 * SparkyRobot — Animated SVG mascot for Sparky World (Class 3-5)
 * Props:
 *   mood: 'happy' | 'wave' | 'celebrate' | 'sad' | 'confused' | 'think'
 *   size: number (default 160)
 *   action: string (same as mood for convenience)
 */
export default function SparkyRobot({ mood = 'happy', size = 160 }) {
  const sparkRef = useRef(null);

  // Body colors based on mood
  const bodyColor  = mood === 'celebrate' ? '#FFD700'
    : mood === 'sad' || mood === 'confused' ? '#94a3b8'
    : '#38bdf8';
  const faceGlow   = mood === 'celebrate' ? '#10b981' : bodyColor;
  const eyeColor   = mood === 'sad' ? '#64748b' : '#fff';

  // Mouth shape
  const mouth = mood === 'sad'
    ? 'M 60 115 Q 80 108 100 115'   // frown
    : mood === 'confused'
    ? 'M 60 112 Q 80 116 100 112'   // flat
    : 'M 60 108 Q 80 120 100 108';  // smile

  // Eye shapes (normal vs confused)
  const leftEye  = mood === 'confused' ? '~' : null;
  const rightEye = mood === 'confused' ? '?' : null;

  const armAnim  = mood === 'wave' || mood === 'celebrate';
  const bodyBounce = mood === 'celebrate';

  return (
    <svg
      ref={sparkRef}
      viewBox="0 0 160 220"
      width={size}
      height={size * 1.375}
      xmlns="http://www.w3.org/2000/svg"
      style={{ overflow: 'visible', userSelect: 'none' }}
    >
      <defs>
        <radialGradient id="bodyGrad" cx="50%" cy="40%" r="60%">
          <stop offset="0%"   stopColor={bodyColor} stopOpacity="1" />
          <stop offset="100%" stopColor={bodyColor} stopOpacity="0.7" />
        </radialGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>

        {/* Wave animation */}
        <style>{`
          @keyframes sparkyBounce {
            0%,100% { transform: translateY(0); }
            50%      { transform: translateY(-12px); }
          }
          @keyframes armWave {
            0%,100% { transform: rotate(0deg); transform-origin: 30px 90px; }
            50%      { transform: rotate(-30deg); transform-origin: 30px 90px; }
          }
          @keyframes rightWave {
            0%,100% { transform: rotate(0deg); transform-origin: 130px 90px; }
            50%      { transform: rotate(30deg); transform-origin: 130px 90px; }
          }
          @keyframes eyePulse {
            0%,100% { r: 12; }
            50%      { r: 14; }
          }
          @keyframes confettiBurst {
            0%   { opacity:1; transform: scale(0) rotate(0deg); }
            100% { opacity:0; transform: scale(2) rotate(180deg); }
          }
          .sparky-body   { animation: ${bodyBounce ? 'sparkyBounce 0.6s ease-in-out infinite' : 'none'}; }
          .sparky-arm-l  { animation: ${armAnim ? 'armWave 0.8s ease-in-out infinite' : 'none'}; }
          .sparky-arm-r  { animation: ${armAnim ? 'rightWave 0.8s ease-in-out infinite' : 'none'}; }
          .sparky-eye    { animation: ${mood === 'celebrate' ? 'eyePulse 0.5s ease-in-out infinite' : 'none'}; }
        `}</style>
      </defs>

      {/* Confetti (celebrate only) */}
      {mood === 'celebrate' && ['#ff6b6b','#ffd700','#00e5a0','#38bdf8','#c084fc'].map((c, i) => (
        <circle key={i}
          cx={40 + i * 18} cy={20 + (i % 2) * 10}
          r="5" fill={c}
          style={{ animation: `confettiBurst 1s ${i * 0.1}s ease-out infinite` }}
        />
      ))}

      <g className="sparky-body">
        {/* Antenna */}
        <line x1="80" y1="20" x2="80" y2="50" stroke={bodyColor} strokeWidth="4" strokeLinecap="round" />
        <circle cx="80" cy="16" r="8" fill={faceGlow} filter="url(#glow)" />

        {/* Head */}
        <rect x="30" y="48" width="100" height="80" rx="24" fill="url(#bodyGrad)" />
        {/* Face plate */}
        <rect x="42" y="60" width="76" height="56" rx="16" fill="rgba(0,0,0,0.18)" />
        {/* Eyes */}
        {leftEye ? (
          <text x="55" y="98" fontSize="22" fill={eyeColor} textAnchor="middle">~</text>
        ) : (
          <circle className="sparky-eye" cx="62" cy="88" r="12" fill={eyeColor} />
        )}
        {leftEye === null && <circle cx="62" cy="91" r="5" fill="#1e3a5f" />}
        {rightEye ? (
          <text x="104" y="98" fontSize="20" fill={eyeColor} textAnchor="middle">?</text>
        ) : (
          <circle className="sparky-eye" cx="98" cy="88" r="12" fill={eyeColor} />
        )}
        {rightEye === null && <circle cx="98" cy="91" r="5" fill="#1e3a5f" />}
        {/* Shine in eyes */}
        {mood !== 'confused' && <>
          <circle cx="66" cy="85" r="3" fill="white" opacity="0.8" />
          <circle cx="102" cy="85" r="3" fill="white" opacity="0.8" />
        </>}
        {/* Mouth */}
        <path d={mouth} stroke={eyeColor} strokeWidth="3.5" fill="none" strokeLinecap="round" />

        {/* Cheeks (happy/celebrate) */}
        {(mood === 'happy' || mood === 'celebrate') && <>
          <circle cx="50" cy="105" r="8" fill="#ff9999" opacity="0.5" />
          <circle cx="110" cy="105" r="8" fill="#ff9999" opacity="0.5" />
        </>}

        {/* Collar */}
        <rect x="55" y="125" width="50" height="8" rx="4" fill={bodyColor} opacity="0.6" />

        {/* Arms */}
        <rect className="sparky-arm-l" x="10" y="75" width="22" height="40" rx="11" fill="url(#bodyGrad)" />
        <rect className="sparky-arm-r" x="128" y="75" width="22" height="40" rx="11" fill="url(#bodyGrad)" />
        {/* Hands */}
        <circle cx="21" cy="119" r="9" fill={bodyColor} />
        <circle cx="139" cy="119" r="9" fill={bodyColor} />

        {/* Body */}
        <rect x="38" y="130" width="84" height="58" rx="20" fill="url(#bodyGrad)" />
        {/* Body panel */}
        <rect x="55" y="142" width="50" height="34" rx="10" fill="rgba(0,0,0,0.15)" />
        {/* Panel lights */}
        <circle cx="67" cy="155" r="4" fill={mood === 'sad' ? '#ef4444' : '#10b981'} />
        <circle cx="80" cy="155" r="4" fill={faceGlow} filter="url(#glow)" />
        <circle cx="93" cy="155" r="4" fill={mood === 'celebrate' ? '#ffd700' : '#38bdf8'} />
        {/* Panel bar */}
        <rect x="62" y="164" width="36" height="6" rx="3" fill="rgba(255,255,255,0.15)" />
        <rect x="62" y="164" width={mood === 'celebrate' ? 36 : 20} height="6" rx="3" fill={faceGlow} opacity="0.6" />

        {/* Legs */}
        <rect x="52" y="185" width="22" height="32" rx="11" fill="url(#bodyGrad)" />
        <rect x="86" y="185" width="22" height="32" rx="11" fill="url(#bodyGrad)" />
        {/* Feet */}
        <rect x="48" y="212" width="30" height="10" rx="6" fill={bodyColor} />
        <rect x="82" y="212" width="30" height="10" rx="6" fill={bodyColor} />
      </g>
    </svg>
  );
}
