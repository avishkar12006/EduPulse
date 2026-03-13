import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const FONT = "'Fredoka One', cursive";
const BG   = 'linear-gradient(180deg,#1a1a2e 0%,#16213e 50%,#0f3460 100%)';

/* ── Game 1: Quick Math — solve equations against the clock ─────────────── */
function QuickMath({ onBack }) {
  const [score, setScore]     = useState(0);
  const [lives, setLives]     = useState(3);
  const [timeLeft, setTime]   = useState(30);
  const [q, setQ]             = useState(null);
  const [input, setInput]     = useState('');
  const [shake, setShake]     = useState(false);
  const [flash, setFlash]     = useState(null); // 'correct' | 'wrong'
  const [started, setStart]   = useState(false);
  const [over, setOver]       = useState(false);
  const inputRef = useRef(null);

  const genQ = useCallback(() => {
    const ops   = ['+', '-', '×'];
    const op    = ops[Math.floor(Math.random() * 3)];
    let a, b, ans;
    if (op==='+') { a=Math.ceil(Math.random()*20); b=Math.ceil(Math.random()*20); ans=a+b; }
    else if (op==='-') { a=Math.ceil(Math.random()*20)+10; b=Math.ceil(Math.random()*a); ans=a-b; }
    else { a=Math.ceil(Math.random()*10); b=Math.ceil(Math.random()*10); ans=a*b; }
    setQ({ text:`${a} ${op} ${b} = ?`, ans });
    setInput('');
  }, []);

  useEffect(() => { if (started && !over) genQ(); }, [started]);

  useEffect(() => {
    if (!started || over) return;
    const t = setInterval(() => {
      setTime(prev => { if (prev <= 1) { setOver(true); return 0; } return prev-1; });
    }, 1000);
    return () => clearInterval(t);
  }, [started, over]);

  const submit = () => {
    if (!q || input === '') return;
    if (parseInt(input) === q.ans) {
      setScore(s => s+10);
      setFlash('correct');
      setTimeout(() => { setFlash(null); genQ(); }, 500);
    } else {
      setLives(l => { const nl = l-1; if (nl<=0) setOver(true); return nl; });
      setShake(true); setFlash('wrong');
      setTimeout(() => { setShake(false); setFlash(null); if (lives-1>0) { setInput(''); inputRef.current?.focus(); } }, 600);
    }
  };

  if (!started) return (
    <div style={{ textAlign:'center', color:'#fff', padding:'40px', animation:'fadeUp 0.4s ease' }}>
      <div style={{ fontSize:'72px', marginBottom:'16px' }}>⚡</div>
      <div style={{ fontSize:'28px', fontFamily:FONT, marginBottom:'12px' }}>Quick Math!</div>
      <div style={{ fontSize:'16px', color:'rgba(255,255,255,0.6)', fontFamily:'sans-serif', marginBottom:'32px', lineHeight:1.7 }}>Solve as many math problems as you can in<br/><strong style={{color:'#FFD700'}}>30 seconds!</strong> You have 3 lives. Ready?</div>
      <button onClick={() => setStart(true)} style={{ background:'linear-gradient(135deg,#FFD700,#FF8C00)', border:'none', borderRadius:'20px', padding:'16px 40px', fontSize:'22px', fontFamily:FONT, cursor:'pointer', boxShadow:'0 6px 24px rgba(255,215,0,0.4)' }}>
        🚀 Start!
      </button>
    </div>
  );

  if (over) return (
    <div style={{ textAlign:'center', color:'#fff', padding:'40px', animation:'fadeUp 0.4s ease' }}>
      <div style={{ fontSize:'64px', marginBottom:'16px' }}>{score>=80?'🏆':score>=40?'🌟':'💪'}</div>
      <div style={{ fontSize:'28px', fontFamily:FONT, marginBottom:'8px' }}>Game Over!</div>
      <div style={{ fontSize:'18px', color:'rgba(255,255,255,0.6)', marginBottom:'8px' }}>Your score: <strong style={{color:'#FFD700',fontSize:'32px'}}>{score}</strong></div>
      <div style={{ fontSize:'14px', color:'rgba(255,255,255,0.4)', fontFamily:'sans-serif', marginBottom:'32px' }}>{score>=80?"Incredible! Math Wizard! 🧙":score>=40?"Great work! Keep practising! 🌟":"Try again — you'll do better! 💪"}</div>
      <button onClick={() => { setScore(0); setLives(3); setTime(30); setOver(false); setStart(false); }} style={{ background:'#FFD700', border:'none', borderRadius:'14px', padding:'12px 32px', fontSize:'18px', fontFamily:FONT, cursor:'pointer', color:'#7B5800' }}>🔄 Play Again</button>
    </div>
  );

  const pct = (timeLeft/30)*100;
  return (
    <div style={{ color:'#fff', padding:'24px', animation:'fadeUp 0.3s ease' }}>
      {/* HUD */}
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'20px', alignItems:'center' }}>
        <div style={{ fontSize:'20px', fontFamily:FONT, color:'#FFD700' }}>⭐ {score}</div>
        <div style={{ flex:1, margin:'0 16px', height:'10px', background:'rgba(255,255,255,0.1)', borderRadius:'5px', overflow:'hidden' }}>
          <div style={{ height:'100%', width:`${pct}%`, background:timeLeft>10?'#10b981':'#ef4444', borderRadius:'5px', transition:'width 1s linear, background 0.5s' }} />
        </div>
        <div style={{ fontSize:'20px', fontFamily:FONT, color:timeLeft<=10?'#ef4444':'#fff' }}>⏱ {timeLeft}s</div>
      </div>
      <div style={{ display:'flex', justifyContent:'center', gap:'6px', marginBottom:'24px' }}>
        {Array.from({length:3},(_,i) => <span key={i} style={{ fontSize:'24px', opacity: i<lives?1:0.2 }}>❤️</span>)}
      </div>

      {/* Question */}
      {q && (
        <div style={{ background: flash==='correct'?'rgba(16,185,129,0.2)':flash==='wrong'?'rgba(239,68,68,0.2)':'rgba(255,255,255,0.06)', border:`3px solid ${flash==='correct'?'#10b981':flash==='wrong'?'#ef4444':'rgba(255,255,255,0.15)'}`, borderRadius:'24px', padding:'32px', textAlign:'center', transform: shake?'translateX(-8px)':'translateX(0)', transition:'transform 0.1s,background 0.2s,border 0.2s', marginBottom:'20px' }}>
          <div style={{ fontSize:'36px', fontFamily:FONT, marginBottom:'20px' }}>{q.text}</div>
          <input
            ref={inputRef} autoFocus
            value={input} onChange={e => setInput(e.target.value.replace(/\D/g,''))}
            onKeyDown={e => e.key==='Enter' && submit()}
            placeholder="Type your answer…"
            style={{ background:'rgba(255,255,255,0.1)', border:'2px solid rgba(255,255,255,0.3)', borderRadius:'14px', padding:'12px 24px', fontSize:'24px', color:'#fff', fontFamily:FONT, textAlign:'center', width:'160px', outline:'none' }}
          />
        </div>
      )}
      <button onClick={submit} style={{ width:'100%', background:'#FFD700', border:'none', borderRadius:'14px', padding:'14px', fontSize:'20px', fontFamily:FONT, cursor:'pointer', color:'#7B5800' }}>
        ✓ Submit Answer
      </button>
    </div>
  );
}

/* ── Game 2: Number Match — flip & match pairs ──────────────────────────── */
const CARD_NUMS = [1,2,3,4,5,6,7,8];
function shuffleCards() {
  const all = [...CARD_NUMS,...CARD_NUMS].map((n,i) => ({ id:i, val:n, flipped:false, matched:false }));
  for (let i=all.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[all[i],all[j]]=[all[j],all[i]];}
  return all;
}

function NumberMatch({ onBack }) {
  const [cards, setCards]     = useState(shuffleCards());
  const [selected, setSelected] = useState([]);
  const [moves, setMoves]     = useState(0);
  const [won, setWon]         = useState(false);
  const [checking, setCheck]  = useState(false);

  const flip = (card) => {
    if (checking || card.flipped || card.matched || selected.length===2) return;
    const newCards = cards.map(c => c.id===card.id ? {...c, flipped:true} : c);
    const newSel   = [...selected, card];
    setCards(newCards);
    setSelected(newSel);
    if (newSel.length===2) {
      setMoves(m => m+1);
      setCheck(true);
      setTimeout(() => {
        if (newSel[0].val === newSel[1].val) {
          const matched = newCards.map(c => c.val===newSel[0].val ? {...c,matched:true} : c);
          setCards(matched);
          if (matched.every(c=>c.matched)) setWon(true);
        } else {
          setCards(newCards.map(c => c.id===newSel[0].id||c.id===newSel[1].id ? {...c,flipped:false} : c));
        }
        setSelected([]); setCheck(false);
      }, 800);
    }
  };

  const COLORS = ['#FF6B6B','#00875A','#38bdf8','#FFD700','#c084fc','#10b981','#f97316','#ec4899'];

  if (won) return (
    <div style={{ textAlign:'center', color:'#fff', padding:'40px' }}>
      <div style={{ fontSize:'64px', marginBottom:'16px' }}>🎉</div>
      <div style={{ fontSize:'28px', fontFamily:FONT, marginBottom:'8px' }}>You matched them all!</div>
      <div style={{ fontSize:'16px', color:'rgba(255,255,255,0.6)', fontFamily:'sans-serif', marginBottom:'32px' }}>Completed in <strong style={{color:'#FFD700'}}>{moves} moves</strong></div>
      <button onClick={() => { setCards(shuffleCards()); setMoves(0); setWon(false); }} style={{ background:'#FFD700', border:'none', borderRadius:'14px', padding:'12px 28px', fontSize:'18px', fontFamily:FONT, cursor:'pointer', color:'#7B5800' }}>🔄 Play Again</button>
    </div>
  );

  return (
    <div style={{ color:'#fff', padding:'24px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px' }}>
        <div style={{ fontSize:'16px', fontFamily:FONT, color:'rgba(255,255,255,0.6)' }}>Find the pairs! 🔍</div>
        <div style={{ fontSize:'18px', fontFamily:FONT, color:'#FFD700' }}>Moves: {moves}</div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'10px', maxWidth:'380px', margin:'0 auto' }}>
        {cards.map(card => (
          <div key={card.id} onClick={() => flip(card)} style={{ height:'80px', borderRadius:'16px', cursor:card.matched?'default':'pointer', perspective:'500px', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'30px', fontFamily:FONT, transition:'all 0.3s',
            background: card.flipped||card.matched ? COLORS[(card.val-1)%8] : 'rgba(255,255,255,0.08)',
            border: card.flipped||card.matched ? '3px solid rgba(255,255,255,0.3)' : '3px solid rgba(255,255,255,0.12)',
            boxShadow: card.matched ? `0 0 16px ${COLORS[(card.val-1)%8]}66` : 'none',
            transform: card.flipped||card.matched ? 'rotateY(0deg)' : 'rotateY(180deg)',
          }}>
            {(card.flipped||card.matched) ? card.val : '?'}
          </div>
        ))}
      </div>
    </div>
  );
}

/* ── Game 3: Times Table Challenge — 10 questions on chosen table ─────────── */
const TABLES = [2,3,4,5,6,7,8,9,10];
function TimesTable({ onBack }) {
  const [chosen, setChosen]   = useState(null);
  const [qIdx, setQIdx]       = useState(0);
  const [picked, setPicked]   = useState(null);
  const [score, setScore]     = useState(0);
  const [over, setOver]       = useState(false);

  const qs = chosen ? Array.from({length:10},(_,i)=>({a:chosen, b:i+1, ans:chosen*(i+1)})) : [];
  const q  = qs[qIdx];

  const makeOpts = (ans) => {
    const opts = new Set([ans]);
    while (opts.size<4) opts.add(ans + (Math.random()<0.5?1:-1)*Math.ceil(Math.random()*10));
    return [...opts].sort(() => Math.random()-0.5);
  };
  const opts = q ? makeOpts(q.ans) : [];

  const pick = (n) => {
    if (picked!==null) return;
    setPicked(n);
    if (n===q.ans) setScore(s=>s+1);
    setTimeout(() => {
      if (qIdx+1>=10) setOver(true);
      else { setQIdx(i=>i+1); setPicked(null); }
    }, 700);
  };

  if (!chosen) return (
    <div style={{ textAlign:'center', color:'#fff', padding:'24px' }}>
      <div style={{ fontSize:'24px', fontFamily:FONT, marginBottom:'20px' }}>Which table do you want to practice? 📐</div>
      <div style={{ display:'flex', flexWrap:'wrap', gap:'10px', justifyContent:'center' }}>
        {TABLES.map(t => (
          <button key={t} onClick={() => setChosen(t)} style={{ background:'rgba(255,215,0,0.15)', border:'3px solid #FFD700', borderRadius:'16px', padding:'14px 20px', fontSize:'22px', fontFamily:FONT, color:'#FFD700', cursor:'pointer', minWidth:'60px' }}>×{t}</button>
        ))}
      </div>
    </div>
  );

  if (over) return (
    <div style={{ textAlign:'center', color:'#fff', padding:'40px' }}>
      <div style={{ fontSize:'64px', marginBottom:'16px' }}>{score>=8?'🏆':score>=5?'🌟':'💪'}</div>
      <div style={{ fontSize:'28px', fontFamily:FONT, marginBottom:'8px' }}>×{chosen} Table Done!</div>
      <div style={{ fontSize:'18px', color:'rgba(255,255,255,0.6)', marginBottom:'32px' }}>Score: <strong style={{color:'#FFD700'}}>{score}/10</strong></div>
      <div style={{ display:'flex', gap:'10px', justifyContent:'center', flexWrap:'wrap' }}>
        <button onClick={() => { setChosen(null); setQIdx(0); setPicked(null); setScore(0); setOver(false); }} style={{ background:'#FFD700', border:'none', borderRadius:'14px', padding:'12px 24px', fontSize:'16px', fontFamily:FONT, cursor:'pointer', color:'#7B5800' }}>Try Another</button>
      </div>
    </div>
  );

  return (
    <div style={{ color:'#fff', padding:'24px' }}>
      <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'16px' }}>
        <div style={{ fontSize:'16px', color:'rgba(255,255,255,0.5)', fontFamily:FONT }}>Q{qIdx+1}/10</div>
        <div style={{ fontSize:'18px', color:'#FFD700', fontFamily:FONT }}>⭐ {score}</div>
      </div>
      <div style={{ background:'rgba(255,255,255,0.06)', borderRadius:'20px', padding:'28px', textAlign:'center', marginBottom:'20px' }}>
        <div style={{ fontSize:'36px', fontFamily:FONT }}>{q.a} × {q.b} = ?</div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'12px' }}>
        {opts.map((opt,i) => {
          const isCorrect = opt===q.ans, isPicked = opt===picked, revealed = picked!==null;
          return (
            <button key={i} disabled={revealed} onClick={() => pick(opt)} style={{ background: !revealed?'rgba(255,255,255,0.08)':isCorrect?'rgba(16,185,129,0.3)':isPicked?'rgba(239,68,68,0.3)':'rgba(255,255,255,0.04)', border:`3px solid ${!revealed?'rgba(255,255,255,0.15)':isCorrect?'#10b981':isPicked?'#ef4444':'rgba(255,255,255,0.06)'}`, borderRadius:'16px', padding:'16px', fontSize:'24px', fontFamily:FONT, color:'#fff', cursor:revealed?'default':'pointer', transition:'all 0.2s' }}>
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── MAIN ────────────────────────────────────────────────────────────────── */
const GAMES = [
  { id:'quickmath',  icon:'⚡', title:'Quick Math',          desc:'Solve equations in 30 seconds!', color:'#FFD700', badge:'Math Speed Racer' },
  { id:'numbermatch',icon:'🔍', title:'Number Match',         desc:'Flip & match number pairs!',     color:'#38bdf8', badge:'Memory Master'   },
  { id:'timestable', icon:'📐', title:'Times Table Challenge', desc:'Choose a table & beat all 10!', color:'#c084fc', badge:'Multiplication Ninja' },
];

export default function NumberKingdom() {
  const navigate = useNavigate();
  const [game, setGame] = useState(null);
  const [scores, setScores] = useState({});

  return (
    <div style={{ minHeight:'100vh', background:BG, fontFamily:FONT }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}
        .game-card:hover{transform:translateY(-4px) scale(1.03)!important;transition:all 0.2s;}
      `}</style>

      {/* Header */}
      <div style={{ background:'rgba(0,0,0,0.5)', backdropFilter:'blur(10px)', padding:'14px 24px', display:'flex', alignItems:'center', gap:'14px', borderBottom:'2px solid rgba(255,255,255,0.08)', position:'sticky', top:0, zIndex:50 }}>
        <button onClick={() => game ? setGame(null) : navigate('/school/sparky-world')} style={{ background:'rgba(255,215,0,0.2)', border:'2px solid #FFD700', borderRadius:'50px', padding:'8px 20px', color:'#FFD700', fontSize:'15px', fontFamily:FONT, cursor:'pointer' }}>
          {game ? '← Games' : '🌍 World Map'}
        </button>
        <span style={{ fontSize:'28px', animation:'float 3s ease-in-out infinite' }}>🔢</span>
        <span style={{ fontSize:'22px', color:'#FFD700' }}>Number Kingdom</span>
      </div>

      {/* Game lobby */}
      {!game && (
        <div style={{ maxWidth:'800px', margin:'0 auto', padding:'40px 24px', animation:'fadeUp 0.4s ease' }}>
          <div style={{ textAlign:'center', marginBottom:'36px' }}>
            <div style={{ fontSize:'32px', color:'#FFD700', marginBottom:'8px' }}>🎮 Choose Your Game!</div>
            <div style={{ fontSize:'16px', color:'rgba(255,255,255,0.5)', fontFamily:'sans-serif' }}>Play math games, earn badges, and become a Number King! 👑</div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(220px,1fr))', gap:'20px' }}>
            {GAMES.map(g => (
              <div key={g.id} className="game-card" onClick={() => setGame(g.id)}
                style={{ background:'rgba(255,255,255,0.06)', border:`3px solid ${g.color}44`, borderRadius:'24px', padding:'28px 20px', cursor:'pointer', textAlign:'center', boxShadow:`0 4px 24px ${g.color}22` }}>
                <div style={{ fontSize:'52px', marginBottom:'14px', animation:'float 3s ease-in-out infinite' }}>{g.icon}</div>
                <div style={{ fontSize:'20px', color:g.color, marginBottom:'8px' }}>{g.title}</div>
                <div style={{ fontSize:'14px', color:'rgba(255,255,255,0.5)', fontFamily:'sans-serif', marginBottom:'16px' }}>{g.desc}</div>
                <div style={{ background:`${g.color}22`, border:`1px solid ${g.color}44`, borderRadius:'50px', padding:'4px 12px', fontSize:'11px', color:g.color }}>🏅 {g.badge}</div>
                <button style={{ width:'100%', marginTop:'16px', background:`linear-gradient(135deg,${g.color},${g.color}cc)`, border:'none', borderRadius:'14px', padding:'12px', color:'#fff', fontSize:'16px', fontFamily:FONT, cursor:'pointer' }}>
                  ▶ Play Now
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active game */}
      {game && (
        <div style={{ maxWidth:'600px', margin:'0 auto', padding:'24px', animation:'fadeUp 0.4s ease' }}>
          <div style={{ background:'rgba(255,255,255,0.05)', border:'2px solid rgba(255,255,255,0.1)', borderRadius:'24px', overflow:'hidden' }}>
            <div style={{ padding:'14px 20px', background:'rgba(0,0,0,0.3)', borderBottom:'1px solid rgba(255,255,255,0.06)', display:'flex', alignItems:'center', gap:'10px' }}>
              <span style={{ fontSize:'20px' }}>{GAMES.find(g=>g.id===game)?.icon}</span>
              <span style={{ fontSize:'18px', color:'#fff' }}>{GAMES.find(g=>g.id===game)?.title}</span>
            </div>
            {game==='quickmath'   && <QuickMath   onBack={() => setGame(null)} />}
            {game==='numbermatch' && <NumberMatch  onBack={() => setGame(null)} />}
            {game==='timestable' && <TimesTable   onBack={() => setGame(null)} />}
          </div>
        </div>
      )}
    </div>
  );
}
