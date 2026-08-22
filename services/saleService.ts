import { api } from '../lib/api';

export interface SaleQuery {
  page?: number;
  limit?: number;
  search?: string;
  customerId?: string;
  status?: string;
  paymentStatus?: string;
  sortBy?: string;
  sortOrder?: string;
}

export const saleService = {
  getAll: (params?: SaleQuery) => {
    const sp = new URLSearchParams();
    if (params?.page) sp.set('page', String(params.page));
    if (params?.limit) sp.set('limit', String(params.limit));
    if (params?.search) sp.set('search', params.search);
    if (params?.customerId) sp.set('customerId', params.customerId);
    if (params?.status) sp.set('status', params.status);
    if (params?.paymentStatus) sp.set('paymentStatus', params.paymentStatus);
    if (params?.sortBy) sp.set('sortBy', params.sortBy);
    if (params?.sortOrder) sp.set('sortOrder', params.sortOrder);
    const qs = sp.toString();
    return api<any>(`/sales${qs ? `?${qs}` : ''}`);
  },

  getById: (id: string) => api<any>(`/sales/${id}`),

  create: (data: any) =>
    api<any>('/sales', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  cancel: (id: string) =>
    api<any>(`/sales/${id}/cancel`, {
      method: 'POST',
    }),

  getReturns: (params?: { page?: number; limit?: number }) => {
    const sp = new URLSearchParams();
    if (params?.page) sp.set('page', String(params.page));
    if (params?.limit) sp.set('limit', String(params.limit));
    const qs = sp.toString();
    return api<any>(`/sales/returns${qs ? `?${qs}` : ''}`);
  },

  getReturnById: (id: string) => api<any>(`/sales/returns/${id}`),

  createReturn: (data: any) =>
    api<any>('/sales/returns', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
