import type { SupportedLanguage } from './i18n';

let currentUtterance: SpeechSynthesisUtterance | null = null;

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      if (currentUtterance || window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
        currentUtterance = null;
      }
    } catch {
      // ignore
    }
  }
}

export function isSpeechSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

/**
 * Speak text with graceful language fallback.
 * If Tamil/Hindi voice is missing on user device, falls back to English audio
 * so the "Listen" button is never blocked.
 */
export function speakText(
  text: string,
  lang: SupportedLanguage,
  fallbackEnglishText?: string,
  onStart?: () => void,
  onEnd?: () => void,
  onError?: (err: unknown) => void
): boolean {
  if (!isSpeechSupported()) {
    onError?.('Speech synthesis not supported on this device');
    return false;
  }

  try {
    stopSpeaking();

    const voices = window.speechSynthesis.getVoices();
    let selectedVoice: SpeechSynthesisVoice | undefined;
    let spokenText = text;

    if (lang === 'ta') {
      selectedVoice = voices.find(
        (v) =>
          v.lang.toLowerCase().startsWith('ta') ||
          v.name.toLowerCase().includes('tamil')
      );
      if (!selectedVoice) {
        // Fallback to English voice speaking English guidance
        spokenText = fallbackEnglishText || text;
        selectedVoice = voices.find(
          (v) =>
            v.lang.toLowerCase().includes('en-in') ||
            v.lang.toLowerCase().startsWith('en')
        );
      }
    } else if (lang === 'hi') {
      selectedVoice = voices.find(
        (v) =>
          v.lang.toLowerCase().startsWith('hi') ||
          v.name.toLowerCase().includes('hindi')
      );
      if (!selectedVoice) {
        spokenText = fallbackEnglishText || text;
        selectedVoice = voices.find(
          (v) =>
            v.lang.toLowerCase().includes('en-in') ||
            v.lang.toLowerCase().startsWith('en')
        );
      }
    } else {
      // English
      selectedVoice = voices.find(
        (v) =>
          v.lang.toLowerCase().includes('en-in') ||
          v.lang.toLowerCase().startsWith('en')
      );
    }

    const utterance = new SpeechSynthesisUtterance(spokenText);
    currentUtterance = utterance;

    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    // Set appropriate speech rates for clarity
    utterance.rate = 0.95; // slightly slower for better comprehension by seniors
    utterance.pitch = 1.0;

    utterance.onstart = () => {
      onStart?.();
    };

    utterance.onend = () => {
      currentUtterance = null;
      onEnd?.();
    };

    utterance.onerror = (e) => {
      currentUtterance = null;
      console.warn('TTS playback error:', e);
      onError?.(e);
      onEnd?.();
    };

    window.speechSynthesis.speak(utterance);
    return true;
  } catch (err) {
    console.warn('SpeechSynthesis exception:', err);
    onError?.(err);
    onEnd?.();
    return false;
  }
}
