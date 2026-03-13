import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const FONT = "'Fredoka One', cursive";
const BG   = 'linear-gradient(180deg,#1B5E20 0%,#2E7D32 40%,#A5D6A7 100%)';

/* ── Science Topics ──────────────────────────────────────────────────────── */
const TOPICS = [
  {
    id:'animals', icon:'🦁', title:'Animal Kingdom', color:'#FF8F00', xp:25,
    sections:[
      { type:'header', text:'Animals are living beings that breathe, eat, and move! 🐾' },
      { type:'categories', label:'Types of Animals', items:[
        { emoji:'🐮', name:'Herbivores',  desc:'Eat only plants', ex:'Cow, Deer, Rabbit, Horse' },
        { emoji:'🐅', name:'Carnivores',  desc:'Eat only animals', ex:'Lion, Tiger, Eagle, Shark' },
        { emoji:'🐻', name:'Omnivores',   desc:'Eat both plants & animals', ex:'Bear, Crow, Dog, Human' },
      ]},
      { type:'categories', label:'Where Animals Live', items:[
        { emoji:'🌊', name:'Aquatic',     desc:'Live in water', ex:'Fish, Dolphin, Crab, Whale' },
        { emoji:'🌳', name:'Terrestrial', desc:'Live on land',  ex:'Elephant, Cow, Snake, Cat' },
        { emoji:'🌿', name:'Amphibians',  desc:'Live on land AND water', ex:'Frog, Salamander, Toad' },
        { emoji:'🐦', name:'Aerial',      desc:'Spend most time in air',  ex:'Eagle, Parrot, Bat, Pigeon' },
      ]},
      { type:'fun_facts', items:[
        '🐙 An octopus has 3 hearts and blue blood!',
        '🦒 A giraffe has the same number of neck bones as a human — 7!',
        '🐘 Elephants are the only animals that cannot jump!',
        '🦋 A butterfly tastes with its feet!',
        '🐬 Dolphins sleep with one eye open!',
      ]},
    ],
    quiz:[
      { q:'What do carnivores eat?', opts:['Only plants','Only animals','Both plants and animals','Rocks'], ans:1 },
      { q:'Frogs are called amphibians because...?', opts:['They are green','They live on land and in water','They can fly','They eat fish'], ans:1 },
      { q:'Which is NOT a herbivore?', opts:['Cow','Deer','Tiger','Horse'], ans:2 },
    ],
  },
  {
    id:'states', icon:'💧', title:'States of Matter', color:'#0277BD', xp:30,
    sections:[
      { type:'header', text:'Everything around us is made of MATTER! Matter exists in 3 states! 🔬' },
      { type:'states_of_matter', items:[
        { state:'Solid', emoji:'🧊', color:'#38bdf8', description:'Has a fixed shape and size. Particles are packed very tightly.', examples:['Ice','Rock','Wood','Book'] },
        { state:'Liquid', emoji:'💧', color:'#10b981', description:'Has a fixed size but no fixed shape. Takes the shape of its container!', examples:['Water','Milk','Juice','Oil'] },
        { state:'Gas', emoji:'💨', color:'#a78bfa', description:'Has no fixed shape or size. Spreads in all directions!', examples:['Air','Steam','Smoke','Oxygen'] },
      ]},
      { type:'transitions', items:[
        { from:'Solid', to:'Liquid', process:'Melting', heat:'When we ADD heat (🔥)', ex:'Ice → Water' },
        { from:'Liquid', to:'Gas',   process:'Evaporation', heat:'When we ADD heat (🔥)', ex:'Water → Steam' },
        { from:'Gas', to:'Liquid',   process:'Condensation', heat:'When we REMOVE heat (❄️)', ex:'Steam → Water' },
        { from:'Liquid', to:'Solid', process:'Freezing', heat:'When we REMOVE heat (❄️)', ex:'Water → Ice' },
      ]},
      { type:'fun_facts', items:[
        '🌡️ Water boils at 100°C and freezes at 0°C!',
        '🪵 Wood is a solid that can burn into gas!',
        '💨 Air is a mixture of many gases — mainly Nitrogen (78%) and Oxygen (21%)!',
        '🧊 Ice is lighter than water — that\'s why it floats!',
      ]},
    ],
    quiz:[
      { q:'If you heat ice, it becomes?', opts:['Gas','Liquid','Solid','Nothing'], ans:1 },
      { q:'Which has no fixed shape OR size?', opts:['Solid','Liquid','Gas','Ice'], ans:2 },
      { q:'The process of liquid turning to gas is called?', opts:['Freezing','Melting','Evaporation','Condensation'], ans:2 },
    ],
  },
  {
    id:'light', icon:'💡', title:'Light & Shadow', color:'#F57F17', xp:25,
    sections:[
      { type:'header', text:'Light helps us see the world! Without light, everything is dark! 🌟' },
      { type:'categories', label:'Sources of Light', items:[
        { emoji:'☀️', name:'Natural Sources', desc:'Made by nature', ex:'Sun, Stars, Firefly, Fire' },
        { emoji:'💡', name:'Artificial Sources', desc:'Made by humans', ex:'Bulb, Torch, Candle, LED' },
      ]},
      { type:'categories', label:'How Objects Behave with Light', items:[
        { emoji:'🪟', name:'Transparent', desc:'Light passes through completely', ex:'Glass, Water, Air' },
        { emoji:'🌫️', name:'Translucent', desc:'Light passes through partially', ex:'Tissue paper, Clouds, Frosted glass' },
        { emoji:'🪨', name:'Opaque',      desc:'Light cannot pass through at all', ex:'Wood, Metal, Brick, Wall' },
      ]},
      { type:'experiment', title:'Make a Shadow!', steps:['1. Find a torch or use sunlight.','2. Hold your hand in front of the light.','3. Look at the surface behind — you see a SHADOW!','4. The shadow appears because your hand is OPAQUE (blocks light)!','5. Move your hand closer → shadow gets BIGGER! 🔍'] },
      { type:'fun_facts', items:[
        '🌈 Light travels at 3,00,000 km per second — the fastest thing in the universe!',
        '🌸 Plants need light (from sunlight) to make their food — this is called Photosynthesis!',
        '🌑 A shadow is always on the opposite side from the light source!',
      ]},
    ],
    quiz:[
      { q:'Which is a natural source of light?', opts:['Torch','Candle','Stars','Bulb'], ans:2 },
      { q:'If you can see through something clearly, it is?', opts:['Opaque','Translucent','Transparent','Shiny'], ans:2 },
      { q:'A shadow forms because objects that are __ block light.', opts:['Transparent','Translucent','Coloured','Opaque'], ans:3 },
    ],
  },
];

export default function DiscoveryGarden() {
  const navigate = useNavigate();
  const [view, setView]     = useState('list');
  const [active, setActive] = useState(null);
  const [qIdx, setQIdx]     = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore]   = useState(0);
  const [done, setDone]     = useState({});

  const openTopic = (t) => { setActive(t); setView('topic'); };
  const startQuiz = () => { setView('quiz'); setQIdx(0); setPicked(null); setScore(0); };
  const pickAns   = (i) => {
    if (picked !== null) return;
    setPicked(i);
    if (i === active.quiz[qIdx].ans) setScore(s=>s+1);
  };
  const nextQ = () => {
    if (qIdx+1 < active.quiz.length) { setQIdx(q=>q+1); setPicked(null); }
    else { setView('result'); setDone(d=>({...d,[active.id]:true})); }
  };

  const q = active?.quiz?.[qIdx];

  return (
    <div style={{ minHeight:'100vh', background:BG, fontFamily:FONT, paddingBottom:'80px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&display=swap');
        @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes sway{0%,100%{transform:rotate(-3deg)}50%{transform:rotate(3deg)}}
        .topic-card:hover{transform:translateY(-4px) scale(1.02);box-shadow:0 12px 36px rgba(0,0,0,0.2)!important;transition:all 0.2s;}
      `}</style>

      {/* Header */}
      <div style={{ background:'rgba(0,0,0,0.3)', backdropFilter:'blur(10px)', padding:'14px 24px', display:'flex', alignItems:'center', gap:'14px', position:'sticky', top:0, zIndex:50, borderBottom:'2px solid rgba(255,255,255,0.15)' }}>
        <button onClick={() => view==='list'?navigate('/school/sparky-world'):setView('list')} style={{ background:'#388E3C', border:'none', borderRadius:'50px', padding:'8px 20px', color:'#fff', fontSize:'15px', fontFamily:FONT, cursor:'pointer' }}>
          {view==='list'?'🌍 World Map':'← Topics'}
        </button>
        <span style={{ fontSize:'28px' }}>🌿</span>
        <span style={{ fontSize:'22px', color:'#C8E6C9', textShadow:'0 2px 8px rgba(0,0,0,0.3)' }}>Discovery Garden</span>
      </div>

      {/* Topic list */}
      {view==='list' && (
        <div style={{ maxWidth:'820px', margin:'0 auto', padding:'40px 24px', animation:'fadeUp 0.4s ease' }}>
          <div style={{ textAlign:'center', marginBottom:'32px' }}>
            <div style={{ fontSize:'28px', color:'#fff', textShadow:'0 2px 8px rgba(0,0,0,0.3)' }}>🔬 Science Explorer</div>
            <div style={{ fontSize:'14px', color:'rgba(255,255,255,0.7)', fontFamily:'sans-serif', marginTop:'6px' }}>Discover the amazing world of science! 🌟</div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:'20px' }}>
            {TOPICS.map(t=>(
              <div key={t.id} className="topic-card" onClick={()=>openTopic(t)} style={{ background:'rgba(255,255,255,0.12)', backdropFilter:'blur(10px)', borderRadius:'24px', padding:'28px 20px', cursor:'pointer', boxShadow:'0 6px 24px rgba(0,0,0,0.15)', border:`3px solid ${done[t.id]?'#A5D6A7':t.color+'44'}`, textAlign:'center' }}>
                {done[t.id] && <div style={{ background:'#A5D6A7', borderRadius:'50px', padding:'3px 10px', fontSize:'11px', color:'#1B5E20', display:'inline-block', marginBottom:'10px' }}>✅ Done</div>}
                <div style={{ fontSize:'56px', marginBottom:'14px', animation:'sway 4s ease-in-out infinite' }}>{t.icon}</div>
                <div style={{ fontSize:'20px', color:'#fff', marginBottom:'8px' }}>{t.title}</div>
                <div style={{ background:`${t.color}`, borderRadius:'14px', padding:'10px', color:'#fff', fontSize:'14px', marginTop:'14px' }}>🔬 Explore · +{t.xp} XP</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Topic detail */}
      {view==='topic' && active && (
        <div style={{ maxWidth:'760px', margin:'0 auto', padding:'32px 24px', animation:'fadeUp 0.4s ease' }}>
          <div style={{ background:'rgba(255,255,255,0.95)', borderRadius:'28px', padding:'32px', boxShadow:'0 8px 40px rgba(0,0,0,0.2)' }}>
            <div style={{ textAlign:'center', marginBottom:'24px' }}>
              <div style={{ fontSize:'56px' }}>{active.icon}</div>
              <div style={{ fontSize:'26px', color:active.color, marginTop:'8px' }}>{active.title}</div>
            </div>

            {active.sections.map((sec, si)=>(
              <div key={si} style={{ marginBottom:'24px' }}>
                {sec.type==='header' && (
                  <div style={{ background:active.color+'15', border:`2px solid ${active.color}33`, borderRadius:'16px', padding:'14px 20px', fontSize:'18px', color:'#333', fontFamily:'sans-serif', lineHeight:1.7 }}>💡 {sec.text}</div>
                )}
                {sec.type==='categories' && (
                  <div>
                    <div style={{ fontSize:'16px', color:active.color, marginBottom:'10px' }}>{sec.label}</div>
                    <div style={{ display:'grid', gap:'10px' }}>
                      {sec.items.map((item,i)=>(
                        <div key={i} style={{ background:'white', border:'2px solid #e2e8f0', borderRadius:'16px', padding:'14px 16px', display:'flex', gap:'14px', alignItems:'flex-start', boxShadow:'0 2px 10px rgba(0,0,0,0.05)' }}>
                          <span style={{ fontSize:'28px' }}>{item.emoji}</span>
                          <div>
                            <div style={{ fontSize:'16px', color:'#333' }}>{item.name}</div>
                            <div style={{ fontSize:'13px', color:'#666', fontFamily:'sans-serif' }}>{item.desc}</div>
                            <div style={{ fontSize:'12px', color:active.color, marginTop:'4px', fontFamily:'sans-serif' }}>Examples: {item.ex}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {sec.type==='states_of_matter' && (
                  <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:'12px' }}>
                    {sec.items.map((st,i)=>(
                      <div key={i} style={{ background:st.color+'15', border:`2px solid ${st.color}44`, borderRadius:'16px', padding:'16px', textAlign:'center' }}>
                        <div style={{ fontSize:'36px', marginBottom:'8px' }}>{st.emoji}</div>
                        <div style={{ fontSize:'16px', color:'#333', marginBottom:'6px' }}>{st.state}</div>
                        <div style={{ fontSize:'12px', color:'#555', fontFamily:'sans-serif', lineHeight:1.5, marginBottom:'8px' }}>{st.description}</div>
                        <div style={{ display:'flex', flexWrap:'wrap', gap:'4px', justifyContent:'center' }}>
                          {st.examples.map((e,j)=><span key={j} style={{ background:st.color+'22', borderRadius:'99px', padding:'2px 8px', fontSize:'11px', color:st.color }}>{e}</span>)}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                {sec.type==='transitions' && (
                  <div>
                    <div style={{ fontSize:'16px', color:active.color, marginBottom:'10px' }}>🔄 How Matter Changes State</div>
                    <div style={{ display:'grid', gap:'8px' }}>
                      {sec.items.map((tr,i)=>(
                        <div key={i} style={{ background:'white', border:'2px solid #e2e8f0', borderRadius:'14px', padding:'12px 16px', display:'flex', alignItems:'center', gap:'12px', fontFamily:'sans-serif' }}>
                          <span style={{ fontSize:'14px', fontWeight:700, color:'#666', minWidth:'80px' }}>{tr.from}</span>
                          <span style={{ color:'#aaa' }}>→</span>
                          <span style={{ fontSize:'14px', fontWeight:700, color:'#333', minWidth:'80px' }}>{tr.to}</span>
                          <span style={{ background:'#38bdf822', borderRadius:'99px', padding:'3px 10px', fontSize:'12px', color:'#0277BD', fontWeight:700 }}>{tr.process}</span>
                          <span style={{ fontSize:'12px', color:'#777', marginLeft:'auto' }}>{tr.ex}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                {sec.type==='experiment' && (
                  <div style={{ background:'#FFF8E1', border:'2px solid #FFD70044', borderRadius:'16px', padding:'16px' }}>
                    <div style={{ fontSize:'16px', color:'#F57F17', marginBottom:'10px' }}>🧪 {sec.title}</div>
                    {sec.steps.map((step,i)=>(<div key={i} style={{ fontSize:'14px', color:'#333', fontFamily:'sans-serif', lineHeight:2 }}>{step}</div>))}
                  </div>
                )}
                {sec.type==='fun_facts' && (
                  <div style={{ background:'#E8F5E9', borderRadius:'16px', padding:'16px', border:'2px solid #A5D6A733' }}>
                    <div style={{ fontSize:'15px', color:'#388E3C', marginBottom:'10px' }}>🌟 Did You Know?</div>
                    {sec.items.map((f,i)=>(<div key={i} style={{ fontSize:'14px', color:'#333', fontFamily:'sans-serif', lineHeight:2 }}>{f}</div>))}
                  </div>
                )}
              </div>
            ))}

            <button onClick={startQuiz} style={{ width:'100%', background:`linear-gradient(135deg,${active.color},${active.color}cc)`, border:'none', borderRadius:'18px', padding:'16px', color:'#fff', fontSize:'20px', fontFamily:FONT, cursor:'pointer', marginTop:'8px' }}>
              🎯 Take the Science Quiz!
            </button>
          </div>
        </div>
      )}

      {/* Quiz */}
      {view==='quiz' && active && q && (
        <div style={{ maxWidth:'560px', margin:'0 auto', padding:'32px 24px', animation:'fadeUp 0.4s ease' }}>
          <div style={{ background:'rgba(255,255,255,0.96)', borderRadius:'28px', padding:'32px', boxShadow:'0 8px 36px rgba(0,0,0,0.15)' }}>
            <div style={{ display:'flex', gap:'8px', marginBottom:'20px' }}>
              {active.quiz.map((_,i)=>(<div key={i} style={{ flex:1, height:'8px', borderRadius:'4px', background:i<qIdx?'#10b981':i===qIdx?active.color:'#e2e8f0' }} />))}
            </div>
            <div style={{ fontSize:'22px', color:'#333', marginBottom:'28px', lineHeight:1.4 }}>🔬 {q.q}</div>
            <div style={{ display:'grid', gap:'12px' }}>
              {q.opts.map((opt,i)=>{
                const isCorrect=i===q.ans, isPicked=i===picked, revealed=picked!==null;
                return (
                  <button key={i} disabled={revealed} onClick={()=>pickAns(i)} style={{ background:!revealed?'white':isCorrect?'#E8F5E9':isPicked?'#FFEBEE':'white', border:`3px solid ${!revealed?'#e2e8f0':isCorrect?'#10b981':isPicked?'#ef4444':'#e2e8f0'}`, borderRadius:'16px', padding:'14px 20px', fontSize:'16px', color:'#333', fontFamily:FONT, cursor:revealed?'default':'pointer', textAlign:'left', display:'flex', alignItems:'center', gap:'12px', transition:'all 0.2s' }}>
                    <span style={{ width:'28px', height:'28px', borderRadius:'50%', background:active.color+'22', border:`2px solid ${active.color}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'13px', color:active.color, flexShrink:0 }}>{['A','B','C','D'][i]}</span>
                    {opt}
                    {revealed&&isCorrect&&<span style={{marginLeft:'auto'}}>✅</span>}
                    {revealed&&isPicked&&!isCorrect&&<span style={{marginLeft:'auto'}}>❌</span>}
                  </button>
                );
              })}
            </div>
            {picked!==null&&<button onClick={nextQ} style={{ width:'100%', marginTop:'20px', background:active.color, border:'none', borderRadius:'14px', padding:'14px', color:'#fff', fontSize:'18px', fontFamily:FONT, cursor:'pointer' }}>{qIdx+1<active.quiz.length?'Next →':'🎉 See Result!'}</button>}
          </div>
        </div>
      )}

      {/* Result */}
      {view==='result' && active && (
        <div style={{ maxWidth:'480px', margin:'0 auto', padding:'32px 24px', textAlign:'center', animation:'fadeUp 0.4s ease' }}>
          <div style={{ background:'rgba(255,255,255,0.96)', borderRadius:'28px', padding:'40px 32px', boxShadow:'0 8px 40px rgba(0,0,0,0.15)' }}>
            <div style={{ fontSize:'64px' }}>{score===3?'🏆':score>=2?'🌟':'💪'}</div>
            <div style={{ fontSize:'28px', color:active.color, margin:'16px 0 8px' }}>{score===3?'Science Star!':score>=2?'Great work!':'Keep exploring!'}</div>
            <div style={{ fontSize:'16px', color:'#666', fontFamily:'sans-serif', marginBottom:'24px' }}>You got {score} out of {active.quiz.length} right!</div>
            <div style={{ background:'#FFD700', borderRadius:'16px', padding:'14px', marginBottom:'24px', fontSize:'18px', color:'#7B5800' }}>⭐ +{score>=2?active.xp:Math.round(active.xp/2)} XP!</div>
            <div style={{ display:'flex', gap:'10px', flexDirection:'column' }}>
              <button onClick={()=>setView('list')} style={{ background:active.color, border:'none', borderRadius:'14px', padding:'12px', color:'#fff', fontSize:'16px', fontFamily:FONT, cursor:'pointer' }}>🌿 More Topics</button>
              <button onClick={()=>navigate('/school/sparky-world')} style={{ background:'white', border:'3px solid #888', borderRadius:'14px', padding:'12px', color:'#888', fontSize:'14px', fontFamily:FONT, cursor:'pointer' }}>🌍 World Map</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
