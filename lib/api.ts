import { formatCurrency, formatNumber, formatDate, formatDateTime, formatPercentage } from './format';

export { formatCurrency, formatNumber, formatDate, formatDateTime, formatPercentage };

export function getApiBaseUrl(): string {
  let url = process.env.NEXT_PUBLIC_API_URL?.trim() || 'https://erp-software-backend-ubdi.onrender.com';
  url = url.replace(/\/+$/, '');
  if (!url.endsWith('/api')) {
    url = `${url}/api`;
  }
  return url;
}

export function extractItems<T = any>(res: any): T[] {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  if (Array.isArray(res.items)) return res.items;
  return [];
}

export async function api<T = any>(path: string, options: RequestInit = {}): Promise<T> {
  const base = getApiBaseUrl();
  const token = typeof window === 'undefined' ? null : localStorage.getItem('token');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  let response: Response;
  try {
    response = await fetch(`${base}${cleanPath}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    });
  } catch (err: any) {
    throw new Error(err?.message || 'Network connection to backend server failed');
  }

  let data: any;
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    try {
      data = await response.json();
    } catch {
      data = null;
    }
  } else {
    data = await response.text();
  }

  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
    throw new Error((data && typeof data === 'object' && data.message) || 'Session expired. Please log in again.');
  }

  if (!response.ok || (data && typeof data === 'object' && data.success === false)) {
    const msg =
      (data && typeof data === 'object' && (data.message || data.error?.code)) ||
      `Request failed with status ${response.status}`;
    throw new Error(msg);
  }

  // Transparently unwrap standardized ApiResponse { success: true, data: ... }
  if (data && typeof data === 'object' && 'success' in data && 'data' in data) {
    return data.data as T;
  }

  return data as T;
}

export const money = (v: any, lang?: string) => formatCurrency(Number(v) || 0, 'BDT', lang);
