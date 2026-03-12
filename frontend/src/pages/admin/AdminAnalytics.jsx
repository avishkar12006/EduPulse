import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Filler,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';

ChartJS.register(
  ArcElement, Tooltip, Legend,
  CategoryScale, LinearScale, BarElement,
  PointElement, LineElement, Filler
);

const SDG_BADGES = [
  { num: '4',  label: 'Quality Education',      color: '#C5192D', emoji: '📚' },
  { num: '10', label: 'Reduced Inequalities',   color: '#DD1367', emoji: '⚖️' },
  { num: '8',  label: 'Decent Work & Growth',   color: '#A21942', emoji: '💼' },
  { num: '17', label: 'Partnerships',           color: '#19486A', emoji: '🤝' },
];

const NEP_PILLARS = [
  { label: 'Multidisciplinary',  pct: 78, color: '#38bdf8' },
  { label: 'Foundational Lit',   pct: 65, color: '#a78bfa' },
  { label: 'Digital Inclusion',  pct: 89, color: '#34d399' },
  { label: 'Vocational Ed',      pct: 54, color: '#fb923c' },
];

const DEPT_DATA = [
  { dept: 'Engineering',   students: 3420, health: 72, alerts: 38, color: '#38bdf8' },
  { dept: 'Arts & Science',students: 2810, health: 65, alerts: 51, color: '#a78bfa' },
  { dept: 'Commerce',      students: 2150, health: 69, alerts: 29, color: '#34d399' },
  { dept: 'Law',           students: 890,  health: 81, alerts: 12, color: '#fb923c' },
  { dept: 'Management',    students: 1180, health: 76, alerts: 12, color: '#f472b6' },
];

const card = {
  background: '#0f172a',
  border: '1px solid rgba(255,255,255,0.07)',
  borderRadius: '16px',
  padding: '24px',
};

export default function AdminAnalytics() {
  const { logout } = useAuth();
  const [loading, setLoading] = useState(true);

  const stats = {
    totalStudents: 12450,
    platformUsage: 89,
    avgHealthScore: 68,
    activeAlerts: 142,
    totalSCMs: 45,
    clusters: { top: 4150, medium: 5800, below: 2500 },
    attendance: [92, 88, 85, 91, 89, 93],
    monthlyAlerts: [210, 185, 230, 190, 142, 160],
  };

  useEffect(() => {
    setTimeout(() => setLoading(false), 600);
  }, []);

  const clusterData = {
    labels: ['Top Performers', 'Developing', 'At-Risk'],
    datasets: [{
      data: [stats.clusters.top, stats.clusters.medium, stats.clusters.below],
      backgroundColor: ['#10b981', '#38bdf8', '#f43f5e'],
      borderWidth: 0,
      hoverOffset: 8,
    }],
  };

  const clusterOptions = {
    cutout: '68%',
    plugins: { legend: { position: 'bottom', labels: { color: '#94a3b8', padding: 16, font: { size: 12 } } } },
    responsive: true,
    maintainAspectRatio: false,
  };

  const attendanceData = {
    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
    datasets: [{
      label: 'Avg Attendance %',
      data: stats.attendance,
      borderColor: '#a78bfa',
      backgroundColor: 'rgba(167,139,250,0.12)',
      fill: true,
      tension: 0.45,
      pointBackgroundColor: '#a78bfa',
      pointRadius: 4,
    }],
  };

  const lineOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#64748b' } },
      y: { min: 70, max: 100, grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#64748b' } },
    },
  };

  const alertBarData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [{
      label: 'Alerts Generated',
      data: stats.monthlyAlerts,
      backgroundColor: 'rgba(248,113,113,0.7)',
      borderRadius: 8,
      borderSkipped: false,
    }],
  };

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { display: false }, ticks: { color: '#64748b' } },
      y: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#64748b' } },
    },
  };

  const healthColor = (h) => h >= 75 ? '#10b981' : h >= 60 ? '#f59e0b' : '#f43f5e';

  if (loading) return (
    <div style={{
      minHeight: '100vh', background: '#020617',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#38bdf8', fontFamily: "'Inter', sans-serif", gap: 12,
    }}>
      <div style={{
        width: 22, height: 22, border: '2px solid #38bdf8',
        borderTopColor: 'transparent', borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      Loading Admin Observatory...
    </div>
  );

  return (
    <div style={{ minHeight: '100vh', background: '#020617', fontFamily: "'Inter', sans-serif", color: '#f8fafc' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Space+Mono&display=swap');
        * { box-sizing: border-box; margin: 0; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #020617; }
        ::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 3px; }
        @keyframes pulse-dot { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes slide-up { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        .stat-card { transition: transform 0.2s, border-color 0.2s; }
        .stat-card:hover { transform: translateY(-3px); border-color: rgba(56,189,248,0.25) !important; }
        .dept-row:hover { background: rgba(255,255,255,0.04) !important; }
      `}</style>

      {/* ── NAV ── */}
      <nav style={{
        background: 'rgba(15,23,42,0.95)',
        backdropFilter: 'blur(12px)',
        borderBottom: '1px solid rgba(255,255,255,0.07)',
        height: 64, padding: '0 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        position: 'sticky', top: 0, zIndex: 100,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{
            width: 36, height: 36,
            background: 'linear-gradient(135deg, #f472b6, #a78bfa)',
            borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18,
          }}>🛡️</div>
          <div>
            <div style={{ fontWeight: 800, fontSize: 17, letterSpacing: '-0.3px' }}>EduPulse Admin</div>
            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600, letterSpacing: '0.5px' }}>GLOBAL OBSERVATORY</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#10b981', fontWeight: 700 }}>
            <span style={{ width: 7, height: 7, background: '#10b981', borderRadius: '50%', display: 'inline-block', animation: 'pulse-dot 2s infinite' }} />
            System Online
          </div>
          <button onClick={logout} style={{
            background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: 8, padding: '6px 14px', color: '#f8fafc',
            fontFamily: "'Inter', sans-serif", fontSize: 13, fontWeight: 600, cursor: 'pointer',
          }}>
            Logout
          </button>
        </div>
      </nav>

      {/* ── MAIN ── */}
      <div style={{ maxWidth: 1380, margin: '32px auto', padding: '0 24px', display: 'grid', gap: 24, animation: 'slide-up 0.4s ease both' }}>

        {/* KPI CARDS */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16 }}>
          {[
            { label: 'Total Students', value: '12,450', icon: '🎓', color: '#38bdf8', sub: 'Across all institutions' },
            { label: 'Platform Adoption', value: '89%', icon: '📈', color: '#10b981', sub: '+4% this month' },
            { label: 'Avg Health Score', value: '68/100', icon: '❤️', color: '#f59e0b', sub: 'NEP wellness index' },
            { label: 'Active Alerts', value: '142', icon: '🚨', color: '#f43f5e', sub: 'Needs intervention' },
            { label: 'Active SCMs', value: '45', icon: '👨‍🏫', color: '#a78bfa', sub: 'Teachers online' },
          ].map((k, i) => (
            <div key={i} className="stat-card" style={{ ...card, borderLeft: `3px solid ${k.color}` }}>
              <div style={{ fontSize: 28, marginBottom: 8 }}>{k.icon}</div>
              <div style={{ fontFamily: "'Space Mono', monospace", fontSize: 26, fontWeight: 700, color: k.color, lineHeight: 1 }}>{k.value}</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#e2e8f0', margin: '6px 0 4px' }}>{k.label}</div>
              <div style={{ fontSize: 11, color: '#475569' }}>{k.sub}</div>
            </div>
          ))}
        </div>

        {/* CHARTS ROW */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: 24 }}>
          {/* Cluster Doughnut */}
          <div style={card}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 20, color: '#e2e8f0' }}>
              📊 Cluster Distribution
            </div>
            <div style={{ height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Doughnut data={clusterData} options={clusterOptions} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-evenly', marginTop: 16 }}>
              {[['#10b981', '4,150', 'Top'], ['#38bdf8', '5,800', 'Mid'], ['#f43f5e', '2,500', 'Risk']].map(([c, v, l]) => (
                <div key={l} style={{ textAlign: 'center' }}>
                  <div style={{ width: 8, height: 8, background: c, borderRadius: '50%', margin: '0 auto 4px' }} />
                  <div style={{ fontFamily: "'Space Mono'", fontSize: 13, fontWeight: 700, color: c }}>{v}</div>
                  <div style={{ fontSize: 10, color: '#64748b' }}>{l}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Attendance Line */}
          <div style={card}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 20, color: '#e2e8f0' }}>
              📅 Platform-wide Attendance Trend
            </div>
            <div style={{ height: 280 }}>
              <Line data={attendanceData} options={lineOptions} />
            </div>
          </div>
        </div>

        {/* ALERTS BAR + SDG BADGES */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
          {/* Alert Bar Chart */}
          <div style={card}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 20, color: '#e2e8f0' }}>
              🚨 Monthly Alerts Generated
            </div>
            <div style={{ height: 220 }}>
              <Bar data={alertBarData} options={barOptions} />
            </div>
          </div>

          {/* SDG Badges */}
          <div style={card}>
            <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 20, color: '#e2e8f0' }}>
              🌐 UN SDG Alignment
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              {SDG_BADGES.map(s => (
                <div key={s.num} style={{
                  background: `${s.color}18`,
                  border: `1px solid ${s.color}44`,
                  borderRadius: 12, padding: '14px 10px',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: 24, marginBottom: 4 }}>{s.emoji}</div>
                  <div style={{
                    fontFamily: "'Space Mono'", fontSize: 20, fontWeight: 700,
                    color: s.color, lineHeight: 1,
                  }}>SDG {s.num}</div>
                  <div style={{ fontSize: 10, color: '#64748b', marginTop: 4, lineHeight: 1.3 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* NEP 2020 COMPLIANCE */}
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#e2e8f0' }}>
              📜 NEP 2020 Compliance Tracker
            </div>
            <span style={{
              background: 'rgba(16,185,129,0.15)', color: '#10b981',
              border: '1px solid rgba(16,185,129,0.3)',
              borderRadius: 99, padding: '4px 14px', fontSize: 12, fontWeight: 700,
            }}>
              ✅ Actively Monitored
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 20 }}>
            {NEP_PILLARS.map(p => (
              <div key={p.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8' }}>{p.label}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: p.color, fontFamily: "'Space Mono'" }}>{p.pct}%</span>
                </div>
                <div style={{ height: 8, background: 'rgba(255,255,255,0.07)', borderRadius: 99 }}>
                  <div style={{ height: '100%', width: `${p.pct}%`, background: p.color, borderRadius: 99, transition: 'width 1s ease' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* DEPARTMENT TABLE */}
        <div style={card}>
          <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 20, color: '#e2e8f0' }}>
            🏛️ Department Overview
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
                {['Department', 'Students', 'Health Score', 'Active Alerts', 'Status'].map(h => (
                  <th key={h} style={{
                    textAlign: 'left', padding: '8px 12px',
                    fontSize: 11, fontWeight: 700, color: '#475569',
                    letterSpacing: '0.5px', textTransform: 'uppercase',
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {DEPT_DATA.map(d => (
                <tr key={d.dept} className="dept-row" style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background 0.2s' }}>
                  <td style={{ padding: '14px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 10, height: 10, background: d.color, borderRadius: '50%' }} />
                      <span style={{ fontWeight: 600, fontSize: 14 }}>{d.dept}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 12px', fontFamily: "'Space Mono'", fontSize: 14, color: '#94a3b8' }}>
                    {d.students.toLocaleString()}
                  </td>
                  <td style={{ padding: '14px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.07)', borderRadius: 99 }}>
                        <div style={{ height: '100%', width: `${d.health}%`, background: healthColor(d.health), borderRadius: 99 }} />
                      </div>
                      <span style={{ fontFamily: "'Space Mono'", fontSize: 12, color: healthColor(d.health), fontWeight: 700 }}>{d.health}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 12px', fontFamily: "'Space Mono'", fontSize: 14, color: '#f43f5e', fontWeight: 700 }}>
                    {d.alerts}
                  </td>
                  <td style={{ padding: '14px 12px' }}>
                    <span style={{
                      background: d.alerts > 40 ? 'rgba(244,63,94,0.15)' : 'rgba(16,185,129,0.15)',
                      color: d.alerts > 40 ? '#f43f5e' : '#10b981',
                      border: `1px solid ${d.alerts > 40 ? 'rgba(244,63,94,0.3)' : 'rgba(16,185,129,0.3)'}`,
                      borderRadius: 99, padding: '3px 10px', fontSize: 11, fontWeight: 700,
                    }}>
                      {d.alerts > 40 ? '⚠ Attention' : '✓ Stable'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* GEMINI AI CENTER */}
        <div style={card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#e2e8f0' }}>🤖 Gemini AI Operations Center</div>
            <span style={{
              background: 'rgba(16,185,129,0.12)', color: '#10b981',
              border: '1px solid rgba(16,185,129,0.25)',
              borderRadius: 99, padding: '4px 14px', fontSize: 12, fontWeight: 700,
            }}>AI Services Operational</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
            {[
              { label: 'Automated Alerts Sent', value: '3,492', sub: 'This month via parent email', color: '#38bdf8' },
              { label: 'Sparky Interactions', value: '84,215', sub: 'AI queries resolved', color: '#10b981' },
              { label: 'Dropouts Prevented', value: '412', sub: 'RED → YELLOW via intervention', color: '#f59e0b' },
            ].map(s => (
              <div key={s.label} style={{
                background: 'rgba(255,255,255,0.03)',
                border: `1px solid ${s.color}22`,
                borderRadius: 12, padding: 20,
              }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: s.color, marginBottom: 6 }}>{s.label}</div>
                <div style={{ fontFamily: "'Space Mono'", fontSize: 28, fontWeight: 700, color: '#f8fafc', lineHeight: 1 }}>{s.value}</div>
                <div style={{ fontSize: 12, color: '#475569', marginTop: 6 }}>{s.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
