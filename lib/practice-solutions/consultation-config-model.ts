import type { PracticeSolutionId } from "@/lib/practice-solutions/catalog";
import type { PracticeSolutionInquiryContext } from "@/lib/practice-solutions/inquiry-context";
import {
  buildLandingPageDraft,
  type LandingPageDraft,
} from "@/lib/practice-solutions/inquiry-preview-model";

export type ConsultationTopicId =
  | "implantologie"
  | "aligner"
  | "prophylaxe"
  | "kinderzahnheilkunde"
  | "parodontologie"
  | "aesthetik"
  | "smilescan"
  | "endodontie"
  | "oral-health-pass"
  | "individuell";

export type ConsultationGoalId =
  | "erstberatung"
  | "zweitmeinung"
  | "informationsgespraech"
  | "neupatienten";

export type ConsultationServiceOption = {
  id: string;
  label: string;
};

export type ConsultationTopic = {
  id: ConsultationTopicId;
  label: string;
  solutionId: PracticeSolutionId;
  patientHeadline: string;
  patientSubheadline: string;
  defaultBullets: readonly string[];
};

export type ConfigFieldValues = {
  chips: Record<string, string[]>;
  selects: Record<string, string>;
  goal: ConsultationGoalId;
  notes: string;
};

type PreviewOverride = {
  headline?: string;
  subheadline?: string;
  heroImage?: string;
};

export type ConfigFieldDef =
  | {
      id: string;
      kind: "chips";
      label: string;
      hint?: string;
      options: readonly ConsultationServiceOption[];
      defaultSelected: string[];
    }
  | {
      id: string;
      kind: "select";
      label: string;
      hint?: string;
      options: readonly { id: string; label: string }[];
      defaultValue: string;
      previewOverrides?: Record<string, PreviewOverride>;
    }
  | { id: "goal"; kind: "goal"; label: string }
  | { id: "notes"; kind: "notes"; label: string; hint?: string };

const IMG = {
  implantologie:
    "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=1800&q=82",
  implantDigital:
    "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1800&q=82",
  aligner:
    "https://images.unsplash.com/photo-1609840114035-3c981b782dfe?auto=format&fit=crop&w=1800&q=82",
  alignerTeens:
    "https://images.unsplash.com/photo-1631217868264-e5b1a5fe1c89?auto=format&fit=crop&w=1800&q=82",
  prophylaxe:
    "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&w=1800&q=82",
  kinder:
    "https://images.unsplash.com/photo-1631217868264-e5b1a5fe1c89?auto=format&fit=crop&w=1800&q=82",
  parodontologie:
    "https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?auto=format&fit=crop&w=1800&q=82",
  aesthetik:
    "https://images.unsplash.com/photo-1606811971618-4486d14f3f99?auto=format&fit=crop&w=1800&q=82",
  smilescan:
    "https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&w=1800&q=82",
  oralHealth:
    "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1800&q=82",
  endodontie:
    "https://images.unsplash.com/photo-1606811841689-23dfddce3e95?auto=format&fit=crop&w=1800&q=82",
} as const;

export const CONSULTATION_TOPICS: readonly ConsultationTopic[] = [
  {
    id: "implantologie",
    label: "Implantologie",
    solutionId: "implantologie",
    patientHeadline: "Digitale Implantologie für festen Zahnersatz",
    patientSubheadline: "Individuelle Beratung, moderne Diagnostik und persönliche Therapieplanung.",
    defaultBullets: ["Individuelle Beratung", "Moderne Diagnostik", "Persönliche Therapieplanung"],
  },
  {
    id: "aligner",
    label: "Invisalign / Aligner",
    solutionId: "aligner",
    patientHeadline: "Unsichtbare Zahnkorrektur in Ihrer Nähe",
    patientSubheadline: "Ästhetische Korrektur professionell erklärt — von der ersten Frage bis zur Beratung.",
    defaultBullets: ["Diskrete Behandlung", "Individuelle Planung", "Persönliche Betreuung"],
  },
  {
    id: "prophylaxe",
    label: "Prophylaxe",
    solutionId: "prophylaxe",
    patientHeadline: "Professionelle Zahnreinigung & Prävention",
    patientSubheadline: "Recall, Prävention und langfristige Zahngesundheit — klar und vertrauensvoll.",
    defaultBullets: ["Professionelle Zahnreinigung", "Individuelle Prophylaxe", "Langfristige Betreuung"],
  },
  {
    id: "kinderzahnheilkunde",
    label: "Kinderzahnheilkunde",
    solutionId: "kinderzahnheilkunde",
    patientHeadline: "Zahnarzt für Familien",
    patientSubheadline: "Warme Elternansprache — medizinisch professionell und einladend.",
    defaultBullets: ["Erstbesuch erklärt", "Angstfreie Betreuung", "Familienorientiert"],
  },
  {
    id: "parodontologie",
    label: "Parodontologie",
    solutionId: "individuell",
    patientHeadline: "Parodontale Gesundheit erhalten",
    patientSubheadline: "Parodontale Behandlung verständlich und seriös kommuniziert.",
    defaultBullets: ["Aufklärung", "Langfristige Betreuung", "Individuelle Therapie"],
  },
  {
    id: "aesthetik",
    label: "Ästhetische Zahnmedizin",
    solutionId: "aesthetik",
    patientHeadline: "Ihr Smile Design",
    patientSubheadline: "Bleaching, Veneers und Ästhetik — hochwertig und medizinisch fundiert.",
    defaultBullets: ["Smile Design", "Erwartungsmanagement", "Diskrete Beratung"],
  },
  {
    id: "smilescan",
    label: "SmileScan",
    solutionId: "smilescan",
    patientHeadline: "Digitale Ersteinschätzung",
    patientSubheadline: "Strukturierter Einstieg — ruhig geführt und medizinisch seriös.",
    defaultBullets: ["Geführter Einstieg", "Sichere Übermittlung", "Persönliche Rückmeldung"],
  },
  {
    id: "endodontie",
    label: "Endodontie",
    solutionId: "endodontie",
    patientHeadline: "Wurzelkanalbehandlung verständlich erklärt",
    patientSubheadline: "Komplexe Endodontie — Angst reduzieren, Vertrauen schaffen.",
    defaultBullets: ["Verständliche Aufklärung", "Schonende Behandlung", "Persönliche Betreuung"],
  },
  {
    id: "oral-health-pass",
    label: "Oral Health Pass",
    solutionId: "oral-health-pass",
    patientHeadline: "Präventionsprogramme für Institutionen",
    patientSubheadline: "Programme für Betriebe, Schulen und Einrichtungen.",
    defaultBullets: ["Strukturierte Prävention", "Professionelle Betreuung", "Skalierbar"],
  },
  {
    id: "individuell",
    label: "Individuelles Thema",
    solutionId: "individuell",
    patientHeadline: "Ihre Landingpage",
    patientSubheadline: "Maßgeschneidert für Ihren Behandlungsschwerpunkt.",
    defaultBullets: ["Individuelle Beratung", "Persönliche Betreuung", "Klare Information"],
  },
] as const;

const CHIP_HERO_OVERRIDES: Partial<
  Record<ConsultationTopicId, Record<string, string>>
> = {
  implantologie: {
    allon4: IMG.implantologie,
    digital: IMG.implantDigital,
    bone: IMG.implantologie,
  },
  aligner: {
    invisalign: IMG.aligner,
    teens: IMG.alignerTeens,
  },
  "oral-health-pass": {
    companies: IMG.oralHealth,
    schools: IMG.kinder,
    care: IMG.oralHealth,
  },
  smilescan: {
    photo_upload: IMG.smilescan,
    first_assessment: IMG.smilescan,
  },
};

export const TOPIC_FIELD_SETS: Record<ConsultationTopicId, readonly ConfigFieldDef[]> = {
  implantologie: [
    {
      id: "services",
      kind: "chips",
      label: "Leistungen & Schwerpunkte",
      hint: "Was bieten Sie an?",
      options: [
        { id: "single", label: "Einzelimplantate" },
        { id: "prosthesis", label: "Implantatgetragener Zahnersatz" },
        { id: "allon4", label: "All-on-4" },
        { id: "bone", label: "Knochenaufbau" },
        { id: "digital", label: "Digitale Implantatplanung" },
        { id: "anxiety", label: "Angstpatienten" },
      ],
      defaultSelected: ["single", "digital", "anxiety"],
    },
    { id: "goal", kind: "goal", label: "Ziel der Landingpage" },
    {
      id: "notes",
      kind: "notes",
      label: "Besondere Hinweise",
      hint: "Optional — kurz und präzise.",
    },
  ],
  aligner: [
    {
      id: "brand",
      kind: "select",
      label: "Aligner-System",
      options: [
        { id: "invisalign", label: "Invisalign" },
        { id: "clearcorrect", label: "ClearCorrect" },
        { id: "spark", label: "Spark" },
        { id: "other", label: "Anderes System" },
      ],
      defaultValue: "invisalign",
      previewOverrides: {
        invisalign: { headline: "Invisalign® — unsichtbare Zahnkorrektur" },
        clearcorrect: { headline: "ClearCorrect Aligner in Ihrer Praxis" },
        spark: { headline: "Spark Aligner — ästhetische Korrektur" },
      },
    },
    {
      id: "services",
      kind: "chips",
      label: "Schwerpunkte",
      options: [
        { id: "teens", label: "Teenager-Behandlung" },
        { id: "digital_planning", label: "Digitale Planung" },
        { id: "bleaching_combo", label: "Kombination mit Bleaching" },
        { id: "retainer", label: "Retainer & Nachsorge" },
      ],
      defaultSelected: ["digital_planning", "retainer"],
    },
    { id: "goal", kind: "goal", label: "Ziel der Landingpage" },
    { id: "notes", kind: "notes", label: "Besondere Hinweise", hint: "Optional" },
  ],
  prophylaxe: [
    {
      id: "recall",
      kind: "select",
      label: "Recall-Modell",
      options: [
        { id: "recall", label: "Recall-Erinnerung" },
        { id: "booking", label: "Direkte PZR-Buchung" },
        { id: "both", label: "Recall + Online-Buchung" },
      ],
      defaultValue: "both",
      previewOverrides: {
        booking: { subheadline: "PZR-Termine direkt online buchen — einfach und verbindlich." },
        recall: { subheadline: "Sanfte Recall-Erinnerungen für langfristige Zahngesundheit." },
      },
    },
    {
      id: "services",
      kind: "chips",
      label: "Leistungen",
      options: [
        { id: "pzr", label: "Professionelle Zahnreinigung" },
        { id: "kids_prophy", label: "Kinderprophylaxe" },
        { id: "perio_followup", label: "Parodontale Nachsorge" },
        { id: "home_care", label: "Pflegeberatung" },
      ],
      defaultSelected: ["pzr", "home_care"],
    },
    { id: "goal", kind: "goal", label: "Ziel der Landingpage" },
    { id: "notes", kind: "notes", label: "Besondere Hinweise", hint: "Optional" },
  ],
  kinderzahnheilkunde: [
    {
      id: "age",
      kind: "select",
      label: "Altersgruppe",
      options: [
        { id: "toddlers", label: "Kleinkinder" },
        { id: "school", label: "Schulkinder" },
        { id: "all", label: "Alle Altersgruppen" },
      ],
      defaultValue: "all",
      previewOverrides: {
        toddlers: { headline: "Der erste Zahnarztbesuch — behutsam begleitet" },
        school: { headline: "Zahnarzt für Schulkinder" },
      },
    },
    {
      id: "services",
      kind: "chips",
      label: "Leistungen",
      options: [
        { id: "first_visit", label: "Erstbesuch" },
        { id: "anxiety", label: "Angstreduktion" },
        { id: "prophylaxe", label: "Prophylaxe für Kinder" },
        { id: "parents", label: "Elternberatung" },
      ],
      defaultSelected: ["first_visit", "anxiety", "parents"],
    },
    { id: "goal", kind: "goal", label: "Ziel der Landingpage" },
    { id: "notes", kind: "notes", label: "Besondere Hinweise", hint: "Optional" },
  ],
  parodontologie: [
    {
      id: "services",
      kind: "chips",
      label: "Behandlungsschwerpunkte",
      options: [
        { id: "periodontitis", label: "Parodontitis-Behandlung" },
        { id: "recall", label: "Recall & Nachsorge" },
        { id: "laser", label: "Lasertherapie" },
        { id: "maintenance", label: "Langzeitbetreuung" },
      ],
      defaultSelected: ["periodontitis", "maintenance"],
    },
    { id: "goal", kind: "goal", label: "Ziel der Landingpage" },
    { id: "notes", kind: "notes", label: "Besondere Hinweise", hint: "Optional" },
  ],
  aesthetik: [
    {
      id: "focus",
      kind: "select",
      label: "Hauptschwerpunkt",
      options: [
        { id: "bleaching", label: "Bleaching" },
        { id: "veneers", label: "Veneers" },
        { id: "smile_design", label: "Smile Design" },
        { id: "combined", label: "Kombination" },
      ],
      defaultValue: "smile_design",
      previewOverrides: {
        bleaching: { headline: "Professionelles Bleaching", heroImage: IMG.aesthetik },
        veneers: { headline: "Veneers & Smile Design", heroImage: IMG.aesthetik },
      },
    },
    {
      id: "services",
      kind: "chips",
      label: "Leistungen",
      options: [
        { id: "bonding", label: "Bonding" },
        { id: "gum_aesthetics", label: "Gingiva-Ästhetik" },
        { id: "before_after", label: "Vorher/Nachher-Beratung" },
      ],
      defaultSelected: ["before_after"],
    },
    { id: "goal", kind: "goal", label: "Ziel der Landingpage" },
    { id: "notes", kind: "notes", label: "Besondere Hinweise", hint: "Optional" },
  ],
  smilescan: [
    {
      id: "integration",
      kind: "select",
      label: "Gewünschte Anbindung",
      options: [
        { id: "landing", label: "Nur Landingpage" },
        { id: "tracker", label: "Mit Tracker" },
        { id: "full", label: "Tracker + Relay" },
      ],
      defaultValue: "tracker",
      previewOverrides: {
        full: { subheadline: "Vom Erstkontakt bis zur Teamumsetzung — vollständig integriert." },
      },
    },
    {
      id: "services",
      kind: "chips",
      label: "Einstieg",
      options: [
        { id: "first_assessment", label: "Digitale Ersteinschätzung" },
        { id: "photo_upload", label: "Foto-Upload" },
        { id: "new_patients", label: "Für Neupatienten" },
        { id: "existing_patients", label: "Für Bestandskunden" },
      ],
      defaultSelected: ["first_assessment", "photo_upload", "new_patients"],
    },
    { id: "goal", kind: "goal", label: "Ziel der Landingpage" },
    { id: "notes", kind: "notes", label: "Besondere Hinweise", hint: "Optional" },
  ],
  endodontie: [
    {
      id: "focus",
      kind: "select",
      label: "Kommunikationsschwerpunkt",
      options: [
        { id: "anxiety", label: "Angstabbau" },
        { id: "referral", label: "Überweisungen" },
        { id: "both", label: "Beides" },
      ],
      defaultValue: "anxiety",
    },
    {
      id: "services",
      kind: "chips",
      label: "Leistungen",
      options: [
        { id: "root_canal", label: "Wurzelkanalbehandlung" },
        { id: "microscope", label: "Mikroskopische Endodontie" },
        { id: "emergency", label: "Akutversorgung" },
      ],
      defaultSelected: ["root_canal", "microscope"],
    },
    { id: "goal", kind: "goal", label: "Ziel der Landingpage" },
    { id: "notes", kind: "notes", label: "Besondere Hinweise", hint: "Optional" },
  ],
  "oral-health-pass": [
    {
      id: "institution",
      kind: "select",
      label: "Zielgruppe",
      options: [
        { id: "companies", label: "Betriebe" },
        { id: "schools", label: "Schulen" },
        { id: "care", label: "Pflegeeinrichtungen" },
        { id: "mixed", label: "Gemischt" },
      ],
      defaultValue: "companies",
      previewOverrides: {
        companies: { headline: "Betriebliche Mundgesundheit", heroImage: IMG.oralHealth },
        schools: { headline: "Präventionsprogramme für Schulen", heroImage: IMG.kinder },
        care: { headline: "Mundgesundheit in Pflegeeinrichtungen", heroImage: IMG.oralHealth },
      },
    },
    {
      id: "services",
      kind: "chips",
      label: "Programmumfang",
      options: [
        { id: "screening", label: "Vorsorge-Screenings" },
        { id: "education", label: "Aufklärungsworkshops" },
        { id: "reporting", label: "Reporting & Dokumentation" },
      ],
      defaultSelected: ["screening", "education"],
    },
    { id: "goal", kind: "goal", label: "Ziel der Landingpage" },
    { id: "notes", kind: "notes", label: "Besondere Hinweise", hint: "Optional" },
  ],
  individuell: [
    {
      id: "services",
      kind: "chips",
      label: "Schwerpunkte",
      options: [
        { id: "consultation", label: "Beratungsgespräch" },
        { id: "second_opinion", label: "Zweitmeinung" },
        { id: "treatment_plan", label: "Therapieplanung" },
        { id: "digital", label: "Digitale Beratung" },
      ],
      defaultSelected: ["consultation", "treatment_plan"],
    },
    { id: "goal", kind: "goal", label: "Ziel der Landingpage" },
    { id: "notes", kind: "notes", label: "Projektbeschreibung", hint: "Optional — kurz beschreiben." },
  ],
};

export const CONSULTATION_GOAL_OPTIONS: readonly {
  id: ConsultationGoalId;
  label: string;
  cta: string;
}[] = [
  { id: "erstberatung", label: "Erstberatung", cta: "Beratungstermin vereinbaren" },
  { id: "zweitmeinung", label: "Zweitmeinung", cta: "Zweitmeinung anfragen" },
  {
    id: "informationsgespraech",
    label: "Informationsgespräch",
    cta: "Informationsgespräch vereinbaren",
  },
  { id: "neupatienten", label: "Neupatienten gewinnen", cta: "Jetzt Termin anfragen" },
] as const;

const TITLE_TOPIC_MAP: Record<string, ConsultationTopicId> = {
  implantologie: "implantologie",
  implantat: "implantologie",
  aligner: "aligner",
  invisalign: "aligner",
  prophylaxe: "prophylaxe",
  pzr: "prophylaxe",
  kinder: "kinderzahnheilkunde",
  kinderzahnheilkunde: "kinderzahnheilkunde",
  parodontologie: "parodontologie",
  parodont: "parodontologie",
  ästhetik: "aesthetik",
  aesthetik: "aesthetik",
  bleaching: "aesthetik",
  veneers: "aesthetik",
  smilescan: "smilescan",
  endodontie: "endodontie",
  wurzel: "endodontie",
  "oral health pass": "oral-health-pass",
  landingpage: "individuell",
};

export function getConsultationTopic(id: ConsultationTopicId): ConsultationTopic {
  return CONSULTATION_TOPICS.find((t) => t.id === id) ?? CONSULTATION_TOPICS[0];
}

export function getTopicFieldSet(topicId: ConsultationTopicId): readonly ConfigFieldDef[] {
  return TOPIC_FIELD_SETS[topicId] ?? TOPIC_FIELD_SETS.individuell;
}

export function getDefaultFieldValues(topicId: ConsultationTopicId): ConfigFieldValues {
  const chips: Record<string, string[]> = {};
  const selects: Record<string, string> = {};

  for (const field of getTopicFieldSet(topicId)) {
    if (field.kind === "chips") {
      chips[field.id] = [...field.defaultSelected];
    }
    if (field.kind === "select") {
      selects[field.id] = field.defaultValue;
    }
  }

  return {
    chips,
    selects,
    goal: "erstberatung",
    notes: "",
  };
}

export function resolveConsultationTopicFromTarget(
  solutionId: PracticeSolutionId,
  displayTitle: string
): ConsultationTopicId {
  const normalized = displayTitle.trim().toLowerCase();

  for (const [needle, topicId] of Object.entries(TITLE_TOPIC_MAP)) {
    if (normalized.includes(needle)) return topicId;
  }

  if (solutionId in TOPIC_FIELD_SETS) {
    return solutionId as ConsultationTopicId;
  }

  return "individuell";
}

export function labelForConsultationGoal(goal: ConsultationGoalId): string {
  return CONSULTATION_GOAL_OPTIONS.find((o) => o.id === goal)?.label ?? "";
}

export function ctaForConsultationGoal(goal: ConsultationGoalId): string {
  return CONSULTATION_GOAL_OPTIONS.find((o) => o.id === goal)?.cta ?? "Beratungstermin vereinbaren";
}

function labelsForChipField(
  field: Extract<ConfigFieldDef, { kind: "chips" }>,
  selectedIds: string[]
): string[] {
  return selectedIds
    .map((id) => field.options.find((o) => o.id === id)?.label)
    .filter((label): label is string => Boolean(label));
}

export function collectChipLabels(
  topicId: ConsultationTopicId,
  fieldValues: ConfigFieldValues
): string[] {
  const labels: string[] = [];

  for (const field of getTopicFieldSet(topicId)) {
    if (field.kind !== "chips") continue;
    labels.push(...labelsForChipField(field, fieldValues.chips[field.id] ?? []));
  }

  return labels;
}

export function isConfiguratorComplete(
  topicId: ConsultationTopicId,
  fieldValues: ConfigFieldValues
): boolean {
  for (const field of getTopicFieldSet(topicId)) {
    if (field.kind === "chips" && (fieldValues.chips[field.id]?.length ?? 0) === 0) {
      return false;
    }
    if (field.kind === "select" && !fieldValues.selects[field.id]?.trim()) {
      return false;
    }
  }
  return true;
}

export function buildConfiguratorPreview(params: {
  topicId: ConsultationTopicId;
  fieldValues: ConfigFieldValues;
  profile: PracticeSolutionInquiryContext;
}): LandingPageDraft {
  const topic = getConsultationTopic(params.topicId);
  const chipLabels = collectChipLabels(params.topicId, params.fieldValues);

  const draft = buildLandingPageDraft({
    solutionId: topic.solutionId,
    displayTitle: topic.label,
    profile: params.profile,
    topicHighlights: chipLabels.length > 0 ? chipLabels : [...topic.defaultBullets],
  });

  draft.headline = topic.patientHeadline;
  draft.subheadline = topic.patientSubheadline;
  draft.ctaLabel = ctaForConsultationGoal(params.fieldValues.goal);
  draft.eyebrow = topic.label;

  if (chipLabels.length > 0) {
    draft.services = chipLabels.slice(0, 6);
    draft.highlights = chipLabels.slice(0, 3);
  }

  for (const field of getTopicFieldSet(params.topicId)) {
    if (field.kind === "select") {
      const value = params.fieldValues.selects[field.id];
      const override = field.previewOverrides?.[value];
      if (override?.headline) draft.headline = override.headline;
      if (override?.subheadline) draft.subheadline = override.subheadline;
      if (override?.heroImage) draft.heroImage = override.heroImage;
    }
  }

  const heroOverrides = CHIP_HERO_OVERRIDES[params.topicId];
  if (heroOverrides) {
    for (const ids of Object.values(params.fieldValues.chips)) {
      for (const id of ids) {
        if (heroOverrides[id]) draft.heroImage = heroOverrides[id];
      }
    }
  }

  if (params.fieldValues.notes.trim()) {
    draft.subheadline = params.fieldValues.notes.trim().slice(0, 180);
  } else if (params.profile.practiceSubtitle?.trim()) {
    draft.subheadline = params.profile.practiceSubtitle.trim();
  }

  if (params.profile.credentials?.length) {
    draft.highlights = params.profile.credentials.slice(0, 3);
  }

  return draft;
}

export function buildConsultationMessage(params: {
  topicId: ConsultationTopicId;
  fieldValues: ConfigFieldValues;
  displayTitle?: string;
}): string {
  const topic = getConsultationTopic(params.topicId);
  const services = collectChipLabels(params.topicId, params.fieldValues);
  const lines: string[] = [
    `Thema: ${topic.label}`,
    `Ziel der Landingpage: ${labelForConsultationGoal(params.fieldValues.goal)}`,
  ];

  if (params.displayTitle && params.displayTitle !== topic.label) {
    lines.push(`Auswahl: ${params.displayTitle}`);
  }

  for (const field of getTopicFieldSet(params.topicId)) {
    if (field.kind === "select") {
      const value = params.fieldValues.selects[field.id];
      const label = field.options.find((o) => o.id === value)?.label;
      if (label) lines.push(`${field.label}: ${label}`);
    }
  }

  if (services.length > 0) {
    lines.push("");
    lines.push("--- Leistungen & Schwerpunkte ---");
    lines.push(...services.map((s) => `• ${s}`));
  }

  if (params.fieldValues.notes.trim()) {
    lines.push("");
    lines.push("--- Besondere Hinweise ---");
    lines.push(params.fieldValues.notes.trim());
  }

  return lines.join("\n").trim();
}
