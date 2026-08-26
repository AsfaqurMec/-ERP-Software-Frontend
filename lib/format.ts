/**
 * Centralized formatting utilities for currency (BDT / টাকা), numbers, percentages,
 * and dates configured for Bangladesh (Asia/Dhaka).
 * Supports dynamic localization between English ('BDT value') and Bengali ('value টাকা').
 */

import i18n from '../provider/i18n';

const DHAKA_TIMEZONE = 'Asia/Dhaka';

export function getCurrentLanguage(): string {
  if (i18n && i18n.language) {
    return i18n.language;
  }
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('app_lang');
      if (saved === 'bn' || saved === 'en') return saved;
      if (document.documentElement.lang === 'bn' || document.documentElement.lang === 'en') {
        return document.documentElement.lang;
      }
    } catch {}
  }
  return 'en';
}

export function formatCurrency(
  value: number | string | null | undefined,
  currency = 'BDT',
  lang?: string
): string {
  const currentLang = lang || getCurrentLanguage();

  if (value === null || value === undefined || isNaN(Number(value))) {
    return currentLang === 'bn' ? '০ টাকা' : 'BDT 0';
  }

  const num = Number(value);

  if (currentLang === 'bn') {
    const formatted = new Intl.NumberFormat('bn-BD', {
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    }).format(Math.abs(num));

    const sign = num < 0 ? '-' : '';
    if (currency === 'BDT') {
      return `${sign}${formatted} টাকা`;
    }
    return `${sign}${formatted} ${currency}`;
  }

  const formatted = new Intl.NumberFormat('en-BD', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(Math.abs(num));

  const sign = num < 0 ? '-' : '';
  return `${sign}${currency} ${formatted}`;
}

export function formatNumber(
  value: number | string | null | undefined,
  maximumFractionDigits = 2,
  lang?: string
): string {
  const currentLang = lang || getCurrentLanguage();

  if (value === null || value === undefined || isNaN(Number(value))) {
    return currentLang === 'bn' ? '০' : '0';
  }

  return new Intl.NumberFormat(currentLang === 'bn' ? 'bn-BD' : 'en-BD', {
    maximumFractionDigits,
  }).format(Number(value));
}

export function formatDate(date: string | Date | null | undefined, lang?: string): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '—';

  const currentLang = lang || getCurrentLanguage();

  return new Intl.DateTimeFormat(currentLang === 'bn' ? 'bn-BD' : 'en-BD', {
    timeZone: DHAKA_TIMEZONE,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d);
}

export function formatDateTime(date: string | Date | null | undefined, lang?: string): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '—';

  const currentLang = lang || getCurrentLanguage();

  return new Intl.DateTimeFormat(currentLang === 'bn' ? 'bn-BD' : 'en-BD', {
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
  decimals = 1,
  lang?: string
): string {
  const currentLang = lang || getCurrentLanguage();
  if (value === null || value === undefined || isNaN(Number(value))) {
    return currentLang === 'bn' ? '০%' : '0%';
  }
  const formatted = new Intl.NumberFormat(currentLang === 'bn' ? 'bn-BD' : 'en-BD', {
    maximumFractionDigits: decimals,
    minimumFractionDigits: 0,
  }).format(Number(value));
  return `${formatted}%`;
}
