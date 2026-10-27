import axios from 'axios';

const rawBaseUrl = import.meta.env.VITE_API_BASE_URL;
const resolvedBaseUrl = rawBaseUrl
  ? (rawBaseUrl.endsWith('/api') ? rawBaseUrl : `${rawBaseUrl.replace(/\/+$/, '')}/api`)
  : '/api';

const api = axios.create({
  baseURL: resolvedBaseUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    if (config.url) {
      if (config.url === '/api') {
        config.url = '/';
      } else if (config.url.startsWith('/api/')) {
        config.url = config.url.substring(4);
      }
    }
    const token = localStorage.getItem('internflow_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token on 401 if not already on login page
      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
        localStorage.removeItem('internflow_token');
        localStorage.removeItem('internflow_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
