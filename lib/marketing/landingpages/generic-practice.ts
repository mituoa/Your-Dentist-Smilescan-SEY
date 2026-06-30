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
