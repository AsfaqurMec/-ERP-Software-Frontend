import { api } from '../lib/api';

export interface PaymentQuery {
  page?: number;
  limit?: number;
  search?: string;
  partyType?: string;
  partyId?: string;
  method?: string;
  sortBy?: string;
  sortOrder?: string;
}

export const paymentService = {
  getAll: (params?: PaymentQuery) => {
    const sp = new URLSearchParams();
    if (params?.page) sp.set('page', String(params.page));
    if (params?.limit) sp.set('limit', String(params.limit));
    if (params?.search) sp.set('search', params.search);
    if (params?.partyType) sp.set('partyType', params.partyType);
    if (params?.partyId) sp.set('partyId', params.partyId);
    if (params?.method) sp.set('method', params.method);
    if (params?.sortBy) sp.set('sortBy', params.sortBy);
    if (params?.sortOrder) sp.set('sortOrder', params.sortOrder);
    const qs = sp.toString();
    return api<any>(`/payments${qs ? `?${qs}` : ''}`);
  },

  getOverview: () => api<any>('/payments/overview'),

  record: (data: any) =>
    api<any>('/payments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
