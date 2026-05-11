/**
 * Ziel nach „Abbrechen“ auf `/create-case` — nur interne Pfade (Query `from=`).
 * Unbekannte Werte → Tracker (`/inbox`).
 */
export function resolveCreateCaseCancelHref(from: string | undefined | null): string {
  const key = (from ?? "").trim().toLowerCase();
  switch (key) {
    case "dashboard":
    case "atlas":
      return "/dashboard";
    case "inbox":
    case "tracker":
      return "/inbox";
    case "relay":
      return "/relay";
    case "my-tasks":
      return "/my-tasks";
    case "journal":
      return "/journal";
    case "settings":
    case "admin":
      return "/settings";
    default:
      return "/inbox";
  }
}

/** Query-Wert für `href` — nur erlaubte Schlüssel. */
export function createCaseFromQuery(pathname: string): string {
  const p = pathname || "";
  if (p === "/dashboard" || p.startsWith("/dashboard/")) return "dashboard";
  if (p.startsWith("/inbox")) return "inbox";
  if (p.startsWith("/relay") || p.startsWith("/my-tasks")) return "relay";
  if (p.startsWith("/journal")) return "journal";
  if (p === "/settings" || p.startsWith("/settings/") || p.startsWith("/admin")) return "settings";
  return "inbox";
}
