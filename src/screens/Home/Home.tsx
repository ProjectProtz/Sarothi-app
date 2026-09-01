/**
 * Home screen — FR-1.
 * Shows 3 large navigation cards: Play, Reminders, My Progress.
 * Language selector in top-right corner.
 *
 * Voice: auto-reads the greeting on mount and on language change (useVoiceGuidance).
 * A 🔊 SpeakButton next to the greeting lets the patient replay it on demand.
 */

import { useTranslation } from '@/lib/i18n';
import { useVoiceGuidance } from '@/lib/voice';
import { NavCard } from '@/components/NavCard';
import { LanguageSelector } from '@/components/LanguageSelector';
import { SpeakButton } from '@/components/SpeakButton';
import styles from './Home.module.css';

export function HomeScreen() {
  const { t } = useTranslation();

  // Auto-read the greeting on mount and whenever the language changes.
  useVoiceGuidance(t('home.greeting'));

  return (
    <div className={styles.page}>
      {/* Top bar */}
      <header className={styles.header}>
        <div className={styles.appName}>{t('app.name')}</div>
        <LanguageSelector />
      </header>

      {/* Greeting */}
      <section className={styles.greeting} aria-label="greeting">
        <div className={styles.greetingRow}>
          <h1 className={styles.greetingText}>{t('home.greeting')}</h1>
          <SpeakButton text={t('home.greeting')} />
        </div>
        <p className={styles.subtitle}>{t('home.subtitle')}</p>
      </section>

      {/* Navigation cards — FR-1 */}
      <main className={styles.cards} aria-label="main navigation">
        <NavCard
          id="nav-card-play"
          to="/play"
          icon="🎮"
          label={t('home.card.play')}
          subtitle={t('home.card.play.subtitle')}
          colorVar="var(--card-play-bg)"
          ariaLabel={t('a11y.home.card.play')}
        />
        <NavCard
          id="nav-card-reminders"
          to="/reminders"
          icon="💊"
          label={t('home.card.reminders')}
          subtitle={t('home.card.reminders.subtitle')}
          colorVar="var(--card-reminders-bg)"
          ariaLabel={t('a11y.home.card.reminders')}
        />
        <NavCard
          id="nav-card-progress"
          to="/progress"
          icon="📈"
          label={t('home.card.progress')}
          subtitle={t('home.card.progress.subtitle')}
          colorVar="var(--card-progress-bg)"
          ariaLabel={t('a11y.home.card.progress')}
        />
      </main>
    </div>
  );
}
