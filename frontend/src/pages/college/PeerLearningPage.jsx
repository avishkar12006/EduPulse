import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

const SKILLS = [
  'React', 'Python', 'Machine Learning', 'Data Structures', 'Web Dev',
  'Java', 'C++', 'SQL', 'Cloud', 'UI/UX', 'Robotics', 'Mathematics',
];

const STUDY_GROUPS = [
  { id: 1, name: 'DSA Problem Solvers', members: 12, topic: 'Data Structures & Algorithms', level: 'Intermediate', icon: '🧩', active: true },
  { id: 2, name: 'Web Dev Squad', members: 8, topic: 'Full-Stack Development', level: 'Beginner', icon: '🌐', active: true },
  { id: 3, name: 'ML Research Circle', members: 6, topic: 'Machine Learning & AI', level: 'Advanced', icon: '🤖', active: false },
  { id: 4, name: 'Java Backend Group', members: 10, topic: 'Spring Boot & Microservices', level: 'Intermediate', icon: '☕', active: true },
  { id: 5, name: 'Competitive Coders', members: 15, topic: 'Competitive Programming', level: 'Advanced', icon: '🏆', active: true },
  { id: 6, name: 'Cloud & DevOps', members: 7, topic: 'AWS, Docker, CI/CD', level: 'Intermediate', icon: '☁️', active: false },
];

const FEED = [
  { id: 1, author: 'Priya P.', avatar: '👩‍🔬', time: '2m ago', text: 'Just solved the Longest Common Subsequence problem! Here\'s a great DP approach that I learned…', tag: 'DSA', likes: 14, comments: 3 },
  { id: 2, author: 'Rohan M.', avatar: '🧑‍🔧', time: '18m ago', text: 'Looking for a study partner for next week\'s DBMS exam. Anyone in Sem 3 want to group up?', tag: 'Study Help', likes: 6, comments: 8 },
  { id: 3, author: 'Sneha I.', avatar: '👩‍💼', time: '1h ago', text: 'Found a really good free course on Coursera for System Design. Sharing the link in comments 👇', tag: 'Resources', likes: 22, comments: 11 },
  { id: 4, author: 'Vikram S.', avatar: '🧑‍🎓', time: '3h ago', text: 'Attended the campus placement drive today. Tips: prepare STAR method answers and know your resume cold.', tag: 'Career', likes: 31, comments: 7 },
];

export default function PeerLearningPage() {
  const { user, logout } = useAuth();
  const { isDark, toggle, colors } = useTheme();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('feed'); // 'feed' | 'groups' | 'connect'
  const [newPost, setNewPost] = useState('');
  const [likedPosts, setLikedPosts] = useState(new Set());
  const [joinedGroups, setJoinedGroups] = useState(new Set());
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [postSuccess, setPostSuccess] = useState(false);

  const C = colors;

  const toggleLike = (id) => {
    setLikedPosts(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };
  const toggleJoin = (id) => {
    setJoinedGroups(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  };
  const toggleSkill = (s) => setSelectedSkills(prev => prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s]);

  const submitPost = () => {
    if (!newPost.trim()) return;
    setNewPost('');
    setPostSuccess(true);
    setTimeout(() => setPostSuccess(false), 2800);
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.text, fontFamily: "'Inter', sans-serif" }}>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}} .peer-card:hover{transform:translateY(-2px);box-shadow:0 8px 24px rgba(0,0,0,0.2);}`}</style>

      {/* Nav */}
      <nav style={{ background: C.bgNav, borderBottom: `1px solid ${C.border}`, padding: '0 32px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 50, backdropFilter: 'blur(12px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button onClick={() => navigate('/student')} style={{ background: 'none', border: 'none', color: C.accent, fontWeight: 700, fontSize: '13px', cursor: 'pointer', fontFamily: "'Inter', sans-serif" }}>← Dashboard</button>
          <div style={{ width: '1px', height: '20px', background: C.border }} />
          <h1 style={{ fontSize: '18px', fontWeight: 700, margin: 0, color: C.text }}>🤝 Peer Learning Network</h1>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button onClick={toggle} style={{ width: '34px', height: '34px', borderRadius: '50%', border: `1px solid ${C.border}`, background: C.bgCard, cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{isDark ? '☀️' : '🌙'}</button>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: C.accentBg, border: `1px solid ${C.accent}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: 700, color: C.accent }}>{user?.name?.charAt(0)}</div>
        </div>
      </nav>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '28px 24px', display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }}>
        {/* Main column */}
        <div>
          {/* Tab nav */}
          <div style={{ display: 'flex', gap: '4px', marginBottom: '24px', background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '12px', padding: '4px' }}>
            {[['feed', '📰 Feed'], ['groups', '👥 Study Groups'], ['connect', '🔗 Find Partners']].map(([t, l]) => (
              <button key={t} onClick={() => setActiveTab(t)}
                style={{ flex: 1, padding: '9px', border: 'none', borderRadius: '9px', cursor: 'pointer', fontSize: '13px', fontWeight: 600, fontFamily: "'Inter', sans-serif", transition: 'all 0.2s',
                  background: activeTab === t ? C.accent : 'transparent', color: activeTab === t ? '#fff' : C.textMuted }}>
                {l}
              </button>
            ))}
          </div>

          {/* ── FEED ── */}
          {activeTab === 'feed' && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              {/* Post composer */}
              <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '14px', padding: '20px', marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: C.accentBg, border: `1px solid ${C.accent}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, color: C.accent, flexShrink: 0 }}>{user?.name?.charAt(0)}</div>
                  <textarea value={newPost} onChange={e => setNewPost(e.target.value)} placeholder="Share a resource, ask for help, or post a study tip…" rows={3}
                    style={{ flex: 1, resize: 'none', background: C.inputBg, border: `1px solid ${C.inputBorder}`, borderRadius: '10px', color: C.text, padding: '12px', fontSize: '14px', fontFamily: "'Inter', sans-serif", outline: 'none' }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '12px', gap: '12px', alignItems: 'center' }}>
                  {postSuccess && <span style={{ fontSize: '13px', color: C.success, fontWeight: 600 }}>✅ Posted to the feed!</span>}
                  <button onClick={submitPost} disabled={!newPost.trim()}
                    style={{ padding: '8px 20px', background: newPost.trim() ? C.accent : C.inputBg, border: 'none', borderRadius: '8px', color: '#fff', fontWeight: 700, fontSize: '13px', cursor: newPost.trim() ? 'pointer' : 'default', fontFamily: "'Inter', sans-serif' " }}>
                    Post
                  </button>
                </div>
              </div>

              {/* Posts */}
              {FEED.map(post => (
                <div key={post.id} className="peer-card" style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '14px', padding: '20px', marginBottom: '16px', transition: 'all 0.2s' }}>
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                    <div style={{ fontSize: '28px' }}>{post.avatar}</div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '14px', color: C.text }}>{post.author}</div>
                      <div style={{ fontSize: '12px', color: C.textMuted }}>{post.time}</div>
                    </div>
                    <span style={{ marginLeft: 'auto', background: `${C.accent}18`, color: C.accent, border: `1px solid ${C.accent}30`, borderRadius: '99px', padding: '3px 10px', fontSize: '11px', fontWeight: 700/*, alignSelf: 'flex-start'*/ }}>{post.tag}</span>
                  </div>
                  <p style={{ margin: '0 0 16px', fontSize: '14px', color: C.textSecondary, lineHeight: 1.7 }}>{post.text}</p>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <button onClick={() => toggleLike(post.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: likedPosts.has(post.id) ? '#ef4444' : C.textMuted, fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>
                      {likedPosts.has(post.id) ? '❤️' : '🤍'} {post.likes + (likedPosts.has(post.id) ? 1 : 0)}
                    </button>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: C.textMuted, fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>
                      💬 {post.comments} comments
                    </button>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: C.textMuted, fontWeight: 600, fontFamily: "'Inter', sans-serif" }}>
                      ↗ Share
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── STUDY GROUPS ── */}
          {activeTab === 'groups' && (
            <div style={{ animation: 'fadeIn 0.3s ease', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              {STUDY_GROUPS.map(g => (
                <div key={g.id} className="peer-card" style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '14px', padding: '20px', transition: 'all 0.2s' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <div style={{ fontSize: '32px' }}>{g.icon}</div>
                    <span style={{ background: g.active ? 'rgba(16,185,129,0.12)' : C.inputBg, color: g.active ? C.success : C.textMuted, border: `1px solid ${g.active ? C.success : C.border}`, borderRadius: '99px', padding: '2px 10px', fontSize: '11px', fontWeight: 700 }}>{g.active ? '● Active' : '○ Inactive'}</span>
                  </div>
                  <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '4px', color: C.text }}>{g.name}</div>
                  <div style={{ fontSize: '12px', color: C.textMuted, marginBottom: '8px' }}>{g.topic}</div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', color: C.textMuted, marginBottom: '14px' }}>
                    <span>👥 {g.members} members</span>
                    <span style={{ background: `${C.purple || '#8b5cf6'}18`, color: C.purple || '#8b5cf6', borderRadius: '99px', padding: '2px 9px', fontWeight: 700 }}>{g.level}</span>
                  </div>
                  <button onClick={() => toggleJoin(g.id)}
                    style={{ width: '100%', padding: '8px', border: `1px solid ${joinedGroups.has(g.id) ? C.border : C.accent}`, borderRadius: '8px', background: joinedGroups.has(g.id) ? C.inputBg : `${C.accent}18`, color: joinedGroups.has(g.id) ? C.textMuted : C.accent, fontWeight: 700, fontSize: '13px', cursor: 'pointer', fontFamily: "'Inter', sans-serif", transition: 'all 0.2s' }}>
                    {joinedGroups.has(g.id) ? '✓ Joined' : '+ Join Group'}
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* ── FIND PARTNERS ── */}
          {activeTab === 'connect' && (
            <div style={{ animation: 'fadeIn 0.3s ease' }}>
              <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '14px', padding: '24px', marginBottom: '20px' }}>
                <h3 style={{ margin: '0 0 16px', fontWeight: 700, fontSize: '16px', color: C.text }}>🎯 Find by Skills</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {SKILLS.map(s => (
                    <button key={s} onClick={() => toggleSkill(s)}
                      style={{ padding: '6px 14px', border: `1px solid ${selectedSkills.includes(s) ? C.accent : C.inputBorder}`, borderRadius: '99px', background: selectedSkills.includes(s) ? `${C.accent}18` : 'transparent', color: selectedSkills.includes(s) ? C.accent : C.textMuted, fontWeight: 600, fontSize: '12px', cursor: 'pointer', fontFamily: "'Inter', sans-serif", transition: 'all 0.2s' }}>
                      {s}
                    </button>
                  ))}
                </div>
                {selectedSkills.length > 0 && (
                  <div style={{ marginTop: '16px', padding: '12px', background: `${C.accent}10`, border: `1px solid ${C.accent}25`, borderRadius: '10px', fontSize: '13px', color: C.accent, fontWeight: 600 }}>
                    🔍 Finding peers skilled in: {selectedSkills.join(', ')}… (Connect your backend to enable real matching)
                  </div>
                )}
              </div>

              {/* Suggested peers */}
              {[
                { name: 'Ayesha K.', dept: 'Computer Science', skills: ['React', 'Python'], mutual: 3, avatar: '👩‍💻' },
                { name: 'Dev P.', dept: 'IT', skills: ['Machine Learning', 'SQL'], mutual: 5, avatar: '🧑‍🔬' },
                { name: 'Nisha R.', dept: 'Electronics', skills: ['Robotics', 'C++'], mutual: 2, avatar: '👩‍🔧' },
              ].map((p, i) => (
                <div key={i} className="peer-card" style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '14px', padding: '16px', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '14px', transition: 'all 0.2s' }}>
                  <div style={{ fontSize: '36px' }}>{p.avatar}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '14px', color: C.text }}>{p.name}</div>
                    <div style={{ fontSize: '12px', color: C.textMuted }}>{p.dept} · {p.mutual} mutual connections</div>
                    <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                      {p.skills.map((s, j) => <span key={j} style={{ background: `${C.accent}12`, color: C.accent, border: `1px solid ${C.accent}25`, borderRadius: '99px', padding: '2px 8px', fontSize: '11px', fontWeight: 600 }}>{s}</span>)}
                    </div>
                  </div>
                  <button style={{ padding: '8px 16px', background: C.accentBg, border: `1px solid ${C.accent}40`, borderRadius: '8px', color: C.accent, fontWeight: 700, fontSize: '12px', cursor: 'pointer', fontFamily: "'Inter', sans-serif", whiteSpace: 'nowrap' }}>
                    Connect →
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Your profile */}
          <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '14px', padding: '20px', textAlign: 'center' }}>
            <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: C.accentBg, border: `2px solid ${C.accent}55`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '22px', color: C.accent, margin: '0 auto 12px' }}>{user?.name?.charAt(0)}</div>
            <div style={{ fontWeight: 700, fontSize: '15px', color: C.text }}>{user?.name || 'Student'}</div>
            <div style={{ fontSize: '12px', color: C.textMuted, marginBottom: '14px' }}>{user?.email}</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {[['0', 'Posts'], ['0', 'Groups'], ['0', 'Connect.']].slice(0, 2).map(([v, l], i) => (
                <div key={i} style={{ background: C.inputBg, borderRadius: '8px', padding: '10px', textAlign: 'center' }}>
                  <div style={{ fontWeight: 800, fontSize: '18px', color: C.accent }}>{v}</div>
                  <div style={{ fontSize: '11px', color: C.textMuted }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Active groups joined */}
          <div style={{ background: C.bgCard, border: `1px solid ${C.border}`, borderRadius: '14px', padding: '20px' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, color: C.text, marginBottom: '12px' }}>🔥 Trending Topics</div>
            {['#DSA', '#PlacementPrep', '#MachineLearning', '#ReactJS', '#CloudComputing'].map((t, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: i < 4 ? `1px solid ${C.border}` : 'none' }}>
                <span style={{ fontSize: '13px', color: C.accent, fontWeight: 600 }}>{t}</span>
                <span style={{ fontSize: '12px', color: C.textMuted }}>{[42, 38, 31, 27, 19][i]} posts</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
