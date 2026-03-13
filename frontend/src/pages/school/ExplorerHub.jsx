import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import AcademicDNA from '../../components/AcademicDNA';
import MoodFaces   from '../../components/MoodFaces';
import MoodCamera  from '../../components/MoodCamera';
import SparkyChat  from '../../components/SparkyChat';
import API from '../../utils/api';

/* ── Design tokens — Deep Space + Glassmorphism ─────────────────────────── */
const BG     = '#0d0d1a';
const CARD   = 'rgba(255,255,255,0.04)';
const BORDER = '1px solid rgba(255,255,255,0.08)';
const glass  = (extra = '') => ({ background: CARD, border: BORDER, borderRadius: '16px', backdropFilter: 'blur(10px)', ...(extra && { padding: extra }) });

const COLORS = { purple: '#7C3AED', teal: '#14B8A6', pink: '#EC4899', gold: '#F59E0B' };

/* ── Career families ───────────────────────────────────────────────────── */
const CAREER_FAMILIES = [
  { id: 'scienceTech',    icon: '🔬', label: 'Science & Tech World',    desc: "For curious minds who love asking 'why?' and 'how?'",   color: '#38bdf8', anim: '⚛️' },
  { id: 'creativeArts',   icon: '🎨', label: 'Creative Arts World',      desc: "For dreamers who see beauty in everything",              color: '#ec4899', anim: '🎵' },
  { id: 'business',       icon: '💼', label: 'Business World',           desc: "For leaders who love solving real-world problems",       color: '#f59e0b', anim: '📈' },
  { id: 'socialImpact',   icon: '🌍', label: 'Social Impact World',      desc: "For changemakers who want to make the world better",    color: '#10b981', anim: '🤝' },
  { id: 'sportsWellness', icon: '⚽', label: 'Sports & Wellness World',  desc: "For movers who love energy and performance",            color: '#f97316', anim: '🏆' },
];

const SUBJECTS = [
  { name: 'Mathematics',    icon: '📐', color: '#38bdf8', score: 68, trend: '↑', attendance: 81, nepLevel: 'Developing'  },
  { name: 'Science',        icon: '🔬', color: '#10b981', score: 74, trend: '↑', attendance: 85, nepLevel: 'Achieving'   },
  { name: 'English',        icon: '📖', color: '#ec4899', score: 82, trend: '→', attendance: 90, nepLevel: 'Mastering'   },
  { name: 'Social Studies', icon: '🗺️', color: '#f59e0b', score: 65, trend: '↓', attendance: 77, nepLevel: 'Developing'  },
  { name: 'Hindi',          icon: '🪔', color: '#a78bfa', score: 71, trend: '↑', attendance: 83, nepLevel: 'Achieving'   },
];

const NEP_COLORS = { Exploring: '#ef4444', Developing: '#f59e0b', Achieving: '#10b981', Mastering: '#7C3AED' };

const NAV_ITEMS = [
  { icon: '🏠', label: 'My Hub',         id: 'hub'      },
  { icon: '🧬', label: 'My DNA',         id: 'dna'      },
  { icon: '🌍', label: 'Career Families',id: 'careers'  },
  { icon: '📊', label: 'My Stats',       id: 'stats'    },
  { icon: '🎯', label: 'Missions',       id: 'missions' },
  { icon: '🏆', label: 'Achievements',   id: 'achieve'  },
  { icon: '📅', label: 'Attendance',     id: 'attend'   },
];

export default function ExplorerHub() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState('hub');
  const [mood, setMood]                 = useState(null);
  const [studentData, setStudentData]   = useState(null);
  const [geminiMsg, setGeminiMsg]       = useState('');
  const [loading, setLoading]           = useState(true);

  const firstName = user?.name?.split(' ')[0] || 'Explorer';

  useEffect(() => {
    const token = localStorage.getItem('ep_token') || sessionStorage.getItem('ep_token');
    if (!token) return;
    fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` }})
      .then(r => r.json()).then(d => {
        if (d.studentData) setStudentData(d.studentData);
        setLoading(false);
      }).catch(() => setLoading(false));
  }, []);

  const xp          = studentData?.xpPoints     || 280;
  const level       = studentData?.level        || 3;
  const streak      = studentData?.streakDays   || 5;
  const healthScore = studentData?.academicHealthScore || 68;
  const cluster     = studentData?.cluster      || 'medium';
  const dna         = studentData?.academicDNA  || {};
  const families    = studentData?.careerFamilies || {};

  const clusterLabel = { top: "You're in the Peak Zone! 🚀", medium: "You're in the Discovery Zone! 🔭 Keep exploring!", below: "You're in the Growth Zone! 🌱 Rise up!" };

  const handleMood = async (val) => {
    setMood(val);
    try { await API.post('/school/mood/log', { studentId: studentData?._id || user?._id, numericScore: val, mood: val >= 4 ? 'engaged' : val <= 2 ? 'struggling' : 'focused', note: '' }); } catch {}
  };

  if (!user) { navigate('/login'); return null; }

  const section = (id) => activeSection === id;

  return (
    <div style={{ minHeight: '100vh', background: BG, color: '#f8fafc', fontFamily: "'Nunito', sans-serif", display: 'flex' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800&display=swap');
        @keyframes nebula{0%,100%{opacity:0.3;transform:scale(1)}50%{opacity:0.5;transform:scale(1.05)}}
        @keyframes starTwink{0%,100%{opacity:0.2}50%{opacity:0.8}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
        @keyframes xpFill{from{width:0}to{width:var(--xp-target)}}
        .hub-card:hover{border-color:rgba(255,255,255,0.18)!important;transform:translateY(-3px);transition:all 0.2s;}
        .nav-item:hover{background:rgba(255,255,255,0.08)!important;}
        .subject-card:hover{border-color:rgba(255,255,255,0.15)!important;background:rgba(255,255,255,0.07)!important;}
      `}</style>

      {/* Stars bg */}
      {Array.from({length:20},(_,i) => (
        <div key={i} style={{ position:'fixed', top:`${Math.random()*90}%`, left:`${Math.random()*90}%`, width:'2px', height:'2px', borderRadius:'50%', background:'#fff', opacity:0.4, animation:`starTwink ${2+i*0.2}s ease-in-out infinite`, animationDelay:`${i*0.15}s`, pointerEvents:'none', zIndex:0 }} />
      ))}
      {/* Nebula gradients */}
      <div style={{ position:'fixed', top:'-10%', right:'-10%', width:'500px', height:'500px', background:'radial-gradient(circle,rgba(124,58,237,0.12),transparent 70%)', animation:'nebula 8s ease-in-out infinite', pointerEvents:'none', zIndex:0 }} />
      <div style={{ position:'fixed', bottom:'-10%', left:'-10%', width:'400px', height:'400px', background:'radial-gradient(circle,rgba(20,184,166,0.10),transparent 70%)', animation:'nebula 10s ease-in-out infinite', animationDelay:'3s', pointerEvents:'none', zIndex:0 }} />

      {/* ── LEFT SIDEBAR ────────────────────────────────────── */}
      <aside style={{ width:'240px', minHeight:'100vh', background:'rgba(0,0,0,0.3)', borderRight:BORDER, padding:'24px 16px', display:'flex', flexDirection:'column', gap:'24px', position:'sticky', top:0, zIndex:10, flexShrink:0 }}>
        {/* Student card */}
        <div style={{ ...glass('16px'), textAlign:'center' }}>
          <div style={{ fontSize:'40px', marginBottom:'8px' }}>{user?.avatar || '🧑‍🚀'}</div>
          <div style={{ fontWeight:800, fontSize:'15px' }}>{user?.name}</div>
          <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.45)', marginBottom:'10px' }}>Class {studentData?.class || '7'} · Section {studentData?.section || 'B'}</div>
          <div style={{ display:'inline-block', background:'rgba(124,58,237,0.2)', border:'1px solid rgba(124,58,237,0.4)', borderRadius:'99px', padding:'3px 12px', fontSize:'11px', fontWeight:700, color:COLORS.purple, marginBottom:'10px' }}>
            🚀 Explorer Level {level}
          </div>
          {/* XP bar */}
          <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', marginBottom:'4px', textAlign:'left' }}>XP {xp} / {level * 500}</div>
          <div style={{ height:'6px', background:'rgba(255,255,255,0.06)', borderRadius:'3px', overflow:'hidden', marginBottom:'8px' }}>
            <div style={{ height:'100%', width:`${Math.min(100,(xp%(level*500))/(level*5))}%`, background:'linear-gradient(90deg,#7C3AED,#EC4899)', borderRadius:'3px', transition:'width 1s' }} />
          </div>
          <div style={{ fontSize:'12px', color:COLORS.gold, fontWeight:700 }}>🔥 {streak} day streak</div>
        </div>

        {/* Nav */}
        <nav style={{ display:'flex', flexDirection:'column', gap:'4px' }}>
          {NAV_ITEMS.map(item => (
            <button key={item.id} className="nav-item" onClick={() => setActiveSection(item.id)}
              style={{ background:activeSection===item.id?'rgba(124,58,237,0.2)':'transparent', border:activeSection===item.id?'1px solid rgba(124,58,237,0.3)':BORDER, borderRadius:'10px', padding:'10px 14px', color:activeSection===item.id?COLORS.purple:'rgba(255,255,255,0.6)', fontSize:'13px', fontWeight:activeSection===item.id?800:600, cursor:'pointer', textAlign:'left', display:'flex', alignItems:'center', gap:'10px', transition:'all 0.15s' }}>
              {item.icon} {item.label}
            </button>
          ))}
        </nav>

        <button onClick={logout} style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:'10px', padding:'10px', color:'#ef4444', fontSize:'13px', fontWeight:700, cursor:'pointer', marginTop:'auto' }}>
          Sign Out
        </button>
      </aside>

      {/* ── MAIN CONTENT ───────────────────────────────────── */}
      <main style={{ flex:1, padding:'32px', overflowY:'auto', position:'relative', zIndex:1 }}>

        {/* ── HUB (Home) ───────────────────────────────────── */}
        {section('hub') && (
          <div style={{ animation:'fadeUp 0.4s ease' }}>
            {/* Today's Focus */}
            <div style={{ ...glass('24px'), marginBottom:'20px', borderLeft:`3px solid ${COLORS.purple}` }}>
              <div style={{ fontSize:'11px', color:COLORS.purple, fontWeight:700, letterSpacing:'1px', marginBottom:'8px' }}>✨ TODAY'S FOCUS</div>
              <div style={{ fontSize:'15px', lineHeight:1.7, color:'rgba(255,255,255,0.85)' }}>
                Hey <strong style={{ color:'#fff' }}>{firstName}</strong>! Your Science score jumped 8% this week 🎉 Focus on Mathematics today — you're only 2 lessons away from your next badge! Your streak is amazing at <strong style={{ color:COLORS.gold }}>{streak} days</strong> 🔥
              </div>
            </div>

            {/* Zone Quick Access */}
            <div style={{ ...glass('20px'), marginBottom:'20px' }}>
              <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', fontWeight:700, letterSpacing:'1px', marginBottom:'14px' }}>🚀 LEARNING ZONES</div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(150px,1fr))', gap:'10px' }}>
                {[
                  { icon:'🔬', label:'Science Lab',    path:'/school/science',    color:'#38bdf8', sub:'Physics, Chemistry, Biology' },
                  { icon:'📐', label:'Math Arena',     path:'/school/math-arena', color:'#c084fc', sub:'Algebra, Geometry, Stats' },
                  { icon:'🌍', label:'History Quest',  path:'#',                  color:'#f59e0b', sub:'Coming Soon' },
                  { icon:'📖', label:'Language Arts',  path:'#',                  color:'#ec4899', sub:'Coming Soon' },
                ].map(zone => (
                  <div key={zone.label} onClick={()=>zone.path!=='#'&&navigate(zone.path)} style={{ background:`${zone.color}11`, border:`2px solid ${zone.color}33`, borderRadius:'14px', padding:'14px 12px', cursor:zone.path!=='#'?'pointer':'default', textAlign:'center', opacity:zone.path==='#'?0.5:1, transition:'all 0.2s' }}
                    onMouseEnter={e=>{ if(zone.path!=='#') e.currentTarget.style.borderColor=zone.color; }}
                    onMouseLeave={e=>{ e.currentTarget.style.borderColor=`${zone.color}33`; }}>
                    <div style={{ fontSize:'28px', marginBottom:'6px' }}>{zone.icon}</div>
                    <div style={{ fontSize:'13px', fontWeight:700, color:zone.color, marginBottom:'3px' }}>{zone.label}</div>
                    <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.35)' }}>{zone.sub}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Mood check-in row */}
            <div style={{ ...glass('20px'), marginBottom:'20px' }}>
              <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.4)', fontWeight:700, letterSpacing:'1px', marginBottom:'16px' }}>HOW ARE YOU FEELING TODAY?</div>
              <MoodFaces variant="5-face" size="md" selected={mood} onSelect={handleMood} />
            </div>

            {/* Academic Health Card + Subjects */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 2fr', gap:'20px', marginBottom:'20px' }}>
              {/* Health score ring */}
              <div style={{ ...glass('24px'), display:'flex', flexDirection:'column', alignItems:'center', gap:'16px' }}>
                <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', fontWeight:700, letterSpacing:'1px' }}>ACADEMIC HEALTH</div>
                <div style={{ position:'relative', width:'90px', height:'90px' }}>
                  <svg viewBox="0 0 90 90" style={{ transform:'rotate(-90deg)' }}>
                    <circle cx="45" cy="45" r="36" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="7" />
                    <circle cx="45" cy="45" r="36" fill="none"
                      stroke={healthScore>=75?'#10b981':healthScore>=55?COLORS.gold:'#ef4444'}
                      strokeWidth="7" strokeLinecap="round"
                      strokeDasharray={`${2*Math.PI*36}`}
                      strokeDashoffset={`${2*Math.PI*36*(1-healthScore/100)}`}
                      style={{ transition:'stroke-dashoffset 1.2s ease', filter:'drop-shadow(0 0 6px currentColor)' }} />
                  </svg>
                  <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
                    <span style={{ fontSize:'22px', fontWeight:800 }}>{healthScore}</span>
                  </div>
                </div>
                <div style={{ textAlign:'center' }}>
                  <div style={{ fontSize:'13px', fontWeight:800, color:healthScore>=75?'#10b981':healthScore>=55?COLORS.gold:'#ef4444' }}>
                    {healthScore>=75?'Optimal 🚀':healthScore>=55?'Growing 📈':'Needs Boost ⚡'}
                  </div>
                  <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', marginTop:'6px', lineHeight:1.5 }}>
                    {clusterLabel[cluster]}
                  </div>
                </div>
              </div>

              {/* Subject cards feed */}
              <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
                {SUBJECTS.map(subj => (
                  <div key={subj.name} className="subject-card" style={{ ...glass('12px 16px'), display:'flex', alignItems:'center', gap:'14px', transition:'all 0.2s', cursor:'pointer' }}>
                    <span style={{ fontSize:'22px' }}>{subj.icon}</span>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:'13px', fontWeight:700 }}>{subj.name}</div>
                      <div style={{ display:'flex', gap:'8px', alignItems:'center', marginTop:'3px' }}>
                        <div style={{ background:NEP_COLORS[subj.nepLevel]+'22', border:`1px solid ${NEP_COLORS[subj.nepLevel]}44`, borderRadius:'99px', padding:'1px 8px', fontSize:'10px', color:NEP_COLORS[subj.nepLevel], fontWeight:700 }}>{subj.nepLevel}</div>
                        <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.35)' }}>Attendance: {subj.attendance}%</span>
                      </div>
                    </div>
                    <div style={{ textAlign:'right' }}>
                      <div style={{ fontSize:'18px', fontWeight:800, color:subj.color }}>{subj.score}% <span style={{ fontSize:'12px' }}>{subj.trend}</span></div>
                      <button style={{ background:`${subj.color}22`, border:`1px solid ${subj.color}44`, borderRadius:'8px', padding:'3px 10px', fontSize:'10px', color:subj.color, fontWeight:700, cursor:'pointer', marginTop:'4px' }}>Practice →</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── DNA (Academic DNA) ───────────────────────── */}
        {section('dna') && (
          <div style={{ animation:'fadeUp 0.4s ease' }}>
            <h2 style={{ fontSize:'22px', fontWeight:800, marginBottom:'8px' }}>🧬 Your Academic DNA</h2>
            <p style={{ color:'rgba(255,255,255,0.45)', fontSize:'14px', marginBottom:'28px' }}>8 dimensions that reveal your unique learning fingerprint</p>
            <div style={{ display:'grid', gridTemplateColumns:'auto 1fr', gap:'32px', alignItems:'start' }}>
              <AcademicDNA data={dna} world="6-8" size={300} animated />
              <div style={{ display:'grid', gap:'10px' }}>
                {[
                  { key:'focusPower', label:'🎯 Focus Power',         tip:'How consistently you engage with tasks' },
                  { key:'pressurePerformer', label:'💪 Pressure Performer', tip:'How well you do under exam conditions' },
                  { key:'teamPlayer', label:'🤝 Team Player',          tip:'Collaborative learning and group work' },
                  { key:'selfNavigator', label:'🧭 Self Navigator',      tip:'Self-direction and independent learning' },
                  { key:'comebackKid', label:'🔄 Comeback Kid',         tip:'Recovery from low performance' },
                  { key:'subjectExplorer', label:'🌈 Subject Explorer',    tip:'Breadth of academic interests' },
                  { key:'quickResponder', label:'⚡ Quick Responder',     tip:'Early warning — how fast you act on alerts' },
                  { key:'growthSeeker', label:'📈 Growth Seeker',        tip:'Week-on-week improvement momentum' },
                ].map(dim => {
                  const val = dna[dim.key] || 55;
                  return (
                    <div key={dim.key} style={{ ...glass('10px 14px'), display:'flex', alignItems:'center', gap:'12px' }}>
                      <span style={{ fontSize:'15px', width:'20px' }}>{dim.label.split(' ')[0]}</span>
                      <div style={{ flex:1 }}>
                        <div style={{ fontSize:'12px', fontWeight:700, marginBottom:'4px' }}>{dim.label.slice(3)}</div>
                        <div style={{ height:'5px', background:'rgba(255,255,255,0.06)', borderRadius:'3px', overflow:'hidden' }}>
                          <div style={{ height:'100%', width:`${val}%`, background:'linear-gradient(90deg,#7C3AED,#14B8A6)', borderRadius:'3px', transition:'width 1.2s ease' }} />
                        </div>
                      </div>
                      <span style={{ fontSize:'14px', fontWeight:800, color:'rgba(255,255,255,0.7)', minWidth:'36px', textAlign:'right' }}>{val}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── CAREER FAMILIES ──────────────────────────── */}
        {section('careers') && (
          <div style={{ animation:'fadeUp 0.4s ease' }}>
            <h2 style={{ fontSize:'22px', fontWeight:800, marginBottom:'8px' }}>🌍 Career Families Discovery</h2>
            <p style={{ color:'rgba(255,255,255,0.45)', fontSize:'14px', marginBottom:'28px' }}>Discover which world calls to you — there's no wrong answer</p>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(260px,1fr))', gap:'20px' }}>
              {CAREER_FAMILIES.map(cf => {
                const match = families[cf.id] || Math.floor(40 + Math.random() * 55);
                return (
                  <div key={cf.id} className="hub-card" style={{ ...glass('24px'), borderColor:`${cf.color}22`, position:'relative', overflow:'hidden', cursor:'pointer' }}>
                    {/* Background anim icon */}
                    <div style={{ position:'absolute', top:'-10px', right:'-10px', fontSize:'80px', opacity:0.06, userSelect:'none' }}>{cf.anim}</div>
                    <div style={{ fontSize:'36px', marginBottom:'12px' }}>{cf.icon}</div>
                    <div style={{ fontSize:'16px', fontWeight:800, marginBottom:'6px' }}>{cf.label}</div>
                    <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.45)', lineHeight:1.6, marginBottom:'16px' }}>{cf.desc}</div>
                    {/* Match score */}
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px' }}>
                      <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', fontWeight:600 }}>MATCH</span>
                      <span style={{ fontSize:'18px', fontWeight:800, color:cf.color }}>{match}%</span>
                    </div>
                    <div style={{ height:'6px', background:'rgba(255,255,255,0.06)', borderRadius:'3px', overflow:'hidden' }}>
                      <div style={{ height:'100%', width:`${match}%`, background:cf.color, borderRadius:'3px', boxShadow:`0 0 8px ${cf.color}88`, transition:'width 1s ease' }} />
                    </div>
                    <button style={{ width:'100%', marginTop:'14px', background:`${cf.color}22`, border:`1px solid ${cf.color}44`, borderRadius:'10px', padding:'9px', color:cf.color, fontWeight:700, fontSize:'12px', cursor:'pointer' }}>
                      Explore This World →
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── ATTENDANCE ───────────────────────────────── */}
        {section('attend') && (
          <div style={{ animation:'fadeUp 0.4s ease' }}>
            <h2 style={{ fontSize:'22px', fontWeight:800, marginBottom:'24px' }}>📅 Attendance Overview</h2>
            <div style={{ display:'grid', gap:'16px' }}>
              {SUBJECTS.map(subj => (
                <div key={subj.name} style={{ ...glass('20px'), display:'flex', alignItems:'center', gap:'20px' }}>
                  <span style={{ fontSize:'26px' }}>{subj.icon}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:700, marginBottom:'6px' }}>{subj.name}</div>
                    <div style={{ height:'8px', background:'rgba(255,255,255,0.06)', borderRadius:'4px', overflow:'hidden' }}>
                      <div style={{ height:'100%', width:`${subj.attendance}%`, background:subj.attendance>=85?'#10b981':subj.attendance>=75?COLORS.gold:'#ef4444', borderRadius:'4px', transition:'width 1s' }} />
                    </div>
                  </div>
                  <div style={{ textAlign:'right', minWidth:'60px' }}>
                    <div style={{ fontSize:'22px', fontWeight:800, color:subj.attendance>=85?'#10b981':subj.attendance>=75?COLORS.gold:'#ef4444' }}>{subj.attendance}%</div>
                    <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.3)' }}>{subj.attendance>=75?'CLEAR':'AT RISK'}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── MISSIONS & ACHIEVEMENTS (stubs) ──────────── */}
        {(section('missions') || section('achieve') || section('stats')) && (
          <div style={{ animation:'fadeUp 0.4s ease', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'60vh', gap:'16px' }}>
            <div style={{ fontSize:'64px' }}>{section('missions')?'🎯':section('achieve')?'🏆':'📊'}</div>
            <div style={{ fontSize:'22px', fontWeight:800 }}>{section('missions')?'Missions':'section(achieve)'?'Achievements':'My Stats'}</div>
            <div style={{ color:'rgba(255,255,255,0.4)', fontSize:'14px' }}>Coming soon in the next update! 🚀</div>
          </div>
        )}
      </main>

      {/* ── RIGHT PANEL ─────────────────────────────────── */}
      <aside style={{ width:'260px', padding:'24px 16px', borderLeft:BORDER, background:'rgba(0,0,0,0.2)', display:'flex', flexDirection:'column', gap:'16px', position:'sticky', top:0, zIndex:10, height:'100vh', overflowY:'auto', flexShrink:0 }}>
        {/* Upcoming missions */}
        <div style={glass('16px')}>
          <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', fontWeight:700, letterSpacing:'1px', marginBottom:'12px' }}>🎯 UPCOMING</div>
          {DEMO_MISSIONS.map((m,i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'10px' }}>
              <span style={{ fontSize:'18px' }}>{m.icon}</span>
              <div>
                <div style={{ fontSize:'12px', fontWeight:700 }}>{m.title}</div>
                <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.35)' }}>{m.due} · +{m.xp} XP</div>
              </div>
            </div>
          ))}
        </div>

        {/* Study streak calendar */}
        <div style={glass('16px')}>
          <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', fontWeight:700, letterSpacing:'1px', marginBottom:'12px' }}>🔥 STREAK CALENDAR</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:'4px' }}>
            {Array.from({length:28},(_,i) => (
              <div key={i} style={{ width:'24px', height:'24px', borderRadius:'4px', background:i<streak?'rgba(124,58,237,0.6)':'rgba(255,255,255,0.05)', border:i<streak?'1px solid rgba(124,58,237,0.4)':'1px solid rgba(255,255,255,0.06)' }} />
            ))}
          </div>
          <div style={{ fontSize:'12px', color:COLORS.purple, fontWeight:700, marginTop:'10px' }}>🔥 {streak} days and counting!</div>
        </div>

        {/* Quick mood log */}
        <div style={glass('16px')}>
          <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', fontWeight:700, letterSpacing:'1px', marginBottom:'12px' }}>😊 QUICK MOOD</div>
          <MoodFaces variant="5-face" size="sm" selected={mood} onSelect={handleMood} />
        </div>
      </aside>

      <MoodCamera studentId={studentData?._id || user?._id} sessionId={null} world="6-8" onMood={() => {}} />
      <SparkyChat world="6-8" subject="Class 6-8 Science, Math, Social Studies, English" studentName={firstName} />
    </div>
  );
}

const DEMO_MISSIONS = [
  { icon:'📐', title:'5 Math problems', due:'Today',    xp:30 },
  { icon:'📖', title:'Read Ch. 4',      due:'Tomorrow', xp:25 },
  { icon:'🔬', title:'Lab report draft', due:'Fri',     xp:40 },
];
