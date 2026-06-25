import type { PracticeSolutionId } from "@/lib/practice-solutions/catalog";
import type { PracticeSolutionInquiryContext } from "@/lib/practice-solutions/inquiry-context";

import { alignerLandingConfig } from "./aligner.config";
import { bleachingLandingConfig } from "./bleaching.config";
import { implantologieLandingConfig } from "./implantologie.config";
import { kinderzahnheilkundeLandingConfig } from "./kinderzahnheilkunde.config";
import { oralHealthPassLandingConfig } from "./oral-health-pass.config";
import {
  aesthetikLandingConfig,
  endodontieLandingConfig,
  individuellLandingConfig,
  parodontologieLandingConfig,
  praxiswebsiteLandingConfig,
  prophylaxeLandingConfig,
  smilescanLandingConfig,
} from "./other.config";
import type {
  LandingConfigId,
  LandingFieldDef,
  LandingFieldValues,
  LandingPageConfig,
  LandingPreviewDraft,
} from "./types";
import {
  buildLandingConfigSummary,
  getConfiguratorSteps,
  getNotesField,
  isConfiguratorConfigComplete,
  isConfiguratorFieldComplete,
  isConfiguratorStepComplete,
  resolveConfiguratorStep,
} from "./configurator-steps";

export type { LandingConfigId, LandingFieldDef, LandingFieldValues, LandingPageConfig, LandingPreviewDraft };
export type { ConfiguratorStepId } from "./types";
export type { BriefingSummaryItem, ConfiguratorStep, LandingConfigSummaryRow } from "./configurator-steps";
export {
  buildBriefingFinalSummaryItems,
  buildBriefingSummaryItems,
  buildLandingConfigSummary,
  getBriefingFields,
  getConfiguratorSteps,
  getEmptyBriefingValues,
  getFieldAnswerSummary,
  getNotesField,
  isConfiguratorConfigComplete,
  isConfiguratorFieldComplete,
  isConfiguratorStepComplete,
  resolveConfiguratorStep,
} from "./configurator-steps";

export const LANDING_CONFIGS: Record<LandingConfigId, LandingPageConfig> = {
  aligner: alignerLandingConfig,
  implantologie: implantologieLandingConfig,
  "oral-health-pass": oralHealthPassLandingConfig,
  bleaching: bleachingLandingConfig,
  kinderzahnheilkunde: kinderzahnheilkundeLandingConfig,
  smilescan: smilescanLandingConfig,
  prophylaxe: prophylaxeLandingConfig,
  parodontologie: parodontologieLandingConfig,
  endodontie: endodontieLandingConfig,
  aesthetik: aesthetikLandingConfig,
  individuell: individuellLandingConfig,
  praxiswebsite: praxiswebsiteLandingConfig,
};

const TITLE_HINTS: { needle: string; id: LandingConfigId }[] = [
  { needle: "bleaching", id: "bleaching" },
  { needle: "invisalign", id: "aligner" },
  { needle: "aligner", id: "aligner" },
  { needle: "implant", id: "implantologie" },
  { needle: "oral health", id: "oral-health-pass" },
  { needle: "ohp", id: "oral-health-pass" },
  { needle: "kinder", id: "kinderzahnheilkunde" },
  { needle: "smilescan", id: "smilescan" },
  { needle: "prophylaxe", id: "prophylaxe" },
  { needle: "parodont", id: "parodontologie" },
  { needle: "endodont", id: "endodontie" },
  { needle: "wurzel", id: "endodontie" },
  { needle: "praxiswebsite", id: "praxiswebsite" },
  { needle: "website", id: "praxiswebsite" },
  { needle: "ästhetik", id: "aesthetik" },
  { needle: "aesthetik", id: "aesthetik" },
  { needle: "veneer", id: "aesthetik" },
];

export function resolveLandingConfigId(
  solutionId: PracticeSolutionId,
  displayTitle: string,
  categoryId?: string
): LandingConfigId {
  if (categoryId && categoryId in LANDING_CONFIGS) {
    return categoryId as LandingConfigId;
  }

  const normalized = displayTitle.trim().toLowerCase();
  for (const hint of TITLE_HINTS) {
    if (normalized.includes(hint.needle)) return hint.id;
  }

  if (solutionId in LANDING_CONFIGS) {
    return solutionId as LandingConfigId;
  }

  return "individuell";
}

export function getLandingConfig(id: LandingConfigId): LandingPageConfig {
  return LANDING_CONFIGS[id] ?? LANDING_CONFIGS.individuell;
}

export function getDefaultFieldValues(config: LandingPageConfig): LandingFieldValues {
  const radio: Record<string, string> = {};
  const checkbox: Record<string, string[]> = {};
  const text: Record<string, string> = {};

  for (const field of config.fields) {
    if (field.type === "radio") radio[field.id] = field.defaultValue;
    if (field.type === "checkbox") checkbox[field.id] = [...(field.defaultSelected ?? [])];
    if (field.type === "text") text[field.id] = "";
  }

  return { radio, checkbox, text };
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

export function isLandingConfigComplete(
  config: LandingPageConfig,
  values: LandingFieldValues
): boolean {
  return isConfiguratorConfigComplete(config, values);
}

function locationFromAddress(address: string | null | undefined): string | null {
  if (!address?.trim()) return null;
  const lines = address
    .trim()
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  return lines[lines.length - 1] ?? lines[0] ?? null;
}

export function buildLandingPreviewDraft(
  config: LandingPageConfig,
  values: LandingFieldValues,
  profile: PracticeSolutionInquiryContext
): LandingPreviewDraft {
  const { preview } = config;
  const practiceName = profile.practiceName.trim() || "Ihre Praxis";

  let headline = preview.headline;
  let subheadline = preview.subheadline;
  let eyebrow = preview.eyebrow;
  let heroImage = preview.heroImage;
  let ctaLabel = preview.defaultCta;
  let trustBadges = [...preview.trustBullets];
  let testimonialQuote: string | null = null;
  let testimonialAuthor: string | null = null;

  for (const field of config.fields) {
    if (field.type === "radio") {
      const value = values.radio[field.id];
      if (!value) continue;
      const headlineOverride = preview.headlineByRadio?.[field.id]?.[value];
      const subOverride = preview.subheadlineByRadio?.[field.id]?.[value];
      const eyebrowOverride = preview.eyebrowByRadio?.[field.id]?.[value];
      const heroOverride = preview.heroByRadio?.[field.id]?.[value];
      const ctaOverride = preview.ctaByRadio?.[field.id]?.[value];
      const trustOverride = preview.trustByRadio?.[field.id]?.[value];
      const testimonialOverride = preview.testimonialByRadio?.[field.id]?.[value];
      if (headlineOverride) headline = headlineOverride;
      if (subOverride) subheadline = subOverride;
      if (eyebrowOverride) eyebrow = eyebrowOverride;
      if (heroOverride) heroImage = heroOverride;
      if (ctaOverride) ctaLabel = ctaOverride;
      if (trustOverride) trustBadges = [...trustOverride];
      if (testimonialOverride) {
        testimonialQuote = testimonialOverride.quote;
        testimonialAuthor = testimonialOverride.author;
      }
    }
    if (field.type === "checkbox") {
      const selected = values.checkbox[field.id] ?? [];
      for (const id of selected) {
        const heroOverride = preview.heroByCheckbox?.[field.id]?.[id];
        if (heroOverride) heroImage = heroOverride;
      }
    }
  }

  const serviceLabels: string[] = [];
  for (const field of config.fields) {
    if (field.type === "checkbox") {
      serviceLabels.push(...labelsForCheckboxField(field, values.checkbox[field.id] ?? []));
    }
    if (field.type === "radio" && field.id !== "goal") {
      const label = labelForRadioField(field, values.radio[field.id] ?? "");
      if (label) serviceLabels.unshift(label);
    }
  }

  const highlights =
    serviceLabels.length > 0 ? serviceLabels.slice(0, 3) : trustBadges.slice(0, 3);

  const services =
    serviceLabels.length > 0
      ? serviceLabels.slice(0, 6)
      : profile.services?.length
        ? profile.services.slice(0, 6)
        : [...trustBadges];

  const notesField = config.fields.find((f) => f.type === "text" && f.id === "notes");
  const notes = notesField ? values.text[notesField.id]?.trim() : "";
  if (notes) subheadline = notes.slice(0, 180);

  const schwerpunkt = values.text.schwerpunkt?.trim();
  if (schwerpunkt) headline = schwerpunkt;

  const doctorName =
    profile.doctorDisplayName?.trim() || profile.contactName.trim() || "Ihr Behandlungsteam";
  const doctorRole = [profile.doctorTitle, practiceName].filter(Boolean).join(" · ");

  if (profile.practiceSubtitle?.trim() && !notes) {
    subheadline = profile.practiceSubtitle.trim();
  }

  if (!testimonialQuote && profile.personalApproach?.trim()) {
    testimonialQuote = profile.personalApproach.trim().slice(0, 120);
    testimonialAuthor = doctorName;
  }

  return {
    practiceName,
    eyebrow,
    headline,
    subheadline,
    ctaLabel,
    heroImage,
    secondaryImage: preview.secondaryImage,
    highlights,
    services,
    trustBadges,
    testimonialQuote,
    testimonialAuthor,
    doctorName,
    doctorRole,
    locationLine: locationFromAddress(profile.practiceAddress),
    hoursLine: profile.practiceHours?.trim() || null,
    phoneLine: profile.contactPhone?.trim() || null,
    slug: practiceName.toLowerCase().replace(/\s+/g, "-").slice(0, 32) || "ihre-praxis",
  };
}

export function buildLandingConfigMessage(params: {
  config: LandingPageConfig;
  values: LandingFieldValues;
  displayTitle?: string;
}): string {
  const lines: string[] = [`Produkt: ${params.config.productName}`];

  if (params.displayTitle && params.displayTitle !== params.config.productName) {
    lines.push(`Auswahl: ${params.displayTitle}`);
  }

  for (const field of params.config.fields) {
    if (field.type === "radio") {
      const label = labelForRadioField(field, params.values.radio[field.id] ?? "");
      if (label) lines.push(`${field.label}: ${label}`);
    }
    if (field.type === "checkbox") {
      const labels = labelsForCheckboxField(field, params.values.checkbox[field.id] ?? []);
      if (labels.length > 0) {
        lines.push("");
        lines.push(`--- ${field.label} ---`);
        lines.push(...labels.map((l) => `• ${l}`));
      }
    }
    if (field.type === "text") {
      const raw = params.values.text[field.id]?.trim();
      if (raw) {
        lines.push("");
        lines.push(`--- ${field.label} ---`);
        lines.push(raw);
      }
    }
  }

  return lines.join("\n").trim();
}

export function profileCityLine(profile: PracticeSolutionInquiryContext): string | null {
  return locationFromAddress(profile.practiceAddress);
}
