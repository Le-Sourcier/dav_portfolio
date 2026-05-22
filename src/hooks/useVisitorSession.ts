"use client";

import { useCallback, useState } from "react";
import { useVisitorStore } from "@/stores/visitorStore";
import { visitorApi } from "@/services/api/visitor.api";

export type OtpStatus = "idle" | "sending" | "sent" | "verifying" | "error";

interface UseVisitorSessionResult {
  name: string;
  email: string;
  isIdentified: boolean;
  isVerified: boolean;
  needsReverification: boolean;
  remember: boolean;
  otpStatus: OtpStatus;
  otpError: string | null;
  requestOtp: (input: { email: string; name: string }) => Promise<boolean>;
  verifyOtp: (input: { code: string; remember: boolean }) => Promise<boolean>;
  setRemember: (value: boolean) => void;
  clearSession: () => void;
}

export function useVisitorSession(): UseVisitorSessionResult {
  const { name, email, token, remember, setIdentity, setToken, reset } = useVisitorStore();
  const [otpStatus, setOtpStatus] = useState<OtpStatus>("idle");
  const [otpError, setOtpError] = useState<string | null>(null);
  const [localRemember, setLocalRemember] = useState(remember);

  const requestOtp = useCallback(
    async ({ email: nextEmail, name: nextName }: { email: string; name: string }) => {
      setOtpStatus("sending");
      setOtpError(null);
      try {
        await visitorApi.requestOtp(nextEmail, nextName);
        setIdentity({ email: nextEmail, name: nextName });
        setOtpStatus("sent");
        return true;
      } catch (error) {
        const message = error instanceof Error ? error.message : "Erreur inattendue";
        setOtpError(message);
        setOtpStatus("error");
        return false;
      }
    },
    [setIdentity],
  );

  const verifyOtp = useCallback(
    async ({ code, remember: rememberMe }: { code: string; remember: boolean }) => {
      if (!email || !name) return false;
      setOtpStatus("verifying");
      setOtpError(null);
      try {
        const result = await visitorApi.verifyOtp(email, code, name, rememberMe);
        setToken(result.token, rememberMe);
        setOtpStatus("idle");
        return true;
      } catch (error) {
        const message = error instanceof Error ? error.message : "Code invalide";
        setOtpError(message);
        setOtpStatus("error");
        return false;
      }
    },
    [email, name, setToken],
  );

  const clearSession = useCallback(() => {
    reset();
    setOtpStatus("idle");
    setOtpError(null);
    setLocalRemember(false);
  }, [reset]);

  const setRemember = useCallback((value: boolean) => {
    setLocalRemember(value);
  }, []);

  return {
    name,
    email,
    isIdentified: Boolean(name && email),
    isVerified: Boolean(token),
    needsReverification: Boolean(email && !token),
    remember: localRemember,
    otpStatus,
    otpError,
    requestOtp,
    verifyOtp,
    setRemember,
    clearSession,
  };
}
