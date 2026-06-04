/**
 * Tracker V12 — Verdichtete Arbeits-Queue (keine Karten, keine Tabelle)
 */
import { deriveSubmissionIssueShortLine } from "@/lib/inbox/derive-submission-issue-short-line";
import type { EnrichedSubmissionListItem } from "@/lib/inbox/tracker-inbox-logic";
import type { TrackerPriorityLevel } from "@/lib/inbox/tracker-v10-presentational";
import { buildWorkHeadline } from "@/lib/inbox/tracker-praxis-status";
import {
  buildClinicalQueueCard,
  isVerlaufskontrolle,
  resolveTrackerCaseType,
  sortClinicalWorkQueue,
  trackerLastActivityShort,
  trackerPriority,
  verlaufTagHeadline,
  type QueueVisualAccent,
} from "@/lib/inbox/tracker-v11-presentational";

export type TrackerStatusKind =
  | "neue_anfrage"
  | "nachsorge"
  | "kontrollverlauf"
  | "ki_freigabe"
  | "praxisaufgabe"
  | "schmerzfall";

export type WorkQueueRowModel = {
  id: string;
  accent: QueueVisualAccent;
  /** Primär — die Entscheidung / Fallart, nicht der Patient */
  workHeadline: string;
  patientName: string;
  /** Worum geht es — klinischer Kontext */
  subjectLine: string;
  contextLine: string;
  detailLine: string | null;
  evidenceLines: string[];
  ingressLine: string | null;
  timeLine: string;
  statusKind: TrackerStatusKind;
  statusLabel: string;
  falltypLabel: string;
  priorityLabel: string;
  priorityLevel: TrackerPriorityLevel;
  showPriority: boolean;
  actionLabel: string;
  actionButton: string;
};

export type DecisionCardModel = WorkQueueRowModel;

export { sortClinicalWorkQueue };

function isSchmerzfall(item: EnrichedSubmissionListItem): boolean {
  const notes = `${item.patient_notes ?? ""}`.toLowerCase();
  if (/schmerz|weh|empfindlich|pochen|druck/.test(notes)) return true;
  return item.urgency === "today" && resolveTrackerCaseType(item).kind === "neue_anfrage";
}

function resolveStatusPresentation(item: EnrichedSubmissionListItem): {
  kind: TrackerStatusKind;
  label: string;
} {
  const caseType = resolveTrackerCaseType(item);

  if (caseType.kind === "ki_freigabe") {
    return { kind: "ki_freigabe", label: "KI wartet" };
  }
  if (caseType.kind === "praxisaufgabe") {
    return { kind: "praxisaufgabe", label: "Aufgabe" };
  }
  if (isVerlaufskontrolle(item)) {
    return {
      kind: "kontrollverlauf",
      label:
        caseType.label !== "Nachsorge" && caseType.label.length > 2
          ? caseType.label
          : "Nachsorge",
    };
  }
  if (caseType.kind === "nachsorge") {
    return { kind: "nachsorge", label: caseType.label };
  }
  if (isSchmerzfall(item)) {
    return { kind: "schmerzfall", label: "Neue Anfrage" };
  }
  return { kind: "neue_anfrage", label: "Neue Anfrage" };
}

function buildIngressLine(
  item: EnrichedSubmissionListItem,
  photoLabel: string | null
): string | null {
  const kind = resolveTrackerCaseType(item).kind;

  if (kind === "ki_freigabe") {
    return "wartet auf Freigabe";
  }

  const count =
    item.photo_count ?? item.photo_documentation?.photoCount ?? 0;
  if (count <= 0) return null;

  const fotos = count === 1 ? "1 Foto" : `${count} Fotos`;
  const isNew = !item.seen_at && !item.is_draft;

  if (isNew && kind === "neue_anfrage") {
    return `${fotos} eingegangen`;
  }

  return fotos;
}

function buildDetailLine(item: EnrichedSubmissionListItem): string | null {
  const kind = resolveTrackerCaseType(item).kind;

  if (kind === "ki_freigabe") {
    return null;
  }

  if (kind === "nachsorge") {
    const tagLine = verlaufTagHeadline(item);
    const tagMatch = tagLine?.match(/Tag\s+(\d+)/i);
    if (tagMatch?.[1]) {
      return `Tag ${tagMatch[1]} Kontrollbild`;
    }
    return "Neues Kontrollbild";
  }

  if (kind === "praxisaufgabe" && item.open_task_count > 0) {
    return item.open_task_count === 1
      ? "1 offene Aufgabe"
      : `${item.open_task_count} offene Aufgaben`;
  }

  return null;
}

function buildContextLine(
  item: EnrichedSubmissionListItem,
  card: ReturnType<typeof buildClinicalQueueCard>
): string {
  const kind = resolveTrackerCaseType(item).kind;
  const summary = deriveSubmissionIssueShortLine(
    item.patient_notes,
    item.patient_name,
    { maxLen: 72, emptyLabel: "" }
  );

  if (kind === "ki_freigabe") {
    return "KI Antwort vorbereitet";
  }

  if (kind === "nachsorge") {
    const caseType = resolveTrackerCaseType(item);
    return caseType.label !== "Nachsorge" && caseType.label.length > 2
      ? caseType.label
      : card.headline;
  }

  if (summary) return summary;

  if (kind === "neue_anfrage") return "Neue Patientenanfrage";
  return card.headline;
}

function buildEvidenceLines(
  item: EnrichedSubmissionListItem,
  ingressLine: string | null,
  detailLine: string | null
): string[] {
  const kind = resolveTrackerCaseType(item).kind;
  const lines: string[] = [];

  if (ingressLine) {
    lines.push(ingressLine);
  }

  if (kind === "ki_freigabe") {
    if (!lines.some((l) => /freigabe|KI/i.test(l))) {
      lines.push("KI hat Antwort vorbereitet");
    }
  }

  if (
    kind === "nachsorge" &&
    !isVerlaufskontrolle(item) &&
    detailLine &&
    !lines.includes(detailLine)
  ) {
    lines.push(detailLine);
  }

  if (
    isVerlaufskontrolle(item) &&
    detailLine &&
    ingressLine &&
    /foto/i.test(ingressLine)
  ) {
    const count =
      item.photo_count ?? item.photo_documentation?.photoCount ?? 0;
    if (count > 0) {
      lines[0] =
        count === 1
          ? "1 neues Vergleichsbild"
          : `${count} neue Vergleichsbilder`;
    }
  }

  if (
    item.message_draft_status === "draft" ||
    item.message_draft_status === "approved"
  ) {
    if (!lines.some((l) => /KI/i.test(l))) {
      lines.push("KI Analyse bereit");
    }
  }

  return [...new Set(lines)].slice(0, 3);
}

export function buildWorkQueueRow(
  item: EnrichedSubmissionListItem
): WorkQueueRowModel {
  const card = buildClinicalQueueCard(item);
  const priority = trackerPriority(item);
  const kind = resolveTrackerCaseType(item).kind;
  const status = resolveStatusPresentation(item);

  const detailLine = buildDetailLine(item);
  const contextLine = buildContextLine(item, card);
  const ingressLine = buildIngressLine(item, card.photoLabel);
  const actionLabel = card.actionLabel;
  const actionButton = actionLabel.replace(/\s*→\s*$/u, "").trim() || actionLabel;

  return {
    id: item.id,
    accent: card.accent,
    workHeadline: buildWorkHeadline(status.kind, status.label, detailLine),
    patientName: card.patientName,
    subjectLine: contextLine,
    contextLine,
    detailLine,
    evidenceLines: buildEvidenceLines(item, ingressLine, detailLine),
    ingressLine,
    timeLine: trackerLastActivityShort(item.created_at),
    statusKind: status.kind,
    statusLabel: status.label,
    falltypLabel: status.label,
    priorityLabel: priority.label,
    priorityLevel: priority.level,
    showPriority:
      kind === "neue_anfrage" ||
      kind === "praxisaufgabe" ||
      priority.level !== "niedrig",
    actionLabel,
    actionButton,
  };
}

export const buildDecisionCard = buildWorkQueueRow;
