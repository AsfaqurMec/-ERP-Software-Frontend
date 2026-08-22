/**
 * Centralized formatting utilities for currency (BDT / ৳), numbers, percentages,
 * and dates configured for Bangladesh (Asia/Dhaka).
 */

const DHAKA_TIMEZONE = 'Asia/Dhaka';

export function formatCurrency(
  value: number | string | null | undefined,
  currency = 'BDT'
): string {
  if (value === null || value === undefined || isNaN(Number(value))) {
    return '৳ 0';
  }

  return new Intl.NumberFormat('en-BD', {
    style: 'currency',
    currency,
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(Number(value));
}

export function formatNumber(
  value: number | string | null | undefined,
  maximumFractionDigits = 2
): string {
  if (value === null || value === undefined || isNaN(Number(value))) {
    return '0';
  }

  return new Intl.NumberFormat('en-BD', {
    maximumFractionDigits,
  }).format(Number(value));
}

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '—';

  return new Intl.DateTimeFormat('en-BD', {
    timeZone: DHAKA_TIMEZONE,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d);
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '—';

  return new Intl.DateTimeFormat('en-BD', {
    timeZone: DHAKA_TIMEZONE,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export function formatPercentage(
  value: number | string | null | undefined,
  decimals = 1
): string {
  if (value === null || value === undefined || isNaN(Number(value))) {
    return '0%';
  }
  return `${Number(value).toFixed(decimals)}%`;
}
