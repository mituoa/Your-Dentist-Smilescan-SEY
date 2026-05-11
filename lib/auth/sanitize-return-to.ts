/**
 * Same-origin relative paths only — used after logout (optional return target).
 */
export function sanitizeReturnTo(value: string | null | undefined): string | null {
  if (!value || typeof value !== "string") return null;
  const v = value.trim();
  if (!v.startsWith("/") || v.startsWith("//")) return null;
  if (v.startsWith("/accept-invite") || v.startsWith("/login")) return v;
  return null;
}
