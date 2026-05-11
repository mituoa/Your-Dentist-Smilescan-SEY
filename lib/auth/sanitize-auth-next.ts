/**
 * Open-Redirect-Härtung für `/auth/callback?next=…`:
 * mehrfache Decode-Normalisierung, Backslash- und Protokoll-Abwehr, anschließend
 * strikte Allowlist interner Ziele (keine freien Pfade).
 */

const DEFAULT_FALLBACK = "/dashboard";

const ALLOWED_EXACT = new Set([
  "/dashboard",
  "/login",
  "/my-tasks",
  "/auth/continue",
]);

const MAX_DECODE_STEPS = 5;

function iterativeDecode(input: string): string | null {
  let t = input;
  for (let i = 0; i < MAX_DECODE_STEPS; i++) {
    try {
      const d = decodeURIComponent(t);
      if (d === t) break;
      t = d;
    } catch {
      return null;
    }
  }
  return t;
}

function stripTrailingSlash(pathname: string): string {
  if (pathname.length > 1 && pathname.endsWith("/")) {
    return pathname.slice(0, -1) || "/";
  }
  return pathname;
}

/**
 * Same-origin-relative Ziele nur aus expliziter Allowlist — verhindert Open Redirects
 * (inkl. encodierter `//`, Backslashes, Protokoll-Strings).
 */
export function sanitizeAuthNextPath(raw: string | null | undefined, fallback = DEFAULT_FALLBACK): string {
  const fb = fallback || DEFAULT_FALLBACK;
  if (!raw || typeof raw !== "string") return fb;

  let t = raw.trim().replace(/\\/g, "/");
  if (!t) return fb;

  const decoded = iterativeDecode(t);
  if (decoded === null) return fb;
  t = decoded.trim().replace(/\\/g, "/");
  if (!t) return fb;

  if (!t.startsWith("/")) return fb;
  if (t.includes("//")) return fb;
  if (/^[a-z][a-z0-9+.-]*:/i.test(t)) return fb;
  if (t.includes("://")) return fb;

  let url: URL;
  try {
    url = new URL(t, "https://invalid.invalid");
  } catch {
    return fb;
  }

  if (url.hash) return fb;

  const pathnameRaw = stripTrailingSlash(url.pathname);
  if (pathnameRaw.includes("//")) return fb;

  const pathname = pathnameRaw.toLowerCase();
  const search = url.search;

  if (pathname === "/accept-invite") {
    const params = url.searchParams;
    if ([...params.keys()].length !== 1 || !params.has("token")) return fb;
    const tok = params.get("token");
    if (!tok || !/^[a-f0-9]{64}$/i.test(tok)) return fb;
    return `/accept-invite?token=${encodeURIComponent(tok.toLowerCase())}`;
  }

  if (search && search !== "") {
    return fb;
  }

  if (ALLOWED_EXACT.has(pathname)) {
    return pathname;
  }

  return fb;
}

/** Bekannte, unkritische `error`-Codes für Post-Auth-Redirects nach `/login` (Resolver-Ausgänge). */
const RESOLVED_ENTRY_LOGIN_ERRORS = new Set(["workspace_missing"]);

/**
 * Defense-in-depth für serverseitig aufgelöste Entry-Pfade (z. B. nach `/auth/continue`):
 * nur gleiche Origin-Pfade wie die Entry-Policy, keine freien URLs.
 * Abweichung zu {@link sanitizeAuthNextPath}: `/login?error=…` nur für explizit erlaubte Codes.
 */
export function sanitizeResolvedEntryRedirectPath(raw: string, fallback = "/login"): string {
  const fb = fallback || "/login";
  const MAX = 4096;
  if (!raw || typeof raw !== "string") return fb;
  if (raw.length > MAX) return fb;

  let t = raw.trim().replace(/\\/g, "/");
  if (!t) return fb;

  const decoded = iterativeDecode(t);
  if (decoded === null) return fb;
  t = decoded.trim().replace(/\\/g, "/");
  if (!t) return fb;

  if (!t.startsWith("/")) return fb;
  if (t.includes("//")) return fb;
  if (/^[a-z][a-z0-9+.-]*:/i.test(t)) return fb;
  if (t.includes("://")) return fb;

  let url: URL;
  try {
    url = new URL(t, "https://invalid.invalid");
  } catch {
    return fb;
  }

  if (url.hash) return fb;

  const pathnameRaw = stripTrailingSlash(url.pathname);
  if (pathnameRaw.includes("//")) return fb;

  const pathname = pathnameRaw.toLowerCase();

  if (pathname === "/auth/continue") {
    return fb;
  }

  if (pathname === "/accept-invite") {
    const params = url.searchParams;
    if ([...params.keys()].length !== 1 || !params.has("token")) return fb;
    const tok = params.get("token");
    if (!tok || !/^[a-f0-9]{64}$/i.test(tok)) return fb;
    return `/accept-invite?token=${encodeURIComponent(tok.toLowerCase())}`;
  }

  if (pathname === "/login") {
    const params = url.searchParams;
    const keys = [...params.keys()];
    if (keys.length === 0) return "/login";
    if (keys.length === 1 && params.has("error")) {
      const code = params.get("error");
      if (code && RESOLVED_ENTRY_LOGIN_ERRORS.has(code)) {
        return `/login?error=${encodeURIComponent(code)}`;
      }
    }
    return fb;
  }

  const search = url.search;
  if (search && search !== "") return fb;

  if (pathname === "/dashboard" || pathname === "/my-tasks") {
    return pathname;
  }

  return fb;
}
