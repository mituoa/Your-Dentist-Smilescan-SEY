import type { PracticeSolutionId } from "@/lib/practice-solutions/catalog";

export type InquiryFieldType = "text" | "textarea" | "select" | "segmented";

export type InquiryFieldOption = {
  id: string;
  label: string;
};

export type InquiryField = {
  id: string;
  label: string;
  type: InquiryFieldType;
  placeholder?: string;
  optional?: boolean;
  options?: readonly InquiryFieldOption[];
  showInPreview?: boolean;
  previewLabel?: string;
  allowDeselect?: boolean;
};

export type InquiryFieldSet = {
  topicTitle: string;
  topicHint: string;
  fields: readonly InquiryField[];
};

const FIELD_SETS: Record<PracticeSolutionId, InquiryFieldSet> = {
  aligner: {
    topicTitle: "Aligner-Landingpage",
    topicHint: "Marke, Zielgruppe und Beratungsweg — für eine passgenaue Seite.",
    fields: [
      {
        id: "aligner_brand",
        label: "Welche Aligner-Marke nutzen Sie?",
        type: "select",
        showInPreview: true,
        previewLabel: "Marke",
        options: [
          { id: "invisalign", label: "Invisalign" },
          { id: "clearcorrect", label: "ClearCorrect" },
          { id: "suresmile", label: "SureSmile" },
          { id: "spark", label: "Spark" },
          { id: "other", label: "Andere / Eigenes System" },
        ],
      },
      {
        id: "aligner_scope",
        label: "Zielgruppe",
        type: "select",
        showInPreview: true,
        options: [
          { id: "adults", label: "Erwachsene" },
          { id: "teens", label: "Auch Teenager" },
          { id: "all", label: "Alle Altersgruppen" },
        ],
      },
      {
        id: "consultation_format",
        label: "Beratungsweg",
        type: "select",
        optional: true,
        options: [
          { id: "in_person", label: "Vor Ort" },
          { id: "online", label: "Online" },
          { id: "both", label: "Beides" },
        ],
      },
    ],
  },
  prophylaxe: {
    topicTitle: "Prophylaxe & Recall",
    topicHint: "Recall-Modell und Hauptangebot — damit Patientinnen sofort verstehen, was Sie anbieten.",
    fields: [
      {
        id: "recall_model",
        label: "Wie möchten Sie Patientinnen erreichen?",
        type: "select",
        showInPreview: true,
        options: [
          { id: "recall", label: "Recall-Erinnerung" },
          { id: "booking", label: "Direkte PZR-Buchung" },
          { id: "both", label: "Recall + Online-Buchung" },
        ],
      },
      {
        id: "main_offer",
        label: "Hauptangebot auf der Seite",
        type: "text",
        placeholder: "z. B. Professionelle Zahnreinigung · ab 89 €",
        showInPreview: true,
        previewLabel: "Angebot",
      },
      {
        id: "target_group",
        label: "Zielgruppe",
        type: "select",
        showInPreview: true,
        options: [
          { id: "existing", label: "Bestandskunden" },
          { id: "new", label: "Neupatienten" },
          { id: "both", label: "Beide" },
        ],
      },
    ],
  },
  implantologie: {
    topicTitle: "Implantologie",
    topicHint: "Systeme und Schwerpunkt — für vertrauensvolle Aufklärung vor dem Erstgespräch.",
    fields: [
      {
        id: "implant_systems",
        label: "Welche Implantatsysteme nutzen Sie?",
        type: "text",
        placeholder: "z. B. Straumann, Nobel Biocare, Camlog …",
        showInPreview: true,
        previewLabel: "Systeme",
      },
      {
        id: "implant_focus",
        label: "Behandlungsschwerpunkt",
        type: "select",
        showInPreview: true,
        options: [
          { id: "single", label: "Einzelzahn" },
          { id: "multiple", label: "Mehrere Zähne" },
          { id: "full", label: "Vollversorgung" },
          { id: "immediate", label: "Sofortversorgung" },
        ],
      },
      {
        id: "consultation_cta",
        label: "Gewünschter Patientenweg",
        type: "select",
        optional: true,
        options: [
          { id: "appointment", label: "Beratungstermin" },
          { id: "callback", label: "Rückruf" },
          { id: "smilescan", label: "SmileScan-Einstieg" },
        ],
      },
    ],
  },
  smilescan: {
    topicTitle: "SmileScan-Einstieg",
    topicHint: "Ziel und Anbindung an Ihren Praxis-Workflow.",
    fields: [
      {
        id: "entry_goal",
        label: "Primäres Ziel",
        type: "select",
        showInPreview: true,
        options: [
          { id: "new_patients", label: "Neupatienten" },
          { id: "existing", label: "Bestandskunden" },
          { id: "both", label: "Beides" },
        ],
      },
      {
        id: "integration_depth",
        label: "Gewünschte Anbindung",
        type: "select",
        showInPreview: true,
        options: [
          { id: "landing", label: "Nur Landingpage" },
          { id: "tracker", label: "Mit Tracker" },
          { id: "full", label: "Tracker + Relay" },
        ],
      },
    ],
  },
  aesthetik: {
    topicTitle: "Ästhetische Zahnmedizin",
    topicHint: "Schwerpunkte und Darstellung — medizinisch seriös, ohne Beauty-Optik.",
    fields: [
      {
        id: "aesthetic_focus",
        label: "Hauptschwerpunkt",
        type: "select",
        showInPreview: true,
        previewLabel: "Schwerpunkt",
        options: [
          { id: "bleaching", label: "Bleaching" },
          { id: "veneers", label: "Veneers" },
          { id: "smile_design", label: "Smile Design" },
          { id: "combined", label: "Kombination" },
        ],
      },
      {
        id: "before_after",
        label: "Vorher/Nachher-Darstellung",
        type: "select",
        optional: true,
        options: [
          { id: "yes", label: "Ja, mit Freigabe" },
          { id: "no", label: "Nein" },
          { id: "later", label: "Später klären" },
        ],
      },
    ],
  },
  kinderzahnheilkunde: {
    topicTitle: "Kinderzahnheilkunde",
    topicHint: "Altersgruppe und Elternweg — warm, aber medizinisch professionell.",
    fields: [
      {
        id: "age_focus",
        label: "Altersgruppe",
        type: "select",
        showInPreview: true,
        options: [
          { id: "toddlers", label: "Kleinkinder" },
          { id: "school", label: "Schulkinder" },
          { id: "all", label: "Alle Altersgruppen" },
        ],
      },
      {
        id: "parent_channel",
        label: "Kontaktweg für Eltern",
        type: "select",
        showInPreview: true,
        options: [
          { id: "booking", label: "Terminbuchung" },
          { id: "callback", label: "Rückruf" },
          { id: "info", label: "Erst informieren" },
        ],
      },
    ],
  },
  "oral-health-pass": {
    topicTitle: "Oral Health Pass",
    topicHint: "Zielgruppe und Programmumfang für institutionelle Anfragen.",
    fields: [
      {
        id: "institution_type",
        label: "Zielgruppe",
        type: "select",
        showInPreview: true,
        options: [
          { id: "companies", label: "Betriebe" },
          { id: "schools", label: "Schulen" },
          { id: "care", label: "Pflege" },
          { id: "mixed", label: "Gemischt" },
        ],
      },
      {
        id: "program_scope",
        label: "Programmumfang",
        type: "text",
        placeholder: "z. B. 50 Mitarbeitende, jährliche Vorsorge",
        showInPreview: true,
        previewLabel: "Umfang",
      },
    ],
  },
  endodontie: {
    topicTitle: "Endodontie",
    topicHint: "Aufklärungsschwerpunkt und Patientenweg.",
    fields: [
      {
        id: "endo_focus",
        label: "Kommunikationsschwerpunkt",
        type: "select",
        showInPreview: true,
        options: [
          { id: "anxiety", label: "Angstabbau" },
          { id: "referral", label: "Überweisungen" },
          { id: "both", label: "Beides" },
        ],
      },
      {
        id: "consultation_cta",
        label: "Gewünschter Patientenweg",
        type: "select",
        optional: true,
        options: [
          { id: "appointment", label: "Termin" },
          { id: "callback", label: "Rückruf" },
        ],
      },
    ],
  },
  individuell: {
    topicTitle: "Individuelle Landingpage",
    topicHint: "Schwerpunkt und Zielgruppe — wir entwickeln den Rest gemeinsam.",
    fields: [
      {
        id: "schwerpunkt",
        label: "Behandlungsschwerpunkt",
        type: "text",
        placeholder: "z. B. Parodontologie, CMD, Schlafmedizin …",
        showInPreview: true,
        previewLabel: "Schwerpunkt",
      },
      {
        id: "zielgruppe",
        label: "Zielgruppe",
        type: "text",
        placeholder: "z. B. Berufstätige 30–50, Familien, Senioren …",
        showInPreview: true,
        previewLabel: "Zielgruppe",
      },
      {
        id: "notes",
        label: "Projektbeschreibung",
        type: "textarea",
        placeholder: "Was soll die Seite erreichen? Besondere Wünsche, vorhandene Inhalte …",
      },
    ],
  },
};

export function getInquiryFieldSet(
  solutionId: PracticeSolutionId,
  displayTitle: string
): InquiryFieldSet {
  const base = FIELD_SETS[solutionId] ?? FIELD_SETS.individuell;

  if (solutionId === "individuell" && displayTitle.trim()) {
    return {
      ...base,
      topicTitle: displayTitle,
      fields: base.fields.map((field) =>
        field.id === "schwerpunkt" && !field.placeholder?.includes(displayTitle)
          ? { ...field, placeholder: displayTitle }
          : field
      ),
    };
  }

  return {
    ...base,
    topicTitle: displayTitle.trim() || base.topicTitle,
  };
}

export function labelForFieldValue(field: InquiryField, value: string): string {
  if (!value) return "";
  if (field.type === "select" || field.type === "segmented") {
    return field.options?.find((o) => o.id === value)?.label ?? value;
  }
  return value;
}

export function buildInquiryMessage(params: {
  displayTitle: string;
  solutionTitle: string;
  fieldSet: InquiryFieldSet;
  topicValues: Record<string, string>;
  campaignGoal: string;
  additionalWishes: string;
}): string {
  const lines: string[] = [];

  lines.push(`Kategorie: ${params.displayTitle || params.solutionTitle}`);

  if (params.campaignGoal.trim()) {
    lines.push(`Ziel der Kampagne: ${params.campaignGoal.trim()}`);
  }

  const topicLines: string[] = [];
  for (const field of params.fieldSet.fields) {
    const raw = params.topicValues[field.id]?.trim();
    if (!raw) continue;
    const label = labelForFieldValue(field, raw);
    topicLines.push(`${field.label}: ${label}`);
  }

  if (topicLines.length > 0) {
    lines.push("");
    lines.push("--- Landingpage-Details ---");
    lines.push(...topicLines);
  }

  if (params.additionalWishes.trim()) {
    lines.push("");
    lines.push("--- Zusätzliche Nachricht ---");
    lines.push(params.additionalWishes.trim());
  }

  return lines.join("\n").trim();
}

export function getPreviewHighlights(
  fieldSet: InquiryFieldSet,
  topicValues: Record<string, string>
): { label: string; value: string }[] {
  const highlights: { label: string; value: string }[] = [];

  for (const field of fieldSet.fields) {
    if (!field.showInPreview) continue;
    const raw = topicValues[field.id]?.trim();
    if (!raw) continue;
    highlights.push({
      label: field.previewLabel ?? field.label,
      value: labelForFieldValue(field, raw),
    });
  }

  return highlights.slice(0, 4);
}
