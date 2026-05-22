import { apiClient } from "./client";

export interface TrackPageViewPayload {
  path: string;
  title?: string;
  referrer?: string;
  locale?: string;
  visitorId?: string;
}

export const analyticsApi = {
  trackPageView(payload: TrackPageViewPayload) {
    return apiClient.post<{ id: string }>("/analytics/page-view", payload);
  },
};
