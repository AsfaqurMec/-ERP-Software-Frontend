import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supplierService, type SupplierQuery } from '../services/supplierService';

export function useSuppliers(params?: SupplierQuery) {
  return useQuery({
    queryKey: ['suppliers', params],
    queryFn: () => supplierService.getAll(params),
  });
}

export function useSupplier(id: string) {
  return useQuery({
    queryKey: ['supplier', id],
    queryFn: () => supplierService.getById(id),
    enabled: Boolean(id),
  });
}

export function useCreateSupplier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => supplierService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
    },
  });
}

export function useUpdateSupplier(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => supplierService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      queryClient.invalidateQueries({ queryKey: ['supplier', id] });
    },
  });
}
