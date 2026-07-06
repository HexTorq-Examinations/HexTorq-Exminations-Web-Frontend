import axios from 'axios';
import { toast } from 'sonner';
import type { User } from '@/types/auth';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://metatronhost.in/hextorq-examinations/api',
  withCredentials: true,
});

let refreshPromise: Promise<string> | null = null;

const persistRefreshedSession = async (token: string, user: User) => {
  if (typeof window === 'undefined') return;
  const raw = localStorage.getItem('auth-storage');
  const parsed = raw ? JSON.parse(raw) : { state: {}, version: 0 };
  parsed.state = { ...parsed.state, token, user, isAuthenticated: true };
  localStorage.setItem('auth-storage', JSON.stringify(parsed));
  const { useAuthStore } = await import('@/store/authStore');
  useAuthStore.setState({ token, user, isAuthenticated: true });
};

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
  code?: string;
  details?: unknown;
  httpStatus?: number;
  isNetworkError?: boolean;
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config as (typeof error.config & { _retry?: boolean }) | undefined;
    const isAuthRequest = typeof original?.url === 'string' && ['/auth/login', '/auth/refresh', '/auth/forgot-password', '/auth/reset-password'].some((path) => original.url?.includes(path));
    if (error.response?.status === 401 && original && !original._retry && !isAuthRequest && typeof window !== 'undefined') {
      original._retry = true;
      try {
        refreshPromise ||= axios.post(
          `${api.defaults.baseURL}/auth/refresh`,
          {},
          { withCredentials: true }
        ).then(async ({ data }) => {
          await persistRefreshedSession(data.token, data.user);
          return data.token as string;
        }).finally(() => { refreshPromise = null; });
        const token = await refreshPromise;
        original.headers = original.headers || {};
        original.headers.Authorization = `Bearer ${token}`;
        return api(original);
      } catch {
        const { useAuthStore } = await import('@/store/authStore');
        useAuthStore.setState({ user: null, token: null, isAuthenticated: false });
        localStorage.removeItem('auth-storage');
      }
    }
    const message = error.response?.data?.message || error.message || 'Request failed';
    
    // Globally toast all API errors
    if (typeof window !== 'undefined' && message !== 'Request failed with status code 401') {
      toast.error(message);
    }
    
    const wrapped: ApiErrorWithRows = new Error(message);
    if (Array.isArray(error.response?.data?.errors)) {
      wrapped.rowErrors = error.response.data.errors;
    }
    wrapped.code = error.response?.data?.code;
    wrapped.details = error.response?.data?.details;
    wrapped.httpStatus = error.response?.status;
    wrapped.isNetworkError = !error.response;
    return Promise.reject(wrapped);
  }
);
