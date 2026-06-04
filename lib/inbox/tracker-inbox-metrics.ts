import {
  isApprovalPending,
  type EnrichedSubmissionListItem,
  type TrackerInboxFilter,
} from "@/lib/inbox/tracker-inbox-logic";

export type TrackerInboxPulseId =
  | "new_submissions"
  | "approval_pending"
  | "active_cases";

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
  let activeCount = 0;

  for (const item of items) {
    if (item.is_draft || item.message_draft_status === "sent") continue;
    if (isApprovalPending(item)) approvalCount += 1;
    else if (!item.seen_at) newCount += 1;
    else activeCount += 1;
  }

  return [
    {
      id: "new_submissions",
      label: "Neu",
      value: newCount,
      footnote: "Neue Anfragen",
    },
    {
      id: "approval_pending",
      label: "Freigabe",
      value: approvalCount,
      footnote: "KI wartet",
    },
    {
      id: "active_cases",
      label: "Aktiv",
      value: activeCount,
      footnote: "In Bearbeitung",
    },
  ];
}
