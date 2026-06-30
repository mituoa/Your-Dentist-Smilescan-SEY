/** Integrierte Workspace-Headline — Eyebrow & Untertitel je Route. */

export type WorkspaceIntegratedHeaderContext = {
  eyebrow: string;
  subtitle: string;
  /** Zweite Zeile (z. B. Tracker-Aufschlüsselung). */
  subtitleMeta?: string;
  showSearch: boolean;
  /** Keine Begrüßung mit Namen (selten — Standard ist einheitliche Begrüßung). */
  hideGreeting?: boolean;
};

export function resolveWorkspaceIntegratedHeader(
  pathname: string
): WorkspaceIntegratedHeaderContext {
  if (pathname === "/dashboard" || pathname.startsWith("/dashboard/")) {
    return {
      eyebrow: "Atlas",
      subtitle: "Was heute Ihre Aufmerksamkeit benötigt",
      showSearch: true,
    };
  }
  if (pathname.startsWith("/inbox")) {
    return {
      eyebrow: "Tracker",
      subtitle: "",
      showSearch: true,
    };
  }
  if (pathname === "/relay" || pathname.startsWith("/relay/")) {
    return {
      eyebrow: "Relay",
      subtitle: "",
      showSearch: true,
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
      eyebrow: "Care Center",
      subtitle: "",
      showSearch: false,
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
      subtitle: "",
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
  if (pathname.startsWith("/profile/editor")) {
    return {
      eyebrow: "Profil",
      subtitle: "Patientenbereich bearbeiten",
      showSearch: false,
    };
  }
  if (pathname.startsWith("/profile/solutions")) {
    return {
      eyebrow: "Profil",
      subtitle: "Kampagnen & Landingpages",
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
