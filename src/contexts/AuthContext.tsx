import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi, getToken, clearTokens } from '@/services/api';
import type { LoginCredentials, AuthState } from '@/types/admin.types';
import { authContext } from './authContextValue';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: getToken(),
    isAuthenticated: false,
    isLoading: true,
  });

  const navigate = useNavigate();

  const checkAuth = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
      return;
    }

    try {
      const user = await authApi.getProfile();
      setState({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      clearTokens();
      setState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (credentials: LoginCredentials) => {
    setState((prev) => ({ ...prev, isLoading: true }));
    try {
      const response = await authApi.login(credentials);
      setState({
        user: response.user,
        token: response.token,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (error) {
      setState((prev) => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      clearTokens();
      setState({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      });
      navigate('/admin/login');
    }
  };

  return (
    <authContext.Provider
      value={{
        ...state,
        login,
        logout,
        checkAuth,
      }}
    >
      {children}
    </authContext.Provider>
  );
}
