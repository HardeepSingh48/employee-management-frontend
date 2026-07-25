/**
 * Axios API client for the employee-management web app.
 *
 * Request interceptor  — attaches the Bearer access token from localStorage.
 * Response interceptor — on 401, silently attempts a token refresh; if that
 *                        also fails the user is redirected to /login.
 */
import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { isTokenExpired } from './jwt';

// Normalise base URL so '/api' is appended exactly once
const rawBase = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:5000';
const baseURL = rawBase.endsWith('/api') ? rawBase : `${rawBase}/api`;

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

// ─── Storage helpers ──────────────────────────────────────────────────────────

const STORAGE_KEYS = {
  TOKEN: 'token',
  REFRESH_TOKEN: 'refresh_token',
  USER: 'user',
  LAST_LOGIN: 'lastLoginTime',
} as const;

export function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEYS.TOKEN);
}

export function getStoredRefreshToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
}

export function clearAuthStorage(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEYS.TOKEN);
  localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  localStorage.removeItem(STORAGE_KEYS.USER);
  localStorage.removeItem(STORAGE_KEYS.LAST_LOGIN);
}

export function storeTokens(accessToken: string, refreshToken?: string): void {
  localStorage.setItem(STORAGE_KEYS.TOKEN, accessToken);
  if (refreshToken) {
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  }
}

// ─── Request interceptor ──────────────────────────────────────────────────────

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getStoredToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// ─── Response interceptor — silent token refresh ──────────────────────────────

let isRefreshing = false;
let refreshQueue: Array<{
  resolve: (token: string) => void;
  reject: (err: unknown) => void;
}> = [];

function drainQueue(token: string): void {
  refreshQueue.forEach(({ resolve }) => resolve(token));
  refreshQueue = [];
}

function rejectQueue(err: unknown): void {
  refreshQueue.forEach(({ reject }) => reject(err));
  refreshQueue = [];
}

function redirectToLogin(): void {
  clearAuthStorage();
  if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
    window.location.href = '/login';
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    if (error.response?.status === 401 && !originalRequest._retry) {
      const rawRefresh = getStoredRefreshToken();

      // No refresh token stored → sign out immediately
      if (!rawRefresh || isTokenExpired(rawRefresh)) {
        redirectToLogin();
        return Promise.reject(error);
      }

      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          refreshQueue.push({ resolve, reject });
        }).then((newToken) => {
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return api(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshRes = await axios.post<{
          success: boolean;
          message: string;
          data: { access_token: string; token: string };
        }>(`${baseURL}/auth/refresh`, { refresh_token: rawRefresh });

        if (!refreshRes.data.success) {
          throw new Error(refreshRes.data.message);
        }

        const newToken =
          refreshRes.data.data.access_token ?? refreshRes.data.data.token;
        storeTokens(newToken);

        drainQueue(newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return api(originalRequest);
      } catch (refreshError) {
        rejectQueue(refreshError);
        redirectToLogin();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

export default api;