import { api } from '../lib/api';

export interface CustomerQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: string;
}

export const customerService = {
  getAll: (params?: CustomerQuery) => {
    const sp = new URLSearchParams();
    if (params?.page) sp.set('page', String(params.page));
    if (params?.limit) sp.set('limit', String(params.limit));
    if (params?.search) sp.set('search', params.search);
    if (params?.status) sp.set('status', params.status);
    if (params?.sortBy) sp.set('sortBy', params.sortBy);
    if (params?.sortOrder) sp.set('sortOrder', params.sortOrder);
    const qs = sp.toString();
    return api<any>(`/customers${qs ? `?${qs}` : ''}`);
  },

  getById: (id: string) => api<any>(`/customers/${id}`),

  create: (data: any) =>
    api<any>('/customers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    api<any>(`/customers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};
