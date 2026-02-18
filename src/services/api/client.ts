import type { ApiResponse, ApiError } from '@/types/admin.types';
import { envConfig } from '@/config/env';

const API_URL = envConfig.apiUrl;
const API_TIMEOUT = envConfig.apiTimeout;

// Token management — single source: localStorage keys
const TOKEN_KEY = 'admin_token';
const REFRESH_TOKEN_KEY = 'admin_refresh_token';

export const getToken = (): string | null => localStorage.getItem(TOKEN_KEY);
export const setToken = (token: string): void => {
  localStorage.setItem(TOKEN_KEY, token);
  // Sync with Zustand auth store
  syncAuthStore({ token });
};
export const removeToken = (): void => localStorage.removeItem(TOKEN_KEY);

export const getRefreshToken = (): string | null => localStorage.getItem(REFRESH_TOKEN_KEY);
export const setRefreshToken = (token: string): void => {
  localStorage.setItem(REFRESH_TOKEN_KEY, token);
  syncAuthStore({ refreshToken: token });
};
export const removeRefreshToken = (): void => localStorage.removeItem(REFRESH_TOKEN_KEY);

// Keep Zustand auth-storage in sync with token changes
function syncAuthStore(patch: Record<string, unknown>): void {
  try {
    const raw = localStorage.getItem('auth-storage');
    if (raw) {
      const parsed = JSON.parse(raw);
      parsed.state = { ...parsed.state, ...patch };
      localStorage.setItem('auth-storage', JSON.stringify(parsed));
    }
  } catch { /* ignore */ }
}

export const clearTokens = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  // Reset the Zustand auth store
  syncAuthStore({ token: null, refreshToken: null, isAuthenticated: false, user: null });
};

// HTTP Client
interface RequestOptions extends RequestInit {
  timeout?: number;
  skipAuth?: boolean;
}

class ApiClient {
  private baseUrl: string;
  private isRefreshing = false;
  private refreshQueue: Array<{ resolve: () => void; reject: (e: Error) => void }> = [];

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getHeaders(skipAuth = false): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (!skipAuth) {
      const token = getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    // Always attach visitor token if present (separate from admin auth)
    const visitorToken = localStorage.getItem('visitor_token') || sessionStorage.getItem('visitor_token');
    if (visitorToken) {
      (headers as Record<string, string>)['X-Visitor-Token'] = visitorToken;
    }

    return headers;
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    let data: unknown;
    try {
      data = await response.json();
    } catch {
      throw new Error(`HTTP Error: ${response.status} - Invalid JSON response`);
    }

    if (!response.ok) {
      const error = data as ApiError;

      if (response.status === 401) {
        // Don't clear tokens here — let the caller handle retry with refresh
        throw Object.assign(new Error(error.message || 'Unauthorized'), { status: 401 });
      }

      throw new Error(error.message || `HTTP Error: ${response.status}`);
    }

    // Try to extract data from standardized response, fallback to raw data
    if (data && typeof data === 'object' && 'data' in (data as Record<string, unknown>)) {
      return (data as ApiResponse<T>).data;
    }
    return data as T;
  }

  private async tryRefreshToken(): Promise<boolean> {
    const refreshTokenValue = getRefreshToken();
    if (!refreshTokenValue) return false;

    // If already refreshing, wait for it
    if (this.isRefreshing) {
      return new Promise((resolve, reject) => {
        this.refreshQueue.push({
          resolve: () => resolve(true),
          reject: (e) => { reject(e); },
        });
      });
    }

    this.isRefreshing = true;
    try {
      const response = await fetch(`${this.baseUrl}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken: refreshTokenValue }),
      });

      if (!response.ok) {
        clearTokens();
        this.refreshQueue.forEach((q) => q.reject(new Error('Session expiree')));
        return false;
      }

      const result = await response.json();
      const newToken = result.data?.token || result.token;
      if (newToken) {
        setToken(newToken);
        this.refreshQueue.forEach((q) => q.resolve());
        return true;
      }

      clearTokens();
      return false;
    } catch {
      clearTokens();
      this.refreshQueue.forEach((q) => q.reject(new Error('Session expiree')));
      return false;
    } finally {
      this.isRefreshing = false;
      this.refreshQueue = [];
    }
  }

  private async fetchWithTimeout(
    url: string,
    options: RequestOptions = {}
  ): Promise<Response> {
    const { timeout = API_TIMEOUT, ...fetchOptions } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
      });
      return response;
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        throw new Error('Request timeout');
      }
      // Network error (backend not running) - don't redirect, just throw
      throw new Error('Serveur indisponible. Verifiez que le backend est demarre.');
    } finally {
      clearTimeout(timeoutId);
    }
  }

  private async requestWithRetry<T>(
    method: string,
    endpoint: string,
    data?: unknown,
    options: RequestOptions = {}
  ): Promise<T> {
    const doRequest = () =>
      this.fetchWithTimeout(`${this.baseUrl}${endpoint}`, {
        method,
        headers: this.getHeaders(options.skipAuth),
        body: data ? JSON.stringify(data) : undefined,
        ...options,
      });

    try {
      const response = await doRequest();
      return await this.handleResponse<T>(response);
    } catch (error: any) {
      // On 401 and we have a refresh token, attempt refresh then retry once
      if (error.status === 401 && !options.skipAuth && getRefreshToken()) {
        const refreshed = await this.tryRefreshToken();
        if (refreshed) {
          const retryResponse = await doRequest();
          return this.handleResponse<T>(retryResponse);
        }
      }
      // If no refresh token or refresh failed, clear tokens and throw
      if (error.status === 401) {
        clearTokens();
      }
      throw error;
    }
  }

  async get<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    return this.requestWithRetry<T>('GET', endpoint, undefined, options);
  }

  async post<T>(endpoint: string, data?: unknown, options: RequestOptions = {}): Promise<T> {
    return this.requestWithRetry<T>('POST', endpoint, data, options);
  }

  async put<T>(endpoint: string, data?: unknown, options: RequestOptions = {}): Promise<T> {
    return this.requestWithRetry<T>('PUT', endpoint, data, options);
  }

  async patch<T>(endpoint: string, data?: unknown, options: RequestOptions = {}): Promise<T> {
    return this.requestWithRetry<T>('PATCH', endpoint, data, options);
  }

  async delete<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    return this.requestWithRetry<T>('DELETE', endpoint, undefined, options);
  }
}

export const apiClient = new ApiClient(API_URL);
export default apiClient;
