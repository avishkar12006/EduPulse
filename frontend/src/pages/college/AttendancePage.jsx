import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { DEMO_STUDENTS } from '../../data/demoData';

const STATUS_COLOR = { present: '#10B981', absent: '#EF4444', late: '#F59E0B' };

function CalendarHeatmap({ records }) {
  const today = new Date();
  const days = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(today); d.setDate(d.getDate() - i);
    const key = d.toISOString().split('T')[0];
    const dayRecords = records[key] || [];
    const hasPresent = dayRecords.some(r => r.status === 'present');
    const hasAbsent = dayRecords.some(r => r.status === 'absent');
    const hasLate = dayRecords.some(r => r.status === 'late');
    const color = dayRecords.length === 0 ? 'rgba(255,255,255,0.05)' :
                  hasAbsent ? '#EF444430' : hasLate ? '#F59E0B30' : '#10B98130';
    const border = dayRecords.length === 0 ? 'rgba(255,255,255,0.05)' :
                   hasAbsent ? '#EF4444' : hasLate ? '#F59E0B' : '#10B981';
    days.push({ date: d, key, color, border, records: dayRecords });
  }

  return (
    <div>
      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
        {days.map((d, i) => (
          <div key={i} title={`${d.key}: ${d.records.map(r => r.subject + ' - ' + r.status).join(', ') || 'No class'}`}
            style={{ width: '26px', height: '26px', borderRadius: '6px', background: d.color, border: `1px solid ${d.border}`, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', color: 'rgba(255,255,255,0.4)', fontWeight: 700 }}>
            {d.date.getDate()}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
        {[{ color: '#10B981', label: 'Present' }, { color: '#EF4444', label: 'Absent' }, { color: '#F59E0B', label: 'Late' }, { color: 'rgba(255,255,255,0.1)', label: 'No class' }].map((l, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '3px', background: l.color }} />
            {l.label}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AttendancePage() {
  const { user } = useAuth();
  const [calendar, setCalendar] = useState({});

  // Load demo data directly
  const student = DEMO_STUDENTS[user?.studentId] || DEMO_STUDENTS['stu_aarav'];
  const overall = student.attendance?.overall ?? student.attendancePercentage ?? 68;
  const subjectSummary = (student.attendance?.summary || []).map(s => ({
    subject: s.subject,
    percentage: s.percentage,
    total: 40,
    present: Math.round((s.percentage / 100) * 40),
  }));

  useEffect(() => {
    // Generate realistic demo calendar entries for last 30 days
    const today = new Date();
    const cal = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const dow = d.getDay();
      if (dow === 0 || dow === 6) continue; // skip weekends
      // Mark absent roughly matching the student's attendance %
      const isPresent = Math.random() * 100 < overall;
      cal[key] = [{ subject: 'Class', status: isPresent ? 'present' : 'absent' }];
    }
    setCalendar(cal);
  }, []);

  const calcRecovery = (pct, total) => {
    if (pct >= 75) return null;
    // classes needed to reach 75%: present >= 0.75 * (total + n) => n = (0.75*total - present) / 0.25
    const present = Math.round((pct / 100) * total);
    const needed = Math.ceil((0.75 * total - present) / 0.25);
    return needed > 0 ? needed : 0;
  };

  return (
    <div style={{ minHeight: '100vh', background: '#0A1628', color: 'white', fontFamily: "'Nunito', sans-serif" }}>
      <nav style={{ background: 'rgba(255,255,255,0.04)', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '0 24px', height: '60px', display: 'flex', alignItems: 'center', gap: '20px' }}>
        <Link to="/student" style={{ color: '#00BFFF', textDecoration: 'none', fontSize: '14px', fontWeight: 700 }}>← Dashboard</Link>
        <h1 style={{ fontFamily: "'Fredoka One', cursive", fontSize: '22px', margin: 0 }}>📅 My Attendance</h1>
      </nav>

      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '24px' }}>
        {true && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '24px' }}>
            {/* LEFT */}
            <div>
              {/* Big attendance meter */}
              <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '32px', marginBottom: '20px', textAlign: 'center' }}>
                <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: '80px', lineHeight: 1, color: overall >= 85 ? '#10B981' : overall >= 75 ? '#F59E0B' : '#EF4444' }}>{overall}%</div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: '16px', marginTop: '8px', fontWeight: 600 }}>Overall Attendance</div>
                <div style={{ height: '12px', borderRadius: '99px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden', margin: '20px 0', maxWidth: '400px', marginLeft: 'auto', marginRight: 'auto' }}>
                  <div style={{ height: '100%', width: `${overall}%`, borderRadius: '99px', background: overall >= 85 ? 'linear-gradient(90deg,#10B981,#059669)' : overall >= 75 ? 'linear-gradient(90deg,#F59E0B,#D97706)' : 'linear-gradient(90deg,#EF4444,#DC2626)', transition: 'width 1.5s ease' }} />
                </div>
                {/* Color indicators */}
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', fontSize: '13px', fontWeight: 700 }}>
                  <span style={{ color: '#10B981' }}>● Safe (≥85%)</span>
                  <span style={{ color: '#F59E0B' }}>● Warning (75-85%)</span>
                  <span style={{ color: '#EF4444' }}>● Critical (&lt;75%)</span>
                </div>
                {overall < 75 && (
                  <div style={{ marginTop: '16px', background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '12px', padding: '14px', color: '#fca5a5', fontSize: '14px', fontWeight: 600 }}>
                    ⚠️ You need to attend the next <strong>{calcRecovery(overall, 100)}</strong> classes consecutively to reach 75%
                  </div>
                )}
              </div>

              {/* Subject cards */}
              <h3 style={{ fontFamily: "'Fredoka One', cursive", fontSize: '20px', marginBottom: '16px' }}>Subject-wise Breakdown</h3>
              {subjectSummary.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.3)' }}>No attendance data recorded yet</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {subjectSummary.map((s, i) => {
                    const statusColor = s.percentage >= 85 ? '#10B981' : s.percentage >= 75 ? '#F59E0B' : '#EF4444';
                    const statusLabel = s.percentage >= 85 ? '✅ Safe' : s.percentage >= 75 ? '⚠️ Warning' : '🚨 Critical';
                    const recovery = calcRecovery(s.percentage, s.total);
                    return (
                      <div key={i} style={{ background: 'rgba(255,255,255,0.04)', border: `1px solid ${statusColor}30`, borderRadius: '14px', padding: '18px', borderLeft: `4px solid ${statusColor}` }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <div>
                            <div style={{ fontWeight: 800, fontSize: '15px' }}>{s.subject}</div>
                            <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)' }}>{s.present} attended out of {s.total} classes</div>
                          </div>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '22px', fontWeight: 700, color: statusColor }}>{s.percentage}%</div>
                            <div style={{ fontSize: '12px', color: statusColor, fontWeight: 700 }}>{statusLabel}</div>
                          </div>
                        </div>
                        <div style={{ height: '8px', borderRadius: '99px', background: 'rgba(255,255,255,0.08)', overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: `${s.percentage}%`, borderRadius: '99px', background: `linear-gradient(90deg,${statusColor},${statusColor}88)`, transition: 'width 1s ease' }} />
                        </div>
                        {recovery !== null && (
                          <div style={{ marginTop: '10px', fontSize: '12px', color: '#fca5a5' }}>
                            ⚠️ Need {recovery} consecutive classes to reach 75%
                          </div>
                        )}
                        {s.percentage === 100 && (
                          <div style={{ marginTop: '10px', fontSize: '12px', color: '#FFD700', fontWeight: 700 }}>
                            🏅 Perfect Attendance — Keep it up!
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* RIGHT — Calendar */}
            <div>
              <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '24px', position: 'sticky', top: '24px' }}>
                <h3 style={{ fontFamily: "'Fredoka One', cursive", fontSize: '18px', marginBottom: '20px' }}>📆 Last 30 Days</h3>
                <CalendarHeatmap records={calendar} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
