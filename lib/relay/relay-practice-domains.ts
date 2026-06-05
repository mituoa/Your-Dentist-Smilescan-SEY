import type { RelayTaskCategory } from "@/lib/relay/relay-task-category";
import { RELAY_CATEGORY_LABELS } from "@/lib/relay/relay-task-category";

/** Später aus Settings/DB — zentral, nicht in UI verstreut. */
export type RelayPracticeDomain = {
  id: RelayTaskCategory;
  label: string;
  /** Legacy `task_context` für createMyTask. */
  taskContextKey: "case" | "org" | "material" | "other";
  doctorOnly?: boolean;
};

export const RELAY_PRACTICE_DOMAINS: RelayPracticeDomain[] = [
  { id: "patient_contact", label: RELAY_CATEGORY_LABELS.patient_contact, taskContextKey: "case" },
  { id: "appointment", label: RELAY_CATEGORY_LABELS.appointment, taskContextKey: "case" },
  { id: "clinical_decision", label: RELAY_CATEGORY_LABELS.clinical_decision, taskContextKey: "case", doctorOnly: true },
  { id: "aftercare", label: RELAY_CATEGORY_LABELS.aftercare, taskContextKey: "case" },
  { id: "recall", label: RELAY_CATEGORY_LABELS.recall, taskContextKey: "org" },
  { id: "lab", label: RELAY_CATEGORY_LABELS.lab, taskContextKey: "material" },
  { id: "admin", label: RELAY_CATEGORY_LABELS.admin, taskContextKey: "org" },
  { id: "material", label: RELAY_CATEGORY_LABELS.material, taskContextKey: "material" },
  { id: "practice_org", label: RELAY_CATEGORY_LABELS.practice_org, taskContextKey: "org" },
  { id: "qm_routine", label: RELAY_CATEGORY_LABELS.qm_routine, taskContextKey: "org" },
];

export function relayDomainsForRole(isDoctor: boolean): RelayPracticeDomain[] {
  if (isDoctor) return RELAY_PRACTICE_DOMAINS;
  return RELAY_PRACTICE_DOMAINS.filter((d) => !d.doctorOnly);
}

export function defaultDomainForSection(
  section: "operations" | "routines" | "handoffs"
): RelayTaskCategory {
  if (section === "routines") return "qm_routine";
  if (section === "handoffs") return "practice_org";
  return "practice_org";
}

export function domainById(id: RelayTaskCategory): RelayPracticeDomain {
  return RELAY_PRACTICE_DOMAINS.find((d) => d.id === id) ?? RELAY_PRACTICE_DOMAINS[8]!;
}
