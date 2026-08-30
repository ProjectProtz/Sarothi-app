/**
 * Shared Adaptive Difficulty Engine (FR-5, FR-16)
 *
 * Deterministic rules based on recent session accuracy.
 * Returns a difficulty level from 1 (easiest) to 5 (hardest).
 */

import { getSessionsForPatient } from '@/lib/storage';

const MIN_DIFFICULTY = 1;
const MAX_DIFFICULTY = 5;

/**
 * Calculates the next difficulty level for a specific game type.
 *
 * Rules:
 * - 3 correct (accuracy >= 0.8) in a row -> increase difficulty
 * - 2 wrong (accuracy <= 0.4) in a row -> decrease difficulty
 * - Default to 1 if no history
 */
export async function calculateNextDifficulty(
  patientId: string,
  gameType: string
): Promise<number> {
  // Fetch recent sessions for this specific game
  const allSessions = await getSessionsForPatient(patientId, 10);
  const gameSessions = allSessions.filter((s) => s.game_type === gameType);

  if (gameSessions.length === 0) {
    return MIN_DIFFICULTY; // Start at lowest difficulty
  }

  // The sessions are sorted newest first by getSessionsForPatient
  const lastSession = gameSessions[0];
  let currentDifficulty = lastSession.difficulty_level;

  // Check for decrease condition: last 2 sessions <= 0.4 accuracy
  if (gameSessions.length >= 2) {
    const recent2 = gameSessions.slice(0, 2);
    const allPoor = recent2.every((s) => s.accuracy <= 0.4);
    if (allPoor) {
      return Math.max(MIN_DIFFICULTY, currentDifficulty - 1);
    }
  }

  // Check for increase condition: last 3 sessions >= 0.8 accuracy
  if (gameSessions.length >= 3) {
    const recent3 = gameSessions.slice(0, 3);
    const allGreat = recent3.every((s) => s.accuracy >= 0.8);
    if (allGreat) {
      return Math.min(MAX_DIFFICULTY, currentDifficulty + 1);
    }
  }

  // Maintain current difficulty
  return Math.max(MIN_DIFFICULTY, Math.min(MAX_DIFFICULTY, currentDifficulty));
}
