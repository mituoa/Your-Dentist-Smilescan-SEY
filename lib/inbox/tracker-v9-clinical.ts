import {
  buildTrackerClinicalDecision,
  buildTrackerClinicalDecisionFromListItem,
  type TrackerClinicalDecision,
  type TrackerClinicalDecisionInput,
} from "@/lib/inbox/tracker-clinical-decision";
import {
  hasPhotoTrail,
  hasVerlaufskontrolleContext,
  isApprovalPending,
  type EnrichedSubmissionListItem,
} from "@/lib/inbox/tracker-inbox-logic";
import type { MessageDraftListStatus } from "@/lib/message-drafts/list-status";

/** V9 — Dringlichkeit (UI + DB); `within_24h` als eigener Triage-Wert. */
export type ClinicalUrgencyId =
  | "today"
  | "within_24h"
  | "this_week"
  | "not_urgent";

export const CLINICAL_URGENCY_OPTIONS: { id: ClinicalUrgencyId; label: string }[] = [
  { id: "today", label: "Heute" },
  { id: "within_24h", label: "24 Stunden" },
  { id: "this_week", label: "Diese Woche" },
  { id: "not_urgent", label: "Nicht dringend" },
];

export type InboxPracticeStatusId =
  | "neu"
  | "in_bearbeitung"
  | "beobachten"
  | "freigegeben";

export const INBOX_PRACTICE_STATUS_OPTIONS: {
  id: InboxPracticeStatusId;
  label: string;
}[] = [
  { id: "neu", label: "Neu" },
  { id: "in_bearbeitung", label: "In Bearbeitung" },
  { id: "beobachten", label: "Beobachten" },
  { id: "freigegeben", label: "Freigegeben" },
];

export type TrackerNextStepItem = {
  id: string;
  label: string;
  intent?: "rueckfrage" | "foto" | "termin" | "freigabe";
  href?: string;
  emphasized?: boolean;
};

export type TrackerNextStepGroup = {
  id: "info" | "contact" | "org";
  label: string;
  items: TrackerNextStepItem[];
};

export type TrackerV9ClinicalModel = {
  decision: TrackerClinicalDecision;
  /** 2–3 Sätze — ärztliche Einschätzung, keine Checkliste. */
  assessment: string;
  suggestedUrgency: ClinicalUrgencyId;
  prioritizedRuckfrageTopics: string[];
  suggestedPhotoViewId: string | null;
  nextStepGroups: TrackerNextStepGroup[];
};

function noteMentionsPain(notes: string | null): boolean {
  return /schmerz|weh|druck|pochend/i.test(notes ?? "");
}

function noteMentionsSwelling(notes: string | null): boolean {
  return /schwell|anschwell|geschwollen/i.test(notes ?? "");
}

function noteMentionsFever(notes: string | null): boolean {
  return /fieber|temperatur/i.test(notes ?? "");
}

function noteMentionsBleeding(notes: string | null): boolean {
  return /blut|blutung/i.test(notes ?? "");
}

export function normalizeClinicalUrgency(
  stored: string | null
): ClinicalUrgencyId | null {
  if (
    stored === "today" ||
    stored === "within_24h" ||
    stored === "this_week" ||
    stored === "not_urgent"
  ) {
    return stored;
  }
  return null;
}

/** KI-Vorschlag Dringlichkeit aus Anliegen, Bildern, Verlauf. */
export function suggestClinicalUrgency(
  input: TrackerClinicalDecisionInput
): ClinicalUrgencyId {
  const stored = normalizeClinicalUrgency(input.urgency);
  if (stored) return stored;

  const notes = input.patientNotes ?? "";
  if (noteMentionsFever(notes) || (noteMentionsPain(notes) && input.photoCount === 0)) {
    return "today";
  }
  if (noteMentionsPain(notes) || noteMentionsSwelling(notes) || noteMentionsBleeding(notes)) {
    return input.photoCount > 0 ? "within_24h" : "today";
  }
  if (
    input.hasPhotoTrail ||
    input.intakeChannel === "follow_up" ||
    input.hasMultiDayPhotos
  ) {
    return "not_urgent";
  }
  if (input.photoCount >= 2) {
    return "this_week";
  }
  if (input.photoCount === 0) {
    return "this_week";
  }
  return "within_24h";
}

function buildAssessment(
  input: TrackerClinicalDecisionInput,
  decision: TrackerClinicalDecision,
  urgency: ClinicalUrgencyId
): string {
  const sentences: string[] = [];
  const notes = input.patientNotes?.trim();

  if (noteMentionsPain(notes ?? null) || noteMentionsSwelling(notes ?? null)) {
    sentences.push(
      "Die Beschwerden sprechen für einen zeitnahen klinischen Klärungsbedarf."
    );
  } else if (notes) {
    sentences.push("Das Anliegen ist dokumentiert und kann strukturiert eingeordnet werden.");
  } else {
    sentences.push("Der Eingang ist erfasst — die klinische Einordnung stützt sich auf Bilder und Metadaten.");
  }

  if (input.photoCount === 0) {
    sentences.push(
      "Ohne klinische Bilder ist die Einschätzung nur eingeschränkt möglich — eine Aufnahme wird empfohlen."
    );
  } else if (input.photoCount === 1) {
    sentences.push(
      "Die vorhandenen Bilder reichen für eine erste Einschätzung — ein weiterer Blickwinkel kann die Sicherheit erhöhen."
    );
  } else {
    sentences.push("Die vorhandenen Bilder reichen für eine erste Einschätzung.");
  }

  const actionLine =
    urgency === "today"
      ? "Eine zeitnahe zahnärztliche Untersuchung wird empfohlen."
      : urgency === "within_24h"
        ? "Eine Untersuchung innerhalb der nächsten 24 Stunden wird empfohlen."
        : urgency === "this_week"
          ? "Eine Einordnung in dieser Woche ist sinnvoll."
          : "Der Fall kann beobachtet oder nach Praxiskapazität eingeplant werden.";

  sentences.push(actionLine);
  return sentences.slice(0, 3).join(" ");
}

/** Priorisierte Rückfrage-Themen aus Lücken im Fall. */
export function prioritizeRuckfrageTopics(
  input: TrackerClinicalDecisionInput,
  decision: TrackerClinicalDecision
): string[] {
  const order: string[] = [];
  const notes = input.patientNotes ?? "";
  const missing = decision.missing.join(" ").toLowerCase();

  const push = (id: string) => {
    if (!order.includes(id)) order.push(id);
  };

  if (/schmerzskala|intensität/i.test(missing) || noteMentionsPain(notes)) {
    push("pain");
  }
  if (/dauer/i.test(missing) || /seit|tagen|woche/i.test(notes)) {
    push("course");
  }
  if (noteMentionsSwelling(notes) || /schwell/i.test(missing)) {
    push("swelling");
  }
  if (noteMentionsFever(notes) || /temperatur|fieber/i.test(missing)) {
    push("fever");
  }
  if (/medikament/i.test(notes)) push("meds");
  if (noteMentionsBleeding(notes)) push("bleeding");
  if (/kälte|empfindlich/i.test(notes)) push("cold");
  if (/kau|beiß|biss/i.test(notes)) push("chew");
  if (input.photoCount < 2) push("photo");
  push("custom");

  return order.slice(0, 10);
}

export function suggestPhotoViewId(
  input: TrackerClinicalDecisionInput
): string | null {
  if (input.photoCount === 0) return "closeup";
  if (input.photoCount === 1) return "overview";
  const notes = (input.patientNotes ?? "").toLowerCase();
  if (/unterkiefer|uk\b/i.test(notes)) return "lower";
  if (/oberkiefer|ok\b/i.test(notes)) return "upper";
  if (/links/i.test(notes)) return "left";
  if (/rechts/i.test(notes)) return "right";
  return "affected";
}

export function buildTrackerNextStepGroups(opts: {
  submissionId: string;
  isDoctor: boolean;
  messageDraftStatus: MessageDraftListStatus;
  draftsAvailable: boolean;
  isApprovalPending: boolean;
  photoCount: number;
  primaryAction: string;
}): TrackerNextStepGroup[] {
  const taskHref = `/my-tasks/new?submission_id=${opts.submissionId}&from=inbox`;
  const showAntwort =
    opts.isDoctor &&
    opts.draftsAvailable &&
    (opts.isApprovalPending || opts.messageDraftStatus === "draft");

  const contactItems: TrackerNextStepItem[] = [
    { id: "termin", label: "Termin anbieten", intent: "termin" },
  ];
  if (showAntwort) {
    contactItems.push({
      id: "freigabe",
      label: opts.isApprovalPending ? "Antwort freigeben" : "Antwort senden",
      intent: "freigabe",
      emphasized: /freigeben|antwort/i.test(opts.primaryAction),
    });
  } else if (opts.draftsAvailable) {
    contactItems.push({
      id: "antwort",
      label: "Antwort vorbereiten",
      intent: "freigabe",
      emphasized: /antwort|freigeben/i.test(opts.primaryAction),
    });
  }

  const fotoLabel =
    opts.photoCount === 0
      ? "Foto anfordern"
      : opts.photoCount === 1
        ? "Weiteres Foto anfordern"
        : "Weitere Fotos anfordern";

  return [
    {
      id: "info",
      label: "Information ergänzen",
      items: [
        {
          id: "rueckfrage",
          label: "Rückfrage stellen",
          intent: "rueckfrage",
          emphasized: /rückfrage/i.test(opts.primaryAction),
        },
        {
          id: "foto",
          label: fotoLabel,
          intent: "foto",
          emphasized: /foto/i.test(opts.primaryAction),
        },
      ],
    },
    {
      id: "contact",
      label: "Patient kontaktieren",
      items: contactItems,
    },
    {
      id: "org",
      label: "Praxisorganisation",
      items: [{ id: "aufgabe", label: "Aufgabe erstellen", href: taskHref }],
    },
  ];
}

export function buildTrackerV9ClinicalModel(
  input: TrackerClinicalDecisionInput & { submissionId: string }
): TrackerV9ClinicalModel {
  const decision = buildTrackerClinicalDecision(input);
  const suggestedUrgency = suggestClinicalUrgency(input);

  return {
    decision,
    assessment: buildAssessment(input, decision, suggestedUrgency),
    suggestedUrgency,
    prioritizedRuckfrageTopics: prioritizeRuckfrageTopics(input, decision),
    suggestedPhotoViewId: suggestPhotoViewId(input),
    nextStepGroups: buildTrackerNextStepGroups({
      submissionId: input.submissionId,
      isDoctor: input.isDoctor,
      messageDraftStatus: input.messageDraftStatus,
      draftsAvailable: input.draftsAvailable,
      isApprovalPending: input.isApprovalPending,
      photoCount: input.photoCount,
      primaryAction: decision.primaryAction,
    }),
  };
}

export function buildTrackerV9FromListItem(
  item: EnrichedSubmissionListItem,
  opts: {
    isDoctor?: boolean;
    submissionId: string;
  }
): TrackerV9ClinicalModel {
  const input: TrackerClinicalDecisionInput = {
    patientNotes: item.patient_notes,
    patientName: item.patient_name,
    photoCount: item.photo_count ?? 0,
    hasMultiDayPhotos: Boolean(
      item.photo_documentation &&
        item.photo_documentation.dayCount >= 2 &&
        item.photo_documentation.photoCount >= 2
    ),
    hasPhotoTrail: hasPhotoTrail(item),
    messageDraftStatus: item.message_draft_status,
    draftsAvailable: item.message_draft_status !== "none",
    urgency: item.urgency,
    intakeChannel: item.intake_channel,
    isApprovalPending: isApprovalPending(item),
    isDoctor: opts.isDoctor ?? true,
    openTaskCount: item.open_task_count ?? 0,
    photoDocumentation: item.photo_documentation,
  };

  const decision = buildTrackerClinicalDecision(input);
  const suggestedUrgency = suggestClinicalUrgency(input);

  return {
    decision,
    assessment: buildAssessment(input, decision, suggestedUrgency),
    suggestedUrgency,
    prioritizedRuckfrageTopics: prioritizeRuckfrageTopics(input, decision),
    suggestedPhotoViewId: suggestPhotoViewId(input),
    nextStepGroups: buildTrackerNextStepGroups({
      submissionId: opts.submissionId,
      isDoctor: input.isDoctor,
      messageDraftStatus: input.messageDraftStatus,
      draftsAvailable: input.draftsAvailable,
      isApprovalPending: input.isApprovalPending,
      photoCount: input.photoCount,
      primaryAction: decision.primaryAction,
    }),
  };
}

export function resolveInboxPracticeStatus(
  item: EnrichedSubmissionListItem
): InboxPracticeStatusId {
  if (item.message_draft_status === "sent") return "freigegeben";
  if (isApprovalPending(item) || item.message_draft_status === "approved") {
    return "in_bearbeitung";
  }
  if (!item.seen_at && !item.is_draft) return "neu";
  if (
    item.urgency === "not_urgent" ||
    hasVerlaufskontrolleContext(item)
  ) {
    return "beobachten";
  }
  if (item.seen_at) return "in_bearbeitung";
  return "neu";
}

/** Relatives Eingangszeitpunkt für die Inbox-Zeile 3. */
export function formatTrackerRelativeIngress(iso: string): string {
  const then = new Date(iso);
  if (Number.isNaN(then.getTime())) return "—";
  const now = Date.now();
  const diffMs = now - then.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "Gerade eben";
  if (diffMin < 60) return `Vor ${diffMin} Minuten`;

  const todayKey = new Date().toISOString().slice(0, 10);
  const key = iso.slice(0, 10);
  if (key === todayKey) return "Heute";

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (key === yesterday.toISOString().slice(0, 10)) return "Gestern";

  const diffDays = Math.floor(diffMs / 86400000);
  if (diffDays < 7) return `Vor ${diffDays} Tagen`;

  return then.toLocaleDateString("de-DE", { day: "numeric", month: "short" });
}

export { buildTrackerClinicalDecisionFromListItem };
