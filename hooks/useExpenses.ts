import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { expenseService, type ExpenseQuery } from '../services/expenseService';

export function useExpenses(params?: ExpenseQuery) {
  return useQuery({
    queryKey: ['expenses', params],
    queryFn: () => expenseService.getAll(params),
  });
}

export function useRecordExpense() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => expenseService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      queryClient.invalidateQueries({ queryKey: ['reports'] });
    },
  });
}
