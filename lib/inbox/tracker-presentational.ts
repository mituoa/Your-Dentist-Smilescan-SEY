import {
  isApprovalPending,
  type EnrichedSubmissionListItem,
} from "@/lib/inbox/tracker-inbox-logic";
import type { MessageDraftListStatus } from "@/lib/message-drafts/list-status";

/** „Heute 09:12“ / „Gestern 14:30“ für Inbox-Karten. */
export function formatTrackerCardIntakeTime(iso: string): string {
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return "—";
  const now = new Date();
  const time = then.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" });
  const todayKey = now.toISOString().slice(0, 10);
  const key = iso.slice(0, 10);
  if (key === todayKey) return `Heute ${time}`;
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (key === yesterday.toISOString().slice(0, 10)) return `Gestern ${time}`;
  return then.toLocaleDateString("de-DE", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function trackerPhotoIntakeLabel(count: number): string {
  if (count === 0) return "Noch keine Fotos";
  if (count === 1) return "1 Foto eingegangen";
  return `${count} Fotos eingegangen`;
}

/** Ruhige Statuszeilen unter der Karte (Arbeitskontext). */
export function trackerCardSignalLines(item: EnrichedSubmissionListItem): string[] {
  const lines: string[] = [];

  if (item.message_draft_status === "draft" || item.message_draft_status === "approved") {
    lines.push("KI vorbereitet");
  }
  if (isApprovalPending(item)) {
    lines.push("Antwort wartet auf Freigabe");
  } else if (item.message_draft_status === "draft") {
    lines.push("Antwort entworfen");
  } else if (item.message_draft_status === "sent") {
    lines.push("Antwort versendet");
  }
  if (item.urgency === "today") {
    lines.push("Heute prüfen");
  } else if (!item.seen_at && !item.is_draft) {
    lines.push("Neu eingegangen");
  }

  return lines.slice(0, 2);
}

export function trackerDraftApprovalLabel(status: MessageDraftListStatus): string {
  if (status === "approved") return "Freigegeben";
  if (status === "sent") return "Versendet";
  if (status === "draft") return "Freigabe ausstehend";
  return "Noch nicht vorbereitet";
}

export function sumOpenTasks(items: EnrichedSubmissionListItem[]): number {
  return items.reduce((n, i) => n + (i.open_task_count ?? 0), 0);
}
