import {
  trackerInboxWorkType,
  type EnrichedSubmissionListItem,
  type TrackerInboxFilter,
} from "@/lib/inbox/tracker-inbox-logic";

export type TrackerInboxPulseId =
  | "new_submissions"
  | "approval_pending"
  | "follow_up";

export type TrackerInboxPulseMetric = {
  id: TrackerInboxPulseId;
  label: string;
  value: number;
  footnote: string;
};

export function buildTrackerInboxPulse(
  items: EnrichedSubmissionListItem[]
): TrackerInboxPulseMetric[] {
  let newCount = 0;
  let approvalCount = 0;
  let verlaufCount = 0;

  for (const item of items) {
    const { kind } = trackerInboxWorkType(item);
    if (kind === "neue_anfrage") newCount += 1;
    else if (kind === "freigabe") approvalCount += 1;
    else if (kind === "verlaufskontrolle") verlaufCount += 1;
  }

  return [
    {
      id: "new_submissions",
      label: "Neue Anfrage",
      value: newCount,
      footnote: "Patientenanfragen",
    },
    {
      id: "approval_pending",
      label: "Antwort freigeben",
      value: approvalCount,
      footnote: "Ärztliche Freigabe",
    },
    {
      id: "follow_up",
      label: "Verlaufskontrolle",
      value: verlaufCount,
      footnote: "Verlauf & Folgeeinsendungen",
    },
  ];
}
