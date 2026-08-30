import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/lib/i18n';
import { NavCard } from '@/components/NavCard';
import styles from './PlayScreen.module.css';

export function PlayScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <button 
          onClick={() => navigate('/')} 
          className={styles.backBtn}
          aria-label={t('screen.play.action.back')}
        >
          ← {t('screen.play.action.back')}
        </button>
        <h1 className={styles.title}>{t('screen.play.title')}</h1>
      </header>

      <main className={styles.grid}>
        <NavCard
          to="/play/counting"
          icon="🧮"
          label={t('game.counting.title')}
          subtitle={t('game.counting.subtitle')}
          colorVar="var(--card-play-bg)"
          ariaLabel={t('game.counting.title')}
          id="game-counting-card"
        />
        <NavCard
          to="/play/finger-math"
          icon="🖐️"
          label={t('game.math.title')}
          subtitle={t('game.math.subtitle')}
          colorVar="var(--card-reminders-bg)"
          ariaLabel={t('game.math.title')}
          id="game-math-card"
        />
      </main>
    </div>
  );
}
