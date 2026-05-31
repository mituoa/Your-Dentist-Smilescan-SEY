import {
  patientDisplayName,
  patientInitials,
  formatRelativeTime,
} from "@/lib/dashboard/atlas-mobile-helpers";
import {
  COMMAND_AI_EXAMPLES,
  COMMAND_AI_PREPARED,
  COMMAND_AI_QUICK_ACTIONS,
} from "@/lib/product/workflow";
import type { ActivityEvent, OpenTaskRow, SubmissionPreviewRow } from "@/lib/queries/dashboard";
import type { RelayConversationRow } from "@/lib/queries/relay-messages";

export type DailyStatusMetrics = {
  intake: number | null;
  tasks: number;
  replies: number;
  practiceRunning: boolean;
};

/** Single line under greeting — what needs attention now. */
export function buildAttentionSummary(
  unseenCount: number | null,
  previewRows: SubmissionPreviewRow[] | null,
  openTasks: OpenTaskRow[] | null
): string {
  const waiting =
    unseenCount !== null
      ? unseenCount
      : (previewRows ?? []).filter((r) => !r.seen_at).length;
  const approvals = (previewRows ?? []).filter((r) => r.seen_at).length;
  const tasks = openTasks?.length ?? 0;

  if (waiting > 0) {
    return waiting === 1
      ? "1 Anfrage wartet auf Rückmeldung."
      : `${waiting} Anfragen warten auf Rückmeldung.`;
  }
  if (approvals > 0) {
    return approvals === 1
      ? "1 Freigabe wartet auf Prüfung."
      : `${approvals} Freigaben warten auf Prüfung.`;
  }
  if (tasks > 0) {
    return tasks === 1 ? "1 offene Aufgabe im Team." : `${tasks} offene Aufgaben im Team.`;
  }
  return "Keine offenen Anfragen — alles aktuell.";
}

export type TodayMetricCard = {
  id: string;
  label: string;
  count: number | null;
  hint: string;
  href: string;
};

export type PatientCaseRow = {
  id: string;
  patientName: string;
  initials: string;
  requestType: string;
  receivedLabel: string;
  statusLabel: "Neu" | "In Bearbeitung" | "Wartet auf Freigabe" | "Abgeschlossen";
  hasImages: boolean;
  replyPrepared: boolean;
  href: string;
};

export type RelayActivityLine = {
  id: string;
  label: string;
  meta: string;
  href: string;
};

export type TaskPreviewRow = {
  id: string;
  title: string;
  href: string;
};

export { COMMAND_AI_EXAMPLES, COMMAND_AI_PREPARED, COMMAND_AI_QUICK_ACTIONS };

export function buildDailyStatus(
  unseenCount: number | null,
  openTaskCount: number,
  relayUnread: number
): DailyStatusMetrics {
  const pressure =
    (unseenCount !== null && unseenCount > 0) || openTaskCount > 0 || relayUnread > 0;
  return {
    intake: unseenCount,
    tasks: openTaskCount,
    replies: relayUnread,
    practiceRunning: !pressure,
  };
}

export function buildTodayMetrics(
  unseenCount: number | null,
  previewRows: SubmissionPreviewRow[] | null,
  openTasks: OpenTaskRow[] | null
): TodayMetricCard[] {
  const rows = previewRows ?? [];
  const neue =
    unseenCount !== null ? unseenCount : rows.filter((r) => !r.seen_at).length;
  const freigaben = rows.filter((r) => r.seen_at).length;
  const team = openTasks?.length ?? 0;

  return [
    {
      id: "intake",
      label: "Neue Eingänge",
      count: unseenCount === null && rows.length === 0 ? null : neue,
      hint: "Patientenanfragen warten",
      href: "/inbox",
    },
    {
      id: "approval",
      label: "Freigaben",
      count: freigaben,
      hint: "Antworten vorbereitet",
      href: "/inbox",
    },
    {
      id: "team",
      label: "Team",
      count: team,
      hint: "offene Aufgaben",
      href: "/my-tasks",
    },
  ];
}

function patientCaseStatus(row: SubmissionPreviewRow): PatientCaseRow["statusLabel"] {
  if (!row.seen_at) return "Neu";
  if (row.photo_count > 0) return "Wartet auf Freigabe";
  return "In Bearbeitung";
}

export function buildPatientCases(
  previewRows: SubmissionPreviewRow[] | null
): PatientCaseRow[] {
  const rows = [...(previewRows ?? [])].sort((a, b) => {
    if (!a.seen_at && b.seen_at) return -1;
    if (a.seen_at && !b.seen_at) return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return rows.slice(0, 8).map((row) => {
    const status = patientCaseStatus(row);
    const seen = Boolean(row.seen_at);
    return {
      id: row.id,
      patientName: patientDisplayName(row),
      initials: patientInitials(row),
      requestType: "Patientenanfrage",
      receivedLabel: formatRelativeTime(row.created_at),
      statusLabel: status,
      hasImages: row.photo_count > 0,
      replyPrepared: seen,
      href: seen ? `/inbox/${row.id}#tracker-korrespondenz` : `/inbox/${row.id}`,
    };
  });
}

export function buildTaskPreviews(openTasks: OpenTaskRow[] | null): TaskPreviewRow[] {
  return (openTasks ?? []).slice(0, 5).map((t) => ({
    id: t.id,
    title: (t.title?.trim() || t.content?.trim() || "Aufgabe").slice(0, 56),
    href: `/my-tasks/${t.id}`,
  }));
}

function relayPartyLabel(c: RelayConversationRow): string {
  if (c.title?.trim()) return c.title.trim();
  const email = c.other_party_email?.split("@")[0];
  if (email) return email.charAt(0).toUpperCase() + email.slice(1);
  return c.kind === "group" ? "Team" : "Relay";
}

export function buildRelayActivity(
  conversations: RelayConversationRow[],
  activityEvents: ActivityEvent[] | null,
  openTasks: OpenTaskRow[] | null
): RelayActivityLine[] {
  const lines: RelayActivityLine[] = [];

  for (const c of conversations.filter((x) => x.unread_count > 0).slice(0, 2)) {
    const who = relayPartyLabel(c);
    lines.push({
      id: `conv-${c.id}`,
      label: `${who}: neue Nachricht`,
      meta: `${c.unread_count} ungelesen`,
      href: `/relay?panel=messages&conversation=${c.id}`,
    });
  }

  for (const t of (openTasks ?? []).slice(0, 2)) {
    const title = (t.title?.trim() || t.content?.trim() || "Aufgabe").slice(0, 40);
    const teamLine =
      t.recipient_type === "doctor_only"
        ? "Aufgabe für Sie"
        : title.toLowerCase().includes("rückruf")
          ? "Team übernimmt Rückruf"
          : "Neue Aufgabe zugewiesen";
    lines.push({
      id: `task-open-${t.id}`,
      label: teamLine,
      meta: title,
      href: `/my-tasks/${t.id}`,
    });
  }

  for (const e of activityEvents ?? []) {
    if (!e.link) continue;
    if (e.type === "task_done") {
      lines.push({
        id: `act-done-${e.id}`,
        label: "Antwort freigegeben",
        meta: formatRelativeTime(e.timestamp),
        href: e.link,
      });
      continue;
    }
    if (e.type === "task_created") {
      lines.push({
        id: `act-task-${e.id}`,
        label: "Neue Aufgabe zugewiesen",
        meta: formatRelativeTime(e.timestamp),
        href: e.link,
      });
      continue;
    }
    if (e.type === "submission_received") {
      lines.push({
        id: `act-sub-${e.id}`,
        label: "Neuer Patienteneingang",
        meta: formatRelativeTime(e.timestamp),
        href: e.link,
      });
    }
  }

  const seen = new Set<string>();
  return lines
    .filter((l) => {
      if (seen.has(l.id)) return false;
      seen.add(l.id);
      return true;
    })
    .slice(0, 5);
}

export function buildCommandSuggestions(
  previewRows: SubmissionPreviewRow[] | null,
  openTaskCount: number
): string[] {
  const chips: string[] = [...COMMAND_AI_QUICK_ACTIONS];
  const unseen = previewRows?.filter((r) => !r.seen_at).length ?? 0;
  if (unseen > 0) {
    chips.unshift("Bereite die Antworten für offene Anfragen vor");
  }
  if (openTaskCount > 0) {
    chips.push("Team über offene Aufgaben informieren");
  }
  return [...new Set(chips)].slice(0, 5);
}

/** @deprecated Use buildTodayMetrics — kept for type migration */
export type TodayImportantCard = TodayMetricCard;

export function buildTodayImportant(
  unseenCount: number | null,
  previewRows: SubmissionPreviewRow[] | null,
  openTasks: OpenTaskRow[] | null
): TodayMetricCard[] {
  return buildTodayMetrics(unseenCount, previewRows, openTasks);
}
