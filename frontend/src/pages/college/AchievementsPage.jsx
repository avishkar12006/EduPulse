import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../utils/api';

const ALL_BADGES = [
  { id: 'first_login', name: 'First Step', icon: '🌟', category: 'Platform Engagement', description: 'Log in for the first time', requirement: 'Log in once' },
  { id: 'streak_7', name: '7-Day Streak', icon: '🔥', category: 'Streak', description: 'Login 7 days in a row', requirement: '7-day streak' },
  { id: 'streak_14', name: 'Fortnight Fire', icon: '🔥🔥', category: 'Streak', description: '14 days of consistent login', requirement: '14-day streak' },
  { id: 'streak_30', name: 'Month Master', icon: '🏆', category: 'Streak', description: '30-day login streak', requirement: '30-day streak' },
  { id: 'top_cluster', name: 'Top Performer', icon: '⭐', category: 'Academic Excellence', description: 'Place in the top cluster', requirement: 'Top cluster for 1 month' },
  { id: 'grade_ace', name: 'Grade Ace', icon: '📚', category: 'Academic Excellence', description: 'Score A+ in any subject', requirement: 'Get A+ grade' },
  { id: 'attendance_100', name: 'Perfect Attendance', icon: '🗓️', category: 'Attendance', description: '100% attendance in a subject', requirement: '100% in one subject' },
  { id: 'attendance_90', name: 'Attendance Star', icon: '📅', category: 'Attendance', description: 'Overall 90%+ attendance', requirement: '90%+ overall attendance' },
  { id: 'mood_logger', name: 'Mood Logger', icon: '😊', category: 'Wellbeing', description: 'Log mood for 7 consecutive days', requirement: '7-day mood streak' },
  { id: 'sparky_chat', name: 'Sparky Buddy', icon: '🤖', category: 'Platform Engagement', description: 'Have 10 conversations with Sparky', requirement: '10 Sparky chats' },
  { id: 'career_explorer', name: 'Career Explorer', icon: '🎯', category: 'Career Explorer', description: 'Generate your first career roadmap', requirement: 'Generate 1 roadmap' },
  { id: 'milestone_5', name: 'Milestone Master', icon: '📍', category: 'Career Explorer', description: 'Complete 5 career milestones', requirement: '5 milestones done' },
  { id: 'comeback_kid', name: 'Comeback Kid', icon: '💪', category: 'Comeback Kid', description: 'Move up from Below to Medium cluster', requirement: 'Cluster improvement' },
  { id: 'xp_500', name: 'XP Warrior', icon: '⚡', category: 'Platform Engagement', description: 'Earn 500 XP points', requirement: '500 XP' },
  { id: 'xp_1000', name: 'XP Legend', icon: '💎', category: 'Platform Engagement', description: 'Earn 1000 XP points', requirement: '1000 XP' }
];

const CATEGORY_COLORS = {
  'Platform Engagement': '#00BFFF',
  'Academic Excellence': '#FFD700',
  'Streak': '#EF4444',
  'Attendance': '#10B981',
  'Wellbeing': '#FB923C',
  'Career Explorer': '#8B5CF6',
  'Comeback Kid': '#EC4899'
};

export default function AchievementsPage() {
  const { user } = useAuth();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [xpAnim, setXpAnim] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const { data } = await API.get(`/api/students/${user.studentId}`);
      setStudent(data);
    } catch {}
    finally { setLoading(false); }
  };

  const earnedIds = new Set((student?.badges || []).map(b => b.id));
  const categories = ['all', ...new Set(ALL_BADGES.map(b => b.category))];
  const filtered = filter === 'all' ? ALL_BADGES : ALL_BADGES.filter(b => b.category === filter);
  const earnedCnt = ALL_BADGES.filter(b => earnedIds.has(b.id)).length;
  const xp = student?.xpPoints || 0;
  const level = student?.level || 1;
  const xpToNext = level * 200;
  const xpProgress = Math.min(100, (xp % xpToNext) / xpToNext * 100);

  return (
    <div style={{ minHeight: '100vh', background: '#0A1628', color: 'white', fontFamily: "'Nunito', sans-serif" }}>
      <nav style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '0 24px', height: '60px', display: 'flex', alignItems: 'center', gap: '20px' }}>
        <Link to="/student" style={{ color: '#00BFFF', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>← Dashboard</Link>
        <h1 style={{ fontFamily: "'Fredoka One', cursive", fontSize: '22px', margin: 0 }}>🏆 Achievements</h1>
      </nav>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px' }}>
        {/* XP + Level Banner */}
        <div style={{ background: 'linear-gradient(135deg, #1a3a6b, #0c1f3f)', border: '1px solid rgba(0,191,255,0.25)', borderRadius: '20px', padding: '28px', marginBottom: '24px', display: 'flex', gap: '32px', alignItems: 'center' }}>
          {/* Level badge */}
          <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'linear-gradient(135deg,#FFD700,#F59E0B)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxShadow: '0 0 30px rgba(255,215,0,0.4)' }}>
            <div style={{ fontSize: '11px', fontWeight: 800, color: '#0A1628', letterSpacing: '1px' }}>LEVEL</div>
            <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: '42px', color: '#0A1628', lineHeight: 1 }}>{level}</div>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '8px' }}>
              <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: '24px' }}>{user?.name?.split(' ')[0]}'s Progress</div>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '16px', color: '#FFD700' }}>⚡ {xp} XP</div>
            </div>
            <div style={{ height: '12px', borderRadius: '99px', background: 'rgba(255,255,255,0.1)', overflow: 'hidden', marginBottom: '8px' }}>
              <div style={{ height: '100%', width: `${xpProgress}%`, borderRadius: '99px', background: 'linear-gradient(90deg,#FFD700,#F59E0B)', transition: 'width 1.5s ease' }} />
            </div>
            <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>
              {xp} / {xpToNext} XP to Level {level + 1}
            </div>
          </div>
          {/* Stats */}
          <div style={{ display: 'flex', gap: '20px', flexShrink: 0 }}>
            {[
              { label: 'Badges', value: `${earnedCnt}/${ALL_BADGES.length}`, icon: '🎖️' },
              { label: 'Streak', value: `${student?.streakDays || 0}🔥`, icon: '' }
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center', background: 'rgba(255,255,255,0.06)', borderRadius: '12px', padding: '14px 20px' }}>
                <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: '22px', color: '#FFD700' }}>{s.value}</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Category filter */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap' }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => setFilter(cat)}
              style={{
                padding: '8px 16px', borderRadius: '99px', border: 'none', cursor: 'pointer',
                fontFamily: "'Nunito', sans-serif", fontWeight: 700, fontSize: '13px',
                background: filter === cat ? (CATEGORY_COLORS[cat] || '#00BFFF') : 'rgba(255,255,255,0.07)',
                color: filter === cat ? '#0A1628' : 'rgba(255,255,255,0.6)',
                transition: 'all 0.2s'
              }}>
              {cat === 'all' ? '🏅 All Badges' : cat}
            </button>
          ))}
        </div>

        {/* Badge grid */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px', color: 'rgba(255,255,255,0.3)' }}>Loading achievements...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px' }}>
            {filtered.map((badge) => {
              const earned = earnedIds.has(badge.id);
              const color = CATEGORY_COLORS[badge.category] || '#00BFFF';
              return (
                <div key={badge.id} style={{
                  background: earned ? `${color}15` : 'rgba(255,255,255,0.03)',
                  border: `1.5px solid ${earned ? color + '50' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: '16px', padding: '20px', textAlign: 'center',
                  opacity: earned ? 1 : 0.45,
                  transition: 'all 0.3s ease',
                  filter: earned ? 'none' : 'grayscale(80%)',
                  position: 'relative'
                }}>
                  {!earned && (
                    <div style={{ position: 'absolute', top: '8px', right: '8px', fontSize: '16px', opacity: 0.3 }}>🔒</div>
                  )}
                  {earned && (
                    <div style={{ position: 'absolute', top: '8px', right: '8px' }}>
                      <div style={{ width: '18px', height: '18px', borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px' }}>✓</div>
                    </div>
                  )}
                  <div style={{ fontSize: '48px', marginBottom: '10px', animation: earned ? `bounce-emoji 1s ease-in-out ${Math.random() * 0.5}s` : 'none' }}>{badge.icon}</div>
                  <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: '16px', color: earned ? color : 'rgba(255,255,255,0.5)', marginBottom: '6px' }}>{badge.name}</div>
                  <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', lineHeight: 1.5 }}>{badge.description}</div>
                  <div style={{ marginTop: '10px', fontSize: '11px', fontWeight: 700, color: earned ? color : 'rgba(255,255,255,0.25)', background: earned ? `${color}12` : 'rgba(255,255,255,0.03)', borderRadius: '99px', padding: '3px 10px', display: 'inline-block' }}>
                    {earned ? '✓ Earned' : `🔒 ${badge.requirement}`}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
