import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import API from '../../utils/api';

export default function ExplorerHub() {
  const { user, logout } = useAuth();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeQuest, setActiveQuest] = useState(null);

  useEffect(() => {
    try {
      API.get(`/api/students/${user?.studentId || 'demo'}`)
        .then(res => {
          if (res && res.data) setStudent(res.data);
          setLoading(false);
        })
        .catch(err => {
          console.warn('Demo environment: Backend unavailable', err);
          setLoading(false);
        });
    } catch (err) {
      console.warn('API error', err);
      setLoading(false);
    }
  }, [user]);

  const moodCheckIn = async (moodVal) => {
    await API.post(`/api/students/${user.studentId}/mood`, { mood: moodVal, label: 'logged' }).catch(()=>{});
    setStudent({ ...student, moodToday: moodVal, xpPoints: (student.xpPoints || 0) + 15 });
  };

  const xp = student?.xpPoints || 120;
  const level = student?.level || 2;

  const QUESTS = [
    { id: 1, title: 'Fractions Masterclass', subject: 'Math', type: 'Interactive Quiz', xp: 50, duration: '15 mins', icon: '➗', color: '#3b82f6', bg: '#eff6ff', done: false },
    { id: 2, title: 'The Solar System 3D', subject: 'Science', type: 'Virtual Model', xp: 75, duration: '20 mins', icon: '🌍', color: '#8b5cf6', bg: '#f5f3ff', done: false },
    { id: 3, title: 'Grammar Ninja', subject: 'English', type: 'Word Game', xp: 40, duration: '10 mins', icon: '📝', color: '#10b981', bg: '#f0fdf4', done: true }
  ];

  if (loading) return <div style={{ background: '#f8fafc', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Loading Explorer Hub...</div>;

  return (
    <div style={{ minHeight: '100vh', background: '#f0f4f8', fontFamily: "'Nunito', sans-serif", color: '#0f172a', paddingBottom: '60px' }}>
      {/* Navbar */}
      <nav style={{ background: 'rgba(255,255,255,0.8)', backdropFilter: 'blur(12px)', borderBottom: '1px solid rgba(0,0,0,0.05)', padding: '0 32px', height: '72px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #10B981, #34D399)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }}>🧭</div>
          <div>
            <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: '20px', color: '#047857', letterSpacing: '0.5px' }}>Explorer Hub</div>
            <div style={{ fontSize: '12px', color: '#64748b', fontWeight: 700, letterSpacing: '1px', textTransform: 'uppercase' }}>Classes 6-8</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <div style={{ background: 'white', border: '2px solid #e2e8f0', borderRadius: '99px', padding: '6px 16px', display: 'flex', alignItems: 'center', gap: '16px', fontWeight: 800, fontSize: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.02)' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#8b5cf6' }}>⭐ LVL {level}</span>
            <div style={{ width: '1px', height: '16px', background: '#e2e8f0' }}></div>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#f59e0b' }}>⚡ {xp} XP</span>
          </div>
          <button onClick={logout} style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'white', border: '2px solid #e2e8f0', borderRadius: '99px', padding: '6px 16px', color: '#0f172a', fontWeight: 700, fontSize: '14px', cursor: 'pointer', transition: 'all 0.2s' }}>
            <span style={{ fontSize: '18px' }}>{user.avatar || '🧑‍🚀'}</span> {user.name.split(' ')[0]}
          </button>
        </div>
      </nav>

      <div style={{ maxWidth: '1200px', margin: '40px auto 0', padding: '0 32px', display: 'grid', gridTemplateColumns: '1fr 380px', gap: '32px' }}>
        
        {/* Left Column (Main Content) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
          
          {/* Welcome Banner */}
          <div style={{ background: 'linear-gradient(135deg, #3b82f6, #2dd4bf)', borderRadius: '24px', padding: '40px', color: 'white', position: 'relative', overflow: 'hidden', boxShadow: '0 20px 40px rgba(59, 130, 246, 0.2)' }}>
            <div style={{ position: 'absolute', right: '-20px', top: '-20px', opacity: 0.2, fontSize: '200px', filter: 'blur(4px)' }}>🪐</div>
            <div style={{ position: 'relative', zIndex: 1, maxWidth: '600px' }}>
              <div style={{ display: 'inline-block', background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(4px)', padding: '6px 14px', borderRadius: '99px', fontSize: '13px', fontWeight: 800, letterSpacing: '1px', marginBottom: '16px' }}>
                🚀 DAILY MISSION
              </div>
              <h2 style={{ fontFamily: "'Fredoka One', cursive", fontSize: '36px', margin: '0 0 16px', lineHeight: 1.2 }}>Ready to explore the galaxy of knowledge, {user.name.split(' ')[0]}?</h2>
              <p style={{ fontSize: '18px', margin: '0 0 24px', opacity: 0.9, fontWeight: 600 }}>Your next Science module is waiting. Let's dive in!</p>
              <button style={{ background: 'white', color: '#2563eb', border: 'none', padding: '14px 28px', borderRadius: '14px', fontSize: '16px', fontWeight: 800, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', transition: 'transform 0.2s', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }} onMouseEnter={e=>e.currentTarget.style.transform='translateY(-2px)'} onMouseLeave={e=>e.currentTarget.style.transform='none'}>
                ▶️ Continue Learning
              </button>
            </div>
          </div>

          {/* Today's Quests */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px' }}>
              <h3 style={{ fontFamily: "'Fredoka One', cursive", fontSize: '22px', margin: 0, color: '#0f172a' }}>🎯 Today's Quests</h3>
              <span style={{ color: '#3b82f6', fontWeight: 700, fontSize: '14px', cursor: 'pointer' }}>View All →</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
              {QUESTS.map(q => (
                <div key={q.id} 
                  style={{ background: 'white', border: '2px solid #e2e8f0', borderRadius: '20px', padding: '20px', position: 'relative', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'pointer', overflow: 'hidden', opacity: q.done ? 0.7 : 1 }}
                  onMouseEnter={e => { if(!q.done) { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = q.color; e.currentTarget.style.boxShadow = `0 12px 24px ${q.color}20`; } }}
                  onMouseLeave={e => { if(!q.done) { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.boxShadow = 'none'; } }}
                  onClick={() => !q.done && setActiveQuest(q.id)}
                >
                  {q.done && <div style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.6)', zIndex: 10, display: 'flex', alignItems: 'center', justifyContent: 'center' }}><div style={{ background: '#10b981', color: 'white', padding: '8px 16px', borderRadius: '99px', fontWeight: 800, fontSize: '14px', boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }}>✓ COMPLETED</div></div>}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: q.bg, color: q.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px' }}>{q.icon}</div>
                    <div style={{ background: '#f8fafc', padding: '4px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: 800, color: '#64748b' }}>{q.duration}</div>
                  </div>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: q.color, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>{q.subject}</div>
                  <div style={{ fontSize: '18px', fontWeight: 800, color: '#0f172a', marginBottom: '8px', lineHeight: 1.3 }}>{q.title}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', paddingTop: '16px', borderTop: '2px dashed #f1f5f9' }}>
                    <div style={{ fontSize: '13px', color: '#64748b', fontWeight: 600 }}>{q.type}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#f59e0b', fontWeight: 800, fontSize: '14px', background: '#fffbeb', padding: '4px 10px', borderRadius: '99px' }}>⚡ +{q.xp}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Learning Models & Quizzes */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
            <div style={{ background: 'white', borderRadius: '24px', padding: '24px', border: '2px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{ fontSize: '24px', background: '#fef2f2', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🧠</div>
                <h3 style={{ fontFamily: "'Fredoka One', cursive", fontSize: '18px', margin: 0, color: '#0f172a' }}>Learning Models</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {['Interactive Human Heart', 'Physics: Gravity Simulator', 'Chemical Bonds Matcher'].map((m,i) => (
                  <div key={i} onClick={() => alert(`Opening 3D Model: ${m}`)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px', background: '#f8fafc', borderRadius: '16px', cursor: 'pointer', transition: 'all 0.2s' }} onMouseEnter={e=>e.currentTarget.style.background='#f1f5f9'} onMouseLeave={e=>e.currentTarget.style.background='#f8fafc'}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontSize: '20px' }}>{['🫀','🍎','🧪'][i]}</span>
                      <span style={{ fontWeight: 700, fontSize: '15px' }}>{m}</span>
                    </div>
                    <span style={{ color: '#64748b', fontSize: '18px' }}>→</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: 'white', borderRadius: '24px', padding: '24px', border: '2px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                <div style={{ fontSize: '24px', background: '#e0e7ff', width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📝</div>
                <h3 style={{ fontFamily: "'Fredoka One', cursive", fontSize: '18px', margin: 0, color: '#0f172a' }}>Pop Quizzes</h3>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', fontWeight: 700 }}>
                    <span>History: Ancient Egypt</span>
                    <span style={{ color: '#8b5cf6' }}>8/10 Correct</span>
                  </div>
                  <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '99px' }}><div style={{ height: '100%', width: '80%', background: '#8b5cf6', borderRadius: '99px' }}></div></div>
                </div>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '14px', fontWeight: 700 }}>
                    <span>Science: Plant Cells</span>
                    <span style={{ color: '#f59e0b' }}>To Do</span>
                  </div>
                  <button onClick={() => alert('Launching Pop Quiz Module...')} style={{ width: '100%', padding: '10px', borderRadius: '10px', border: '2px dashed #cbd5e1', background: 'transparent', color: '#64748b', fontWeight: 700, cursor: 'pointer' }}>Start Quiz (5 mins)</button>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column (Sidebar) */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Sparky AI Tutor Widget */}
          <div style={{ background: 'white', border: '2px solid #fca5a5', borderRadius: '24px', padding: '24px', position: 'relative', overflow: 'hidden', boxShadow: '0 10px 30px rgba(239, 68, 68, 0.1)' }}>
            <div style={{ position: 'absolute', top: '-10px', right: '-10px', width: '100px', height: '100px', background: '#fef2f2', borderRadius: '50%', zIndex: 0 }}></div>
            <div style={{ position: 'relative', zIndex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ fontSize: '40px', filter: 'drop-shadow(0 4px 6px rgba(0,0,0,0.1))' }}>🤖</div>
                <div>
                  <h3 style={{ fontFamily: "'Fredoka One', cursive", fontSize: '20px', margin: 0, color: '#ef4444' }}>Sparky AI Tutor</h3>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: '#f87171' }}>ONLINE NOW</div>
                </div>
              </div>
              <div style={{ background: '#f9fafb', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '16px', fontSize: '14px', color: '#334155', lineHeight: 1.6, marginBottom: '16px', fontStyle: 'italic', position: 'relative' }}>
                <div style={{ position: 'absolute', top: '-6px', left: '20px', width: '12px', height: '12px', background: '#f9fafb', borderTop: '1px solid #e2e8f0', borderLeft: '1px solid #e2e8f0', transform: 'rotate(45deg)' }}></div>
                "Hi {user.name.split(' ')[0]}! I noticed you did great on the Grammar Ninja game. Do you want to try an advanced vocabulary challenge today?"
              </div>
              <Link to="/school/sparky-chat" style={{ textDecoration: 'none' }}>
                <button style={{ width: '100%', background: '#ef4444', color: 'white', border: 'none', padding: '14px', borderRadius: '14px', fontSize: '15px', fontWeight: 800, cursor: 'pointer', transition: 'background 0.2s' }} onMouseEnter={e=>e.target.style.background='#dc2626'} onMouseLeave={e=>e.target.style.background='#ef4444'}>
                  Chat with Sparky 💬
                </button>
              </Link>
            </div>
          </div>

          {/* Mood Check-in */}
          <div style={{ background: 'white', border: '2px solid #e2e8f0', borderRadius: '24px', padding: '24px', textAlign: 'center' }}>
            <h3 style={{ fontFamily: "'Fredoka One', cursive", fontSize: '18px', margin: '0 0 8px', color: '#0f172a' }}>How are you feeling?</h3>
            <p style={{ fontSize: '13px', color: '#64748b', margin: '0 0 20px', fontWeight: 600 }}>Check in daily for bonus XP!</p>
            {student?.moodToday ? (
              <div style={{ animation: 'bounce 0.5s ease' }}>
                <div style={{ fontSize: '64px', margin: '16px 0', filter: 'drop-shadow(0 10px 15px rgba(0,0,0,0.1))' }}>{['', '😰', '😢', '😐', '😊', '🤩'][student.moodToday]}</div>
                <div style={{ background: '#ecfdf5', color: '#10b981', display: 'inline-block', padding: '6px 16px', borderRadius: '99px', fontSize: '14px', fontWeight: 800 }}>+15 XP Earned!</div>
              </div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
                {['😢', '😐', '😊', '🤩'].map((m, i) => (
                  <button key={i} onClick={() => moodCheckIn(i + 2)} style={{ fontSize: '32px', background: 'transparent', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }} onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.2) translateY(-4px)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}>{m}</button>
                ))}
              </div>
            )}
          </div>

          {/* Subject Mastery Progress */}
          <div style={{ background: 'white', border: '2px solid #e2e8f0', borderRadius: '24px', padding: '24px' }}>
            <h3 style={{ fontFamily: "'Fredoka One', cursive", fontSize: '18px', margin: '0 0 20px', color: '#0f172a' }}>Subject Mastery 📈</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {[
                { subj: 'Mathematics', val: 78, color: '#3b82f6' },
                { subj: 'Science', val: 92, color: '#10b981' },
                { subj: 'English Lit.', val: 65, color: '#f59e0b' }
              ].map((s,i) => (
                <div key={i}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '13px', fontWeight: 800 }}>
                    <span style={{ color: '#334155' }}>{s.subj}</span>
                    <span style={{ color: s.color }}>{s.val}%</span>
                  </div>
                  <div style={{ height: '10px', background: '#f1f5f9', borderRadius: '99px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${s.val}%`, background: s.color, borderRadius: '99px' }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
      
      {/* Quest Modal Overlay (Mockly implemented) */}
      {activeQuest && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.8)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', backdropFilter: 'blur(8px)' }} onClick={() => setActiveQuest(null)}>
          <div style={{ background: 'white', borderRadius: '32px', padding: '48px', maxWidth: '600px', width: '90%', textAlign: 'center', position: 'relative' }} onClick={e=>e.stopPropagation()}>
            <button onClick={() => setActiveQuest(null)} style={{ position: 'absolute', top: '24px', right: '24px', background: '#f1f5f9', border: 'none', width: '40px', height: '40px', borderRadius: '50%', fontSize: '20px', cursor: 'pointer', fontWeight: 800, color: '#64748b' }}>×</button>
            <div style={{ fontSize: '80px', marginBottom: '24px' }}>🎮</div>
            <h2 style={{ fontFamily: "'Fredoka One', cursive", fontSize: '32px', color: '#0f172a', margin: '0 0 16px' }}>Loading Interface...</h2>
            <p style={{ fontSize: '18px', color: '#64748b', marginBottom: '32px', lineHeight: 1.6 }}>Initializing the interactive learning environment. Get ready for your mission!</p>
            <div style={{ width: '48px', height: '48px', border: '6px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto' }}></div>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          </div>
        </div>
      )}
    </div>
  );
}
