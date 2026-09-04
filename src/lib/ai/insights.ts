/**
 * AI Engagement Insight — Task F (FR-17).
 *
 * Sends recent session data to the Gemini API and returns a short,
 * natural-language observation about the patient's ENGAGEMENT patterns.
 *
 * CRITICAL CONSTRAINT (from AGENTS.md):
 *   This function MUST NOT produce or return text that diagnoses, implies a
 *   medical condition, or uses clinical language.  The constraint is enforced
 *   both in the LLM prompt sent to the API AND in the hardcoded fallback strings.
 *
 * Graceful fallback contract:
 *   Any failure (missing key, network error, timeout, malformed response, rate
 *   limit) silently selects a pre-written fallback and returns mode='fallback'.
 *   The UI is NEVER left blank or stuck loading.
 *
 * API key: read from import.meta.env.VITE_GEMINI_API_KEY — never hardcoded.
 * Timeout: 5 seconds via AbortController.
 */

import type { Session } from '@/lib/storage';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type InsightMode = 'live' | 'fallback';

export interface InsightResult {
  text: string;
  mode: InsightMode;
}

// ---------------------------------------------------------------------------
// Fallback strings
//
// Written for a non-clinical, caregiver-support context.
// Reviewed to contain ZERO diagnostic or clinical language.
// Indexed by trend direction: 0=up, 1=flat, 2=down, 3=no_data.
// ---------------------------------------------------------------------------

const FALLBACK_INSIGHTS: readonly string[] = [
  // 0 — trend improving
  'Over the past few sessions, the participant has been completing activities with improving consistency — matching more items correctly and finishing rounds without needing to step away. Morning sessions appear to be particularly productive.',

  // 1 — trend flat / stable
  "The participant's recent activity shows a steady, consistent pattern across game sessions. They are engaging regularly and maintaining a similar response rate across different activity types, with no notable changes in session length.",

  // 2 — trend declining
  'The last few sessions show a slight dip in response accuracy compared to earlier this week. This kind of day-to-day variation is common — factors like time of day or distractions can affect a session. Trying a quieter time or a shorter session may help.',

  // 3 — no sessions recorded yet
  'No recent sessions have been recorded yet. Once the participant completes a few activities, this card will show an observation about their engagement patterns and preferred game types.',
];

// ---------------------------------------------------------------------------
// Trend detection
// ---------------------------------------------------------------------------

type TrendIndex = 0 | 1 | 2 | 3;

function detectTrend(sessions: Session[]): TrendIndex {
  if (sessions.length === 0) return 3; // no_data

  const recent = sessions.slice(0, Math.min(5, sessions.length));
  if (recent.length < 2) return 1; // flat — not enough data to judge

  // Compare first half vs second half of the recent window
  const mid = Math.floor(recent.length / 2);
  const newerAvg = recent.slice(0, mid).reduce((s, r) => s + r.accuracy, 0) / mid;
  const olderAvg =
    recent.slice(mid).reduce((s, r) => s + r.accuracy, 0) / (recent.length - mid);

  const delta = newerAvg - olderAvg;
  if (delta > 0.08) return 0; // improving
  if (delta < -0.08) return 2; // declining
  return 1; // flat
}

function pickFallback(sessions: Session[]): string {
  return FALLBACK_INSIGHTS[detectTrend(sessions)];
}

// ---------------------------------------------------------------------------
// Prompt builder
// ---------------------------------------------------------------------------

function buildPrompt(sessions: Session[]): string {
  if (sessions.length === 0) {
    return `You are a caregiver assistant for a cognitive engagement app called Sarothi.
No game sessions have been recorded yet.
Write ONE observation (2-3 sentences) for the caregiver noting that no activity data is available yet.
STRICT RULES you MUST follow:
- Do NOT diagnose anything or mention any medical condition or disease.
- Do NOT use clinical language (e.g. avoid "cognitive decline", "dementia", "assessment", "score").
- Frame everything as observable engagement and activity patterns only.
- Keep the tone warm, factual, and supportive for a caregiver audience.`;
  }

  const recent = sessions.slice(0, 10);
  const avgAccuracy = Math.round(
    (recent.reduce((s, r) => s + r.accuracy, 0) / recent.length) * 100
  );

  const gameTypeCounts: Record<string, number> = {};
  for (const s of recent) {
    gameTypeCounts[s.game_type] = (gameTypeCounts[s.game_type] ?? 0) + 1;
  }

  const timeOfDayCounts = { morning: 0, afternoon: 0, evening: 0 };
  for (const s of recent) {
    const hour = new Date(s.timestamp).getHours();
    if (hour < 12) timeOfDayCounts.morning++;
    else if (hour < 17) timeOfDayCounts.afternoon++;
    else timeOfDayCounts.evening++;
  }

  const trend = detectTrend(sessions);
  const trendLabel = trend === 0 ? 'improving' : trend === 2 ? 'declining' : 'stable';

  const gameSummary = Object.entries(gameTypeCounts)
    .map(([g, c]) => `${g}: ${c} session(s)`)
    .join(', ');

  const timeSummary = `morning: ${timeOfDayCounts.morning}, afternoon: ${timeOfDayCounts.afternoon}, evening: ${timeOfDayCounts.evening}`;

  return `You are a caregiver assistant for a cognitive engagement app called Sarothi.
Here is recent activity data for one participant:
- Sessions analysed: ${recent.length} (most recent first)
- Average engagement response rate: ${avgAccuracy}%
- Accuracy trend over recent sessions: ${trendLabel}
- Game types played: ${gameSummary}
- Time-of-day distribution: ${timeSummary}

Write ONE short observation (2-3 sentences, max 60 words) for the caregiver about this participant's recent engagement patterns.

STRICT RULES you MUST follow:
- Do NOT diagnose anything or mention any medical condition or disease name (including dementia, Alzheimer's, or any other condition).
- Do NOT use clinical language (e.g. avoid "cognitive decline", "clinical assessment", "medical score", "neurological").
- Describe only observable engagement behaviour: response rate, game preferences, session timing, consistency.
- Keep the tone warm, factual, and supportive for a caregiver audience.
- Do NOT add disclaimers, greetings, or headers. Output only the observation paragraph.`;
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

const GEMINI_ENDPOINT =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
const TIMEOUT_MS = 5000;

/**
 * Generate an AI engagement insight for the caregiver dashboard.
 *
 * @param sessions  Recent sessions (newest first) from getSessionsForPatient().
 * @returns         InsightResult with text and mode ('live' or 'fallback').
 */
export async function generateInsight(sessions: Session[]): Promise<InsightResult> {
  const apiKey = (import.meta.env.VITE_GEMINI_API_KEY as string | undefined) ?? '';

  // No key configured — go straight to fallback without any network attempt
  if (!apiKey || apiKey.trim() === '' || apiKey === 'your_gemini_api_key_here') {
    return { text: pickFallback(sessions), mode: 'fallback' };
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const response = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      signal: controller.signal,
      body: JSON.stringify({
        contents: [{ parts: [{ text: buildPrompt(sessions) }] }],
        generationConfig: {
          maxOutputTokens: 120,
          temperature: 0.7,
          topP: 0.9,
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
        ],
      }),
    });

    if (!response.ok) {
      return { text: pickFallback(sessions), mode: 'fallback' };
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const data: any = await response.json();
    const text: string | undefined =
      data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (!text || text.length < 10) {
      return { text: pickFallback(sessions), mode: 'fallback' };
    }

    return { text, mode: 'live' };
  } catch {
    // Network error, AbortError (timeout), JSON parse failure — all fall back silently
    return { text: pickFallback(sessions), mode: 'fallback' };
  } finally {
    clearTimeout(timeoutId);
  }
}
