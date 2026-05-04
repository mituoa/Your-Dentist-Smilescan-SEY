export const MAX_PHOTOS = 10;
export const MAX_PHOTO_SIZE_MB = 33;
export const MAX_PHOTO_SIZE_BYTES = MAX_PHOTO_SIZE_MB * 1024 * 1024;

export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/heic",
  "image/heif",
  "image/webp",
];

export interface ValidationResult {
  valid: boolean;
  error?: string;
}

/** Dateiname → MIME, wenn der Browser keinen (oder nur octet-stream) liefert — z. B. iOS/HEIC. */
function inferImageMimeFromName(fileName: string): string | null {
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
    default:
      return null;
  }
}

/**
 * Effektiver Bild-MIME-Typ für Validierung und Storage-Upload.
 */
export function resolveImageMimeForUpload(file: File): string | null {
  const raw = (file.type || "").toLowerCase().trim();
  if (ALLOWED_MIME_TYPES.includes(raw)) {
    return raw;
  }
  if (!raw || raw === "application/octet-stream") {
    return inferImageMimeFromName(file.name);
  }
  return null;
}

export function validatePhoto(file: File): ValidationResult {
  const mime = resolveImageMimeForUpload(file);
  if (!mime) {
    const hint = (file.type || "").trim() || "unbekanntes Format";
    return {
      valid: false,
      error: `Format (${hint}) nicht unterstützt. Erlaubt: JPG, PNG, HEIC, WEBP — ggf. Dateiendung prüfen.`,
    };
  }

  if (file.size > MAX_PHOTO_SIZE_BYTES) {
    return {
      valid: false,
      error: `Foto zu groß (${Math.round(file.size / 1024 / 1024)} MB). Maximum: ${MAX_PHOTO_SIZE_MB} MB.`,
    };
  }

  return { valid: true };
}

export function validatePhotoCollection(files: File[]): ValidationResult {
  if (files.length === 0) {
    return { valid: false, error: "Mindestens ein Foto erforderlich." };
  }

  if (files.length > MAX_PHOTOS) {
    return {
      valid: false,
      error: `Maximal ${MAX_PHOTOS} Fotos erlaubt (${files.length} eingereicht).`,
    };
  }

  for (const file of files) {
    const result = validatePhoto(file);
    if (!result.valid) {
      return result;
    }
  }

  return { valid: true };
}
