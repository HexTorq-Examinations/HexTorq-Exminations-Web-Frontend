import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://metatronhost.in/hextorq-examinations/api',
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const raw = localStorage.getItem('auth-storage');
    if (raw) {
      try {
        const parsed = JSON.parse(raw);
        const token = parsed?.state?.token;
        if (token) {
          config.headers = config.headers || {};
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch {
        // ignore malformed storage
      }
    }
  }
  return config;
});

export interface ApiErrorWithRows extends Error {
  rowErrors?: { row: number; error: string }[];
}

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || 'Request failed';
    const wrapped: ApiErrorWithRows = new Error(message);
    if (Array.isArray(error.response?.data?.errors)) {
      wrapped.rowErrors = error.response.data.errors;
    }
    return Promise.reject(wrapped);
  }
);
