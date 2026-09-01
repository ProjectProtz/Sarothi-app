/**
 * i18n system for Sakhi.
 *
 * HOW TO ADD A NEW STRING (for Tasks B/C/D/E/F):
 *   1. Add the key+value to src/lib/i18n/locales/en.json
 *   2. Add the SAME key+value (translated) to src/lib/i18n/locales/as.json
 *   3. Use it in a component: const { t } = useTranslation(); t('your.key')
 *
 * HOW TO ADD A NEW LANGUAGE:
 *   1. Create src/lib/i18n/locales/<code>.json with all keys
 *   2. Add the code to SupportedLanguage type below
 *   3. Add display name to LANGUAGE_LABELS
 *   4. Import and register in the locales map below
 */

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import enStrings from './locales/en.json';
import asStrings from './locales/as.json';
import { setActiveLang } from '@/lib/voice';

// --- Types -------------------------------------------------------------------

/** Supported language codes. Extend this union to add more languages. */
export type SupportedLanguage = 'en' | 'as';

/** All valid translation keys, derived from the English locale file. */
export type TranslationKey = keyof typeof enStrings;

type Translations = Record<string, string>;

interface I18nContextValue {
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
  t: (key: TranslationKey, fallback?: string) => string;
}

// --- Constants ---------------------------------------------------------------

const STORAGE_KEY = 'sakhi_language';
const DEFAULT_LANGUAGE: SupportedLanguage = 'en';

/** Human-readable display names for the language selector. */
export const LANGUAGE_LABELS: Record<SupportedLanguage, string> = {
  en: 'English',
  as: 'অসমীয়া',
};

const locales: Record<SupportedLanguage, Translations> = {
  en: enStrings as Translations,
  as: asStrings as Translations,
};

// --- Context -----------------------------------------------------------------

const I18nContext = createContext<I18nContextValue | null>(null);

// --- Provider ----------------------------------------------------------------

function loadPersistedLanguage(): SupportedLanguage {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && stored in locales) {
      return stored as SupportedLanguage;
    }
  } catch {
    // localStorage unavailable (private browsing etc.) — fall through to default
  }
  return DEFAULT_LANGUAGE;
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<SupportedLanguage>(
    loadPersistedLanguage
  );

  const setLanguage = useCallback((lang: SupportedLanguage) => {
    setLanguageState(lang);
    setActiveLang(lang); // Keep TTS singleton in sync with UI language
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Ignore storage errors — language selection still works for the session
    }
  }, []);

  /** Translate a key. Falls back to the English string, then the fallback arg, then the key itself. */
  const t = useCallback(
    (key: TranslationKey, fallback?: string): string => {
      const currentLocale = locales[language];
      return (
        currentLocale[key] ??
        locales[DEFAULT_LANGUAGE][key] ??
        fallback ??
        key
      );
    },
    [language]
  );

  // Update the HTML lang attribute when language changes (accessibility + SEO)
  // Also keep TTS module in sync on initial mount (persisted language may not be 'en').
  useEffect(() => {
    document.documentElement.lang = language;
    setActiveLang(language);
  }, [language]);

  const value = useMemo(
    () => ({ language, setLanguage, t }),
    [language, setLanguage, t]
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

// --- Hook --------------------------------------------------------------------

/**
 * useTranslation — get the translate function and language controls.
 *
 * @example
 * const { t, language, setLanguage } = useTranslation();
 * return <h1>{t('home.greeting')}</h1>;
 */
export function useTranslation(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useTranslation must be used inside <I18nProvider>');
  }
  return ctx;
}
