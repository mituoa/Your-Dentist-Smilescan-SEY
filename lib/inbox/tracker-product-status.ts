import {
  hasPhotoTrail,
  isApprovalPending,
  matchesTrackerFilter,
  openTasksHintLabel,
  photoTrailSummary,
  type EnrichedSubmissionListItem,
  type TrackerInboxFilter,
} from "@/lib/inbox/tracker-inbox-logic";

/** YD-Fallstatus — eine klare Zeile für Inbox, Fallakte und Assistent. */
export type YdCaseProductStatusId =
  | "neu"
  | "in_bearbeitung"
  | "antwort_vorbereitet"
  | "freigabe_erforderlich"
  | "termin_empfohlen"
  | "praxisaufgabe"
  | "abgeschlossen"
  | "entwurf";

export type YdCaseProductStatus = {
  id: YdCaseProductStatusId;
  /** Kurzzeile in der Inbox-Liste */
  shortLabel: string;
  /** Zeile unter dem Patientennamen in der Fallakte */
  fallakteLabel: string;
  /** Nächster sinnvoller Schritt (Assistent: Ihre Entscheidung) */
  nextStep: string;
  needsAttention: boolean;
};

function isNachsorgeCase(item: EnrichedSubmissionListItem): boolean {
  return (
    item.intake_channel === "follow_up" ||
    hasPhotoTrail(item) ||
    (item.photo_documentation?.linkedSubmissionCount ?? 0) > 1
  );
}

function isTerminEmpfohlen(item: EnrichedSubmissionListItem): boolean {
  return item.urgency === "today" || item.urgency === "this_week";
}

export function resolveYdCaseProductStatus(
  item: EnrichedSubmissionListItem
): YdCaseProductStatus {
  if (item.is_draft) {
    return {
      id: "entwurf",
      shortLabel: "Entwurf",
      fallakteLabel: "Praxisfall — noch nicht veröffentlicht",
      nextStep: "Fall vervollständigen und abschließen.",
      needsAttention: true,
    };
  }

  if (item.message_draft_status === "sent" && item.seen_at) {
    return {
      id: "abgeschlossen",
      shortLabel: "Abgeschlossen",
      fallakteLabel: "Antwort wurde versendet",
      nextStep: "Nur bei Rückfrage erneut öffnen.",
      needsAttention: false,
    };
  }

  if (isApprovalPending(item)) {
    return {
      id: "freigabe_erforderlich",
      shortLabel: "Freigabe",
      fallakteLabel: "Antwortentwurf wartet auf Freigabe",
      nextStep: "Antwort prüfen und freigeben.",
      needsAttention: true,
    };
  }

  if (item.message_draft_status === "draft") {
    return {
      id: "antwort_vorbereitet",
      shortLabel: "Antwort bereit",
      fallakteLabel: "KI hat eine Antwort vorbereitet",
      nextStep: "Entwurf prüfen oder freigeben lassen.",
      needsAttention: true,
    };
  }

  if (item.open_task_count > 0) {
    const tasks = openTasksHintLabel(item.open_task_count);
    return {
      id: "praxisaufgabe",
      shortLabel: "Aufgabe",
      fallakteLabel: tasks ?? "Offene Praxisaufgabe",
      nextStep: "Aufgabe in Relay bearbeiten oder abschließen.",
      needsAttention: true,
    };
  }

  if (isTerminEmpfohlen(item)) {
    return {
      id: "termin_empfohlen",
      shortLabel: "Termin empfohlen",
      fallakteLabel: "Zeitnahe Einordnung empfohlen",
      nextStep: "Nach Sichtung Terminlink senden oder einplanen.",
      needsAttention: true,
    };
  }

  if (!item.seen_at && item.intake_channel === "patient_upload") {
    return {
      id: "neu",
      shortLabel: "Neu",
      fallakteLabel: "Neue Patientenanfrage",
      nextStep: "Anliegen und Bilder sichten.",
      needsAttention: true,
    };
  }

  if (isNachsorgeCase(item)) {
    const trail = photoTrailSummary(item);
    return {
      id: "in_bearbeitung",
      shortLabel: "Nachsorge",
      fallakteLabel: trail ? `Nachsorge · ${trail}` : "Nachsorge — Verlauf aktiv",
      nextStep: "Fotoverlauf sichten und nächsten Schritt festlegen.",
      needsAttention: Boolean(trail) || !item.seen_at,
    };
  }

  return {
    id: "in_bearbeitung",
    shortLabel: "In Bearbeitung",
    fallakteLabel: "Fall wird in der Praxis bearbeitet",
    nextStep: "Klinische Dokumentation sichten.",
    needsAttention: !item.seen_at,
  };
}

export type TrackerInboxTabCounts = Record<
  "new_submissions" | "follow_up" | "approval_pending",
  number
>;

export function buildTrackerInboxTabCounts(
  items: EnrichedSubmissionListItem[]
): TrackerInboxTabCounts {
  let newCount = 0;
  let followCount = 0;
  let approvalCount = 0;

  for (const item of items) {
    if (matchesTrackerFilter(item, "new_submissions")) newCount += 1;
    if (matchesTrackerFilter(item, "follow_up")) followCount += 1;
    if (
      isApprovalPending(item) ||
      item.message_draft_status === "draft"
    ) {
      approvalCount += 1;
    }
  }

  return {
    new_submissions: newCount,
    follow_up: followCount,
    approval_pending: approvalCount,
  };
}

export function buildTrackerInboxQueueLine(
  counts: TrackerInboxTabCounts
): string {
  const total = counts.new_submissions + counts.approval_pending;
  if (total === 0 && counts.follow_up === 0) {
    return "Keine offenen Entscheidungen";
  }

  const parts: string[] = [];
  if (counts.new_submissions > 0) {
    parts.push(
      counts.new_submissions === 1
        ? "1 neue Anfrage"
        : `${counts.new_submissions} neue Anfragen`
    );
  }
  if (counts.approval_pending > 0) {
    parts.push(
      counts.approval_pending === 1
        ? "1 Freigabe"
        : `${counts.approval_pending} Freigaben`
    );
  }
  if (counts.follow_up > 0) {
    parts.push(
      counts.follow_up === 1
        ? "1 Nachsorge"
        : `${counts.follow_up} Nachsorgen`
    );
  }

  return parts.join(" · ");
}

export function matchesTriageInboxTab(
  item: EnrichedSubmissionListItem,
  filter: TrackerInboxFilter
): boolean {
  if (filter === "approval_pending") {
    return (
      isApprovalPending(item) || item.message_draft_status === "draft"
    );
  }
  return matchesTrackerFilter(item, filter);
}

/** Empfehlungstext für den Praxis-Assistenten (KI-Vorbereitung, Supabase-basiert). */
export function buildYdAssistentRecommendation(
  item: EnrichedSubmissionListItem,
  kiLines: string[]
): string {
  const parts = [...kiLines];

  const trail = photoTrailSummary(item);
  if (trail && !parts.some((p) => p.includes("Verlauf") || p.includes("Foto"))) {
    parts.push(trail);
  }

  if (item.open_task_count > 0) {
    parts.push(openTasksHintLabel(item.open_task_count) ?? "Praxisaufgabe offen");
  }

  if (isTerminEmpfohlen(item) && !parts.some((p) => p.toLowerCase().includes("termin"))) {
    parts.push("Termin in dieser Woche sinnvoll.");
  }

  return parts.slice(0, 3).join(" ");
}
