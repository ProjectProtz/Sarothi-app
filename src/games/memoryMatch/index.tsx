import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation, type TranslationKey } from '@/lib/i18n';
import { getActivePatient, addSession } from '@/lib/storage';
import { calculateNextDifficulty } from '../adaptiveDifficulty';
import { MEMORY_MATCH_THEMES, type MemoryMatchTheme, type MemoryMatchItem } from './themes';
import { useVoiceGuidance, speak } from '@/lib/voice';
import { SpeakButton } from '@/components/SpeakButton';
import styles from './MemoryMatchGame.module.css';

/** Card pair count based on difficulty level */
const getPairCountForDifficulty = (difficulty: number): number => {
  switch (difficulty) {
    case 1: return 3; // 6 cards (3x2 grid)
    case 2: return 4; // 8 cards (4x2 grid)
    case 3: return 6; // 12 cards (4x3 grid)
    case 4: return 8; // 16 cards (4x4 grid)
    case 5: return 8; // 16 cards (4x4 grid)
    default: return 3;
  }
};

/** Fisher-Yates array shuffle */
function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export interface CardInstance {
  instanceId: string;
  itemId: string;
  nameKey: TranslationKey;
  icon: string;
  imagePath?: string;
}

export function RegionalMemoryMatchGame() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [difficulty, setDifficulty] = useState<number | null>(null);
  const [patientId, setPatientId] = useState<string | null>(null);
  const [theme, setTheme] = useState<MemoryMatchTheme | null>(null);

  const [cards, setCards] = useState<CardInstance[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [matchedItemIds, setMatchedItemIds] = useState<Set<string>>(new Set());
  const [lockBoard, setLockBoard] = useState<boolean>(false);

  const [startTime, setStartTime] = useState<number>(0);
  const [attempts, setAttempts] = useState<number>(0);
  const [isFinished, setIsFinished] = useState<boolean>(false);
  const [accuracy, setAccuracy] = useState<number>(0);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const promptText = t('game.memory.prompt');
  useVoiceGuidance(promptText);

  // Initialize patient, difficulty, and theme
  useEffect(() => {
    async function init() {
      const patient = await getActivePatient();
      const pid = patient?.id || 'demo_patient';
      setPatientId(pid);

      const diff = await calculateNextDifficulty(pid, 'memory_match');
      setDifficulty(diff);

      const randomTheme = MEMORY_MATCH_THEMES[Math.floor(Math.random() * MEMORY_MATCH_THEMES.length)];
      setTheme(randomTheme);
    }
    init();
  }, []);

  // Generate shuffled deck when difficulty and theme are ready
  useEffect(() => {
    if (difficulty === null || theme === null) return;

    const pairCount = getPairCountForDifficulty(difficulty);
    // Pick unique items up to pairCount
    const selectedItems: MemoryMatchItem[] = shuffleArray(theme.items).slice(0, pairCount);

    // Duplicate each item to create pairs
    const cardDeck: CardInstance[] = [];
    selectedItems.forEach((item, idx) => {
      cardDeck.push({
        instanceId: `card-${idx}-a`,
        itemId: item.id,
        nameKey: item.nameKey,
        icon: item.icon,
        imagePath: item.imagePath,
      });
      cardDeck.push({
        instanceId: `card-${idx}-b`,
        itemId: item.id,
        nameKey: item.nameKey,
        icon: item.icon,
        imagePath: item.imagePath,
      });
    });

    setCards(shuffleArray(cardDeck));
    setStartTime(Date.now());
  }, [difficulty, theme]);

  const handleCompletion = useCallback(async (totalAttempts: number, totalPairs: number) => {
    let finalAccuracy = 1.0;
    if (totalAttempts <= totalPairs * 1.2) {
      finalAccuracy = 1.0;
    } else if (totalAttempts <= totalPairs * 1.8) {
      finalAccuracy = 0.8;
    } else if (totalAttempts <= totalPairs * 2.4) {
      finalAccuracy = 0.6;
    } else {
      finalAccuracy = 0.4;
    }

    setAccuracy(finalAccuracy);
    setIsFinished(true);

    if (patientId && difficulty !== null) {
      await addSession({
        id: crypto.randomUUID(),
        patient_id: patientId,
        game_type: 'memory_match',
        timestamp: Date.now(),
        accuracy: finalAccuracy,
        difficulty_level: difficulty,
        duration_ms: Date.now() - startTime,
        synced: false,
      });
    }
  }, [patientId, difficulty, startTime]);

  const handleCardClick = (index: number) => {
    if (lockBoard || isFinished) return;
    if (flippedIndices.includes(index)) return;
    if (matchedItemIds.has(cards[index].itemId)) return;

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setLockBoard(true);
      const [firstIdx, secondIdx] = newFlipped;
      const card1 = cards[firstIdx];
      const card2 = cards[secondIdx];
      const nextAttempts = attempts + 1;
      setAttempts(nextAttempts);

      if (card1.itemId === card2.itemId) {
        // Correct Match!
        const newMatched = new Set(matchedItemIds);
        newMatched.add(card1.itemId);
        setMatchedItemIds(newMatched);
        setFlippedIndices([]);
        setLockBoard(false);

        const matchMsg = t('game.memory.feedback.match');
        setFeedbackMsg(matchMsg);
        speak(matchMsg);
        setTimeout(() => setFeedbackMsg(null), 1500);

        const totalPairs = cards.length / 2;
        if (newMatched.size === totalPairs) {
          handleCompletion(nextAttempts, totalPairs);
        }
      } else {
        // Mismatch — pause long enough for elderly patient observation (1.2s)
        setTimeout(() => {
          setFlippedIndices([]);
          setLockBoard(false);
        }, 1200);
      }
    }
  };

  if (!theme) return null;

  // Grid style class based on card count
  const cardCount = cards.length;
  let gridClass = styles.grid6;
  if (cardCount === 8) gridClass = styles.grid8;
  else if (cardCount === 12) gridClass = styles.grid12;
  else if (cardCount >= 16) gridClass = styles.grid16;

  if (isFinished) {
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
          <p className={styles.summarySubtext}>{t('game.memory.title')}</p>
          <button className={styles.btnPrimary} onClick={() => navigate('/play')}>
            {t('game.action.continue')}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container} style={{ backgroundColor: theme.backgroundColor }}>
      {/* Header */}
      <header className={styles.header}>
        <div className={styles.titleArea}>
          <div className={styles.title}>{promptText}</div>
          <SpeakButton text={promptText} />
          <span className={styles.themeBadge}>{t(theme.themeNameKey)}</span>
        </div>
        <button
          onClick={() => navigate('/play')}
          className={styles.btnPrimary}
          style={{ padding: '8px 16px', fontSize: '18px' }}
        >
          {t('game.action.exit')}
        </button>
      </header>

      {/* Visual match feedback banner */}
      {feedbackMsg && (
        <div className={styles.feedbackBanner} role="status">
          ✨ {feedbackMsg}
        </div>
      )}

      {/* Main Play Area with Card Grid */}
      <main className={styles.playArea}>
        <div className={`${styles.gridContainer} ${gridClass}`}>
          {cards.map((card, idx) => {
            const isFlipped = flippedIndices.includes(idx);
            const isMatched = matchedItemIds.has(card.itemId);
            const isFaceUp = isFlipped || isMatched;

            return (
              <button
                key={card.instanceId}
                className={`${styles.card} ${
                  isMatched
                    ? styles.cardMatched
                    : isFaceUp
                    ? styles.cardFaceUp
                    : styles.cardFaceDown
                }`}
                onClick={() => handleCardClick(idx)}
                aria-label={
                  isFaceUp
                    ? t(card.nameKey)
                    : `${t('game.memory.prompt')} card ${idx + 1}`
                }
                disabled={isMatched || lockBoard}
              >
                {isFaceUp ? (
                  <>
                    {card.imagePath ? (
                      <img
                        src={card.imagePath}
                        alt={t(card.nameKey)}
                        className={styles.cardImage}
                      />
                    ) : (
                      <span className={styles.cardIcon} aria-hidden="true">
                        {card.icon}
                      </span>
                    )}
                    <span className={styles.cardLabel}>{t(card.nameKey)}</span>
                    {isMatched && (
                      <span className={styles.matchedCheck} aria-label="Matched">
                        ✓
                      </span>
                    )}
                  </>
                ) : (
                  <span className={styles.cardFaceDownIcon} aria-hidden="true">
                    {theme.cardBackIcon}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </main>
    </div>
  );
}
