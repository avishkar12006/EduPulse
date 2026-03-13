import { useRef, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  activateCamera, deactivateCamera, startMonitoring,
  stopMonitoring, getMoodEmoji, getMoodColor,
} from '../utils/moodCamera';

/**
 * MoodCamera — Small floating camera component for OpenCV mood monitoring
 * Shows a 100px live video preview with detected mood overlay.
 * Props:
 *   studentId: string
 *   sessionId: string
 *   world: '3-5' | '6-8' | '9-12'
 *   onMood: (mood, adjustment) => void
 */
export default function MoodCamera({ studentId, sessionId, world = '6-8', onMood }) {
  const videoRef = useRef(null);
  const { user } = useAuth();
  const [active, setActive]         = useState(false);
  const [mood, setMood]             = useState(null);
  const [engagement, setEngagement] = useState(null);
  const [teacherAlert, setTeacherAlert] = useState(false);
  const [error, setError]           = useState(null);

  const token = localStorage.getItem('ep_token') || sessionStorage.getItem('ep_token');

  const handleStart = async () => {
    setError(null);
    const ok = await activateCamera(videoRef.current);
    if (!ok) { setError('Camera permission denied'); return; }
    setActive(true);
    startMonitoring({
      studentId,
      token,
      sessionId,
      intervalMs: 120000,  // every 2 minutes
      onMood: ({ mood, adjustment, teacherAlerted }) => {
        setMood(mood);
        setTeacherAlert(teacherAlerted);
        if (adjustment.action !== 'continue') onMood?.(mood, adjustment);
      },
    });
  };

  const handleStop = () => {
    stopMonitoring();
    deactivateCamera();
    setActive(false);
    setMood(null);
  };

  useEffect(() => () => { deactivateCamera(); stopMonitoring(); }, []);

  const moodEmoji = mood ? getMoodEmoji(mood) : '📷';
  const moodColor = mood ? getMoodColor(mood)  : '#64748b';

  // World-specific color accent
  const accent = world === '3-5' ? '#FF6B6B' : world === '6-8' ? '#7C3AED' : '#3B82F6';

  return (
    <div style={{
      position: 'fixed', bottom: '24px', right: '24px', zIndex: 100,
      display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px',
      fontFamily: world === '9-12' ? "'Space Mono', monospace" : "'Inter', sans-serif",
    }}>
      {active && (
        <div style={{
          background: 'rgba(0,0,0,0.85)',
          border: `1px solid ${accent}40`,
          borderRadius: '16px', padding: '8px', backdropFilter: 'blur(12px)',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px',
        }}>
          {/* Live video */}
          <div style={{ position: 'relative' }}>
            <video
              ref={videoRef}
              style={{ width: '96px', height: '96px', borderRadius: '50%', objectFit: 'cover', border: `3px solid ${moodColor}`, display: 'block' }}
              muted playsInline
            />
            {/* Mood emoji overlay */}
            <div style={{
              position: 'absolute', bottom: '0', right: '0',
              width: '28px', height: '28px', borderRadius: '50%',
              background: moodColor + '33', border: `2px solid ${moodColor}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '16px',
            }}>
              {moodEmoji}
            </div>
          </div>

          {/* Mood label */}
          {mood && (
            <div style={{ fontSize: '11px', fontWeight: 700, color: moodColor, letterSpacing: '0.5px' }}>
              {mood.toUpperCase()}
            </div>
          )}

          {/* Teacher alert badge */}
          {teacherAlert && (
            <div style={{ fontSize: '10px', color: '#ef4444', fontWeight: 700, background: 'rgba(239,68,68,0.1)', padding: '2px 8px', borderRadius: '99px', border: '1px solid rgba(239,68,68,0.3)' }}>
              📢 TEACHER NOTIFIED
            </div>
          )}

          {/* Engagement hint for 9-12 */}
          {world === '9-12' && engagement !== null && (
            <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.5)' }}>FOCUS {engagement}%</div>
          )}

          {/* Stop button */}
          <button onClick={handleStop} style={{
            background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)',
            borderRadius: '8px', color: '#ef4444', fontSize: '10px', fontWeight: 700,
            padding: '4px 10px', cursor: 'pointer', width: '100%',
          }}>
            {world === '3-5' ? '✋ Stop' : 'STOP CAMERA'}
          </button>
        </div>
      )}

      {/* Activate button */}
      {!active && (
        <button onClick={handleStart} style={{
          background: accent, border: 'none', borderRadius: '50px',
          color: '#fff', fontSize: '13px', fontWeight: 700,
          padding: '10px 18px', cursor: 'pointer',
          boxShadow: `0 4px 20px ${accent}66`,
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          📷 {world === '3-5' ? 'Let Sparky See You! 😊' : world === '6-8' ? 'Focus Mode' : 'Mission Focus Mode'}
        </button>
      )}

      {error && (
        <div style={{ fontSize: '11px', color: '#ef4444', background: 'rgba(239,68,68,0.1)', padding: '6px 12px', borderRadius: '8px', maxWidth: '200px', textAlign: 'center' }}>
          {error}
        </div>
      )}
    </div>
  );
}
