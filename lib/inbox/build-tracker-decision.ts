import { buildSubmissionPreparation } from "@/lib/command-ai/submission-preparation";
import { frameSituation } from "@/lib/command-ai/safety-copy";
import {
  isApprovalPending,
  type EnrichedSubmissionListItem,
} from "@/lib/inbox/tracker-inbox-logic";
import {
  buildYdAssistentRecommendation,
  resolveYdCaseProductStatus,
} from "@/lib/inbox/tracker-product-status";
import type { MessageDraftListStatus } from "@/lib/message-drafts/list-status";
import { getIntakeChannelLabel, type IntakeChannel } from "@/lib/submissions/intake-channel";

export type TrackerKiSignal = {
  id: string;
  /** Workflow-Schritt im Praxis-Assistenten (1–4). */
  workflowStep: string;
  label: string;
  status: "done" | "active" | "recommended" | "pending";
  detail: string;
};

export type TrackerActionItem = {
  id: string;
  label: string;
  variant: "primary" | "secondary";
  href?: string;
  scrollTo?: string;
  disabled?: boolean;
  title?: string;
};

export type TrackerDecisionCenterModel = {
  patientName: string;
  caseHeadline: string;
  productStatus: ReturnType<typeof resolveYdCaseProductStatus>;
  whatHappened: string;
  whatKiDid: string[];
  whatYouMustDo: string;
  kiSignals: TrackerKiSignal[];
  actions: TrackerActionItem[];
};

function whatHappenedCopy(input: {
  intakeChannel: IntakeChannel;
  photoCount: number;
  patientNotes: string | null;
  patientName: string | null;
  hasPhotoTrail: boolean;
}): string {
  const name = input.patientName?.trim() || "Der Patient";
  const channel = getIntakeChannelLabel(input.intakeChannel);

  if (input.photoCount === 0) {
    return `${name} hat ein Anliegen über ${channel} gesendet. Es liegen noch keine Bilder vor.`;
  }
  if (input.hasPhotoTrail) {
    return `${name} hat über ${channel} Bilder an mehreren Tagen eingereicht. Der Verlauf ist bereit zur Sichtung.`;
  }
  return `${name} hat über ${channel} Bilder und ein Anliegen übermittelt.`;
}

export function buildTrackerDecisionCenter(input: {
  submission: EnrichedSubmissionListItem;
  patientNotes: string | null;
  photoCount: number;
  hasPhotoTrail: boolean;
  messageDraftStatus: MessageDraftListStatus;
  draftsAvailable: boolean;
  isDoctor: boolean;
  canSendAppointment: boolean;
  patientEmail: string | null;
}): TrackerDecisionCenterModel {
  const patientName = input.submission.patient_name?.trim() || "Unbekannter Patient";
  const product = resolveYdCaseProductStatus(input.submission);
  const caseHeadline = product.fallakteLabel;
  const approvalPending = isApprovalPending(input.submission);

  const preparation = buildSubmissionPreparation({
    id: input.submission.id,
    patient_name: input.submission.patient_name,
    patient_notes: input.patientNotes,
    seen_at: input.submission.seen_at,
    photo_count: input.photoCount,
  });

  const hasDraft =
    input.draftsAvailable &&
    (input.messageDraftStatus === "draft" ||
      input.messageDraftStatus === "approved" ||
      input.messageDraftStatus === "sent");

  const whatHappened = whatHappenedCopy({
    intakeChannel: input.submission.intake_channel,
    photoCount: input.photoCount,
    patientNotes: input.patientNotes,
    patientName: input.submission.patient_name,
    hasPhotoTrail: input.hasPhotoTrail,
  });

  const whatKiPrepared: string[] = [];
  if (input.photoCount > 0) {
    whatKiPrepared.push("Bilder dem Fall zugeordnet und zur Sichtung bereitgestellt.");
  }
  if (preparation.responseSummary) {
    whatKiPrepared.push(preparation.responseSummary);
  } else if (input.patientNotes?.trim()) {
    whatKiPrepared.push(frameSituation(input.patientNotes, patientName));
  }
  if (hasDraft) {
    whatKiPrepared.push(
      approvalPending
        ? "Antwortentwurf liegt zur Freigabe bereit."
        : "Antwortentwurf wurde formuliert."
    );
  }
  if (input.submission.open_task_count > 0) {
    whatKiPrepared.push("Aufgabe für die Praxis wurde vorgemerkt.");
  }
  if (whatKiPrepared.length === 0) {
    whatKiPrepared.push("Der Eingang wird gerade strukturiert.");
  }

  let whatYouMustDo = product.nextStep;
  if (input.photoCount === 0 && product.id !== "freigabe_erforderlich") {
    whatYouMustDo = "Anliegen klären oder Bilder nachfordern.";
  }

  const needsPhotos = input.photoCount === 0;
  const needsUrgentSlot =
    input.submission.urgency === "today" || input.submission.urgency === "this_week";

  let nextActionDetail = "Kein weiterer Schritt vorgemerkt.";
  if (approvalPending && input.isDoctor) {
    nextActionDetail = "Freigabe der vorbereiteten Antwort.";
  } else if (needsPhotos) {
    nextActionDetail = "Klinische Bilder nachfordern oder schriftlich antworten.";
  } else if (needsUrgentSlot && input.canSendAppointment) {
    nextActionDetail = "Terminlink senden oder persönlich einplanen.";
  } else if (input.photoCount > 0 && !hasDraft) {
    nextActionDetail = "Nach Sichtung der Bilder Antwort vorbereiten lassen.";
  } else {
    nextActionDetail = "Fall abschließen oder an die Praxis weitergeben.";
  }

  const kiSignals: TrackerKiSignal[] = [
    {
      id: "analysis",
      workflowStep: "Analyse",
      label: "Eingang ausgewertet",
      status:
        input.photoCount > 0 && (hasDraft || Boolean(input.patientNotes?.trim()))
          ? "done"
          : Boolean(input.patientNotes?.trim()) || input.photoCount > 0
            ? "active"
            : "pending",
      detail:
        input.photoCount > 0
          ? "Bilder und Anliegen sind strukturiert."
          : input.patientNotes?.trim()
            ? "Anliegen erfasst — Bilder fehlen noch."
            : "Wartet auf vollständigen Eingang.",
    },
    {
      id: "preparation",
      workflowStep: "Vorbereitung",
      label: "Antwort vorbereitet",
      status: hasDraft ? "done" : preparation.responseSummary ? "active" : "pending",
      detail: hasDraft
        ? "Entwurf liegt im Freigabe-Bereich."
        : "Antwort wird nach Sichtung formuliert.",
    },
    {
      id: "release",
      workflowStep: "Freigabe",
      label: "Ihre Freigabe",
      status: approvalPending
        ? "active"
        : hasDraft && input.messageDraftStatus === "approved"
          ? "done"
          : hasDraft
            ? "pending"
            : "pending",
      detail: approvalPending
        ? "Entwurf wartet auf Ihre Entscheidung."
        : hasDraft
          ? "Noch keine Freigabe erforderlich."
          : "Freigabe folgt nach Vorbereitung.",
    },
    {
      id: "next",
      workflowStep: "Nächste Aktion",
      label: needsPhotos
        ? "Bilder nachfordern"
        : needsUrgentSlot
          ? "Termin anbieten"
          : "Fall fortsetzen",
      status:
        approvalPending && input.isDoctor
          ? "active"
          : needsPhotos || needsUrgentSlot
            ? "recommended"
            : "pending",
      detail: nextActionDetail,
    },
  ];

  const actions: TrackerActionItem[] = [];

  if (approvalPending && input.isDoctor) {
    actions.push({
      id: "approve",
      label: "Antwort freigeben",
      variant: "primary",
      scrollTo: "tracker-freigabe",
    });
  } else if (hasDraft && input.isDoctor) {
    actions.push({
      id: "review",
      label: "Antwort prüfen",
      variant: "primary",
      scrollTo: "tracker-freigabe",
    });
  }

  if (input.canSendAppointment) {
    actions.push({
      id: "appointment",
      label: "Termin senden",
      variant: approvalPending || hasDraft ? "secondary" : "primary",
      scrollTo: "tracker-termin",
      disabled: !input.patientEmail?.trim(),
      title: !input.patientEmail?.trim()
        ? "Keine E-Mail-Adresse des Patienten hinterlegt."
        : undefined,
    });
  }

  actions.push({
    id: "photo",
    label: "Foto nachfordern",
    variant: "secondary",
    href: input.patientEmail?.trim()
      ? `mailto:${input.patientEmail.trim()}?subject=${encodeURIComponent("Klinische Bilder für Ihre Anfrage")}`
      : undefined,
    disabled: !input.patientEmail?.trim(),
    title: !input.patientEmail?.trim()
      ? "E-Mail des Patienten fehlt für Nachforderung."
      : undefined,
  });

  if (input.submission.open_task_count > 0) {
    actions.push({
      id: "relay-tasks",
      label:
        input.submission.open_task_count === 1
          ? "Aufgabe in Relay"
          : `${input.submission.open_task_count} Aufgaben in Relay`,
      variant: "secondary",
      href: "/relay",
    });
  }

  actions.push({
    id: "practice",
    label: "Aufgabe anlegen",
    variant: "secondary",
    href: "/relay",
    title: "In Relay eine Aufgabe für diesen Fall anlegen",
  });

  return {
    patientName,
    caseHeadline,
    productStatus: product,
    whatHappened,
    whatKiDid: whatKiPrepared,
    whatYouMustDo,
    kiSignals,
    actions,
  };
}

/** Ein Assistent — keine Widget-Sammlung. */
export type TrackerAssistentView = {
  productStatusLabel: string;
  analysis: string;
  recommendation: string;
  decisionRequired: string;
  relayNote: string | null;
  actions: TrackerActionItem[];
};

export function buildTrackerAssistentView(
  decision: TrackerDecisionCenterModel,
  submission: EnrichedSubmissionListItem
): TrackerAssistentView {
  const recommendation = buildYdAssistentRecommendation(
    submission,
    decision.whatKiDid
  );

  const relayNote =
    submission.open_task_count > 0
      ? `In Relay ${submission.open_task_count === 1 ? "wartet eine Aufgabe" : `warten ${submission.open_task_count} Aufgaben`} zu diesem Fall.`
      : null;

  return {
    productStatusLabel: decision.productStatus.shortLabel,
    analysis: decision.whatHappened,
    recommendation,
    decisionRequired: decision.whatYouMustDo,
    relayNote,
    actions: decision.actions,
  };
}
