import type {
  ConfiguratorStepId,
  LandingFieldDef,
  LandingFieldValues,
  LandingPageConfig,
} from "./types";

const STEP_ORDER: ConfiguratorStepId[] = ["product", "services", "audience", "goal"];

const STEP_LABELS: Record<ConfiguratorStepId, string> = {
  product: "Ihr Angebot",
  services: "Leistungen",
  audience: "Zielgruppe",
  goal: "Kampagnenziel",
};

export type ConfiguratorStep = {
  id: ConfiguratorStepId;
  title: string;
  fields: LandingFieldDef[];
};

export type LandingConfigSummaryRow = {
  label: string;
  values: string[];
};

export type BriefingSummaryItem = {
  id: string;
  label: string;
  value: string | null;
  complete: boolean;
};

/** Ordered briefing fields — one screen per field, notes last. */
export function getBriefingFields(config: LandingPageConfig): LandingFieldDef[] {
  const notes: LandingFieldDef[] = [];
  const main: LandingFieldDef[] = [];

  for (const field of config.fields) {
    if (field.type === "text" && resolveConfiguratorStep(field) === "notes" && field.id !== "schwerpunkt") {
      notes.push(field);
    } else {
      main.push(field);
    }
  }

  return [...main, ...notes];
}

/** Empty values — user must choose explicitly (no pre-selected radios). */
export function getEmptyBriefingValues(_config: LandingPageConfig): LandingFieldValues {
  return { radio: {}, checkbox: {}, text: {} };
}

export function getFieldAnswerSummary(
  field: LandingFieldDef,
  values: LandingFieldValues
): string | null {
  if (field.type === "radio") {
    return labelForRadioField(field, values.radio[field.id] ?? "");
  }
  if (field.type === "checkbox") {
    const labels = labelsForCheckboxField(field, values.checkbox[field.id] ?? []);
    if (labels.length === 0) return null;
    if (labels.length <= 2) return labels.join(" · ");
    return `${labels.slice(0, 2).join(" · ")} +${labels.length - 2}`;
  }
  if (field.type === "text") {
    const raw = values.text[field.id]?.trim();
    return raw || null;
  }
  return null;
}

export function buildBriefingSummaryItems(
  config: LandingPageConfig,
  values: LandingFieldValues
): BriefingSummaryItem[] {
  const items: BriefingSummaryItem[] = [
    {
      id: "product",
      label: "Produkt",
      value: config.productName,
      complete: true,
    },
  ];

  for (const field of getBriefingFields(config)) {
    if (field.type === "radio") {
      const label = labelForRadioField(field, values.radio[field.id] ?? "");
      items.push({
        id: field.id,
        label: summaryLabelForField(field),
        value: label,
        complete: Boolean(label),
      });
    }
    if (field.type === "checkbox") {
      const labels = labelsForCheckboxField(field, values.checkbox[field.id] ?? []);
      items.push({
        id: field.id,
        label: summaryLabelForField(field),
        value: labels.length > 0 ? labels.join(", ") : null,
        complete: labels.length > 0,
      });
    }
    if (field.type === "text") {
      const raw = values.text[field.id]?.trim();
      if (field.optional && !raw) continue;
      items.push({
        id: field.id,
        label: summaryLabelForField(field),
        value: raw || null,
        complete: field.optional ? true : Boolean(raw),
      });
    }
  }

  items.push({
    id: "profile",
    label: "Praxisinformationen",
    value: "Aus Ihrem Praxisprofil übernommen",
    complete: true,
  });

  return items;
}

export function buildBriefingFinalSummaryItems(
  config: LandingPageConfig,
  values: LandingFieldValues
): BriefingSummaryItem[] {
  return getBriefingFields(config)
    .map((field) => {
      const value = getFieldAnswerSummary(field, values);
      if (field.type === "text" && field.optional && !value) return null;
      return {
        id: field.id,
        label: summaryLabelForField(field),
        value,
        complete: isConfiguratorFieldComplete(field, values),
      };
    })
    .filter((item): item is BriefingSummaryItem => item !== null);
}

function summaryLabelForField(field: LandingFieldDef): string {
  if (field.id === "goal") return "Kampagnenziel";
  if (field.id === "audience" || field.id === "institutions") return "Zielgruppe";
  if (field.id === "services") return "Schwerpunkte";
  if (field.id === "system") return "System";
  if (field.id === "notes") return "Besonderheiten";
  return field.label;
}

export function resolveConfiguratorStep(
  field: LandingFieldDef
): ConfiguratorStepId | "notes" {
  if (field.type === "text" && field.id === "schwerpunkt") return "product";
  if (field.type === "text") return "notes";
  if (field.id === "goal") return "goal";
  if (field.id === "audience" || field.id === "institutions") return "audience";
  if (field.id === "services") return "services";
  if (field.type === "checkbox") return "services";
  if (field.type === "radio") return "product";
  return "product";
}

export function getNotesField(
  config: LandingPageConfig
): Extract<LandingFieldDef, { type: "text" }> | null {
  const field = config.fields.find((f) => f.type === "text" && resolveConfiguratorStep(f) === "notes");
  return field?.type === "text" ? field : null;
}

export function getConfiguratorSteps(config: LandingPageConfig): ConfiguratorStep[] {
  const buckets = new Map<ConfiguratorStepId, LandingFieldDef[]>();

  for (const field of config.fields) {
    const step = resolveConfiguratorStep(field);
    if (step === "notes") continue;
    const list = buckets.get(step) ?? [];
    list.push(field);
    buckets.set(step, list);
  }

  return STEP_ORDER.filter((id) => buckets.has(id)).map((id) => ({
    id,
    title: buckets.get(id)!.length === 1 ? buckets.get(id)![0]!.label : STEP_LABELS[id],
    fields: buckets.get(id)!,
  }));
}

function labelsForCheckboxField(
  field: Extract<LandingFieldDef, { type: "checkbox" }>,
  selectedIds: string[]
): string[] {
  return selectedIds
    .map((id) => field.options.find((o) => o.id === id)?.label)
    .filter((label): label is string => Boolean(label));
}

function labelForRadioField(
  field: Extract<LandingFieldDef, { type: "radio" }>,
  value: string
): string | null {
  return field.options.find((o) => o.id === value)?.label ?? null;
}

export function isConfiguratorFieldComplete(
  field: LandingFieldDef,
  values: LandingFieldValues
): boolean {
  if (field.type === "checkbox") {
    return (values.checkbox[field.id]?.length ?? 0) > 0;
  }
  if (field.type === "radio") {
    return Boolean(values.radio[field.id]?.trim());
  }
  if (field.type === "text" && !field.optional) {
    return Boolean(values.text[field.id]?.trim());
  }
  return true;
}

export function isConfiguratorStepComplete(
  step: ConfiguratorStep,
  values: LandingFieldValues
): boolean {
  return step.fields.every((field) => isConfiguratorFieldComplete(field, values));
}

export function isConfiguratorConfigComplete(
  config: LandingPageConfig,
  values: LandingFieldValues
): boolean {
  const steps = getConfiguratorSteps(config);
  if (!steps.every((step) => isConfiguratorStepComplete(step, values))) return false;

  const notesField = getNotesField(config);
  if (notesField && !notesField.optional && !values.text[notesField.id]?.trim()) {
    return false;
  }

  for (const field of config.fields) {
    if (field.type === "text" && field.id === "schwerpunkt" && !field.optional) {
      if (!values.text[field.id]?.trim()) return false;
    }
  }

  return true;
}

export function buildLandingConfigSummary(
  config: LandingPageConfig,
  values: LandingFieldValues
): LandingConfigSummaryRow[] {
  const rows: LandingConfigSummaryRow[] = [];

  for (const step of getConfiguratorSteps(config)) {
    for (const field of step.fields) {
      if (field.type === "radio") {
        const label = labelForRadioField(field, values.radio[field.id] ?? "");
        if (label) rows.push({ label: field.label, values: [label] });
      }
      if (field.type === "checkbox") {
        const labels = labelsForCheckboxField(field, values.checkbox[field.id] ?? []);
        if (labels.length > 0) rows.push({ label: field.label, values: labels });
      }
    }
  }

  const notesField = getNotesField(config);
  if (notesField) {
    const raw = values.text[notesField.id]?.trim();
    if (raw) rows.push({ label: notesField.label, values: [raw] });
  }

  const schwerpunkt = config.fields.find((f) => f.id === "schwerpunkt");
  if (schwerpunkt?.type === "text") {
    const raw = values.text.schwerpunkt?.trim();
    if (raw) rows.push({ label: schwerpunkt.label, values: [raw] });
  }

  return rows;
}
