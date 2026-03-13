/**
 * MoodAdaptiveWrapper
 * ═══════════════════════════════════════════════════════════
 * Bridges OpenCV mood detection → K-Means cluster → Content difficulty
 *
 * HOW THE FULL PIPELINE WORKS:
 * 1. MoodCamera.jsx captures webcam frames (every 2 minutes)
 * 2. Frames go to the Python ML service (ml_service/app.py → mood_detector.py)
 * 3. ML service uses OpenCV + DeepFace to detect facial emotion
 * 4. Detected mood is returned: engaged / focused / struggling / frustrated / bored / anxious
 * 5. Backend /api/cluster/run uses K-Means to cluster students by:
 *    [avgMood, timeOnTask, errorRate, attendanceScore, xpGrowth]
 *    into 3 clusters: top / medium / below
 * 6. THIS component receives the onMood callback and:
 *    - Shows a non-intrusive toast with mood-based content suggestion
 *    - Calls setDifficulty('easy' | 'normal' | 'hard') that zone pages can use
 *    - After frustration/struggling → auto-shows AI hint / easy mode
 *    - Tracks engagement score for the session
 *
 * Usage in a zone page:
 *   <MoodAdaptiveWrapper onDifficultyChange={(level) => setDifficulty(level)} world="6-8">
 *     {children}
 *   </MoodAdaptiveWrapper>
 */
import { useState, useEffect, useCallback } from 'react';
import MoodCamera from './MoodCamera';
import { useAuth } from '../context/AuthContext';

/* Difficulty mapping from mood */
const MOOD_TO_DIFFICULTY = {
  engaged:    'hard',
  curious:    'hard',
  focused:    'normal',
  bored:      'normal',
  anxious:    'easy',
  struggling: 'easy',
  frustrated: 'easy',
};

/* Toast messages per mood */
const MOOD_TOAST = {
  engaged:    { emoji:'🚀', msg:"You're on fire! Unlocking bonus challenge...",        color:'#10b981' },
  curious:    { emoji:'🔍', msg:'Love the energy! Here comes something extra cool.',   color:'#38bdf8' },
  focused:    { emoji:'🎯', msg:'Great focus! Keep going at this pace.',               color:'#6366f1' },
  bored:      { emoji:'⚡', msg:"Let's spice it up! Switching to challenge mode.",     color:'#f59e0b' },
  anxious:    { emoji:'🌟', msg:"Take a breath — switching to easier mode for you.",   color:'#a78bfa' },
  struggling: { emoji:'💪', msg:"You've got this! Switching to Easy Mode to help.",   color:'#fbbf24' },
  frustrated: { emoji:'😊', msg:"Quick breather! Easy Mode on. You're doing great.",  color:'#ef4444' },
};

/* World-specific accents */
const WORLD_ACCENT = { '3-5':'#FF6B6B', '6-8':'#7C3AED', '9-12':'#10b981' };

export default function MoodAdaptiveWrapper({
  children,
  world = '6-8',
  onDifficultyChange,   // called with 'easy' | 'normal' | 'hard'
  onMoodChange,         // called with raw mood string
  studentId,
  sessionId = null,
}) {
  const { user } = useAuth();
  const [currentMood, setCurrentMood]       = useState(null);
  const [difficulty, setDifficulty]         = useState('normal');
  const [toast, setToast]                   = useState(null);
  const [sessionStats, setSessionStats]     = useState({ engaged:0, struggling:0, focused:0, total:0 });
  const [showPanel, setShowPanel]           = useState(false);
  const accent = WORLD_ACCENT[world] || '#7C3AED';

  const id = studentId || user?._id;

  /* Handle mood data from MoodCamera (which gets it from OpenCV ML service) */
  const handleMood = useCallback((mood, adjustment) => {
    if (!mood) return;

    setCurrentMood(mood);
    onMoodChange?.(mood);

    // Determine new difficulty from mood
    const newDifficulty = MOOD_TO_DIFFICULTY[mood] || 'normal';

    // Only act if difficulty changed
    if (newDifficulty !== difficulty) {
      setDifficulty(newDifficulty);
      onDifficultyChange?.(newDifficulty);

      // Show toast notification
      const t = MOOD_TOAST[mood];
      if (t) {
        setToast({ ...t, difficulty: newDifficulty });
        setTimeout(() => setToast(null), 5000);
      }
    }

    // Track session stats
    setSessionStats(prev => {
      const updated = { ...prev, total: prev.total + 1 };
      if (mood === 'engaged' || mood === 'focused' || mood === 'curious')
        updated.engaged = (updated.engaged || 0) + 1;
      else if (mood === 'struggling' || mood === 'frustrated' || mood === 'anxious')
        updated.struggling = (updated.struggling || 0) + 1;
      else
        updated.focused = (updated.focused || 0) + 1;
      return updated;
    });
  }, [difficulty, onDifficultyChange, onMoodChange]);

  /* Engagement score: % of "positive" mood readings */
  const engagementScore = sessionStats.total > 0
    ? Math.round((sessionStats.engaged / sessionStats.total) * 100)
    : null;

  return (
    <div style={{ position: 'relative' }}>
      {/* Session stats mini-panel (bottom left, only when camera is on) */}
      {currentMood && (
        <div
          onClick={() => setShowPanel(s => !s)}
          style={{
            position: 'fixed', bottom: '160px', right: '24px', zIndex: 200,
            background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(10px)',
            border: `1px solid ${accent}44`, borderRadius: '12px',
            padding: '8px 12px', cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px',
          }}
        >
          <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', letterSpacing: '1px' }}>
            AI ADAPT
          </div>
          <div style={{ fontSize: '13px', fontWeight: 700, color: accent }}>
            {difficulty === 'easy' ? '💡 Easy' : difficulty === 'hard' ? '🚀 Hard' : '🎯 Normal'}
          </div>
          {engagementScore !== null && (
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>
              Focus: {engagementScore}%
            </div>
          )}
        </div>
      )}

      {/* Expanded session panel */}
      {showPanel && currentMood && (
        <div style={{
          position: 'fixed', bottom: '220px', right: '24px', zIndex: 300,
          background: 'rgba(10,10,20,0.95)', backdropFilter: 'blur(16px)',
          border: `2px solid ${accent}44`, borderRadius: '16px', padding: '16px',
          width: '220px',
        }}>
          <div style={{ fontSize: '11px', color: accent, fontWeight: 700, letterSpacing: '1px', marginBottom: '12px' }}>
            🤖 AI MOOD ANALYTICS
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'rgba(255,255,255,0.5)' }}>Current Mood</span>
              <span style={{ color: '#fff', fontWeight: 700 }}>{currentMood}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'rgba(255,255,255,0.5)' }}>Difficulty</span>
              <span style={{ color: accent, fontWeight: 700, textTransform: 'capitalize' }}>{difficulty}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'rgba(255,255,255,0.5)' }}>Readings</span>
              <span style={{ color: '#fff' }}>{sessionStats.total}</span>
            </div>
            {engagementScore !== null && (
              <>
                <div style={{ height: '4px', background: 'rgba(255,255,255,0.06)', borderRadius: '2px', marginTop: '4px' }}>
                  <div style={{ height: '100%', width: `${engagementScore}%`, background: engagementScore >= 60 ? '#10b981' : engagementScore >= 40 ? '#fbbf24' : '#ef4444', borderRadius: '2px', transition: 'width 0.5s' }} />
                </div>
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)' }}>
                  Engagement Score: {engagementScore}%
                </div>
              </>
            )}
          </div>

          {/* How OpenCV + K-Means works — info box */}
          <div style={{ marginTop: '12px', padding: '8px', background: 'rgba(255,255,255,0.04)', borderRadius: '8px', fontSize: '10px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.6 }}>
            🔬 <strong style={{ color: 'rgba(255,255,255,0.6)' }}>How this works:</strong><br />
            Camera → OpenCV face detect → DeepFace emotion → mood signal → K-Means cluster → difficulty auto-adjusts
          </div>
        </div>
      )}

      {/* Mood Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed', top: '80px', left: '50%', transform: 'translateX(-50%)',
          zIndex: 9999, background: 'rgba(10,10,20,0.95)', backdropFilter: 'blur(16px)',
          border: `2px solid ${toast.color}66`, borderRadius: '16px', padding: '14px 24px',
          display: 'flex', alignItems: 'center', gap: '12px', boxShadow: `0 8px 32px ${toast.color}33`,
          animation: 'slideDown 0.3s ease',
          maxWidth: '400px',
        }}>
          <style>{`
            @keyframes slideDown{from{opacity:0;transform:translateX(-50%) translateY(-12px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
          `}</style>
          <div style={{ fontSize: '28px' }}>{toast.emoji}</div>
          <div>
            <div style={{ fontSize: '11px', color: toast.color, fontWeight: 700, letterSpacing: '1px', marginBottom: '2px' }}>
              AI ADAPTIVE LEARNING
            </div>
            <div style={{ fontSize: '14px', color: '#fff', fontWeight: 600 }}>{toast.msg}</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', marginTop: '2px' }}>
              Difficulty → <strong style={{ color: toast.color, textTransform: 'uppercase' }}>{toast.difficulty}</strong> mode based on your mood
            </div>
          </div>
          <button onClick={() => setToast(null)} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: '16px', padding: '4px', marginLeft: 'auto' }}>✕</button>
        </div>
      )}

      {/* MoodCamera — the OpenCV powered component */}
      <MoodCamera
        studentId={id}
        sessionId={sessionId}
        world={world}
        onMood={handleMood}
      />

      {/* Zone page content rendered inside */}
      {children}
    </div>
  );
}
