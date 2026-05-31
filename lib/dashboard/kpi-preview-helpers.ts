import { deriveSubmissionIssueShortLine } from "@/lib/inbox/derive-submission-issue-short-line";
import type { DashboardPriorityItem } from "@/lib/queries/dashboard";
import type { KpiReviewPatientLine } from "@/components/dashboard/hc/kpi-review-hover-preview";

export function readyForReviewItems(items: DashboardPriorityItem[]): DashboardPriorityItem[] {
  return items.filter((item) => !item.seen_at);
}

export function buildHeroInlinePreview(items: DashboardPriorityItem[], totalReady: number) {
  const ready = readyForReviewItems(items);
  const names = ready
    .slice(0, 2)
    .map((item) => (item.patient_name || "Patient").trim());
  const remaining = Math.max(0, (totalReady ?? ready.length) - names.length);
  const moreLabel =
    remaining > 0
      ? remaining === 1
        ? "+1 weiterer Fall"
        : `+${remaining} weitere Fälle`
      : undefined;

  return { names, moreLabel };
}

export function buildReviewHoverPatients(
  items: DashboardPriorityItem[]
): KpiReviewPatientLine[] {
  return readyForReviewItems(items)
    .slice(0, 3)
    .map((item) => ({
      name: (item.patient_name || "Patient").trim(),
      concern: deriveSubmissionIssueShortLine(item.patient_notes, item.patient_name, {
        maxLen: 56,
        emptyLabel: "Anliegen in der Fallakte",
      }),
    }));
}
