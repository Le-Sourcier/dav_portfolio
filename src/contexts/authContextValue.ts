import { createContext } from 'react';
import type { AuthState, LoginCredentials } from '@/types/admin.types';

interface AuthContextValue extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const authContext = createContext<AuthContextValue | undefined>(undefined);
