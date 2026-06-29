import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Clock,
  FileText,
  Layers,
  Mail,
  MapPin,
  MessageSquare,
  Scale,
  Shield,
  Sparkles,
  Store,
  Users,
  Workflow,
} from "lucide-react";

export type SettingsSectionId =
  | "praxisprofil"
  | "standorte"
  | "behandlungsspektrum"
  | "oeffnungszeiten"
  | "team-rollen"
  | "einladungen"
  | "sicherheit"
  | "nachrichten"
  | "automatisierungen"
  | "journal-kategorien"
  | "journal-vorlagen"
  | "rechtliches";

export type SettingsNavItem = {
  id: SettingsSectionId;
  label: string;
  hint: string;
  icon: LucideIcon;
};

export type SettingsNavGroup = {
  label: string;
  items: SettingsNavItem[];
};

export const SETTINGS_NAV_GROUPS: SettingsNavGroup[] = [
  {
    label: "PRAXIS",
    items: [
      {
        id: "praxisprofil",
        label: "Praxisprofil",
        hint: "Öffentliche Informationen",
        icon: Store,
      },
      {
        id: "standorte",
        label: "Standorte",
        hint: "Standorte verwalten",
        icon: MapPin,
      },
      {
        id: "behandlungsspektrum",
        label: "Behandlungsspektrum",
        hint: "Schwerpunkte und Leistungen",
        icon: Sparkles,
      },
      {
        id: "oeffnungszeiten",
        label: "Öffnungszeiten",
        hint: "Verfügbarkeit",
        icon: Clock,
      },
    ],
  },
  {
    label: "TEAM & BERECHTIGUNGEN",
    items: [
      {
        id: "team-rollen",
        label: "Team & Rollen",
        hint: "Mitglieder und Berechtigungen",
        icon: Users,
      },
      {
        id: "einladungen",
        label: "Einladungen",
        hint: "Offene Einladungen verwalten",
        icon: Mail,
      },
      {
        id: "sicherheit",
        label: "Sicherheit",
        hint: "Passwort, 2FA, Sitzungen",
        icon: Shield,
      },
    ],
  },
  {
    label: "KOMMUNIKATION",
    items: [
      {
        id: "nachrichten",
        label: "Nachrichten",
        hint: "Vorlagen und Signaturen",
        icon: MessageSquare,
      },
      {
        id: "automatisierungen",
        label: "Automatisierungen",
        hint: "Benachrichtigungen und Workflows",
        icon: Workflow,
      },
    ],
  },
  {
    label: "JOURNAL",
    items: [
      {
        id: "journal-kategorien",
        label: "Kategorien",
        hint: "Themenbereiche verwalten",
        icon: Layers,
      },
      {
        id: "journal-vorlagen",
        label: "Vorlagen",
        hint: "Nachsorge und Inhalte",
        icon: FileText,
      },
    ],
  },
  {
    label: "RECHTLICHES",
    items: [
      {
        id: "rechtliches",
        label: "Rechtliches",
        hint: "Verträge und Dokumente",
        icon: Scale,
      },
    ],
  },
];

export const SETTINGS_SECTION_IDS = SETTINGS_NAV_GROUPS.flatMap((g) =>
  g.items.map((i) => i.id)
);

export function isSettingsSectionId(value: string | null | undefined): value is SettingsSectionId {
  return Boolean(value && SETTINGS_SECTION_IDS.includes(value as SettingsSectionId));
}

export function defaultTeamTabForSection(
  section: SettingsSectionId
): "mitglieder" | "rollen" | "einladungen" {
  if (section === "einladungen") return "einladungen";
  if (section === "team-rollen") return "rollen";
  return "mitglieder";
}

export function isTeamSection(section: SettingsSectionId): boolean {
  return section === "team-rollen" || section === "einladungen";
}

/** Anzeigename für Mobile-Panel-Header und Zurück-Link. */
export function getSettingsSectionLabel(section: SettingsSectionId): string {
  for (const group of SETTINGS_NAV_GROUPS) {
    const item = group.items.find((entry) => entry.id === section);
    if (item) return item.label;
  }
  for (const group of SETTINGS_MOBILE_NAV_GROUPS) {
    const item = group.items.find((entry) => entry.id === section);
    if (item) return item.label;
  }
  return "Einstellungen";
}

/** Mobile IA — grouped hub (desktop nav unchanged). */
function pickNavItems(ids: SettingsSectionId[]): SettingsNavItem[] {
  const flat = SETTINGS_NAV_GROUPS.flatMap((g) => g.items);
  return ids
    .map((id) => flat.find((i) => i.id === id))
    .filter((item): item is SettingsNavItem => Boolean(item));
}

export const SETTINGS_MOBILE_NAV_GROUPS: SettingsNavGroup[] = [
  {
    label: "PRAXIS",
    items: pickNavItems([
      "praxisprofil",
      "standorte",
      "oeffnungszeiten",
      "behandlungsspektrum",
    ]).map((item) =>
      item.id === "behandlungsspektrum"
        ? { ...item, label: "Leistungen", hint: "Schwerpunkte im Profil" }
        : item
    ),
  },
  {
    label: "TEAM",
    items: pickNavItems(["team-rollen", "einladungen"]),
  },
  {
    label: "KOMMUNIKATION",
    items: pickNavItems([
      "journal-kategorien",
      "nachrichten",
      "journal-vorlagen",
    ]).map((item) =>
      item.id === "journal-kategorien"
        ? { ...item, label: "Care Center", hint: "Patientenwissen" }
        : item.id === "journal-vorlagen"
          ? { ...item, label: "Vorlagen", hint: "Nachsorge und FAQ" }
          : item
    ),
  },
  {
    label: "SYSTEM",
    items: pickNavItems(["sicherheit", "rechtliches"]).map((item) =>
      item.id === "sicherheit"
        ? {
            ...item,
            label: "Sicherheit & Login",
            hint: "Passwort und Sitzungen",
          }
        : item
    ),
  },
];
