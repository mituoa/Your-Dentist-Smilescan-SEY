/** Produktcopy Care Center — kurz, klar, Tracker-Niveau. */

export const JOURNAL_HUB = {
  title: "Care Center",
  essence: "Antworten für Patienten — weniger Standardanrufe.",
} as const;

export const JOURNAL_KI = {
  title: "Patienten-KI",
  badgeActive: "Aktiv",
  badgeSetup: "Einrichten",
  summary: "Beantwortet einfache Fragen — nur aus veröffentlichten Texten.",
  safetyLine: "Keine Diagnose · Keine Entscheidung · Verweis an die Praxis",
  ctaActive: "Assistent öffnen",
  ctaSetup: "Erste Antwort veröffentlichen",
  emptyHint: "Veröffentlichen Sie Texte, damit die KI antworten kann.",
} as const;

export const JOURNAL_SECTION_COPY = {
  faq: {
    title: "Häufigste Patientenfragen",
    lead: "Noch ohne Antwort — sortiert nach typischer Häufigkeit in der Praxis.",
  },
  landscape: {
    title: "Themenbereiche",
    lead: "Abdeckung Ihrer Wissensbibliothek — tippen zum Filtern.",
  },
  library: {
    title: "Bibliothek",
    lead: "Veröffentlichte Antworten für Patienten online.",
    patientView: "Patientenansicht",
  },
  doctorJournal: {
    title: "Arzt-Journal",
    lead: "Erklärungen und Praxiswissen — separat bearbeitet, nicht für die Patienten-KI.",
    newCta: "Neuen Fachtext",
    draftsTitle: "Fachtexte in Arbeit",
    draftsLead: "Entwürfe für Erklärungen und Praxiswissen.",
  },
  patientInfo: {
    title: "Patienten-Informationen",
    lead: "Automatisch aus Einsendungen und veröffentlichten Patientenantworten.",
    signalsTitle: "Aktuelle Anliegen",
    signalsLead: "Aus dem Tracker — ohne manuelle Pflege.",
    signalsEmpty: "Keine aktuellen Einsendungen — neue Fälle erscheinen hier automatisch.",
    publishedTitle: "Für Patienten online",
    publishedLead: "Veröffentlichte FAQ und Nachsorge — Basis für die Patienten-KI.",
    publishedEmpty: "Noch keine Patientenantworten veröffentlicht.",
  },
  questionsColumn: {
    tag: "Patientenfragen & KI",
    title: "Häufige Fragen",
    lead: "Typische Anliegen ohne Antwort — die KI nutzt nur veröffentlichte Texte.",
  },
  quickLinks: {
    title: "Praxis & Fälle",
    lead: "Interne Informationen und Organisation.",
    tracker: "Patientenfälle",
    trackerHint: "Einsendungen, Fotos, interne Notizen",
    appointments: "Termine & Zeiten",
    appointmentsHint: "Öffnungszeiten und Online-Buchung",
    profile: "Praxisprofil",
    profileHint: "Kontakt, Buchungslink, Stammdaten",
  },
} as const;
