import type { PracticeSolutionInquiryContext } from "@/lib/practice-solutions/inquiry-context";
import { PREVIEW_PRACTICE_PARAMS } from "@/lib/marketing/landingpages/generic-practice";
import { appendPreviewContentToParams } from "@/lib/marketing/landingpages/landing-preview-content";
import { LANDING_PREVIEW_RETURN_PARAM } from "@/lib/practice-solutions/landing-preview-return";

import { buildLandingPreviewDraft, profileCityLine } from "./index";
import type { LandingConfigId, LandingFieldValues, LandingPageConfig } from "./types";

/**
 * Konfig-IDs mit fertiger Vorlage unter /landingpages/{id}.
 * Vorschau nur auf Wunsch — nach Ausfüllen der Konfiguration.
 */
const STATIC_TEMPLATE_IDS: ReadonlySet<LandingConfigId> = new Set([
  "smilescan",
  "aligner",
  "implantologie",
  "bleaching",
  "aesthetik",
  "prophylaxe",
  "karriere",
] satisfies LandingConfigId[]);

export function hasStaticTemplate(configId: LandingConfigId): boolean {
  return STATIC_TEMPLATE_IDS.has(configId);
}

/**
 * Beispielvorlage mit Praxis-Stammdaten und Konfigurator-Antworten (nur Anzeige).
 */
export function buildStaticPreviewUrl(
  configId: LandingConfigId,
  context: PracticeSolutionInquiryContext,
  config: LandingPageConfig,
  fieldValues: LandingFieldValues,
  options?: { returnPath?: string }
): string {
  const params = new URLSearchParams();

  if (context.practiceName?.trim()) {
    params.set(PREVIEW_PRACTICE_PARAMS.name, context.practiceName.trim());
  }
  const city = profileCityLine(context);
  if (city) params.set(PREVIEW_PRACTICE_PARAMS.city, city);
  if (context.contactPhone?.trim()) {
    params.set(PREVIEW_PRACTICE_PARAMS.phone, context.contactPhone.trim());
  }
  if (context.practiceAddress?.trim()) {
    params.set(PREVIEW_PRACTICE_PARAMS.address, context.practiceAddress.trim());
  }

  const draft = buildLandingPreviewDraft(config, fieldValues, context);
  appendPreviewContentToParams(params, {
    eyebrow: draft.eyebrow,
    headline: draft.headline,
    subheadline: draft.subheadline,
    ctaLabel: draft.ctaLabel,
  });

  if (options?.returnPath) {
    params.set(LANDING_PREVIEW_RETURN_PARAM, options.returnPath);
  }

  const query = params.toString();
  return query ? `/landingpages/${configId}?${query}` : `/landingpages/${configId}`;
}
