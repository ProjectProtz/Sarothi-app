/**
 * Voice module placeholder — Task C will implement this.
 *
 * This file exists so Tasks B/D/E can import voice hooks now without
 * breaking, and Task C can implement here without restructuring imports.
 *
 * PLANNED by Task C:
 *   - speakText(text, lang) → TTS via Gemini API with Web Speech API fallback
 *   - startListening(onResult, lang) → STT
 *   - stopListening() → stop STT session
 *   - useVoiceGuidance(key) → hook that auto-reads a translation key on mount
 */

export type VoiceLang = 'en' | 'as';

/**
 * Stub: Speak a text string aloud.
 * Task C will replace this with a real TTS call (Gemini API / Web Speech API).
 */
export async function speakText(
  _text: string,
  _lang: VoiceLang = 'en'
): Promise<void> {
  // TODO: Task C implements TTS here
  console.debug('[Voice] speakText stub called — Task C will implement.');
}

/**
 * Stub: Start voice input (STT).
 * Task C will replace this with a real STT call.
 */
export function startListening(
  _onResult: (text: string) => void,
  _lang: VoiceLang = 'en'
): void {
  // TODO: Task C implements STT here
  console.debug('[Voice] startListening stub called — Task C will implement.');
}

/** Stub: Stop voice input. */
export function stopListening(): void {
  // TODO: Task C implements here
  console.debug('[Voice] stopListening stub called — Task C will implement.');
}
