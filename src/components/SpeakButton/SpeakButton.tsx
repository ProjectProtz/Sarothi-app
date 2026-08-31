/**
 * SpeakButton — a 🔊 button that speaks `text` aloud when tapped.
 *
 * Accessibility:
 *   - Minimum 48 × 48 px tap target (WCAG 2.5.5)
 *   - aria-label driven by i18n ('a11y.speak.repeat')
 *   - Provides visual pulse feedback while speaking
 *
 * Usage:
 *   <SpeakButton text={t('home.greeting')} />
 */

import { useState, useCallback } from 'react';
import { useTranslation } from '@/lib/i18n';
import { speak, cancelSpeech } from '@/lib/voice';
import styles from './SpeakButton.module.css';

interface SpeakButtonProps {
  /** The text to be spoken when the button is tapped. */
  text: string;
  /** Optional extra CSS class for layout adjustments from the parent. */
  className?: string;
}

export function SpeakButton({ text, className }: SpeakButtonProps) {
  const { t } = useTranslation();
  const [speaking, setSpeaking] = useState(false);

  const handleClick = useCallback(() => {
    if (speaking) {
      cancelSpeech();
      setSpeaking(false);
      return;
    }

    setSpeaking(true);
    speak(text);

    // speechSynthesis doesn't give us a reliable onend callback cross-browser
    // when called from outside the utterance, so we estimate duration and reset.
    // 120 wpm average × 1.15 safety margin, min 1 s, max 8 s.
    const words = text.trim().split(/\s+/).length;
    const estimatedMs = Math.min(Math.max((words / 120) * 60_000 * 1.15, 1000), 8000);
    const timer = setTimeout(() => setSpeaking(false), estimatedMs);

    return () => clearTimeout(timer);
  }, [speaking, text]);

  return (
    <button
      id="speak-button"
      type="button"
      className={`${styles.btn} ${speaking ? styles.speaking : ''} ${className ?? ''}`}
      onClick={handleClick}
      aria-label={speaking ? t('a11y.speak.stop') : t('a11y.speak.repeat')}
      aria-pressed={speaking}
    >
      <span className={styles.icon} aria-hidden="true">
        {speaking ? '🔊' : '🔈'}
      </span>
    </button>
  );
}
