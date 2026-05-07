/**
 * Same-origin relative paths only — prevents open redirects via OAuth `next`.
 */
export function sanitizeAuthNextPath(raw: string | null | undefined, fallback = "/dashboard"): string {
  if (!raw || typeof raw !== "string") return fallback;
  const trimmed = raw.trim();
  if (!trimmed.startsWith("/") || trimmed.startsWith("//")) return fallback;
  if (trimmed.includes("\\") || trimmed.includes("://")) return fallback;
  return trimmed || fallback;
}
