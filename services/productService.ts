import { api } from '../lib/api';

export interface ProductQuery {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  status?: string;
  stockStatus?: string;
  sortBy?: string;
  sortOrder?: string;
}

export const productService = {
  getAll: (params?: ProductQuery) => {
    const sp = new URLSearchParams();
    if (params?.page) sp.set('page', String(params.page));
    if (params?.limit) sp.set('limit', String(params.limit));
    if (params?.search) sp.set('search', params.search);
    if (params?.categoryId) sp.set('categoryId', params.categoryId);
    if (params?.status) sp.set('status', params.status);
    if (params?.stockStatus) sp.set('stockStatus', params.stockStatus);
    if (params?.sortBy) sp.set('sortBy', params.sortBy);
    if (params?.sortOrder) sp.set('sortOrder', params.sortOrder);
    const qs = sp.toString();
    return api<any>(`/products${qs ? `?${qs}` : ''}`);
  },

  getById: (id: string) => api<any>(`/products/${id}`),

  create: (data: any) =>
    api<any>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: any) =>
    api<any>(`/products/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};
