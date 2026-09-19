import { useContext } from 'react';
import { authContext } from '@/contexts/authContextValue';

export function useAuth() {
  const context = useContext(authContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
