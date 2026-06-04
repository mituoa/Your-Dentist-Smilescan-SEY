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

export type TrackerPraxisAssistentModel = {
  analysis: string;
  confidence: string;
  preparation: string;
  draftPreview: string | null;
  recommendedAction: string;
  flowSteps: TrackerCommandStep[];
  prepChecks: TrackerAssistItem[];
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
      title: "Anfrage eingegangen",
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
      title: count === 1 ? "Bilder erhalten" : `${count} Bilder erhalten`,
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
      id: "ki-analysis",
      dateLabel: "Heute",
      title: "KI Analyse erstellt",
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

  if (input.messageDraftStatus === "approved") {
    events.push({
      id: "approval-done",
      dateLabel: "Heute",
      title: "Antwort freigegeben",
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

function buildKiClinicalAnalysis(input: {
  photoCount: number;
  hasMultiDayPhotos: boolean;
  messageDraftStatus: MessageDraftListStatus;
  isApprovalPending: boolean;
}): string {
  if (input.photoCount === 0) {
    return "Die aktuelle Situation spricht für eine kurze Rückfrage — es liegen noch keine klinischen Bilder vor.";
  }
  if (input.hasMultiDayPhotos) {
    return "Die aktuelle Situation spricht für eine Nachsorge mit dokumentiertem Verlauf — Bilder über mehrere Tage sind vorhanden.";
  }
  if (input.isApprovalPending) {
    return "Die aktuelle Situation spricht für eine ärztliche Freigabe — Anliegen und Bilder sind ausreichend vorbereitet.";
  }
  if (
    input.messageDraftStatus === "draft" ||
    input.messageDraftStatus === "approved" ||
    input.messageDraftStatus === "sent"
  ) {
    return "Die aktuelle Situation spricht für eine zeitnahe ärztliche Entscheidung — Anliegen und Bildmaterial sind eingeordnet.";
  }
  return "Die aktuelle Situation spricht für eine klinische Sichtung — das Bildmaterial sollte die Einordnung tragen.";
}

function buildKiConfidence(input: {
  photoCount: number;
  hasMultiDayPhotos: boolean;
  messageDraftStatus: MessageDraftListStatus;
  draftsAvailable: boolean;
}): string {
  const hasDraft =
    input.draftsAvailable &&
    (input.messageDraftStatus === "draft" ||
      input.messageDraftStatus === "approved" ||
      input.messageDraftStatus === "sent");

  if (input.photoCount === 0) {
    return "Einschätzung vorläufig — ohne Bilder.";
  }
  if (input.photoCount > 0 && input.hasMultiDayPhotos && hasDraft) {
    return "Gut abgesichert — Anliegen, Verlauf und Antwortentwurf.";
  }
  if (input.photoCount > 0 && hasDraft) {
    return "Gut abgesichert — Anliegen, Bilder und Antwortentwurf.";
  }
  if (input.photoCount > 0 && input.hasMultiDayPhotos) {
    return "Solide — Anliegen und Verlauf; Antwort noch offen.";
  }
  if (input.photoCount > 0) {
    return "Solide — Anliegen und Bilder; Entwurf ggf. noch offen.";
  }
  return "Einschätzung auf Basis des Anliegens.";
}

function buildPreparedResponseCopy(input: {
  messageDraftStatus: MessageDraftListStatus;
  draftsAvailable: boolean;
  isApprovalPending: boolean;
  isDoctor: boolean;
}): string {
  const hasDraft =
    input.draftsAvailable &&
    (input.messageDraftStatus === "draft" ||
      input.messageDraftStatus === "approved" ||
      input.messageDraftStatus === "sent");

  if (input.messageDraftStatus === "sent") {
    return "Die Patientenantwort wurde versendet.";
  }
  if (input.isApprovalPending && input.isDoctor) {
    return "Eine Antwort liegt zur ärztlichen Freigabe bereit.";
  }
  if (input.messageDraftStatus === "draft" && input.isDoctor) {
    return "Ein Antwortentwurf liegt zur Prüfung in der Fallakte.";
  }
  if (hasDraft) {
    return "Ein Antwortentwurf ist vorbereitet — Details in der Fallakte.";
  }
  if (input.draftsAvailable) {
    return "Noch kein Entwurf — die Assistenz kann eine Antwort aus dem Anliegen formulieren.";
  }
  return "Noch keine Antwort vorbereitet.";
}

export function buildTrackerPraxisAssistent(input: {
  photoCount: number;
  hasMultiDayPhotos: boolean;
  messageDraftStatus: MessageDraftListStatus;
  draftsAvailable: boolean;
  status: TrackerStatusDisplay;
  isApprovalPending: boolean;
  isDoctor: boolean;
  openTaskCount: number;
  urgency: string | null;
  hasPhotoTrail: boolean;
  draftPreview?: string | null;
}): TrackerPraxisAssistentModel {
  const prepChecks = buildTrackerAssistChecklist({
    photoCount: input.photoCount,
    hasMultiDayPhotos: input.hasMultiDayPhotos,
    messageDraftStatus: input.messageDraftStatus,
    draftsAvailable: input.draftsAvailable,
    status: input.status,
    isApprovalPending: input.isApprovalPending,
  });

  const flowSteps = buildTrackerCommandFlow({
    messageDraftStatus: input.messageDraftStatus,
    draftsAvailable: input.draftsAvailable,
    openTaskCount: input.openTaskCount,
    isApprovalPending: input.isApprovalPending,
  });

  const nextSteps = buildTrackerNextSteps({
    isDoctor: input.isDoctor,
    messageDraftStatus: input.messageDraftStatus,
    isApprovalPending: input.isApprovalPending,
    photoCount: input.photoCount,
    urgency: input.urgency,
    hasPhotoTrail: input.hasPhotoTrail,
  });

  const analysis = buildKiClinicalAnalysis({
    photoCount: input.photoCount,
    hasMultiDayPhotos: input.hasMultiDayPhotos,
    messageDraftStatus: input.messageDraftStatus,
    isApprovalPending: input.isApprovalPending,
  });

  const confidence = buildKiConfidence({
    photoCount: input.photoCount,
    hasMultiDayPhotos: input.hasMultiDayPhotos,
    messageDraftStatus: input.messageDraftStatus,
    draftsAvailable: input.draftsAvailable,
  });

  const preparation = buildPreparedResponseCopy({
    messageDraftStatus: input.messageDraftStatus,
    draftsAvailable: input.draftsAvailable,
    isApprovalPending: input.isApprovalPending,
    isDoctor: input.isDoctor,
  });

  const draftPreview = input.draftPreview?.trim() || null;

  const recommendedAction =
    nextSteps[0] ?? "Fall kurz sichten und nächsten Schritt in der Fallakte setzen.";

  return {
    analysis,
    confidence,
    preparation,
    draftPreview,
    recommendedAction,
    flowSteps,
    prepChecks,
  };
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
      label: input.photoCount > 0 ? "Bilder vorhanden" : "Bilder fehlen",
      done: input.photoCount > 0,
    },
    {
      id: "concern",
      label: "Anliegen erfasst",
      done: true,
    },
    {
      id: "draft",
      label: "Antwort formuliert",
      done:
        input.draftsAvailable &&
        (input.messageDraftStatus === "draft" ||
          input.messageDraftStatus === "approved" ||
          input.messageDraftStatus === "sent"),
    },
    {
      id: "approval",
      label: input.isApprovalPending ? "Ihre Freigabe offen" : "Freigabe erledigt",
      done: !input.isApprovalPending && input.messageDraftStatus !== "draft",
    },
  ];

  if (input.hasMultiDayPhotos) {
    items.splice(1, 0, {
      id: "trail",
      label: "Verlauf erkannt",
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
    steps.push("Antwort jetzt freigeben");
  } else if (input.messageDraftStatus === "draft" && input.isDoctor) {
    steps.push("Entwurf prüfen und freigeben");
  }

  if (input.urgency === "this_week" || input.urgency === "today") {
    steps.push("Termin in dieser Woche anbieten");
  }

  if (input.photoCount < 2 && !input.hasPhotoTrail) {
    steps.push("Klareres Foto anfordern");
  }

  if (input.hasPhotoTrail) {
    steps.push("Verlauf in ein bis zwei Tagen erneut sichten");
  }

  steps.push("Bei Bedarf Aufgabe an das Team");

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
    { id: "dictate", label: "Anliegen eingegangen", state: "done" },
    {
      id: "process",
      label: "KI-Einordnung",
      state: draftDone ? "done" : "active",
    },
    {
      id: "draft",
      label: "Antwort vorbereitet",
      state: draftDone ? "done" : approvalWaiting ? "pending" : "active",
    },
    {
      id: "task",
      label: "Team informiert",
      state: taskDone ? "done" : draftDone ? "active" : "pending",
    },
    {
      id: "approval",
      label: "Ihre Entscheidung",
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

/** Nur Zeitdringlichkeit — Arbeitstyp steht in `trackerInboxWorkType`. */
export function trackerInboxPriorityLabel(item: EnrichedSubmissionListItem): string | null {
  if (item.urgency === "today") return "Heute";
  if (item.urgency === "this_week") return "Diese Woche";
  return null;
}
