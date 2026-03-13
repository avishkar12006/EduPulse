import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { DEMO_STUDENTS } from '../../data/demoData';
import { GoogleGenerativeAI } from '@google/generative-ai';

const GEMINI_KEY = import.meta.env.VITE_GEMINI_API_KEY || '';
const BACKEND = import.meta.env.VITE_API_URL || '';



const QUICK_PROMPTS = [
  { label: 'Help with grades 📊', text: 'Can you help me understand my grade performance?' },
  { label: 'Career paths 🎯', text: 'Tell me about career paths suited for me.' },
  { label: "I'm stressed 😔", text: "I'm feeling really stressed about my exams." },
  { label: 'Motivate me! 💪', text: 'I need some motivation to keep studying!' },
  { label: 'Study plan 📖', text: 'What should I focus on studying today?' },
  { label: 'Explain concept 📚', text: 'Can you explain Data Structures in a simple way?' },
];

const SPARKY_EMOTES = { idle: '🤖', thinking: '🤔', happy: '😄', excited: '🤩', caring: '🥰' };

function SparkyAvatar({ emote, size = 80 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'linear-gradient(135deg, #1e3a5f, #0A1628)',
      border: '3px solid rgba(0,191,255,0.5)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.45,
      boxShadow: '0 0 20px rgba(0,191,255,0.3)',
      transition: 'all 0.3s ease',
    }}>
      {SPARKY_EMOTES[emote] || '🤖'}
    </div>
  );
}

function TypingIndicator() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
      <SparkyAvatar emote="thinking" size={40} />
      <div style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '18px 18px 18px 4px', padding: '14px 18px', display: 'flex', gap: '6px', alignItems: 'center' }}>
        {[0, 1, 2].map(i => (
          <div key={i} style={{
            width: '8px', height: '8px', borderRadius: '50%',
            background: '#00BFFF',
            animation: 'sparkydot 0.9s ease-in-out infinite',
            animationDelay: `${i * 0.2}s`,
          }} />
        ))}
      </div>
    </div>
  );
}

export default function SparkyChatPage() {
  const { user } = useAuth();
  const studentData = DEMO_STUDENTS[user?.studentId] || DEMO_STUDENTS['stu_aarav'];

  const [messages, setMessages] = useState([{
    role: 'sparky',
    text: `Hey ${user?.name?.split(' ')[0] || 'there'}! 🤖✨ I'm Sparky, your AI academic buddy powered by Google Gemini! I can help with grades, career paths, study plans, or just cheer you on. What's on your mind today?`,
    time: new Date(),
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sparkyEmote, setSparkyEmote] = useState('idle');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  const [streaming, setStreaming] = useState('');

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  useEffect(() => { scrollToBottom(); }, [messages, streaming]);

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return;
    const userMsg = { role: 'user', text: text.trim(), time: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setStreaming('');
    setSparkyEmote('thinking');

    const stressed = /stress|anxious|worried|scared|fail|cry|sad|depressed/i.test(text);

    try {
      if (!GEMINI_KEY) throw new Error('VITE_GEMINI_API_KEY not set in .env');

      const persona = `You are Sparky 🤖, a highly knowledgeable and friendly AI academic buddy for EduPulse.
Student: ${user?.name || 'Student'}, Cluster: ${studentData?.cluster || 'medium'}, Attendance: ${studentData?.attendancePercentage || 75}%, Health Score: ${studentData?.academicHealthScore || 60}/100.
For academic questions: give COMPLETE, detailed explanations with examples, bullet points, code samples where needed. No length limits.
For stress/emotional topics: be warm and supportive first, then practical. Use emojis. Always encouraging. Reference NCERT/CBSE for Indian students.`;

      // Build conversation history for v1 REST API
      const historyMsgs = messages.filter(m => m.role !== 'sparky' || messages.indexOf(m) > 0);
      const firstUserIdx = historyMsgs.findIndex(m => m.role === 'user');
      const historyContents = (firstUserIdx >= 0 ? historyMsgs.slice(firstUserIdx) : []).map(m => ({
        role: m.role === 'user' ? 'user' : 'model',
        parts: [{ text: m.text }],
      }));

      // Prepend persona into first message only
      const finalMsg = historyContents.length === 0 ? `${persona}\n\n${text.trim()}` : text.trim();
      const contents = [...historyContents, { role: 'user', parts: [{ text: finalMsg }] }];

      // Direct call to v1 endpoint (supports gemini-1.5-flash free tier)
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents,
            generationConfig: { temperature: 0.75, maxOutputTokens: 2048 },
          }),
        }
      );

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData?.error?.message || `HTTP ${res.status}`);
      }

      const data = await res.json();
      const fullReply = data?.candidates?.[0]?.content?.parts?.[0]?.text || '🤖 Hmm, no response. Try again!';

      setStreaming('');
      setSparkyEmote(stressed ? 'caring' : 'happy');
      setMessages(prev => [...prev, { role: 'sparky', text: fullReply, time: new Date() }]);
      setTimeout(scrollToBottom, 100);

      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(fullReply.replace(/[\u{1F300}-\u{1FFFF}]/gu, ''));
        utter.rate = 0.95; utter.pitch = 1.1; utter.volume = 0.8;
        utter.onstart = () => setIsSpeaking(true);
        utter.onend = () => { setIsSpeaking(false); setSparkyEmote('idle'); };
        window.speechSynthesis.speak(utter);
      } else {
        setTimeout(() => setSparkyEmote('idle'), 2000);
      }
    } catch (err) {
      const errMsg = err?.message?.includes('VITE_')
        ? '⚠️ API key missing. Add VITE_GEMINI_API_KEY to frontend .env'
        : `⚠️ ${err?.message || 'Could not reach Gemini AI.'}`;
      setStreaming('');
      setMessages(prev => [...prev, { role: 'sparky', text: errMsg, time: new Date() }]);
      setSparkyEmote('idle');
      setTimeout(scrollToBottom, 100);
    } finally {
      setLoading(false);
      setStreaming('');
    }
  };




  const startVoiceInput = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert('Voice input requires Chrome browser.'); return; }
    const recognition = new SR();
    recognition.lang = 'en-IN';
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = e => {
      const text = e.results[0][0].transcript;
      setInput(text);
      setIsListening(false);
      sendMessage(text);
    };
    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);
    recognitionRef.current = recognition;
    recognition.start();
  };

  const stopSpeaking = () => { window.speechSynthesis?.cancel(); setIsSpeaking(false); };

  return (
    <div style={{ minHeight: '100vh', background: '#0A1628', color: 'white', fontFamily: "'Nunito', sans-serif", display: 'flex', flexDirection: 'column' }}>
      <style>{`
        @keyframes sparkydot { 0%,80%,100%{transform:scale(0.6);opacity:0.4} 40%{transform:scale(1);opacity:1} }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
      `}</style>

      {/* Nav */}
      <nav style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '0 24px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link to="/student" style={{ color: '#00BFFF', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>← Dashboard</Link>
          <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.1)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <SparkyAvatar emote={sparkyEmote} size={36} />
            <div>
              <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: '18px', color: '#00BFFF' }}>Sparky AI</div>
              <div style={{ fontSize: '11px', color: isSpeaking ? '#10B981' : loading ? '#F59E0B' : '#00BFFF', opacity: isSpeaking || loading ? 1 : 0.5 }}>
                {isSpeaking ? '🔊 Speaking...' : loading ? '⏳ Thinking...' : '● Gemini Online'}
              </div>
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          {isSpeaking && (
            <button onClick={stopSpeaking} style={{ padding: '6px 14px', background: 'rgba(239,68,68,0.2)', border: '1px solid rgba(239,68,68,0.4)', borderRadius: '8px', color: '#fca5a5', cursor: 'pointer', fontSize: '13px', fontWeight: 700, fontFamily: "'Nunito', sans-serif" }}>
              🔇 Stop
            </button>
          )}
          <button onClick={() => setMessages([messages[0]])} style={{ padding: '6px 14px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '8px', color: 'rgba(255,255,255,0.6)', cursor: 'pointer', fontSize: '13px', fontWeight: 700, fontFamily: "'Nunito', sans-serif" }}>
            🗑️ Clear
          </button>
        </div>
      </nav>

      {/* Body */}
      <div style={{ flex: 1, display: 'flex', maxWidth: '1100px', width: '100%', margin: '0 auto', padding: '24px', gap: '24px', minHeight: 0 }}>
        {/* Quick Prompts sidebar */}
        <div style={{ width: '220px', flexShrink: 0 }}>
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '16px', position: 'sticky', top: '24px' }}>
            <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: '15px', color: '#00BFFF', marginBottom: '12px' }}>💬 Quick Prompts</div>
            {QUICK_PROMPTS.map((p, i) => (
              <button key={i} onClick={() => sendMessage(p.text)} disabled={loading}
                style={{ width: '100%', textAlign: 'left', padding: '10px 12px', marginBottom: '8px', background: 'rgba(0,191,255,0.06)', border: '1px solid rgba(0,191,255,0.15)', borderRadius: '10px', color: 'rgba(255,255,255,0.75)', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '13px', fontWeight: 600, fontFamily: "'Nunito', sans-serif", transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,191,255,0.15)'; e.currentTarget.style.color = 'white'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,191,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.75)'; }}>
                {p.label}
              </button>
            ))}
            {/* Student context badge */}
            <div style={{ marginTop: '16px', padding: '12px', background: 'rgba(0,191,255,0.06)', borderRadius: '10px', border: '1px solid rgba(0,191,255,0.12)' }}>
              <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.4)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Your Context</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', lineHeight: 1.8 }}>
                📊 Health: {studentData?.academicHealthScore || 52}%<br />
                📅 Attend: {studentData?.attendancePercentage || 68}%<br />
                🏷️ {studentData?.cluster === 'below' ? '🔴 Below Avg' : studentData?.cluster === 'top' ? '🟢 Top' : '🟡 Medium'}
              </div>
            </div>
          </div>
        </div>

        {/* Chat area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px', marginBottom: '20px' }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                <div style={{ flexShrink: 0 }}>
                  {msg.role === 'sparky' ? (
                    <SparkyAvatar emote={i === messages.length - 1 ? sparkyEmote : 'idle'} size={44} />
                  ) : (
                    <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(0,191,255,0.15)', border: '2px solid rgba(0,191,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                      {user?.avatar || '🎓'}
                    </div>
                  )}
                </div>
                <div style={{ maxWidth: '70%' }}>
                  <div style={{
                    padding: '14px 18px',
                    borderRadius: msg.role === 'sparky' ? '18px 18px 18px 4px' : '18px 18px 4px 18px',
                    background: msg.role === 'sparky'
                      ? 'linear-gradient(135deg, rgba(0,191,255,0.12), rgba(0,128,255,0.08))'
                      : 'linear-gradient(135deg, #2563EB, #1d4ed8)',
                    border: msg.role === 'sparky' ? '1px solid rgba(0,191,255,0.25)' : 'none',
                    fontSize: '15px', lineHeight: 1.7, color: 'white',
                    boxShadow: msg.role === 'sparky' ? '0 4px 16px rgba(0,191,255,0.1)' : '0 4px 16px rgba(37,99,235,0.3)',
                    whiteSpace: 'pre-wrap',
                  }}>
                    {msg.text}
                  </div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '4px', textAlign: msg.role === 'user' ? 'right' : 'left', paddingLeft: msg.role === 'sparky' ? '4px' : 0, paddingRight: msg.role === 'user' ? '4px' : 0 }}>
                    {msg.role === 'sparky' ? '🤖 Sparky (Gemini)' : '👤 You'} · {new Date(msg.time).toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            {streaming && (
              <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
                <SparkyAvatar emote="thinking" size={44} />
                <div style={{ maxWidth: '70%' }}>
                  <div style={{
                    padding: '14px 18px', borderRadius: '18px 18px 18px 4px',
                    background: 'linear-gradient(135deg, rgba(0,191,255,0.12), rgba(0,128,255,0.08))',
                    border: '1px solid rgba(0,191,255,0.25)', fontSize: '15px', lineHeight: 1.7,
                    color: 'white', whiteSpace: 'pre-wrap',
                  }}>
                    {streaming}
                    <span style={{ display:'inline-block', width:'8px', height:'14px', background:'#00BFFF', borderRadius:'2px', marginLeft:'3px', animation:'sparkydot 0.8s ease-in-out infinite' }} />
                  </div>
                </div>
              </div>
            )}
            {loading && !streaming && <TypingIndicator />}
            <div ref={messagesEndRef} />

          </div>

          {/* Input area */}
          <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '16px', flexShrink: 0 }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
                placeholder="Type a message or click the mic... (Enter to send)"
                rows={2}
                style={{ flex: 1, resize: 'none', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px', color: 'white', padding: '12px 16px', fontSize: '15px', fontFamily: "'Nunito', sans-serif", outline: 'none', lineHeight: 1.6 }}
              />
              <button onClick={startVoiceInput} disabled={loading}
                style={{ width: '48px', height: '48px', borderRadius: '50%', border: 'none', background: isListening ? '#EF4444' : 'rgba(0,191,255,0.2)', color: '#00BFFF', cursor: 'pointer', fontSize: '20px', transition: 'all 0.2s', flexShrink: 0 }}>
                {isListening ? '⏹' : '🎤'}
              </button>
              <button onClick={() => sendMessage(input)} disabled={loading || !input.trim()}
                style={{ width: '48px', height: '48px', borderRadius: '50%', border: 'none', background: input.trim() && !loading ? 'linear-gradient(135deg,#00BFFF,#0080FF)' : 'rgba(255,255,255,0.1)', color: 'white', cursor: input.trim() && !loading ? 'pointer' : 'default', fontSize: '20px', transition: 'all 0.2s', flexShrink: 0 }}>
                ➤
              </button>
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginTop: '8px', textAlign: 'center' }}>
              Powered by Google Gemini 1.5 Flash · Voice I/O via Web Speech API · EduPulse Hawkathon 2026
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
