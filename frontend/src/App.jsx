import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';

// College Student
import StudentDashboard from './pages/college/StudentDashboard';
import GradesPage from './pages/college/GradesPage';
import AttendancePage from './pages/college/AttendancePage';
import CareerPage from './pages/college/CareerPage';
import SparkyChatPage from './pages/college/SparkyChatPage';
import ProgressPage from './pages/college/ProgressPage';
import AchievementsPage from './pages/college/AchievementsPage';
import StudyPlannerPage from './pages/college/StudyPlannerPage';
import PeerLearningPage from './pages/college/PeerLearningPage';

// SCM
import SCMDashboard from './pages/scm/SCMDashboard';
import StudentProfile from './pages/scm/StudentProfile';
import AttendanceMarking from './pages/scm/AttendanceMarking';

// Parent
import ParentDashboard from './pages/parent/ParentDashboard';

// School worlds
import SparkyWorld             from './pages/school/SparkyWorld';
import ExplorerHub             from './pages/school/ExplorerHub';
import CareerCommand           from './pages/school/CareerCommand';
import SchoolTeacherDashboard  from './pages/school/SchoolTeacherDashboard';
// Sparky World zones
import LearningCastle   from './pages/school/zones/LearningCastle';
import NumberKingdom    from './pages/school/zones/NumberKingdom';
import ReadingRiver     from './pages/school/zones/ReadingRiver';
import DiscoveryGarden  from './pages/school/zones/DiscoveryGarden';
import QuestForest      from './pages/school/zones/QuestForest';
import TrophyRoom       from './pages/school/zones/TrophyRoom';
// Explorer Hub zones (Class 6-8)
import ScienceLab   from './pages/school/zones/ScienceLab';
import MathArena    from './pages/school/zones/MathArena';
// Career Command advanced zones (Class 9-12)
import ProgrammingLab from './pages/school/zones/advanced/ProgrammingLab';

// Admin
import AdminAnalytics from './pages/admin/AdminAnalytics';
import ProfilePage from './pages/ProfilePage';

const ROLE_HOME = {
  college_student: '/student',
  school_student:  '/school/explorer',  // overridden by SmartSchoolRedirect
  parent:          '/parent',
  scm:             '/scm',
  admin:           '/admin',
};

// Smart redirect for school students based on their class number
function SmartSchoolRedirect() {
  const { user } = useAuth();
  // Attempt to get class from user metadata, fall back to URL param or default
  const schoolClass = parseInt(user?.studentClass || user?.class || '7');
  if (schoolClass <= 5)  return <Navigate to="/school/sparky-world"  replace />;
  if (schoolClass <= 8)  return <Navigate to="/school/explorer-hub"  replace />;
  return <Navigate to="/school/career-command" replace />;
}

function LoadingScreen() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#020617', color: '#38bdf8', fontFamily: "'Inter', sans-serif", fontSize: '16px', gap: '12px' }}>
      <div style={{ width: '20px', height: '20px', border: '2px solid #38bdf8', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      Loading EduPulse…
    </div>
  );
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (user) return <Navigate to={ROLE_HOME[user.role] || '/student'} replace />;
  return children;
}

function AccessDenied({ user }) {
  const home = ROLE_HOME[user?.role] || '/login';
  const roleLabel = user?.role?.replace(/_/g, ' ') || 'your role';
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#020617', fontFamily: "'Inter', sans-serif", padding: '24px' }}>
      <style>{`@keyframes fadeIn{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>
      <div style={{ maxWidth: '420px', textAlign: 'center', animation: 'fadeIn 0.4s ease' }}>
        <div style={{ fontSize: '72px', marginBottom: '16px' }}>🚫</div>
        <h1 style={{ fontSize: '26px', fontWeight: 800, color: '#f8fafc', margin: '0 0 10px' }}>Access Denied</h1>
        <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '15px', lineHeight: 1.7, margin: '0 0 28px' }}>
          This page is not available for <strong style={{ color: '#f8fafc' }}>{roleLabel}</strong> accounts.<br />
          Please use your assigned dashboard.
        </p>
        <a href={home} style={{ display: 'inline-block', padding: '12px 28px', background: 'linear-gradient(135deg,#00bfff,#0080ff)', borderRadius: '12px', color: '#fff', fontWeight: 700, fontSize: '15px', textDecoration: 'none', boxShadow: '0 4px 20px rgba(0,191,255,0.35)' }}>
          → Go to My Dashboard
        </a>
      </div>
    </div>
  );
}

function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <AccessDenied user={user} />;
  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/"        element={<PublicRoute><LandingPage /></PublicRoute>} />
      <Route path="/landing" element={<PublicRoute><LandingPage /></PublicRoute>} />
      <Route path="/login"   element={<PublicRoute><LoginPage /></PublicRoute>} />
      <Route path="/signup"  element={<Navigate to="/login" replace />} />

      {/* Profile — all authenticated users */}
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />

      {/* College Student */}
      <Route path="/student"              element={<ProtectedRoute roles={['college_student']}><StudentDashboard /></ProtectedRoute>} />
      <Route path="/student/grades"       element={<ProtectedRoute roles={['college_student']}><GradesPage /></ProtectedRoute>} />
      <Route path="/student/attendance"   element={<ProtectedRoute roles={['college_student']}><AttendancePage /></ProtectedRoute>} />
      <Route path="/student/career"       element={<ProtectedRoute roles={['college_student']}><CareerPage /></ProtectedRoute>} />
      <Route path="/student/sparky"       element={<ProtectedRoute roles={['college_student']}><SparkyChatPage /></ProtectedRoute>} />
      <Route path="/student/progress"     element={<ProtectedRoute roles={['college_student']}><ProgressPage /></ProtectedRoute>} />
      <Route path="/student/achievements" element={<ProtectedRoute roles={['college_student']}><AchievementsPage /></ProtectedRoute>} />
      <Route path="/student/planner"      element={<ProtectedRoute roles={['college_student']}><StudyPlannerPage /></ProtectedRoute>} />
      <Route path="/student/peers"        element={<ProtectedRoute roles={['college_student']}><PeerLearningPage /></ProtectedRoute>} />

      {/* SCM / Teacher */}
      <Route path="/scm"                  element={<ProtectedRoute roles={['scm']}><SCMDashboard /></ProtectedRoute>} />
      <Route path="/scm/attendance"       element={<ProtectedRoute roles={['scm']}><AttendanceMarking /></ProtectedRoute>} />
      <Route path="/scm/student/:id"      element={<ProtectedRoute roles={['scm']}><StudentProfile /></ProtectedRoute>} />

      {/* Parent */}
      <Route path="/parent" element={<ProtectedRoute roles={['parent']}><ParentDashboard /></ProtectedRoute>} />

      {/* School Student — smart class-based redirect */}
      <Route path="/school"               element={<ProtectedRoute roles={['school_student']}><SmartSchoolRedirect /></ProtectedRoute>} />
      <Route path="/school/sparky-world"  element={<ProtectedRoute roles={['school_student']}><SparkyWorld /></ProtectedRoute>} />
      <Route path="/school/explorer"      element={<ProtectedRoute roles={['school_student']}><ExplorerHub /></ProtectedRoute>} />
      <Route path="/school/explorer-hub"  element={<ProtectedRoute roles={['school_student']}><ExplorerHub /></ProtectedRoute>} />
      <Route path="/school/career-command" element={<ProtectedRoute roles={['school_student']}><CareerCommand /></ProtectedRoute>} />

      {/* Sparky World zones */}
      <Route path="/school/lesson"       element={<ProtectedRoute roles={['school_student']}><LearningCastle  /></ProtectedRoute>} />
      <Route path="/school/math"         element={<ProtectedRoute roles={['school_student']}><NumberKingdom   /></ProtectedRoute>} />
      <Route path="/school/reading"      element={<ProtectedRoute roles={['school_student']}><ReadingRiver    /></ProtectedRoute>} />
      <Route path="/school/discovery"    element={<ProtectedRoute roles={['school_student']}><DiscoveryGarden /></ProtectedRoute>} />
      <Route path="/school/quests"       element={<ProtectedRoute roles={['school_student']}><QuestForest     /></ProtectedRoute>} />
      <Route path="/school/achievements" element={<ProtectedRoute roles={['school_student']}><TrophyRoom      /></ProtectedRoute>} />

      {/* Explorer Hub zones (Class 6-8) */}
      <Route path="/school/science"     element={<ProtectedRoute roles={['school_student']}><ScienceLab    /></ProtectedRoute>} />
      <Route path="/school/math-arena"  element={<ProtectedRoute roles={['school_student']}><MathArena     /></ProtectedRoute>} />

      {/* Career Command advanced zones (Class 9-12) */}
      <Route path="/school/programming" element={<ProtectedRoute roles={['school_student']}><ProgrammingLab /></ProtectedRoute>} />

      {/* School Teacher Dashboard */}
      <Route path="/school/teacher"       element={<ProtectedRoute roles={['scm','admin']}><SchoolTeacherDashboard /></ProtectedRoute>} />

      {/* Admin */}
      <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AdminAnalytics /></ProtectedRoute>} />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
