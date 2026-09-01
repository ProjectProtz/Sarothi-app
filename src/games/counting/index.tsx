import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/lib/i18n';
import { getActivePatient, addSession } from '@/lib/storage';
import { calculateNextDifficulty } from '../adaptiveDifficulty';
import { COUNTING_THEMES, type CountingTheme } from './themes';
import { useVoiceGuidance } from '@/lib/voice';
import { SpeakButton } from '@/components/SpeakButton';
import styles from './CountingGame.module.css';

// Difficulty logic
const getTargetCountRange = (difficulty: number) => {
  switch (difficulty) {
    case 1: return { min: 2, max: 4 };
    case 2: return { min: 4, max: 7 };
    case 3: return { min: 6, max: 9 };
    case 4: return { min: 8, max: 12 };
    case 5: return { min: 10, max: 15 };
    default: return { min: 3, max: 5 };
  }
};

const getDistractorCount = (difficulty: number) => {
  switch (difficulty) {
    case 1: return 0;
    case 2: return 2;
    case 3: return 4;
    case 4: return 8;
    case 5: return 12;
    default: return 0;
  }
};

interface RenderItem {
  id: number;
  icon: string;
  x: number; // percentage 10-90
  y: number; // percentage 10-90
}

export function ObjectCountingGame() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [difficulty, setDifficulty] = useState<number | null>(null);
  const [patientId, setPatientId] = useState<string | null>(null);
  const [theme, setTheme] = useState<CountingTheme | null>(null);

  // Dynamically compute prompt text
  const promptText = theme
    ? t('game.counting.prompt').replace('{item}', t(theme.targetNameKey as any))
    : '';

  // Auto-read prompt text on load/change
  useVoiceGuidance(promptText);

  const [targets, setTargets] = useState<RenderItem[]>([]);
  const [distractors, setDistractors] = useState<RenderItem[]>([]);
  const [options, setOptions] = useState<number[]>([]);
  
  const [startTime, setStartTime] = useState<number>(0);
  const [attempts, setAttempts] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [accuracy, setAccuracy] = useState<number>(0);

  // Initialization
  useEffect(() => {
    async function init() {
      const patient = await getActivePatient();
      const pid = patient?.id || 'demo_patient';
      setPatientId(pid);

      const diff = await calculateNextDifficulty(pid, 'counting');
      setDifficulty(diff);

      const randomTheme = COUNTING_THEMES[Math.floor(Math.random() * COUNTING_THEMES.length)];
      setTheme(randomTheme);
    }
    init();
  }, []);

  // Generate board when difficulty and theme are ready
  useEffect(() => {
    if (difficulty === null || theme === null) return;

    const { min, max } = getTargetCountRange(difficulty);
    const targetCount = Math.floor(Math.random() * (max - min + 1)) + min;
    const distCount = getDistractorCount(difficulty);

    const generatePosition = () => ({
      x: 10 + Math.random() * 80,
      y: 10 + Math.random() * 80,
    });

    const newTargets = Array.from({ length: targetCount }).map((_, i) => ({
      id: i,
      icon: theme.targetIcon,
      ...generatePosition(),
    }));

    const newDistractors = Array.from({ length: distCount }).map((_, i) => {
      // randomly pick distractor icon from theme
      const dIcon = theme.distractorIcons[Math.floor(Math.random() * theme.distractorIcons.length)];
      return {
        id: i + targetCount,
        icon: dIcon,
        ...generatePosition(),
      };
    });

    setTargets(newTargets);
    setDistractors(newDistractors);

    // Generate options
    const correct = targetCount;
    const opts = new Set<number>();
    opts.add(correct);
    while (opts.size < 4) {
      const offset = Math.floor(Math.random() * 5) + 1;
      const sign = Math.random() > 0.5 ? 1 : -1;
      const fake = Math.max(1, correct + offset * sign);
      opts.add(fake);
    }
    setOptions(Array.from(opts).sort((a, b) => a - b));
    setStartTime(Date.now());
  }, [difficulty, theme]);

  const handleOptionClick = async (opt: number) => {
    if (isFinished || difficulty === null || !patientId) return;

    if (opt === targets.length) {
      // Correct!
      const currentAttempts = attempts + 1;
      let finalAccuracy = 1.0;
      if (currentAttempts === 2) finalAccuracy = 0.5;
      else if (currentAttempts > 2) finalAccuracy = 0.0;

      setAccuracy(finalAccuracy);
      setIsFinished(true);

      // Save session
      await addSession({
        id: crypto.randomUUID(),
        patient_id: patientId,
        game_type: 'counting',
        timestamp: Date.now(),
        accuracy: finalAccuracy,
        difficulty_level: difficulty,
        duration_ms: Date.now() - startTime,
        synced: false,
      });
    } else {
      // Wrong
      setAttempts((a) => a + 1);
    }
  };

  if (!theme) return null;

  if (isFinished) {
    // Emoji summary (FR-10)
    let summaryEmoji = '🌟';
    let summaryText = t('game.summary.great');
    if (accuracy < 0.5) {
      summaryEmoji = '👍';
      summaryText = t('game.summary.good');
    }

    return (
      <div className={styles.container} style={{ backgroundColor: theme.backgroundColor }}>
        <div className={styles.summary}>
          <div className={styles.emojiLarge}>{summaryEmoji}</div>
          <div className={styles.summaryText}>{summaryText}</div>
          <button className={styles.btnPrimary} onClick={() => navigate('/play')}>
            {t('game.action.continue')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container} style={{ backgroundColor: theme.backgroundColor }}>
      <div className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div className={styles.title}>{promptText}</div>
          <SpeakButton text={promptText} />
        </div>
        <button onClick={() => navigate('/play')} className={styles.btnPrimary} style={{ padding: '8px 16px', fontSize: '18px' }}>
          {t('game.action.exit')}
        </button>
      </div>

      <div className={styles.playArea}>
        {[...targets, ...distractors].map((item) => (
          <div
            key={item.id}
            className={styles.item}
            style={{ left: `${item.x}%`, top: `${item.y}%` }}
            aria-hidden="true"
          >
            {item.icon}
          </div>
        ))}
      </div>

      <div className={styles.optionsArea}>
        {options.map((opt) => (
          <button
            key={opt}
            className={styles.optionBtn}
            onClick={() => handleOptionClick(opt)}
            aria-label={opt.toString()}
          >
            {opt}
          </button>
        ))}
      </div>
    </div>
  );
}
