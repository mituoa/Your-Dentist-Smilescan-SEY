import {
  hasPhotoTrail,
  isApprovalPending,
  type EnrichedSubmissionListItem,
} from "@/lib/inbox/tracker-inbox-logic";

export type TrackerOverviewTone =
  | "new"
  | "follow_up"
  | "approval"
  | "open_task"
  | "done"
  | "active";

export type TrackerOverviewStatus = {
  label: string;
  activity: string;
  tone: TrackerOverviewTone;
};

/** Ein Hauptstatus pro Zeile — ruhig, nicht bunt. */
export function trackerOverviewMainStatus(
  item: EnrichedSubmissionListItem
): TrackerOverviewStatus {
  if (isApprovalPending(item)) {
    return {
      label: "Antwort ausstehend",
      activity: "Antwort wartet auf Freigabe",
      tone: "approval",
    };
  }
  if (!item.seen_at && !item.is_draft) {
    return {
      label: "Neu",
      activity: "Neue Einsendung",
      tone: "new",
    };
  }
  if (item.open_task_count > 0) {
    return {
      label: "Offene Aufgabe",
      activity: "Aufgabe offen",
      tone: "open_task",
    };
  }
  if (item.intake_channel === "follow_up" || hasPhotoTrail(item)) {
    return {
      label: "Nachsorge",
      activity: "Nachsorge aktiv",
      tone: "follow_up",
    };
  }
  if (item.message_draft_status === "sent") {
    return {
      label: "Abgeschlossen",
      activity: "Abgeschlossen",
      tone: "done",
    };
  }
  return {
    label: "Aktiv",
    activity: "In Bearbeitung",
    tone: "active",
  };
}

export function formatBirthDateDe(value: string | null): string {
  if (!value) return "—";
  const part = value.split("T")[0];
  const [y, m, d] = part.split("-").map((x) => parseInt(x, 10));
  if (!y || !m || !d) return "—";
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatLastActivity(iso: string): string {
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return "—";
  const now = new Date();
  const todayKey = now.toISOString().slice(0, 10);
  const key = iso.slice(0, 10);
  if (key === todayKey) {
    return `Heute ${then.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}`;
  }
  return then.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
