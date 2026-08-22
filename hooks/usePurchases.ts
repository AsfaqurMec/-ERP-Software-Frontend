import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { purchaseService, type PurchaseQuery } from '../services/purchaseService';

export function usePurchases(params?: PurchaseQuery) {
  return useQuery({
    queryKey: ['purchases', params],
    queryFn: () => purchaseService.getAll(params),
  });
}

export function usePurchase(id: string) {
  return useQuery({
    queryKey: ['purchase', id],
    queryFn: () => purchaseService.getById(id),
    enabled: Boolean(id),
  });
}

export function useCreatePurchase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => purchaseService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
}

export function useCancelPurchase() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => purchaseService.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
    },
  });
}

export function usePurchaseReturns(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['purchase-returns', params],
    queryFn: () => purchaseService.getReturns(params),
  });
}

export function usePurchaseReturn(id: string) {
  return useQuery({
    queryKey: ['purchase-return', id],
    queryFn: () => purchaseService.getReturnById(id),
    enabled: Boolean(id),
  });
}

export function useCreatePurchaseReturn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => purchaseService.createReturn(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['purchase-returns'] });
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
}
