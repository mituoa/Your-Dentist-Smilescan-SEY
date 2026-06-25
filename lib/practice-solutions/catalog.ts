export type PracticeSolutionId =
  | "smilescan"
  | "implantologie"
  | "aligner"
  | "kinderzahnheilkunde"
  | "prophylaxe"
  | "aesthetik"
  | "endodontie"
  | "oral-health-pass"
  | "individuell";

export type PracticeSolutionCta = "Landingpage buchen" | "Projekt anfragen";

export type PracticeSolution = {
  id: PracticeSolutionId;
  title: string;
  shortDescription: string;
  suitableFor: string;
  image: string;
  ctaLabel: PracticeSolutionCta;
  detail: {
    description: string;
    scope: readonly string[];
    examplePages: string;
    patientJourney: string;
    leadGeneration: string;
    integration: string;
  };
};

export const PRACTICE_SOLUTIONS_SECTION = {
  eyebrow: "Digitale Praxislösungen",
  title: "Patientengewinnung & Digitale Praxislösungen",
  lead: "Professionelle digitale Lösungen für neue Patientinnen und Patienten, Behandlungsschwerpunkte und Praxiswachstum.",
} as const;

export const PRACTICE_SOLUTION_REQUEST_STATUSES = [
  { id: "received", label: "Anfrage eingegangen" },
  { id: "in_review", label: "In Prüfung" },
  { id: "consultation_scheduled", label: "Beratung vereinbart" },
  { id: "project_started", label: "Projekt gestartet" },
] as const;

export const PRACTICE_SOLUTIONS: readonly PracticeSolution[] = [
  {
    id: "smilescan",
    title: "SmileScan",
    shortDescription: "Digitale Ersteinschätzung",
    suitableFor: "Online-Patientengewinnung",
    image:
      "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&w=1200&q=80",
    ctaLabel: "Projekt anfragen",
    detail: {
      description:
        "Strukturierte digitale Ersteinschätzung für neue Patientinnen — ruhig geführt, medizinisch seriös und direkt an Ihren Praxis-Workflow angebunden.",
      scope: ["Geführter Foto-Upload", "Qualitätsprüfung", "Fallvorbereitung im Tracker", "Freigabe vor Rückmeldung"],
      examplePages: "Fokussierte Einstiegsseite mit klarer Erwartungshaltung und Datenschutzhinweisen.",
      patientJourney: "Anfrage → strukturierte Einsendung → Prüfung im Team → persönliche Rückmeldung.",
      leadGeneration: "Qualifizierte Anfragen statt anonymer Kontaktformulare — mit Kontext für Ihr Team.",
      integration: "Eingänge landen in Your Dentist Tracker; Relay-Aufgaben und Command AI optional vorbereitet.",
    },
  },
  {
    id: "implantologie",
    title: "Implantologie",
    shortDescription: "Implantat-Patienten gewinnen",
    suitableFor: "Beratung & Terminanfragen",
    image:
      "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=1200&q=80",
    ctaLabel: "Landingpage buchen",
    detail: {
      description:
        "Premium-Landing für Implantat-Patientinnen: Vertrauen aufbauen, Erwartungen klären und qualifizierte Beratungstermine anstoßen.",
      scope: ["Behandlungsstory", "Aufklärungsmodule", "Termin- oder Rückruf-Flow", "Praxis-Branding"],
      examplePages: "Chirurgie, Prothetik und Nachsorge als zusammenhängende Patientenreise.",
      patientJourney: "Informieren → Vertrauen → strukturierte Anfrage → Teamübergabe mit Kontext.",
      leadGeneration: "Filtert Motivation und Behandlungsinteresse vor dem ersten Gespräch.",
      integration: "Anfragen als Fall im Tracker; Team-Relay für Beratung und OP-Vorbereitung.",
    },
  },
  {
    id: "aligner",
    title: "Aligner / Invisalign",
    shortDescription: "Ästhetische Zahnkorrektur",
    suitableFor: "Digitale Beratung",
    image:
      "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=1200&q=80",
    ctaLabel: "Landingpage buchen",
    detail: {
      description:
        "Ästhetische Korrektur professionell erklärt — von der ersten Neugier bis zur strukturierten Beratungsanfrage.",
      scope: ["Vorher/Nachher-Narrativ", "Kostenrahmen transparent", "Foto- oder Scan-Einstieg", "Recall-Hooks"],
      examplePages: "Aligner-Schwerpunkt mit klarer Zielgruppenansprache.",
      patientJourney: "Interesse wecken → digitale Vorinformation → qualifizierte Anfrage.",
      leadGeneration: "Jüngere Zielgruppe mit mobilem, vertrauenswürdigem Erstkontakt.",
      integration: "Tracker-Fälle mit Fotoanhang; Journal-Inhalte für Nachsorge verlinkbar.",
    },
  },
  {
    id: "kinderzahnheilkunde",
    title: "Kinderzahnheilkunde",
    shortDescription: "Familienorientierte Landingpage",
    suitableFor: "Terminbuchung",
    image:
      "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=1200&q=80",
    ctaLabel: "Projekt anfragen",
    detail: {
      description:
        "Warme, vertrauensvolle digitale Anlaufstelle für Familien — ohne verspielte Template-Optik.",
      scope: ["Eltern-Ansprache", "Erstbesuch erklärt", "Termin- oder Rückrufmodul", "Praxisteam sichtbar"],
      examplePages: "Kinderfreundlich, aber medizinisch seriös — passend zu Ihrer Praxisidentität.",
      patientJourney: "Eltern informieren sich → buchen oder fragen an → Empfang erhält klaren Kontext.",
      leadGeneration: "Familien-Leads mit Altersspanne und Anliegen strukturiert.",
      integration: "Terminanfragen als Relay-Aufgaben; Journal-FAQ für wiederkehrende Elternfragen.",
    },
  },
  {
    id: "prophylaxe",
    title: "Prophylaxe",
    shortDescription: "Recall- und Präventionskampagnen",
    suitableFor: "Patientenbindung",
    image:
      "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&w=1200&q=80",
    ctaLabel: "Projekt anfragen",
    detail: {
      description:
        "Prävention digital begleiten — Recall, Intervalle und Bindung ohne Massenmail-Charakter.",
      scope: ["Recall-Narrativ", "PZR-Information", "Termin-Erinnerung", "Bestandskunden-Ansprache"],
      examplePages: "Präventions-Schwerpunkt mit klarer Nutzenkommunikation.",
      patientJourney: "Erinnerung → leichte Reaktion → Termin oder Rückfrage im Team.",
      leadGeneration: "Reaktivierung bestehender Patientinnen statt nur Neukundengewinnung.",
      integration: "Relay-Automationen und Atlas-Prioritäten für Recall-Fälle.",
    },
  },
  {
    id: "aesthetik",
    title: "Ästhetische Zahnmedizin",
    shortDescription: "Bleaching · Veneers · Smile Design",
    suitableFor: "Beratung & Terminanfragen",
    image:
      "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=1200&q=80",
    ctaLabel: "Landingpage buchen",
    detail: {
      description:
        "Ästhetik hochwertig positionieren — von Bleaching bis Smile Design, ohne Beauty-Salon-Anmutung.",
      scope: ["Behandlungsübersicht", "Erwartungsmanagement", "Beratungsanfrage", "Vorher/Nachher-Stil"],
      examplePages: "Ästhetik-Portfolio mit ruhiger, medizinischer Bildsprache.",
      patientJourney: "Inspiration → Vertrauen → Beratungstermin mit Vorbereitung.",
      leadGeneration: "Qualifizierte Anfragen mit Behandlungswunsch und Motivation.",
      integration: "Tracker-Fälle mit Foto-Upload; Journal-Artikel für Aufklärung verlinkt.",
    },
  },
  {
    id: "endodontie",
    title: "Endodontie",
    shortDescription: "Wurzelkanalbehandlungen",
    suitableFor: "Aufklärung und Terminanfragen",
    image:
      "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=1200&q=80",
    ctaLabel: "Landingpage buchen",
    detail: {
      description:
        "Komplexe Endodontie verständlich erklären — Angst reduzieren, Vertrauen schaffen, Termine strukturiert annehmen.",
      scope: ["Aufklärung", "Ablauf erklärt", "Überweisungskontext", "Termin- oder Rückrufmodul"],
      examplePages: "Fachlich fundiert, patientenverständlich formuliert.",
      patientJourney: "Sorge → Information → strukturierte Kontaktaufnahme.",
      leadGeneration: "Dringlichkeit und Behandlungskontext für das Team sichtbar.",
      integration: "Eingänge im Tracker mit Priorisierung im Atlas.",
    },
  },
  {
    id: "oral-health-pass",
    title: "Oral Health Pass",
    shortDescription: "Präventionsprogramme",
    suitableFor: "Betriebe · Schulen · Einrichtungen",
    image:
      "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1200&q=80",
    ctaLabel: "Projekt anfragen",
    detail: {
      description:
        "B2B-Präventionsprogramme für Unternehmen und Institutionen — professionell, skalierbar, praxisnah.",
      scope: ["Programm-Story", "Zielgruppen-Ansprache", "Anfrage für Kooperationen", "Reporting-Vorbereitung"],
      examplePages: "Institutionelle Landing mit klarer Wertschöpfung.",
      patientJourney: "Entscheider informiert sich → Anfrage → persönliche Abstimmung.",
      leadGeneration: "B2B-Leads mit Organisation und Bedarf strukturiert.",
      integration: "Team-Workflow in Relay für Kooperationsgespräche.",
    },
  },
  {
    id: "individuell",
    title: "Individuelle Landingpage",
    shortDescription: "Maßgeschneiderte Lösung",
    suitableFor: "Jeder Behandlungsschwerpunkt",
    image:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
    ctaLabel: "Landingpage buchen",
    detail: {
      description:
        "Wenn kein Standardmodell passt: eine Landingpage exakt auf Ihren Schwerpunkt, Ihre Zielgruppe und Ihre Praxis zugeschnitten.",
      scope: ["Konzeption", "Design & Umsetzung", "Patientenjourney", "Betreuung & Iteration"],
      examplePages: "Referenzstil aus Ihrer Praxisidentität — kein Template-Look.",
      patientJourney: "Individuell geplant, medizinisch und rechtlich sauber abgestimmt.",
      leadGeneration: "Lead-Flow passend zu Ihrem Behandlungsangebot.",
      integration: "Nahtlos in Your Dentist — Tracker, Relay und Journal als Rückgrat.",
    },
  },
] as const;

/** Hervorgehobene Lösungen in der Profil-Editor-Vorschau (Bento-Showcase). */
export const FEATURED_PRACTICE_SOLUTION_IDS: readonly PracticeSolutionId[] = [
  "smilescan",
  "implantologie",
  "aligner",
  "aesthetik",
  "prophylaxe",
  "oral-health-pass",
] as const;

export function getFeaturedPracticeSolutions(): PracticeSolution[] {
  const byId = new Map(PRACTICE_SOLUTIONS.map((solution) => [solution.id, solution]));
  return FEATURED_PRACTICE_SOLUTION_IDS.map((id) => byId.get(id)).filter(
    (solution): solution is PracticeSolution => solution != null
  );
}

export function getPracticeSolution(id: string): PracticeSolution | undefined {
  return PRACTICE_SOLUTIONS.find((s) => s.id === id);
}
