/** Google-OAuth auf der Login-Seite (NEXT_PUBLIC_ENABLE_GOOGLE_LOGIN, Standard: an). */
export function isGoogleLoginEnabled(): boolean {
  const raw = (process.env.NEXT_PUBLIC_ENABLE_GOOGLE_LOGIN ?? "true").trim().toLowerCase();
  return raw !== "false" && raw !== "0" && raw !== "off";
}
