import { apiClient } from './client';
import type { TrafficAnalyticsPoint, WeeklyActivityPoint } from '@/types/admin.types';

export type TrafficPeriod = '7d' | '30d' | '12m';

export const analyticsApi = {
  getTraffic(period: TrafficPeriod = '12m') {
    return apiClient.get<TrafficAnalyticsPoint[]>(`/analytics/traffic?period=${period}`);
  },
  getWeeklyActivity() {
    return apiClient.get<WeeklyActivityPoint[]>('/analytics/activity');
  },
};
