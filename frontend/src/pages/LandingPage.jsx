import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

// ── Animated particle canvas background
function ParticleCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener('resize', resize);
    const particles = Array.from({ length: 80 }, () => ({
      x: Math.random() * canvas.width, y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.5,
      vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
      alpha: Math.random() * 0.4 + 0.1,
      color: Math.random() > 0.5 ? '0,191,255' : '0,255,127'
    }));
    let animId;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color},${p.alpha})`;
        ctx.fill();
      });
      // Draw connecting lines
      particles.forEach((p, i) => particles.slice(i + 1).forEach(q => {
        const d = Math.hypot(p.x - q.x, p.y - q.y);
        if (d < 120) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y); ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(0,191,255,${0.08 * (1 - d / 120)})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }));
      animId = requestAnimationFrame(animate);
    };
    animate();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'fixed', top: 0, left: 0, pointerEvents: 'none', zIndex: 0 }} />;
}

// ── Animated counter
function AnimatedCounter({ target, suffix = '', duration = 2000 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        let start = 0;
        const step = target / (duration / 16);
        const timer = setInterval(() => {
          start += step;
          if (start >= target) { setCount(target); clearInterval(timer); }
          else setCount(Math.floor(start));
        }, 16);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target, duration]);
  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// ── Typewriter effect
function Typewriter({ words, speed = 80, pause = 2000 }) {
  const [text, setText] = useState('');
  const [wordIdx, setWordIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);
  useEffect(() => {
    const current = words[wordIdx];
    const timeout = setTimeout(() => {
      if (!deleting) {
        setText(current.slice(0, charIdx + 1));
        if (charIdx + 1 === current.length) setTimeout(() => setDeleting(true), pause);
        else setCharIdx(c => c + 1);
      } else {
        setText(current.slice(0, charIdx - 1));
        if (charIdx - 1 === 0) { setDeleting(false); setWordIdx(i => (i + 1) % words.length); setCharIdx(0); }
        else setCharIdx(c => c - 1);
      }
    }, deleting ? speed / 2 : speed);
    return () => clearTimeout(timeout);
  }, [text, charIdx, deleting, wordIdx, words, speed, pause]);
  return <span>{text}<span style={{ animation: 'blink 1s step-end infinite' }}>|</span></span>;
}

const STATS = [
  { value: 250, suffix: 'M+', label: 'School Students in India', icon: '🎓' },
  { value: 29, suffix: '%', label: 'College Dropout Rate', icon: '📉' },
  { value: 5, suffix: '', label: 'AI-Powered Dashboards', icon: '🤖' },
  { value: 4, suffix: '', label: 'UN SDGs Addressed', icon: '🌍' }
];

const PROBLEMS = [
  { icon: '😰', title: 'Silent Failure', desc: 'Students fail across entire semesters with zero early detection until report cards reveal catastrophe.' },
  { icon: '📭', title: 'Parents Fly Blind', desc: 'Parents only discover issues at report cards — weeks or months after early warning signs appeared.' },
  { icon: '📊', title: 'Spreadsheet SCMs', desc: 'Student Counselors manage 200+ students manually with zero predictive power or intervention tools.' },
  { icon: '📋', title: 'Generic Guidance', desc: 'One career brochure for everyone. Advice that ignores individual strengths, grades, and interests.' },
  { icon: '🔀', title: 'Siloed Data', desc: 'Academic data lives in isolated systems. Nobody connects grades + attendance + mood into insights.' }
];

const FEATURES = [
  { icon: '🧬', title: 'Academic DNA Profile', desc: 'Multi-dimensional analysis mapping each student\'s unique learning fingerprint — far beyond raw marks.', color: '#38bdf8' },
  { icon: '🤖', title: 'K-Means Clustering', desc: 'ML algorithm auto-segments students into Top / Medium / Below clusters every week — no manual sorting.', color: '#a78bfa' },
  { icon: '⚡', title: 'SCM Voice Dashboard', desc: 'Speak to get insights: "Show critical students" — AI executes instantly, hands-free command center.', color: '#fbbf24' },
  { icon: '📧', title: 'Real Parent Alerts', desc: 'Personalized email sent directly to parent\'s inbox when student needs attention — triggered in 1 click.', color: '#f87171' },
  { icon: '🎯', title: 'Career Roadmaps', desc: '3 personalized 24-month career paths with probability scores, generated directly from the student\'s grades.', color: '#34d399' },
  { icon: '🏆', title: 'Gamified Learning', desc: 'XP, badges, streaks, and levels turn academic monitoring into motivation — students want to improve.', color: '#fb923c' }
];

const DASHBOARDS = [
  { type: 'college_student', label: 'College Student', icon: '🎓', desc: 'Gamified academic dashboard', color: '#38bdf8', gradient: 'from #0ea5e9 to #3b82f6' },
  { type: 'scm', label: 'SCM Command', icon: '🎙️', desc: 'Voice-powered control center', color: '#a78bfa', gradient: 'from #8b5cf6 to #6d28d9' },
  { type: 'parent', label: 'Parent Portal', icon: '👨‍👧', desc: 'Warm, simple student updates', color: '#fb923c', gradient: 'from #f97316 to #ea580c' },
  { type: 'school_student', label: 'School Portal', icon: '🏫', desc: 'Class 3–12 experience', color: '#34d399', gradient: 'from #10b981 to #059669' },
  { type: 'admin', label: 'Admin Analytics', icon: '📊', desc: 'Department-level AI insights', color: '#c084fc', gradient: 'from #a855f7 to #7c3aed' }
];

const globalCSS = `
  @import url('https://fonts.googleapis.com/css2?family=Fredoka+One&family=Plus+Jakarta+Sans:wght@400;500;600;700;800;900&family=Space+Mono:wght@700&display=swap');
  @keyframes fadeInUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes float { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-12px); } }
  @keyframes blink { 0%,100% { opacity: 1; } 50% { opacity: 0; } }
  @keyframes gradientShift { 0% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } 100% { background-position: 0% 50%; } }
  @keyframes pulse-glow { 0%,100% { box-shadow: 0 0 20px rgba(0,191,255,0.3); } 50% { box-shadow: 0 0 40px rgba(0,191,255,0.7); } }
  @keyframes scanline { 0% { top: -100%; } 100% { top: 100%; } }
  .hero-btn-primary { background: linear-gradient(135deg, #00BFFF, #0080FF); transition: all 0.3s ease; }
  .hero-btn-primary:hover { transform: translateY(-3px); box-shadow: 0 10px 40px rgba(0,191,255,0.5) !important; }
  .hero-btn-secondary:hover { background: rgba(255,255,255,0.12) !important; transform: translateY(-3px); }
  .dashboard-card:hover { transform: translateY(-8px) !important; }
  .feature-card:hover { transform: translateY(-6px) !important; border-color: rgba(0,191,255,0.4) !important; background: rgba(255,255,255,0.07) !important; }
  .problem-card:hover { transform: translateY(-6px) !important; border-color: rgba(239,68,68,0.5) !important; background: rgba(239,68,68,0.08) !important; }
`;

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const styleEl = document.createElement('style');
    styleEl.innerText = globalCSS;
    document.head.appendChild(styleEl);
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => { window.removeEventListener('scroll', onScroll); document.head.removeChild(styleEl); };
  }, []);

  return (
    <div style={{ background: '#020617', color: 'white', minHeight: '100vh', fontFamily: "'Plus Jakarta Sans', sans-serif", overflowX: 'hidden' }}>
      <ParticleCanvas />

      {/* ── NAVBAR ─────────────────────────────────────── */}
      <nav style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
        padding: '16px 5%',
        background: scrolled ? 'rgba(2,6,23,0.95)' : 'transparent',
        backdropFilter: scrolled ? 'blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(0,191,255,0.12)' : 'none',
        transition: 'all 0.4s ease',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '36px', height: '36px', background: 'linear-gradient(135deg, #00BFFF, #0080FF)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', boxShadow: '0 0 20px rgba(0,191,255,0.4)', animation: 'pulse-glow 3s ease-in-out infinite' }}>🎓</div>
          <div>
            <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: '22px', color: '#00BFFF', lineHeight: 1 }}>EduPulse</div>
            <div style={{ fontSize: '9px', color: 'rgba(255,255,255,0.4)', letterSpacing: '2px', textTransform: 'uppercase' }}>HAWKATHON 2026</div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          {[['#features', 'Features'], ['#how-it-works', 'Pipeline'], ['#sdg', 'NEP & SDG']].map(([href, label]) => (
            <a key={href} href={href} style={{ color: 'rgba(255,255,255,0.65)', textDecoration: 'none', padding: '8px 14px', fontSize: '13px', fontWeight: 600, borderRadius: '8px', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.65)'; e.currentTarget.style.background = 'transparent'; }}>{label}</a>
          ))}
          <Link to="/login" style={{ marginLeft: '8px', padding: '9px 20px', background: 'rgba(0,191,255,0.15)', border: '1px solid rgba(0,191,255,0.4)', borderRadius: '10px', color: '#00BFFF', fontWeight: 700, fontSize: '13px', textDecoration: 'none', transition: 'all 0.2s' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,191,255,0.25)'}
            onMouseLeave={e => e.currentTarget.style.background = 'rgba(0,191,255,0.15)'}>
            Sign In →
          </Link>
        </div>
      </nav>

      {/* ── HERO ──────────────────────────────────────── */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '120px 5% 80px', position: 'relative', zIndex: 1 }}>
        {/* Glow orbs */}
        <div style={{ position: 'absolute', top: '20%', left: '15%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(0,191,255,0.08), transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', bottom: '20%', right: '10%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(0,255,127,0.06), transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }} />

        <div style={{ maxWidth: '960px', animation: 'fadeInUp 0.8s ease both' }}>
          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'linear-gradient(135deg, rgba(0,191,255,0.15), rgba(0,128,255,0.1))', border: '1px solid rgba(0,191,255,0.35)', borderRadius: '99px', padding: '7px 18px', marginBottom: '32px', fontSize: '13px', fontWeight: 700, color: '#00BFFF' }}>
            🏆 Hawkathon 2026 · AI for Education · India-First
          </div>

          {/* Main headline */}
          <h1 style={{ fontFamily: "'Fredoka One', cursive", fontSize: 'clamp(44px, 8vw, 88px)', lineHeight: 1.05, margin: '0 0 12px', letterSpacing: '-1px' }}>
            Know Every Student.
          </h1>
          <h1 style={{ fontFamily: "'Fredoka One', cursive", fontSize: 'clamp(44px, 8vw, 88px)', lineHeight: 1.05, margin: '0 0 32px', background: 'linear-gradient(135deg, #00BFFF 0%, #00FF7F 60%, #38bdf8 100%)', backgroundSize: '200% 200%', animation: 'gradientShift 4s ease infinite', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Guide Every Future.
          </h1>

          {/* Typewriter */}
          <div style={{ fontSize: 'clamp(16px, 2.5vw, 22px)', color: 'rgba(255,255,255,0.55)', fontWeight: 400, marginBottom: '16px', minHeight: '36px', fontFamily: "'Space Mono', monospace" }}>
            <Typewriter words={['AI-powered dropout prevention.', 'Real-time parent alerts via Gmail.', 'K-Means student clustering.', 'Voice-controlled SCM dashboard.', 'Career roadmaps from actual grades.']} speed={60} pause={2200} />
          </div>

          <p style={{ fontSize: '17px', color: 'rgba(255,255,255,0.6)', maxWidth: '640px', margin: '0 auto 48px', lineHeight: 1.8 }}>
            Solving India's 29% college dropout rate with AI monitoring — aligned with <strong style={{ color: '#00BFFF' }}>NEP 2020</strong> and <strong style={{ color: '#00FF7F' }}>UN SDG 4</strong>.
          </p>

          {/* CTA buttons */}
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '64px' }}>
            <Link to="/login" className="hero-btn-primary" style={{ padding: '16px 36px', borderRadius: '14px', color: 'white', fontWeight: 800, fontSize: '16px', textDecoration: 'none', boxShadow: '0 0 30px rgba(0,191,255,0.35)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              🚀 Try All 5 Dashboards
            </Link>
            <a href="#features" className="hero-btn-secondary" style={{ padding: '16px 36px', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '14px', color: 'white', fontWeight: 700, fontSize: '16px', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '8px', transition: 'all 0.3s ease' }}>
              📖 See How It Works
            </a>
          </div>

          {/* Floating avatars */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
            {['🧑‍💻', '👩‍🔬', '🤖', '🧑‍🔧', '👩‍💼', '👨‍🏫', '👨‍👧'].map((emoji, i) => (
              <div key={i} style={{
                width: '52px', height: '52px', borderRadius: '50%',
                background: 'rgba(255,255,255,0.05)',
                border: '1.5px solid rgba(0,191,255,0.25)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '22px', animation: `float ${2.5 + i * 0.4}s ease-in-out infinite`,
                animationDelay: `${i * 0.15}s`, backdropFilter: 'blur(4px)'
              }}>{emoji}</div>
            ))}
          </div>
        </div>
      </section>

      {/* ── ANIMATED STATS BAR ─────────────────────────── */}
      <section style={{ background: 'linear-gradient(135deg, rgba(0,191,255,0.07), rgba(0,128,255,0.04))', borderTop: '1px solid rgba(0,191,255,0.15)', borderBottom: '1px solid rgba(0,191,255,0.1)', padding: '48px 5%', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', textAlign: 'center' }}>
          {STATS.map((s, i) => (
            <div key={i} style={{ padding: '8px' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>{s.icon}</div>
              <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 'clamp(36px, 5vw, 52px)', color: '#00BFFF', lineHeight: 1, textShadow: '0 0 30px rgba(0,191,255,0.4)' }}>
                <AnimatedCounter target={s.value} suffix={s.suffix} />
              </div>
              <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: '14px', marginTop: '8px', fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PROBLEM SECTION ──────────────────────────── */}
      <section id="problems" style={{ padding: '100px 5%', maxWidth: '1200px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <div style={{ display: 'inline-block', background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '99px', padding: '6px 18px', color: '#f87171', fontWeight: 700, fontSize: '12px', letterSpacing: '2px', marginBottom: '16px' }}>⚠️ THE PROBLEM TODAY</div>
          <h2 style={{ fontFamily: "'Fredoka One', cursive", fontSize: 'clamp(32px, 5vw, 52px)', margin: '0 0 16px' }}>Five Critical Failures in<br />Indian Education</h2>
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '17px', maxWidth: '500px', margin: '0 auto' }}>These aren't hypothetical. They affect millions of students right now.</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(210px, 1fr))', gap: '20px' }}>
          {PROBLEMS.map((p, i) => (
            <div key={i} className="problem-card" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '18px', padding: '28px', transition: 'all 0.35s ease', cursor: 'default' }}>
              <div style={{ fontSize: '40px', marginBottom: '16px' }}>{p.icon}</div>
              <h3 style={{ fontFamily: "'Fredoka One', cursive", fontSize: '20px', margin: '0 0 10px', color: '#fca5a5' }}>{p.title}</h3>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '14px', lineHeight: 1.7, margin: 0 }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SOLUTION / FEATURES ──────────────────────── */}
      <section id="features" style={{ padding: '100px 5%', background: 'rgba(0,191,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.04)', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <div style={{ display: 'inline-block', background: 'rgba(0,191,255,0.12)', border: '1px solid rgba(0,191,255,0.3)', borderRadius: '99px', padding: '6px 18px', color: '#00BFFF', fontWeight: 700, fontSize: '12px', letterSpacing: '2px', marginBottom: '16px' }}>✅ THE EDUPULSE SOLUTION</div>
            <h2 style={{ fontFamily: "'Fredoka One', cursive", fontSize: 'clamp(32px, 5vw, 52px)', margin: '0 0 16px' }}>Everything Judges Asked For,<br /><span style={{ color: '#00BFFF' }}>and Then Some</span></h2>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '17px', maxWidth: '500px', margin: '0 auto' }}>6 core AI features working together as one platform.</p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '20px' }}>
            {FEATURES.map((f, i) => (
              <div key={i} className="feature-card" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '20px', padding: '28px', display: 'flex', gap: '20px', alignItems: 'flex-start', transition: 'all 0.35s ease' }}>
                <div style={{ width: '56px', height: '56px', borderRadius: '14px', background: `${f.color}18`, border: `1.5px solid ${f.color}35`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', flexShrink: 0 }}>{f.icon}</div>
                <div>
                  <h3 style={{ fontFamily: "'Fredoka One', cursive", fontSize: '19px', margin: '0 0 8px', color: f.color }}>{f.title}</h3>
                  <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '14px', lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────── */}
      <section id="how-it-works" style={{ padding: '100px 5%', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-block', background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.3)', borderRadius: '99px', padding: '6px 18px', color: '#a78bfa', fontWeight: 700, fontSize: '12px', letterSpacing: '2px', marginBottom: '16px' }}>⚙️ THE PIPELINE</div>
          <h2 style={{ fontFamily: "'Fredoka One', cursive", fontSize: 'clamp(32px, 5vw, 52px)', margin: '0 0 64px' }}>5-Step Intelligent Flow</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0', position: 'relative' }}>
            {/* Connecting line */}
            <div style={{ position: 'absolute', top: '35px', left: '10%', right: '10%', height: '2px', background: 'linear-gradient(90deg, rgba(0,191,255,0.1), rgba(0,191,255,0.6), rgba(0,191,255,0.1))', zIndex: 0 }} />
            {[
              { step: '01', icon: '🗄️', title: 'Data Centralized', desc: 'Grades, attendance, and mood stream into MongoDB Atlas in real time.' },
              { step: '02', icon: '🤖', title: 'K-Means Clustering', desc: 'Python ML microservice sorts students into performance clusters weekly.' },
              { step: '03', icon: '📧', title: 'Smart Alerts', desc: 'At-risk signals trigger real Gmail emails to parents — one-click delivery.' },
              { step: '04', icon: '🎙️', title: 'SCM Command', desc: 'Voice-powered dashboard gives SCMs instant insights and intervention tools.' },
              { step: '05', icon: '🚀', title: 'Career AI', desc: 'Gemini generates 3 personalised career paths with probability from real grades.' }
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center', padding: '0 12px', position: 'relative', zIndex: 1 }}>
                <div style={{ width: '70px', height: '70px', borderRadius: '50%', margin: '0 auto 20px', background: 'radial-gradient(circle, rgba(0,191,255,0.2), rgba(2,6,23,1) 70%)', border: '2px solid rgba(0,191,255,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', position: 'relative', boxShadow: '0 0 20px rgba(0,191,255,0.15)' }}>
                  {s.icon}
                  <span style={{ position: 'absolute', top: '-10px', right: '-10px', background: 'linear-gradient(135deg, #00BFFF, #0080FF)', color: '#020617', borderRadius: '99px', width: '24px', height: '24px', fontSize: '10px', fontWeight: 800, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{s.step}</span>
                </div>
                <h3 style={{ fontFamily: "'Fredoka One', cursive", fontSize: '16px', marginBottom: '8px', color: '#00BFFF' }}>{s.title}</h3>
                <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '13px', lineHeight: 1.7, margin: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NEP + SDG ─────────────────────────────────── */}
      <section id="sdg" style={{ padding: '100px 5%', background: 'linear-gradient(135deg, rgba(16,185,129,0.04), rgba(0,191,255,0.03))', borderTop: '1px solid rgba(16,185,129,0.12)', position: 'relative', zIndex: 1 }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
          <div style={{ display: 'inline-block', background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '99px', padding: '6px 18px', color: '#34d399', fontWeight: 700, fontSize: '12px', letterSpacing: '2px', marginBottom: '16px' }}>🌍 INDIA'S FUTURE</div>
          <h2 style={{ fontFamily: "'Fredoka One', cursive", fontSize: 'clamp(32px, 5vw, 52px)', margin: '0 0 16px' }}>NEP 2020 + UN Sustainable<br />Development Goals</h2>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '17px', maxWidth: '620px', margin: '0 auto 48px', lineHeight: 1.7 }}>
            The problem statement addresses college dropout. We solve it at two levels — college <strong style={{ color: 'white' }}>and</strong> school — because 67% of college dropouts showed warning signs in Class 8.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '48px' }}>
            {[
              { num: 4, title: 'Quality Education', icon: '📚', color: '#E5243B' },
              { num: 3, title: 'Good Health', icon: '💚', color: '#4C9F38' },
              { num: 10, title: 'Reduced Inequalities', icon: '⚖️', color: '#DD1367' },
              { num: 17, title: 'Partnerships', icon: '🤝', color: '#19486A' }
            ].map((sdg, i) => (
              <div key={i} style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${sdg.color}50`, borderRadius: '18px', padding: '24px 28px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', minWidth: '150px', transition: 'all 0.3s ease' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = `0 12px 40px ${sdg.color}30`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
                <div style={{ fontSize: '36px' }}>{sdg.icon}</div>
                <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: '24px', color: sdg.color }}>SDG {sdg.num}</div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)', fontWeight: 600, textAlign: 'center' }}>{sdg.title}</div>
                <div style={{ color: '#34d399', fontSize: '16px', fontWeight: 700 }}>✅ Implemented</div>
              </div>
            ))}
          </div>
          <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: '20px', padding: '36px', border: '1px solid rgba(16,185,129,0.2)', textAlign: 'left' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ fontSize: '32px', flexShrink: 0 }}>💡</div>
              <p style={{ fontSize: '17px', lineHeight: 1.8, margin: 0, color: 'rgba(255,255,255,0.82)', fontStyle: 'italic' }}>
                "We went beyond the problem statement. A college dropout monitor was required — we built that <em>and</em> extended it to Classes 3–12 because <strong style={{ color: '#34d399' }}>catching at-risk students in school prevents college dropout 4 years later</strong>. That's not just solving the problem. That's solving the root cause."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── DASHBOARD LAUNCHER ───────────────────────── */}
      <section style={{ padding: '100px 5%', maxWidth: '1200px', margin: '0 auto', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div style={{ display: 'inline-block', background: 'rgba(251,191,36,0.12)', border: '1px solid rgba(251,191,36,0.3)', borderRadius: '99px', padding: '6px 18px', color: '#fbbf24', fontWeight: 700, fontSize: '12px', letterSpacing: '2px', marginBottom: '16px' }}>🎯 LIVE DEMO</div>
        <h2 style={{ fontFamily: "'Fredoka One', cursive", fontSize: 'clamp(32px, 5vw, 52px)', margin: '0 0 16px' }}>5 Dashboards. 1 Platform.</h2>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '17px', marginBottom: '48px' }}>Click any card to jump directly into that dashboard with pre-loaded demo data.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          {DASHBOARDS.map((d, i) => (
            <Link key={i} to={`/login?type=${d.type}`} style={{ textDecoration: 'none' }}>
              <div className="dashboard-card" style={{ background: 'rgba(255,255,255,0.04)', border: `1.5px solid ${d.color}25`, borderRadius: '20px', padding: '32px 20px', transition: 'all 0.35s ease', cursor: 'pointer' }}>
                <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: `${d.color}18`, border: `1.5px solid ${d.color}40`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', margin: '0 auto 16px', boxShadow: `0 8px 24px ${d.color}20` }}>{d.icon}</div>
                <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: '17px', color: d.color, marginBottom: '6px' }}>{d.label}</div>
                <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: '13px', marginBottom: '16px' }}>{d.desc}</div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: d.color, opacity: 0.8 }}>Launch Demo →</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────── */}
      <footer style={{ background: 'rgba(0,0,0,0.4)', borderTop: '1px solid rgba(255,255,255,0.06)', padding: '48px 5% 32px', textAlign: 'center', position: 'relative', zIndex: 1 }}>
        <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
          <div style={{ width: '32px', height: '32px', background: 'linear-gradient(135deg, #00BFFF, #0080FF)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px' }}>🎓</div>
          <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: '22px', color: '#00BFFF' }}>EduPulse</div>
        </div>
        <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '14px', maxWidth: '500px', margin: '0 auto 24px', lineHeight: 1.7 }}>
          Know Every Student. Guide Every Future.<br />Built with ❤️ for Hawkathon 2026.
        </p>
        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap', marginBottom: '24px' }}>
          {['NEP 2020 Aligned ✅', 'SDG 4 Contributor 🌍', 'Real Gmail Alerts 📧', 'MongoDB Atlas 🗄️', 'Gemini AI 🤖'].map((b, i) => (
            <span key={i} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '99px', padding: '5px 16px', fontSize: '12px', color: 'rgba(255,255,255,0.55)', fontWeight: 600 }}>{b}</span>
          ))}
        </div>
        <p style={{ color: 'rgba(255,255,255,0.25)', fontSize: '12px' }}>Backend: Node.js + Express + MongoDB Atlas · Frontend: React + Vite · AI: Google Gemini</p>
      </footer>
    </div>
  );
}
