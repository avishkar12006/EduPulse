import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import SparkyRobot from '../../components/SparkyRobot';
import MoodFaces   from '../../components/MoodFaces';
import MoodCamera  from '../../components/MoodCamera';
import SparkyChat  from '../../components/SparkyChat';
import API from '../../utils/api';

const FONT = "'Fredoka One', cursive, 'Segoe UI', sans-serif";

const ZONES = [
  { id: 'castle',   icon: '🏰', label: 'Learning Castle',   desc: "Today's Lesson",    x: '38%', y: '8%',  color: '#FF6B6B', path: '/school/lesson'     },
  { id: 'forest',   icon: '🌳', label: 'Quest Forest',       desc: "Today's Missions",  x: '8%',  y: '18%', color: '#00E5A0', path: '/school/quests'     },
  { id: 'kingdom',  icon: '🔢', label: 'Number Kingdom',     desc: 'Math Fun!',          x: '68%', y: '18%', color: '#FFD700', path: '/school/math'       },
  { id: 'river',    icon: '📚', label: 'Reading River',       desc: 'Stories & Words',   x: '5%',  y: '55%', color: '#87CEEB', path: '/school/reading'    },
  { id: 'garden',   icon: '🌿', label: 'Discovery Garden',   desc: 'Science & Nature',  x: '72%', y: '55%', color: '#98FB98', path: '/school/discovery'  },
  { id: 'trophies', icon: '🏆', label: 'Trophy Room',        desc: 'My Badges!',        x: '38%', y: '75%', color: '#c084fc', path: '/school/achievements'},
];

const SPARKY_MESSAGES = {
  happy:     name => `Hi ${name}! Ready for an amazing adventure today? ⭐`,
  sad:       name => `Sparky is here for you, ${name}! Every day is a new adventure! 💙`,
  celebrate: name => `AMAZING, ${name}! You are a SUPERSTAR! 🌟🎉`,
  confused:  name => `${name}, let's figure this out together! Sparky believes in you! 💡`,
  wave:      name => `Welcome back, ${name}! Your world has been waiting! 🌈`,
};

const DEMO_QUESTS = [
  { id: 1, icon: '📖', title: 'Read 5 pages aloud',          xp: 30, due: 'by sunset today', done: false, subject: 'English', progress: 60  },
  { id: 2, icon: '🔢', title: 'Solve 10 addition puzzles',   xp: 25, due: 'by sunset today', done: true,  subject: 'Math',    progress: 100 },
  { id: 3, icon: '🌿', title: 'Draw your favourite animal',  xp: 20, due: 'by tomorrow',     done: false, subject: 'EVS',     progress: 0   },
];

const BADGES_DEMO = [
  { id: 'reading_star',   name: 'Reading Star',      icon: '⭐', earned: true  },
  { id: 'math_wizard',    name: 'Math Wizard',        icon: '🧙', earned: false },
  { id: 'explorer',       name: 'Perfect Explorer',   icon: '🗺️', earned: true  },
  { id: 'mood_master',    name: 'Mood Master',        icon: '😊', earned: false },
  { id: 'quest_champion', name: 'Quest Champion',     icon: '🏆', earned: false },
  { id: 'reading_champ',  name: 'Reading Champion',   icon: '📖', earned: false },
];

export default function SparkyWorld() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mood, setMood]               = useState(null);
  const [section, setSection]         = useState('map');
  const [sparkyMood, setSparkyMood]   = useState('wave');
  const [bubble, setBubble]           = useState('');
  const [studentData, setStudentData] = useState(null);
  const [hovered, setHovered]         = useState(null);
  const [completing, setCompleting]   = useState(null);
  const firstName = user?.name?.split(' ')[0] || 'Explorer';

  useEffect(() => {
    setBubble(SPARKY_MESSAGES.wave(firstName));
    const token = localStorage.getItem('ep_token') || sessionStorage.getItem('ep_token');
    if (!token) return;
    fetch('/api/auth/me', { headers: { Authorization: `Bearer ${token}` }})
      .then(r => r.json()).then(d => { if (d.studentData) setStudentData(d.studentData); }).catch(() => {});
  }, []);

  const xp     = studentData?.xpPoints || 150;
  const level  = studentData?.level || 2;
  const streak = studentData?.streakDays || 3;
  const nipun  = studentData?.nipunLevels || { reading: 3, numberSense: 2, oralComm: 4 };

  const handleMoodSelect = async (val) => {
    setMood(val);
    const moods = { 5: 'celebrate', 4: 'happy', 3: 'wave', 2: 'sad', 1: 'confused' };
    const sm    = moods[val] || 'happy';
    setSparkyMood(sm);
    setBubble(SPARKY_MESSAGES[sm]?.(firstName) || `You're amazing, ${firstName}! 🌟`);
    setSection('map');
    try { await API.post('/school/mood/log', { studentId: studentData?._id || user?._id, numericScore: val, mood: sm, note: '' }); } catch {}
  };

  const handleZoneClick = (zone) => {
    setBubble(`Let's explore the ${zone.label}! Off we go! 🚀`);
    setSparkyMood('happy');
    setTimeout(() => navigate(zone.path), 600);
  };

  const handleQuestComplete = async (quest) => {
    if (completing === quest.id) return;
    setCompleting(quest.id);
    setBubble(`Quest complete! You earned ${quest.xp} XP! 🎉`);
    setSparkyMood('celebrate');
    try { await API.post('/school/quest/complete', { studentId: studentData?._id || user?._id, questId: quest.id }); } catch {}
    setTimeout(() => { setCompleting(null); setSparkyMood('happy'); setBubble(`Keep going, ${firstName}! You are AMAZING! ⭐`); }, 2000);
  };

  if (!user) { navigate('/login'); return null; }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(180deg,#87CEEB 0%,#b0e2f7 35%,#c8f0d8 65%,#e8f5e9 100%)', fontFamily: FONT, overflow: 'hidden', position: 'relative' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&display=swap');
        @keyframes cloudFloat{0%,100%{transform:translateX(0)}50%{transform:translateX(18px)}}
        @keyframes treeSway{0%,100%{transform:rotate(-2deg)}50%{transform:rotate(2deg)}}
        @keyframes waterFlow{0%{background-position:0%}100%{background-position:100%}}
        @keyframes starTwinkle{0%,100%{opacity:0.4;transform:scale(1)}50%{opacity:1;transform:scale(1.3)}}
        @keyframes bounce{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        .zone-btn:hover{transform:scale(1.1) translateY(-4px)!important;}
        .quest-card{transition:all 0.2s;}.quest-card:hover{transform:scale(1.02);}
      `}</style>

      {/* Clouds */}
      {[['18%','5%',48,6],['40%','30%',36,8],['15%','65%',56,7]].map(([top,left,sz,dur],i) => (
        <div key={i} style={{ position:'absolute', top, left, fontSize:`${sz}px`, opacity:0.7, animation:`cloudFloat ${dur}s ease-in-out infinite`, animationDelay:`${i*1.5}s`, pointerEvents:'none', zIndex:0 }}>☁️</div>
      ))}
      {Array.from({length:8},(_,i) => (
        <div key={i} style={{ position:'absolute', top:`${10+i*8}%`, left:`${5+i*12}%`, fontSize:'16px', opacity:0.4, animation:`starTwinkle ${2+i*0.4}s ease-in-out infinite`, animationDelay:`${i*0.3}s`, pointerEvents:'none', zIndex:0 }}>⭐</div>
      ))}

      {/* Header */}
      <div style={{ position:'sticky', top:0, zIndex:50, background:'rgba(255,255,255,0.7)', backdropFilter:'blur(12px)', borderBottom:'3px solid rgba(255,255,255,0.8)', padding:'12px 24px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <span style={{ fontSize:'28px' }}>⚡</span>
          <span style={{ fontSize:'22px', fontWeight:700, color:'#FF6B6B' }}>EduPulse</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'16px' }}>
          <div style={{ display:'flex', flexDirection:'column', gap:'2px' }}>
            <div style={{ fontSize:'11px', color:'#555', fontFamily:'sans-serif' }}>⭐ Level {level}</div>
            <div style={{ width:'100px', height:'8px', background:'#e2e8f0', borderRadius:'4px', overflow:'hidden' }}>
              <div style={{ width:`${Math.min(100,(xp%500)/5)}%`, height:'100%', background:'linear-gradient(90deg,#FFD700,#FF6B6B)', borderRadius:'4px', transition:'width 1s' }} />
            </div>
          </div>
          <div style={{ fontSize:'13px', color:'#FF6B6B', fontWeight:700 }}>🔥 {streak}</div>
          <button onClick={logout} style={{ background:'none', border:'none', fontSize:'22px', cursor:'pointer' }}>🚪</button>
        </div>
      </div>

      {/* WORLD MAP */}
      {section === 'map' && (
        <div style={{ position:'relative', height:'calc(100vh - 70px)', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <div style={{ position:'absolute', bottom:0, left:0, right:0, height:'38%', background:'linear-gradient(180deg,#90EE90 0%,#228B22 100%)', borderRadius:'50% 50% 0 0/30% 30% 0 0' }} />
          <div style={{ position:'absolute', bottom:'18%', left:'12%', width:'25%', height:'48px', background:'linear-gradient(90deg,#87CEEB,#00bfff,#87CEEB)', backgroundSize:'200%', borderRadius:'24px', opacity:0.8, animation:'waterFlow 3s linear infinite' }} />

          {/* Sparky center */}
          <div style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', zIndex:10, display:'flex', flexDirection:'column', alignItems:'center', gap:'8px', cursor:'pointer' }} onClick={() => setSection('moodcheck')}>
            <div style={{ animation:'bounce 3s ease-in-out infinite' }}><SparkyRobot mood={sparkyMood} size={140} /></div>
            {bubble && (
              <div style={{ background:'#fff', border:'3px solid #FF6B6B', borderRadius:'20px', padding:'10px 18px', fontSize:'15px', color:'#333', maxWidth:'260px', textAlign:'center', lineHeight:1.5, boxShadow:'0 4px 16px rgba(0,0,0,0.12)', animation:'fadeIn 0.4s ease', position:'relative' }}>
                <div style={{ position:'absolute', bottom:'-14px', left:'50%', transform:'translateX(-50%)', borderTop:'14px solid #FF6B6B', borderLeft:'10px solid transparent', borderRight:'10px solid transparent' }} />
                {bubble}
              </div>
            )}
          </div>

          {/* Zones */}
          {ZONES.map(zone => (
            <button key={zone.id} className="zone-btn" onClick={() => handleZoneClick(zone)}
              onMouseEnter={() => { setHovered(zone.id); setBubble(`Let's go to the ${zone.label}! 🌟`); setSparkyMood('happy'); }}
              onMouseLeave={() => setHovered(null)}
              style={{ position:'absolute', left:zone.x, top:zone.y, background:`linear-gradient(135deg,${zone.color},${zone.color}cc)`, border:`4px solid ${hovered===zone.id?'#fff':zone.color}`, borderRadius:'24px', padding:'16px 20px', display:'flex', flexDirection:'column', alignItems:'center', gap:'6px', cursor:'pointer', zIndex:5, transition:'all 0.25s cubic-bezier(0.34,1.56,0.64,1)', boxShadow:`0 6px 24px ${zone.color}66` }}>
              <span style={{ fontSize:'36px' }}>{zone.icon}</span>
              <span style={{ fontSize:'13px', fontWeight:700, color:'#333', textAlign:'center', lineHeight:1.2 }}>{zone.label}</span>
              <span style={{ fontSize:'11px', color:'#555', textAlign:'center' }}>{zone.desc}</span>
            </button>
          ))}

          {['8%','88%'].map((x,i) => (
            <div key={i} style={{ position:'absolute', bottom:'30%', left:x, fontSize:'48px', animation:`treeSway ${3+i}s ease-in-out infinite`, animationDelay:`${i*0.8}s`, zIndex:3, pointerEvents:'none' }}>🌲</div>
          ))}
        </div>
      )}

      {/* MOOD CHECK-IN */}
      {section === 'moodcheck' && (
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'calc(100vh - 70px)', padding:'40px', gap:'32px', animation:'fadeIn 0.4s ease' }}>
          <div style={{ fontSize:'32px', fontWeight:700, color:'#FF6B6B', textAlign:'center' }}>Hey {firstName}! How are you feeling? 🌈</div>
          <SparkyRobot mood={sparkyMood} size={120} />
          <MoodFaces variant="3-face" size="lg" selected={mood} onSelect={handleMoodSelect} />
          {mood && (
            <div style={{ background:'#fff', borderRadius:'20px', padding:'16px 28px', fontSize:'16px', color:'#333', textAlign:'center', maxWidth:'320px', boxShadow:'0 4px 20px rgba(0,0,0,0.1)', animation:'fadeIn 0.4s ease' }}>
              {bubble}
              <button onClick={() => setSection('map')} style={{ display:'block', margin:'16px auto 0', background:'#FF6B6B', color:'#fff', border:'none', borderRadius:'14px', padding:'10px 24px', fontSize:'16px', cursor:'pointer', fontFamily:FONT }}>🚀 Start My Adventure!</button>
            </div>
          )}
          <button onClick={() => setSection('map')} style={{ background:'none', border:'3px solid #ccc', borderRadius:'14px', padding:'10px 24px', fontSize:'14px', color:'#666', cursor:'pointer', fontFamily:FONT }}>← Back to Map</button>
        </div>
      )}

      {/* QUESST PANEL */}
      {section === 'quests' && (
        <div style={{ maxWidth:'640px', margin:'0 auto', padding:'32px 24px', animation:'fadeIn 0.4s ease' }}>
          <div style={{ fontSize:'28px', fontWeight:700, color:'#00875A', marginBottom:'24px', textAlign:'center' }}>🌳 Quest Forest 🌳</div>
          {DEMO_QUESTS.map(q => (
            <div key={q.id} className="quest-card" style={{ background:'rgba(255,255,255,0.85)', borderRadius:'20px', padding:'20px', marginBottom:'16px', border:`3px solid ${q.done?'#00E5A0':'#e2e8f0'}`, boxShadow:'0 4px 20px rgba(0,0,0,0.08)' }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'12px' }}>
                <div style={{ display:'flex', gap:'12px', alignItems:'center' }}>
                  <span style={{ fontSize:'28px' }}>{q.icon}</span>
                  <div>
                    <div style={{ fontSize:'17px', fontWeight:700, color:'#222' }}>{q.title}</div>
                    <div style={{ fontSize:'12px', color:'#888', fontFamily:'sans-serif' }}>📅 {q.due}</div>
                  </div>
                </div>
                <div style={{ background:'#FFD700', borderRadius:'12px', padding:'6px 12px', fontSize:'14px', fontWeight:700, color:'#333' }}>⭐ {q.xp} XP</div>
              </div>
              <div style={{ height:'12px', background:'#e2e8f0', borderRadius:'6px', overflow:'hidden', marginBottom:'12px' }}>
                <div style={{ height:'100%', width:`${q.progress}%`, background:q.done?'#00E5A0':'#87CEEB', transition:'width 1s', borderRadius:'6px' }} />
              </div>
              {!q.done ? (
                <button onClick={() => handleQuestComplete(q)} disabled={completing===q.id} style={{ background:'#FF6B6B', color:'#fff', border:'none', borderRadius:'14px', padding:'10px 20px', fontSize:'14px', fontFamily:FONT, cursor:'pointer', width:'100%' }}>
                  {completing===q.id ? '✨ Completing...' : `⚔️ Complete Quest! +${q.xp} XP`}
                </button>
              ) : <div style={{ textAlign:'center', fontSize:'16px', color:'#00E5A0' }}>✅ Quest Complete! Amazing!</div>}
            </div>
          ))}
          <button onClick={() => setSection('map')} style={{ background:'none', border:'3px solid #90EE90', borderRadius:'14px', padding:'10px 24px', fontSize:'14px', color:'#228B22', cursor:'pointer', fontFamily:FONT, marginTop:'8px' }}>← Back to World</button>
        </div>
      )}

      {/* TROPHY ROOM */}
      {section === 'trophies' && (
        <div style={{ maxWidth:'640px', margin:'0 auto', padding:'32px 24px', animation:'fadeIn 0.4s ease' }}>
          <div style={{ fontSize:'28px', fontWeight:700, color:'#c084fc', marginBottom:'24px', textAlign:'center' }}>🏆 Trophy Room 🏆</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:'16px' }}>
            {BADGES_DEMO.map(b => (
              <div key={b.id} style={{ background:b.earned?'rgba(255,255,255,0.9)':'rgba(0,0,0,0.06)', borderRadius:'20px', padding:'20px 12px', border:`3px solid ${b.earned?'#FFD700':'#e2e8f0'}`, textAlign:'center', boxShadow:b.earned?'0 4px 20px rgba(255,215,0,0.3)':'none', opacity:b.earned?1:0.5 }}>
                <div style={{ fontSize:b.earned?'44px':'36px', marginBottom:'8px', filter:b.earned?'none':'grayscale(1)' }}>{b.icon}</div>
                <div style={{ fontSize:'13px', fontWeight:700, color:b.earned?'#333':'#888' }}>{b.name}</div>
                {!b.earned && <div style={{ fontSize:'11px', color:'#aaa', fontFamily:'sans-serif', marginTop:'4px' }}>🔒 Locked</div>}
              </div>
            ))}
          </div>
          <button onClick={() => setSection('map')} style={{ background:'none', border:'3px solid #e2e8f0', borderRadius:'14px', padding:'10px 24px', fontSize:'14px', color:'#888', cursor:'pointer', fontFamily:FONT, marginTop:'24px' }}>← Back to World</button>
        </div>
      )}

      {/* NIPUN Stars */}
      {section === 'map' && (
        <div style={{ position:'fixed', bottom:'24px', left:'24px', zIndex:20, background:'rgba(255,255,255,0.85)', backdropFilter:'blur(8px)', borderRadius:'16px', padding:'12px 16px', border:'2px solid #FFD700', boxShadow:'0 4px 16px rgba(0,0,0,0.1)' }}>
          <div style={{ fontSize:'12px', color:'#888', fontFamily:'sans-serif', marginBottom:'6px' }}>✨ Sparky Stars</div>
          <div style={{ display:'flex', gap:'10px' }}>
            {[{label:'📖',count:nipun.reading},{label:'🔢',count:nipun.numberSense},{label:'🗣️',count:nipun.oralComm}].map((n,i) => (
              <div key={i} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'3px' }}>
                <span style={{ fontSize:'16px' }}>{n.label}</span>
                <div style={{ display:'flex', gap:'2px' }}>
                  {Array.from({length:5},(_,j) => <span key={j} style={{ fontSize:'10px', opacity:j<n.count?1:0.25 }}>⭐</span>)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bottom nav */}
      {section === 'map' && (
        <div style={{ position:'fixed', bottom:'24px', right:'100px', zIndex:20, display:'flex', gap:'8px' }}>
          {[
            {icon:'🎯',label:'Quests',  action:()=>navigate('/school/quests')},
            {icon:'🏆',label:'Trophies',action:()=>navigate('/school/achievements')},
            {icon:'😊',label:'My Mood', action:()=>setSection('moodcheck')},
          ].map(btn => (
            <button key={btn.label} onClick={btn.action} style={{ background:'rgba(255,255,255,0.9)', border:'2px solid #e2e8f0', borderRadius:'14px', padding:'8px 14px', fontSize:'13px', fontFamily:FONT, cursor:'pointer' }}>
              {btn.icon} {btn.label}
            </button>
          ))}
        </div>
      )}

      <MoodCamera studentId={studentData?._id || user?._id} sessionId={null} world="3-5" onMood={m => setSparkyMood(m==='engaged'?'celebrate':m==='frustrated'?'confused':'happy')} />
      <SparkyChat world="3-5" subject="All Subjects (English, Math, EVS)" studentName={firstName} />
    </div>
  );
}
