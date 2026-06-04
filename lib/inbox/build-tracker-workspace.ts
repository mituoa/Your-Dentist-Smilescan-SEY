import {
  hasPhotoTrail,
  isApprovalPending,
  type EnrichedSubmissionListItem,
  type TrackerStatusDisplay,
} from "@/lib/inbox/tracker-inbox-logic";
import type { MessageDraftListStatus } from "@/lib/message-drafts/list-status";

export type TrackerTimelineEvent = {
  id: string;
  dateLabel: string;
  title: string;
  detail?: string;
};

export type TrackerAssistItem = {
  id: string;
  label: string;
  done: boolean;
};

export type TrackerCommandStep = {
  id: string;
  label: string;
  state: "done" | "active" | "pending";
};

function formatTimelineDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
  });
}

export function buildTrackerCaseTimeline(input: {
  createdAt: string;
  photos: { id: string; created_at: string }[];
  patientNotes: string | null;
  messageDraftStatus?: MessageDraftListStatus;
  isApprovalPending?: boolean;
}): TrackerTimelineEvent[] {
  const events: TrackerTimelineEvent[] = [
    {
      id: "intake",
      dateLabel: formatTimelineDate(input.createdAt),
      title: "Einsendung eingegangen",
    },
  ];

  const sorted = [...input.photos].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );

  const byDay = new Map<string, { ids: string[]; iso: string }>();
  for (const photo of sorted) {
    const key = photo.created_at.slice(0, 10);
    const prev = byDay.get(key);
    if (prev) {
      prev.ids.push(photo.id);
    } else {
      byDay.set(key, { ids: [photo.id], iso: photo.created_at });
    }
  }

  for (const [, group] of byDay) {
    const count = group.ids.length;
    events.push({
      id: `photo-${group.iso}`,
      dateLabel: formatTimelineDate(group.iso),
      title: count === 1 ? "Foto eingegangen" : `${count} Fotos eingegangen`,
    });
  }

  const note = input.patientNotes?.trim();
  if (note && note.length > 24) {
    events.push({
      id: "note",
      dateLabel: formatTimelineDate(input.createdAt),
      title: "Anliegen dokumentiert",
      detail: note.length > 80 ? `${note.slice(0, 80)}…` : note,
    });
  }

  if (input.messageDraftStatus === "draft" || input.messageDraftStatus === "approved") {
    events.push({
      id: "ki-summary",
      dateLabel: "Heute",
      title: "KI-Zusammenfassung erstellt",
    });
    events.push({
      id: "draft-ready",
      dateLabel: "Heute",
      title: "Antwort vorbereitet",
    });
  }

  if (input.isApprovalPending) {
    events.push({
      id: "approval-wait",
      dateLabel: "Heute",
      title: "Freigabe ausstehend",
    });
  }

  if (input.messageDraftStatus === "sent") {
    events.push({
      id: "sent",
      dateLabel: "Heute",
      title: "Antwort gesendet",
    });
  }

  return events;
}

export function buildTrackerAssistChecklist(input: {
  photoCount: number;
  hasMultiDayPhotos: boolean;
  messageDraftStatus: MessageDraftListStatus;
  draftsAvailable: boolean;
  status: TrackerStatusDisplay;
  isApprovalPending: boolean;
}): TrackerAssistItem[] {
  const items: TrackerAssistItem[] = [
    {
      id: "photos",
      label: input.photoCount > 0 ? "Fotos geprüft" : "Fotos ausstehend",
      done: input.photoCount > 0,
    },
    {
      id: "concern",
      label: "Anliegen strukturiert",
      done: true,
    },
    {
      id: "draft",
      label: "Antwort vorbereitet",
      done:
        input.draftsAvailable &&
        (input.messageDraftStatus === "draft" ||
          input.messageDraftStatus === "approved" ||
          input.messageDraftStatus === "sent"),
    },
    {
      id: "approval",
      label: "Freigabe erforderlich",
      done: !input.isApprovalPending && input.messageDraftStatus !== "draft",
    },
  ];

  if (input.hasMultiDayPhotos) {
    items.splice(1, 0, {
      id: "trail",
      label: "Fotoverlauf erkannt",
      done: true,
    });
  }

  return items;
}

export function buildTrackerNextSteps(input: {
  isDoctor: boolean;
  messageDraftStatus: MessageDraftListStatus;
  isApprovalPending: boolean;
  photoCount: number;
  urgency: string | null;
  hasPhotoTrail: boolean;
}): string[] {
  const steps: string[] = [];

  if (input.isApprovalPending && input.isDoctor) {
    steps.push("Antwort freigeben");
  } else if (input.messageDraftStatus === "draft" && input.isDoctor) {
    steps.push("Entwurf prüfen");
  }

  if (input.urgency === "this_week" || input.urgency === "today") {
    steps.push("Termin diese Woche anbieten");
  }

  if (input.photoCount < 2 && !input.hasPhotoTrail) {
    steps.push("Schärferes Foto anfordern");
  }

  if (input.hasPhotoTrail) {
    steps.push("Verlauf in 3 Tagen prüfen");
  }

  steps.push("Aufgabe an Empfang erstellen");

  return steps.slice(0, 5);
}

export function buildTrackerCommandFlow(input: {
  messageDraftStatus: MessageDraftListStatus;
  draftsAvailable: boolean;
  openTaskCount: number;
  isApprovalPending: boolean;
}): TrackerCommandStep[] {
  const hasDraft =
    input.draftsAvailable &&
    (input.messageDraftStatus === "draft" ||
      input.messageDraftStatus === "approved" ||
      input.messageDraftStatus === "sent");

  const approvalWaiting = input.isApprovalPending;
  const taskCreated = input.openTaskCount > 0;

  const draftDone = hasDraft;
  const taskDone = taskCreated;
  const approvalDone =
    input.messageDraftStatus === "approved" || input.messageDraftStatus === "sent";

  return [
    { id: "dictate", label: "Diktat / Eingang", state: "done" },
    {
      id: "process",
      label: "KI verarbeitet",
      state: draftDone ? "done" : "active",
    },
    {
      id: "draft",
      label: "Antwort erstellt",
      state: draftDone ? "done" : approvalWaiting ? "pending" : "active",
    },
    {
      id: "task",
      label: "Aufgabe erstellt",
      state: taskDone ? "done" : draftDone ? "active" : "pending",
    },
    {
      id: "approval",
      label: "Freigabe wartet",
      state: approvalDone
        ? "done"
        : approvalWaiting
          ? "active"
          : draftDone
            ? "pending"
            : "pending",
    },
  ];
}

export function trackerInboxPriorityLabel(item: EnrichedSubmissionListItem): string | null {
  if (isApprovalPending(item)) return "Freigabe";
  if (!item.seen_at && !item.is_draft) return "Neu";
  if (item.urgency === "today") return "Heute";
  if (item.urgency === "this_week") return "Diese Woche";
  if (hasPhotoTrail(item)) return "Verlauf";
  return null;
}
