import axios from 'axios';

// Dev: relative /api → Vite proxy → localhost:8000
// Prod: VITE_API_URL=https://your-backend.onrender.com  → absolute URL
const BASE = import.meta.env.VITE_API_URL
  ? `${import.meta.env.VITE_API_URL}/api`
  : '/api';

const API = axios.create({
  baseURL: BASE,
  timeout: 30000,
});

// Attach auth token to every request
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('ep_token') || sessionStorage.getItem('ep_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Handle 401 → clear session and send to login
API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('ep_token');
      localStorage.removeItem('ep_user');
      sessionStorage.removeItem('ep_token');
      sessionStorage.removeItem('ep_user');
      // Only redirect if not already on an auth page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default API;
