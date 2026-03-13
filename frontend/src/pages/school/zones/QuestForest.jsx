import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';
import API from '../../../utils/api';

const FONT = "'Fredoka One', cursive";
const BG   = 'linear-gradient(180deg,#2D5016 0%,#3D6B1C 50%,#5A8C2C 100%)';

/* ── Real Quest Definitions ─────────────────────────────────────────────── */
const ALL_QUESTS = [
  // Daily
  { id:'d1', type:'daily',     icon:'🌅', title:'Morning Mind',      desc:'Complete any 1 lesson in Learning Castle',           xp:30, category:'English',  target:1, done:false, color:'#FF6B6B' },
  { id:'d2', type:'daily',     icon:'⚡', title:'Quick Math Hero',   desc:'Score 40+ points in Quick Math game',                xp:30, category:'Math',     target:40, done:false, color:'#FFD700' },
  { id:'d3', type:'daily',     icon:'📖', title:'Story Reader',      desc:'Read and complete 1 story in Reading River',         xp:25, category:'English',  target:1, done:false, color:'#38bdf8' },
  { id:'d4', type:'daily',     icon:'🌿', title:'Science Explorer',  desc:'Explore any 1 topic in Discovery Garden',            xp:25, category:'Science',  target:1, done:false, color:'#10b981' },
  // Weekly
  { id:'w1', type:'weekly',    icon:'🏆', title:'Learning Legend',   desc:'Complete all 6 lessons in Learning Castle this week', xp:100, category:'All', target:6, done:false, color:'#c084fc' },
  { id:'w2', type:'weekly',    icon:'🎮', title:'Game Master',       desc:'Play all 3 Number Kingdom games this week',          xp:80,  category:'Math', target:3, done:false, color:'#FFD700' },
  { id:'w3', type:'weekly',    icon:'📚', title:'Bookworm Award',    desc:'Read all 3 stories in Reading River this week',      xp:75,  category:'English', target:3, done:false, color:'#38bdf8' },
  { id:'w4', type:'weekly',    icon:'🔬', title:'Mini Scientist',    desc:'Complete all science topics and quizzes',            xp:75,  category:'Science', target:3, done:false, color:'#10b981' },
  // NIPUN Milestones
  { id:'n1', type:'nipun',     icon:'⭐', title:'Reading Star',      desc:'Score 3/3 on the Nouns lesson quiz',                 xp:50,  category:'NIPUN',   target:1, done:false, color:'#FF8F00' },
  { id:'n2', type:'nipun',     icon:'🔢', title:'Number Ninja',      desc:'Complete 10 questions in Times Table challenge',     xp:50,  category:'NIPUN',   target:1, done:false, color:'#FF8F00' },
  { id:'n3', type:'nipun',     icon:'🌱', title:'EVS Explorer',      desc:'Complete both EVS lessons (Plants + Solar System)',   xp:60,  category:'NIPUN',   target:2, done:false, color:'#FF8F00' },
];

const TABS = [
  { id:'all',    label:'All Quests',  icon:'🗺️' },
  { id:'daily',  label:'Daily',       icon:'🌅' },
  { id:'weekly', label:'Weekly',      icon:'📅' },
  { id:'nipun',  label:'NIPUN',       icon:'⭐' },
];
const TYPE_BG = { daily:'rgba(255,107,107,0.12)', weekly:'rgba(192,132,252,0.12)', nipun:'rgba(255,143,0,0.12)' };
const TYPE_COLOR = { daily:'#FF6B6B', weekly:'#c084fc', nipun:'#FF8F00' };
const TYPE_LABEL = { daily:'Daily Quest', weekly:'Weekly Mission', nipun:'NIPUN Milestone' };

export default function QuestForest() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tab, setTab]   = useState('all');
  const [done, setDone] = useState({});
  const [completing, setCompleting] = useState(null);
  const [totalXp, setTotalXp] = useState(0);
  const [confetti, setConfetti] = useState(false);

  const quests = tab==='all' ? ALL_QUESTS : ALL_QUESTS.filter(q=>q.type===tab);

  const complete = async (quest) => {
    if (done[quest.id] || completing) return;
    setCompleting(quest.id);
    try {
      await API.post('/school/quest/complete', {
        studentId: user?._id,
        questId: quest.id,
        questType: quest.type,
        xpEarned: quest.xp,
      });
    } catch {}
    setTimeout(() => {
      setDone(d=>({...d,[quest.id]:true}));
      setTotalXp(x=>x+quest.xp);
      setCompleting(null);
      setConfetti(true);
      setTimeout(()=>setConfetti(false), 2000);
    }, 600);
  };

  return (
    <div style={{ minHeight:'100vh', background:BG, fontFamily:FONT, paddingBottom:'80px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes confettiFall{0%{transform:translateY(-20px) rotate(0deg);opacity:1}100%{transform:translateY(60px) rotate(360deg);opacity:0}}
        @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.08)}}
        .quest-card:hover{transform:translateY(-2px);box-shadow:0 8px 28px rgba(0,0,0,0.3)!important;transition:all 0.2s;}
      `}</style>

      {/* Header */}
      <div style={{ background:'rgba(0,0,0,0.4)', backdropFilter:'blur(10px)', padding:'14px 24px', display:'flex', alignItems:'center', gap:'14px', position:'sticky', top:0, zIndex:50, borderBottom:'2px solid rgba(255,255,255,0.1)' }}>
        <button onClick={()=>navigate('/school/sparky-world')} style={{ background:'#388E3C', border:'none', borderRadius:'50px', padding:'8px 20px', color:'#fff', fontSize:'15px', fontFamily:FONT, cursor:'pointer' }}>🌍 World Map</button>
        <span style={{ fontSize:'28px' }}>🌲</span>
        <span style={{ fontSize:'22px', color:'#C8E6C9', textShadow:'0 2px 8px rgba(0,0,0,0.4)' }}>Quest Forest</span>
        {totalXp > 0 && (
          <div style={{ marginLeft:'auto', background:'rgba(255,215,0,0.2)', border:'2px solid #FFD70066', borderRadius:'50px', padding:'6px 16px', fontSize:'16px', color:'#FFD700', animation:'pulse 1s ease-in-out infinite' }}>
            +{totalXp} XP! ⭐
          </div>
        )}
      </div>

      {/* Confetti burst */}
      {confetti && (
        <div style={{ position:'fixed', top:'80px', left:'50%', transform:'translateX(-50%)', zIndex:100, display:'flex', gap:'8px', pointerEvents:'none' }}>
          {['🌟','⭐','🎉','✨','💫','🌈'].map((e,i)=>(
            <span key={i} style={{ fontSize:'28px', animation:`confettiFall 1.5s ease-out ${i*0.1}s forwards`, display:'inline-block' }}>{e}</span>
          ))}
        </div>
      )}

      {/* Stats */}
      <div style={{ maxWidth:'860px', margin:'0 auto', padding:'24px 24px 0' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'12px', marginBottom:'24px' }}>
          {[
            { label:'Quests Done', value:`${Object.keys(done).length}/${ALL_QUESTS.length}`, color:'#C8E6C9' },
            { label:'XP Earned',   value:`${totalXp}`,                                        color:'#FFD700' },
            { label:'Streak',      value:'5 days 🔥',                                         color:'#FF6B6B' },
          ].map((s,i)=>(
            <div key={i} style={{ background:'rgba(255,255,255,0.08)', backdropFilter:'blur(8px)', borderRadius:'18px', padding:'16px', textAlign:'center', border:'2px solid rgba(255,255,255,0.15)' }}>
              <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.5)', letterSpacing:'1px', marginBottom:'4px' }}>{s.label.toUpperCase()}</div>
              <div style={{ fontSize:'22px', color:s.color }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:'8px', marginBottom:'20px', overflowX:'auto' }}>
          {TABS.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{ background:tab===t.id?'rgba(255,255,255,0.2)':'transparent', border:`2px solid ${tab===t.id?'rgba(255,255,255,0.4)':'rgba(255,255,255,0.1)'}`, borderRadius:'50px', padding:'8px 18px', color:tab===t.id?'#fff':'rgba(255,255,255,0.5)', fontSize:'14px', fontFamily:FONT, cursor:'pointer', whiteSpace:'nowrap', transition:'all 0.2s' }}>
              {t.icon} {t.label}
            </button>
          ))}
        </div>

        {/* Quest cards */}
        <div style={{ display:'grid', gap:'14px', animation:'fadeUp 0.4s ease' }}>
          {quests.map(quest => {
            const isCompleted = done[quest.id];
            const isCompletingNow = completing===quest.id;
            return (
              <div key={quest.id} className="quest-card" style={{ background:isCompleted?'rgba(16,185,129,0.12)':TYPE_BG[quest.type], backdropFilter:'blur(10px)', borderRadius:'20px', padding:'18px 22px', border:`2px solid ${isCompleted?'#10b981':quest.color+'44'}`, boxShadow:'0 4px 16px rgba(0,0,0,0.2)', display:'flex', alignItems:'center', gap:'16px' }}>
                {/* Icon */}
                <div style={{ width:'52px', height:'52px', borderRadius:'16px', background:quest.color+'22', border:`2px solid ${quest.color}44`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'28px', flexShrink:0 }}>
                  {isCompleted ? '✅' : quest.icon}
                </div>

                {/* Info */}
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', gap:'8px', alignItems:'center', marginBottom:'3px', flexWrap:'wrap' }}>
                    <span style={{ fontSize:'17px', color:'#fff' }}>{quest.title}</span>
                    <span style={{ background:TYPE_COLOR[quest.type]+'22', border:`1px solid ${TYPE_COLOR[quest.type]}44`, borderRadius:'99px', padding:'2px 10px', fontSize:'10px', color:TYPE_COLOR[quest.type], fontFamily:'sans-serif', fontWeight:700 }}>{TYPE_LABEL[quest.type]}</span>
                  </div>
                  <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.5)', fontFamily:'sans-serif', lineHeight:1.5 }}>{quest.desc}</div>
                </div>

                {/* XP + Action */}
                <div style={{ textAlign:'right', flexShrink:0 }}>
                  <div style={{ fontSize:'18px', color:'#FFD700', marginBottom:'8px' }}>+{quest.xp} XP</div>
                  {isCompleted ? (
                    <div style={{ background:'rgba(16,185,129,0.2)', borderRadius:'12px', padding:'8px 14px', fontSize:'14px', color:'#10b981' }}>Done! ✅</div>
                  ) : (
                    <button onClick={()=>complete(quest)} disabled={!!isCompletingNow} style={{ background:isCompletingNow?'rgba(255,255,255,0.1)':quest.color, border:'none', borderRadius:'12px', padding:'8px 16px', color:'#fff', fontSize:'14px', fontFamily:FONT, cursor:isCompletingNow?'default':'pointer', opacity:isCompletingNow?0.6:1 }}>
                      {isCompletingNow?'⏳ ...':`✓ Mark Done`}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Forest tip */}
        <div style={{ background:'rgba(255,255,255,0.06)', borderRadius:'16px', padding:'16px 20px', marginTop:'24px', border:'2px solid rgba(255,255,255,0.1)', fontSize:'14px', color:'rgba(255,255,255,0.5)', fontFamily:'sans-serif', lineHeight:1.7 }}>
          💡 <strong style={{color:'rgba(255,255,255,0.7)'}}>Tip:</strong> Complete daily quests to keep your streak alive! Longer streaks unlock special trophies in the Trophy Room. 🏆
        </div>
      </div>
    </div>
  );
}
