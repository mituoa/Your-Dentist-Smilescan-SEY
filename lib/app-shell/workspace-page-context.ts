/** Seitenkontext für die globale Workspace-Toolbar (geschützter Bereich). */

export type WorkspacePageContext = {
  title: string;
  hint?: string;
};

export function resolveWorkspacePageContext(pathname: string): WorkspacePageContext {
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    return { title: "Dashboard" };
  }
  if (pathname.startsWith("/inbox")) {
    return { title: "Tracker", hint: "Patientenfälle" };
  }
  if (pathname === "/relay" || pathname.startsWith("/relay/")) {
    return { title: "Relay", hint: "Aufgaben & Nachrichten" };
  }
  if (pathname === "/my-tasks" || pathname.startsWith("/my-tasks/")) {
    return { title: "Relay", hint: "Meine Aufgaben" };
  }
  if (pathname.startsWith("/settings")) {
    return { title: "Einstellungen", hint: "Administration" };
  }
  if (pathname.startsWith("/admin")) {
    return { title: "Verwaltung", hint: "Administration" };
  }
  if (pathname.startsWith("/journal")) {
    return { title: "Journal", hint: "Inhalte" };
  }
  if (pathname.startsWith("/profile")) {
    return { title: "Profil", hint: "Praxis" };
  }
  if (pathname.startsWith("/create-case")) {
    return { title: "Neuer Fall", hint: "Tracker" };
  }
  return { title: "Arbeitsbereich" };
}

/** Suche nur dort, wo Patienten-/Fallkontext sinnvoll ist. */
export function resolveWorkspaceSearchVisible(pathname: string): boolean {
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) return true;
  if (pathname.startsWith("/inbox")) return true;
  if (pathname.startsWith("/create-case")) return true;
  if (pathname.startsWith("/journal")) return true;
  return false;
}
