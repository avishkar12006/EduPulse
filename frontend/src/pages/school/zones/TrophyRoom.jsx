import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../context/AuthContext';

const FONT = "'Fredoka One', cursive";
const BG   = 'linear-gradient(135deg,#1A1033 0%,#2D1B69 50%,#0F2044 100%)';

/* ── All available badges ───────────────────────────────────────────────── */
const ALL_BADGES = [
  // Earned by default (demo)
  { id:'first_login',    icon:'⭐', name:'First Step',         desc:'Logged in for the first time!',               category:'Starter',  color:'#FFD700', rarity:'common',    earned:true  },
  { id:'reading_star',   icon:'📖', name:'Reading Star',       desc:'Completed your first story in Reading River!', category:'English',  color:'#38bdf8', rarity:'common',    earned:true  },
  { id:'explorer',       icon:'🌍', name:'World Explorer',     desc:'Visited all 5 zones of Sparky World!',         category:'General',  color:'#c084fc', rarity:'uncommon',  earned:true  },
  // Need to unlock
  { id:'nipun_reading',  icon:'📚', name:'NIPUN Reader',       desc:'Scored 5/5 on Reading Comprehension',         category:'NIPUN',    color:'#FF8F00', rarity:'rare',      earned:false },
  { id:'nipun_math',     icon:'🔢', name:'NIPUN Numeracy',     desc:'Mastered the Number Sense NIPUN level',       category:'NIPUN',    color:'#FF8F00', rarity:'rare',      earned:false },
  { id:'math_wizard',    icon:'🧙', name:'Math Wizard',        desc:'Score 100+ in Quick Math game',               category:'Math',     color:'#FFD700', rarity:'rare',      earned:false },
  { id:'streak_7',       icon:'🔥', name:'7-Day Streak',       desc:'Learn 7 days in a row!',                      category:'General',  color:'#f97316', rarity:'uncommon',  earned:false },
  { id:'streak_14',      icon:'⚡', name:'14-Day Streak',      desc:'Learn 14 days in a row!',                     category:'General',  color:'#f97316', rarity:'rare',      earned:false },
  { id:'science_star',   icon:'🔬', name:'Little Scientist',   desc:'Complete all Discovery Garden topics',        category:'Science',  color:'#10b981', rarity:'uncommon',  earned:false },
  { id:'story_master',   icon:'📜', name:'Story Master',       desc:'Read all 3 stories with perfect quiz score',  category:'English',  color:'#38bdf8', rarity:'rare',      earned:false },
  { id:'quest_king',     icon:'👑', name:'Quest King',         desc:'Complete all 11 quests in Quest Forest',      category:'Quests',   color:'#c084fc', rarity:'legendary', earned:false },
  { id:'top_cluster',    icon:'🏆', name:'Peak Performer',     desc:'Reach the Top Cluster in K-Means grouping',   category:'Academic', color:'#FFD700', rarity:'legendary', earned:false },
];

const RARITY_COLOR  = { common:'#94a3b8', uncommon:'#10b981', rare:'#38bdf8', legendary:'#FFD700' };
const RARITY_BG     = { common:'rgba(148,163,184,0.15)', uncommon:'rgba(16,185,129,0.15)', rare:'rgba(56,189,248,0.15)', legendary:'rgba(255,215,0,0.15)' };
const RARITY_GLOW   = { common:'none', uncommon:`0 0 20px rgba(16,185,129,0.3)`, rare:`0 0 24px rgba(56,189,248,0.35)`, legendary:`0 0 30px rgba(255,215,0,0.5)` };

const CATEGORIES = ['All', 'Starter', 'English', 'Math', 'Science', 'NIPUN', 'Quests', 'General', 'Academic'];

export default function TrophyRoom() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [filter, setFilter] = useState('All');
  const [rarity, setRarity] = useState('All');

  const earned = ALL_BADGES.filter(b => b.earned);
  const locked = ALL_BADGES.filter(b => !b.earned);

  const filtered = ALL_BADGES.filter(b => {
    const catOk = filter==='All' || b.category===filter;
    const rarOk = rarity==='All' || b.rarity===rarity;
    return catOk && rarOk;
  });

  const xpTotal   = (user?.xpPoints) || 150;
  const level     = (user?.level)     || 2;
  const nextLvlXp = level * 200;
  const pct       = Math.min(100, Math.round((xpTotal % 200) / 200 * 100));

  return (
    <div style={{ minHeight:'100vh', background:BG, fontFamily:FONT, paddingBottom:'80px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-6px)}}
        @keyframes shimmer{0%{background-position:200% center}100%{background-position:-200% center}}
        .badge-card:hover{transform:translateY(-4px) scale(1.04)!important;transition:all 0.2s;}
      `}</style>

      {/* Header */}
      <div style={{ background:'rgba(0,0,0,0.5)', backdropFilter:'blur(10px)', padding:'14px 24px', display:'flex', alignItems:'center', gap:'14px', position:'sticky', top:0, zIndex:50, borderBottom:'2px solid rgba(255,255,255,0.08)' }}>
        <button onClick={()=>navigate('/school/sparky-world')} style={{ background:'rgba(255,215,0,0.2)', border:'2px solid #FFD70066', borderRadius:'50px', padding:'8px 20px', color:'#FFD700', fontSize:'15px', fontFamily:FONT, cursor:'pointer' }}>🌍 World Map</button>
        <span style={{ fontSize:'28px', animation:'float 3s ease-in-out infinite' }}>🏆</span>
        <span style={{ fontSize:'22px', color:'#FFD700' }}>Trophy Room</span>
        <div style={{ marginLeft:'auto', fontSize:'16px', color:'rgba(255,255,255,0.5)' }}>{earned.length}/{ALL_BADGES.length} earned</div>
      </div>

      <div style={{ maxWidth:'900px', margin:'0 auto', padding:'32px 24px', animation:'fadeUp 0.4s ease' }}>

        {/* Player XP card */}
        <div style={{ background:'rgba(255,215,0,0.08)', border:'2px solid rgba(255,215,0,0.25)', borderRadius:'24px', padding:'24px 28px', marginBottom:'28px', display:'flex', gap:'24px', alignItems:'center', flexWrap:'wrap' }}>
          <div style={{ fontSize:'64px', animation:'float 3s ease-in-out infinite' }}>🧒</div>
          <div style={{ flex:1 }}>
            <div style={{ fontSize:'22px', color:'#fff', marginBottom:'4px' }}>{user?.name || 'Sparky Explorer'}</div>
            <div style={{ fontSize:'14px', color:'rgba(255,255,255,0.4)', fontFamily:'sans-serif', marginBottom:'12px' }}>Level {level} · {xpTotal} XP Total</div>
            {/* XP bar */}
            <div style={{ marginBottom:'6px', fontSize:'11px', color:'rgba(255,255,255,0.4)', fontFamily:'sans-serif', display:'flex', justifyContent:'space-between' }}>
              <span>Level {level}</span><span>Level {level+1}</span>
            </div>
            <div style={{ height:'10px', background:'rgba(255,255,255,0.08)', borderRadius:'5px', overflow:'hidden' }}>
              <div style={{ height:'100%', width:`${pct}%`, background:'linear-gradient(90deg,#FFD700,#FF8C00)', borderRadius:'5px', transition:'width 0.8s ease' }} />
            </div>
            <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.4)', fontFamily:'sans-serif', marginTop:'6px' }}>{xpTotal % 200} / 200 XP to next level</div>
          </div>
          <div style={{ display:'flex', gap:'16px', flexWrap:'wrap' }}>
            {[
              { label:'Badges Earned', val:earned.length, color:'#FFD700' },
              { label:'Locked',        val:locked.length, color:'rgba(255,255,255,0.3)' },
              { label:'Legendary',     val:ALL_BADGES.filter(b=>b.rarity==='legendary'&&b.earned).length, color:'#c084fc' },
            ].map((s,i)=>(
              <div key={i} style={{ textAlign:'center' }}>
                <div style={{ fontSize:'26px', color:s.color, fontWeight:700 }}>{s.val}</div>
                <div style={{ fontSize:'10px', color:'rgba(255,255,255,0.4)', fontFamily:'sans-serif' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div style={{ display:'flex', gap:'6px', flexWrap:'wrap', marginBottom:'8px' }}>
          {CATEGORIES.map(c=>(
            <button key={c} onClick={()=>setFilter(c)} style={{ background:filter===c?'rgba(255,215,0,0.2)':'transparent', border:`2px solid ${filter===c?'#FFD700':'rgba(255,255,255,0.1)'}`, borderRadius:'50px', padding:'5px 14px', color:filter===c?'#FFD700':'rgba(255,255,255,0.4)', fontSize:'12px', fontFamily:FONT, cursor:'pointer', transition:'all 0.2s' }}>{c}</button>
          ))}
        </div>
        <div style={{ display:'flex', gap:'6px', flexWrap:'wrap', marginBottom:'24px' }}>
          {['All','common','uncommon','rare','legendary'].map(r=>(
            <button key={r} onClick={()=>setRarity(r)} style={{ background:rarity===r?RARITY_COLOR[r]||'rgba(255,255,255,0.2)':' transparent', border:`2px solid ${rarity===r?RARITY_COLOR[r]||'rgba(255,255,255,0.4)':'rgba(255,255,255,0.08)'}`, borderRadius:'50px', padding:'4px 12px', color:rarity===r?'#fff':RARITY_COLOR[r]||'rgba(255,255,255,0.3)', fontSize:'11px', fontFamily:FONT, cursor:'pointer', textTransform:'capitalize', transition:'all 0.2s' }}>{r}</button>
          ))}
        </div>

        {/* Badge grid */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(180px,1fr))', gap:'16px' }}>
          {filtered.map(badge=>(
            <div key={badge.id} className="badge-card" style={{ background:badge.earned?RARITY_BG[badge.rarity]:'rgba(255,255,255,0.03)', border:`2px solid ${badge.earned?RARITY_COLOR[badge.rarity]:' rgba(255,255,255,0.06)'}`, borderRadius:'20px', padding:'20px 16px', textAlign:'center', boxShadow:badge.earned?RARITY_GLOW[badge.rarity]:'none', filter:badge.earned?'none':'grayscale(0.7) opacity(0.45)', position:'relative', overflow:'hidden' }}>
              {/* Legendary shimmer */}
              {badge.earned && badge.rarity==='legendary' && (
                <div style={{ position:'absolute', inset:0, background:'linear-gradient(90deg,transparent 0%,rgba(255,215,0,0.08) 50%,transparent 100%)', backgroundSize:'200% 100%', animation:'shimmer 2s ease-in-out infinite', pointerEvents:'none' }} />
              )}
              {/* Rarity tag */}
              <div style={{ position:'absolute', top:'10px', right:'10px', background:RARITY_COLOR[badge.rarity]+'33', borderRadius:'99px', padding:'2px 8px', fontSize:'9px', color:RARITY_COLOR[badge.rarity], fontFamily:'sans-serif', fontWeight:700, textTransform:'uppercase' }}>{badge.rarity}</div>
              <div style={{ fontSize:'46px', marginBottom:'10px', animation:badge.earned?'float 4s ease-in-out infinite':'none', display:'block' }}>{badge.icon}</div>
              <div style={{ fontSize:'16px', color:badge.earned?'#fff':'rgba(255,255,255,0.4)', marginBottom:'6px', lineHeight:1.2 }}>{badge.name}</div>
              <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.4)', fontFamily:'sans-serif', lineHeight:1.5 }}>{badge.desc}</div>
              <div style={{ marginTop:'10px', fontSize:'11px', color:RARITY_COLOR[badge.rarity], background:RARITY_COLOR[badge.rarity]+'22', borderRadius:'99px', padding:'3px 10px', display:'inline-block' }}>{badge.category}</div>
              {!badge.earned && <div style={{ marginTop:'8px', fontSize:'12px', color:'rgba(255,255,255,0.25)', fontFamily:'sans-serif' }}>🔒 Locked</div>}
            </div>
          ))}
        </div>

        {/* Leaderboard teaser */}
        <div style={{ background:'rgba(255,255,255,0.05)', border:'2px solid rgba(255,255,255,0.1)', borderRadius:'20px', padding:'20px 24px', marginTop:'28px' }}>
          <div style={{ fontSize:'18px', color:'#FFD700', marginBottom:'16px' }}>🏅 Top Explorers This Week</div>
          {[
            { name:'Anika Singh',  xp:320, badges:3, avatar:'👩', rank:1 },
            { name:'Aryan Gupta',  xp:150, badges:2, avatar:'🧒', rank:2 },
            { name:'Rohan Mehta',  xp:90,  badges:1, avatar:'👦', rank:3 },
          ].map(p=>(
            <div key={p.name} style={{ display:'flex', alignItems:'center', gap:'12px', padding:'10px 0', borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ width:'30px', textAlign:'center', fontSize:'20px', color:p.rank===1?'#FFD700':p.rank===2?'#C0C0C0':'#CD7F32' }}>{p.rank===1?'🥇':p.rank===2?'🥈':'🥉'}</div>
              <span style={{ fontSize:'22px' }}>{p.avatar}</span>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:'15px', color:'#fff' }}>{p.name}</div>
                <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.4)', fontFamily:'sans-serif' }}>{p.badges} badges</div>
              </div>
              <div style={{ fontSize:'15px', color:'#FFD700' }}>{p.xp} XP ⭐</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
