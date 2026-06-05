import {
  isIngressToday,
  isIngressYesterday,
  isTrackerInboxOverdue,
  trackerInboxAttentionTier,
  type EnrichedSubmissionListItem,
} from "@/lib/inbox/tracker-inbox-logic";

export type TrackerHeaderSummary = {
  waitingCount: number;
  lead: string;
  breakdown: string;
};

function needsAttention(item: EnrichedSubmissionListItem): boolean {
  const tier = trackerInboxAttentionTier(item);
  return tier === "decision" || tier === "patient_waiting";
}

/** Arbeitsübersicht für die linke Tracker-Liste (Triage-Orientierung). */
export function buildTrackerHeaderSummary(
  items: EnrichedSubmissionListItem[]
): TrackerHeaderSummary {
  const attention = items.filter(needsAttention);

  if (attention.length === 0) {
    return {
      waitingCount: 0,
      lead: "Heute ist alles entschieden",
      breakdown: "Neue Eingänge erscheinen hier, sobald Ihre Entscheidung benötigt wird.",
    };
  }

  let todayCount = 0;
  let yesterdayCount = 0;
  let olderCount = 0;

  for (const item of attention) {
    if (isIngressToday(item.created_at)) todayCount += 1;
    else if (isIngressYesterday(item.created_at)) yesterdayCount += 1;
    else olderCount += 1;
  }

  const waitingCount = attention.length;
  const lead =
    waitingCount === 1
      ? "1 Fall wartet auf Ihre Entscheidung"
      : `${waitingCount} Fälle warten auf Ihre Entscheidung`;

  const breakdownParts: string[] = [];
  if (todayCount > 0) {
    breakdownParts.push(todayCount === 1 ? "1 heute" : `${todayCount} heute`);
  }
  if (yesterdayCount > 0) {
    breakdownParts.push(
      yesterdayCount === 1 ? "1 seit gestern" : `${yesterdayCount} seit gestern`
    );
  }
  if (olderCount > 0) {
    breakdownParts.push(olderCount === 1 ? "1 länger offen" : `${olderCount} länger offen`);
  }

  const overdueCount = attention.filter(isTrackerInboxOverdue).length;
  if (overdueCount > 0 && overdueCount !== waitingCount) {
    breakdownParts.push(
      overdueCount === 1 ? "1 überfällig" : `${overdueCount} überfällig`
    );
  }

  return {
    waitingCount,
    lead,
    breakdown: breakdownParts.join(" · "),
  };
}
