import { createContext, useContext, useState, useEffect, useCallback } from 'react';

// Dev: /api proxied by Vite → localhost:8000
// Prod: VITE_API_URL must be set to https://your-backend.onrender.com
const API_BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';


const AuthContext = createContext(null);

// ── Thin fetch helper (used for auth calls that don't need the axios instance) ──
async function apiFetch(endpoint, body, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${endpoint}`, {
    method: body !== undefined ? 'POST' : 'GET',
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Request failed');
  return data;
}

// Where token lives (localStorage = persistent, sessionStorage = session-only)
function getStorage(remember) {
  return remember === false ? sessionStorage : localStorage;
}

function readToken() {
  return localStorage.getItem('ep_token') || sessionStorage.getItem('ep_token');
}

function readUser() {
  try {
    const raw = localStorage.getItem('ep_user') || sessionStorage.getItem('ep_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function clearStorage() {
  ['ep_token', 'ep_user'].forEach((k) => {
    localStorage.removeItem(k);
    sessionStorage.removeItem(k);
  });
}

export function AuthProvider({ children }) {
  const [user, setUser]     = useState(null);
  const [loading, setLoading] = useState(true);

  // ── Startup: validate stored token against /api/auth/me ──────────────────
  useEffect(() => {
    const token = readToken();

    if (!token) {
      setLoading(false);
      return;
    }

    // Verify the token is still valid on the server
    apiFetch('/auth/me', undefined, token)
      .then((data) => {
        const stored = readUser();
        // Merge fresh data from server with any locally cached extras
        const merged = { ...stored, ...data };
        setUser(merged);
        // Re-persist with fresh data
        const storage = localStorage.getItem('ep_token') ? localStorage : sessionStorage;
        storage.setItem('ep_user', JSON.stringify(merged));
      })
      .catch(() => {
        // Token is invalid / expired — wipe everything
        clearStorage();
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  // ── LOGIN ────────────────────────────────────────────────────────────────
  const login = useCallback(async (credentials, remember = true) => {
    const data = await apiFetch('/auth/login', credentials);
    const storage = getStorage(remember);
    if (data.token) storage.setItem('ep_token', data.token);
    storage.setItem('ep_user', JSON.stringify(data));
    setUser(data);
    return data;
  }, []);

  // ── REGISTER ─────────────────────────────────────────────────────────────
  const register = useCallback(async (formData, remember = true) => {
    const data = await apiFetch('/auth/register', formData);
    const storage = getStorage(remember);
    if (data.token) storage.setItem('ep_token', data.token);
    storage.setItem('ep_user', JSON.stringify(data));
    setUser(data);
    return data;
  }, []);

  // ── LOGOUT ────────────────────────────────────────────────────────────────
  const logout = useCallback(() => {
    clearStorage();
    setUser(null);
    window.location.href = '/login';
  }, []);

  // ── UPDATE USER (local + server) ─────────────────────────────────────────
  const updateUser = useCallback((updates) => {
    setUser((prev) => {
      const updated = { ...prev, ...updates };
      const storage = localStorage.getItem('ep_token') ? localStorage : sessionStorage;
      storage.setItem('ep_user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  // ── REFRESH TOKEN ─────────────────────────────────────────────────────────
  const refreshToken = useCallback(async () => {
    const token = readToken();
    if (!token) return;
    try {
      const data = await apiFetch('/auth/refresh-token', {}, token);
      const storage = localStorage.getItem('ep_token') ? localStorage : sessionStorage;
      storage.setItem('ep_token', data.token);
    } catch {
      logout();
    }
  }, [logout]);

  // ── FORGOT PASSWORD (step 1: send OTP) ───────────────────────────────────
  const forgotPassword = useCallback(async (email) => {
    return apiFetch('/auth/forgot-password', { email });
  }, []);

  // ── RESET PASSWORD (step 2+3: verify OTP + set new password) ─────────────
  const resetPassword = useCallback(async (email, otp, newPassword, remember = true) => {
    const data = await apiFetch('/auth/reset-password', { email, otp, newPassword });
    // The server returns a fresh token after reset — log the user in immediately
    if (data.token) {
      const storage = getStorage(remember);
      storage.setItem('ep_token', data.token);
      storage.setItem('ep_user', JSON.stringify(data));
      setUser(data);
    }
    return data;
  }, []);

  // ── GET TOKEN ─────────────────────────────────────────────────────────────
  const getToken = useCallback(() => readToken(), []);

  const value = {
    user,
    login,
    register,
    logout,
    updateUser,
    getToken,
    refreshToken,
    forgotPassword,
    resetPassword,
    loading,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
