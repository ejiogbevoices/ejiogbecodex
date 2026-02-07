/**
 * Fenix Voice Map — TTS Voice Selection
 *
 * Maps language codes to Google Cloud TTS voices.
 * Three tiers:
 *   chirp3-hd  — Native support, highest quality (26 languages)
 *   standard   — Functional (Hausa, Swahili)
 *   fallback   — Closest regional voice for unsupported languages
 */

export type VoiceConfig = {
  languageCode: string;
  name: string;
  tier: "chirp3-hd" | "standard" | "fallback";
};

export const VOICE_MAP: Record<string, VoiceConfig> = {
  // ═══ CHIRP 3: HD — Native support (26 languages) ═══

  // European
  "en":    { languageCode: "en-US",  name: "en-US-Chirp3-HD-Kore",  tier: "chirp3-hd" },
  "en-US": { languageCode: "en-US",  name: "en-US-Chirp3-HD-Kore",  tier: "chirp3-hd" },
  "en-GB": { languageCode: "en-GB",  name: "en-GB-Chirp3-HD-Kore",  tier: "chirp3-hd" },
  "es":    { languageCode: "es-ES",  name: "es-ES-Chirp3-HD-Kore",  tier: "chirp3-hd" },
  "fr":    { languageCode: "fr-FR",  name: "fr-FR-Chirp3-HD-Kore",  tier: "chirp3-hd" },
  "de":    { languageCode: "de-DE",  name: "de-DE-Chirp3-HD-Kore",  tier: "chirp3-hd" },
  "nl":    { languageCode: "nl-NL",  name: "nl-NL-Chirp3-HD-Kore",  tier: "chirp3-hd" },
  "el":    { languageCode: "el-GR",  name: "el-GR-Chirp3-HD-Kore",  tier: "chirp3-hd" },
  "it":    { languageCode: "it-IT",  name: "it-IT-Chirp3-HD-Kore",  tier: "chirp3-hd" },
  "pt":    { languageCode: "pt-BR",  name: "pt-BR-Chirp3-HD-Kore",  tier: "chirp3-hd" },
  "ru":    { languageCode: "ru-RU",  name: "ru-RU-Chirp3-HD-Kore",  tier: "chirp3-hd" },
  "sv":    { languageCode: "sv-SE",  name: "sv-SE-Chirp3-HD-Kore",  tier: "chirp3-hd" },
  "tr":    { languageCode: "tr-TR",  name: "tr-TR-Chirp3-HD-Kore",  tier: "chirp3-hd" },

  // North Africa / Middle East
  "ar":    { languageCode: "ar-XA",  name: "ar-XA-Chirp3-HD-Kore",  tier: "chirp3-hd" },
  "fa":    { languageCode: "fa-IR",  name: "fa-IR-Chirp3-HD-Kore",  tier: "chirp3-hd" },

  // East Asian
  "ja":    { languageCode: "ja-JP",  name: "ja-JP-Chirp3-HD-Kore",  tier: "chirp3-hd" },
  "zh":    { languageCode: "cmn-CN", name: "cmn-CN-Chirp3-HD-Kore", tier: "chirp3-hd" },
  "zh-TW": { languageCode: "cmn-TW", name: "cmn-TW-Chirp3-HD-Kore", tier: "chirp3-hd" },
  "ko":    { languageCode: "ko-KR",  name: "ko-KR-Chirp3-HD-Kore",  tier: "chirp3-hd" },

  // Southeast Asian
  "fil":   { languageCode: "fil-PH", name: "fil-PH-Chirp3-HD-Kore", tier: "chirp3-hd" },
  "id":    { languageCode: "id-ID",  name: "id-ID-Chirp3-HD-Kore",  tier: "chirp3-hd" },
  "th":    { languageCode: "th-TH",  name: "th-TH-Chirp3-HD-Kore",  tier: "chirp3-hd" },
  "vi":    { languageCode: "vi-VN",  name: "vi-VN-Chirp3-HD-Kore",  tier: "chirp3-hd" },

  // South Asian
  "bn":    { languageCode: "bn-IN",  name: "bn-IN-Chirp3-HD-Kore",  tier: "chirp3-hd" },
  "hi":    { languageCode: "hi-IN",  name: "hi-IN-Chirp3-HD-Kore",  tier: "chirp3-hd" },
  "pa":    { languageCode: "pa-IN",  name: "pa-IN-Chirp3-HD-Kore",  tier: "chirp3-hd" },
  "ta":    { languageCode: "ta-IN",  name: "ta-IN-Chirp3-HD-Kore",  tier: "chirp3-hd" },
  "ur":    { languageCode: "ur-IN",  name: "ur-IN-Chirp3-HD-Kore",  tier: "chirp3-hd" },

  // ═══ STANDARD — Functional (2 languages) ═══
  "ha":    { languageCode: "ha-NG",  name: "ha-NG-Standard-A", tier: "standard" },
  "sw":    { languageCode: "sw-KE",  name: "sw-KE-Standard-A", tier: "standard" },

  // ═══ FALLBACK — Closest regional Google voice ═══
  "yo":  { languageCode: "en-US",  name: "en-US-Chirp3-HD-Kore",  tier: "fallback" },
  "ig":  { languageCode: "en-US",  name: "en-US-Chirp3-HD-Kore",  tier: "fallback" },
  "ak":  { languageCode: "en-US",  name: "en-US-Chirp3-HD-Kore",  tier: "fallback" },
  "ee":  { languageCode: "en-US",  name: "en-US-Chirp3-HD-Kore",  tier: "fallback" },
  "fon": { languageCode: "fr-FR",  name: "fr-FR-Chirp3-HD-Kore",  tier: "fallback" },
  "ff":  { languageCode: "en-US",  name: "en-US-Chirp3-HD-Kore",  tier: "fallback" },
  "ht":  { languageCode: "fr-FR",  name: "fr-FR-Chirp3-HD-Kore",  tier: "fallback" },
  "ber": { languageCode: "ar-XA",  name: "ar-XA-Chirp3-HD-Kore",  tier: "fallback" },
  "ku":  { languageCode: "tr-TR",  name: "tr-TR-Chirp3-HD-Kore",  tier: "fallback" },
};

/**
 * Resolve the best available voice for a language code.
 * Tries exact match, then base language code, then falls back to English.
 */
export function resolveVoice(langCode: string): VoiceConfig {
  if (VOICE_MAP[langCode]) return VOICE_MAP[langCode];

  // Try base code (e.g., "en-US" → "en")
  const base = langCode.split("-")[0];
  if (VOICE_MAP[base]) return VOICE_MAP[base];

  // Default to English
  return VOICE_MAP["en"];
}
