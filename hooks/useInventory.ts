import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { inventoryService } from '../services/inventoryService';

export function useInventoryOverview() {
  return useQuery({
    queryKey: ['inventory', 'overview'],
    queryFn: () => inventoryService.getOverview(),
  });
}

export function useStockMovements(params?: { page?: number; limit?: number; productId?: string; type?: string }) {
  return useQuery({
    queryKey: ['inventory', 'movements', params],
    queryFn: () => inventoryService.getMovements(params),
  });
}

export function useCreateAdjustment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => inventoryService.createAdjustment(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventory'] });
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
  });
}
