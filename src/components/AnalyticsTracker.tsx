"use client";

import { useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import { usePathname, useSearchParams } from "next/navigation";
import { analyticsApi } from "@/services/api/analytics.api";
import { getOrCreateAnalyticsVisitorId, useCookieConsent } from "@/hooks/useCookieConsent";

export function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const { preferences } = useCookieConsent();
  const lastTracked = useRef<string | null>(null);

  useEffect(() => {
    if (!preferences.analytics) return;

    const search = searchParams.toString();
    const path = search ? `${pathname}?${search}` : pathname;
    if (lastTracked.current === path) return;
    lastTracked.current = path;

    analyticsApi
      .trackPageView({
        path,
        title: document.title,
        referrer: document.referrer || undefined,
        locale,
        visitorId: getOrCreateAnalyticsVisitorId(),
      })
      .catch(() => {
        lastTracked.current = null;
      });
  }, [locale, pathname, preferences.analytics, searchParams]);

  return null;
}
