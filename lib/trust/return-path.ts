const ALLOWED_PREFIXES = [
  "/settings",
  "/dashboard",
  "/inbox",
  "/relay",
  "/profile",
  "/journal",
  "/my-tasks",
] as const;

/** Nur interne App-Pfade — kein Open-Redirect. */
export function sanitizeTrustReturnPath(raw: string | null | undefined): string | null {
  if (!raw || typeof raw !== "string") return null;
  const path = raw.trim();
  if (!path.startsWith("/") || path.startsWith("//")) return null;
  if (path.includes("://")) return null;
  const allowed = ALLOWED_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}?`) || path.startsWith(`${prefix}/`)
  );
  return allowed ? path : null;
}

export const SETTINGS_LEGAL_RETURN_PATH = "/settings?section=rechtliches";

export function resolveTrustReturnPath(
  raw: string | null | undefined,
  options: { authenticated: boolean }
): string {
  const sanitized = sanitizeTrustReturnPath(raw);
  if (sanitized) return sanitized;
  if (options.authenticated) return "/dashboard";
  return "/trust";
}

export function withTrustReturn(href: string, returnTo: string | null | undefined): string {
  if (!returnTo) return href;
  const sep = href.includes("?") ? "&" : "?";
  return `${href}${sep}return=${encodeURIComponent(returnTo)}`;
}
