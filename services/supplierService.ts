import { api } from '../lib/api';

export interface SupplierQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  sortBy?: string;
  sortOrder?: string;
}

export const supplierService = {
  getAll: (params?: SupplierQuery) => {
    const sp = new URLSearchParams();
    if (params?.page) sp.set('page', String(params.page));
    if (params?.limit) sp.set('limit', String(params.limit));
    if (params?.search) sp.set('search', params.search);
    if (params?.status) sp.set('status', params.status);
    if (params?.sortBy) sp.set('sortBy', params.sortBy);
    if (params?.sortOrder) sp.set('sortOrder', params.sortOrder);
    const qs = sp.toString();
    return api<any>(`/suppliers${qs ? `?${qs}` : ''}`);
  },

  getById: (id: string) => api<any>(`/suppliers/${id}`),

  create: (data: any) =>
    api<any>('/suppliers', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    api<any>(`/suppliers/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};
