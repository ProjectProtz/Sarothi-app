/**
 * tts.ts — Text-to-Speech for Sarothi.
 *
 * Uses the browser's built-in Web Speech API (SpeechSynthesis).
 * Works fully OFFLINE in Chrome, Edge, Firefox, and most mobile browsers.
 *
 * PUBLIC API (for other tasks to call):
 *   speak(text)                   — speak with the currently selected language
 *   speakText(text, lang?)        — speak with an explicit language (legacy alias)
 *   setActiveLang(lang)           — update the active language (called by i18n on change)
 *   useVoiceGuidance(text)        — React hook: auto-reads text on mount & language change
 *   cancelSpeech()                — stop any current utterance
 *
 * USAGE FROM NON-REACT CODE (e.g., Task D reminders):
 *   import { speak } from '@/lib/voice';
 *   speak('Time to take your medicine!');   // uses current language automatically
 */

import { useEffect, useRef } from 'react';
import type { SupportedLanguage } from '@/lib/i18n';

// ---------------------------------------------------------------------------
// BCP-47 locale map
// 'as-IN' is the correct IETF tag for Assamese (Assam, India).
// Chrome/Edge ship 'en-IN' by default; Assamese may fall back to a generic voice.
// ---------------------------------------------------------------------------
const LOCALE_MAP: Record<SupportedLanguage, string> = {
  en: 'en-IN',
  as: 'as-IN',
};

// Module-level singleton — language state lives here so speak() works
// from any context (React hooks, setTimeout callbacks, etc.).
let _activeLang: SupportedLanguage = 'en';

// ---------------------------------------------------------------------------
// Public: update active language
// Called by i18nContext.tsx whenever the user changes the language.
// ---------------------------------------------------------------------------
export function setActiveLang(lang: SupportedLanguage): void {
  _activeLang = lang;
}

// ---------------------------------------------------------------------------
// Internal: pick the best available voice for a locale
// ---------------------------------------------------------------------------
function pickVoice(locale: string): SpeechSynthesisVoice | null {
  if (!window.speechSynthesis) return null;

  const voices = window.speechSynthesis.getVoices();
  if (voices.length === 0) return null;

  // Prefer exact locale match, then language prefix match, then any Indian English
  return (
    voices.find((v) => v.lang === locale) ??
    voices.find((v) => v.lang.startsWith(locale.split('-')[0])) ??
    voices.find((v) => v.lang === 'en-IN') ??
    voices.find((v) => v.lang.startsWith('en')) ??
    null
  );
}

// ---------------------------------------------------------------------------
// Public: stop any ongoing speech
// ---------------------------------------------------------------------------
export function cancelSpeech(): void {
  try {
    window.speechSynthesis?.cancel();
  } catch {
    // Silently ignore — TTS errors must never surface to patients
  }
}

// ---------------------------------------------------------------------------
// Internal: core speak implementation
// ---------------------------------------------------------------------------
function _speak(text: string, lang: SupportedLanguage): void {
  if (!text.trim()) return;

  try {
    if (!window.speechSynthesis) return; // Not supported — fail silently

    // Cancel any in-flight utterance to avoid queue pile-up
    window.speechSynthesis.cancel();

    // To prevent Chrome/Safari speech synthesis bugs where immediate speak()
    // after cancel() fails silently, we perform the speak inside a setTimeout
    setTimeout(() => {
      try {
        const locale = LOCALE_MAP[lang] ?? LOCALE_MAP['en'];
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = locale;
        utterance.rate = 0.85; // Slightly slower for elderly users
        utterance.pitch = 1.0;
        utterance.volume = 1.0;

        // Try to pick the best matching voice. Voices may not be loaded yet on
        // first call (Chrome loads them async); we set lang on the utterance as
        // a fallback so the browser still picks a reasonable voice even if
        // getVoices() returns [].
        const voice = pickVoice(locale);
        if (voice) {
          utterance.voice = voice;
          
          // Check if we fell back to a different language group (e.g. English for Assamese)
          const requestedLangPrefix = locale.split('-')[0];
          const voiceLangPrefix = voice.lang.split('-')[0];
          if (requestedLangPrefix !== voiceLangPrefix) {
            console.warn(
              `[TTS Fallback] No voice found for locale '${locale}'. ` +
              `Falling back to voice '${voice.name}' (${voice.lang}). ` +
              `This is a known browser/OS limitation when the required language pack is not installed.`
            );
          }
          
          // Force utterance lang to match the voice lang, avoiding mismatches or silent failures
          utterance.lang = voice.lang;
        } else {
          console.warn(`[TTS Warning] No voice available at all for locale '${locale}'.`);
        }

        // Chrome bug: speechSynthesis can get stuck after a page reload.
        // A brief resume() nudge before speak() prevents silent failures.
        window.speechSynthesis.resume();
        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.error('[TTS] Error during speak execution:', err);
      }
    }, 50);
  } catch {
    // Silently ignore — TTS errors must never surface to patients
  }
}

// ---------------------------------------------------------------------------
// Public: speak with the currently active language
// PRIMARY API — use this everywhere unless you need to override language.
// ---------------------------------------------------------------------------
export function speak(text: string): void {
  _speak(text, _activeLang);
}

// ---------------------------------------------------------------------------
// Public: speak with an explicit language
// LEGACY API — kept for backward compatibility with existing stub call-sites.
// ---------------------------------------------------------------------------
export async function speakText(
  text: string,
  lang: SupportedLanguage = 'en'
): Promise<void> {
  _speak(text, lang);
}

// ---------------------------------------------------------------------------
// React hook: auto-read text on mount and whenever text or language changes
//
// Usage:
//   useVoiceGuidance(t('game.counting.prompt').replace('{item}', itemName));
//
// Debounced by 300 ms to avoid double-firing in React StrictMode dev double-invocations.
// ---------------------------------------------------------------------------
export function useVoiceGuidance(text: string): void {
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastTextRef = useRef<string>('');

  useEffect(() => {
    // Skip if same text (language switch fires new t() → new text → speaks again,
    // which IS desired; only skip true no-ops)
    if (!text || text === lastTextRef.current) return;
    lastTextRef.current = text;

    // Clear any pending debounce
    if (timerRef.current) clearTimeout(timerRef.current);

    // Voices may not be loaded on first render — wait for voiceschanged or a
    // short timeout, whichever comes first.
    let spoken = false;
    const doSpeak = () => {
      if (spoken) return;
      spoken = true;
      _speak(text, _activeLang);
    };

    // Most browsers load voices synchronously on second+ call; first call may
    // need the voiceschanged event.
    if (window.speechSynthesis?.getVoices().length > 0) {
      timerRef.current = setTimeout(doSpeak, 300);
    } else {
      const handler = () => {
        doSpeak();
        window.speechSynthesis?.removeEventListener('voiceschanged', handler);
      };
      window.speechSynthesis?.addEventListener('voiceschanged', handler);
      // Fallback: if voiceschanged never fires, speak anyway after 1 s
      timerRef.current = setTimeout(doSpeak, 1000);
    }

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      cancelSpeech();
    };
  }, [text]);
}
