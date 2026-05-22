import axios, { AxiosError, type AxiosInstance, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import { envConfig } from '@/config/env';
import { useAuthStore } from '@/stores/authStore';
import { getVisitorToken } from '@/stores/visitorStore';
import type { ApiError, ApiResponse } from '@/types/api.types';

const isBrowser = typeof window !== 'undefined';

const axiosInstance: AxiosInstance = axios.create({
  baseURL: envConfig.apiUrl,
  timeout: envConfig.apiTimeout,
  headers: { 'Content-Type': 'application/json' },
});

axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  if (!isBrowser) return config;
  const token = useAuthStore.getState().token;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  const visitorToken = getVisitorToken();
  if (visitorToken && config.headers) {
    config.headers['x-visitor-token'] = visitorToken;
  }
  return config;
});

let isRefreshing = false;
let refreshQueue: Array<{ resolve: () => void; reject: (e: Error) => void }> = [];

async function tryRefreshToken(): Promise<boolean> {
  if (!isBrowser) return false;
  const refreshToken = useAuthStore.getState().refreshToken;
  if (!refreshToken) return false;

  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      refreshQueue.push({
        resolve: () => resolve(true),
        reject: (e) => reject(e),
      });
    });
  }

  isRefreshing = true;
  try {
    const response = await axios.post<ApiResponse<{ token: string }>>(
      `${envConfig.apiUrl}/auth/refresh`,
      { refreshToken },
      { headers: { 'Content-Type': 'application/json' } }
    );
    const newToken = response.data?.data?.token;
    if (!newToken) {
      useAuthStore.getState().logout();
      refreshQueue.forEach((q) => q.reject(new Error('Session expirée')));
      return false;
    }
    useAuthStore.getState().setToken(newToken);
    refreshQueue.forEach((q) => q.resolve());
    return true;
  } catch (error) {
    useAuthStore.getState().logout();
    refreshQueue.forEach((q) => q.reject(error instanceof Error ? error : new Error('Refresh failed')));
    return false;
  } finally {
    isRefreshing = false;
    refreshQueue = [];
  }
}

function extractMessage(error: AxiosError<ApiError>): string {
  if (error.response?.data?.message) return error.response.data.message;
  if (error.code === 'ECONNABORTED') return 'Requête trop longue.';
  if (!error.response) return 'Serveur indisponible. Vérifiez que le backend est démarré.';
  return error.message || 'Erreur réseau';
}

axiosInstance.interceptors.response.use(
  <T,>(response: AxiosResponse<ApiResponse<T> | T>): AxiosResponse<T> => {
    const payload = response.data as ApiResponse<T> | T;
    const unwrapped =
      payload && typeof payload === 'object' && 'data' in (payload as ApiResponse<T>)
        ? (payload as ApiResponse<T>).data
        : (payload as T);
    return { ...response, data: unwrapped };
  },
  async (error: AxiosError<ApiError>) => {
    const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
    if (error.response?.status === 401 && !original?._retry && isBrowser && useAuthStore.getState().refreshToken) {
      original._retry = true;
      const refreshed = await tryRefreshToken();
      if (refreshed) {
        return axiosInstance(original);
      }
    }
    if (error.response?.status === 401 && isBrowser) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(new Error(extractMessage(error)));
  }
);

export const apiClient = {
  get: <T,>(url: string, config?: Parameters<typeof axiosInstance.get>[1]) =>
    axiosInstance.get<T, AxiosResponse<T>>(url, config).then((r) => r.data),
  post: <T,>(url: string, data?: unknown, config?: Parameters<typeof axiosInstance.post>[2]) =>
    axiosInstance.post<T, AxiosResponse<T>>(url, data, config).then((r) => r.data),
  put: <T,>(url: string, data?: unknown, config?: Parameters<typeof axiosInstance.put>[2]) =>
    axiosInstance.put<T, AxiosResponse<T>>(url, data, config).then((r) => r.data),
  patch: <T,>(url: string, data?: unknown, config?: Parameters<typeof axiosInstance.patch>[2]) =>
    axiosInstance.patch<T, AxiosResponse<T>>(url, data, config).then((r) => r.data),
  delete: <T,>(url: string, config?: Parameters<typeof axiosInstance.delete>[1]) =>
    axiosInstance.delete<T, AxiosResponse<T>>(url, config).then((r) => r.data),
};

export default apiClient;
