/** Zentrale Metadaten — bei finaler Freigabe hier und in workspace_contracts angleichen. */
export const TRUST_DOCUMENT_VERSION = "1.0";

export const TRUST_EFFECTIVE_DATE_ISO = "2026-06-05";

export function formatTrustEffectiveDate(locale = "de-DE"): string {
  const d = new Date(`${TRUST_EFFECTIVE_DATE_ISO}T12:00:00`);
  return d.toLocaleDateString(locale, { day: "numeric", month: "long", year: "numeric" });
}

export const TRUST_DRAFT_BANNER =
  "Entwurf – muss vor Veröffentlichung juristisch geprüft werden.";

export const TRUST_DRAFT_STATUS = "Entwurf, juristisch zu prüfen";

export const TRUST_DRAFT_FOOTER =
  "Dieser Entwurf ersetzt keine rechtliche Prüfung. Verbindliche Fassungen werden nach anwaltlicher Freigabe veröffentlicht.";

export const TRUST_VERSION_LABEL = "1.0";

export function mapContractVersionToLabel(contractVersion: string | null | undefined): string {
  const v = (contractVersion || "").trim();
  if (!v) return "—";
  if (v === "v1" || v === "1.0") return TRUST_VERSION_LABEL;
  return v;
}
