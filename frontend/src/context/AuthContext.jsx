import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { DEMO_USERS } from '../data/demoData';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // On mount: restore user from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('ep_user');
      if (stored) setUser(JSON.parse(stored));
    } catch (e) {
      localStorage.removeItem('ep_user');
    }
    setLoading(false);
  }, []);

  const login = useCallback(async (credentials) => {
    const { email, password, pin, role: selectedRole } = credentials;

    // ── Demo login (no backend) ───────────────────────────
    const demoUser = DEMO_USERS[email?.toLowerCase()];
    if (demoUser && demoUser.password === password) {
      const userData = { ...demoUser };
      delete userData.password; // never cache password
      localStorage.setItem('ep_user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    }

    // ── Try PIN login for school students (demo) ──────────
    if (pin && selectedRole === 'school_student') {
      // PIN 1234 → Riya
      if (pin === '1234') {
        const riya = { ...DEMO_USERS['riya@demo.com'] };
        delete riya.password;
        localStorage.setItem('ep_user', JSON.stringify(riya));
        setUser(riya);
        return riya;
      }
    }

    // ── Try real backend (fallback) ───────────────────────
    try {
      const { default: API } = await import('../utils/api');
      const { data } = await API.post('/api/auth/login', credentials);
      localStorage.setItem('ep_token', data.token);
      const userData = { ...data };
      localStorage.setItem('ep_user', JSON.stringify(userData));
      setUser(userData);
      return userData;
    } catch (err) {
      throw new Error(err.response?.data?.message || 'Invalid credentials. Try demo@example.com / demo123');
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('ep_token');
    localStorage.removeItem('ep_user');
    setUser(null);
    window.location.href = '/login';
  }, []);

  const updateUser = useCallback((updates) => {
    const updated = { ...user, ...updates };
    setUser(updated);
    localStorage.setItem('ep_user', JSON.stringify(updated));
  }, [user]);

  const value = { user, login, logout, updateUser, loading, isAuthenticated: !!user };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
