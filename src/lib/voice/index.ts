/**
 * Voice module public API.
 *
 * Re-exports the real TTS and STT implementations so any part of the app
 * can simply `import { speak, useVoiceGuidance } from '@/lib/voice'`.
 *
 * TTS (speak, useVoiceGuidance) — works OFFLINE (browser SpeechSynthesis).
 * STT (startListening, stopListening) — requires internet (sends audio to Google).
 *
 * PUBLIC API:
 *   speak(text)                   — speak in the currently active language
 *   speakText(text, lang?)        — legacy: speak with an explicit language
 *   setActiveLang(lang)           — called by i18nContext on language change
 *   useVoiceGuidance(text)        — React hook: auto-reads text on mount/lang change
 *   cancelSpeech()                — cancel any ongoing utterance
 *   isSttAvailable()              — true only when online + API supported
 *   startListening(onResult,lang) — begin STT session
 *   stopListening()               — abort STT session
 */

export {
  speak,
  speakText,
  setActiveLang,
  cancelSpeech,
  useVoiceGuidance,
} from './tts';

export {
  isSttAvailable,
  startListening,
  stopListening,
} from './stt';
