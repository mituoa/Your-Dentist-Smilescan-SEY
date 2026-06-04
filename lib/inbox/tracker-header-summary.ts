import {
  isApprovalPending,
  type EnrichedSubmissionListItem,
} from "@/lib/inbox/tracker-inbox-logic";

export type TrackerHeaderSummary = {
  waitingCount: number;
  lead: string;
  breakdown: string;
};

function isOpenCase(item: EnrichedSubmissionListItem): boolean {
  if (item.is_draft) return false;
  if (item.message_draft_status === "sent") return false;
  return true;
}

function caseBucket(
  item: EnrichedSubmissionListItem
): "new" | "approval" | "active" | null {
  if (!isOpenCase(item)) return null;
  if (isApprovalPending(item)) return "approval";
  if (!item.seen_at) return "new";
  return "active";
}

/** Arbeitsübersicht für den integrierten Tracker-Header. */
export function buildTrackerHeaderSummary(
  items: EnrichedSubmissionListItem[]
): TrackerHeaderSummary {
  let newCount = 0;
  let activeCount = 0;
  let approvalCount = 0;

  for (const item of items) {
    const bucket = caseBucket(item);
    if (bucket === "new") newCount += 1;
    else if (bucket === "approval") approvalCount += 1;
    else if (bucket === "active") activeCount += 1;
  }

  const waitingCount = newCount + activeCount + approvalCount;

  if (waitingCount === 0) {
    return {
      waitingCount: 0,
      lead: "Keine offenen Entscheidungen",
      breakdown: "Praxis-Inbox ist auf dem aktuellen Stand",
    };
  }

  const lead =
    waitingCount === 1
      ? "1 Fall wartet auf Ihre Entscheidung"
      : `${waitingCount} Fälle warten auf Ihre Entscheidung`;

  const parts: string[] = [];
  parts.push(
    newCount === 1 ? "1 neue Anfrage" : `${newCount} neue Anfragen`
  );
  parts.push(
    activeCount === 1 ? "1 aktiver Fall" : `${activeCount} aktive Fälle`
  );
  parts.push(
    approvalCount === 1 ? "1 Freigabe" : `${approvalCount} Freigaben`
  );

  return {
    waitingCount,
    lead,
    breakdown: parts.join(" · "),
  };
}
