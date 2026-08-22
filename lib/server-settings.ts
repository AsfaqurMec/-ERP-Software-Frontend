export interface ServerBrandSettings {
  business_name: string;
  business_logo: string;
  business_phone?: string;
  business_email?: string;
  business_address?: string;
  business_website?: string;
  currency_symbol?: string;
}

export async function getServerBrandSettings(): Promise<ServerBrandSettings> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://erp-software-backend-ubdi.onrender.com';
  
  try {
    const res = await fetch(`${apiUrl}/api/settings/public`, {
      next: { revalidate: 30 },
    });
    if (res.ok) {
      const json = await res.json();
      const data = json.data || json;
      return {
        business_name: data.business_name || 'StockPilot',
        business_logo: data.business_logo || '',
        business_phone: data.business_phone || '',
        business_email: data.business_email || '',
        business_address: data.business_address || '',
        business_website: data.business_website || '',
        currency_symbol: data.currency_symbol || '৳',
      };
    }
  } catch {
    // Return default branding if backend is unreachable
  }

  return {
    business_name: 'StockPilot',
    business_logo: '',
    currency_symbol: '৳',
  };
}
