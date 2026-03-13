import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';

// ── Animated counter hook
function useCounter(end, duration = 2000, trigger) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!trigger) return;
    let start = 0;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) { setCount(end); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [trigger, end, duration]);
  return count;
}

// ── Particle canvas
function ParticleCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animId;
    const resize = () => { canvas.width = canvas.offsetWidth; canvas.height = canvas.offsetHeight; };
    resize();
    window.addEventListener('resize', resize);

    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2 + 0.5,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      color: `hsl(${Math.random() * 60 + 200}, 90%, 70%)`,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = 0.7;
        ctx.fill();
      });
      // Connect nearby particles
      ctx.globalAlpha = 0.12;
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 100) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = '#00BFFF';
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener('resize', resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }} />;
}

const TYPEWRITER_TEXTS = [
  'Know Every Student.',
  'Prevent Every Dropout.',
  'Guide Every Future.',
  'Empower Every Teacher.',
];

const DASHBOARDS = [
  { icon: '🎓', title: 'College Student', subtitle: 'Sparky AI · Career Navigator · XP System', color: '#3B82F6', path: '/login' },
  { icon: '📚', title: 'School Student', subtitle: 'Gamified Learning · Learning Games · Streaks', color: '#10B981', path: '/login' },
  { icon: '👨‍🏫', title: 'SCM Dashboard', subtitle: 'K-Means Clusters · Attendance · Parent Alerts', color: '#8B5CF6', path: '/login' },
  { icon: '👨', title: 'Parent Portal', subtitle: 'Real-time Alerts · Multilingual · Mobile', color: '#F59E0B', path: '/login' },
  { icon: '👨‍💼', title: 'Admin Analytics', subtitle: 'NEP · SDG · Institution-wide AI Insights', color: '#EF4444', path: '/login' },
];

const STATS = [
  { value: 250, suffix: 'M+', label: 'Students in India' },
  { value: 29, suffix: '%', label: 'College Dropout Rate' },
  { value: 5, suffix: '', label: 'AI-Powered Dashboards' },
  { value: 3, suffix: '', label: 'Gemini Career Paths' },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const [typeIdx, setTypeIdx] = useState(0);
  const [typeText, setTypeText] = useState('');
  const [typing, setTyping] = useState(true);
  const [statsVisible, setStatsVisible] = useState(false);
  const statsRef = useRef(null);

  // 4 individual counter hooks (cannot use hooks inside .map())
  const c0 = useCounter(STATS[0].value, 1800, statsVisible);
  const c1 = useCounter(STATS[1].value, 1800, statsVisible);
  const c2 = useCounter(STATS[2].value, 1800, statsVisible);
  const c3 = useCounter(STATS[3].value, 1800, statsVisible);
  const counters = [c0, c1, c2, c3];


  // Typewriter effect
  useEffect(() => {
    const full = TYPEWRITER_TEXTS[typeIdx];
    let i = typing ? 0 : full.length;
    const timer = setInterval(() => {
      if (typing) {
        i++;
        setTypeText(full.slice(0, i));
        if (i === full.length) { clearInterval(timer); setTimeout(() => setTyping(false), 1400); }
      } else {
        i--;
        setTypeText(full.slice(0, i));
        if (i === 0) { clearInterval(timer); setTypeIdx(prev => (prev + 1) % TYPEWRITER_TEXTS.length); setTyping(true); }
      }
    }, typing ? 55 : 28);
    return () => clearInterval(timer);
  }, [typeIdx, typing]);

  // Stats counter trigger
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setStatsVisible(true); }, { threshold: 0.4 });
    if (statsRef.current) obs.observe(statsRef.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: '#0A1628', color: 'white', fontFamily: "'Nunito', sans-serif", overflowX: 'hidden' }}>
      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
        @keyframes gradientShift { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.5} }
        .lp-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 32px rgba(0,191,255,0.4) !important; }
        .lp-card:hover { transform: translateY(-6px); box-shadow: 0 20px 50px rgba(0,0,0,0.4) !important; }
        .lp-dash:hover { transform: scale(1.03) translateY(-4px); }
      `}</style>

      {/* NAV */}
      <nav style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100, background: 'rgba(10,22,40,0.85)', backdropFilter: 'blur(20px)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '0 40px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: '10px', background: 'linear-gradient(135deg,#3B82F6,#8B5CF6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px' }}>⚡</div>
          <span style={{ fontFamily: "'Fredoka One', cursive", fontSize: '22px', background: 'linear-gradient(135deg,#00BFFF,#8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>EduPulse</span>
          <span style={{ background: 'rgba(139,92,246,0.2)', border: '1px solid rgba(139,92,246,0.4)', borderRadius: '99px', padding: '2px 10px', fontSize: '11px', fontWeight: 700, color: '#A78BFA', marginLeft: '4px' }}>Hawkathon 2026</span>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <Link to="/login" style={{ padding: '8px 20px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.15)', borderRadius: '8px', color: 'rgba(255,255,255,0.85)', textDecoration: 'none', fontSize: '14px', fontWeight: 700, transition: 'all 0.2s' }}>Sign In</Link>
          <Link to="/login" className="lp-btn" style={{ padding: '8px 20px', background: 'linear-gradient(135deg,#3B82F6,#8B5CF6)', border: 'none', borderRadius: '8px', color: 'white', textDecoration: 'none', fontSize: '14px', fontWeight: 700, transition: 'all 0.3s' }}>Get Started →</Link>
        </div>
      </nav>

      {/* HERO */}
      <section style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', position: 'relative', paddingTop: '64px' }}>
        <ParticleCanvas />
        <div style={{ position: 'relative', zIndex: 2, maxWidth: '900px', padding: '0 24px', animation: 'fadeUp 0.8s ease' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: 'rgba(139,92,246,0.15)', border: '1px solid rgba(139,92,246,0.35)', borderRadius: '99px', padding: '8px 20px', marginBottom: '32px', fontSize: '14px', fontWeight: 700, color: '#C4B5FD' }}>
            <span style={{ width: '8px', height: '8px', background: '#10B981', borderRadius: '50%', animation: 'pulse 1.5s infinite' }} />
            AI-Powered Student Intelligence Platform · Hawkathon 2026
          </div>

          <div style={{ fontSize: 'clamp(42px,7vw,84px)', fontFamily: "'Fredoka One', cursive", lineHeight: 1.1, marginBottom: '8px', background: 'linear-gradient(135deg,#FFFFFF,#93C5FD,#C4B5FD)', backgroundSize: '200%', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', animation: 'gradientShift 4s ease infinite' }}>
            EduPulse
          </div>

          <div style={{ minHeight: '72px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '32px' }}>
            <span style={{ fontSize: 'clamp(22px,4vw,40px)', fontWeight: 800, color: '#00BFFF' }}>
              {typeText}<span style={{ animation: 'pulse 0.7s infinite', color: '#00BFFF', opacity: 0.8 }}>|</span>
            </span>
          </div>

          <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.65)', lineHeight: 1.8, maxWidth: '600px', margin: '0 auto 48px' }}>
            India's first multi-stakeholder AI platform combining MongoDB, K-Means ML clustering, Gemini AI career paths, and real-time SMTP parent alerts — built for every student's success.
          </p>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/login')} className="lp-btn"
              style={{ padding: '16px 36px', background: 'linear-gradient(135deg,#3B82F6,#8B5CF6)', border: 'none', borderRadius: '14px', color: 'white', fontWeight: 800, fontSize: '17px', cursor: 'pointer', fontFamily: "'Nunito', sans-serif", transition: 'all 0.3s', boxShadow: '0 4px 24px rgba(59,130,246,0.4)' }}>
              🚀 Try Live Demo
            </button>
            <a href="#features"
              style={{ padding: '16px 36px', background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.18)', borderRadius: '14px', color: 'white', fontWeight: 700, fontSize: '17px', textDecoration: 'none', transition: 'all 0.3s' }}>
              🎯 See Features ↓
            </a>
          </div>

          {/* Floating emojis */}
          {['🎓', '🤖', '📊', '🏆', '💡', '🔥'].map((e, i) => (
            <span key={i} style={{ position: 'absolute', fontSize: '32px', animation: `float ${2.5 + i * 0.4}s ease-in-out infinite`, animationDelay: `${i * 0.5}s`, opacity: 0.5, top: `${20 + i * 12}%`, left: i % 2 === 0 ? `${5 + i * 2}%` : `${88 - i * 2}%`, pointerEvents: 'none' }}>{e}</span>
          ))}
        </div>
      </section>

      {/* STATS */}
      <section ref={statsRef} style={{ padding: '80px 40px', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '24px', textAlign: 'center' }}>
          {STATS.map((s, i) => (
            <div key={i}>
              <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: '56px', background: 'linear-gradient(135deg,#00BFFF,#8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1 }}>
                {counters[i]}{s.suffix}
              </div>
              <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.55)', marginTop: '8px', fontWeight: 600 }}>{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* PROBLEM */}
      <section style={{ padding: '100px 40px', maxWidth: '1100px', margin: '0 auto' }} id="features">
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <div style={{ fontSize: '13px', fontWeight: 800, color: '#EF4444', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '16px' }}>The Crisis</div>
          <h2 style={{ fontFamily: "'Fredoka One', cursive", fontSize: 'clamp(32px,5vw,52px)', margin: '0 0 20px' }}>India's Education System Is Failing Students Silently</h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '17px', maxWidth: '700px', margin: '0 auto', lineHeight: 1.8 }}>
            29% of college students drop out. Parents don't know until it's too late. Teachers can't track 60+ students manually. There's no system — until now.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '20px' }}>
          {[
            { icon: '😰', title: '1 in 3 students drop out', desc: 'Poor grades + attendance go unnoticed until it\'s too late for intervention.', color: '#EF4444' },
            { icon: '👨‍🏫', title: 'Teachers are overwhelmed', desc: '60+ students per teacher. No data tools to identify who needs help first.', color: '#F59E0B' },
            { icon: '👨‍👩‍👧', title: 'Parents are left in the dark', desc: 'No real-time alerts. Parents find out at the report card — 3 months too late.', color: '#8B5CF6' },
          ].map((c, i) => (
            <div key={i} className="lp-card" style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${c.color}30`, borderRadius: '20px', padding: '32px', transition: 'all 0.3s' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>{c.icon}</div>
              <h3 style={{ fontFamily: "'Fredoka One', cursive", fontSize: '20px', color: c.color, margin: '0 0 12px' }}>{c.title}</h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.7, margin: 0, fontSize: '15px' }}>{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SOLUTION — 4 CORE FEATURES */}
      <section style={{ padding: '100px 40px', background: 'rgba(59,130,246,0.04)', borderTop: '1px solid rgba(59,130,246,0.1)' }}>
        <div style={{ maxWidth: '1100px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: '64px' }}>
            <div style={{ fontSize: '13px', fontWeight: 800, color: '#10B981', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '16px' }}>The Solution</div>
            <h2 style={{ fontFamily: "'Fredoka One', cursive", fontSize: 'clamp(32px,5vw,52px)', margin: '0 0 20px' }}>4 Technologies. One Platform.</h2>
            <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '17px', maxWidth: '600px', margin: '0 auto', lineHeight: 1.8 }}>
              Exactly what the hackathon problem statement requires — fully working, live, demo-ready.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: '24px' }}>
            {[
              { num: '01', icon: '🗄️', title: 'MongoDB — Single Source of Truth', desc: '5 student profiles, grades, attendance, moods, alerts — all in Atlas. One database powers every dashboard, every dashboard reflects real data.', color: '#10B981', badge: 'Required ✅' },
              { num: '02', icon: '🤖', title: 'K-Means ML Clustering', desc: 'Pure JavaScript K-Means (no Python needed) runs on all students post-seed. Assigns Top / Medium / Below Average clusters. SCM sees actionable cohorts instantly.', color: '#3B82F6', badge: 'Required ✅' },
              { num: '03', icon: '📧', title: 'SMTP Parent Alerts — Real Gmail', desc: 'SCM clicks "Alert Parent" → Gemini writes a beautiful HTML email → Nodemailer sends via Gmail SMTP. Real email arrives in parent\'s inbox in seconds.', color: '#F59E0B', badge: 'Required ✅' },
              { num: '04', icon: '✨', title: 'Gemini AI — 3 Career Roadmaps', desc: 'Student clicks "Generate" → Gemini 1.5 Flash analyzes grades, department, attendance → generates 3 personalized 24-month career roadmaps with certs and milestones.', color: '#8B5CF6', badge: 'Required ✅' },
            ].map((f, i) => (
              <div key={i} className="lp-card" style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${f.color}30`, borderRadius: '20px', padding: '36px', transition: 'all 0.3s', position: 'relative', overflow: 'hidden' }}>
                <div style={{ position: 'absolute', top: '20px', right: '20px', background: `${f.color}20`, border: `1px solid ${f.color}40`, borderRadius: '99px', padding: '4px 12px', fontSize: '12px', fontWeight: 700, color: f.color }}>{f.badge}</div>
                <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: '64px', color: `${f.color}20`, position: 'absolute', bottom: '16px', right: '16px', lineHeight: 1 }}>{f.num}</div>
                <div style={{ fontSize: '40px', marginBottom: '16px' }}>{f.icon}</div>
                <h3 style={{ fontFamily: "'Fredoka One', cursive", fontSize: '22px', color: f.color, margin: '0 0 14px' }}>{f.title}</h3>
                <p style={{ color: 'rgba(255,255,255,0.65)', lineHeight: 1.8, margin: 0, fontSize: '15px' }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5 DASHBOARDS */}
      <section style={{ padding: '100px 40px', maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '64px' }}>
          <div style={{ fontSize: '13px', fontWeight: 800, color: '#A78BFA', textTransform: 'uppercase', letterSpacing: '3px', marginBottom: '16px' }}>5 Stakeholder Views</div>
          <h2 style={{ fontFamily: "'Fredoka One', cursive", fontSize: 'clamp(28px,4vw,44px)', margin: 0 }}>Every Stakeholder Has a Dashboard</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '16px' }}>
          {DASHBOARDS.map((d, i) => (
            <div key={i} onClick={() => navigate(d.path)} className="lp-dash"
              style={{ background: `${d.color}10`, border: `1px solid ${d.color}30`, borderRadius: '18px', padding: '28px 20px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s' }}>
              <div style={{ fontSize: '40px', marginBottom: '14px', animation: `float ${2.5 + i * 0.3}s ease-in-out infinite` }}>{d.icon}</div>
              <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: '16px', color: d.color, marginBottom: '8px' }}>{d.title}</div>
              <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)', lineHeight: 1.6 }}>{d.subtitle}</div>
            </div>
          ))}
        </div>
      </section>

      {/* NEP + SDG */}
      <section style={{ padding: '80px 40px', background: 'rgba(255,255,255,0.02)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
        <div style={{ maxWidth: '900px', margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: "'Fredoka One', cursive", fontSize: '32px', marginBottom: '16px' }}>Aligned with NEP 2020 & UN SDG 4</h2>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: '15px', marginBottom: '40px', lineHeight: 1.7 }}>
            EduPulse directly implements India's National Education Policy 2020 goals — data-driven teaching, holistic development, and inclusive quality education as per UN Sustainable Development Goal 4.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '12px' }}>
            {['🇮🇳 NEP 2020 Compliant', '🌍 UN SDG Goal 4', '🤖 AI-First Pedagogy', '📊 Data-Driven Teaching', '🌏 Multilingual Support', '♿ Inclusive Education'].map((badge, i) => (
              <span key={i} style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: '99px', padding: '8px 18px', fontSize: '13px', fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>{badge}</span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '100px 40px', textAlign: 'center' }}>
        <div style={{ maxWidth: '700px', margin: '0 auto' }}>
          <div style={{ fontSize: '64px', marginBottom: '24px', animation: 'float 3s ease-in-out infinite' }}>🏆</div>
          <h2 style={{ fontFamily: "'Fredoka One', cursive", fontSize: 'clamp(32px,5vw,52px)', margin: '0 0 20px', background: 'linear-gradient(135deg,#FFD700,#F59E0B)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Ready to Experience EduPulse?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '17px', marginBottom: '48px', lineHeight: 1.8 }}>
            5 live dashboards. Real Gemini AI. Real Gmail emails. Real MongoDB. Built for Hawkathon 2026.
          </p>
          <div style={{ display: 'flex', gap: '16px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { label: '🎓 Student Login', email: 'aarav@demo.com', color: '#3B82F6' },
              { label: '👨‍🏫 SCM Login', email: 'scm@demo.com', color: '#8B5CF6' },
              { label: '👨 Parent Login', email: 'parent.aarav@demo.com', color: '#F59E0B' },
              { label: '👨‍💼 Admin Login', email: 'admin@demo.com', color: '#10B981' },
            ].map((btn, i) => (
              <button key={i} onClick={() => navigate('/login')} className="lp-btn"
                style={{ padding: '14px 28px', background: `${btn.color}20`, border: `1px solid ${btn.color}50`, borderRadius: '12px', color: 'white', fontWeight: 700, fontSize: '14px', cursor: 'pointer', fontFamily: "'Nunito', sans-serif", transition: 'all 0.3s' }}>
                {btn.label}
                <div style={{ fontSize: '11px', color: 'rgba(255,255,255,0.45)', fontWeight: 400, marginTop: '2px' }}>{btn.email} · demo123</div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={{ borderTop: '1px solid rgba(255,255,255,0.07)', padding: '32px 40px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontFamily: "'Fredoka One', cursive", fontSize: '20px', background: 'linear-gradient(135deg,#00BFFF,#8B5CF6)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>EduPulse</span>
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '13px' }}>· Hawkathon 2026</span>
        </div>
        <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'rgba(255,255,255,0.35)' }}>
          <span>MongoDB</span><span>·</span><span>Gemini AI</span><span>·</span><span>K-Means</span><span>·</span><span>Gmail SMTP</span>
        </div>
        <div style={{ fontSize: '13px', color: 'rgba(255,255,255,0.3)' }}>Built with ❤️ for India's students</div>
      </footer>
    </div>
  );
}
