'use client';

import React, { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { LanguageProvider } from '../provider';
import { DynamicSiteMeta } from './dynamic-site-meta';

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient());

  // Globally disable mouse wheel scroll changing number input values across all forms
  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      const active = document.activeElement as HTMLInputElement | null;
      if (active && active.tagName === 'INPUT' && active.type === 'number') {
        active.blur();
      }
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => window.removeEventListener('wheel', handleWheel);
  }, []);

  return (
    <LanguageProvider>
      <QueryClientProvider client={client}>
        <DynamicSiteMeta />
        {children}
      </QueryClientProvider>
    </LanguageProvider>
  );
}
