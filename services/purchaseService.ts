import { api } from '../lib/api';

export interface PurchaseQuery {
  page?: number;
  limit?: number;
  search?: string;
  supplierId?: string;
  status?: string;
  paymentStatus?: string;
  sortBy?: string;
  sortOrder?: string;
}

export const purchaseService = {
  getAll: (params?: PurchaseQuery) => {
    const sp = new URLSearchParams();
    if (params?.page) sp.set('page', String(params.page));
    if (params?.limit) sp.set('limit', String(params.limit));
    if (params?.search) sp.set('search', params.search);
    if (params?.supplierId) sp.set('supplierId', params.supplierId);
    if (params?.status) sp.set('status', params.status);
    if (params?.paymentStatus) sp.set('paymentStatus', params.paymentStatus);
    if (params?.sortBy) sp.set('sortBy', params.sortBy);
    if (params?.sortOrder) sp.set('sortOrder', params.sortOrder);
    const qs = sp.toString();
    return api<any>(`/purchases${qs ? `?${qs}` : ''}`);
  },

  getById: (id: string) => api<any>(`/purchases/${id}`),

  create: (data: any) =>
    api<any>('/purchases', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  cancel: (id: string) =>
    api<any>(`/purchases/${id}/cancel`, {
      method: 'POST',
    }),

  getReturns: (params?: { page?: number; limit?: number }) => {
    const sp = new URLSearchParams();
    if (params?.page) sp.set('page', String(params.page));
    if (params?.limit) sp.set('limit', String(params.limit));
    const qs = sp.toString();
    return api<any>(`/purchases/returns${qs ? `?${qs}` : ''}`);
  },

  getReturnById: (id: string) => api<any>(`/purchases/returns/${id}`),

  createReturn: (data: any) =>
    api<any>('/purchases/returns', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
