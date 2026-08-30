/**
 * LanguageSelector — accessible language switcher for the Home screen.
 *
 * Renders a button group (not a dropdown) for elderly usability —
 * large tap targets, high contrast, no small dropdown arrow to find.
 */

import { useTranslation, LANGUAGE_LABELS, type SupportedLanguage } from '@/lib/i18n';
import styles from './LanguageSelector.module.css';

export function LanguageSelector() {
  const { language, setLanguage, t } = useTranslation();

  const languages = Object.entries(LANGUAGE_LABELS) as [SupportedLanguage, string][];

  return (
    <div
      className={styles.container}
      role="group"
      aria-label={t('a11y.language.selector')}
    >
      <span className={styles.label} aria-hidden="true">
        🌐
      </span>
      {languages.map(([code, label]) => (
        <button
          key={code}
          id={`lang-btn-${code}`}
          className={`${styles.langBtn} ${language === code ? styles.active : ''}`}
          onClick={() => setLanguage(code)}
          aria-pressed={language === code}
          aria-label={`${t('language.selector.label')}: ${label}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
