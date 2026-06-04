/** Persistenter Praxisstatus (`submissions.practice_status`). */

export type PracticeStatusId =
  | "new"
  | "in_progress"
  | "waiting_for_patient"
  | "photo_requested"
  | "watching"
  | "resolved";

export const PRACTICE_STATUS_OPTIONS: {
  id: PracticeStatusId;
  label: string;
  /** Manuell in der Inbox wählbar (nicht nur systemgesetzt). */
  manual: boolean;
}[] = [
  { id: "new", label: "Neu", manual: true },
  { id: "in_progress", label: "In Bearbeitung", manual: true },
  { id: "waiting_for_patient", label: "Rückfrage offen", manual: false },
  { id: "photo_requested", label: "Foto angefordert", manual: false },
  { id: "watching", label: "Beobachten", manual: true },
  { id: "resolved", label: "Abgeschlossen", manual: true },
];

export const MANUAL_PRACTICE_STATUS_OPTIONS = PRACTICE_STATUS_OPTIONS.filter(
  (o) => o.manual
);

const VALID = new Set<string>(PRACTICE_STATUS_OPTIONS.map((o) => o.id));

export function normalizePracticeStatus(
  stored: string | null | undefined
): PracticeStatusId | null {
  if (stored && VALID.has(stored)) return stored as PracticeStatusId;
  return null;
}

/** Praxisstatus nach erfolgreichem Patientenversand. */
export function practiceStatusAfterOutboundSend(
  messageKind: "reply" | "question" | "photo_request" | "appointment_offer"
): PracticeStatusId {
  switch (messageKind) {
    case "photo_request":
      return "photo_requested";
    case "question":
    case "appointment_offer":
      return "waiting_for_patient";
    case "reply":
      return "in_progress";
    default:
      return "in_progress";
  }
}

export function practiceStatusLabel(id: PracticeStatusId): string {
  return PRACTICE_STATUS_OPTIONS.find((o) => o.id === id)?.label ?? id;
}
