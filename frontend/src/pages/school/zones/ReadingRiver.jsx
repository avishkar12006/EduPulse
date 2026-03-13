import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const FONT = "'Fredoka One', cursive";
const BG   = 'linear-gradient(180deg,#87CEEB 0%,#b3e5fc 40%,#e1f5fe 100%)';

/* ── Real stories for Class 3-5 ─────────────────────────────────────────── */
const STORIES = [
  {
    id:'s1', title:'The Clever Crow', grade:'Class 3', level:'Easy', emoji:'🐦', color:'#1565C0', xp:25,
    text:`Once upon a time, a clever crow was very thirsty. He flew around looking for water everywhere.

Finally, he found a pot with some water at the bottom. But the water was too low for him to reach. The crow was sad, but he didn't give up.

He looked around and saw some pebbles on the ground. He had a great idea! He picked up the pebbles one by one and dropped them into the pot.

Slowly, the water began to rise. Drop by drop, pebble by pebble. After a while, the water rose to the top!

The clever crow drank the cool water and flew away happily.

Lesson: Where there is a will, there is a way! 🌟`,
    vocab:[
      { word:'Thirsty', meaning:'Needing water to drink' },
      { word:'Pebbles', meaning:'Small stones' },
      { word:'Clever',  meaning:'Quick to understand and think of ideas' },
      { word:'Finally', meaning:'At the end, after a long time' },
    ],
    questions:[
      { q:'Why was the crow sad?', opts:['He was hungry','The water was too low','He was lost','He was tired'], ans:1 },
      { q:'What did the crow drop into the pot?', opts:['Sand','Leaves','Pebbles','Sticks'], ans:2 },
      { q:'What is the lesson of the story?', opts:['Crows are smart','Never give up','Water is important','Pots are useful'], ans:1 },
    ],
  },
  {
    id:'s2', title:'The Lion and the Mouse', grade:'Class 3-4', level:'Easy', emoji:'🦁', color:'#E65100', xp:30,
    text:`One lazy afternoon, a great lion was sleeping under a tree. A tiny mouse was running around and accidentally woke the lion up by running over his face.

The lion caught the mouse in his paw and roared, "How dare you wake me? I shall eat you!"

The mouse begged, "Please let me go, Great Lion! One day I may help you!"

The lion laughed loudly. "A tiny mouse help me? Ha!" But he felt kind and let the mouse go.

A few days later, the lion was caught in a hunter's net. He roared and struggled but couldn't escape.

The tiny mouse heard the roar and ran over. She began to chew through the rope with her sharp teeth.

Nibble, nibble, nibble... until the net broke! The lion was free.

"You were right, little friend," said the lion. "Small friends can be great friends!"`,
    vocab:[
      { word:'Roared',    meaning:'Made a loud, deep sound like a lion' },
      { word:'Begged',    meaning:'Asked for something very desperately' },
      { word:'Struggled', meaning:'Tried very hard to get free' },
      { word:'Nibble',    meaning:'To bite small pieces again and again' },
    ],
    questions:[
      { q:'Why was the lion angry with the mouse?', opts:['The mouse ate his food','The mouse woke him up','The mouse bit him','The mouse laughed at him'], ans:1 },
      { q:'What did the mouse use to free the lion?', opts:['Her paws','Her tail','Her teeth','A knife'], ans:2 },
      { q:'What lesson does the story teach?', opts:['Lions are powerful','Never sleep under trees','Small friends can be helpful','Mice are fast'], ans:2 },
    ],
  },
  {
    id:'s3', title:'Water: The Magic Liquid', grade:'Class 4-5', level:'Medium', emoji:'💧', color:'#0288D1', xp:35,
    text:`Water is the most important liquid on Earth. All living things — people, animals, and plants — need water to survive.

Water covers about 70% of our planet's surface. That's why Earth is called the "Blue Planet" from space! 🌍

We use water every day for drinking, cooking, bathing, and farming. Did you know that the food we eat needs lots of water to grow?

But here is an important fact: only 3% of Earth's water is fresh water. And most of that fresh water is frozen in glaciers and ice caps!

This means very little water is available for us to drink. That is why we must SAVE water.

Simple ways to save water:
✅ Turn off the tap while brushing your teeth.
✅ Fix leaky taps.
✅ Collect rainwater for plants.
✅ Take shorter showers.

Remember: Every drop counts! 💧`,
    vocab:[
      { word:'Survive',    meaning:'To continue to live or exist' },
      { word:'Surface',    meaning:'The outside or top layer of something' },
      { word:'Glaciers',   meaning:'Large masses of ice moving slowly in mountains' },
      { word:'Available',  meaning:'Ready to use or obtain' },
    ],
    questions:[
      { q:'Why is Earth called the Blue Planet?', opts:['It is cold','Water covers 70% of it','Oceans are blue','Sky is blue'], ans:1 },
      { q:'What percentage of Earths water is fresh water?', opts:['70%','30%','3%','50%'], ans:2 },
      { q:'Which is NOT a way to save water?', opts:['Fixing taps','Taking longer showers','Collecting rainwater','Turning off taps'], ans:1 },
    ],
  },
];

const LEVEL_COLORS = { Easy:'#10b981', Medium:'#f59e0b', Hard:'#ef4444' };

export default function ReadingRiver() {
  const navigate         = useNavigate();
  const [view, setView]  = useState('list'); // 'list' | 'read' | 'quiz' | 'result'
  const [active, setActive] = useState(null);
  const [spoken, setSpoken] = useState(false);
  const [qIdx, setQIdx]  = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore]   = useState(0);
  const [done, setDone]     = useState({});
  const [filter, setFilter] = useState('All');
  const speechRef = useRef(null);

  // Text-to-speech
  const readAloud = () => {
    if (!active) return;
    window.speechSynthesis.cancel();
    const utt  = new SpeechSynthesisUtterance(active.text);
    utt.rate   = 0.9; utt.pitch = 1.1; utt.lang = 'en-IN';
    const voices = window.speechSynthesis.getVoices();
    const femaleVoice = voices.find(v => v.name.includes('Female') || v.name.includes('Samantha') || v.name.includes('Veena'));
    if (femaleVoice) utt.voice = femaleVoice;
    utt.onend  = () => setSpoken(false);
    setSpoken(true);
    window.speechSynthesis.speak(utt);
    speechRef.current = utt;
  };

  const stopRead = () => { window.speechSynthesis.cancel(); setSpoken(false); };

  useEffect(() => () => window.speechSynthesis.cancel(), []);

  const openStory = (s) => { setActive(s); setView('read'); stopRead(); };
  const startQuiz = () => { setView('quiz'); setQIdx(0); setPicked(null); setScore(0); };

  const pickAns   = (i) => {
    if (picked !== null) return;
    setPicked(i);
    if (i === active.questions[qIdx].ans) setScore(s=>s+1);
  };
  const nextQ = () => {
    if (qIdx+1 < active.questions.length) { setQIdx(q=>q+1); setPicked(null); }
    else { setView('result'); setDone(d=>({...d,[active.id]:true})); }
  };

  const q = active?.questions?.[qIdx];
  const filtered = filter==='All' ? STORIES : STORIES.filter(s=>s.level===filter);

  return (
    <div style={{ minHeight:'100vh', background:BG, fontFamily:FONT, paddingBottom:'80px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes wave{0%,100%{transform:scaleY(1)}50%{transform:scaleY(0.7)}}
        .story-card:hover{transform:translateY(-4px);box-shadow:0 12px 36px rgba(0,0,0,0.12)!important;transition:all 0.2s;}
      `}</style>

      {/* Header */}
      <div style={{ background:'rgba(255,255,255,0.85)', backdropFilter:'blur(10px)', padding:'14px 24px', display:'flex', alignItems:'center', gap:'14px', borderBottom:'3px solid rgba(255,255,255,0.6)', position:'sticky', top:0, zIndex:50 }}>
        <button onClick={() => { stopRead(); view==='list'?navigate('/school/sparky-world'):setView('list'); }} style={{ background:'#1565C0', border:'none', borderRadius:'50px', padding:'8px 20px', color:'#fff', fontSize:'15px', fontFamily:FONT, cursor:'pointer' }}>
          {view==='list'?'🌍 World Map':'← Back'}
        </button>
        <span style={{ fontSize:'28px' }}>📚</span>
        <span style={{ fontSize:'22px', color:'#1565C0' }}>Reading River</span>
        {view==='list' && (
          <div style={{ marginLeft:'auto', display:'flex', gap:'8px' }}>
            {['All','Easy','Medium'].map(f=>(
              <button key={f} onClick={() => setFilter(f)} style={{ background:filter===f?'#1565C0':'rgba(21,101,192,0.1)', border:'none', borderRadius:'50px', padding:'6px 14px', color:filter===f?'#fff':'#1565C0', fontSize:'13px', fontFamily:FONT, cursor:'pointer' }}>{f}</button>
            ))}
          </div>
        )}
      </div>

      {/* Story list */}
      {view==='list' && (
        <div style={{ maxWidth:'860px', margin:'0 auto', padding:'32px 24px', animation:'fadeUp 0.4s ease' }}>
          <div style={{ textAlign:'center', marginBottom:'32px' }}>
            <div style={{ fontSize:'28px', color:'#1565C0' }}>📚 Story Library</div>
            <div style={{ fontSize:'14px', color:'#555', fontFamily:'sans-serif', marginTop:'6px' }}>Read stories, learn new words, and answer questions! 🌟</div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:'20px' }}>
            {filtered.map(s=>(
              <div key={s.id} className="story-card" onClick={() => openStory(s)} style={{ background:'rgba(255,255,255,0.92)', borderRadius:'24px', padding:'24px', cursor:'pointer', boxShadow:'0 6px 24px rgba(0,0,0,0.08)', border:`3px solid ${done[s.id]?'#10b981':s.color+'33'}` }}>
                {done[s.id] && <div style={{ background:'#10b981', borderRadius:'50px', padding:'3px 10px', fontSize:'11px', color:'#fff', display:'inline-block', marginBottom:'10px' }}>✅ Completed</div>}
                <div style={{ fontSize:'44px', textAlign:'center', marginBottom:'12px' }}>{s.emoji}</div>
                <div style={{ display:'flex', gap:'6px', marginBottom:'8px' }}>
                  <span style={{ background:s.color+'22', borderRadius:'50px', padding:'3px 10px', fontSize:'11px', color:s.color }}>{s.grade}</span>
                  <span style={{ background:LEVEL_COLORS[s.level]+'22', borderRadius:'50px', padding:'3px 10px', fontSize:'11px', color:LEVEL_COLORS[s.level] }}>{s.level}</span>
                </div>
                <div style={{ fontSize:'20px', color:'#333', marginBottom:'12px', lineHeight:1.2 }}>{s.title}</div>
                <div style={{ background:s.color, borderRadius:'14px', padding:'10px', textAlign:'center', color:'#fff', fontSize:'14px' }}>📖 Start Reading · +{s.xp} XP</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Story reading */}
      {view==='read' && active && (
        <div style={{ maxWidth:'720px', margin:'0 auto', padding:'32px 24px', animation:'fadeUp 0.4s ease' }}>
          <div style={{ background:'rgba(255,255,255,0.96)', borderRadius:'28px', padding:'32px', boxShadow:'0 8px 40px rgba(0,0,0,0.10)' }}>
            <div style={{ textAlign:'center', marginBottom:'24px' }}>
              <div style={{ fontSize:'52px' }}>{active.emoji}</div>
              <div style={{ fontSize:'26px', color:active.color, marginTop:'8px' }}>{active.title}</div>
              <div style={{ fontSize:'13px', color:'#888', fontFamily:'sans-serif', marginTop:'4px' }}>{active.grade} · {active.level}</div>
            </div>

            {/* Read aloud button */}
            <div style={{ display:'flex', gap:'10px', justifyContent:'center', marginBottom:'24px' }}>
              {!spoken ? (
                <button onClick={readAloud} style={{ background:'#1565C0', border:'none', borderRadius:'50px', padding:'10px 24px', color:'#fff', fontSize:'16px', fontFamily:FONT, cursor:'pointer', display:'flex', alignItems:'center', gap:'8px' }}>
                  🔊 Read Aloud (English)
                </button>
              ) : (
                <button onClick={stopRead} style={{ background:'#ef4444', border:'none', borderRadius:'50px', padding:'10px 24px', color:'#fff', fontSize:'16px', fontFamily:FONT, cursor:'pointer', display:'flex', alignItems:'center', gap:'8px' }}>
                  ⏹ Stop Reading
                </button>
              )}
            </div>

            {/* Story text */}
            <div style={{ background:'#FFFDE7', border:'3px solid #FFD70055', borderRadius:'20px', padding:'24px', marginBottom:'24px', lineHeight:2 }}>
              <p style={{ fontSize:'17px', color:'#333', fontFamily:'sans-serif', margin:0, whiteSpace:'pre-line' }}>{active.text}</p>
            </div>

            {/* Vocab */}
            <div style={{ marginBottom:'24px' }}>
              <div style={{ fontSize:'16px', color:active.color, marginBottom:'12px' }}>📘 New Words</div>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:'8px' }}>
                {active.vocab.map((v,i)=>(
                  <div key={i} style={{ background:active.color+'11', border:`2px solid ${active.color}33`, borderRadius:'14px', padding:'10px 14px' }}>
                    <div style={{ fontSize:'15px', fontWeight:700, color:active.color }}>{v.word}</div>
                    <div style={{ fontSize:'12px', color:'#555', fontFamily:'sans-serif', lineHeight:1.5, marginTop:'3px' }}>{v.meaning}</div>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={startQuiz} style={{ width:'100%', background:`linear-gradient(135deg,${active.color},${active.color}cc)`, border:'none', borderRadius:'18px', padding:'16px', color:'#fff', fontSize:'20px', fontFamily:FONT, cursor:'pointer', boxShadow:`0 6px 20px ${active.color}44` }}>
              🎯 Answer Questions — Test Yourself!
            </button>
          </div>
        </div>
      )}

      {/* Quiz */}
      {view==='quiz' && active && q && (
        <div style={{ maxWidth:'580px', margin:'0 auto', padding:'32px 24px', animation:'fadeUp 0.4s ease' }}>
          <div style={{ background:'rgba(255,255,255,0.96)', borderRadius:'28px', padding:'32px', boxShadow:'0 8px 36px rgba(0,0,0,0.10)' }}>
            <div style={{ display:'flex', gap:'8px', marginBottom:'20px' }}>
              {active.questions.map((_,i)=>(<div key={i} style={{ flex:1, height:'8px', borderRadius:'4px', background:i<qIdx?'#10b981':i===qIdx?active.color:'#e2e8f0' }} />))}
            </div>
            <div style={{ fontSize:'13px', color:'#888', fontFamily:'sans-serif', marginBottom:'14px' }}>Question {qIdx+1} of {active.questions.length}</div>
            <div style={{ fontSize:'22px', color:'#333', marginBottom:'28px', lineHeight:1.4 }}>🤔 {q.q}</div>
            <div style={{ display:'grid', gap:'12px' }}>
              {q.opts.map((opt,i)=>{
                const isCorrect=i===q.ans, isPicked=i===picked, revealed=picked!==null;
                return (
                  <button key={i} disabled={revealed} onClick={()=>pickAns(i)} style={{ background:!revealed?'white':isCorrect?'#E8F5E9':isPicked?'#FFEBEE':'white', border:`3px solid ${!revealed?'#e2e8f0':isCorrect?'#10b981':isPicked?'#ef4444':'#e2e8f0'}`, borderRadius:'16px', padding:'14px 20px', fontSize:'16px', color:'#333', fontFamily:FONT, cursor:revealed?'default':'pointer', textAlign:'left', display:'flex', alignItems:'center', gap:'12px', transition:'all 0.2s' }}>
                    <span style={{ width:'28px', height:'28px', borderRadius:'50%', background:active.color+'22', border:`2px solid ${active.color}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px', color:active.color, flexShrink:0 }}>{['A','B','C','D'][i]}</span>
                    {opt}
                    {revealed && isCorrect && <span style={{marginLeft:'auto'}}>✅</span>}
                    {revealed && isPicked && !isCorrect && <span style={{marginLeft:'auto'}}>❌</span>}
                  </button>
                );
              })}
            </div>
            {picked!==null && <button onClick={nextQ} style={{ width:'100%', marginTop:'20px', background:active.color, border:'none', borderRadius:'14px', padding:'14px', color:'#fff', fontSize:'18px', fontFamily:FONT, cursor:'pointer' }}>{qIdx+1<active.questions.length?'Next →':'🎉 Finish!'}</button>}
          </div>
        </div>
      )}

      {/* Result */}
      {view==='result' && active && (
        <div style={{ maxWidth:'480px', margin:'0 auto', padding:'32px 24px', textAlign:'center', animation:'fadeUp 0.4s ease' }}>
          <div style={{ background:'rgba(255,255,255,0.96)', borderRadius:'28px', padding:'40px 32px', boxShadow:'0 8px 40px rgba(0,0,0,0.10)' }}>
            <div style={{ fontSize:'64px' }}>{score===3?'🏆':score>=2?'🌟':'💪'}</div>
            <div style={{ fontSize:'28px', color:score>=2?'#10b981':'#FF6B6B', margin:'16px 0 8px' }}>{score===3?'Perfect Score!':score>=2?'Well done!':'Keep reading!'}</div>
            <div style={{ fontSize:'16px', color:'#666', fontFamily:'sans-serif', marginBottom:'24px' }}>You answered {score} out of {active.questions.length} correctly!</div>
            <div style={{ background:'#FFD700', borderRadius:'16px', padding:'14px', marginBottom:'24px', fontSize:'18px', color:'#7B5800' }}>⭐ +{score>=2?active.xp:Math.round(active.xp/2)} XP!</div>
            <div style={{ display:'flex', gap:'10px', flexDirection:'column' }}>
              <button onClick={() => setView('list')} style={{ background:'#1565C0', border:'none', borderRadius:'14px', padding:'12px', color:'#fff', fontSize:'16px', fontFamily:FONT, cursor:'pointer' }}>📚 More Stories</button>
              <button onClick={() => navigate('/school/sparky-world')} style={{ background:'white', border:'3px solid #888', borderRadius:'14px', padding:'12px', color:'#888', fontSize:'14px', fontFamily:FONT, cursor:'pointer' }}>🌍 World Map</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
