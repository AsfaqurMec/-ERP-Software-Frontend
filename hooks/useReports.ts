import { useQuery } from '@tanstack/react-query';
import { reportService } from '../services/reportService';

export function useDailyReport(date?: string) {
  return useQuery({
    queryKey: ['report', 'daily', date],
    queryFn: () => reportService.getDaily(date),
  });
}

export function useMonthlyReport(year?: number, month?: number) {
  return useQuery({
    queryKey: ['report', 'monthly', year, month],
    queryFn: () => reportService.getMonthly(year, month),
  });
}

export function useYearlyReport(year?: number) {
  return useQuery({
    queryKey: ['report', 'yearly', year],
    queryFn: () => reportService.getYearly(year),
  });
}

export function useSalesReport(from?: string, to?: string) {
  return useQuery({
    queryKey: ['report', 'sales', from, to],
    queryFn: () => reportService.getSales(from, to),
  });
}

export function usePurchasesReport(from?: string, to?: string) {
  return useQuery({
    queryKey: ['report', 'purchases', from, to],
    queryFn: () => reportService.getPurchases(from, to),
  });
}

export function useInventoryReport() {
  return useQuery({
    queryKey: ['report', 'inventory'],
    queryFn: () => reportService.getInventory(),
  });
}
