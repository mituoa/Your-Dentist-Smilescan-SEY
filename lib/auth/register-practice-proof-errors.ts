import { validateLicenseFile } from "@/lib/upload/license-validation";

export const REGISTER_PROOF_FILE_TOO_LARGE =
  "Die Datei ist zu groß. Bitte wählen Sie eine Datei unter 10 MB." as const;

export const REGISTER_PROOF_FILE_WRONG_FORMAT =
  "Dieses Format wird nicht unterstützt. Bitte JPG, PNG oder PDF verwenden." as const;

export const REGISTER_PROOF_UPLOAD_FAILED =
  "Upload nicht abgeschlossen. Bitte erneut versuchen." as const;

/** Client-side validation before a file is attached to a side card. */
export function userFacingRegisterProofFileError(file: File): string | null {
  const result = validateLicenseFile(file);
  if (result.valid) return null;

  const raw = (result.error || "").toLowerCase();
  if (raw.includes("groß") || raw.includes("maximum")) {
    return REGISTER_PROOF_FILE_TOO_LARGE;
  }
  if (raw.includes("format") || raw.includes("unterstützt") || raw.includes("erlaubt")) {
    return REGISTER_PROOF_FILE_WRONG_FORMAT;
  }
  return REGISTER_PROOF_FILE_WRONG_FORMAT;
}

/** Maps API / network upload failures to calm inline copy (no technical detail). */
export function userFacingRegisterProofUploadError(raw: string): string {
  const m = raw.trim();
  if (!m) return REGISTER_PROOF_UPLOAD_FAILED;

  const lower = m.toLowerCase();
  if (lower.includes("zu groß") || lower.includes("too large") || lower.includes("10 mb")) {
    return REGISTER_PROOF_FILE_TOO_LARGE;
  }
  if (
    lower.includes("format") ||
    lower.includes("unterstützt") ||
    lower.includes("vorgaben") ||
    lower.includes("verifiziert") ||
    lower.includes("jpg") ||
    lower.includes("png") ||
    lower.includes("pdf")
  ) {
    return REGISTER_PROOF_FILE_WRONG_FORMAT;
  }
  if (lower.includes("429") || lower.includes("viele upload") || lower.includes("zu viele")) {
    return "Zu viele Versuche. Bitte warten Sie einen Moment und versuchen Sie es erneut.";
  }

  return REGISTER_PROOF_UPLOAD_FAILED;
}
