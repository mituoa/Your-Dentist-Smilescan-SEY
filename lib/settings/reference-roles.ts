import type { LucideIcon } from "lucide-react";
import { GraduationCap, Shield, Stethoscope, UserCog, Users } from "lucide-react";

export type ReferenceRoleId = "zahnarzt" | "zfa" | "zmp" | "verwaltung" | "azubi";

export type ReferenceRole = {
  id: ReferenceRoleId;
  label: string;
  description: string;
  icon: LucideIcon;
  permissions: string[];
  /** Zuordnung zu bestehenden Workspace-Rollen (doctor | team) */
  memberRole: "doctor" | "team" | null;
};

export const REFERENCE_ROLES: ReferenceRole[] = [
  {
    id: "zahnarzt",
    label: "Zahnarzt",
    description: "Vollzugriff auf alle Bereiche der Praxis",
    icon: Stethoscope,
    permissions: ["Alle Funktionen", "Team verwalten", "Einstellungen bearbeiten"],
    memberRole: "doctor",
  },
  {
    id: "zfa",
    label: "ZFA",
    description: "Verwaltet Patienten und Kommunikation",
    icon: Users,
    permissions: ["Patienten verwalten", "Kommunikation", "Termine verwalten"],
    memberRole: "team",
  },
  {
    id: "zmp",
    label: "ZMP",
    description: "Prophylaxe und Parodontologie",
    icon: UserCog,
    permissions: ["Patienten verwalten", "Journal (Inhalte)", "Kommunikation"],
    memberRole: null,
  },
  {
    id: "verwaltung",
    label: "Verwaltung",
    description: "Organisation und Abrechnung",
    icon: UserCog,
    permissions: ["Termine verwalten", "Abrechnung", "Berichte einsehen"],
    memberRole: null,
  },
  {
    id: "azubi",
    label: "Azubi",
    description: "Eingeschränkter Zugriff",
    icon: GraduationCap,
    permissions: ["Eigene Aufgaben", "Termine einsehen", "Keine sensiblen Daten"],
    memberRole: null,
  },
];
