/**
 * Öffentliche Website — Informationsarchitektur (BEHIVE-Klarheit, Your-Dentist-Wärme).
 */

export const PUBLIC_SITE_SECTIONS = {
  nutzen: "nutzen",
  ablauf: "ablauf",
  command: "command-ai",
  plattform: "plattform",
  fuerWen: "fuer-wen",
  einfuehrung: "einfuehrung",
  /** Scroll target: pricing cards island (desktop) / compact block (mobile). */
  pricing: "pricing",
  demo: "demo",
} as const;

export const PUBLIC_SITE_NAV = [
  { label: "Nutzen", sectionId: PUBLIC_SITE_SECTIONS.nutzen },
  { label: "Command AI", sectionId: PUBLIC_SITE_SECTIONS.command },
  { label: "Relay", sectionId: PUBLIC_SITE_SECTIONS.plattform },
  { label: "Für wen", sectionId: PUBLIC_SITE_SECTIONS.fuerWen },
  { label: "Preise", sectionId: PUBLIC_SITE_SECTIONS.pricing },
  { label: "Demo", sectionId: PUBLIC_SITE_SECTIONS.demo },
] as const;

/** Mobile Landing — kompakte Scroll-IA (ohne Desktop-Only-Sektionen). */
export const PUBLIC_SITE_NAV_MOBILE = [
  { label: "Nutzen", sectionId: PUBLIC_SITE_SECTIONS.nutzen },
  { label: "Für wen", sectionId: PUBLIC_SITE_SECTIONS.fuerWen },
  { label: "Einführung", sectionId: PUBLIC_SITE_SECTIONS.einfuehrung },
  { label: "Preise", sectionId: PUBLIC_SITE_SECTIONS.pricing },
  { label: "Demo", sectionId: PUBLIC_SITE_SECTIONS.demo },
] as const;

export const PUBLIC_SITE_HERO = {
  eyebrow: "Intelligente Praxiskommunikation",
  title: "Patient:innen senden ein — Ihre Praxis antwortet strukturiert.",
  titleLine2: "",
  lead:
    "Your Dentist ordnet Anliegen und Fotos, bereitet Schritte mit Command AI vor und hält Team, Aufgaben und Relay an einem ruhigen Arbeitsplatz.",
  primaryCta: "Praxis registrieren",
  secondaryCta: "Live-Einblick ansehen",
  signInPrefix: "Bereits registriert?",
  signInLabel: "Anmelden",
  bullets: [
    "Patient:innen senden Anliegen und Fotos digital.",
    "Eingänge werden strukturiert und priorisiert.",
    "Command AI bereitet Antworten und Aufgaben vor.",
    "Team arbeitet am Fall — mit Relay und Aufgaben.",
  ],
} as const;

export const PUBLIC_SITE_NUTZEN = {
  eyebrow: "Nutzen",
  title: "Was sich im Praxisalltag ändert",
  lead: "Bessere Patientenkommunikation, schnellere Einschätzung, weniger manuelle Abstimmung.",
  cards: [
    {
      id: "eingang",
      title: "Anliegen und Fotos strukturiert empfangen",
      body: "Patient:innen reichen Informationen über einen klaren digitalen Weg ein, statt über Telefon, E-Mail oder Messenger.",
      label: "Patienteneingänge",
    },
    {
      id: "kommunikation",
      title: "Abstimmung direkt am Fall",
      body: "Rückfragen, Übergaben und Teamnotizen bleiben dort, wo sie hingehören: am Patientenfall.",
      label: "Interne Kommunikation",
    },
    {
      id: "aufgaben",
      title: "Wiederkehrende Abläufe im Blick",
      body: "Erinnerungen, Aufgaben und Praxisroutinen lassen sich ruhig planen und nachvollziehen.",
      label: "Aufgaben & Routinen",
    },
    {
      id: "command",
      title: "Leise Unterstützung im Hintergrund",
      body: "Command AI hilft bei Prioritäten, nächsten Schritten und vorbereiteten Antworten, ohne den Arbeitsfluss zu stören.",
      label: "Command AI",
    },
  ],
} as const;

export const PUBLIC_SITE_COMMAND = {
  eyebrow: "Command AI",
  title: "Ein Befehl. Der nächste Schritt ist vorbereitet.",
  lead:
    "Sie formulieren, was als Nächstes passieren soll — Command AI bereitet Nachricht, Aufgabe und Teamhinweis strukturiert vor. Freigabe und Versand bleiben bei Ihnen.",
  exampleCommand: "Patient Müller Termin anbieten",
  outcomes: [
    {
      label: "Nachricht vorbereitet",
      detail: "Entwurf zur Patienten-Rückmeldung — kein automatischer Versand.",
    },
    {
      label: "Aufgabe erstellt",
      detail: "Rückruf oder Termin in Relay und Aufgaben sichtbar.",
    },
    {
      label: "Team informiert",
      detail: "Rezeption und Assistenz sehen die Übergabe am Fall.",
    },
  ],
} as const;

export const PUBLIC_SITE_FUER_WEN = {
  eyebrow: "Für wen",
  title: "Für Praxen, die Struktur wollen — ohne Kälte",
  cards: [
    {
      title: "Einzelpraxen",
      body: "Für Praxen, die Patienteneingänge und interne Rückfragen sauberer bündeln möchten.",
    },
    {
      title: "Mehrbehandlerpraxen",
      body: "Für Teams, in denen mehrere Personen an Fällen, Aufgaben und Rückmeldungen beteiligt sind.",
    },
    {
      title: "Praxismanagement",
      body: "Für Leitung und Organisation, die Überblick über Aufgaben, Routinen und offene Übergaben braucht.",
    },
    {
      title: "Rezeption & Assistenz",
      body: "Für Teams, die weniger Telefonchaos und klarere interne Kommunikation wünschen.",
    },
  ],
} as const;

export const PUBLIC_SITE_EINFUEHRUNG = {
  eyebrow: "Einführung",
  title: "Ruhig starten — Schritt für Schritt",
  lead: "Kein komplexes Setup. Ein klarer Weg in den geschützten Praxisbereich.",
  steps: [
    {
      num: "01",
      title: "Praxisbereich anlegen",
      body: "Basisdaten erfassen und geschützten Praxisbereich vorbereiten.",
    },
    {
      num: "02",
      title: "Patienteneingang aktivieren",
      body: "Öffentlichen Praxislink und Upload-Weg für Patient:innen bereitstellen.",
    },
    {
      num: "03",
      title: "Team & Rollen einrichten",
      body: "Teammitglieder, Zuständigkeiten und interne Abläufe strukturieren.",
    },
    {
      num: "04",
      title: "Ruhig starten",
      body: "Eingänge, Aufgaben, Erinnerungen und interne Kommunikation im Alltag nutzen.",
    },
  ],
} as const;

export const PUBLIC_SITE_PRICING = {
  eyebrow: "Praxiszugang",
  title: "Zugang für Ihre Praxis anfordern",
  lead: "Wählen Sie den Abrechnungsrhythmus. Nach Prüfung öffnet sich Ihr geschützter Praxisbereich.",
} as const;

export const PUBLIC_SITE_DEMO = {
  eyebrow: "Live-Einblick",
  title: "Demo buchen",
  lead:
    "Kurzer Einblick in Eingang, Relay, Aufgaben und Command AI — wir melden uns mit einem Terminvorschlag.",
  submitLabel: "Anfrage absenden",
  submitPending: "Wird gesendet …",
  note: "Für Praxisinhaber:innen und Teams, die Eingang und interne Abstimmung strukturieren möchten. Ihre Angaben werden nur zur Terminvereinbarung genutzt.",
  successTitle: "Anfrage ist eingegangen",
  successBody:
    "Vielen Dank — wir melden uns in Kürze per E-Mail mit einem ruhigen Terminvorschlag für den Live-Einblick.",
  successAnother: "Weitere Anfrage",
} as const;

export const PUBLIC_SITE_FOOTER = {
  tagline: "Neutral Practice Platform",
  links: [
    { label: "Datenschutz", href: "/datenschutz" },
    { label: "Impressum", href: "/impressum" },
    { label: "Demo buchen", href: `/#${PUBLIC_SITE_SECTIONS.demo}` },
  ],
} as const;
