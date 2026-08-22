'use client';

import { useEffect } from 'react';
import { useSiteSettings } from '../hooks/use-site-settings';

export function DynamicSiteMeta() {
  const { data: settings } = useSiteSettings();

  useEffect(() => {
    if (!settings) return;

    // 1. Dynamic Favicon from Business Logo (Cloudinary or custom URL)
    const logoUrl = settings.business_logo;
    if (logoUrl && typeof document !== 'undefined') {
      let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.head.appendChild(link);
      }
      link.href = logoUrl;

      let appleLink: HTMLLinkElement | null = document.querySelector("link[rel='apple-touch-icon']");
      if (!appleLink) {
        appleLink = document.createElement('link');
        appleLink.rel = 'apple-touch-icon';
        document.head.appendChild(appleLink);
      }
      appleLink.href = logoUrl;
    }

    // 2. Dynamic Title suffix from Business Name
    if (settings.business_name && typeof document !== 'undefined') {
      const currentTitle = document.title;
      if (!currentTitle || currentTitle.includes('StockPilot')) {
        // preserve specific page prefix if any, or update default
        if (currentTitle.includes('|')) {
          const parts = currentTitle.split('|');
          document.title = `${parts[0].trim()} | ${settings.business_name}`;
        }
      }
    }
  }, [settings]);

  return null;
}
