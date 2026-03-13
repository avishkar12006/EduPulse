/**
 * SparkyChat — Universal Gemini AI Chatbot for all EduPulse School Worlds
 * Works for Class 3-5 (friendly/fun), 6-8 (cool/social), 9-12 (detailed/professional)
 * Floating button + slide-up chat panel with streaming responses
 */
import { useState, useRef, useEffect } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';

/* World-specific persona configuration */
const WORLD_CONFIG = {
  '3-5': {
    font:   "'Fredoka One', cursive",
    botName:'Sparky',
    botEmoji:'🤖',
    color:  '#FF6B6B',
    bg:     'linear-gradient(135deg,#FF6B6B,#FF8E53)',
    systemPrompt: `You are Sparky, a super friendly and fun AI tutor for children aged 8-11 (Class 3-5 in India).
Always use simple language, short sentences, lots of emojis, and exciting expressions!
Explain concepts in very easy ways using real-life examples kids know (cartoons, food, toys, animals).
Follow NCERT curriculum for Class 3-5. Topics: Basic Math (addition, subtraction, multiplication, fractions), 
English (nouns, verbs, adjectives, stories), EVS (plants, animals, solar system, water).
Always encourage the child, never say something is wrong harshly. End responses with a fun fact or question!
Keep answers under 150 words unless the child asks for more detail.`,
    placeholder: 'Ask Sparky anything! 🌟',
    suggQuestions: [
      'What is a noun? 📖','How do I multiply? 🔢','Why is the sky blue? 🌤️','Tell me about lions! 🦁',
    ],
  },
  '6-8': {
    font:   "'Nunito', sans-serif",
    botName:'EduBot',
    botEmoji:'🚀',
    color:  '#6366f1',
    bg:     'linear-gradient(135deg,#6366f1,#8b5cf6)',
    systemPrompt: `You are EduBot, a cool and knowledgeable AI tutor for students aged 11-14 (Class 6-8 in India).
Be engaging, use modern references students can relate to. Mix explanations with examples.
Follow NCERT curriculum for Class 6-8. Cover: Mathematics (Algebra, Geometry, Statistics, Ratio & Proportion),
Science (Physics - Force & Motion, Light, Sound; Chemistry - Materials, Acids & Bases; Biology - Cells, Ecosystems),
Social Science (History - Medieval India, Mughal Empire; Geography; Civics - Constitution),
English (Grammar, Literature, Creative Writing).
Give detailed but well-structured answers with bullet points when helpful. Use analogies.
Ask follow-up questions to check understanding. Keep responses under 200 words unless asked for more.`,
    placeholder: 'Ask EduBot anything! 🚀',
    suggQuestions: [
      'Explain photosynthesis 🌿','What is linear algebra? ➗','Tell me about the Mughal Empire 🏰','How does a circuit work? ⚡',
    ],
  },
  '9-12': {
    font:   "'Space Mono', monospace",
    botName:'AI Mentor',
    botEmoji:'🧠',
    color:  '#00ff88',
    bg:     'linear-gradient(135deg,#0f172a,#1e293b)',
    systemPrompt: `You are an expert AI Mentor for students in Class 9-12 in India preparing for board exams, JEE, NEET, and competitive exams.
Provide accurate, detailed, exam-focused answers. Reference NCERT textbooks, CBSE syllabus, and competitive exam patterns.
Mathematics: Calculus, Trigonometry, Algebra, Coordinate Geometry, Probability, Statistics.
Physics: Mechanics, Thermodynamics, Electrostatics, Optics, Modern Physics.
Chemistry: Organic Chemistry (reactions, mechanisms), Inorganic (periodic table, bonding), Physical Chemistry (thermodynamics, equilibrium, electrochemistry).
Biology: Cell Biology, Genetics, Evolution, Human Physiology, Ecology.
Computer Science/Programming: Python, Data Structures, Algorithms, DBMS, Networking.
Give step-by-step solutions for numerical problems. Include formulas. Mention marks weightage for boards/JEE/NEET where relevant.
Format clearly with headings, numbered steps, formulae. Be precise and accurate.`,
    placeholder: '> Query the AI Mentor...',
    suggQuestions: [
      'Solve: d/dx(sin²x) ','Newton\'s laws + numericals ⚙️','Organic reaction mechanisms 🧪','Explain Big O notation 💻',
    ],
  },
};

const MAX_HISTORY = 20; // max messages to keep in context

export default function SparkyChat({ world = '6-8', subject = 'General', studentName = 'Student' }) {
  const cfg    = WORLD_CONFIG[world] || WORLD_CONFIG['6-8'];
  const [open, setOpen]       = useState(false);
  const [msgs, setMsgs]       = useState([
    { role:'bot', text:`Hi ${studentName}! I'm ${cfg.botName} ${cfg.botEmoji}\nAsk me ANYTHING about ${subject}! I'll explain it just for you. 💡` },
  ]);
  const [input, setInput]     = useState('');
  const [loading, setLoading] = useState(false);
  const [streaming, setStreaming] = useState('');
  const [error, setError]     = useState('');
  const endRef  = useRef(null);
  const inputRef= useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior:'smooth' }); }, [msgs, streaming]);
  useEffect(() => { if (open) setTimeout(()=>inputRef.current?.focus(), 200); }, [open]);

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return;
    const userMsg = { role:'user', text };
    const newMsgs = [...msgs, userMsg];
    setMsgs(newMsgs);
    setInput('');
    setLoading(true);
    setStreaming('');
    setError('');

    try {
      const genAI = new GoogleGenerativeAI(GEMINI_KEY);
      const model = genAI.getGenerativeModel({ model:'gemini-2.5-flash' });

      // Build conversation history — Gemini REQUIRES history to start with 'user' role
      // So we skip all leading bot/model messages (e.g. the initial greeting)
      const rawHistory = newMsgs.slice(-MAX_HISTORY).slice(0, -1); // all except current user msg
      const firstUserIdx = rawHistory.findIndex(m => m.role === 'user');
      const history = (firstUserIdx >= 0 ? rawHistory.slice(firstUserIdx) : []).map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }],
      }));

      const chat = model.startChat({
        history,
        systemInstruction: cfg.systemPrompt + `\nCurrent subject context: ${subject}. Student name: ${studentName}.`,
      });

      const result = await chat.sendMessageStream(text);
      let fullReply = '';
      for await (const chunk of result.stream) {
        const chunkText = chunk.text();
        fullReply += chunkText;
        setStreaming(fullReply);
      }
      setMsgs(prev => [...prev, { role:'bot', text:fullReply }]);
      setStreaming('');
    } catch (e) {
      const errMsg = e?.message?.includes('API_KEY') 
        ? 'API key not configured. Add VITE_GEMINI_API_KEY to .env'
        : `Error: ${e?.message || 'Could not reach AI. Check your connection.'}`;
      setError(errMsg);
      setMsgs(prev => [...prev, { role:'bot', text:`⚠️ ${errMsg}`, isError:true }]);
    } finally {
      setLoading(false);
      setStreaming('');
    }
  };

  const is912 = world === '9-12';

  return (
    <>
      <style>{`
        @keyframes chatSlide{from{opacity:0;transform:translateY(20px) scale(0.95)}to{opacity:1;transform:translateY(0) scale(1)}}
        @keyframes pulse{0%,100%{transform:scale(1)}50%{transform:scale(1.1)}}
        @keyframes typingDot{0%,60%,100%{transform:translateY(0)}30%{transform:translateY(-6px)}}
        .chat-msg-user{background:${cfg.color};color:#fff;border-radius:18px 18px 4px 18px;align-self:flex-end;}
        .chat-msg-bot{background:${is912?'rgba(255,255,255,0.06)':'rgba(255,255,255,0.92)'};color:${is912?'#e2e8f0':'#222'};border-radius:18px 18px 18px 4px;border:1px solid ${cfg.color}33;}
        .chat-input:focus{outline:none;border-color:${cfg.color}!important;}
        .chat-send-btn:hover{opacity:0.85;transform:scale(1.05);}
        .sugg-chip:hover{background:${cfg.color}22!important;transform:translateY(-2px);}
        pre,code{font-family:'Courier New',monospace;font-size:12px;background:rgba(0,0,0,0.12);padding:2px 6px;border-radius:4px;}
      `}</style>

      {/* Chat Toggle Button */}
      {!open && (
        <button onClick={() => setOpen(true)} style={{ position:'fixed', bottom:'28px', right:'28px', width:'60px', height:'60px', borderRadius:'50%', background:cfg.bg, border:'none', cursor:'pointer', zIndex:1000, boxShadow:`0 4px 24px ${cfg.color}66`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'28px', animation:'pulse 2s ease-in-out infinite' }}>
          {cfg.botEmoji}
        </button>
      )}

      {/* Chat Panel */}
      {open && (
        <div style={{ position:'fixed', bottom:'24px', right:'24px', width:'380px', maxWidth:'96vw', height:'560px', maxHeight:'80vh', borderRadius:'24px', background: is912 ? '#0f172a' : '#fff', border:`2px solid ${cfg.color}44`, boxShadow:`0 16px 60px rgba(0,0,0,0.25),0 0 0 1px ${cfg.color}22`, zIndex:1001, display:'flex', flexDirection:'column', animation:'chatSlide 0.3s ease', overflow:'hidden', fontFamily:cfg.font }}>

          {/* Header */}
          <div style={{ background:cfg.bg, padding:'14px 18px', display:'flex', alignItems:'center', gap:'10px', flexShrink:0 }}>
            <span style={{ fontSize:'24px' }}>{cfg.botEmoji}</span>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:'16px', color:'#fff', fontWeight:700 }}>{cfg.botName}</div>
              <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.7)' }}>AI Tutor · {subject}</div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:'6px', marginRight:'8px' }}>
              <div style={{ width:'8px', height:'8px', borderRadius:'50%', background:'#00ff88' }} />
              <span style={{ fontSize:'11px', color:'rgba(255,255,255,0.7)' }}>Online</span>
            </div>
            <button onClick={()=>setOpen(false)} style={{ background:'rgba(255,255,255,0.2)', border:'none', borderRadius:'50%', width:'28px', height:'28px', color:'#fff', cursor:'pointer', fontSize:'14px', display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>
          </div>

          {/* Messages */}
          <div style={{ flex:1, overflowY:'auto', padding:'16px', display:'flex', flexDirection:'column', gap:'10px' }}>
            {msgs.map((msg,i)=>(
              <div key={i} className={msg.role==='user'?'chat-msg-user':'chat-msg-bot'} style={{ padding:'10px 14px', fontSize:'14px', lineHeight:1.6, maxWidth:'88%', textAlign:'left', whiteSpace:'pre-wrap', wordBreak:'break-word' }}>
                {msg.role==='bot' && <span style={{ fontSize:'12px', color:cfg.color, fontWeight:700, display:'block', marginBottom:'4px' }}>{cfg.botEmoji} {cfg.botName}</span>}
                {msg.text}
              </div>
            ))}

            {/* Streaming */}
            {streaming && (
              <div className="chat-msg-bot" style={{ padding:'10px 14px', fontSize:'14px', lineHeight:1.6, maxWidth:'88%', whiteSpace:'pre-wrap', wordBreak:'break-word' }}>
                <span style={{ fontSize:'12px', color:cfg.color, fontWeight:700, display:'block', marginBottom:'4px' }}>{cfg.botEmoji} {cfg.botName}</span>
                {streaming}
                <span style={{ display:'inline-block', width:'6px', height:'14px', background:cfg.color, borderRadius:'2px', marginLeft:'3px', animation:'typingDot 0.8s ease-in-out infinite' }} />
              </div>
            )}

            {/* Loading */}
            {loading && !streaming && (
              <div className="chat-msg-bot" style={{ padding:'14px', display:'flex', gap:'5px', maxWidth:'80px' }}>
                {[0,1,2].map(i=><div key={i} style={{ width:'8px', height:'8px', borderRadius:'50%', background:cfg.color, animation:`typingDot 0.6s ease-in-out ${i*0.2}s infinite` }} />)}
              </div>
            )}
            <div ref={endRef} />
          </div>

          {/* Suggested questions */}
          {msgs.length === 1 && (
            <div style={{ padding:'0 12px 8px', display:'flex', gap:'6px', flexWrap:'wrap', flexShrink:0 }}>
              {cfg.suggQuestions.map((q,i)=>(
                <button key={i} className="sugg-chip" onClick={()=>sendMessage(q)} style={{ background:`${cfg.color}11`, border:`1px solid ${cfg.color}44`, borderRadius:'50px', padding:'5px 12px', fontSize:'11px', color:cfg.color, cursor:'pointer', transition:'all 0.2s', fontFamily:cfg.font }}>
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div style={{ padding:'12px', borderTop:`1px solid ${cfg.color}22`, display:'flex', gap:'8px', flexShrink:0 }}>
            <input
              ref={inputRef}
              className="chat-input"
              value={input}
              onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>e.key==='Enter'&&!e.shiftKey&&(e.preventDefault(),sendMessage(input))}
              placeholder={cfg.placeholder}
              disabled={loading}
              style={{ flex:1, background: is912?'rgba(255,255,255,0.06)':'#f8f9fa', border:`2px solid ${cfg.color}33`, borderRadius:'14px', padding:'10px 14px', fontSize:'14px', color: is912?'#e2e8f0':'#222', fontFamily:cfg.font, transition:'border-color 0.2s' }}
            />
            <button
              className="chat-send-btn"
              onClick={()=>sendMessage(input)}
              disabled={loading || !input.trim()}
              style={{ background:cfg.bg, border:'none', borderRadius:'14px', padding:'10px 16px', cursor:'pointer', color:'#fff', fontSize:'18px', transition:'all 0.2s', opacity:(loading||!input.trim())?0.5:1 }}
            >
              {loading?'⏳':'➤'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
