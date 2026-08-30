/**
 * PlaceholderScreen — shown for routes not yet built by Task B/D/E.
 * Displays a "coming soon" message with the screen title.
 * All text goes through t() — no hardcoded strings.
 */

import { useNavigate } from 'react-router-dom';
import { useTranslation, type TranslationKey } from '@/lib/i18n';
import styles from './PlaceholderScreen.module.css';

interface PlaceholderScreenProps {
  /** i18n key for the screen title */
  titleKey: TranslationKey;
  /** i18n key for the "coming soon" detail message */
  detailKey: TranslationKey;
  /** Icon/emoji to display */
  icon: string;
}

export function PlaceholderScreen({
  titleKey,
  detailKey,
  icon,
}: PlaceholderScreenProps) {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <button
          id="btn-back"
          className={styles.backBtn}
          onClick={() => navigate(-1)}
          aria-label={t('nav.back')}
        >
          ← {t('nav.back')}
        </button>
      </header>

      <main className={styles.content}>
        <span className={styles.icon} aria-hidden="true">
          {icon}
        </span>
        <h1 className={styles.title}>{t(titleKey)}</h1>
        <p className={styles.coming}>{t('placeholder.comingsoon')}</p>
        <p className={styles.detail}>{t(detailKey)}</p>
      </main>
    </div>
  );
}
