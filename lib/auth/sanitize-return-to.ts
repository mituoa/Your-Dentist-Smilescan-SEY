import { isInviteTokenFormat } from "@/lib/team-invitations/invite-token-format";

/**
 * Nur gleichursprüngliche, fest definierte Rückkehrziele — aktuell ausschließlich `/accept-invite?token=…`
 * mit gültigem 64-hex-Token (Logout → erneut Einladung öffnen). Keine freien Query-Ketten auf `/login`.
 */
export function sanitizeReturnTo(value: string | null | undefined): string | null {
  if (!value || typeof value !== "string") return null;
  const v = value.trim();
  if (!v.startsWith("/") || v.startsWith("//")) return null;
  if (!v.startsWith("/accept-invite")) return null;

  try {
    const u = new URL(v, "https://local.invalid");
    if (u.pathname !== "/accept-invite" && u.pathname !== "/accept-invite/") return null;
    const token = u.searchParams.get("token")?.trim() ?? "";
    if (!isInviteTokenFormat(token)) return null;
    return `/accept-invite?token=${token}`;
  } catch {
    return null;
  }
}
