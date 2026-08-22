import { api } from '../lib/api';

export interface ExpenseQuery {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  paymentMethod?: string;
  from?: string;
  to?: string;
  sortBy?: string;
  sortOrder?: string;
}

export const expenseService = {
  getAll: (params?: ExpenseQuery) => {
    const sp = new URLSearchParams();
    if (params?.page) sp.set('page', String(params.page));
    if (params?.limit) sp.set('limit', String(params.limit));
    if (params?.search) sp.set('search', params.search);
    if (params?.category) sp.set('category', params.category);
    if (params?.paymentMethod) sp.set('paymentMethod', params.paymentMethod);
    if (params?.from) sp.set('from', params.from);
    if (params?.to) sp.set('to', params.to);
    if (params?.sortBy) sp.set('sortBy', params.sortBy);
    if (params?.sortOrder) sp.set('sortOrder', params.sortOrder);
    const qs = sp.toString();
    return api<any>(`/expenses${qs ? `?${qs}` : ''}`);
  },

  create: (data: any) =>
    api<any>('/expenses', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
