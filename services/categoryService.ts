import { api } from '../lib/api';

export const categoryService = {
  getAll: () => api<any[]>('/categories'),
  getById: (id: string) => api<any>(`/categories/${id}`),
  create: (data: any) =>
    api<any>('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: any) =>
    api<any>(`/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),
};
