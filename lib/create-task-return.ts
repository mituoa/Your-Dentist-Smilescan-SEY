/**
 * Ziel nach „Abbrechen“ auf `/my-tasks/new` — nur interne Pfade (Query `from=`).
 */
export function resolveCreateTaskCancelHref(from: string | undefined | null): string {
  const key = (from ?? "").trim().toLowerCase();
  switch (key) {
    case "dashboard":
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
      return "/settings";
    default:
      return "/my-tasks";
  }
}

export function createTaskFromQuery(pathname: string): string {
  const p = pathname || "";
  if (p === "/dashboard" || p.startsWith("/dashboard/")) return "dashboard";
  if (p.startsWith("/inbox")) return "inbox";
  if (p.startsWith("/relay") || p.startsWith("/my-tasks")) return "my-tasks";
  if (p.startsWith("/journal")) return "journal";
  if (p === "/settings" || p.startsWith("/settings/")) return "settings";
  return "my-tasks";
}
