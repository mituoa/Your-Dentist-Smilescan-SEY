/** Zentrale Metadaten — bei finaler Freigabe hier und in workspace_contracts angleichen. */
export const LEGAL_DOCUMENT_VERSION = "1.0";

export const LEGAL_EFFECTIVE_DATE_ISO = "2026-06-05";

export function formatLegalEffectiveDate(locale = "de-DE"): string {
  const d = new Date(`${LEGAL_EFFECTIVE_DATE_ISO}T12:00:00`);
  return d.toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" });
}

export const LEGAL_DRAFT_BANNER =
  "Entwurf – muss vor Veröffentlichung juristisch geprüft werden.";

export const LEGAL_DRAFT_FOOTER =
  "Dieser Entwurf ersetzt keine rechtliche Prüfung. Verbindliche Fassungen werden nach anwaltlicher Freigabe veröffentlicht.";
