import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';

// College Student pages
import StudentDashboard from './pages/college/StudentDashboard';
import GradesPage from './pages/college/GradesPage';
import AttendancePage from './pages/college/AttendancePage';
import CareerPage from './pages/college/CareerPage';
import SparkyChatPage from './pages/college/SparkyChatPage';
import ProgressPage from './pages/college/ProgressPage';
import AchievementsPage from './pages/college/AchievementsPage';
import StudyPlannerPage from './pages/college/StudyPlannerPage';

// SCM pages
import SCMDashboard from './pages/scm/SCMDashboard';
import StudentProfile from './pages/scm/StudentProfile';
import AttendanceMarking from './pages/scm/AttendanceMarking';

// Parent page
import ParentDashboard from './pages/parent/ParentDashboard';

// School pages
import SparkyWorld from './pages/school/SparkyWorld';
import ExplorerHub from './pages/school/ExplorerHub';
import CareerCommand from './pages/school/CareerCommand';

// Admin page
import AdminAnalytics from './pages/admin/AdminAnalytics';

// Role → home dashboard map
const ROLE_HOME = {
  college_student: '/student',
  school_student:  '/school/explorer',
  parent:          '/parent',
  scm:             '/scm',
  admin:           '/admin',
};

// Redirect logged-in users away from public pages (/, /login, /landing)
function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (user) return <Navigate to={ROLE_HOME[user.role] || '/student'} replace />;
  return children;
}

// Require login + optional role check
function ProtectedRoute({ children, roles }) {
  const { user, loading } = useAuth();

  if (loading) return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      minHeight: '100vh', background: '#020617', color: '#38bdf8',
      fontFamily: "'Inter', sans-serif", fontSize: '16px', gap: '12px',
    }}>
      <div style={{
        width: '20px', height: '20px', border: '2px solid #38bdf8',
        borderTopColor: 'transparent', borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      Loading EduPulse...
    </div>
  );

  // Not logged in → go to login
  if (!user) return <Navigate to="/login" replace />;

  // Wrong role → redirect to correct home
  if (roles && !roles.includes(user.role)) {
    return <Navigate to={ROLE_HOME[user.role] || '/login'} replace />;
  }

  return children;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public — redirect logged-in users away */}
      <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
      <Route path="/landing" element={<PublicRoute><LandingPage /></PublicRoute>} />
      <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />

      {/* College Student */}
      <Route path="/student" element={<ProtectedRoute roles={['college_student']}><StudentDashboard /></ProtectedRoute>} />
      <Route path="/student/grades" element={<ProtectedRoute roles={['college_student']}><GradesPage /></ProtectedRoute>} />
      <Route path="/student/attendance" element={<ProtectedRoute roles={['college_student']}><AttendancePage /></ProtectedRoute>} />
      <Route path="/student/career" element={<ProtectedRoute roles={['college_student']}><CareerPage /></ProtectedRoute>} />
      <Route path="/student/sparky" element={<ProtectedRoute roles={['college_student']}><SparkyChatPage /></ProtectedRoute>} />
      <Route path="/student/progress" element={<ProtectedRoute roles={['college_student']}><ProgressPage /></ProtectedRoute>} />
      <Route path="/student/achievements" element={<ProtectedRoute roles={['college_student']}><AchievementsPage /></ProtectedRoute>} />
      <Route path="/student/planner" element={<ProtectedRoute roles={['college_student']}><StudyPlannerPage /></ProtectedRoute>} />

      {/* SCM / Teacher */}
      <Route path="/scm" element={<ProtectedRoute roles={['scm']}><SCMDashboard /></ProtectedRoute>} />
      <Route path="/scm/attendance" element={<ProtectedRoute roles={['scm']}><AttendanceMarking /></ProtectedRoute>} />
      <Route path="/scm/student/:id" element={<ProtectedRoute roles={['scm']}><StudentProfile /></ProtectedRoute>} />

      {/* Parent */}
      <Route path="/parent" element={<ProtectedRoute roles={['parent']}><ParentDashboard /></ProtectedRoute>} />

      {/* School Student */}
      <Route path="/school/sparky-world" element={<ProtectedRoute roles={['school_student']}><SparkyWorld /></ProtectedRoute>} />
      <Route path="/school/explorer" element={<ProtectedRoute roles={['school_student']}><ExplorerHub /></ProtectedRoute>} />
      <Route path="/school/explorer-hub" element={<ProtectedRoute roles={['school_student']}><ExplorerHub /></ProtectedRoute>} />
      <Route path="/school/career-command" element={<ProtectedRoute roles={['school_student']}><CareerCommand /></ProtectedRoute>} />

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
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
