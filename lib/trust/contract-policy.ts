/**
 * Vertrags- und Einwilligungslogik (B2B-Praxis-SaaS).
 *
 * Rechtlicher Rahmen (keine Rechtsberatung — Produktumsetzung):
 * - Nutzungsbedingungen: aktive Zustimmung bei Registrierung (Vertragsschluss).
 * - Datenschutzerklärung: gesonderte Kenntnisnahme bei Registrierung (Art. 13 DSGVO).
 * - Widerruf: gesonderte Bestätigung bei vorzeitigem Leistungsbeginn (§ 356 BGB).
 *
 * Erneute Bestätigung: nur bei wesentlichen Änderungen der jeweiligen Fassung —
 * nicht zeitlich fest (z. B. nicht „alle 12 Monate“), sondern versionsbezogen.
 * Nach Materialänderung: neue Version speichern, Nutzer beim nächsten Login
 * informieren und erneut zustimmen lassen, bevor der Workspace weiter genutzt wird.
 */

import { TRUST_DOCUMENT_VERSION } from "@/lib/trust/meta";

/** In `workspace_contracts.contract_version` gespeichert. */
export const CURRENT_CONTRACT_VERSION = "v1";

export const CURRENT_TERMS_VERSION = TRUST_DOCUMENT_VERSION;
export const CURRENT_PRIVACY_VERSION = TRUST_DOCUMENT_VERSION;

export function contractVersionMatchesStored(stored: string | null | undefined): boolean {
  const v = (stored || "").trim();
  if (!v) return false;
  return v === CURRENT_CONTRACT_VERSION || v === CURRENT_TERMS_VERSION || v === "1.0";
}

export function needsContractReacceptance(stored: string | null | undefined): boolean {
  return !contractVersionMatchesStored(stored);
}
