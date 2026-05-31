/** Integrierte Workspace-Headline — Eyebrow & Untertitel je Route. */

export type WorkspaceIntegratedHeaderContext = {
  eyebrow: string;
  subtitle: string;
  showSearch: boolean;
  /** Desktop: integrierte Headline ausblenden (eigene Mobile-UI). */
  hideOnDesktop?: boolean;
};

export function resolveWorkspaceIntegratedHeader(
  pathname: string
): WorkspaceIntegratedHeaderContext {
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    return {
      eyebrow: "Praxisüberblick",
      subtitle: "Praxis aktiv · Vorgänge und Patienten im Überblick",
      showSearch: true,
    };
  }
  if (pathname.startsWith("/inbox")) {
    return {
      eyebrow: "Tracker",
      subtitle: "Patientenfälle · Einsendungen und Triage",
      showSearch: true,
    };
  }
  if (pathname === "/relay" || pathname.startsWith("/relay/")) {
    return {
      eyebrow: "Relay",
      subtitle: "Aufgaben, Übergaben und Teamkoordination",
      showSearch: false,
    };
  }
  if (pathname === "/my-tasks" || pathname.startsWith("/my-tasks/")) {
    return {
      eyebrow: "Relay",
      subtitle: "Meine Aufgaben und offene Schritte",
      showSearch: false,
    };
  }
  if (pathname.startsWith("/journal")) {
    return {
      eyebrow: "Journal",
      subtitle: "Inhalte und Praxis-Kommunikation",
      showSearch: true,
    };
  }
  if (pathname.startsWith("/create-case")) {
    return {
      eyebrow: "Neuer Fall",
      subtitle: "Patientenfall anlegen und dokumentieren",
      showSearch: true,
    };
  }
  if (pathname.startsWith("/settings")) {
    return {
      eyebrow: "Einstellungen",
      subtitle: "Administration und Praxisprofil",
      showSearch: false,
    };
  }
  if (pathname.startsWith("/admin")) {
    return {
      eyebrow: "Verwaltung",
      subtitle: "Workspace und Rollen",
      showSearch: false,
    };
  }
  if (pathname.startsWith("/profile")) {
    return {
      eyebrow: "Profil",
      subtitle: "Persönliche Praxis-Einstellungen",
      showSearch: false,
    };
  }
  return {
    eyebrow: "Arbeitsbereich",
    subtitle: "Ihre Praxis-Software",
    showSearch: false,
  };
}

export function resolveWorkspaceGreeting(hour: number): string {
  if (hour < 12) return "Guten Morgen";
  if (hour < 18) return "Guten Tag";
  return "Guten Abend";
}
