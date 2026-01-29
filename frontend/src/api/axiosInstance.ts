import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { useAuthStore } from '@/stores/authStore';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

interface AccessTokenResponse {
  accessToken: string;
}

let refreshPromise: Promise<AccessTokenResponse> | null = null;

function callRefresh(): Promise<AccessTokenResponse> {
  if (refreshPromise) return refreshPromise;
  refreshPromise = axios
    .post<AccessTokenResponse>(`${API_BASE_URL}/members/refresh`, {}, { withCredentials: true })
    .then((r) => r.data)
    .finally(() => {
      refreshPromise = null;
    });
  return refreshPromise;
}

// 요청 인터셉터: Access Token 헤더 추가
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token && !config.url?.includes('/members/refresh')) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 응답 인터셉터: 401 → refresh → 재시도, 실패 시 로그아웃·리다이렉트
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const config = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    const status = error.response?.status;
    const isRefresh = config?.url != null && String(config.url).includes('/members/refresh');

    if (status === 401 && !isRefresh && config && !config._retry) {
      config._retry = true;
      try {
        const res = await callRefresh();
        useAuthStore.getState().setAccessToken(res.accessToken);
        if (config.headers) config.headers.Authorization = `Bearer ${res.accessToken}`;
        return axiosInstance.request(config);
      } catch {
        useAuthStore.getState().clearAuth();
        const isAdminPath =
          typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
        window.location.href = isAdminPath ? '/admin/login' : '/login';
      }
    } else if (status === 401 && isRefresh) {
      useAuthStore.getState().clearAuth();
      const isAdminPath =
        typeof window !== 'undefined' && window.location.pathname.startsWith('/admin');
      window.location.href = isAdminPath ? '/admin/login' : '/login';
    } else if (status === 403) {
      const url = error.config?.url ?? '';
      if (String(url).includes('/admin/')) {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);
