'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { useSiteSettings } from '../hooks/use-site-settings';

export function DynamicSiteMeta() {
  const pathname = usePathname();
  const { data: settings } = useSiteSettings();

  useEffect(() => {
    if (!settings || typeof document === 'undefined') return;

    const bName = settings.business_name?.trim();
    const bLogo = settings.business_logo?.trim();

    // 1. Dynamic Favicon from Business Logo (Cloudinary / Custom URL)
    if (bLogo) {
      const existing = document.querySelectorAll("link[rel*='icon'], link[rel='apple-touch-icon']");
      existing.forEach((node) => node.remove());

      const isSvg = bLogo.toLowerCase().includes('.svg');

      const link = document.createElement('link');
      link.rel = 'icon';
      link.type = isSvg ? 'image/svg+xml' : 'image/png';
      link.href = bLogo;
      document.head.appendChild(link);

      const shortcut = document.createElement('link');
      shortcut.rel = 'shortcut icon';
      shortcut.href = bLogo;
      document.head.appendChild(shortcut);

      const apple = document.createElement('link');
      apple.rel = 'apple-touch-icon';
      apple.href = bLogo;
      document.head.appendChild(apple);
    }

    // 2. Dynamic Title from Business Name
    if (bName) {
      const title = document.title;
      if (title.includes('StockPilot')) {
        document.title = title.replace(/StockPilot/g, bName);
      } else if (!title || title.trim() === '') {
        document.title = `${bName} — Enterprise ERP`;
      }
    }
  }, [pathname, settings]);

  return null;
}
