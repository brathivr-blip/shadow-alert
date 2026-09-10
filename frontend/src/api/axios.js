import axios from 'axios';

// DEMO MODE – Remove before production.
const DEMO_TOKEN = 'demo-token';

const api = axios.create({
  baseURL: '/api',
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('shadowalert_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      const token = localStorage.getItem('shadowalert_token');

      // DEMO MODE – Remove before production.
      // Keep demo sessions alive when the backend is unavailable or rejects demo-token.
      if (token !== DEMO_TOKEN) {
        localStorage.removeItem('shadowalert_token');
        localStorage.removeItem('shadowalert_user');
      }
    }
    return Promise.reject(error);
  }
);

export default api;
