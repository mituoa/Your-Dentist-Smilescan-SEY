import {
  normalizePracticeStatus,
  type PracticeStatusId,
} from "@/lib/practice-status";

/** Vier klare Praxis-Status — Dropdown im Fall (Enterprise Copy). */
export const TRACKER_ENTERPRISE_STATUS_OPTIONS: {
  id: PracticeStatusId;
  label: string;
}[] = [
  { id: "new", label: "Neu" },
  { id: "in_progress", label: "In Bearbeitung" },
  { id: "waiting_for_patient", label: "Warte auf Rückmeldung" },
  { id: "resolved", label: "Abgeschlossen" },
];

/** Status-Auswahl in der Liste — „Neu“ ist kein manueller Zielstatus. */
export const TRACKER_LIST_STATUS_OPTIONS = TRACKER_ENTERPRISE_STATUS_OPTIONS.filter(
  (o) => o.id !== "new"
);

export function displayPracticeStatusForCase(
  stored: string | null | undefined
): PracticeStatusId {
  const normalized = normalizePracticeStatus(stored);
  if (!normalized) return "new";
  if (normalized === "watching" || normalized === "photo_requested") {
    return "in_progress";
  }
  if (
    normalized === "new" ||
    normalized === "in_progress" ||
    normalized === "waiting_for_patient" ||
    normalized === "resolved"
  ) {
    return normalized;
  }
  return "in_progress";
}

export function enterpriseStatusLabel(id: PracticeStatusId): string {
  return (
    TRACKER_ENTERPRISE_STATUS_OPTIONS.find((o) => o.id === id)?.label ?? id
  );
}
