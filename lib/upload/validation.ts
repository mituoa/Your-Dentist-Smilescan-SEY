export const MAX_PHOTOS = 10;
export const MAX_PHOTO_SIZE_MB = 10;
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

export function validatePhoto(file: File): ValidationResult {
  if (!ALLOWED_MIME_TYPES.includes(file.type.toLowerCase())) {
    return {
      valid: false,
      error: `Format "${file.type}" nicht unterstützt. Erlaubt: JPG, PNG, HEIC, WEBP.`,
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
