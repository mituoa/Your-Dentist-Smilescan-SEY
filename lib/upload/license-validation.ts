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

/** Dateiendung für Storage-Pfade — nur aus **validiertem** MIME, nicht aus dem Original-Dateinamen (Spoofing / Path-Traversal). */
export function storageExtForValidatedLicense(mime: string): string {
  const m = mime.toLowerCase().trim();
  switch (m) {
    case "image/jpeg":
    case "image/jpg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/heic":
    case "image/heif":
      return "heic";
    case "application/pdf":
      return "pdf";
    default:
      return "pdf";
  }
}

/** Stichprobe des Dateiinhalts (Magic Bytes) — erschwert MIME-Spoofing bei Upload. */
export function validateLicenseBufferMagic(buffer: Buffer, mime: string): ValidationResult {
  if (buffer.length < 12) {
    return { valid: false, error: "Datei zu klein oder beschädigt." };
  }

  const m = mime.toLowerCase();

  if (m === "application/pdf") {
    if (buffer.subarray(0, 4).toString("ascii") === "%PDF") return { valid: true };
    return { valid: false, error: "PDF-Datei konnte nicht verifiziert werden." };
  }

  if (m === "image/jpeg" || m === "image/jpg") {
    if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) return { valid: true };
    return { valid: false, error: "JPEG-Datei konnte nicht verifiziert werden." };
  }

  if (m === "image/png") {
    const sig = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    if (buffer.subarray(0, 8).equals(sig)) return { valid: true };
    return { valid: false, error: "PNG-Datei konnte nicht verifiziert werden." };
  }

  if (m === "image/webp") {
    if (
      buffer.subarray(0, 4).toString("ascii") === "RIFF" &&
      buffer.subarray(8, 12).toString("ascii") === "WEBP"
    ) {
      return { valid: true };
    }
    return { valid: false, error: "WebP-Datei konnte nicht verifiziert werden." };
  }

  if (m === "image/heic" || m === "image/heif") {
    const ftyp = buffer.indexOf(Buffer.from("ftyp"));
    if (ftyp >= 4 && ftyp < 64) {
      const brand = buffer.subarray(ftyp + 4, Math.min(ftyp + 16, buffer.length)).toString("ascii");
      if (/heic|mif1|msf1|heix|hevc|heis|hevm/i.test(brand)) return { valid: true };
    }
    return { valid: false, error: "HEIC/HEIF konnte nicht verifiziert werden." };
  }

  return { valid: false, error: "Dateiformat nicht unterstützt." };
}

