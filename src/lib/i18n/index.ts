/**
 * Barrel export for the i18n module.
 * Import everything via: import { useTranslation, I18nProvider } from '@/lib/i18n';
 */
export {
  I18nProvider,
  useTranslation,
  LANGUAGE_LABELS,
  type SupportedLanguage,
  type TranslationKey,
} from './i18nContext';
