import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import API from '../utils/api';

const AVATARS = ['🎓','🏫','👨‍👩‍👧','👩‍🏫','🛡️','⚡','🚀','🌟','🔬','🎯','🦄','🧠','🎨','🏆','🌈'];

const ROLE_REDIRECT = {
  college_student: '/student', parent: '/parent', scm: '/scm',
  admin: '/admin', school_student: '/school/explorer',
};

export default function ProfilePage() {
  const { user, updateUser, logout } = useAuth();
  const { isDark, toggle } = useTheme();
  const navigate = useNavigate();

  const [name, setName]         = useState(user?.name || '');
  const [avatar, setAvatar]     = useState(user?.avatar || '🎓');
  const [language, setLanguage] = useState(user?.language || 'en');
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw]         = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [showPw, setShowPw]       = useState(false);

  const [saving, setSaving]  = useState(false);
  const [error, setError]    = useState('');
  const [success, setSuccess] = useState('');

  const bg       = isDark ? '#020617' : '#f1f5f9';
  const cardBg   = isDark ? 'rgba(15,23,42,0.85)' : '#fff';
  const text      = isDark ? '#f8fafc' : '#0f172a';
  const textMuted = isDark ? 'rgba(255,255,255,0.45)' : 'rgba(0,0,0,0.45)';
  const border    = isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0';
  const inputBg   = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
  const inputBorder = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.14)';

  const inputStyle = {
    width: '100%', padding: '11px 14px', background: inputBg,
    border: `1px solid ${inputBorder}`, borderRadius: '10px', color: text,
    fontSize: '14px', fontFamily: "'Inter', sans-serif", outline: 'none',
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError(''); setSuccess(''); setSaving(true);

    if (newPw && newPw !== confirmPw) {
      setError('New passwords do not match.'); setSaving(false); return;
    }
    if (newPw && newPw.length < 6) {
      setError('New password must be at least 6 characters.'); setSaving(false); return;
    }

    try {
      const payload = { name, avatar, language };
      if (newPw) {
        payload.currentPassword = currentPw;
        payload.newPassword     = newPw;
      }
      const { data } = await API.put('/auth/update-profile', payload);
      updateUser(data);
      setSuccess('Profile updated successfully!');
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
    } catch (ex) {
      setError(ex.response?.data?.message || ex.message || 'Failed to save changes.');
    } finally { setSaving(false); }
  };

  return (
    <div style={{ minHeight: '100vh', background: bg, fontFamily: "'Inter', sans-serif", color: text, padding: '40px 24px' }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap'); * { box-sizing: border-box; }`}</style>

      {/* Header */}
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button onClick={() => navigate(ROLE_REDIRECT[user?.role] || '/student')}
              style={{ background: 'none', border: 'none', color: textMuted, cursor: 'pointer', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '6px' }}>
              ← Back
            </button>
            <div style={{ width: '1px', height: '20px', background: border }} />
            <h1 style={{ margin: 0, fontSize: '22px', fontWeight: 800 }}>My Profile</h1>
          </div>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button onClick={toggle} title="Toggle theme"
              style={{ width: '38px', height: '38px', borderRadius: '50%', border: `1px solid ${border}`, background: cardBg, cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {isDark ? '☀️' : '🌙'}
            </button>
            <button onClick={logout}
              style={{ padding: '8px 16px', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', color: '#ef4444', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>
              Sign Out
            </button>
          </div>
        </div>

        {/* Profile card */}
        <div style={{ background: cardBg, borderRadius: '20px', border: `1px solid ${border}`, overflow: 'hidden', boxShadow: isDark ? '0 20px 60px rgba(0,0,0,0.4)' : '0 4px 24px rgba(0,0,0,0.08)' }}>
          {/* Top banner */}
          <div style={{ height: '80px', background: 'linear-gradient(135deg,#00bfff,#8b5cf6)', position: 'relative' }}>
            <div style={{ position: 'absolute', bottom: '-32px', left: '28px', width: '64px', height: '64px', borderRadius: '50%', background: cardBg, border: `3px solid ${cardBg}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '30px' }}>
              {avatar}
            </div>
          </div>

          <div style={{ padding: '48px 28px 28px' }}>
            {/* Role + email badge */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
              <span style={{ padding: '4px 12px', background: 'rgba(56,189,248,0.1)', border: '1px solid rgba(56,189,248,0.3)', borderRadius: '99px', fontSize: '12px', fontWeight: 700, color: '#38bdf8' }}>
                {user?.role?.replace('_', ' ').toUpperCase()}
              </span>
              <span style={{ padding: '4px 12px', background: inputBg, border: `1px solid ${border}`, borderRadius: '99px', fontSize: '12px', color: textMuted }}>
                {user?.email}
              </span>
              {user?.studentData?.rollNumber && (
                <span style={{ padding: '4px 12px', background: inputBg, border: `1px solid ${border}`, borderRadius: '99px', fontSize: '12px', color: textMuted }}>
                  Roll: {user.studentData.rollNumber}
                </span>
              )}
            </div>

            <form onSubmit={handleSave}>
              {/* Name */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: textMuted, display: 'block', marginBottom: '6px' }}>Full Name</label>
                <input value={name} onChange={e => setName(e.target.value)} required style={inputStyle} placeholder="Your name" />
              </div>

              {/* Language */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: textMuted, display: 'block', marginBottom: '6px' }}>Preferred Language</label>
                <select value={language} onChange={e => setLanguage(e.target.value)} style={inputStyle}>
                  <option value="en">🇬🇧 English</option>
                  <option value="hi">🇮🇳 हिन्दी (Hindi)</option>
                  <option value="mr">🇮🇳 मराठी (Marathi)</option>
                </select>
              </div>

              {/* Avatar picker */}
              <div style={{ marginBottom: '28px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, color: textMuted, display: 'block', marginBottom: '10px' }}>Avatar</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {AVATARS.map(a => (
                    <button key={a} type="button" onClick={() => setAvatar(a)}
                      style={{ width: '44px', height: '44px', fontSize: '22px', borderRadius: '10px', border: `2px solid ${avatar === a ? '#38bdf8' : border}`, background: avatar === a ? 'rgba(56,189,248,0.15)' : inputBg, cursor: 'pointer', transition: 'all 0.2s' }}>
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              {/* Password change section */}
              <div style={{ borderTop: `1px solid ${border}`, paddingTop: '24px', marginBottom: '24px' }}>
                <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '16px' }}>🔒 Change Password</div>
                <div style={{ fontSize: '12px', color: textMuted, marginBottom: '16px' }}>Leave blank to keep your current password.</div>

                <div style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: textMuted, display: 'block', marginBottom: '6px' }}>Current Password</label>
                  <div style={{ position: 'relative' }}>
                    <input type={showPw ? 'text' : 'password'} value={currentPw} onChange={e => setCurrentPw(e.target.value)}
                      placeholder="Enter current password" style={{ ...inputStyle, paddingRight: '46px' }} />
                    <button type="button" onClick={() => setShowPw(!showPw)}
                      style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: textMuted, cursor: 'pointer', fontSize: '16px' }}>
                      {showPw ? '🙈' : '👁️'}
                    </button>
                  </div>
                </div>
                <div style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: textMuted, display: 'block', marginBottom: '6px' }}>New Password</label>
                  <input type={showPw ? 'text' : 'password'} value={newPw} onChange={e => setNewPw(e.target.value)}
                    placeholder="Min 6 characters" style={inputStyle} />
                </div>
                <div style={{ marginBottom: '0' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600, color: textMuted, display: 'block', marginBottom: '6px' }}>Confirm New Password</label>
                  <input type={showPw ? 'text' : 'password'} value={confirmPw} onChange={e => setConfirmPw(e.target.value)}
                    placeholder="••••••••" style={inputStyle} />
                </div>
              </div>

              {/* Feedback */}
              {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '10px', padding: '12px', marginBottom: '16px', fontSize: '13px', color: '#ef4444' }}>⚠️ {error}</div>}
              {success && <div style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '10px', padding: '12px', marginBottom: '16px', fontSize: '13px', color: '#10b981' }}>✅ {success}</div>}

              <button type="submit" disabled={saving}
                style={{ width: '100%', padding: '14px', background: saving ? 'rgba(56,189,248,0.3)' : 'linear-gradient(135deg,#00bfff,#0080ff)', border: 'none', borderRadius: '12px', color: '#fff', fontSize: '15px', fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer', transition: 'all 0.2s' }}>
                {saving ? '⏳ Saving…' : '→ Save Changes'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
