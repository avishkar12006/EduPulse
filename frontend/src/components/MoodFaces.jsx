/**
 * MoodFaces — Three variants for the three worlds
 * Props:
 *   variant: '3-face' | '5-face' | 'emoji'
 *   selected: number | null
 *   onSelect: (value: number) => void
 *   size: 'sm' | 'md' | 'lg'
 */
export default function MoodFaces({ variant = '5-face', selected, onSelect, size = 'md' }) {
  const sz = size === 'lg' ? 100 : size === 'md' ? 64 : 44;
  const gap = size === 'lg' ? 24 : 16;

  if (variant === '3-face') return <ThreeFace sz={sz} gap={gap} selected={selected} onSelect={onSelect} />;
  if (variant === '5-face') return <FiveFace  sz={sz} gap={gap} selected={selected} onSelect={onSelect} />;
  return <EmojiFace sz={sz} gap={gap} selected={selected} onSelect={onSelect} />;
}

/* ── 3-Face: Lion / Rabbit / Cloud (Class 3-5) ────────────────────────────── */
function ThreeFace({ sz, gap, selected, onSelect }) {
  const faces = [
    { value: 5, label: 'Happy',  emoji: '🦁', color: '#FFD700', bg: 'rgba(255,215,0,0.15)',   border: '#FFD700' },
    { value: 3, label: 'Okay',   emoji: '🐰', color: '#98D8C8', bg: 'rgba(152,216,200,0.15)', border: '#98D8C8' },
    { value: 1, label: 'Sad',    emoji: '☁️', color: '#94a3b8', bg: 'rgba(148,163,184,0.15)', border: '#94a3b8' },
  ];
  return (
    <div style={{ display: 'flex', gap, alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
      <style>{`
        .mf-face { transition: all 0.2s cubic-bezier(0.34,1.56,0.64,1); cursor: pointer; }
        .mf-face:hover { transform: scale(1.12); }
        .mf-face.active { transform: scale(1.18); }
        @keyframes mfBounce { 0%,100%{transform:scale(1.18)} 50%{transform:scale(1.28)} }
        .mf-face.active { animation: mfBounce 0.6s ease-in-out; }
      `}</style>
      {faces.map(f => (
        <button
          key={f.value}
          onClick={() => onSelect?.(f.value)}
          className={`mf-face${selected === f.value ? ' active' : ''}`}
          title={f.label}
          style={{
            width: sz + 24, height: sz + 24,
            borderRadius: '50%',
            border: `3px solid ${selected === f.value ? f.border : 'rgba(255,255,255,0.1)'}`,
            background: selected === f.value ? f.bg : 'rgba(255,255,255,0.05)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: '6px', cursor: 'pointer',
            boxShadow: selected === f.value ? `0 0 20px ${f.color}66` : 'none',
          }}
        >
          <span style={{ fontSize: sz * 0.6 }}>{f.emoji}</span>
          <span style={{ fontSize: sz * 0.13, fontWeight: 700, color: selected === f.value ? f.color : 'rgba(255,255,255,0.5)', fontFamily: "'Fredoka One', cursive" }}>{f.label}</span>
        </button>
      ))}
    </div>
  );
}

/* ── 5-Face: Emoji row (Class 6-8) ─────────────────────────────────────────── */
function FiveFace({ sz, gap, selected, onSelect }) {
  const faces = [
    { value: 1, emoji: '😤', label: 'Stressed',  color: '#ef4444' },
    { value: 2, emoji: '😔', label: 'Low',        color: '#f59e0b' },
    { value: 3, emoji: '😐', label: 'Okay',       color: '#94a3b8' },
    { value: 4, emoji: '😊', label: 'Good',       color: '#10b981' },
    { value: 5, emoji: '🤩', label: 'Amazing',    color: '#38bdf8' },
  ];
  return (
    <div style={{ display: 'flex', gap, alignItems: 'flex-end', justifyContent: 'center', flexWrap: 'wrap' }}>
      {faces.map((f, i) => {
        const isActive = selected === f.value;
        const scale    = 0.7 + i * 0.08;   // faces grow from left to right
        return (
          <div
            key={f.value}
            onClick={() => onSelect?.(f.value)}
            title={f.label}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px',
              cursor: 'pointer',
              transform: isActive ? `scale(${scale + 0.15})` : `scale(${scale})`,
              transition: 'transform 0.2s cubic-bezier(0.34,1.56,0.64,1)',
              filter: isActive ? `drop-shadow(0 0 12px ${f.color})` : 'none',
            }}
          >
            <span style={{ fontSize: sz * 0.55, lineHeight: 1 }}>{f.emoji}</span>
            <span style={{
              fontSize: '11px', fontWeight: 700, color: isActive ? f.color : 'rgba(255,255,255,0.3)',
              fontFamily: "'Nunito', sans-serif", transition: 'color 0.2s',
            }}>{f.label}</span>
            {isActive && (
              <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: f.color, boxShadow: `0 0 8px ${f.color}` }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Emoji variant: 7 moods (Class 9-12, minimal) ──────────────────────────── */
function EmojiFace({ sz, gap, selected, onSelect }) {
  const faces = [
    { value: 1, emoji: '😤', label: 'Frustrated' },
    { value: 2, emoji: '😟', label: 'Struggling' },
    { value: 3, emoji: '😐', label: 'Neutral'    },
    { value: 4, emoji: '🤔', label: 'Focused'    },
    { value: 5, emoji: '🚀', label: 'Engaged'    },
  ];
  return (
    <div style={{ display: 'flex', gap, flexWrap: 'wrap', justifyContent: 'center' }}>
      {faces.map(f => {
        const isActive = selected === f.value;
        return (
          <button
            key={f.value}
            onClick={() => onSelect?.(f.value)}
            style={{
              background: isActive ? 'rgba(56,189,248,0.1)' : 'transparent',
              border:     `1px solid ${isActive ? '#38bdf8' : 'rgba(255,255,255,0.1)'}`,
              borderRadius: '10px', padding: '10px 14px',
              cursor: 'pointer', transition: 'all 0.18s',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
            }}
          >
            <span style={{ fontSize: sz * 0.45 }}>{f.emoji}</span>
            <span style={{ fontSize: '10px', color: isActive ? '#38bdf8' : 'rgba(255,255,255,0.4)', fontFamily: "'Space Mono', monospace", fontWeight: 600 }}>
              {f.label.toUpperCase()}
            </span>
          </button>
        );
      })}
    </div>
  );
}
