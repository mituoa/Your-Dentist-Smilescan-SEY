"use client";

import { useSearchParams } from "next/navigation";

import {
  GENERIC_PRACTICE,
  readPracticeOverrideFromSearchParams,
  type LandingpagePractice,
} from "@/lib/marketing/landingpages/generic-practice";

/**
 * Liefert GENERIC_PRACTICE, außer die Seite wurde mit Vorschau-Query-Parametern
 * aus dem Konfigurator aufgerufen (siehe practice-solution-inquiry-sheet.tsx) —
 * dann werden Praxisname/-stadt/-telefon/-adresse live eingeblendet.
 */
export function usePracticeOverride(): LandingpagePractice {
  const params = useSearchParams();
  if (params.size === 0) return GENERIC_PRACTICE;
  return readPracticeOverrideFromSearchParams(params);
}
