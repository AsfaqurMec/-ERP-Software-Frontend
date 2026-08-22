import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { paymentService, type PaymentQuery } from '../services/paymentService';

export function usePayments(params?: PaymentQuery) {
  return useQuery({
    queryKey: ['payments', params],
    queryFn: () => paymentService.getAll(params),
  });
}

export function usePaymentsOverview() {
  return useQuery({
    queryKey: ['payments', 'overview'],
    queryFn: () => paymentService.getOverview(),
  });
}

export function useRecordPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => paymentService.record(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['payments'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['purchases'] });
    },
  });
}
