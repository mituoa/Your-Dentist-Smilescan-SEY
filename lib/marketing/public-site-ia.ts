/**
 * Öffentliche Website — Informationsarchitektur & Copy.
 */

import type { RegisterPlanId } from "@/lib/auth/register-plans";
import { PUBLIC_BRAND_TAGLINE } from "@/lib/brand/constants";

export const PUBLIC_SITE_SECTIONS = {
  problem: "problem",
  perspektive: "perspektive",
  nutzen: "funktionen",
  ablauf: "loesung",
  command: "command-ai",
  plattform: "plattform",
  fuerWen: "fuer-praxen",
  einfuehrung: "einfuehrung",
  pricing: "preise",
  demo: "demo",
} as const;

export const PUBLIC_SITE_NAV = [
  { label: "Lösung", sectionId: PUBLIC_SITE_SECTIONS.ablauf },
  { label: "Funktionen", sectionId: PUBLIC_SITE_SECTIONS.nutzen },
  { label: "Für Praxen", sectionId: PUBLIC_SITE_SECTIONS.fuerWen },
  { label: "Einführung", sectionId: PUBLIC_SITE_SECTIONS.einfuehrung },
  { label: "Preise", sectionId: PUBLIC_SITE_SECTIONS.pricing },
] as const;

/** Mobile — unverändert bis separater Pass */
export const PUBLIC_SITE_NAV_MOBILE = [
  { label: "Nutzen", sectionId: PUBLIC_SITE_SECTIONS.nutzen },
  { label: "Preise", sectionId: PUBLIC_SITE_SECTIONS.pricing },
  { label: "Demo buchen", sectionId: PUBLIC_SITE_SECTIONS.demo },
] as const;

export const PUBLIC_SITE_HERO = {
  eyebrow: "Praxis-Kommunikation. Strukturiert.",
  title: "Weniger Unterbrechungen",
  titleLine2: "im Praxisalltag.",
  titleMobile: "Weniger Unterbrechungen im Praxisalltag.",
  lead:
    "Patient:innen übermitteln Anliegen und Bilder direkt an die Praxis. Your Dentist bündelt den Eingang, strukturiert Informationen und hält Übergaben, Aufgaben und Antworten am Fall — mit Freigabe durch die Praxis.",
  primaryCta: "Demo buchen",
  secondaryCta: "Zugang anfordern",
  signInPrefix: "Bereits registriert?",
  signInLabel: "Anmelden",
} as const;

/** Hero-Produktvorschau — abstrakt, ohne Patientendaten */
export const PUBLIC_SITE_HERO_PREVIEW = {
  intakeTitle: "Patientenanfrage eingegangen",
  intakeChecks: [
    "Anliegen erhalten",
    "Bilder hinzugefügt",
    "Informationen strukturiert",
  ] as const,
  commandLabel: "Command AI",
  commandPhrase: "Nächsten Schritt vorbereiten",
  commandOutcomes: [
    "Antwort vorbereitet",
    "Aufgabe erstellt",
    "Team informiert",
  ] as const,
} as const;

export const PUBLIC_SITE_PROBLEM = {
  eyebrow: "Alltag",
  title: "Wo heute Informationen verloren gehen",
  pains: [
    { label: "Telefon", detail: "Details fehlen, wenn es im Behandlungszimmer schnell gehen muss." },
    { label: "Bilder", detail: "Verlaufen sich in E‑Mails, Messenger oder auf einzelnen Geräten." },
    { label: "Rückfragen", detail: "Kommen zu spät oder erreichen nicht die richtige Person." },
    { label: "Übergaben", detail: "Kontext fehlt — wer macht was bis wann?" },
  ],
} as const;

export const PUBLIC_SITE_PERSPECTIVE = {
  title: "Einfach für Patient:innen.",
  titleLine2: "Strukturiert für Praxen.",
  patient: {
    label: "Patient:innen",
    items: ["Anliegen senden", "Bilder hinzufügen", "Rückmeldung erhalten"] as const,
  },
  practice: {
    label: "Praxis",
    items: ["Eingang prüfen", "Aufgabe verteilen", "Antwort freigeben"] as const,
  },
} as const;

export const PUBLIC_SITE_ABLAUF = {
  eyebrow: "Ablauf",
  title: "Ein klarer Weg für jede Anfrage.",
  steps: [
    { num: "01", phase: "Eingang", body: "Patient sendet Anliegen und Bilder." },
    { num: "02", phase: "Struktur", body: "Informationen werden geordnet und nachvollziehbar gemacht." },
    { num: "03", phase: "Übergabe", body: "Aufgaben und Rückfragen landen beim richtigen Team‑Slot." },
    { num: "04", phase: "Antwort", body: "Antwort wird vorbereitet und von der Praxis freigegeben." },
  ],
} as const;

export const PUBLIC_SITE_NUTZEN = {
  eyebrow: "Funktionen",
  title: "Ein Arbeitsbereich für Eingang, Team und Antwort.",
  cards: [
    {
      id: "eingang",
      label: "Eingang",
      body: "Anfragen und Bilder an einem Ort — nicht verteilt über Telefon, E‑Mail oder private Geräte.",
    },
    {
      id: "kommunikation",
      label: "Team",
      body: "Rückfragen, Übergaben und Entscheidungen bleiben am Fall — für alle sichtbar.",
    },
    {
      id: "aufgaben",
      label: "Aufgaben",
      body: "Rückrufe, Erinnerungen und Routinen mit klarer Verantwortung — ohne Zettelwirtschaft.",
    },
    {
      id: "command",
      label: "Command AI",
      body: "Antworten und nächste Schritte vorbereiten. Freigabe bleibt bei der Praxis.",
    },
  ],
} as const;

export const PUBLIC_SITE_COMMAND = {
  eyebrow: "Command AI",
  title: "Leise Assistenz im Praxisfluss",
  lead: "Befehle für Organisation und Kommunikation — keine Diagnosen, keine Behandlungsentscheidungen. Freigabe bleibt bei der Praxis.",
  demos: [
    {
      command: "Bitte Patient wegen Termin antworten",
      outcomes: [
        "Antwortentwurf vorbereitet",
        "Rückfrage an Empfang erzeugt",
        "Erinnerung gesetzt",
      ],
    },
    {
      command: "Heutigen Eingang zusammenfassen",
      outcomes: [
        "Neue Anfragen zusammengefasst",
        "Rückrufe markiert",
        "Aufgaben verteilt",
      ],
    },
  ],
} as const;

export const PUBLIC_SITE_RELAY = {
  eyebrow: "Plattform",
  title: "Relay — Kommunikation am Fall",
  lead: "Interne Abstimmung am Fall — ohne Kontextverlust zwischen Telefon, Messenger und E‑Mail.",
  capabilities: [
    "Direktnachrichten",
    "Gruppen",
    "Fallbezogen",
    "Übergaben",
    "Wiederkehrende Aufgaben",
  ] as const,
} as const;

export const PUBLIC_SITE_FUER_WEN = {
  eyebrow: "Für Praxen",
  title: "Für jede Praxisgröße",
  cards: [
    {
      title: "Einzelpraxis",
      body: "Mehr Struktur, ohne mehr Personal — der Eingang bleibt übersichtlich.",
    },
    {
      title: "Mehrbehandlerpraxis",
      body: "Ein gemeinsamer Stand für Ärzt:innen, Assistenz und Empfang.",
    },
    {
      title: "MVZ",
      body: "Übergaben und Verantwortung über Teams und Standorte hinweg.",
    },
  ],
} as const;

export const PUBLIC_SITE_EINFUEHRUNG = {
  eyebrow: "Einführung",
  title: "Ruhig eingeführt. Klar nutzbar.",
  steps: [
    { num: "01", title: "Praxisbereich anlegen" },
    { num: "02", title: "Patienteneingang aktivieren" },
    { num: "03", title: "Team einrichten" },
    { num: "04", title: "Im Alltag nutzen" },
  ],
} as const;

export const PUBLIC_SITE_PRICING = {
  eyebrow: "Praxiszugang",
  title: "Transparente Praxiszugänge",
  lead: "Nach kurzer Prüfung öffnet sich Ihr geschützter Praxisbereich.",
} as const;

/** CTA-Texte nur auf der öffentlichen Landing (#pricing) */
export function getPublicPricingPlanCta(planId: RegisterPlanId): string {
  return planId === "yearly" ? "Jährlichen Zugang anfordern" : "Zugang anfordern";
}

export const PUBLIC_SITE_DEMO = {
  eyebrow: "Live-Einblick",
  title: "Demo buchen",
  lead: "Eingang, Team und Command AI in einem kurzen Termin.",
  trustNote: "Keine automatische Freischaltung — wir melden uns mit einem Terminvorschlag.",
  submitLabel: "Demo anfragen",
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
    { label: "Demo buchen", href: `/#${PUBLIC_SITE_SECTIONS.demo}` },
    { label: "Anmelden", href: "/login" },
  ],
} as const;
