import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

// ── Constants ──────────────────────────────────────────────────────────────

const ROLE_OPTIONS = [
  { id: 'college_student', label: 'College Student', emoji: '🎓', color: '#38bdf8', redirect: '/student' },
  { id: 'school_student',  label: 'School Student',  emoji: '🏫', color: '#34d399', redirect: '/school/explorer' },
  { id: 'parent',          label: 'Parent',          emoji: '👨‍👩‍👧', color: '#fb923c', redirect: '/parent' },
  { id: 'scm',             label: 'SCM / Teacher',   emoji: '👩‍🏫', color: '#a78bfa', redirect: '/scm' },
  { id: 'admin',           label: 'Admin',           emoji: '🛡️',  color: '#f472b6', redirect: '/admin' },
];

const SCHOOL_ROUTES = {
  3: '/school/sparky-world', 4: '/school/sparky-world', 5: '/school/sparky-world',
  6: '/school/explorer', 7: '/school/explorer', 8: '/school/explorer',
  9: '/school/career-command', 10: '/school/career-command', 11: '/school/career-command', 12: '/school/career-command',
};

const ROLE_REDIRECT = {
  college_student: '/student', parent: '/parent', scm: '/scm', admin: '/admin', school_student: '/school/explorer',
};

const ADMIN_ONLY_ROLES = ['admin', 'scm'];

// ── Password strength ──────────────────────────────────────────────────────

function getStrength(pw) {
  if (!pw) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pw.length >= 6)  score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { score, label: 'Weak',   color: '#ef4444' };
  if (score <= 3) return { score, label: 'Medium', color: '#f59e0b' };
  return              { score, label: 'Strong',  color: '#10b981' };
}

// ── Eye icon (SVG) ─────────────────────────────────────────────────────────

function EyeIcon({ open }) {
  return open ? (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ) : (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  );
}

// ── Forgot-password panel (3-step inline) ──────────────────────────────────

function ForgotPasswordPanel({ onClose, onSuccess, theme }) {
  const { forgotPassword, resetPassword } = useAuth();
  const [step, setStep] = useState(1); // 1=email, 2=otp, 3=newpw
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [err, setErr] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const { text, textMuted, inputBg, inputBorder, border, cardBg } = theme;

  const inputStyle = {
    width: '100%', padding: '11px 14px', background: inputBg,
    border: `1px solid ${inputBorder}`, borderRadius: '10px',
    color: text, fontSize: '14px', fontFamily: "'Inter', sans-serif",
    outline: 'none',
  };

  async function handleStep1(e) {
    e.preventDefault();
    setErr(''); setBusy(true);
    try {
      await forgotPassword(email);
      setMsg('OTP sent! Check your inbox (or backend console in dev mode).');
      setStep(2);
    } catch (ex) {
      setErr(ex.message);
    } finally { setBusy(false); }
  }

  async function handleStep2(e) {
    e.preventDefault();
    if (otp.length !== 6) { setErr('OTP must be 6 digits.'); return; }
    setErr('');
    setStep(3);
  }

  async function handleStep3(e) {
    e.preventDefault();
    if (newPw !== confirmPw) { setErr('Passwords do not match.'); return; }
    if (newPw.length < 6)   { setErr('Password must be at least 6 characters.'); return; }
    setErr(''); setBusy(true);
    try {
      const data = await resetPassword(email, otp, newPw);
      onSuccess(data);
    } catch (ex) {
      setErr(ex.message);
      setBusy(false);
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, backdropFilter: 'blur(4px)' }}>
      <div style={{ background: cardBg, borderRadius: '20px', padding: '36px', width: '100%', maxWidth: '420px', border: `1px solid ${border}`, boxShadow: '0 24px 60px rgba(0,0,0,0.4)' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <div style={{ fontSize: '20px', fontWeight: 800, color: text }}>
              {step === 1 ? '🔑 Forgot Password' : step === 2 ? '📩 Enter OTP' : '🔒 New Password'}
            </div>
            <div style={{ fontSize: '12px', color: textMuted, marginTop: '4px' }}>Step {step} of 3</div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: textMuted, cursor: 'pointer', fontSize: '22px', lineHeight: 1 }}>×</button>
        </div>

        {/* Progress dots */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px' }}>
          {[1,2,3].map(s => (
            <div key={s} style={{ flex: 1, height: '4px', borderRadius: '99px', background: s <= step ? '#38bdf8' : 'rgba(255,255,255,0.1)', transition: 'background 0.3s' }} />
          ))}
        </div>

        {msg && <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '8px', padding: '10px 12px', marginBottom: '14px', fontSize: '13px', color: '#10b981' }}>✅ {msg}</div>}
        {err && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '10px 12px', marginBottom: '14px', fontSize: '13px', color: '#ef4444' }}>⚠️ {err}</div>}

        {step === 1 && (
          <form onSubmit={handleStep1}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: textMuted, display: 'block', marginBottom: '6px' }}>Registered Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com" style={{ ...inputStyle, marginBottom: '20px' }} />
            <button type="submit" disabled={busy} style={{ width: '100%', padding: '13px', background: 'linear-gradient(135deg,#38bdf8,#2563eb)', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '15px', fontWeight: 700, cursor: busy ? 'not-allowed' : 'pointer', opacity: busy ? 0.7 : 1 }}>
              {busy ? '⏳ Sending…' : '→ Send OTP'}
            </button>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleStep2}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: textMuted, display: 'block', marginBottom: '6px' }}>6-Digit OTP</label>
            <input type="text" required maxLength={6} value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="123456" style={{ ...inputStyle, letterSpacing: '6px', fontSize: '22px', textAlign: 'center', marginBottom: '20px' }} />
            <button type="submit" style={{ width: '100%', padding: '13px', background: 'linear-gradient(135deg,#38bdf8,#2563eb)', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '15px', fontWeight: 700, cursor: 'pointer' }}>
              → Verify OTP
            </button>
            <button type="button" onClick={() => { setMsg(''); handleStep1({ preventDefault: () => {} }); }}
              style={{ marginTop: '10px', width: '100%', padding: '10px', background: 'none', border: `1px solid ${border}`, borderRadius: '10px', color: textMuted, fontSize: '13px', cursor: 'pointer' }}>
              Resend OTP
            </button>
          </form>
        )}

        {step === 3 && (
          <form onSubmit={handleStep3}>
            <label style={{ fontSize: '12px', fontWeight: 600, color: textMuted, display: 'block', marginBottom: '6px' }}>New Password</label>
            <div style={{ position: 'relative', marginBottom: '14px' }}>
              <input type={showPw ? 'text' : 'password'} required value={newPw} onChange={e => setNewPw(e.target.value)}
                placeholder="Min 6 characters" style={{ ...inputStyle, paddingRight: '46px' }} />
              <button type="button" onClick={() => setShowPw(!showPw)}
                style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: textMuted, cursor: 'pointer', display: 'flex' }}>
                <EyeIcon open={showPw} />
              </button>
            </div>
            <label style={{ fontSize: '12px', fontWeight: 600, color: textMuted, display: 'block', marginBottom: '6px' }}>Confirm New Password</label>
            <input type={showPw ? 'text' : 'password'} required value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
              placeholder="••••••••" style={{ ...inputStyle, marginBottom: '20px' }} />
            <button type="submit" disabled={busy} style={{ width: '100%', padding: '13px', background: 'linear-gradient(135deg,#38bdf8,#2563eb)', border: 'none', borderRadius: '10px', color: '#fff', fontSize: '15px', fontWeight: 700, cursor: busy ? 'not-allowed' : 'pointer', opacity: busy ? 0.7 : 1 }}>
              {busy ? '⏳ Resetting…' : '→ Reset & Sign In'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

// ── Main Login Page ────────────────────────────────────────────────────────

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, register, user } = useAuth();
  const { isDark, toggle } = useTheme();

  const [tab, setTab] = useState('login');
  const [selectedRole, setSelectedRole] = useState('college_student');
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    department: '', institution: '', class: '',
  });
  const [showPw, setShowPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [showForgot, setShowForgot] = useState(false);

  useEffect(() => {
    if (user) navigate(ROLE_REDIRECT[user.role] || '/student', { replace: true });
  }, [user, navigate]);

  const currentRole = ROLE_OPTIONS.find(r => r.id === selectedRole);
  const update = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));
  const strength = getStrength(form.password);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const loggedUser = await login({ email: form.email, password: form.password }, rememberMe);
      if (loggedUser.role === 'school_student') {
        const cls = loggedUser.studentData?.class || 7;
        navigate(SCHOOL_ROUTES[cls] || '/school/explorer', { replace: true });
      } else {
        navigate(ROLE_REDIRECT[loggedUser.role] || '/student', { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Login failed. Check your credentials.');
    } finally { setLoading(false); }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);

    if (ADMIN_ONLY_ROLES.includes(selectedRole)) {
      setError('Admin and SCM accounts must be created by your institution administrator.');
      setLoading(false); return;
    }
    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.'); setLoading(false); return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.'); setLoading(false); return;
    }

    try {
      const payload = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: selectedRole,
        institution: form.institution || 'EduPulse Institution',
        department: form.department || '',
        class: form.class || '',
        language: 'en',
      };
      const registered = await register(payload, rememberMe);
      setSuccess(`Welcome, ${registered.name}! Redirecting…`);
      setTimeout(() => {
        if (registered.role === 'school_student')
          navigate(SCHOOL_ROUTES[registered.studentData?.class || 7] || '/school/explorer', { replace: true });
        else
          navigate(ROLE_REDIRECT[registered.role] || '/student', { replace: true });
      }, 1200);
    } catch (err) {
      setError(err.message || 'Registration failed. Try a different email.');
    } finally { setLoading(false); }
  };

  const handleForgotSuccess = useCallback((data) => {
    setShowForgot(false);
    setSuccess(`Welcome back, ${data.name}! Your password has been reset.`);
    setTimeout(() => {
      navigate(ROLE_REDIRECT[data.role] || '/student', { replace: true });
    }, 1500);
  }, [navigate]);

  // ── Theme vars ────────────────────────────────────────────────────────────
  const bg        = isDark ? '#020617' : '#f1f5f9';
  const cardBg    = isDark ? 'rgba(15,23,42,0.85)' : 'rgba(255,255,255,0.93)';
  const text      = isDark ? '#f8fafc' : '#0f172a';
  const textMuted = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.4)';
  const border    = isDark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.1)';
  const inputBg   = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';
  const inputBorder = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.14)';
  const lhero     = isDark
    ? 'linear-gradient(145deg,#0c1836,#020617 60%,#0c0820)'
    : 'linear-gradient(145deg,#dbeafe,#ede9fe 60%,#d1fae5)';

  const themeVars = { text, textMuted, border, inputBg, inputBorder, cardBg };

  const inputStyle = {
    width: '100%', padding: '12px 14px', paddingRight: '46px',
    background: inputBg, border: `1px solid ${inputBorder}`,
    borderRadius: '10px', color: text,
    fontSize: '14px', fontFamily: "'Inter', sans-serif",
    outline: 'none', transition: 'border-color 0.2s',
  };

  const isAdminRoleSelected = ADMIN_ONLY_ROLES.includes(selectedRole);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: bg, fontFamily: "'Inter', sans-serif", color: text, overflow: 'hidden' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        .lp-input:focus { border-color: ${currentRole.color} !important; box-shadow: 0 0 0 3px ${currentRole.color}22; }
        .role-btn { transition: transform 0.2s, box-shadow 0.2s; }
        .role-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.2); }
        .submit-btn:hover:not(:disabled) { transform: translateY(-1px); opacity: 0.92; }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-16px)} }
        @keyframes fadeIn { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.4} }
      `}</style>

      {showForgot && (
        <ForgotPasswordPanel
          onClose={() => setShowForgot(false)}
          onSuccess={handleForgotSuccess}
          theme={themeVars}
        />
      )}

      {/* LEFT — Hero */}
      <div style={{ width: '46%', position: 'relative', background: lhero, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 48px', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: '22%', left: '28%', width: '280px', height: '280px', background: `radial-gradient(circle, ${currentRole.color}25, transparent 70%)`, borderRadius: '50%', transition: 'all 0.6s ease' }} />
        <div style={{ position: 'absolute', bottom: '18%', right: '16%', width: '180px', height: '180px', background: 'radial-gradient(circle, #8b5cf640, transparent 70%)', borderRadius: '50%' }} />

        <div style={{ position: 'relative', zIndex: 2, textAlign: 'center', maxWidth: '380px', animation: 'fadeIn 0.6s ease' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', textDecoration: 'none', marginBottom: '48px' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: `linear-gradient(135deg, ${currentRole.color}, #8b5cf6)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>⚡</div>
            <span style={{ fontSize: '24px', fontWeight: 800, color: isDark ? '#fff' : '#0f172a', letterSpacing: '-0.5px' }}>EduPulse</span>
          </Link>

          <div style={{ fontSize: '64px', marginBottom: '20px', animation: 'float 3s ease-in-out infinite' }}>{currentRole.emoji}</div>
          <h1 style={{ fontSize: '28px', fontWeight: 700, margin: '0 0 12px', color: isDark ? '#fff' : '#0f172a', letterSpacing: '-0.5px' }}>
            {tab === 'login' ? 'Welcome back' : `Join as ${currentRole.label}`}
          </h1>
          <p style={{ fontSize: '15px', color: isDark ? 'rgba(255,255,255,0.55)' : 'rgba(0,0,0,0.5)', lineHeight: 1.7, margin: 0 }}>
            {tab === 'login'
              ? 'Log in to continue your personalized learning journey with Gemini AI insights.'
              : 'Create your EduPulse account and start your AI-powered academic journey today.'}
          </p>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '36px', padding: '12px', background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)', borderRadius: '12px', border: `1px solid ${isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)'}` }}>
            <span style={{ width: '8px', height: '8px', background: '#10b981', borderRadius: '50%', boxShadow: '0 0 6px #10b981', animation: 'pulse-dot 2s infinite' }} />
            <span style={{ fontSize: '12px', color: isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.4)', fontWeight: 500 }}>
              Secured · MongoDB · Gemini AI · JWT Auth
            </span>
          </div>
        </div>

        <button onClick={toggle} title="Toggle theme"
          style={{ position: 'absolute', top: '24px', right: '24px', width: '40px', height: '40px', borderRadius: '50%', border: `1px solid ${border}`, background: cardBg, cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {isDark ? '☀️' : '🌙'}
        </button>
      </div>

      {/* RIGHT — Form */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 32px', overflowY: 'auto' }}>
        <div style={{ width: '100%', maxWidth: '440px', animation: 'fadeIn 0.5s ease' }}>

          {/* Login / Signup tabs */}
          <div style={{ display: 'flex', background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.05)', borderRadius: '12px', padding: '4px', marginBottom: '28px', border: `1px solid ${border}` }}>
            {['login', 'signup'].map(t => (
              <button key={t} onClick={() => { setTab(t); setError(''); setSuccess(''); }}
                style={{ flex: 1, padding: '10px', border: 'none', borderRadius: '9px', cursor: 'pointer', fontSize: '14px', fontWeight: 600, fontFamily: "'Inter', sans-serif", transition: 'all 0.2s',
                  background: tab === t ? (isDark ? 'rgba(255,255,255,0.09)' : '#fff') : 'transparent',
                  color: tab === t ? currentRole.color : textMuted,
                  boxShadow: tab === t ? '0 2px 8px rgba(0,0,0,0.2)' : 'none',
                }}>
                {t === 'login' ? '🔑 Sign In' : '✨ Sign Up'}
              </button>
            ))}
          </div>

          {/* Role selector */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: textMuted, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: '10px' }}>I am a…</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '8px' }}>
              {ROLE_OPTIONS.map(r => (
                <button key={r.id} className="role-btn" onClick={() => setSelectedRole(r.id)}
                  style={{ padding: '10px 4px', border: `1px solid ${selectedRole === r.id ? r.color : border}`, borderRadius: '10px', background: selectedRole === r.id ? `${r.color}18` : inputBg, cursor: 'pointer', textAlign: 'center' }}>
                  <div style={{ fontSize: '18px', marginBottom: '4px' }}>{r.emoji}</div>
                  <div style={{ fontSize: '10px', fontWeight: 600, color: selectedRole === r.id ? r.color : textMuted, fontFamily: "'Inter', sans-serif", lineHeight: 1.2 }}>{r.label.split(' ')[0]}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Admin/SCM signup block message */}
          {tab === 'signup' && isAdminRoleSelected && (
            <div style={{ background: 'rgba(251,146,60,0.1)', border: '1px solid rgba(251,146,60,0.35)', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
              <div style={{ fontSize: '14px', fontWeight: 700, color: '#fb923c', marginBottom: '6px' }}>🔒 Restricted Role</div>
              <div style={{ fontSize: '13px', color: textMuted, lineHeight: 1.6 }}>
                <strong style={{ color: text }}>{currentRole.label}</strong> accounts are created by institution administrators and cannot be self-registered.<br />
                Please contact your institution admin or use the <button onClick={() => setTab('login')} style={{ background: 'none', border: 'none', color: '#38bdf8', fontWeight: 700, cursor: 'pointer', fontSize: '13px', padding: 0 }}>sign-in page</button> if you already have credentials.
              </div>
            </div>
          )}

          {/* ── QUICK DEMO LOGIN (login tab only) ── */}
          {tab === 'login' && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: textMuted, letterSpacing: '1px', textTransform: 'uppercase', marginBottom: 8 }}>⚡ Quick Demo Login — click any account</div>
              {[
                { heading: '👩‍🏫 Staff', items: [
                  { role:'scm',   label:'SCM / Teacher',  email:'scm@demo.com' },
                  { role:'admin', label:'Admin',           email:'admin@demo.com' },
                ]},
                { heading: '👨‍👩‍👧 Parents', items: [
                  { role:'parent', label:"Aarav's Dad",   email:'parent.aarav@demo.com' },
                  { role:'parent', label:"Priya's Mom",   email:'parent.priya@demo.com' },
                ]},
                { heading: '🎓 College Students', items: [
                  { role:'college_student', label:'Aarav (At-risk, 68%)',    email:'aarav@demo.com' },
                  { role:'college_student', label:'Priya (Top, 94%)',        email:'priya@demo.com' },
                  { role:'college_student', label:'Rohan (Medium)',          email:'rohan@demo.com' },
                  { role:'college_student', label:'Sneha (Recovering)',      email:'sneha@demo.com' },
                  { role:'college_student', label:'Vikram (New)',            email:'vikram@demo.com' },
                ]},
                { heading: '🏫 School Students', items: [
                  { role:'school_student', label:'Aryan - Class 5 (Sparky)',  email:'aryan@demo.com' },
                  { role:'school_student', label:'Anika - Class 4 (Sparky)',  email:'anika@demo.com' },
                  { role:'school_student', label:'Riya - Class 7 (Explorer)', email:'riya@demo.com' },
                  { role:'school_student', label:'Dev - Class 10 (Career)',   email:'dev@demo.com' },
                  { role:'school_student', label:'Kabir - Class 11 (Career)', email:'kabir@demo.com' },
                ]},
              ].map(group => (
                <div key={group.heading} style={{ marginBottom: 10 }}>
                  <div style={{ fontSize: 10, fontWeight: 700, color: textMuted, marginBottom: 5 }}>{group.heading}</div>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {group.items.map(d => (
                      <button key={d.email} type="button"
                        onClick={() => { setSelectedRole(d.role); setForm(prev => ({ ...prev, email: d.email, password: 'demo123' })); }}
                        style={{ padding: '5px 10px', borderRadius: 7, border: `1px solid ${border}`, background: inputBg, color: text, fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: "'Inter',sans-serif", transition: 'all 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = '#38bdf8'; e.currentTarget.style.color = '#38bdf8'; }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = border; e.currentTarget.style.color = text; }}>
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <div style={{ fontSize: 11, color: textMuted, marginTop: 4 }}>All use password: <code style={{ background: 'rgba(255,255,255,0.08)', padding: '1px 5px', borderRadius: 4 }}>demo123</code></div>
            </div>
          )}


          {/* Form */}
          {!(tab === 'signup' && isAdminRoleSelected) && (
            <form onSubmit={tab === 'login' ? handleLogin : handleSignup}>

              {tab === 'signup' && (
                <>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: textMuted, display: 'block', marginBottom: '6px' }}>Full Name *</label>
                    <input className="lp-input" value={form.name} onChange={update('name')} placeholder="Aarav Sharma" required
                      style={{ ...inputStyle, paddingRight: '14px' }} />
                  </div>
                  <div style={{ marginBottom: '14px' }}>
                    <label style={{ fontSize: '12px', fontWeight: 600, color: textMuted, display: 'block', marginBottom: '6px' }}>Institution</label>
                    <input className="lp-input" value={form.institution} onChange={update('institution')} placeholder="ABC Engineering College"
                      style={{ ...inputStyle, paddingRight: '14px' }} />
                  </div>
                  {selectedRole === 'college_student' && (
                    <div style={{ marginBottom: '14px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: textMuted, display: 'block', marginBottom: '6px' }}>Department</label>
                      <input className="lp-input" value={form.department} onChange={update('department')} placeholder="Computer Science"
                        style={{ ...inputStyle, paddingRight: '14px' }} />
                    </div>
                  )}
                  {selectedRole === 'school_student' && (
                    <div style={{ marginBottom: '14px' }}>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: textMuted, display: 'block', marginBottom: '6px' }}>Class (Grade)</label>
                      <select className="lp-input" value={form.class} onChange={update('class')}
                        style={{ ...inputStyle, paddingRight: '14px' }}>
                        <option value="">Select class…</option>
                        {[3,4,5,6,7,8,9,10,11,12].map(c => <option key={c} value={c}>Class {c}</option>)}
                      </select>
                    </div>
                  )}
                </>
              )}

              {/* Email */}
              <div style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: textMuted, display: 'block', marginBottom: '6px' }}>Email Address *</label>
                <input className="lp-input" type="email" value={form.email} onChange={update('email')} placeholder="you@example.com" required
                  style={{ ...inputStyle, paddingRight: '14px' }} />
              </div>

              {/* Password with show/hide */}
              <div style={{ marginBottom: tab === 'signup' ? '4px' : '8px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: textMuted, display: 'block', marginBottom: '6px' }}>Password *</label>
                <div style={{ position: 'relative' }}>
                  <input className="lp-input" type={showPw ? 'text' : 'password'} value={form.password} onChange={update('password')}
                    placeholder={tab === 'signup' ? 'Min 6 characters' : '••••••••'} required style={inputStyle} />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: textMuted, cursor: 'pointer', display: 'flex', padding: 0 }}>
                    <EyeIcon open={showPw} />
                  </button>
                </div>
              </div>

              {/* Password strength bar (signup only) */}
              {tab === 'signup' && form.password && (
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ display: 'flex', gap: '4px', marginTop: '6px' }}>
                    {[1,2,3,4,5].map(i => (
                      <div key={i} style={{ flex: 1, height: '3px', borderRadius: '99px', background: i <= strength.score ? strength.color : 'rgba(255,255,255,0.1)', transition: 'background 0.3s' }} />
                    ))}
                  </div>
                  <div style={{ fontSize: '11px', color: strength.color, marginTop: '4px', fontWeight: 600 }}>{strength.label}</div>
                </div>
              )}

              {/* Confirm password (signup only) */}
              {tab === 'signup' && (
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: textMuted, display: 'block', marginBottom: '6px' }}>Confirm Password *</label>
                  <div style={{ position: 'relative' }}>
                    <input className="lp-input" type={showConfirmPw ? 'text' : 'password'} value={form.confirmPassword} onChange={update('confirmPassword')}
                      placeholder="••••••••" required style={inputStyle} />
                    <button type="button" onClick={() => setShowConfirmPw(!showConfirmPw)}
                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: textMuted, cursor: 'pointer', display: 'flex', padding: 0 }}>
                      <EyeIcon open={showConfirmPw} />
                    </button>
                  </div>
                </div>
              )}

              {/* Remember me + Forgot password row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '13px', color: textMuted, fontWeight: 500 }}>
                  <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)}
                    style={{ width: '15px', height: '15px', accentColor: currentRole.color, cursor: 'pointer' }} />
                  Remember me
                </label>
                {tab === 'login' && (
                  <button type="button" onClick={() => setShowForgot(true)}
                    style={{ background: 'none', border: 'none', color: currentRole.color, fontWeight: 600, cursor: 'pointer', fontSize: '13px', fontFamily: "'Inter', sans-serif" }}>
                    Forgot password?
                  </button>
                )}
              </div>

              {/* Error / success banners */}
              {error && (
                <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '12px 14px', marginBottom: '16px', fontSize: '13px', color: '#ef4444', fontWeight: 500 }}>
                  ⚠️ {error}
                </div>
              )}
              {success && (
                <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '10px', padding: '12px 14px', marginBottom: '16px', fontSize: '13px', color: '#10b981', fontWeight: 500 }}>
                  ✅ {success}
                </div>
              )}

              <button type="submit" className="submit-btn" disabled={loading}
                style={{ width: '100%', padding: '14px', background: loading ? (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)') : `linear-gradient(135deg, ${currentRole.color}, ${currentRole.color}cc)`, border: 'none', borderRadius: '12px', color: loading ? textMuted : '#fff', fontSize: '15px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: "'Inter', sans-serif", transition: 'all 0.2s', boxShadow: loading ? 'none' : `0 4px 20px ${currentRole.color}44` }}>
                {loading ? '⏳ Please wait…' : tab === 'login' ? '→ Sign In' : '→ Create Account'}
              </button>
            </form>
          )}

          <p style={{ fontSize: '12px', color: textMuted, textAlign: 'center', marginTop: '20px' }}>
            {tab === 'login'
              ? <><span>New to EduPulse? </span><button onClick={() => { setTab('signup'); setError(''); }} style={{ background: 'none', border: 'none', color: currentRole.color, fontWeight: 700, cursor: 'pointer', fontSize: '12px', fontFamily: "'Inter', sans-serif" }}>Create an account →</button></>
              : <><span>Already have an account? </span><button onClick={() => { setTab('login'); setError(''); }} style={{ background: 'none', border: 'none', color: currentRole.color, fontWeight: 700, cursor: 'pointer', fontSize: '12px', fontFamily: "'Inter', sans-serif" }}>Sign In →</button></>
            }
          </p>
          <p style={{ fontSize: '11px', color: textMuted, textAlign: 'center', marginTop: '6px' }}>
            🔒 Your data is encrypted and stored securely in MongoDB Atlas.
          </p>
        </div>
      </div>
    </div>
  );
}
