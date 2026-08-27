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
  let apiUrl = process.env.NEXT_PUBLIC_API_URL?.trim() || 'https://erp-software-backend-ubdi.onrender.com';
  apiUrl = apiUrl.replace(/\/+$/, '');
  if (!apiUrl.endsWith('/api')) {
    apiUrl = `${apiUrl}/api`;
  }
  
  try {
    const res = await fetch(`${apiUrl}/settings/public`, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
      },
    });
    if (res.ok) {
      const json = await res.json();
      const data = json.data || json;
      if (data && typeof data === 'object') {
        return {
          business_name: data.business_name || 'ব্যবসারথি',
          business_logo: data.business_logo || '',
          business_phone: data.business_phone || '',
          business_email: data.business_email || '',
          business_address: data.business_address || '',
          business_website: data.business_website || '',
          currency_symbol: data.currency_symbol || '৳',
        };
      }
    }
  } catch {
    // Fallback to configured settings
  }

  return {
    business_name: 'ব্যবসারথি',
    business_logo: '',
    currency_symbol: '৳',
  };
}
