/**
 * Your Dentist — /produkt (Produktübersicht für Zahnärzt:innen & Praxisteams).
 * Eigene Komposition, gleiche Bento-Familie wie die Startseite (public-bento-ia.ts).
 */

export const PRODUCT_OVERVIEW_SECTIONS = {
  hero: "hero",
  workflow: "workflow",
  module: "modul",
  highlights: "funktionen",
  trust: "vertrauen",
  demo: "demo",
} as const;

export const PRODUCT_HERO = {
  badge: "Für Zahnärzt:innen & Praxisteams",
  title: "Das digitale Betriebssystem für moderne Zahnarztpraxen.",
  subtitle:
    "Patientenanfragen, KI-gestützte Vorbereitung, ärztliche Freigabe und Teamaufgaben in einer ruhigen Plattform — weniger Telefonate, schnellere Bearbeitung, bessere Nachverfolgung.",
  primaryCta: "Demo buchen",
  primaryCtaHref: `/#${PRODUCT_OVERVIEW_SECTIONS.demo}`,
  secondaryCta: "Plattform ansehen",
  secondaryCtaHref: `#${PRODUCT_OVERVIEW_SECTIONS.module}`,
  signInPrefix: "Bereits registriert?",
  signInLabel: "Anmelden",
  mock: {
    label: "Tracker · Fall Baysal",
    rows: [
      { tag: "Eingang", text: "Implantat · Tag 7 · Foto" },
      { tag: "Command AI", text: "Entwurf vorbereitet" },
      { tag: "Status", text: "Wartet auf Freigabe" },
    ],
  },
} as const;

export const PRODUCT_WORKFLOW = {
  badge: "Ablauf",
  title: "Ein ruhiger Weg vom ersten Kontakt bis zur Dokumentation.",
  lead: "Patient → KI-Vorbereitung → Praxisentscheidung → Teamumsetzung.",
  steps: [
    { id: "patient", label: "Patient", desc: "Anliegen, Foto oder Beschwerde trifft ein." },
    { id: "struktur", label: "Struktur", desc: "Tracker ordnet alles zu einem Fall." },
    { id: "command", label: "Command AI", desc: "Bereitet Zusammenfassung & Entwurf vor." },
    { id: "freigabe", label: "Freigabe", desc: "Arzt prüft und entscheidet." },
    { id: "team", label: "Team", desc: "Relay verteilt die Aufgabe." },
    { id: "antwort", label: "Antwort", desc: "Patient erhält klare Nachricht." },
    { id: "protokoll", label: "Protokoll", desc: "Fall dokumentiert & nachvollziehbar." },
  ],
} as const;

export const PRODUCT_MODULES = {
  badge: "Die Plattform",
  title: "Fünf Module. Ein Praxisbetrieb.",
  lead: "Keine neuen Module, keine zusätzliche Sidebar — Atlas, Tracker, Relay, Journals und Command AI verbunden am Patientenfall.",
  items: [
    { id: "atlas", name: "Atlas", route: "/dashboard", hint: "Überblick, Prioritäten, Morning Briefing, Entscheidungen", accent: "#2F63B7" },
    { id: "tracker", name: "Tracker", route: "/inbox", hint: "Patientenfälle, Einsendungen, Fotos, Verlauf", accent: "#3A6FA8" },
    { id: "relay", name: "Relay", route: "/relay", hint: "Aufgaben, Team, Umsetzung, Erinnerungen", accent: "#254E94" },
    { id: "journals", name: "Journals", route: "/journal", hint: "Praxiswissen für Patient:innen", accent: "#4A7BB5" },
    { id: "command", name: "Command AI", route: "⌘K / FAB", hint: "Bereitet vor — entscheidet nicht final", accent: "#1A4F9C" },
  ],
} as const;

export const PRODUCT_HIGHLIGHTS = {
  badge: "Im Alltag",
  title: "Drei Funktionen, die im Praxisalltag am meisten verändern.",
  items: [
    {
      id: "einsendung",
      title: "Foto- & Anliegen-Einsendung",
      desc: "Ein strukturierter Fall statt verstreuter WhatsApp-Nachrichten — mit Verlauf über Tag 1, 3, 7 und 14.",
      kind: "tracker" as const,
    },
    {
      id: "command",
      title: "Command AI bereitet vor",
      desc: "Zusammenfassung, Antwortentwurf und nächste Schritte stehen bereit — die Freigabe bleibt bei Ihnen.",
      kind: "device" as const,
    },
    {
      id: "diktat",
      title: "Diktat statt Tippen",
      desc: "Kurz diktiert, Command AI bereitet Nachricht und Aufgabe vor — Sie prüfen und geben frei.",
      kind: "voice" as const,
    },
  ],
} as const;

export const PRODUCT_TRUST = {
  badge: "Verlässlich im Hintergrund",
  title: "Ärztliche Kontrolle bleibt. Die KI bereitet vor — sie entscheidet nicht.",
  items: [
    { label: "Keine automatische Diagnose", desc: "Command AI fasst zusammen und schlägt vor — die fachliche Entscheidung bleibt bei der Praxis." },
    { label: "Kein automatischer Versand", desc: "Antworten und Terminlinks werden erst nach ärztlicher Freigabe versendet." },
    { label: "DSGVO-konform, EU-Hosting", desc: "Patientendaten werden verschlüsselt übertragen und in der EU gespeichert." },
    { label: "Nachvollziehbare Dokumentation", desc: "Jeder Fall bleibt mit Verlauf und Entscheidung im Tracker dokumentiert." },
  ],
} as const;

export const PRODUCT_CTA = {
  title: "Sehen Sie die Plattform an Ihrem eigenen Fallbeispiel.",
  lead: "In einer Demo zeigen wir, wie Atlas, Tracker, Relay und Command AI in Ihrer Praxis zusammenspielen.",
  primaryCta: "Demo buchen",
  secondaryCta: "Registrieren",
} as const;
