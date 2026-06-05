import { deriveSubmissionIssueShortLine } from "@/lib/inbox/derive-submission-issue-short-line";
import type { KpiWorkContextData } from "@/components/dashboard/hc/kpi-work-context-preview";
import type {
  DashboardPriorityItem,
  OpenTaskRow,
  SubmissionPreviewRow,
} from "@/lib/queries/dashboard";

function patientName(raw: string | null | undefined): string {
  return (raw || "Patient").trim();
}

function truncate(text: string, max = 48): string {
  const t = text.trim();
  if (t.length <= max) return t;
  return `${t.slice(0, max - 1).trim()}…`;
}

export function buildNewSubmissionsWorkContext(
  items: DashboardPriorityItem[] | null,
  previewRows?: SubmissionPreviewRow[] | null
): KpiWorkContextData {
  const fromPriority = (items ?? []).filter((item) => !item.seen_at).slice(0, 3);
  const fromPreview = (previewRows ?? [])
    .filter((row) => !row.seen_at)
    .slice(0, 3)
    .map((row) => ({
      name: patientName(row.patient_name),
      detail: deriveSubmissionIssueShortLine(row.patient_notes, row.patient_name, {
        maxLen: 52,
        emptyLabel: "Anliegen in der Fallakte",
      }),
    }));

  const itemsOut =
    fromPriority.length > 0
      ? fromPriority.map((item) => ({
          name: patientName(item.patient_name),
          detail: deriveSubmissionIssueShortLine(item.patient_notes, item.patient_name, {
            maxLen: 52,
            emptyLabel: "Anliegen in der Fallakte",
          }),
        }))
      : fromPreview;

  return {
    heading: "Neue Anfragen",
    items: itemsOut,
    emptyMessage: "Keine neuen Anfragen — alles ist in Bearbeitung.",
    ctaLabel: "Alle öffnen",
    ctaHref: "/inbox",
  };
}

export function buildActiveCasesWorkContext(
  items: DashboardPriorityItem[] | null,
  previewRows?: SubmissionPreviewRow[] | null
): KpiWorkContextData {
  const fromPriority = (items ?? []).filter((item) => !!item.seen_at).slice(0, 3);
  const fromPreview = (previewRows ?? []).filter((row) => !!row.seen_at).slice(0, 3);

  const itemsOut =
    fromPriority.length > 0
      ? fromPriority.map((item) => ({
          name: patientName(item.patient_name),
          detail: item.patient_notes?.trim() ? "Antwort vorbereitet" : "Verlauf offen",
        }))
      : fromPreview.map((row) => ({
          name: patientName(row.patient_name),
          detail: row.patient_notes?.trim() ? "Antwort vorbereitet" : "Verlauf offen",
        }));

  return {
    heading: "Aktuell in Bearbeitung",
    items: itemsOut,
    emptyMessage: "Derzeit keine aktiven Patientenprozesse.",
    ctaLabel: "Tracker öffnen",
    ctaHref: "/inbox",
  };
}

export function buildOpenTasksWorkContext(tasks: OpenTaskRow[] | null): KpiWorkContextData {
  const open = (tasks ?? []).slice(0, 3);

  return {
    heading: "Patient wartet",
    items: open.map((task) => ({
      name: truncate(task.content || "Rückmeldung"),
      detail: task.patient_name
        ? `Patient ${patientName(task.patient_name)}`
        : "Praxisintern",
    })),
    emptyMessage: "Keine Patienten warten auf Rückmeldung.",
    ctaLabel: "Relay öffnen",
    ctaHref: "/relay",
  };
}
