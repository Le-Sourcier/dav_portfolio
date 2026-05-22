import { useQuery } from '@tanstack/react-query';
import { analyticsApi, type TrafficPeriod } from '@/services/api';

export const analyticsKeys = {
  all: ['analytics'] as const,
  traffic: (period: TrafficPeriod) => [...analyticsKeys.all, 'traffic', period] as const,
  activity: () => [...analyticsKeys.all, 'activity'] as const,
};

export function useTrafficAnalytics(period: TrafficPeriod) {
  return useQuery({
    queryKey: analyticsKeys.traffic(period),
    queryFn: () => analyticsApi.getTraffic(period),
    staleTime: 60 * 1000,
    refetchInterval: 2 * 60 * 1000,
  });
}

export function useWeeklyActivityAnalytics() {
  return useQuery({
    queryKey: analyticsKeys.activity(),
    queryFn: () => analyticsApi.getWeeklyActivity(),
    staleTime: 60 * 1000,
    refetchInterval: 2 * 60 * 1000,
  });
}
