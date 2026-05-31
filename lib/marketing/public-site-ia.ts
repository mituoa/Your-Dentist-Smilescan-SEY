/**
 * Öffentliche Website — Informationsarchitektur (BEHIVE-Klarheit, Your-Dentist-Wärme).
 */

export const PUBLIC_SITE_SECTIONS = {
  nutzen: "nutzen",
  fuerWen: "fuer-wen",
  einfuehrung: "einfuehrung",
  /** Scroll target: pricing cards island (desktop) / compact block (mobile). */
  pricing: "pricing",
  demo: "demo",
} as const;

export const PUBLIC_SITE_NAV = [
  { label: "Nutzen", sectionId: PUBLIC_SITE_SECTIONS.nutzen },
  { label: "Für wen", sectionId: PUBLIC_SITE_SECTIONS.fuerWen },
  { label: "Einführung", sectionId: PUBLIC_SITE_SECTIONS.einfuehrung },
  { label: "Preise", sectionId: PUBLIC_SITE_SECTIONS.pricing },
  { label: "Demo buchen", sectionId: PUBLIC_SITE_SECTIONS.demo },
] as const;

/** Mobile Drawer — Sektionen, die auf der Mobilseite vorhanden sind. */
export const PUBLIC_SITE_NAV_MOBILE = [
  { label: "Nutzen", sectionId: PUBLIC_SITE_SECTIONS.nutzen },
  { label: "Preise", sectionId: PUBLIC_SITE_SECTIONS.pricing },
  { label: "Demo buchen", sectionId: PUBLIC_SITE_SECTIONS.demo },
] as const;

export const PUBLIC_SITE_HERO = {
  eyebrow: "Medizinische Praxisinfrastruktur",
  title: "Struktur für Eingang, Team und Fall.",
  titleLine2: "",
  lead: "",
  primaryCta: "Praxis registrieren",
  secondaryCta: "Live-Einblick ansehen",
  signInPrefix: "Bereits registriert?",
  signInLabel: "Anmelden",
  bullets: [
    "Patient:innen senden Fotos und Anliegen ein.",
    "Praxis sichtet strukturiert.",
    "Team kommuniziert am Fall.",
    "Aufgaben, Erinnerungen und Command AI unterstützen ruhig.",
  ],
} as const;

export const PUBLIC_SITE_NUTZEN = {
  eyebrow: "Nutzen",
  title: "Was sich im Praxisalltag ändert",
  lead: "Weniger verstreute Kanäle — mehr Klarheit für Eingang, Team und Übergaben.",
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
  title: "Einen ruhigen Praxisablauf ansehen",
  lead:
    "Wir zeigen Ihnen in einem kurzen Einblick, wie Patienteneingänge, interne Rückfragen, Aufgaben und Command AI in einem Praxisbereich zusammenspielen.",
  primaryCta: "Demo buchen",
  secondaryCta: "Kontakt aufnehmen",
  note: "Ideal für Praxisinhaber:innen, Praxismanagement und Teams, die ihre interne Kommunikation strukturieren möchten.",
  contactHref: "/impressum",
} as const;

export const PUBLIC_SITE_FOOTER = {
  tagline: "Neutral Practice Platform",
  links: [
    { label: "Datenschutz", href: "/datenschutz" },
    { label: "Impressum", href: "/impressum" },
    { label: "Demo buchen", href: `/#${PUBLIC_SITE_SECTIONS.demo}` },
  ],
} as const;
