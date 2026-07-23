import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

const axiosClient = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to attach Bearer token and client date headers
axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('planner_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  config.headers['X-Client-Date'] = `${year}-${month}-${day}`;
  config.headers['X-Timezone-Offset'] = now.getTimezoneOffset();
  return config;
});

// Response interceptor for consistent error handling
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'An unexpected error occurred';
    return Promise.reject(new Error(message));
  }
);

export default axiosClient;
