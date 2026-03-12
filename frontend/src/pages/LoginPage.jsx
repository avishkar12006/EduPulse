import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// School class → route mapping
const SCHOOL_ROUTES = { 3: '/school/sparky-world', 4: '/school/sparky-world', 5: '/school/sparky-world', 6: '/school/explorer', 7: '/school/explorer', 8: '/school/explorer', 9: '/school/career-command', 10: '/school/career-command', 11: '/school/career-command', 12: '/school/career-command' };

const USER_TYPES = [
  { id: 'college_student', label: 'College Student', emoji: '🎓', color: '#38bdf8', redirect: '/student', demo: { email: 'aarav@demo.com', password: 'demo123' } },
  { id: 'school_student',  label: 'School Student',  emoji: '🏫', color: '#34d399', redirect: '/school/explorer', demo: { email: 'riya@demo.com', password: 'demo123' } },
  { id: 'parent',          label: 'Parent',          emoji: '👨‍👩‍👧', color: '#fb923c', redirect: '/parent', demo: { email: 'parent@demo.com', password: 'demo123' } },
  { id: 'scm',             label: 'SCM / Teacher',   emoji: '👩‍🏫', color: '#a78bfa', redirect: '/scm',   demo: { email: 'scm@demo.com', password: 'demo123' } },
  { id: 'admin',           label: 'Admin',           emoji: '🛡️', color: '#f472b6', redirect: '/admin', demo: { email: 'admin@demo.com', password: 'demo123' } },
];

const ROLE_REDIRECT = { college_student: '/student', parent: '/parent', scm: '/scm', admin: '/admin', school_student: '/school/explorer' };

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, user } = useAuth();
  const [selectedType, setSelectedType] = useState('college_student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [demoFilled, setDemoFilled] = useState(false);

  // If already logged in, redirect
  useEffect(() => {
    if (user) navigate(ROLE_REDIRECT[user.role] || '/student', { replace: true });
  }, [user]);

  const currentType = USER_TYPES.find(t => t.id === selectedType);

  const fillDemo = () => {
    const d = currentType.demo;
    setEmail(d.email || '');
    setPassword(d.password || '');
    setDemoFilled(true);
    setTimeout(() => setDemoFilled(false), 2500);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const loggedUser = await login({ email, password, role: selectedType });
      // Redirect based on actual DB/demo role
      if (loggedUser.role === 'school_student') {
        const cls = loggedUser.studentData?.class || 7;
        navigate(SCHOOL_ROUTES[cls] || '/school/explorer', { replace: true });
      } else {
        navigate(ROLE_REDIRECT[loggedUser.role] || '/student', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Login failed. Please try the demo credentials.');
    } finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: '#020617', fontFamily: "'Inter', sans-serif", color: '#f8fafc', overflow: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Space+Mono&display=swap');
        * { box-sizing: border-box; }
        input:focus { outline: none; }
        .type-btn { transition: all 0.25s ease; }
        .type-btn:hover { transform: translateY(-2px); }
        .submit-btn { transition: all 0.2s ease; }
        .submit-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(56,189,248,0.35); }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-20px)} }
        @keyframes pulse-ring { 0%{transform:scale(1);opacity:0.5} 100%{transform:scale(1.5);opacity:0} }
        @keyframes slide-up { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .card-in { animation: slide-up 0.4s ease both; }
      `}</style>

      {/* ── LEFT: HERO ─────────────────────── */}
      <div style={{ width: '48%', position: 'relative', background: 'linear-gradient(145deg, #0c1836 0%, #020617 60%, #0c0820 100%)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 48px', overflow: 'hidden' }}>
        {/* Glow orbs */}
        <div style={{ position: 'absolute', top: '20%', left: '30%', width: '300px', height: '300px', background: `radial-gradient(circle, ${currentType.color}22, transparent 70%)`, borderRadius: '50%', transition: 'all 0.6s ease' }} />
        <div style={{ position: 'absolute', bottom: '20%', right: '20%', width: '200px', height: '200px', background: 'radial-gradient(circle, #8b5cf633, transparent 70%)', borderRadius: '50%' }} />

        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '64px', position: 'relative', zIndex: 1 }}>
          <div style={{ width: '36px', height: '36px', background: `linear-gradient(135deg, ${currentType.color}, #3b82f6)`, borderRadius: '10px', boxShadow: `0 0 20px ${currentType.color}66`, transition: 'all 0.4s' }} />
          <span style={{ fontSize: '22px', fontWeight: 800, letterSpacing: '-0.5px', transition: 'all 0.4s' }}>EduPulse</span>
          <span style={{ fontSize: '11px', background: 'rgba(255,255,255,0.1)', padding: '2px 8px', borderRadius: '99px', color: 'rgba(255,255,255,0.5)', letterSpacing: '1px' }}>NEP 2020</span>
        </div>

        {/* Big emoji */}
        <div style={{ fontSize: '120px', filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.4))', animation: 'float 4s ease-in-out infinite', position: 'relative', zIndex: 1, marginBottom: '40px', transition: 'all 0.3s' }}>
          {currentType.emoji}
        </div>

        <h1 style={{ fontSize: '38px', fontWeight: 800, textAlign: 'center', lineHeight: 1.15, margin: '0 0 16px', position: 'relative', zIndex: 1, letterSpacing: '-1px' }}>
          Know Every Student.<br/>
          <span style={{ background: `linear-gradient(90deg, ${currentType.color}, #a78bfa)`, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', transition: 'all 0.4s' }}>
            Guide Every Future.
          </span>
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.45)', textAlign: 'center', fontSize: '15px', lineHeight: 1.6, position: 'relative', zIndex: 1, maxWidth: '380px' }}>
          AI-powered early warning system reducing student dropout by 40% — NEP 2020 & SDG aligned.
        </p>

        {/* Stats */}
        <div style={{ display: 'flex', gap: '24px', marginTop: '48px', position: 'relative', zIndex: 1, flexWrap: 'wrap', justifyContent: 'center' }}>
          {[['250M+','Students'], ['40%','Dropout ↓'], ['5','Dashboards']].map(([v,l]) => (
            <div key={l} style={{ textAlign: 'center' }}>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '24px', fontWeight: 700, color: currentType.color, transition: 'color 0.4s' }}>{v}</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.35)', letterSpacing: '0.5px', marginTop: '2px' }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── RIGHT: LOGIN FORM ──────────────── */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 48px', background: '#030712' }}>
        <div className="card-in" style={{ width: '100%', maxWidth: '460px' }}>
          <h2 style={{ fontSize: '28px', fontWeight: 700, marginBottom: '8px', letterSpacing: '-0.5px' }}>Sign in</h2>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', marginBottom: '32px' }}>
            Select your role and use demo credentials to explore.
          </p>

          {/* Role selector */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '28px' }}>
            {USER_TYPES.map(t => (
              <button key={t.id} className="type-btn"
                onClick={() => { setSelectedType(t.id); setEmail(''); setPassword(''); setDemoFilled(false); }}
                style={{
                  padding: '12px 10px', borderRadius: '10px', cursor: 'pointer', fontFamily: "'Inter', sans-serif",
                  border: `1.5px solid ${selectedType === t.id ? t.color : 'rgba(255,255,255,0.07)'}`,
                  background: selectedType === t.id ? `${t.color}18` : 'rgba(255,255,255,0.03)',
                  color: selectedType === t.id ? t.color : 'rgba(255,255,255,0.5)',
                  fontSize: '13px', fontWeight: 600, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px',
                  transition: 'all 0.2s ease'
                }}>
                <span style={{ fontSize: '22px' }}>{t.emoji}</span>
                <span>{t.label}</span>
              </button>
            ))}
          </div>

          {/* Demo fill button */}
          <button onClick={fillDemo}
            style={{
              width: '100%', marginBottom: '20px', padding: '12px', borderRadius: '10px',
              border: `1px dashed ${demoFilled ? '#10b981' : 'rgba(255,255,255,0.2)'}`,
              background: demoFilled ? 'rgba(16,185,129,0.1)' : 'transparent',
              color: demoFilled ? '#10b981' : 'rgba(255,255,255,0.6)',
              fontFamily: "'Inter', sans-serif", fontSize: '14px', fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.3s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
            }}>
            {demoFilled ? '✅ Demo credentials loaded!' : `⚡ Load ${currentType.label} Demo Credentials`}
          </button>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>EMAIL</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={currentType.demo?.email || 'email@example.com'} required
                style={{ width: '100%', padding: '14px 16px', background: 'rgba(255,255,255,0.04)', border: `1.5px solid ${email ? `${currentType.color}66` : 'rgba(255,255,255,0.08)'}`, borderRadius: '10px', color: '#f8fafc', fontSize: '14px', fontFamily: "'Inter', sans-serif", transition: 'border 0.2s' }}
              />
            </div>
            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '12px', fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: '0.5px', display: 'block', marginBottom: '8px' }}>PASSWORD</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" required
                style={{ width: '100%', padding: '14px 16px', background: 'rgba(255,255,255,0.04)', border: `1.5px solid ${password ? `${currentType.color}66` : 'rgba(255,255,255,0.08)'}`, borderRadius: '10px', color: '#f8fafc', fontSize: '14px', fontFamily: "'Inter', sans-serif", transition: 'border 0.2s' }}
              />
            </div>

            {error && (
              <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '12px 14px', color: '#f87171', fontSize: '13px', marginBottom: '16px' }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} className="submit-btn"
              style={{ width: '100%', padding: '15px', borderRadius: '10px', border: 'none', background: `linear-gradient(135deg, ${currentType.color}, #3b82f6)`, color: '#fff', fontSize: '15px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: "'Inter', sans-serif", opacity: loading ? 0.7 : 1, transition: 'all 0.2s', boxShadow: `0 4px 16px ${currentType.color}44` }}>
              {loading ? '⏳ Signing in...' : `Sign in as ${currentType.label}`}
            </button>
          </form>

          {/* Demo accounts quick info */}
          <div style={{ marginTop: '32px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '12px', padding: '16px' }}>
            <div style={{ fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.3)', letterSpacing: '1px', marginBottom: '10px' }}>DEMO ACCOUNTS</div>
            {USER_TYPES.map(t => (
              <div key={t.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px', color: selectedType === t.id ? t.color : 'rgba(255,255,255,0.35)', fontWeight: selectedType === t.id ? 700 : 400, transition: 'all 0.2s' }}>
                <span>{t.emoji} {t.label}</span>
                <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '11px' }}>{t.demo?.email}</span>
              </div>
            ))}
            <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.2)', marginTop: '8px' }}>All passwords: <span style={{ color: 'rgba(255,255,255,0.4)', fontFamily: "'Space Mono'" }}>demo123</span></div>
          </div>

          <p style={{ textAlign: 'center', marginTop: '24px', fontSize: '13px', color: 'rgba(255,255,255,0.3)' }}>
            <Link to="/" style={{ color: 'rgba(255,255,255,0.4)', textDecoration: 'none' }}>← Back to Landing Page</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
