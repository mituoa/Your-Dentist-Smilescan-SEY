/**
 * Feste Nutzermeldungen für `downloadSubmissionPhotos` in `app/(protected)/inbox/[id]/actions.ts`
 * (Punkt 8).
 * **Single Source of Truth:** Server-Action und Client-Whitelist nutzen dieselben Strings —
 * bei neuen Fehlerfällen hier ergänzen, nicht nur in der Action oder nur im Viewer.
 */
export const submissionPhotoDownloadErrors = {
  noWorkspace: "Arbeitsbereich nicht gefunden.",
  forbidden: "Keine Berechtigung für den Download.",
  notSignedIn: "Nicht angemeldet.",
  submissionNotFound: "Fall nicht gefunden.",
  generic: "Download nicht möglich. Bitte erneut versuchen.",
  noPhotos: "Keine Fotos vorhanden.",
  tooLarge: "Download zu groß. Bitte Admin kontaktieren.",
} as const;

const ALL_MESSAGES = new Set<string>(Object.values(submissionPhotoDownloadErrors));

/** Prüft, ob `msg` exakt einer der von `downloadSubmissionPhotos` gelieferten Kurzmeldungen entspricht. */
export function isKnownSubmissionPhotoDownloadError(msg: string): boolean {
  return ALL_MESSAGES.has(msg.trim());
}

/** Mappt Server-`error` auf eine bekannte Meldung; sonst ruhiger Fallback (keine Roh-API-Texte). */
export function safeSubmissionPhotoDownloadErrorMessage(raw: string | undefined): string {
  const t = (raw ?? "").trim();
  if (ALL_MESSAGES.has(t)) return t;
  return submissionPhotoDownloadErrors.generic;
}
