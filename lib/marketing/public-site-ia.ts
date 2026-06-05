/**
 * Öffentliche Website — Informationsarchitektur & Copy.
 * Editorial Premium Medical — WARUM, nicht WAS.
 */

import type { RegisterPlanId } from "@/lib/auth/register-plans";
import { PUBLIC_BRAND_TAGLINE } from "@/lib/brand/constants";

export const PUBLIC_SITE_SECTIONS = {
  praxisalltag: "praxisalltag",
  patienten: "patienten",
  team: "team",
  loesung: "loesung",
  plattform: "plattform",
  pricing: "preise",
  demo: "demo",
} as const;

export const PUBLIC_SITE_NAV = [
  { label: "Praxisalltag", sectionId: PUBLIC_SITE_SECTIONS.praxisalltag },
  { label: "Lösung", sectionId: PUBLIC_SITE_SECTIONS.loesung },
  { label: "Plattform", sectionId: PUBLIC_SITE_SECTIONS.plattform },
  { label: "Preise", sectionId: PUBLIC_SITE_SECTIONS.pricing },
] as const;

export const PUBLIC_SITE_NAV_MOBILE = [
  { label: "Warum", sectionId: PUBLIC_SITE_SECTIONS.praxisalltag },
  { label: "Preise", sectionId: PUBLIC_SITE_SECTIONS.pricing },
  { label: "Gespräch", sectionId: PUBLIC_SITE_SECTIONS.demo },
] as const;

export const PUBLIC_SITE_HERO = {
  eyebrow: "Digitale Infrastruktur für Zahnarztpraxen",
  title: "Ruhe im Praxisalltag.",
  titleLine2: "Vertrauen bei Patient:innen.",
  titleMobile: "Ruhe im Praxisalltag. Vertrauen bei Patient:innen.",
  lead:
    "Your Dentist ist die digitale Schicht Ihrer Praxis — nicht ein weiteres System, sondern Struktur für Kommunikation, Verantwortung und Übersicht.",
  leadMobile:
    "Struktur für Kommunikation, Verantwortung und Übersicht — ohne ein weiteres System.",
  primaryCta: "Gespräch vereinbaren",
  secondaryCta: "Praxiszugang anfordern",
  signInPrefix: "Bereits registriert?",
  signInLabel: "Anmelden",
} as const;

export const PUBLIC_SITE_PRAXISALLTAG = {
  eyebrow: "Der Alltag",
  title: "Informationen gehen verloren — nicht aus Nachlässigkeit, sondern aus Tempo.",
  /** Mobile — ein Absatz, kein Scroll-Marathon */
  bodyMobile:
    "Telefon, Messenger und Zettel laufen parallel — Details fehlen, wenn es schnell gehen muss. Your Dentist bündelt Eingänge, Übergaben und Verantwortung an einem Ort.",
  paragraphs: [
    "Zwischen Telefon, Messenger, Zetteln und Rückfragen entsteht Lücken. Details fehlen, wenn es im Behandlungszimmer schnell gehen muss. Bilder verlaufen sich auf privaten Geräten. Übergaben erreichen nicht die richtige Person.",
    "Das ist kein Organisationsproblem Ihres Teams. Es ist die Realität moderner Zahnarztpraxen — zu viele Kanäle, zu wenig gemeinsamer Kontext.",
  ],
} as const;

export const PUBLIC_SITE_PATIENTEN = {
  eyebrow: "Patient:innen",
  title: "Unsicherheit, wenn Antworten ausbleiben",
  body:
    "Patient:innen warten auf Rückmeldung, verstehen nicht, ob ihre Anliegen angekommen sind, und rufen erneut an. Nicht weil die Praxis untätig ist — sondern weil der Weg von der Anfrage zur Antwort unsichtbar bleibt.",
} as const;

export const PUBLIC_SITE_TEAM = {
  eyebrow: "Praxisteam",
  title: "Kontextverlust zwischen Vorbereitung und Übergabe",
  body:
    "Assistenz, Empfang und Behandlung arbeiten parallel — aber nicht immer am selben Bild. Doppelte Rückfragen, unterbrochene Abläule, Wissen, das in Köpfen statt am Fall hängt. Jede Unterbrechung kostet Ruhe.",
} as const;

export const PUBLIC_SITE_LOESUNG = {
  eyebrow: "Your Dentist",
  title: "Struktur statt Weiterleitung",
  lead: "Your Dentist ersetzt keine Menschen. Es schafft einen gemeinsamen Ort für das, was sonst verstreut ist.",
  pillars: [
    {
      label: "Übersicht",
      body: "Eingänge, Fälle und offene Schritte an einem Ort — nicht verteilt über Telefon, E-Mail und Messenger.",
    },
    {
      label: "Kommunikation",
      body: "Interne Übergaben und Rückfragen am Fall — nachvollziehbar für alle, die mitverantworten.",
    },
    {
      label: "Verantwortung",
      body: "Klare Zuständigkeiten ohne Zettelwirtschaft. Wer antwortet, wer bereitet vor, wer gibt frei.",
    },
    {
      label: "Ruhe",
      body: "Weniger Unterbrechungen im Behandlungszimmer. Mehr Verlässlichkeit nach außen.",
    },
  ],
} as const;

export const PUBLIC_SITE_PLATTFORM = {
  eyebrow: "Die Plattform",
  title: "Ein zusammenhängendes System",
  lead:
    "Die Module erscheinen erst, wenn die Struktur steht — nicht als Feature-Liste, sondern als Teile derselben Praxis.",
  modules: [
    {
      id: "atlas",
      name: "Atlas",
      hint: "Entscheidungen, Prioritäten, Überblick",
    },
    {
      id: "tracker",
      name: "Tracker",
      hint: "Fälle, Eingänge, Patientenwege",
    },
    {
      id: "relay",
      name: "Relay",
      hint: "Team, Aufgaben, interne Übergaben",
    },
    {
      id: "journal",
      name: "Journal",
      hint: "Patientenwissen Ihrer Praxis",
    },
    {
      id: "command",
      name: "Command AI",
      hint: "Leise Assistenz — Freigabe bleibt bei Ihnen",
    },
  ],
} as const;

export const PUBLIC_SITE_FUER_WEN = {
  eyebrow: "Für Praxen",
  title: "Für jede Praxisgröße",
  cards: [] as readonly { title: string; body: string }[],
} as const;

export const PUBLIC_SITE_EINFUEHRUNG = {
  eyebrow: "Einführung",
  title: "",
  steps: [] as readonly { num: string; title: string }[],
} as const;

export const PUBLIC_SITE_PRICING = {
  eyebrow: "Praxiszugang",
  title: "Transparente Praxiszugänge",
  lead: "Nach kurzer Prüfung öffnet sich Ihr geschützter Praxisbereich — ruhig eingeführt, klar nutzbar.",
} as const;

export function getPublicPricingPlanCta(planId: RegisterPlanId): string {
  return planId === "yearly" ? "Jährlichen Zugang anfordern" : "Zugang anfordern";
}

export const PUBLIC_SITE_DEMO = {
  eyebrow: "Gespräch",
  title: "Gespräch vereinbaren",
  lead: "Wir zeigen Ihnen, wie Your Dentist in Ihren Praxisalltag passt — ohne Verkaufsdruck, in Ruhe.",
  trustNote: "Keine automatische Freischaltung — wir melden uns persönlich mit einem Terminvorschlag.",
  submitLabel: "Anfrage senden",
  submitPending: "Wird gesendet …",
  note: "Ihre Angaben werden nur zur Terminvereinbarung genutzt.",
  successTitle: "Anfrage ist eingegangen",
  successBody: "Wir melden uns mit einem Terminvorschlag.",
  successAnother: "Weitere Anfrage",
} as const;

export const PUBLIC_SITE_FOOTER = {
  tagline: PUBLIC_BRAND_TAGLINE,
  links: [
    { label: "Datenschutz", href: "/datenschutz" },
    { label: "Impressum", href: "/impressum" },
    { label: "Gespräch vereinbaren", href: `/#${PUBLIC_SITE_SECTIONS.demo}` },
    { label: "Anmelden", href: "/login" },
  ],
} as const;

/** @deprecated Legacy — nicht mehr auf Landing */
export const PUBLIC_SITE_SECTIONS_LEGACY = {
  problem: "problem",
  perspektive: "perspektive",
  nutzen: "funktionen",
  ablauf: "loesung",
  command: "command-ai",
  plattform: "plattform",
  fuerWen: "fuer-praxen",
  einfuehrung: "einfuehrung",
} as const;

export const PUBLIC_SITE_PROBLEM = PUBLIC_SITE_PRAXISALLTAG;
export const PUBLIC_SITE_PERSPECTIVE = {
  title: "",
  titleLine2: "",
  patient: { label: "", items: [] as const },
  practice: { label: "", items: [] as const },
};
export const PUBLIC_SITE_NUTZEN = {
  eyebrow: "",
  title: "",
  cards: [] as readonly { id: string; label: string; body: string }[],
};
export const PUBLIC_SITE_ABLAUF = {
  eyebrow: "",
  title: "",
  steps: [] as readonly { num: string; phase: string; body: string }[],
};
export const PUBLIC_SITE_COMMAND = {
  eyebrow: "",
  title: "",
  lead: "",
  demos: [] as readonly { command: string; outcomes: readonly string[] }[],
};
export const PUBLIC_SITE_RELAY = {
  eyebrow: "",
  title: "",
  lead: "",
  capabilities: [] as readonly string[],
};
export const PUBLIC_SITE_HERO_PREVIEW = {
  intakeTitle: "",
  intakeChecks: [] as readonly string[],
  commandLabel: "",
  commandPhrase: "",
  commandOutcomes: [] as readonly string[],
};
