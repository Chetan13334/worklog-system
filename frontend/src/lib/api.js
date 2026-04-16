import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('attendance_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    const refreshedToken = response.headers['x-session-token'];
    if (refreshedToken) {
      localStorage.setItem('attendance_token', refreshedToken);
    }
    return response;
  },
  (error) => {
    if (error?.response?.status === 401) {
      localStorage.removeItem('attendance_token');
      localStorage.removeItem('attendance_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
