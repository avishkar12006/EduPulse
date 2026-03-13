import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    try { return localStorage.getItem('ep_theme') || 'dark'; } catch { return 'dark'; }
  });

  useEffect(() => {
    localStorage.setItem('ep_theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const toggle = () => setTheme(t => t === 'dark' ? 'light' : 'dark');
  const isDark = theme === 'dark';

  // CSS variable sets for each theme
  const colors = isDark ? {
    bg: '#020617',
    bgCard: 'rgba(15, 23, 42, 0.7)',
    bgCardSolid: '#0f172a',
    bgNav: 'rgba(2, 6, 23, 0.85)',
    border: 'rgba(255,255,255,0.07)',
    borderStrong: 'rgba(255,255,255,0.15)',
    text: '#f8fafc',
    textMuted: 'rgba(255,255,255,0.45)',
    textSecondary: 'rgba(255,255,255,0.65)',
    accent: '#38bdf8',
    accentBg: 'rgba(56,189,248,0.12)',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    purple: '#8b5cf6',
    inputBg: 'rgba(255,255,255,0.05)',
    inputBorder: 'rgba(255,255,255,0.12)',
    shadow: '0 8px 32px rgba(0,0,0,0.4)',
    shimmer: 'rgba(255,255,255,0.03)',
  } : {
    bg: '#f1f5f9',
    bgCard: 'rgba(255,255,255,0.95)',
    bgCardSolid: '#ffffff',
    bgNav: 'rgba(255,255,255,0.92)',
    border: 'rgba(0,0,0,0.08)',
    borderStrong: 'rgba(0,0,0,0.18)',
    text: '#0f172a',
    textMuted: 'rgba(0,0,0,0.4)',
    textSecondary: 'rgba(0,0,0,0.6)',
    accent: '#0284c7',
    accentBg: 'rgba(2,132,199,0.1)',
    success: '#059669',
    warning: '#d97706',
    danger: '#dc2626',
    purple: '#7c3aed',
    inputBg: 'rgba(0,0,0,0.04)',
    inputBorder: 'rgba(0,0,0,0.15)',
    shadow: '0 8px 32px rgba(0,0,0,0.12)',
    shimmer: 'rgba(0,0,0,0.02)',
  };

  return (
    <ThemeContext.Provider value={{ theme, toggle, isDark, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
};
