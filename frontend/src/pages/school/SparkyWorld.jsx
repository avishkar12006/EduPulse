import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import API from '../../utils/api';

export default function SparkyWorld() {
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
    setStudent({ ...student, moodToday: moodVal, xpPoints: (student.xpPoints || 0) + 10 });
  };

  const xp = student?.xpPoints || 0;
  const level = student?.level || 1;

  if (loading) return <div style={{ background: '#FFD700', minHeight: '100vh' }}></div>;

  return (
    <div style={{ minHeight: '100vh', background: '#FFD700', fontFamily: "'Fredoka One', cursive", color: '#0A1628', overflow: 'hidden' }}>
      {/* Fun Navbar */}
      <nav style={{ background: 'white', padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '4px solid #F59E0B', borderRadius: '0 0 24px 24px', position: 'relative', zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ fontSize: '32px' }}>🤖</div>
          <h1 style={{ margin: 0, color: '#F59E0B', fontSize: '24px' }}>Sparky's World</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ background: '#FEF3C7', border: '3px solid #F59E0B', borderRadius: '99px', padding: '8px 16px', display: 'flex', gap: '10px' }}>
            <span style={{ color: '#D97706' }}>⭐ {level}</span>
            <span style={{ color: '#D97706' }}>⚡ {xp} XP</span>
          </div>
          <button onClick={logout} style={{ background: '#EF4444', border: 'none', borderRadius: '99px', padding: '10px 20px', color: 'white', fontFamily: "'Fredoka One', cursive", fontSize: '16px', cursor: 'pointer', boxShadow: '0 4px 0 #B91C1C' }}>Bye! 👋</button>
        </div>
      </nav>

      <div style={{ maxWidth: '1000px', margin: '40px auto', padding: '0 24px', display: 'flex', flexDirection: 'column', gap: '40px' }}>
        {/* Welcome Banner */}
        <div style={{ background: 'white', borderRadius: '32px', padding: '32px', textAlign: 'center', border: '4px solid #00BFFF', boxShadow: '0 12px 0 rgba(0,191,255,0.4)', position: 'relative' }}>
          <div style={{ fontSize: '100px', position: 'absolute', top: '-60px', left: '50%', transform: 'translateX(-50%)', animation: 'bounce-emoji 2s infinite' }}>{user.avatar || '👦'}</div>
          <h2 style={{ fontSize: '36px', color: '#00BFFF', marginTop: '40px', marginBottom: '16px' }}>Hi {user.name.split(' ')[0]}!</h2>
          <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: '20px', fontWeight: 800, color: '#4B5563', margin: 0 }}>Ready for a fun day of learning?</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px' }}>
          <div style={{ background: '#FEF08A', borderRadius: '32px', padding: '24px', border: '4px solid #EAB308', boxShadow: '0 8px 0 #CA8A04', textAlign: 'center' }}>
            <h3 style={{ fontSize: '24px', color: '#854D0E', margin: '0 0 16px' }}>How are you?</h3>
            {student?.moodToday ? (
              <div style={{ fontSize: '64px', animation: 'spin 1s ease-in-out' }}>{['', '😰', '😢', '😐', '😊', '🤩'][student.moodToday]}</div>
            ) : (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '20px' }}>
                {['😢', '😐', '😊', '🤩'].map((m, i) => (
                  <button key={i} onClick={() => moodCheckIn(i + 2)} style={{ fontSize: '40px', background: 'white', border: '3px solid #EAB308', borderRadius: '50%', width: '60px', height: '60px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s' }} onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.2)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}>{m}</button>
                ))}
              </div>
            )}
            <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: '14px', fontWeight: 800, color: '#A16207', marginTop: '16px' }}>+10 XP for telling me!</p>
          </div>

          {/* Sparky Chat Button */}
          <Link to="/school/sparky-chat" style={{ textDecoration: 'none' }}>
            <div style={{ background: '#BAE6FD', height: '100%', borderRadius: '32px', padding: '24px', border: '4px solid #38BDF8', boxShadow: '0 8px 0 #0284C7', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'transform 0.2s' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}>
              <div style={{ fontSize: '64px', marginBottom: '12px' }}>🤖💬</div>
              <h3 style={{ fontSize: '24px', color: '#0369A1', margin: 0 }}>Talk to Sparky!</h3>
            </div>
          </Link>

          {/* Daily Games Button */}
          <div onClick={() => alert('Opening today\'s learning games...')} style={{ background: '#A7F3D0', height: '100%', borderRadius: '32px', padding: '24px', border: '4px solid #34D399', boxShadow: '0 8px 0 #059669', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', transition: 'transform 0.2s' }} onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; }} onMouseLeave={e => { e.currentTarget.style.transform = 'none'; }}>
            <div style={{ fontSize: '64px', marginBottom: '12px' }}>🎮🧩</div>
            <h3 style={{ fontSize: '24px', color: '#047857', margin: 0 }}>Play & Learn!</h3>
          </div>
        </div>

        {/* Badges Box */}
        <div style={{ background: 'white', borderRadius: '32px', padding: '24px', border: '4px solid #A855F7', boxShadow: '0 12px 0 #7E22CE' }}>
          <h3 style={{ fontSize: '28px', color: '#7E22CE', margin: '0 0 20px', textAlign: 'center' }}>My Badges 🏆</h3>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {(student?.badges || []).length === 0 ? (
              <p style={{ fontFamily: "'Nunito', sans-serif", fontSize: '18px', fontWeight: 800, color: '#9CA3AF' }}>Answer questions to get badges!</p>
            ) : (
              student.badges.map((b, i) => (
                <div key={i} style={{ width: '80px', height: '80px', background: '#F3E8FF', border: '3px solid #D8B4FE', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px' }} title={b.name}>{b.icon}</div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
