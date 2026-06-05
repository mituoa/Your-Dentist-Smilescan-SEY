import {
  buildTrackerClinicalDecision,
  type TrackerClinicalDecision,
} from "@/lib/inbox/tracker-clinical-decision";
import {
  hasPhotoTrail,
  isApprovalPending,
  type EnrichedSubmissionListItem,
  type TrackerStatusDisplay,
} from "@/lib/inbox/tracker-inbox-logic";
import type { MessageDraftListStatus } from "@/lib/message-drafts/list-status";
import type { OutboundMessageKind } from "@/lib/outbound-messages/types";
import type { IntakeChannel } from "@/lib/submissions/intake-channel";

export function outboundKindTimelineTitle(kind: OutboundMessageKind): string {
  switch (kind) {
    case "question":
      return "Rückfrage gesendet";
    case "photo_request":
      return "Foto angefordert";
    case "appointment_offer":
      return "Termin angeboten";
    case "reply":
      return "Antwort gesendet";
    default:
      return "Nachricht gesendet";
  }
}

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

export type { TrackerClinicalDecision } from "@/lib/inbox/tracker-clinical-decision";

export type TrackerPraxisAssistentModel = {
  decision: TrackerClinicalDecision;
  preparation: string;
  draftPreview: string | null;
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

export type TrackerTimelineSection = {
  id: string;
  title: string;
  events: TrackerTimelineEvent[];
};

export function buildTrackerCaseTimelineSections(input: {
  createdAt: string;
  photos: { id: string; created_at: string }[];
  patientNotes: string | null;
  messageDraftStatus?: MessageDraftListStatus;
  isApprovalPending?: boolean;
  outboundSent?: { id: string; message_kind: OutboundMessageKind; sent_at: string | null }[];
}): TrackerTimelineSection[] {
  const note = input.patientNotes?.trim();
  const sections: TrackerTimelineSection[] = [];

  sections.push({
    id: "intake",
    title: "Originalanliegen",
    events: [
      {
        id: "intake",
        dateLabel: formatTimelineDate(input.createdAt),
        title: "Anfrage eingegangen",
        detail:
          note && note.length > 24
            ? note.length > 120
              ? `${note.slice(0, 120).trimEnd()}…`
              : note
            : undefined,
      },
    ],
  });

  const sorted = [...input.photos].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  const photoEvents: TrackerTimelineEvent[] = [];
  const patientReplyEvents: TrackerTimelineEvent[] = [];
  const byDay = new Map<string, { ids: string[]; iso: string }>();
  for (const photo of sorted) {
    const key = photo.created_at.slice(0, 10);
    const prev = byDay.get(key);
    if (prev) prev.ids.push(photo.id);
    else byDay.set(key, { ids: [photo.id], iso: photo.created_at });
  }
  const dayKeys = [...byDay.keys()].sort();
  const firstDayKey = dayKeys[0];
  for (const key of dayKeys) {
    const group = byDay.get(key)!;
    const count = group.ids.length;
    const event: TrackerTimelineEvent = {
      id: `photo-${group.iso}`,
      dateLabel: formatTimelineDate(group.iso),
      title: count === 1 ? "Bilder erhalten" : `${count} Bilder erhalten`,
    };
    if (key === firstDayKey) {
      photoEvents.push(event);
    } else {
      patientReplyEvents.push({
        ...event,
        id: `patient-reply-${group.iso}`,
        title:
          count === 1
            ? "Patientenantwort — neues Bild"
            : `Patientenantwort — ${count} neue Bilder`,
      });
    }
  }
  if (photoEvents.length > 0) {
    sections.push({ id: "photos", title: "Fotos", events: photoEvents });
  }
  if (patientReplyEvents.length > 0) {
    sections.push({
      id: "patient_replies",
      title: "Patientenantworten",
      events: patientReplyEvents,
    });
  }

  const outboundEvents: TrackerTimelineEvent[] = [];
  const sentOutbound = (input.outboundSent ?? []).filter((m) => m.sent_at);
  for (const msg of sentOutbound) {
    outboundEvents.push({
      id: `outbound-${msg.id}`,
      dateLabel: formatTimelineDate(msg.sent_at!),
      title: outboundKindTimelineTitle(msg.message_kind),
    });
  }

  if (outboundEvents.length > 0) {
    sections.push({
      id: "outbound",
      title: "Versandte Nachrichten",
      events: outboundEvents,
    });
  }

  return sections;
}

/** @deprecated Nutze buildTrackerCaseTimelineSections für gruppierte Dokumentation. */
export function buildTrackerCaseTimeline(input: {
  createdAt: string;
  photos: { id: string; created_at: string }[];
  patientNotes: string | null;
  messageDraftStatus?: MessageDraftListStatus;
  isApprovalPending?: boolean;
  outboundSent?: { id: string; message_kind: OutboundMessageKind; sent_at: string | null }[];
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
      title: "Patientenanliegen erfasst",
    });
    events.push({
      id: "draft-ready",
      dateLabel: "Heute",
      title: "Vorschlag für Patientenantwort formuliert",
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
      title: "Antwort freigegeben (noch nicht versendet)",
    });
  }

  const sentOutbound = (input.outboundSent ?? []).filter((m) => m.sent_at);
  for (const msg of sentOutbound) {
    events.push({
      id: `outbound-${msg.id}`,
      dateLabel: formatTimelineDate(msg.sent_at!),
      title: outboundKindTimelineTitle(msg.message_kind),
    });
  }

  return events;
}

function buildPreparedResponseCopy(input: {
  messageDraftStatus: MessageDraftListStatus;
  draftsAvailable: boolean;
  isApprovalPending: boolean;
  isDoctor: boolean;
  hasOutboundReplySent?: boolean;
}): string {
  const hasDraft =
    input.draftsAvailable &&
    (input.messageDraftStatus === "draft" ||
      input.messageDraftStatus === "approved" ||
      input.messageDraftStatus === "sent");

  if (input.hasOutboundReplySent) {
    return "Die Antwort wurde per E-Mail an den Patienten gesendet.";
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
  patientName: string;
  patientNotes: string | null;
  intakeChannel: IntakeChannel;
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
  hasOutboundReplySent?: boolean;
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

  const decision = buildTrackerClinicalDecision({
    patientNotes: input.patientNotes,
    patientName: input.patientName,
    photoCount: input.photoCount,
    hasMultiDayPhotos: input.hasMultiDayPhotos,
    hasPhotoTrail: input.hasPhotoTrail,
    messageDraftStatus: input.messageDraftStatus,
    draftsAvailable: input.draftsAvailable,
    urgency: input.urgency,
    intakeChannel: input.intakeChannel,
    isApprovalPending: input.isApprovalPending,
    isDoctor: input.isDoctor,
    openTaskCount: input.openTaskCount,
  });

  const preparation = buildPreparedResponseCopy({
    messageDraftStatus: input.messageDraftStatus,
    draftsAvailable: input.draftsAvailable,
    isApprovalPending: input.isApprovalPending,
    isDoctor: input.isDoctor,
    hasOutboundReplySent: input.hasOutboundReplySent,
  });

  const draftPreview = input.draftPreview?.trim() || null;

  return {
    decision,
    preparation,
    draftPreview,
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
