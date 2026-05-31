/**
 * Google-OAuth nur anzeigen, wenn explizit freigeschaltet und Supabase erreichbar konfiguriert ist.
 * Setzen: NEXT_PUBLIC_ENABLE_GOOGLE_LOGIN=true (nach Provider-Freigabe in Supabase).
 */
export function isGoogleLoginEnabled(): boolean {
  const raw = (process.env.NEXT_PUBLIC_ENABLE_GOOGLE_LOGIN ?? "").trim().toLowerCase();
  if (raw !== "true" && raw !== "1" && raw !== "yes" && raw !== "on") {
    return false;
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  return Boolean(url && key);
}
