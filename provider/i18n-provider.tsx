'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { I18nextProvider, useTranslation } from 'react-i18next';
import i18n from './i18n';

export type LanguageCode = 'en' | 'bn';

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  toggleLanguage: () => void;
  isBengali: boolean;
  isEnglish: boolean;
}

const LanguageContext = createContext<LanguageContextType>({
  language: 'en',
  setLanguage: () => {},
  toggleLanguage: () => {},
  isBengali: false,
  isEnglish: true,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLangState] = useState<LanguageCode>('en');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem('app_lang') as LanguageCode;
      if (saved === 'bn' || saved === 'en') {
        setLangState(saved);
        if (i18n.language !== saved) {
          i18n.changeLanguage(saved);
        }
        document.documentElement.lang = saved;
      }
    } catch {}
  }, []);

  const handleSetLanguage = (lang: LanguageCode) => {
    setLangState(lang);
    i18n.changeLanguage(lang);
    try {
      localStorage.setItem('app_lang', lang);
      document.documentElement.lang = lang;
    } catch {}
  };

  const toggleLanguage = () => {
    const nextLang = language === 'en' ? 'bn' : 'en';
    handleSetLanguage(nextLang);
  };

  const contextValue: LanguageContextType = {
    language,
    setLanguage: handleSetLanguage,
    toggleLanguage,
    isBengali: language === 'bn',
    isEnglish: language === 'en',
  };

  return (
    <I18nextProvider i18n={i18n}>
      <LanguageContext.Provider value={contextValue}>
        {children}
      </LanguageContext.Provider>
    </I18nextProvider>
  );
}

export function useAppLanguage() {
  return useContext(LanguageContext);
}

export { useTranslation };
