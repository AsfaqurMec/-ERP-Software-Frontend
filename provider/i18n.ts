import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from './en.json';
import bn from './bn.json';

const getInitialLanguage = (): string => {
  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem('app_lang');
      if (saved === 'bn' || saved === 'en') return saved;
    } catch {}
  }
  return 'en';
};

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources: {
      en: { translation: en },
      bn: { translation: bn },
    },
    lng: getInitialLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // React already escapes values
    },
    react: {
      useSuspense: false,
    },
  });
}

export default i18n;
