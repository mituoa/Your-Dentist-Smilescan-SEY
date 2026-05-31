import {
  intakeSubjectLine,
  patientDisplayName,
} from "@/lib/dashboard/atlas-mobile-helpers";
import {
  COMMAND_AI_EXAMPLES,
  COMMAND_AI_PREPARED,
  formatUrgencyLabel,
} from "@/lib/product/workflow";
import type { ActivityEvent, OpenTaskRow, SubmissionPreviewRow } from "@/lib/queries/dashboard";
import type { RelayConversationRow } from "@/lib/queries/relay-messages";

export type DailyStatusMetrics = {
  intake: number | null;
  tasks: number;
  replies: number;
  practiceRunning: boolean;
};

export type TodayImportantCard = {
  id: string;
  patientName: string;
  problem: string;
  aiResult: string;
  actionLabel: string;
  href: string;
  primaryAction: "freigeben" | "pruefen" | "oeffnen";
};

export type PatientCaseRow = {
  id: string;
  patientName: string;
  concern: string;
  attachmentsLabel: string;
  urgencyLabel: string;
  aiPrepared: string;
  statusLabel: string;
  nextAction: string;
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

export { COMMAND_AI_EXAMPLES, COMMAND_AI_PREPARED };

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

export function buildTodayImportant(
  previewRows: SubmissionPreviewRow[] | null,
  openTasks: OpenTaskRow[] | null
): TodayImportantCard[] {
  const cards: TodayImportantCard[] = [];
  const rows = [...(previewRows ?? [])].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );

  for (const row of rows.filter((r) => !r.seen_at).slice(0, 3)) {
    cards.push({
      id: `urgent-${row.id}`,
      patientName: patientDisplayName(row),
      problem: intakeSubjectLine(row),
      aiResult: "Antwort vorbereitet",
      actionLabel: "Prüfen",
      href: `/inbox/${row.id}`,
      primaryAction: "pruefen",
    });
  }

  for (const row of rows.filter((r) => r.seen_at).slice(0, 3)) {
    cards.push({
      id: `ready-${row.id}`,
      patientName: patientDisplayName(row),
      problem: intakeSubjectLine(row),
      aiResult: "Freigabe bereit",
      actionLabel: "Freigeben",
      href: `/inbox/${row.id}#tracker-korrespondenz`,
      primaryAction: "freigeben",
    });
  }

  if (cards.length === 0 && openTasks && openTasks.length > 0) {
    const t = openTasks[0];
    cards.push({
      id: `task-${t.id}`,
      patientName: "Team",
      problem: t.title?.trim() || t.content?.trim() || "Aufgabe",
      aiResult: "Zugewiesen",
      actionLabel: "Öffnen",
      href: `/my-tasks/${t.id}`,
      primaryAction: "oeffnen",
    });
  }

  return cards.slice(0, 4);
}

export function buildPatientCases(
  previewRows: SubmissionPreviewRow[] | null
): PatientCaseRow[] {
  const rows = [...(previewRows ?? [])].sort((a, b) => {
    if (!a.seen_at && b.seen_at) return -1;
    if (a.seen_at && !b.seen_at) return 1;
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  return rows.map((row) => {
    const unseen = !row.seen_at;
    return {
      id: row.id,
      patientName: patientDisplayName(row),
      concern: intakeSubjectLine(row),
      attachmentsLabel:
        row.photo_count > 0
          ? `${row.photo_count} ${row.photo_count === 1 ? "Anhang" : "Anhänge"}`
          : "Kein Anhang",
      urgencyLabel: formatUrgencyLabel(row.urgency),
      aiPrepared: unseen ? "Wird vorbereitet" : "Antwort vorbereitet",
      statusLabel: unseen ? "Zu sichten" : "Freigabe",
      nextAction: unseen ? "Prüfen" : "Freigeben",
      href: unseen ? `/inbox/${row.id}` : `/inbox/${row.id}#tracker-korrespondenz`,
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

export function buildRelayActivity(
  conversations: RelayConversationRow[],
  activityEvents: ActivityEvent[] | null,
  openTasks: OpenTaskRow[] | null
): RelayActivityLine[] {
  const lines: RelayActivityLine[] = [];

  for (const c of conversations.filter((x) => x.unread_count > 0).slice(0, 4)) {
    const title =
      c.title?.trim() ||
      (c.kind === "group" ? "Gruppe" : c.other_party_email?.split("@")[0] ?? "Relay");
    lines.push({
      id: `conv-${c.id}`,
      label: title,
      meta: `${c.unread_count} neu`,
      href: `/relay?panel=messages&conversation=${c.id}`,
    });
  }

  for (const t of (openTasks ?? []).slice(0, 3)) {
    lines.push({
      id: `task-${t.id}`,
      label: (t.title?.trim() || t.content?.trim() || "Aufgabe").slice(0, 48),
      meta: "Zugewiesen",
      href: `/my-tasks/${t.id}`,
    });
  }

  for (const e of (activityEvents ?? []).slice(0, 3)) {
    if (e.link) {
      lines.push({
        id: `act-${e.id}`,
        label: e.text.replace(/…$/, "").slice(0, 48),
        meta: e.type === "task_done" ? "Erledigt" : "Heute",
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
    .slice(0, 6);
}

export function buildCommandSuggestions(
  previewRows: SubmissionPreviewRow[] | null,
  _openTaskCount: number
): string[] {
  const out: string[] = [...COMMAND_AI_EXAMPLES];
  const first = previewRows?.find((r) => !r.seen_at) ?? previewRows?.[0];
  if (first) {
    const last = patientDisplayName(first).split(" ").pop();
    if (last) {
      const idx = out.findIndex((s) => s.includes("Müller"));
      if (idx >= 0) out[idx] = `Patient ${last} Terminvorschlag senden`;
    }
  }
  return [...new Set(out)].slice(0, 5);
}
