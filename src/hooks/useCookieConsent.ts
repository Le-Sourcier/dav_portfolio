"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

export interface CookiePreferences {
  essential: true;
  analytics: boolean;
}

export type CookieConsentChoice = "all" | "essential" | null;

const CONSENT_COOKIE = "ydl_cookie_consent_v1";
const VISITOR_COOKIE = "ydl_analytics_visitor_id";
const CHANGE_EVENT = "ydl-cookie-consent-changed";
const ONE_YEAR = 60 * 60 * 24 * 365;

function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const value = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")[1];
  return value ? decodeURIComponent(value) : null;
}

function writeCookie(name: string, value: string, maxAge = ONE_YEAR) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

function deleteCookie(name: string) {
  document.cookie = `${name}=; path=/; max-age=0; SameSite=Lax`;
}

function getStoredConsent(): CookieConsentChoice {
  if (typeof window === "undefined") return null;
  try {
    const raw = readCookie(CONSENT_COOKIE);
    if (raw === "all" || raw === "essential") return raw;
    return null;
  } catch {
    return null;
  }
}

function emitChange() {
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function useCookieConsent() {
  const [consent, setConsent] = useState<CookieConsentChoice>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => {
      setConsent(getStoredConsent());
      setReady(true);
    };

    sync();
    window.addEventListener(CHANGE_EVENT, sync);
    window.addEventListener("storage", sync);

    return () => {
      window.removeEventListener(CHANGE_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const accept = useCallback((choice: Exclude<CookieConsentChoice, null>) => {
    writeCookie(CONSENT_COOKIE, choice);
    if (choice === "essential") {
      deleteCookie(VISITOR_COOKIE);
    }
    setConsent(choice);
    emitChange();
  }, []);

  const reset = useCallback(() => {
    deleteCookie(CONSENT_COOKIE);
    deleteCookie(VISITOR_COOKIE);
    setConsent(null);
    emitChange();
  }, []);

  const preferences = useMemo<CookiePreferences>(
    () => ({
      essential: true,
      analytics: consent === "all",
    }),
    [consent],
  );

  return {
    consent,
    isReady: ready,
    hasConsented: ready && consent !== null,
    preferences,
    accept,
    reset,
  };
}

export function getCookiePreferences(): CookiePreferences {
  const consent = getStoredConsent();
  return {
    essential: true,
    analytics: consent === "all",
  };
}

export function getOrCreateAnalyticsVisitorId(): string {
  try {
    const current = readCookie(VISITOR_COOKIE);
    if (current) return current;
    const next = crypto.randomUUID();
    writeCookie(VISITOR_COOKIE, next);
    return next;
  } catch {
    return "session";
  }
}
