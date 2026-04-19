export const SLUG_LIMITS = {
  min: 3,
  max: 50,
} as const;

export function isValidSlug(slug: string): { valid: boolean; error?: string } {
  const trimmed = slug.trim();

  if (!trimmed) return { valid: false, error: "Slug darf nicht leer sein." };
  if (trimmed.length < SLUG_LIMITS.min)
    return { valid: false, error: `Mindestens ${SLUG_LIMITS.min} Zeichen.` };
  if (trimmed.length > SLUG_LIMITS.max)
    return { valid: false, error: `Maximal ${SLUG_LIMITS.max} Zeichen.` };

  if (!/^[a-z0-9-]+$/.test(trimmed)) {
    return {
      valid: false,
      error: "Nur Kleinbuchstaben, Zahlen und Bindestriche erlaubt.",
    };
  }

  if (trimmed.startsWith("-") || trimmed.endsWith("-")) {
    return {
      valid: false,
      error: "Keine Bindestriche am Anfang oder Ende.",
    };
  }

  if (trimmed.includes("--")) {
    return { valid: false, error: "Keine doppelten Bindestriche." };
  }

  const reserved = [
    "api",
    "admin",
    "login",
    "register",
    "journal",
    "profile",
    "settings",
    "doc",
    "accept-invite",
    "app",
    "www",
    "smilescan",
  ];
  if (reserved.includes(trimmed)) {
    return { valid: false, error: "Dieser Slug ist reserviert." };
  }

  return { valid: true };
}
