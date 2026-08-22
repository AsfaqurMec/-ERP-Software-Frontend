import { api } from '../lib/api';

export const analyticsService = {
  getDashboard: (params?: { timeframe?: string; from?: string; to?: string }) => {
    const sp = new URLSearchParams();
    if (params?.timeframe) sp.set('timeframe', params.timeframe);
    if (params?.from) sp.set('from', params.from);
    if (params?.to) sp.set('to', params.to);
    const qs = sp.toString();
    return api<any>(`/analytics/dashboard${qs ? `?${qs}` : ''}`);
  },

  getDeepAnalytics: (params?: { timeframe?: string; from?: string; to?: string }) => {
    const sp = new URLSearchParams();
    if (params?.timeframe) sp.set('timeframe', params.timeframe);
    if (params?.from) sp.set('from', params.from);
    if (params?.to) sp.set('to', params.to);
    const qs = sp.toString();
    return api<any>(`/analytics/deep${qs ? `?${qs}` : ''}`);
  },
};
