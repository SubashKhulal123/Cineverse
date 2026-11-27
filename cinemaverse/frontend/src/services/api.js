import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
});

// Attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('cv_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('cv_token');
      localStorage.removeItem('cv_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

// TMDb image helpers
export const IMG_BASE = 'https://image.tmdb.org/t/p';
export const posterUrl = (path, size = 'w500') =>
  path ? `${IMG_BASE}/${size}${path}` : '/placeholder-poster.png';
export const backdropUrl = (path, size = 'original') =>
  path ? `${IMG_BASE}/${size}${path}` : '/placeholder-backdrop.jpg';
export const profileUrl = (path, size = 'w185') =>
  path ? `${IMG_BASE}/${size}${path}` : '/placeholder-avatar.png';
