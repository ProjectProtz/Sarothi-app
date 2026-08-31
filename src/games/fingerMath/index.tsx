import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from '@/lib/i18n';
import { getActivePatient, addSession } from '@/lib/storage';
import { calculateNextDifficulty } from '../adaptiveDifficulty';
import { MATH_TEMPLATES, type MathTemplate } from './templates';
import { useVoiceGuidance } from '@/lib/voice';
import { SpeakButton } from '@/components/SpeakButton';
import styles from './FingerMathGame.module.css';

const getNumberRange = (difficulty: number) => {
  switch (difficulty) {
    case 1: return { min: 1, max: 5 };
    case 2: return { min: 2, max: 9 };
    case 3: return { min: 5, max: 12 };
    case 4: return { min: 8, max: 15 };
    case 5: return { min: 10, max: 20 };
    default: return { min: 1, max: 5 };
  }
};

export function FingerMathGame() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [difficulty, setDifficulty] = useState<number | null>(null);
  const [patientId, setPatientId] = useState<string | null>(null);
  
  const [template, setTemplate] = useState<MathTemplate | null>(null);
  const [n, setN] = useState<number>(0);
  const [m, setM] = useState<number>(0);
  const [options, setOptions] = useState<number[]>([]);

  // Replace placeholders
  const questionStr = template
    ? t(template.templateKey as any)
        .replace('{n}', n.toString())
        .replace('{m}', m.toString())
    : '';

  // Auto-read question text on load/change
  useVoiceGuidance(questionStr);
  
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

      const diff = await calculateNextDifficulty(pid, 'finger_math');
      setDifficulty(diff);

      const randomTemplate = MATH_TEMPLATES[Math.floor(Math.random() * MATH_TEMPLATES.length)];
      setTemplate(randomTemplate);
    }
    init();
  }, []);

  // Generate question when difficulty and template are ready
  useEffect(() => {
    if (difficulty === null || template === null) return;

    const { min, max } = getNumberRange(difficulty);
    let valN = Math.floor(Math.random() * (max - min + 1)) + min;
    let valM = Math.floor(Math.random() * (max - min + 1)) + min;

    // Ensure subtraction doesn't go below 0
    if (template.operation === 'subtract' && valM > valN) {
      const temp = valN;
      valN = valM;
      valM = temp;
    }
    // Avoid N - N = 0 if we want to keep it simple, but 0 is fine.

    setN(valN);
    setM(valM);

    const correct = template.operation === 'add' ? valN + valM : valN - valM;
    
    // Generate options
    const opts = new Set<number>();
    opts.add(correct);
    while (opts.size < 4) {
      const offset = Math.floor(Math.random() * 5) + 1;
      const sign = Math.random() > 0.5 ? 1 : -1;
      const fake = Math.max(0, correct + offset * sign); // No negative options
      opts.add(fake);
    }
    setOptions(Array.from(opts).sort((a, b) => a - b));
    setStartTime(Date.now());
  }, [difficulty, template]);

  const handleOptionClick = async (opt: number) => {
    if (isFinished || difficulty === null || !patientId || !template) return;

    const correct = template.operation === 'add' ? n + m : n - m;

    if (opt === correct) {
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
        game_type: 'finger_math',
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

  if (!template) return null;

  if (isFinished) {
    let summaryEmoji = '🌟';
    let summaryText = t('game.summary.great');
    if (accuracy < 0.5) {
      summaryEmoji = '👍';
      summaryText = t('game.summary.good');
    }

    return (
      <div className={styles.container}>
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
    <div className={styles.container}>
      <div className={styles.header}>
        <button onClick={() => navigate('/play')} className={styles.btnPrimary} style={{ padding: '8px 16px', fontSize: '18px' }}>
          {t('game.action.exit')}
        </button>
      </div>

      <div className={styles.questionArea}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
          <div className={styles.questionText}>
            {questionStr}
          </div>
          <SpeakButton text={questionStr} />
        </div>
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
