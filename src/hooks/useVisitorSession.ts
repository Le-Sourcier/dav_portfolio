import { useState, useCallback } from 'react';
import { hasConsented } from './useCookieConsent';
import { visitorApi } from '@/services/api';

// ======================== TYPES ========================

export interface VisitorSession {
  name: string;
  email: string;
  token: string | null;
  verified: boolean;
}

export type OtpStatus = 'idle' | 'sending' | 'sent' | 'verifying' | 'error';

// ======================== STORAGE ========================

const STORAGE_KEY = 'visitor_session';
const PERSIST_KEY = 'visitor_session_persist';
const TOKEN_KEY = 'visitor_token';

function isPersisted(): boolean {
  try {
    return localStorage.getItem(PERSIST_KEY) === 'true';
  } catch {
    return false;
  }
}

function getStorage(): Storage {
  return isPersisted() ? localStorage : sessionStorage;
}

function getStoredSession(): VisitorSession | null {
  try {
    if (!hasConsented()) return null;
    const raw = localStorage.getItem(STORAGE_KEY) || sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed?.name || !parsed?.email) return null;

    // Check if token exists
    const token = localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
    return {
      name: parsed.name,
      email: parsed.email,
      token: token || null,
      verified: !!token,
    };
  } catch {
    return null;
  }
}

function storeSession(data: { name: string; email: string }, token: string | null, remember: boolean): void {
  if (!hasConsented()) return;

  const sessionData = JSON.stringify({ name: data.name, email: data.email });

  if (remember) {
    localStorage.setItem(PERSIST_KEY, 'true');
    localStorage.setItem(STORAGE_KEY, sessionData);
    if (token) localStorage.setItem(TOKEN_KEY, token);
    sessionStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(TOKEN_KEY);
  } else {
    localStorage.removeItem(PERSIST_KEY);
    localStorage.removeItem(STORAGE_KEY);
    localStorage.removeItem(TOKEN_KEY);
    sessionStorage.setItem(STORAGE_KEY, sessionData);
    if (token) sessionStorage.setItem(TOKEN_KEY, token);
  }
}

function clearStoredSession(): void {
  sessionStorage.removeItem(STORAGE_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(PERSIST_KEY);
}

// ======================== HOOK ========================

export function useVisitorSession() {
  const [session, setSession] = useState<VisitorSession | null>(getStoredSession);
  const [otpStatus, setOtpStatus] = useState<OtpStatus>('idle');
  const [otpError, setOtpError] = useState<string | null>(null);

  // Request OTP — sends code to email
  const requestOtp = useCallback(async (email: string, name: string) => {
    setOtpStatus('sending');
    setOtpError(null);
    try {
      await visitorApi.requestOtp(email, name);
      // Store name/email locally (not verified yet)
      setSession({ name, email, token: null, verified: false });
      setOtpStatus('sent');
    } catch (err: any) {
      setOtpError(err.message || "Impossible d'envoyer le code");
      setOtpStatus('error');
    }
  }, []);

  // Verify OTP — validates code and gets JWT
  const verifyOtp = useCallback(async (code: string, remember: boolean) => {
    if (!session) return;
    setOtpStatus('verifying');
    setOtpError(null);
    try {
      const { token } = await visitorApi.verifyOtp(session.email, code, session.name, remember);
      storeSession({ name: session.name, email: session.email }, token, remember);
      setSession({ ...session, token, verified: true });
      setOtpStatus('idle');
    } catch (err: any) {
      setOtpError(err.message || 'Code invalide ou expire');
      setOtpStatus('error');
    }
  }, [session]);

  // Quick save — for backward compat, stores session without OTP (pre-verification)
  const saveSession = useCallback((data: { name: string; email: string }, remember = false) => {
    storeSession(data, null, remember);
    setSession({ ...data, token: null, verified: false });
  }, []);

  const clearSession = useCallback(() => {
    clearStoredSession();
    setSession(null);
    setOtpStatus('idle');
    setOtpError(null);
  }, []);

  return {
    session,
    isIdentified: !!session?.name && !!session?.email,
    isVerified: !!session?.verified && !!session?.token,
    needsReverification: !!session?.email && !session?.verified,
    isPersisted: isPersisted(),
    otpStatus,
    otpError,
    requestOtp,
    verifyOtp,
    saveSession,
    clearSession,
  };
}
