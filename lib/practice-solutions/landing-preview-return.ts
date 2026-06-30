import type { LandingFieldValues } from "@/lib/practice-solutions/landing-configs/types";

/** Query-Parameter: nach Vorschau zurück zur Konfiguration / Erfolgsansicht. */
export const LANDING_PREVIEW_RETURN_PARAM = "landingReturn";

export const LANDING_INQUIRY_SUCCESS_KEY = "yd-landing-inquiry-success";

export type LandingInquirySuccessRecord = {
  inquiryId: string;
  displayTitle: string;
  configId: string;
  categoryId?: string;
  resumePath: string;
  fieldValues: LandingFieldValues;
};

export function buildLandingPreviewReturnPath(resumePath: string): string {
  const [base, hash] = resumePath.split("#");
  const separator = base.includes("?") ? "&" : "?";
  const withParam = `${base}${separator}${LANDING_PREVIEW_RETURN_PARAM}=1`;
  return hash ? `${withParam}#${hash}` : withParam;
}

export function storeLandingInquirySuccess(record: LandingInquirySuccessRecord): void {
  try {
    sessionStorage.setItem(LANDING_INQUIRY_SUCCESS_KEY, JSON.stringify(record));
  } catch {
    /* sessionStorage nicht verfügbar */
  }
}

export function readLandingInquirySuccess(): LandingInquirySuccessRecord | null {
  try {
    const raw = sessionStorage.getItem(LANDING_INQUIRY_SUCCESS_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as LandingInquirySuccessRecord;
  } catch {
    return null;
  }
}

export function clearLandingInquirySuccess(): void {
  try {
    sessionStorage.removeItem(LANDING_INQUIRY_SUCCESS_KEY);
  } catch {
    /* ignore */
  }
}
