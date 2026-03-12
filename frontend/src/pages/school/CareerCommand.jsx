import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import API from '../../utils/api';

export default function CareerCommand() {
  const { user, logout } = useAuth();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get(`/api/students/${user.studentId}`)
      .then(res => setStudent(res.data))
      .catch()
      .finally(() => setLoading(false));
  }, []);

  const moodCheckIn = async (moodVal) => {
    await API.post('/api/students/mood', { studentId: user.studentId, moodValue: moodVal });
    setStudent({ ...student, moodToday: moodVal, xpPoints: (student.xpPoints || 0) + 20 });
  };

  const xp = student?.xpPoints || 0;
  const level = student?.level || 1;

  if (loading) return <div style={{ background: '#0f172a', minHeight: '100vh' }}></div>;

  return (
    <div style={{ minHeight: '100vh', background: '#0f172a', fontFamily: "'Nunito', sans-serif", color: 'white' }}>
      {/* High-school Tech Navbar */}
      <nav style={{ background: 'rgba(255,255,255,0.05)', borderBottom: '1px solid rgba(255,255,255,0.1)', padding: '0 32px', height: '70px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10, backdropFilter: 'blur(10px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span style={{ fontSize: '28px' }}>🚀</span>
          <div>
            <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: '20px', color: '#8B5CF6', letterSpacing: '1px' }}>CAREER COMMAND</div>
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px' }}>Class 9-12 Hub</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ display: 'flex', gap: '16px', fontFamily: "'Space Mono', monospace" }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>Level</div>
              <div style={{ fontSize: '18px', color: '#8B5CF6', fontWeight: 700 }}>{level}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '10px', color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase' }}>XP Points</div>
              <div style={{ fontSize: '18px', color: '#A78BFA', fontWeight: 700 }}>{xp}</div>
            </div>
          </div>
          <button onClick={logout} style={{ background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px', padding: '8px 16px', color: 'white', fontWeight: 700, fontSize: '13px', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.2)'; }} onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; }}>Disconnect</button>
        </div>
      </nav>

      <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 32px', display: 'grid', gridTemplateColumns: '1fr 380px', gap: '32px' }}>
        {/* Left Col */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          {/* Neon Welcome */}
          <div style={{ background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(76,29,149,0.3))', border: '1px solid rgba(139,92,246,0.3)', borderRadius: '24px', padding: '40px', position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: '-50px', right: '-20px', fontSize: '150px', opacity: 0.1, transform: 'rotate(15deg)' }}>🎯</div>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <h2 style={{ fontFamily: "'Fredoka One', cursive", fontSize: '36px', margin: '0 0 12px', color: '#fff', textShadow: '0 0 20px rgba(139,92,246,0.8)' }}>Initiate Sequence, {user.name.split(' ')[0]}</h2>
              <p style={{ fontSize: '16px', margin: 0, color: 'rgba(255,255,255,0.7)', maxWidth: '400px', lineHeight: 1.6 }}>Your academic performance dictates your career path probability. Maintain focus.</p>
            </div>
            {/* Health Bar */}
            <div style={{ marginTop: '32px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', fontFamily: "'Space Mono', monospace", color: 'rgba(255,255,255,0.6)' }}>
                <span>Academic Integrity</span>
                <span style={{ color: '#10B981' }}>{student?.academicHealthScore || 0}%</span>
              </div>
              <div style={{ height: '8px', background: 'rgba(0,0,0,0.5)', borderRadius: '99px', overflow: 'hidden', border: '1px solid rgba(255,255,255,0.1)' }}>
                <div style={{ width: `${student?.academicHealthScore || 0}%`, height: '100%', background: 'linear-gradient(90deg, #8B5CF6, #10B981)', borderRadius: '99px', boxShadow: '0 0 10px rgba(16,185,129,0.8)' }} />
              </div>
            </div>
          </div>

          {/* Core Modules Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {/* Sparky Module */}
            <Link to="/school/sparky-chat" style={{ textDecoration: 'none' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', height: '100%', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '32px', cursor: 'pointer', transition: 'all 0.3s' }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(139,92,246,0.5)'; }} onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                  <div style={{ fontSize: '40px', background: 'rgba(139,92,246,0.2)', width: '64px', height: '64px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🤖</div>
                  <h3 style={{ fontFamily: "'Fredoka One', cursive", fontSize: '20px', margin: 0, color: 'white' }}>Sparky AI</h3>
                </div>
                <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.6 }}>Advanced AI tutor for complex subjects and homework resolution.</p>
              </div>
            </Link>
            
            {/* Career Module */}
            <div onClick={() => alert('Launching Career Path Projection matrix...')} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '20px', padding: '32px', cursor: 'pointer', transition: 'all 0.3s' }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(16,185,129,0.5)'; }} onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                <div style={{ fontSize: '40px', background: 'rgba(16,185,129,0.2)', width: '64px', height: '64px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🎯</div>
                <h3 style={{ fontFamily: "'Fredoka One', cursive", fontSize: '20px', margin: 0, color: 'white' }}>Career Paths</h3>
              </div>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', margin: 0, lineHeight: 1.6 }}>Map your academic results into real-world college & career trajectories.</p>
            </div>
          </div>
        </div>

        {/* Right Col */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* HUD Stats */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '24px' }}>
            <h3 style={{ fontFamily: "'Space Mono', monospace", fontSize: '14px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', margin: '0 0 20px', letterSpacing: '1px' }}>System HUD</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '12px', borderLeft: '4px solid #3B82F6' }}>
                <span style={{ fontSize: '14px', fontWeight: 600 }}>Attendance Rate</span>
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '20px', fontWeight: 700, color: '#3B82F6' }}>{student?.attendancePercentage || 92}%</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '12px', borderLeft: '4px solid #10B981' }}>
                <span style={{ fontSize: '14px', fontWeight: 600 }}>Quests Completed</span>
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '20px', fontWeight: 700, color: '#10B981' }}>14</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '12px', borderLeft: '4px solid #EF4444' }}>
                <span style={{ fontSize: '14px', fontWeight: 600 }}>Active Streak</span>
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '20px', fontWeight: 700, color: '#EF4444' }}>{student?.streakDays || 4} 🔥</span>
              </div>
            </div>
          </div>

          {/* Daily Uplink (Mood) */}
          <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '24px', padding: '24px', textAlign: 'center' }}>
            <h3 style={{ fontFamily: "'Space Mono', monospace", fontSize: '14px', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', margin: '0 0 20px', letterSpacing: '1px' }}>Daily Uplink</h3>
            {student?.moodToday ? (
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '24px', borderRadius: '16px' }}>
                <div style={{ fontSize: '56px', marginBottom: '12px' }}>{['', '😰', '😢', '😐', '😊', '🤩'][student.moodToday]}</div>
                <div style={{ fontSize: '13px', color: '#8B5CF6', fontFamily: "'Space Mono', monospace" }}>UPLINK SECURED (+20 XP)</div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'min-content min-content', justifyContent: 'center', gap: '16px' }}>
                {['😢', '😐', '😊', '🤩'].map((m, i) => (
                  <button key={i} onClick={() => moodCheckIn(i + 2)} style={{ fontSize: '40px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', width: '80px', height: '80px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }} onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.transform = 'scale(1.05)'; }} onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,0,0,0.3)'; e.currentTarget.style.transform = 'none'; }}>{m}</button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
