/**
 * Your Dentist — öffentliche Bento-Landing (IA + Copy).
 */

export const BENTO_SECTIONS = {
  hero: "hero",
  plattform: "plattform",
  journey: "journey",
  heilung: "heilung",
  command: "command",
  automation: "automation",
  services: "services",
  warum: "warum",
  faq: "faq",
  demo: "demo",
} as const;

export const BENTO_NAV = [
  { label: "Plattform", sectionId: BENTO_SECTIONS.plattform },
  { label: "Patient Journey", sectionId: BENTO_SECTIONS.journey },
  { label: "Services", sectionId: BENTO_SECTIONS.services },
  { label: "Warum", sectionId: BENTO_SECTIONS.warum },
  { label: "FAQ", sectionId: BENTO_SECTIONS.faq },
] as const;

export const BENTO_HERO = {
  badge: "Practice Operating System",
  title: "The Digital Operating System for Modern Dental Practices.",
  subtitle:
    "Patient communication, AI-assisted workflows, digital aftercare, team coordination and practice growth in one platform.",
  primaryCta: "Demo buchen",
  secondaryCta: "Plattform entdecken",
  signInPrefix: "Bereits registriert?",
  signInLabel: "Anmelden",
} as const;

export const BENTO_KPIS = [
  { value: "−40%", label: "weniger Telefonate", trend: "+12% Praxen", tone: "primary" as const },
  { value: "<2h", label: "Ø Antwortzeit", trend: "Patientenanfragen", tone: "neutral" as const },
  { value: "1", label: "Plattform", trend: "Atlas · Tracker · Relay", tone: "neutral" as const },
  { value: "DSGVO", label: "konform", trend: "EU-Hosting", tone: "trust" as const },
] as const;

export const BENTO_PLATFORM = {
  badge: "Die Plattform",
  title: "Fünf Module. Ein Praxisbetrieb.",
  lead: "Atlas, Tracker, Relay, Journals und Command AI — verbunden am Patientenfall.",
  modules: [
    {
      id: "atlas",
      name: "Atlas",
      hint: "Prioritäten, Entscheidungen, Morning Briefing",
      accent: "#2F63B7",
    },
    {
      id: "tracker",
      name: "Tracker",
      hint: "Einsendungen, Fotos, Fälle, Verlauf",
      accent: "#3A6FA8",
    },
    {
      id: "relay",
      name: "Relay",
      hint: "Team, Aufgaben, Freigaben, Übergaben",
      accent: "#254E94",
    },
    {
      id: "journals",
      name: "Journals",
      hint: "Praxiswissen für Patient:innen",
      accent: "#4A7BB5",
    },
    {
      id: "command",
      name: "Command AI",
      hint: "Diktat, Entwürfe, Aufgaben — mit Freigabe",
      accent: "#1A4F9C",
    },
  ],
} as const;

export const BENTO_JOURNEY = {
  badge: "Patient Journey",
  title: "Vom QR-Code bis zur Nachsorge",
  lead: "Strukturierter Weg — ohne WhatsApp-Chaos.",
  steps: [
    { id: "qr", label: "QR-Code", desc: "Patient scannt in der Praxis" },
    { id: "upload", label: "Foto-Upload", desc: "Sichere Einsendung" },
    { id: "ai", label: "KI-Vorbereitung", desc: "Struktur & Entwurf" },
    { id: "review", label: "Praxisprüfung", desc: "Ärztliche Freigabe" },
    { id: "reply", label: "Antwort", desc: "Professionell versendet" },
    { id: "care", label: "Nachsorge", desc: "Verlauf & Recall" },
  ],
} as const;

export const BENTO_HEALING = {
  badge: "Fotoverlauf",
  title: "Heilungs- und Behandlungsverläufe",
  lead: "Vorher/Nachher, Timeline, Nachsorge — am Fall dokumentiert.",
  cases: [
    { id: "implant", label: "Implantate", phases: ["Tag 0", "Woche 2", "Monat 3", "Abschluss"] },
    { id: "endo", label: "Wurzelkanal", phases: ["Diagnose", "Behandlung", "Kontrolle", "Ergebnis"] },
    { id: "schiene", label: "Schienen", phases: ["Abdruck", "Anpassung", "Kontrolle", "Stabil"] },
    { id: "nachsorge", label: "Nachsorge", phases: ["OP", "Woche 1", "Monat 1", "Jahr 1"] },
  ],
} as const;

export const BENTO_COMMAND = {
  badge: "Command AI",
  title: "Assistenz mit ärztlicher Kontrolle",
  lead: "Diktat, Entwürfe und Aufgaben — Freigabe bleibt bei Ihnen.",
  features: [
    { label: "Diktat", desc: "Sprache zu strukturiertem Text" },
    { label: "Antwortentwürfe", desc: "Patientenantworten vorbereitet" },
    { label: "Zusammenfassungen", desc: "Fall auf einen Blick" },
    { label: "Aufgaben", desc: "Automatisch für Relay" },
    { label: "Terminempfehlungen", desc: "Kontextbasiert" },
    { label: "Freigabeprozess", desc: "Nichts ohne Prüfung" },
  ],
  demoPhrase: "Patientin informieren und Recall für nächste Woche vorbereiten",
} as const;

export const BENTO_AUTOMATION = {
  badge: "Praxisautomatisierung",
  title: "Weniger Verwaltung. Mehr Behandlung.",
  lead: "Wiederkehrende Abläufe laufen strukturiert — mit Freigabe wo nötig.",
  items: [
    { label: "Recall", desc: "Serien & Bestätigungen" },
    { label: "Wartelisten", desc: "Lücken intelligent füllen" },
    { label: "Nachsorge-Journeys", desc: "Automatisierte Verläufe" },
    { label: "Wiederkehrende Aufgaben", desc: "Relay-Routinen" },
    { label: "Terminvorschläge", desc: "Kontext aus dem Fall" },
    { label: "Praxisstatus", desc: "Atlas-Überblick" },
  ],
} as const;

export const BENTO_SERVICES = {
  badge: "Landingpage Services",
  title: "Beautiful Landing Pages for Every Dental Service.",
  lead: "Premium-Websites und Patientenportale — designt, gebaut und betreut für Ihre Praxis.",
  cards: [
    {
      id: "implant",
      title: "Implantologie",
      desc: "Chirurgie & Prothetik — hochwertig erklärt",
      image:
        "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "invisalign",
      title: "Invisalign",
      desc: "Unsichtbare Aligner — klar kommuniziert",
      image:
        "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "bleaching",
      title: "Bleaching",
      desc: "Ästhetik mit Vertrauen",
      image:
        "https://images.unsplash.com/photo-1598256989800-fe5f95da9787?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "aesthetik",
      title: "Ästhetik",
      desc: "Veneers, Smile Design, Beratung",
      image:
        "https://images.unsplash.com/photo-1629909613654-28e377b93888?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "oralchirurgie",
      title: "Oralchirurgie",
      desc: "OPs & Aufklärung professionell",
      image:
        "https://images.unsplash.com/photo-1588776814546-1ffca47267a5?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "prophylaxe",
      title: "Prophylaxe",
      desc: "Recall & Prävention",
      image:
        "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "smilescan",
      title: "SmileScan",
      desc: "Digitale Ersteinschätzung",
      image:
        "https://images.unsplash.com/photo-1579684385127-1ef15d508a1e?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "recruiting",
      title: "Recruiting",
      desc: "Team & Karriere-Seiten",
      image:
        "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "standorte",
      title: "Standorte",
      desc: "Multi-Standort-Präsenz",
      image:
        "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "websites",
      title: "Praxis-Websites",
      desc: "Komplette digitale Präsenz",
      image:
        "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "beratung",
      title: "Online-Beratung",
      desc: "Remote-Erstgespräche",
      image:
        "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "portale",
      title: "Patientenportale",
      desc: "Upload, Verlauf, Kommunikation",
      image:
        "https://images.unsplash.com/photo-1551434678-e076c223a692?auto=format&fit=crop&w=800&q=80",
    },
  ],
} as const;

export const BENTO_WARUM = {
  badge: "Warum Your Dentist",
  title: "Messbarer Praxisnutzen",
  items: [
    { value: "−40%", label: "Weniger Telefon", detail: "Strukturierte Eingänge statt Rückruf-Ketten" },
    { value: "2×", label: "Schnellere Antworten", detail: "KI-Vorbereitung mit Freigabe" },
    { value: "↑", label: "Bessere Nachsorge", detail: "Verläufe & Recall am Fall" },
    { value: "−30%", label: "Weniger Verwaltung", detail: "Relay & Automatisierung" },
    { value: "↑", label: "Patientenbindung", detail: "Transparenz & Verlässlichkeit" },
  ],
} as const;

export const BENTO_FAQ = {
  badge: "FAQ",
  title: "Häufig gestellte Fragen",
  items: [
    {
      q: "Ersetzt Your Dentist meine Praxissoftware?",
      a: "Nein. Your Dentist ist die digitale Schicht für Kommunikation, Fälle, Team und Patientenwege — ergänzend zu Ihrer bestehenden Software.",
    },
    {
      q: "Wie sicher sind Patientendaten?",
      a: "Übertragung verschlüsselt, Speicherung in der EU, Zugriff nur für autorisierte Praxisteam-Mitglieder. Freigaben und Versand bleiben unter Ihrer Kontrolle.",
    },
    {
      q: "Was kostet die Plattform?",
      a: "Transparente Praxiszugänge nach Praxisgröße. Wir besprechen das im Demo-Gespräch — ohne versteckte Kosten.",
    },
    {
      q: "Wie lange dauert die Einführung?",
      a: "Typisch wenige Wochen: Analyse, Einrichtung, Teamstart und Begleitung — kein Großprojekt.",
    },
    {
      q: "Bieten Sie auch Landingpages an?",
      a: "Ja. Landingpage Services ist ein eigener Bereich: Premium-Websites für Implantologie, Invisalign, SmileScan und mehr — inklusive Design und Betreuung.",
    },
    {
      q: "Kann Command AI automatisch an Patienten senden?",
      a: "Nein. Command AI bereitet vor — Freigabe und Versand erfolgen erst nach Ihrer Prüfung.",
    },
  ],
} as const;

export const BENTO_CTA = {
  title: "Transform Patient Communication Into A Competitive Advantage.",
  lead: "Sehen Sie in einer Demo, wie Atlas, Tracker, Relay und Command AI zusammenspielen.",
  primaryCta: "Demo buchen",
  secondaryCta: "Beratung vereinbaren",
} as const;

export const BENTO_FOOTER = {
  links: [
    { label: "Trust Center", href: "/trust" },
    { label: "Preise", href: "/#preise" },
    { label: "Anmelden", href: "/login" },
  ],
} as const;
