/**
 * Tracker-/Listen-Badges für persistente Antwortentwürfe.
 * Priorität: draft → approved → sent → none
 */

export type MessageDraftListStatus = "draft" | "approved" | "sent" | "none";

export type MessageDraftBadgeVariant = "draft" | "pending" | "approved" | "sent";

export type MessageDraftBadge = {
  label: string;
  variant: MessageDraftBadgeVariant;
  title: string;
};

const STATUS_RANK: Record<MessageDraftListStatus, number> = {
  none: 0,
  sent: 1,
  approved: 2,
  draft: 3,
};

export function mergeMessageDraftListStatus(
  current: MessageDraftListStatus,
  incoming: MessageDraftListStatus
): MessageDraftListStatus {
  return STATUS_RANK[incoming] > STATUS_RANK[current] ? incoming : current;
}

export function isSubmissionReadyForReview(item: {
  seen_at: string | null;
  patient_notes: string | null;
}): boolean {
  return !item.seen_at && Boolean(item.patient_notes?.trim());
}

export function resolveMessageDraftBadge(input: {
  draftStatus: MessageDraftListStatus;
  readyForReview: boolean;
}): MessageDraftBadge | null {
  const { draftStatus, readyForReview } = input;

  if (draftStatus === "none") {
    return null;
  }

  if (draftStatus === "sent") {
    return {
      label: "Gesendet",
      variant: "sent",
      title: "Antwort wurde als versendet markiert.",
    };
  }

  if (draftStatus === "approved") {
    return {
      label: "Freigabe erfolgt",
      variant: "approved",
      title: "Antwort wurde freigegeben, aber nicht automatisch versendet.",
    };
  }

  if (draftStatus === "draft" && readyForReview) {
    return {
      label: "Freigabe ausstehend",
      variant: "pending",
      title: "Antwort wartet auf ärztliche Freigabe.",
    };
  }

  if (draftStatus === "draft") {
    return {
      label: "Entwurf offen",
      variant: "draft",
      title: "Antwort wurde vorbereitet und kann bearbeitet werden.",
    };
  }

  return null;
}
