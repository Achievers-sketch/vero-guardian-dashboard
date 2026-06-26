'use client';

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import en from '@/i18n/locales/en.json';
import es from '@/i18n/locales/es.json';
import fr from '@/i18n/locales/fr.json';

export const supportedLanguages = [
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Espanol' },
  { code: 'fr', label: 'Francais' },
] as const;

export type SupportedLanguage = (typeof supportedLanguages)[number]['code'];

export const defaultLanguage: SupportedLanguage = 'en';
export const languageStorageKey = 'vero.guardian.language';

export function isSupportedLanguage(language: string): language is SupportedLanguage {
  return supportedLanguages.some((supportedLanguage) => supportedLanguage.code === language);
}

export const resources = {
  en: { translation: en },
  es: { translation: es },
  fr: { translation: fr },
} as const;

if (!i18n.isInitialized) {
  i18n.use(initReactI18next).init({
    resources,
    lng: defaultLanguage,
    fallbackLng: defaultLanguage,
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });
}

export default i18n;
