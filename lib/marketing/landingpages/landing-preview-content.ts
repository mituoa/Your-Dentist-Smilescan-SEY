"use client";

import { useMemo } from "react";
import { useSearchParams } from "next/navigation";

export const PREVIEW_CONTENT_PARAMS = {
  eyebrow: "peyebrow",
  headline: "pheadline",
  subheadline: "psub",
  cta: "pcta",
} as const;

export type LandingPreviewContentDefaults = {
  eyebrow: string;
  headline: string;
  subheadline: string;
  ctaLabel: string;
};

export type LandingPreviewContent = LandingPreviewContentDefaults & {
  hasCustomContent: boolean;
};

export function readPreviewContentFromSearchParams(
  params: URLSearchParams
): Partial<LandingPreviewContentDefaults> | null {
  const eyebrow = params.get(PREVIEW_CONTENT_PARAMS.eyebrow)?.trim();
  const headline = params.get(PREVIEW_CONTENT_PARAMS.headline)?.trim();
  const subheadline = params.get(PREVIEW_CONTENT_PARAMS.subheadline)?.trim();
  const ctaLabel = params.get(PREVIEW_CONTENT_PARAMS.cta)?.trim();

  if (!eyebrow && !headline && !subheadline && !ctaLabel) return null;

  return {
    ...(eyebrow ? { eyebrow } : {}),
    ...(headline ? { headline } : {}),
    ...(subheadline ? { subheadline } : {}),
    ...(ctaLabel ? { ctaLabel } : {}),
  };
}

export function appendPreviewContentToParams(
  params: URLSearchParams,
  content: Partial<LandingPreviewContentDefaults>
): void {
  if (content.eyebrow?.trim()) {
    params.set(PREVIEW_CONTENT_PARAMS.eyebrow, content.eyebrow.trim().slice(0, 120));
  }
  if (content.headline?.trim()) {
    params.set(PREVIEW_CONTENT_PARAMS.headline, content.headline.trim().slice(0, 200));
  }
  if (content.subheadline?.trim()) {
    params.set(PREVIEW_CONTENT_PARAMS.subheadline, content.subheadline.trim().slice(0, 320));
  }
  if (content.ctaLabel?.trim()) {
    params.set(PREVIEW_CONTENT_PARAMS.cta, content.ctaLabel.trim().slice(0, 80));
  }
}

/** Liest optionale Text-Overrides aus der Konfigurator-Vorschau-URL. */
export function useLandingPreviewContent(
  defaults: LandingPreviewContentDefaults
): LandingPreviewContent {
  const params = useSearchParams();

  return useMemo(() => {
    const overrides = params.size > 0 ? readPreviewContentFromSearchParams(params) : null;
    const hasCustomContent = overrides !== null;

    return {
      eyebrow: overrides?.eyebrow ?? defaults.eyebrow,
      headline: overrides?.headline ?? defaults.headline,
      subheadline: overrides?.subheadline ?? defaults.subheadline,
      ctaLabel: overrides?.ctaLabel ?? defaults.ctaLabel,
      hasCustomContent,
    };
  }, [params, defaults.ctaLabel, defaults.eyebrow, defaults.headline, defaults.subheadline]);
}
