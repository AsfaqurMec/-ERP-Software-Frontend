import { api } from '../lib/api';

export const inventoryService = {
  getOverview: () => api<any>('/inventory/overview'),

  getMovements: (params?: { page?: number; limit?: number; productId?: string; type?: string }) => {
    const sp = new URLSearchParams();
    if (params?.page) sp.set('page', String(params.page));
    if (params?.limit) sp.set('limit', String(params.limit));
    if (params?.productId) sp.set('productId', params.productId);
    if (params?.type) sp.set('type', params.type);
    const qs = sp.toString();
    return api<any>(`/inventory/movements${qs ? `?${qs}` : ''}`);
  },

  createAdjustment: (data: any) =>
    api<any>('/inventory/adjustments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};
