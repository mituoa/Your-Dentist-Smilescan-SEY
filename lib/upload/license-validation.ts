export const MAX_LICENSE_SIZE_MB = 10;
export const MAX_LICENSE_SIZE_BYTES = MAX_LICENSE_SIZE_MB * 1024 * 1024;

export const ALLOWED_LICENSE_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/heic",
  "image/heif",
  "image/webp",
  "application/pdf",
];

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

function inferMimeFromName(fileName: string): string | null {
  const ext = fileName.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "jpg":
    case "jpeg":
      return "image/jpeg";
    case "png":
      return "image/png";
    case "webp":
      return "image/webp";
    case "heic":
      return "image/heic";
    case "heif":
      return "image/heif";
    case "pdf":
      return "application/pdf";
    default:
      return null;
  }
}

export function resolveLicenseMimeForUpload(file: File): string | null {
  const raw = (file.type || "").toLowerCase().trim();
  if (ALLOWED_LICENSE_MIME_TYPES.includes(raw)) return raw;
  if (!raw || raw === "application/octet-stream") return inferMimeFromName(file.name);
  return null;
}

export function validateLicenseFile(file: File): ValidationResult {
  const mime = resolveLicenseMimeForUpload(file);
  if (!mime) {
    const hint = (file.type || "").trim() || "unbekanntes Format";
    return {
      valid: false,
      error: `Format (${hint}) nicht unterstützt. Erlaubt: JPG, PNG, HEIC, WEBP oder PDF.`,
    };
  }

  if (file.size > MAX_LICENSE_SIZE_BYTES) {
    return {
      valid: false,
      error: `Datei zu groß (${Math.round(file.size / 1024 / 1024)} MB). Maximum: ${MAX_LICENSE_SIZE_MB} MB.`,
    };
  }

  return { valid: true };
}

