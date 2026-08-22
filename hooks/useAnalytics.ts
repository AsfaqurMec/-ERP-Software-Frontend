import { useQuery } from '@tanstack/react-query';
import { analyticsService } from '../services/analyticsService';

export function useDashboardAnalytics(params?: { timeframe?: string; from?: string; to?: string }) {
  return useQuery({
    queryKey: ['analytics', 'dashboard', params],
    queryFn: () => analyticsService.getDashboard(params),
  });
}

export function useDeepAnalytics(params?: { timeframe?: string; from?: string; to?: string }) {
  return useQuery({
    queryKey: ['analytics', 'deep', params],
    queryFn: () => analyticsService.getDeepAnalytics(params),
  });
}
