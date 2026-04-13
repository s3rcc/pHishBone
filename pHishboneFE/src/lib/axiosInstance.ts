import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:5281';

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

const refreshClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

interface RetriableRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

let refreshRequest: Promise<void> | null = null;

function shouldSkipRefresh(config?: RetriableRequestConfig): boolean {
  const url = config?.url ?? '';

  return url.includes('/api/auth/login')
    || url.includes('/api/auth/register')
    || url.includes('/api/auth/refresh')
    || url.includes('/api/auth/logout');
}

function refreshSession(): Promise<void> {
  if (!refreshRequest) {
    refreshRequest = refreshClient
      .post('/api/auth/refresh', {})
      .then(() => undefined)
      .finally(() => {
        refreshRequest = null;
      });
  }

  return refreshRequest;
}

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as RetriableRequestConfig | undefined;

    if (
      error.response?.status !== 401
      || !originalRequest
      || originalRequest._retry
      || shouldSkipRefresh(originalRequest)
    ) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      await refreshSession();
      return axiosInstance(originalRequest);
    } catch (refreshError) {
      return Promise.reject(refreshError);
    }
  },
);
