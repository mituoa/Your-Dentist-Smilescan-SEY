/**
 * Generische Praxis-Konfiguration für Ad-Landingpages (Instagram/Google Ads).
 *
 * Ab dieser Vorlagen-Generation sind Landingpages NICHT mehr fest an eine reale
 * Praxis (z. B. Carree Dental) gebunden. Jede Seite importiert `GENERIC_PRACTICE`
 * und rendert ausschließlich Platzhalterdaten — eine konkrete Praxis wird später
 * individualisiert, indem genau diese eine Stelle (oder ein zur Laufzeit übergebenes
 * Objekt vom selben Typ `LandingpagePractice`) mit echten Praxisdaten ersetzt wird.
 *
 * Keine Praxis-Logos, keine echten Telefonnummern/Adressen ohne Freigabe der Praxis —
 * Platzhalter sind bewusst klar als Platzhalter erkennbar (AGENTS.md: keine Fake-Claims,
 * keine impliziten Zusagen über nicht vorhandene reale Kontaktwege).
 */

export type LandingpagePractice = {
  name: string;
  city: string;
  phoneDisplay: string;
  phoneHref: string;
  /** Ziel für "Termin/Beratung anfragen" — bei Individualisierung auf das echte Buchungs-/Kontaktformular der Praxis setzen. */
  contactUrl: string;
  address: string;
};

export const GENERIC_PRACTICE: LandingpagePractice = {
  name: "Ihre Zahnarztpraxis",
  city: "Ihre Stadt",
  phoneDisplay: "0XXX XXXXXXX",
  phoneHref: "tel:+49",
  contactUrl: "#kontakt",
  address: "Musterstraße 1, 00000 Ihre Stadt",
};

/**
 * Query-Parameter, mit denen die Konfigurations-Vorschau (siehe
 * components/profile/practice-solution-inquiry-sheet.tsx) echte Praxisdaten auf die
 * sonst generische Vorlage überträgt. Nur Anzeige — keine Speicherung, kein Versand.
 */
export const PREVIEW_PRACTICE_PARAMS = {
  name: "pname",
  city: "pcity",
  phone: "pphone",
  address: "paddress",
} as const;

function telHref(phoneDisplay: string): string {
  const digits = phoneDisplay.replace(/[^\d+]/g, "");
  return digits ? `tel:${digits}` : GENERIC_PRACTICE.phoneHref;
}

/** Baut aus einer (optionalen) echten Praxis + GENERIC_PRACTICE-Fallback ein vollständiges Objekt. */
export function mergePracticeOverride(
  overrides: Partial<Pick<LandingpagePractice, "name" | "city" | "phoneDisplay" | "address">>
): LandingpagePractice {
  const phoneDisplay = overrides.phoneDisplay?.trim() || GENERIC_PRACTICE.phoneDisplay;
  return {
    name: overrides.name?.trim() || GENERIC_PRACTICE.name,
    city: overrides.city?.trim() || GENERIC_PRACTICE.city,
    phoneDisplay,
    phoneHref: telHref(phoneDisplay),
    contactUrl: GENERIC_PRACTICE.contactUrl,
    address: overrides.address?.trim() || GENERIC_PRACTICE.address,
  };
}

/** Liest die Praxis-Override-Query-Parameter aus einer URLSearchParams-Instanz. */
export function readPracticeOverrideFromSearchParams(
  params: URLSearchParams
): LandingpagePractice {
  return mergePracticeOverride({
    name: params.get(PREVIEW_PRACTICE_PARAMS.name) ?? undefined,
    city: params.get(PREVIEW_PRACTICE_PARAMS.city) ?? undefined,
    phoneDisplay: params.get(PREVIEW_PRACTICE_PARAMS.phone) ?? undefined,
    address: params.get(PREVIEW_PRACTICE_PARAMS.address) ?? undefined,
  });
}
