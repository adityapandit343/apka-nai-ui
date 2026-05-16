import axios from 'axios';
import { clearAuthSession, getAccessToken } from '../utils/authStorage';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8082';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearAuthSession();
      window.dispatchEvent(new CustomEvent('cutbook:unauthorized'));

      const path = window.location.pathname;
      const authPages = ['/login', '/register', '/customer/login', '/customer/register'];

      if (!authPages.includes(path)) {
        window.location.href = path.startsWith('/customer') ? '/customer/login' : '/login';
      }
    }

    return Promise.reject(error);
  }
);
