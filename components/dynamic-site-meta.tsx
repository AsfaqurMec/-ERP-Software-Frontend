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

    // 1. Dynamic Favicon: safely mutate href on existing links without calling remove() or removeChild()
    if (bLogo) {
      const iconLinks = document.querySelectorAll<HTMLLinkElement>(
        "link[rel='icon'], link[rel='shortcut icon'], link[rel='apple-touch-icon']"
      );
      if (iconLinks.length > 0) {
        iconLinks.forEach((link) => {
          if (link.href !== bLogo) {
            link.href = bLogo;
          }
        });
      }
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
