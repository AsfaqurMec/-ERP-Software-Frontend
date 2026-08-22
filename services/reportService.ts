import { api } from '../lib/api';

export const reportService = {
  getSummary: (from?: string, to?: string) => {
    const sp = new URLSearchParams();
    if (from) sp.set('from', from);
    if (to) sp.set('to', to);
    const qs = sp.toString();
    return api<any>(`/reports/summary${qs ? `?${qs}` : ''}`);
  },

  getDaily: (date?: string) => {
    const sp = new URLSearchParams();
    if (date) sp.set('date', date);
    const qs = sp.toString();
    return api<any>(`/reports/daily${qs ? `?${qs}` : ''}`);
  },

  getMonthly: (year?: number, month?: number) => {
    const sp = new URLSearchParams();
    if (year) sp.set('year', String(year));
    if (month !== undefined) sp.set('month', String(month));
    const qs = sp.toString();
    return api<any>(`/reports/monthly${qs ? `?${qs}` : ''}`);
  },

  getYearly: (year?: number) => {
    const sp = new URLSearchParams();
    if (year) sp.set('year', String(year));
    const qs = sp.toString();
    return api<any>(`/reports/yearly${qs ? `?${qs}` : ''}`);
  },

  getSales: (from?: string, to?: string) => {
    const sp = new URLSearchParams();
    if (from) sp.set('from', from);
    if (to) sp.set('to', to);
    const qs = sp.toString();
    return api<any>(`/reports/sales${qs ? `?${qs}` : ''}`);
  },

  getPurchases: (from?: string, to?: string) => {
    const sp = new URLSearchParams();
    if (from) sp.set('from', from);
    if (to) sp.set('to', to);
    const qs = sp.toString();
    return api<any>(`/reports/purchases${qs ? `?${qs}` : ''}`);
  },

  getInventory: () => api<any>('/reports/inventory'),
};
