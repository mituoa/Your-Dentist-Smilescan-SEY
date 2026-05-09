/**
 * Normalises public env URL strings. Netlify (or copy-paste) sometimes stores
 * leading/trailing spaces or wrapping quotes — those break `new URL()` and Supabase clients.
 */

export function stripSurroundingQuotes(s: string): string {
  const t = s.trim();
  if (t.length < 2) return t;
  const open = t[0];
  const close = t[t.length - 1];
  if ((open === '"' && close === '"') || (open === "'" && close === "'")) {
    return t.slice(1, -1).trim();
  }
  return t;
}

export function normalizePublicEnvUrl(raw: string | undefined | null): string {
  if (raw == null) return "";
  return stripSurroundingQuotes(String(raw));
}

/** Returns a string that `new URL()` accepts, or `fallback` if missing/invalid. */
export function toSafeAbsoluteHttpUrl(raw: string | undefined | null, fallback: string): string {
  const candidate = normalizePublicEnvUrl(raw);
  if (!candidate) return fallback;
  try {
    const u = new URL(candidate);
    if (u.protocol !== "http:" && u.protocol !== "https:") return fallback;
    if (!u.host) return fallback;
    return u.href.replace(/\/$/, "");
  } catch {
    return fallback;
  }
}

export function assertValidHttpUrlForSupabase(url: string): void {
  try {
    const u = new URL(url);
    if (u.protocol !== "https:" && u.protocol !== "http:") {
      throw new Error("protocol");
    }
    if (!u.host) throw new Error("host");
  } catch {
    throw new Error(
      "Invalid NEXT_PUBLIC_SUPABASE_URL: use the full Project URL from Supabase (https://….supabase.co). In Netlify, remove spaces and do not wrap the value in quotes."
    );
  }
}
