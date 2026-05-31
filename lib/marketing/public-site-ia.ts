/**
 * Öffentliche Website — Informationsarchitektur & Copy.
 */

export const PUBLIC_SITE_SECTIONS = {
  problem: "problem",
  nutzen: "nutzen",
  ablauf: "ablauf",
  command: "command-ai",
  plattform: "plattform",
  fuerWen: "fuer-wen",
  einfuehrung: "einfuehrung",
  pricing: "pricing",
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
  eyebrow: "Intelligente Praxiskommunikation",
  title: "Jede Anfrage.",
  titleLine2: "Klar erfasst.",
  titleLine3: "Sicher weitergeführt.",
  titleMobile: "Jede Anfrage. Klar erfasst. Sicher weitergeführt.",
  lead:
    "Your Dentist bündelt Patientenanfragen, Bilder und interne Abstimmung an einem Ort. Ihr Team erkennt Prioritäten schneller und führt jeden Fall strukturiert weiter.",
  primaryCta: "Demo buchen",
  secondaryCta: "Zugang anfordern",
  signInPrefix: "Bereits registriert?",
  signInLabel: "Anmelden",
  whisper: "Weniger suchen. Weniger nachfragen. Weniger wiederholen.",
} as const;

/** Hero-Produktvorschau — abstrakt, ohne Patientendaten */
export const PUBLIC_SITE_HERO_PREVIEW = {
  intakeTitle: "Neue Anfrage",
  intakeChecks: [
    "Fotos erhalten",
    "Anliegen strukturiert",
    "Priorität erkannt",
  ] as const,
  commandLabel: "Command AI",
  commandPhrase: "Antwort vorbereiten",
  commandOutcomes: ["Nachricht erstellt", "Aufgabe übergeben"] as const,
} as const;

export const PUBLIC_SITE_PROBLEM = {
  eyebrow: "Alltag",
  title: "Wo heute Informationen verloren gehen",
  pains: [
    { label: "Anrufe", detail: "ohne Kontext, ohne Übergabe" },
    { label: "Bilder", detail: "auf privaten Geräten" },
    { label: "Nachfragen", detail: "im Team, ohne Stand" },
    { label: "Notizen", detail: "ohne klaren nächsten Schritt" },
  ],
} as const;

export const PUBLIC_SITE_ABLAUF = {
  eyebrow: "Ablauf",
  title: "Ein klarer Weg für jede Anfrage.",
  steps: [
    { num: "01", phase: "Eingang", body: "Patient sendet Anliegen" },
    { num: "02", phase: "Analyse", body: "Your Dentist strukturiert Informationen" },
    { num: "03", phase: "Team", body: "Aufgabe wird übergeben" },
    { num: "04", phase: "Antwort", body: "Patient erhält Rückmeldung" },
  ],
} as const;

export const PUBLIC_SITE_NUTZEN = {
  eyebrow: "Funktionen",
  title: "Ein Workspace für den Praxisalltag",
  lead: "Eine Anfrage kommt rein. Ihr Team weiß, was als Nächstes passiert.",
  cards: [
    {
      id: "eingang",
      title: "Anfragen und Fotos an einem Ort",
      body: "Kein Suchen in E-Mail, Messenger oder privaten Handys.",
      label: "Eingang",
    },
    {
      id: "kommunikation",
      title: "Abstimmung am Fall",
      body: "Übergaben und Rückfragen bleiben beim Patientenfall — nicht im Chat-Chaos.",
      label: "Team",
    },
    {
      id: "aufgaben",
      title: "Aufgaben mit Verantwortung",
      body: "Rückrufe, Routinen und Erinnerungen sind sichtbar zugeordnet.",
      label: "Aufgaben",
    },
    {
      id: "command",
      title: "Nächste Schritte vorbereitet",
      body: "Command AI bereitet Antworten und Aufgaben vor — Sie geben frei.",
      label: "Command AI",
    },
  ],
} as const;

export const PUBLIC_SITE_COMMAND = {
  eyebrow: "Command AI",
  title: "Kleine Schritte, bevor sie den Tag unterbrechen",
  lead:
    "Sie sagen, was passieren soll. Command AI bereitet Nachricht, Aufgabe und Teamhinweis vor — Freigabe bleibt bei Ihnen.",
  exampleCommand: "Antwort vorbereiten",
  examples: [
    "Rückruf vorbereiten",
    "Aufgabe übergeben",
    "Nachricht formulieren",
    "Fall zusammenfassen",
  ] as const,
  outcomes: [
    {
      label: "Nachricht vorbereitet",
      detail: "Entwurf zur Rückmeldung — kein automatischer Versand.",
    },
    {
      label: "Aufgabe erstellt",
      detail: "Rückruf oder Termin im Team sichtbar.",
    },
    {
      label: "Team informiert",
      detail: "Übergabe bleibt am Fall nachvollziehbar.",
    },
  ],
} as const;

export const PUBLIC_SITE_FUER_WEN = {
  eyebrow: "Für Praxen",
  title: "Für jede Praxisgröße — gleiche Struktur",
  cards: [
    {
      title: "Einzelpraxis",
      body: "Eingänge, Fotos und Rückfragen ohne verstreute Kanäle.",
    },
    {
      title: "Mehrbehandlerpraxis",
      body: "Mehrere Behandler, ein klarer Stand pro Anfrage.",
    },
    {
      title: "MVZ",
      body: "Übergaben und Verantwortung über Standorte hinweg nachvollziehbar.",
    },
  ],
} as const;

export const PUBLIC_SITE_EINFUEHRUNG = {
  eyebrow: "Einführung",
  title: "Schritt für Schritt in den Praxisbereich",
  lead: "Kein komplexes Setup — ein klarer Weg zum geschützten Workspace.",
  steps: [
    {
      num: "01",
      title: "Praxisbereich anlegen",
      body: "Geschützten Bereich vorbereiten.",
    },
    {
      num: "02",
      title: "Patienteneingang aktivieren",
      body: "Strukturierten Upload-Weg bereitstellen.",
    },
    {
      num: "03",
      title: "Team einrichten",
      body: "Rollen und Zuständigkeiten festlegen.",
    },
    {
      num: "04",
      title: "Im Alltag nutzen",
      body: "Eingänge, Aufgaben und Übergaben im Tagesablauf.",
    },
  ],
} as const;

export const PUBLIC_SITE_PRICING = {
  eyebrow: "Praxiszugang",
  title: "Transparente Praxiszugänge",
  lead: "Nach Prüfung öffnet sich Ihr geschützter Praxisbereich.",
} as const;

export const PUBLIC_SITE_DEMO = {
  eyebrow: "Live-Einblick",
  title: "Demo buchen",
  lead: "Kurzer Einblick in Eingang, Team und Command AI — wir melden uns mit einem Terminvorschlag.",
  submitLabel: "Anfrage absenden",
  submitPending: "Wird gesendet …",
  note: "Ihre Angaben werden nur zur Terminvereinbarung genutzt.",
  successTitle: "Anfrage ist eingegangen",
  successBody: "Vielen Dank — wir melden uns in Kürze per E-Mail mit einem Terminvorschlag.",
  successAnother: "Weitere Anfrage",
} as const;

export const PUBLIC_SITE_FOOTER = {
  tagline: "Neutral Practice Platform",
  links: [
    { label: "Datenschutz", href: "/datenschutz" },
    { label: "Impressum", href: "/impressum" },
    { label: "Demo buchen", href: `/#${PUBLIC_SITE_SECTIONS.demo}` },
    { label: "Anmelden", href: "/login" },
  ],
} as const;
