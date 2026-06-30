const APP_RETURN_PREFIXES = [
  "/settings",
  "/dashboard",
  "/inbox",
  "/relay",
  "/profile",
  "/journal",
  "/my-tasks",
] as const;

const AUTH_RETURN_PREFIXES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
  "/accept-invite",
] as const;

/** Nur interne App-Pfade — kein Open-Redirect. */
export function sanitizeTrustReturnPath(raw: string | null | undefined): string | null {
  if (!raw || typeof raw !== "string") return null;
  const path = raw.trim();
  if (!path.startsWith("/") || path.startsWith("//")) return null;
  if (path.includes("://")) return null;
  const allowed = [...APP_RETURN_PREFIXES, ...AUTH_RETURN_PREFIXES].some(
    (prefix) => path === prefix || path.startsWith(`${prefix}?`) || path.startsWith(`${prefix}/`)
  );
  return allowed ? path : null;
}

export function isAuthTrustReturnPath(path: string | null | undefined): boolean {
  if (!path) return false;
  return AUTH_RETURN_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}?`) || path.startsWith(`${prefix}/`)
  );
}

/** Eingeloggte App-Nutzer (Einstellungen, Dashboard, …) — kein Marketing-Footer. */
export function isAppTrustReturnPath(path: string | null | undefined): boolean {
  if (!path) return false;
  return APP_RETURN_PREFIXES.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}?`) || path.startsWith(`${prefix}/`)
  );
}

export function appTrustBackLabel(returnTo: string): string {
  if (returnTo.startsWith("/settings")) return "Zurück zu Einstellungen";
  if (returnTo.startsWith("/profile")) return "Zurück zum Profil";
  if (returnTo.startsWith("/inbox")) return "Zurück zum Tracker";
  if (returnTo.startsWith("/relay") || returnTo.startsWith("/my-tasks")) return "Zurück zu Relay";
  if (returnTo.startsWith("/journal")) return "Zurück zum Care Center";
  return "Zurück zur Praxis";
}

export function authTrustBackLabel(returnTo: string): string {
  if (returnTo.startsWith("/register")) return "Zurück zur Registrierung";
  if (returnTo.startsWith("/forgot-password") || returnTo.startsWith("/reset-password")) {
    return "Zurück";
  }
  if (returnTo.startsWith("/accept-invite")) return "Zurück zur Einladung";
  return "Zurück zum Login";
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
