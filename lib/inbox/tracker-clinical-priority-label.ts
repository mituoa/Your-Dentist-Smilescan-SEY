import type { EnrichedSubmissionListItem } from "@/lib/inbox/tracker-inbox-logic";
import { clinicalRiskSubTier } from "@/lib/inbox/tracker-inbox-logic";

type PriorityInput = Pick<
  EnrichedSubmissionListItem,
  "patient_notes" | "urgency" | "intake_channel"
>;

/** Subtile klinische Priorität — keine Alarmoptik. */
export function clinicalPriorityLabel(item: PriorityInput): string {
  const tier = clinicalRiskSubTier(item as EnrichedSubmissionListItem);
  if (tier <= 1) return "Akute Aufmerksamkeit empfohlen";
  if (tier <= 4) return "Zeitnahe Rückmeldung empfohlen";
  if (tier >= 8) return "Routineanliegen";
  return "Klinische Einordnung prüfen";
}
