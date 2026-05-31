import "server-only";

/** Schneller Hinweis: Supabase-Session-Cookie vorhanden (kein vollständiger Auth-Roundtrip). */
export function hasLikelyAuthSessionCookie(
  cookies: ReadonlyArray<{ name: string }>
): boolean {
  return cookies.some(
    (c) =>
      /^sb-[^-]+-auth-token/.test(c.name) ||
      c.name.includes("supabase-auth-token") ||
      c.name.includes("sb-access-token")
  );
}
