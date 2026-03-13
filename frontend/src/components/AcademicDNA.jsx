import { useEffect, useRef } from 'react';

/**
 * AcademicDNA — 8-Dimension Radar Chart
 * Pure SVG (no external chart lib dependency for this component)
 * Props:
 *   data: object with 8 keys (values 0-100)
 *   compare: object | null (optional overlay for cluster average)
 *   size: number (default 280)
 *   world: '3-5' | '6-8' | '9-12'
 *   animated: boolean
 */

const DIMENSIONS = [
  { key: 'focusPower',        label: '🎯 Focus Power',         short: 'Focus'   },
  { key: 'pressurePerformer', label: '💪 Pressure Performer',  short: 'Pressure'},
  { key: 'teamPlayer',        label: '🤝 Team Player',         short: 'Team'    },
  { key: 'selfNavigator',     label: '🧭 Self Navigator',       short: 'Self'    },
  { key: 'comebackKid',       label: '🔄 Comeback Kid',         short: 'Comeback'},
  { key: 'subjectExplorer',   label: '🌈 Subject Explorer',     short: 'Explorer'},
  { key: 'quickResponder',    label: '⚡ Quick Responder',      short: 'Quick'   },
  { key: 'growthSeeker',      label: '📈 Growth Seeker',        short: 'Growth'  },
];

function toRadar(values, cx, cy, rMax, n) {
  return values.map((v, i) => {
    const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
    const r     = (v / 100) * rMax;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  });
}

function pointsToPath(pts) {
  return pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ') + ' Z';
}

export default function AcademicDNA({
  data = {},
  compare = null,
  size = 280,
  world = '6-8',
  animated = true,
}) {
  const svgRef = useRef(null);
  const n      = DIMENSIONS.length;
  const cx     = size / 2;
  const cy     = size / 2 + 10;
  const rMax   = (size / 2) * 0.68;

  // Accent color per world
  const accent  = world === '3-5' ? '#FF6B6B' : world === '6-8' ? '#7C3AED' : '#3B82F6';
  const accent2 = world === '6-8' ? '#EC4899' : '#10b981';

  // Fallback defaults
  const defaults = { focusPower:60, pressurePerformer:55, teamPlayer:65, selfNavigator:58, comebackKid:62, subjectExplorer:70, quickResponder:50, growthSeeker:68 };
  const vals     = DIMENSIONS.map(d => data?.[d.key] ?? defaults[d.key]);
  const cmpVals  = compare ? DIMENSIONS.map(d => compare?.[d.key] ?? 50) : null;

  // Radar base rings
  const rings = [20, 40, 60, 80, 100].map(pct => toRadar(Array(n).fill(pct), cx, cy, rMax, n));

  // Data paths
  const dataPts = toRadar(vals, cx, cy, rMax, n);
  const cmpPts  = cmpVals ? toRadar(cmpVals, cx, cy, rMax, n) : null;

  // Axis lines and labels
  const axes = DIMENSIONS.map((d, i) => {
    const angle = (i / n) * 2 * Math.PI - Math.PI / 2;
    const rOuter = rMax + 28;
    return {
      ...d,
      x1: cx, y1: cy,
      x2: cx + rMax  * Math.cos(angle),
      y2: cy + rMax  * Math.sin(angle),
      lx: cx + rOuter * Math.cos(angle),
      ly: cy + rOuter * Math.sin(angle),
    };
  });

  return (
    <div style={{ width: size, height: size + 20, position: 'relative' }}>
      <style>{`
        @keyframes dnaFadeIn { from { opacity: 0; transform: scale(0.5); } to { opacity: 1; transform: scale(1); } }
        .dna-poly { ${animated ? 'animation: dnaFadeIn 0.8s ease-out;' : ''} transform-origin: ${cx}px ${cy}px; }
      `}</style>
      <svg ref={svgRef} viewBox={`0 0 ${size} ${size + 20}`} width={size} height={size + 20}>
        {/* Background rings */}
        {rings.map((pts, ri) => (
          <polygon key={ri} points={pts.map(p => `${p.x},${p.y}`).join(' ')}
            fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
        ))}

        {/* Axes */}
        {axes.map((ax, i) => (
          <g key={i}>
            <line x1={ax.x1} y1={ax.y1} x2={ax.x2} y2={ax.y2}
              stroke="rgba(255,255,255,0.08)" strokeWidth="1" />
            <text x={ax.lx} y={ax.ly + 4} textAnchor="middle"
              fontSize="10" fontFamily="'Inter', sans-serif"
              fill="rgba(255,255,255,0.45)">{ax.short}</text>
          </g>
        ))}

        {/* Compare overlay (cluster avg) */}
        {cmpPts && (
          <polygon className="dna-poly"
            points={cmpPts.map(p => `${p.x},${p.y}`).join(' ')}
            fill={accent2 + '18'} stroke={accent2} strokeWidth="1.5" strokeDasharray="4 3" opacity="0.7" />
        )}

        {/* Main data polygon */}
        <polygon className="dna-poly"
          points={dataPts.map(p => `${p.x},${p.y}`).join(' ')}
          fill={accent + '30'} stroke={accent} strokeWidth="2"
          style={{ filter: `drop-shadow(0 0 8px ${accent}66)` }}
        />

        {/* Data points */}
        {dataPts.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="4"
            fill={accent} stroke="#0f172a" strokeWidth="2"
            style={{ filter: `drop-shadow(0 0 4px ${accent})` }} />
        ))}

        {/* Center dot */}
        <circle cx={cx} cy={cy} r="3" fill="rgba(255,255,255,0.2)" />

        {/* Legend */}
        {cmpPts && (
          <g transform={`translate(${size - 120}, ${size - 10})`}>
            <rect width="10" height="10" fill={accent + '30'} stroke={accent} rx="2" />
            <text x="14" y="9" fontSize="9" fill="rgba(255,255,255,0.5)">You</text>
            <rect x="40" width="10" height="10" fill={accent2 + '18'} stroke={accent2} rx="2" />
            <text x="54" y="9" fontSize="9" fill="rgba(255,255,255,0.5)">Class avg</text>
          </g>
        )}
      </svg>

      {/* Score labels on hover — simplified as tooltips via title */}
    </div>
  );
}
