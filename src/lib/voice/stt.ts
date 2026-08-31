/**
 * stt.ts — Speech-to-Text for Sarothi.
 *
 * Wraps the browser's SpeechRecognition API (webkitSpeechRecognition in Chrome).
 *
 * IMPORTANT OFFLINE CONSTRAINT:
 *   SpeechRecognition sends audio to Google's servers — it requires internet.
 *   TTS (speechSynthesis) works offline, but STT does NOT.
 *   Therefore: STT is an OPTIONAL ENHANCEMENT. The UI must:
 *     - Check isSttAvailable() before showing any mic button
 *     - Hide the mic button completely when offline or unsupported
 *     - Never show an error to the patient — tap input is always the primary path
 *
 * PUBLIC API:
 *   isSttAvailable()               — feature-detect + online check
 *   startListening(onResult, lang) — begin recognition session
 *   stopListening()                — abort session
 */

import type { SupportedLanguage } from '@/lib/i18n';

// BCP-47 locale map (mirrors tts.ts)
const LOCALE_MAP: Record<SupportedLanguage, string> = {
  en: 'en-IN',
  as: 'as-IN',
};

// ---------------------------------------------------------------------------
// Types — minimal local interfaces for the Web Speech API.
// The full Web Speech API types are not included in every TS DOM lib version,
// so we declare exactly what we need here rather than relying on globals.
// ---------------------------------------------------------------------------

interface ISpeechRecognitionResult {
  readonly transcript: string;
  readonly confidence: number;
}

interface ISpeechRecognitionResultList {
  readonly length: number;
  item(index: number): ISpeechRecognitionResult[];
  [index: number]: ISpeechRecognitionResult[];
}

interface ISpeechRecognitionEvent extends Event {
  readonly results: ISpeechRecognitionResultList;
}

interface ISpeechRecognition extends EventTarget {
  lang: string;
  interimResults: boolean;
  maxAlternatives: number;
  continuous: boolean;
  onresult: ((event: ISpeechRecognitionEvent) => void) | null;
  onerror: ((event: Event) => void) | null;
  onend: ((event: Event) => void) | null;
  start(): void;
  abort(): void;
  stop(): void;
}

// Extend Window to include vendor-prefixed SpeechRecognition
declare global {
  interface Window {
    SpeechRecognition?: new () => ISpeechRecognition;
    webkitSpeechRecognition?: new () => ISpeechRecognition;
  }
}

// ---------------------------------------------------------------------------
// Internal: get the SpeechRecognition constructor (cross-browser)
// ---------------------------------------------------------------------------
function getSpeechRecognitionCtor():
  | (new () => ISpeechRecognition)
  | null {
  return (
    window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null
  );
}

// ---------------------------------------------------------------------------
// Public: check if STT is available right now
// Returns false if: API not supported, OR navigator.onLine === false.
// ---------------------------------------------------------------------------
export function isSttAvailable(): boolean {
  try {
    if (!navigator.onLine) return false;
    return getSpeechRecognitionCtor() !== null;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------------------
// Module-level recognition instance
// ---------------------------------------------------------------------------
let _recognition: ISpeechRecognition | null = null;

// ---------------------------------------------------------------------------
// Public: start listening
// onResult is called with the best transcript when the user stops speaking.
// Errors are swallowed — the caller must not depend on errors being surfaced.
// ---------------------------------------------------------------------------
export function startListening(
  onResult: (text: string) => void,
  lang: SupportedLanguage = 'en'
): void {
  try {
    const Ctor = getSpeechRecognitionCtor();
    if (!Ctor || !navigator.onLine) return; // Silently unavailable

    // Stop any existing session
    stopListening();

    _recognition = new Ctor();
    _recognition.lang = LOCALE_MAP[lang] ?? 'en-IN';
    _recognition.interimResults = false;
    _recognition.maxAlternatives = 1;
    _recognition.continuous = false;

    _recognition.onresult = (event: ISpeechRecognitionEvent) => {
      const transcript = event.results?.[0]?.[0]?.transcript ?? '';
      if (transcript.trim()) {
        onResult(transcript.trim());
      }
    };

    _recognition.onerror = () => {
      // Swallow all errors — STT is optional, never surface to patient
      _recognition = null;
    };

    _recognition.onend = () => {
      _recognition = null;
    };

    _recognition.start();
  } catch {
    // Silently ignore — STT errors must never surface to patients
    _recognition = null;
  }
}

// ---------------------------------------------------------------------------
// Public: stop/abort current recognition session
// ---------------------------------------------------------------------------
export function stopListening(): void {
  try {
    if (_recognition) {
      _recognition.abort();
      _recognition = null;
    }
  } catch {
    _recognition = null;
  }
}
