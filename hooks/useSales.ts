import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { saleService, type SaleQuery } from '../services/saleService';

export function useSales(params?: SaleQuery) {
  return useQuery({
    queryKey: ['sales', params],
    queryFn: () => saleService.getAll(params),
  });
}

export function useSale(id: string) {
  return useQuery({
    queryKey: ['sale', id],
    queryFn: () => saleService.getById(id),
    enabled: Boolean(id),
  });
}

export function useCreateSale() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => saleService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
}

export function useCancelSale() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => saleService.cancel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
    },
  });
}

export function useSalesReturns(params?: { page?: number; limit?: number }) {
  return useQuery({
    queryKey: ['sales-returns', params],
    queryFn: () => saleService.getReturns(params),
  });
}

export function useSalesReturn(id: string) {
  return useQuery({
    queryKey: ['sales-return', id],
    queryFn: () => saleService.getReturnById(id),
    enabled: Boolean(id),
  });
}

export function useCreateSalesReturn() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => saleService.createReturn(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales-returns'] });
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
    },
  });
}
