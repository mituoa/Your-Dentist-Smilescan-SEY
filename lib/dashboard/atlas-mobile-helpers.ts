import type { ActivityEvent, OpenTaskRow, SubmissionPreviewRow } from "@/lib/queries/dashboard";
import { WORKSPACE_COPY } from "@/lib/dashboard/workspace-copy";

export function patientDisplayName(row: SubmissionPreviewRow): string {
  return row.patient_name?.trim() || row.patient_email?.trim() || "Patient";
}

export function patientInitials(row: SubmissionPreviewRow): string {
  const name = patientDisplayName(row);
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

/** Relative time for cockpit cards — calm, German. */
export function formatRelativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  const diffMs = Date.now() - then;
  if (diffMs < 0) return "Gerade eben";
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return "Gerade eben";
  if (mins < 60) return `Vor ${mins} Min.`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `Vor ${hours} Std.`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "Gestern";
  if (days < 7) return `Vor ${days} Tagen`;
  return formatIntakeDate(iso);
}

export function intakeSubjectLine(row: SubmissionPreviewRow): string {
  const notes = row.patient_notes?.trim();
  if (!notes) return "Einsendung";
  const oneLine = notes.replace(/\s+/g, " ");
  return oneLine.length > 56 ? `${oneLine.slice(0, 55)}…` : oneLine;
}

export function formatIntakeDate(iso: string): string {
  return new Date(iso).toLocaleDateString("de-DE", {
    day: "numeric",
    month: "short",
  });
}

export function buildTodaySummaryLines(input: {
  unseenCount: number | null;
  openTaskCount: number;
  relayUnread: number;
}): string[] {
  const lines: string[] = [];

  if (input.unseenCount === null) {
    lines.push("— Eingänge");
  } else if (input.unseenCount > 0) {
    lines.push(
      input.unseenCount === 1 ? "1 Eingang" : `${input.unseenCount} Eingänge`
    );
  } else {
    lines.push("0 Eingänge");
  }

  if (input.openTaskCount > 0) {
    lines.push(
      input.openTaskCount === 1 ? "1 Aufgabe" : `${input.openTaskCount} Aufgaben`
    );
  } else {
    lines.push("0 Aufgaben");
  }

  lines.push(
    input.relayUnread > 0
      ? `${input.relayUnread} Relay`
      : "0 Relay"
  );

  return lines;
}

export function taskTitleShort(task: OpenTaskRow): string {
  const t = task.title?.trim() || task.content?.trim() || "Aufgabe";
  return t.length > 48 ? `${t.slice(0, 47)}…` : t;
}

export function activityDayGroup(timestamp: string): "Heute" | "Gestern" | "Früher" {
  const d = new Date(timestamp);
  const now = new Date();
  const startToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startEvent = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round(
    (startToday.getTime() - startEvent.getTime()) / (24 * 60 * 60 * 1000)
  );
  if (diffDays <= 0) return "Heute";
  if (diffDays === 1) return "Gestern";
  return "Früher";
}

export function activityHeadline(event: ActivityEvent): string {
  if (event.type === "submission_received") return "Eingang";
  if (event.type === "task_done") return "Erledigt";
  return "Aufgabe";
}
