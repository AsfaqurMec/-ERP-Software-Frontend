'use client';

import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';

export interface SiteSettings {
  business_name?: string;
  business_logo?: string;
  business_phone?: string;
  business_email?: string;
  business_address?: string;
  business_website?: string;
  business_tax_id?: string;
  currency_symbol?: string;
  invoice_prefix?: string;
  invoice_number_format?: string;
  invoice_footer?: string;
  invoice_terms?: string;
  inventory_default_unit?: string;
  inventory_alert_threshold?: string;
  inventory_negative_stock?: string;
  [key: string]: string | undefined;
}

export function useSiteSettings() {
  return useQuery<SiteSettings>({
    queryKey: ['site-settings'],
    queryFn: async () => {
      try {
        const res = await api<SiteSettings>('/settings/public');
        return res || {};
      } catch {
        try {
          const res = await api<SiteSettings>('/settings');
          return res || {};
        } catch {
          return {
            business_name: 'StockPilot',
            business_logo: '',
            currency_symbol: '৳',
          };
        }
      }
    },
    staleTime: 30000,
  });
}
