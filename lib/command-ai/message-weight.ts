const HEAVY_HINTS =
  /entwurf|status|aufgabe|patient|nachricht|foto|termin|relay|fall|journal|senden|verschick|analys|beschreib|formulier|schreib/i;

const GREETING_ONLY =
  /^(hallo|hi|hey|servus|moin|guten tag|guten morgen|guten abend|danke|vielen dank|ok|okay|test)[!.?\s]*$/i;

/** Reine Begrüßung — sofortige Antwort ohne KI-Latenz. */
export function isGreetingOnlyMessage(message: string): boolean {
  return GREETING_ONLY.test(message.trim());
}

/** Kurze Smalltalk-Nachrichten — kein Journal-RAG, kein Fall-Reload, kürzere KI-Antwort. */
export function isLightweightUserMessage(message: string): boolean {
  const trimmed = message.trim();
  if (!trimmed) return false;
  if (HEAVY_HINTS.test(trimmed)) return false;
  if (GREETING_ONLY.test(trimmed)) return true;
  if (trimmed.length <= 24 && !trimmed.includes("?")) return true;
  return false;
}

export function commandAiMaxTokensForMessage(
  message: string,
  options: { hasPhotoUrls: boolean }
): number {
  if (isLightweightUserMessage(message)) return 320;
  if (options.hasPhotoUrls) return 1400;
  return 900;
}
