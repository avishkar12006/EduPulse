import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import API from '../../utils/api';

const QUICK_PROMPTS = [
  { label: 'Help with grades 📊', text: 'Can you help me understand my grade performance?' },
  { label: 'Career paths 🎯', text: 'Tell me about career paths suited for me.' },
  { label: "I'm stressed 😔", text: "I'm feeling really stressed about my exams." },
  { label: 'Motivate me! 💪', text: 'I need some motivation to keep studying!' },
  { label: 'Study plan 📖', text: 'What should I focus on studying today?' },
  { label: 'Explain concept 📚', text: 'Can you explain a difficult concept in a simple way?' }
];

const SPARKY_EMOTES = {
  idle:     '🤖',
  thinking: '🤔',
  happy:    '😄',
  excited:  '🤩',
  caring:   '🥰',
};

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
      animation: emote === 'thinking' ? 'none' : 'float 3s ease-in-out infinite'
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
            animation: 'bounce-emoji 0.6s ease infinite',
            animationDelay: `${i * 0.15}s`
          }} />
        ))}
      </div>
    </div>
  );
}

export default function SparkyChatPage() {
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      role: 'sparky',
      text: `Hey ${user?.name?.split(' ')[0] || 'there'}! 🤖✨ I'm Sparky, your AI academic buddy! I'm here to help with your grades, career paths, study plans, or just to cheer you on. What's on your mind today?`,
      time: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sparkyEmote, setSparkyEmote] = useState('idle');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const messagesEndRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (text) => {
    if (!text.trim() || loading) return;
    const userMsg = { role: 'user', text: text.trim(), time: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);
    setSparkyEmote('thinking');

    // Detect mood from keywords
    const stressed = /stress|anxious|worried|scared|fail|cry|sad|depressed/i.test(text);

    try {
      const { data } = await API.post('/api/ai/chat', {
        message: text,
        studentId: user?.studentId,
        chatHistory: messages.slice(-4).map(m => ({ role: m.role, text: m.text }))
      });

      const responseText = data.response;
      setSparkyEmote(stressed ? 'caring' : 'happy');
      setMessages(prev => [...prev, { role: 'sparky', text: responseText, time: new Date() }]);

      // Speak response
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(responseText.replace(/[🤖😊💪🎯📊🔥⚡🌟]/g, ''));
        utter.rate = 0.95; utter.pitch = 1.1; utter.volume = 0.8;
        utter.onstart = () => setIsSpeaking(true);
        utter.onend = () => { setIsSpeaking(false); setSparkyEmote('idle'); };
        window.speechSynthesis.speak(utter);
      } else {
        setTimeout(() => setSparkyEmote('idle'), 2000);
      }
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'sparky',
        text: "Oops! My brain glitched for a sec 😅 Once the Gemini API is connected, I'll be at full power! For now — you're doing amazing, and I believe in you! 💪",
        time: new Date()
      }]);
      setSparkyEmote('idle');
    } finally {
      setLoading(false);
    }
  };

  const startVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      alert('Voice input not supported in this browser. Try Chrome!');
      return;
    }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SR();
    recognition.lang = 'en-IN';
    recognition.onstart = () => setIsListening(true);
    recognition.onresult = (e) => {
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

  const stopSpeaking = () => {
    window.speechSynthesis?.cancel();
    setIsSpeaking(false);
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0A1628', color: 'white', fontFamily: "'Nunito', sans-serif", display: 'flex', flexDirection: 'column' }}>
      {/* Nav */}
      <nav style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '0 24px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link to="/student" style={{ color: '#00BFFF', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>← Dashboard</Link>
          <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.1)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <SparkyAvatar emote={sparkyEmote} size={36} />
            <div>
              <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: '18px', color: '#00BFFF' }}>Sparky AI</div>
              <div style={{ fontSize: '11px', color: isSpeaking ? '#10B981' : loading ? '#F59E0B' : 'rgba(255,255,255,0.4)' }}>
                {isSpeaking ? '🔊 Speaking...' : loading ? '⏳ Thinking...' : '● Online'}
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

      <div style={{ flex: 1, display: 'flex', maxWidth: '1100px', width: '100%', margin: '0 auto', padding: '24px', gap: '24px' }}>
        {/* Quick Prompts sidebar */}
        <div style={{ width: '220px', flexShrink: 0 }}>
          <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '16px', position: 'sticky', top: '24px' }}>
            <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: '15px', color: '#00BFFF', marginBottom: '12px' }}>💬 Quick Prompts</div>
            {QUICK_PROMPTS.map((p, i) => (
              <button key={i} onClick={() => sendMessage(p.text)}
                style={{ width: '100%', textAlign: 'left', padding: '10px 12px', marginBottom: '8px', background: 'rgba(0,191,255,0.06)', border: '1px solid rgba(0,191,255,0.15)', borderRadius: '10px', color: 'rgba(255,255,255,0.75)', cursor: 'pointer', fontSize: '13px', fontWeight: 600, fontFamily: "'Nunito', sans-serif", transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(0,191,255,0.15)'; e.currentTarget.style.color = 'white'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(0,191,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.75)'; }}>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* Chat area */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          {/* Messages */}
          <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px', marginBottom: '20px', minHeight: '400px', maxHeight: 'calc(100vh - 280px)' }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
                {/* Avatar */}
                <div style={{ flexShrink: 0 }}>
                  {msg.role === 'sparky' ? (
                    <SparkyAvatar emote={i === messages.length - 1 ? sparkyEmote : 'idle'} size={44} />
                  ) : (
                    <div style={{ width: '44px', height: '44px', borderRadius: '50%', background: 'rgba(0,191,255,0.15)', border: '2px solid rgba(0,191,255,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>
                      {user?.avatar || '🎓'}
                    </div>
                  )}
                </div>
                {/* Bubble — comic panel style */}
                <div style={{ maxWidth: '70%' }}>
                  <div style={{
                    padding: '14px 18px',
                    borderRadius: msg.role === 'sparky' ? '18px 18px 18px 4px' : '18px 18px 4px 18px',
                    background: msg.role === 'sparky'
                      ? 'linear-gradient(135deg, rgba(0,191,255,0.12), rgba(0,128,255,0.08))'
                      : 'linear-gradient(135deg, #2563EB, #1d4ed8)',
                    border: msg.role === 'sparky' ? '1px solid rgba(0,191,255,0.25)' : 'none',
                    fontSize: '15px', lineHeight: 1.7, color: 'white',
                    boxShadow: msg.role === 'sparky' ? '0 4px 16px rgba(0,191,255,0.1)' : '0 4px 16px rgba(37,99,235,0.3)'
                  }}>
                    {msg.text}
                  </div>
                  <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.3)', marginTop: '4px', textAlign: msg.role === 'user' ? 'right' : 'left', paddingLeft: msg.role === 'sparky' ? '4px' : 0, paddingRight: msg.role === 'user' ? '4px' : 0 }}>
                    {msg.role === 'sparky' ? '🤖 Sparky' : '👤 You'} · {msg.time.toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            {loading && <TypingIndicator />}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '16px', padding: '16px' }}>
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-end' }}>
              <textarea
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
                placeholder="Type a message or click the mic... (Enter to send)"
                rows={2}
                style={{
                  flex: 1, resize: 'none', background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.12)', borderRadius: '12px',
                  color: 'white', padding: '12px 16px', fontSize: '15px',
                  fontFamily: "'Nunito', sans-serif", outline: 'none',
                  lineHeight: 1.6
                }}
              />
              {/* Voice button */}
              <button onClick={startVoiceInput} disabled={loading}
                style={{
                  width: '48px', height: '48px', borderRadius: '50%', border: 'none',
                  background: isListening ? '#EF4444' : 'rgba(0,191,255,0.2)',
                  color: '#00BFFF', cursor: 'pointer', fontSize: '20px',
                  transition: 'all 0.2s', animation: isListening ? 'pulse-badge 1s infinite' : 'none',
                  flexShrink: 0
                }}>
                {isListening ? '⏹' : '🎤'}
              </button>
              {/* Send button */}
              <button onClick={() => sendMessage(input)} disabled={loading || !input.trim()}
                style={{
                  width: '48px', height: '48px', borderRadius: '50%', border: 'none',
                  background: input.trim() ? 'linear-gradient(135deg,#00BFFF,#0080FF)' : 'rgba(255,255,255,0.1)',
                  color: 'white', cursor: input.trim() ? 'pointer' : 'default',
                  fontSize: '20px', transition: 'all 0.2s', flexShrink: 0
                }}>
                ➤
              </button>
            </div>
            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.3)', marginTop: '8px', textAlign: 'center' }}>
              Powered by Google Gemini 1.5 Flash · Voice I/O via Web Speech API
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
