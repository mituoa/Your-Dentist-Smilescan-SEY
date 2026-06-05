import { deriveSubmissionIssueShortLine } from "@/lib/inbox/derive-submission-issue-short-line";

import { buildCommandMessageDraft } from "./build-command-message-draft";
import { resolveCommandReplyIntent } from "./reply-intent";
import { frameNextStep, frameSituation, frameSuggestion } from "./safety-copy";
import { dueDateForHint } from "./task-draft-bridge";
import { formatDueLabel, parseTaskFromVoice } from "./task-intent";
import type {
  CommandIntent,
  CommandRelayTaskDraft,
  CommandWorkspaceHints,
  PreparedWorkItem,
} from "./types";

function suggestNextStepFromNotes(notes: string | null): string {
  const t = (notes ?? "").toLowerCase();
  if (/schmerz|schwell|fieber|akut|notfall|dringend/.test(t)) {
    return "Termin diese Woche anbieten";
  }
  if (/implantat|prothese|kron/.test(t)) {
    return "Kontrolle und weiteres Vorgehen besprechen";
  }
  if (/kontrolle|prophylaxe|reinigung/.test(t)) {
    return "Routine-Termin anbieten";
  }
  return "Rückmeldung mit nächstem Praxisschritt senden";
}

function buildRelayTaskDraftFromIntent(intent: CommandIntent): CommandRelayTaskDraft {
  const parsed = parseTaskFromVoice(intent.rawText);
  const patientName = intent.patientName ?? parsed.patientHint;
  const notes = [
    patientName ? `Patient: ${patientName}` : null,
    parsed.assigneeHint ? `Team: ${parsed.assigneeHint}` : null,
    `Arzt-Notiz: ${parsed.rawSummary}`,
  ]
    .filter(Boolean)
    .join("\n");

  return {
    title: parsed.taskTitle,
    notes,
    dueDate: dueDateForHint(parsed.dueHint),
    assigneeHint: parsed.assigneeHint,
  };
}

function buildTeamHandoffTask(
  intent: CommandIntent,
  patientName: string,
  hints: CommandWorkspaceHints | null
): CommandRelayTaskDraft {
  const parsed = parseTaskFromVoice(intent.rawText);
  return {
    title: parsed.assigneeHint ? `Hinweis an ${parsed.assigneeHint}` : "Hinweis an Rezeption",
    notes: [
      `Patient: ${patientName}`,
      `Arzt-Notiz: ${intent.rawText}`,
      hints?.appointmentUrl ? `Terminlink: ${hints.appointmentUrl}` : null,
    ]
      .filter(Boolean)
      .join("\n"),
    dueDate: dueDateForHint(parsed.dueHint ?? "tomorrow"),
    assigneeHint: parsed.assigneeHint ?? "rezeption",
  };
}

function buildPatientMessageWork(
  intent: CommandIntent,
  hints: CommandWorkspaceHints | null
): PreparedWorkItem {
  const patient =
    hints?.patients.find((p) => p.submissionId === intent.submissionId) ??
    hints?.patients.find((p) => p.name === intent.patientName) ??
    null;

  const patientName = intent.patientName ?? patient?.name ?? "Patient";
  const concernLine = patient?.concernLine ?? null;
  const signals = {
    wantsPhoto: intent.messageSignals?.wantsPhoto ?? false,
    wantsAppointment: intent.messageSignals?.wantsAppointment ?? false,
    wantsThisWeek: intent.messageSignals?.wantsThisWeek ?? false,
    wantsToday: intent.messageSignals?.wantsToday ?? false,
    wantsRuckfrage: intent.messageSignals?.wantsRuckfrage ?? false,
    wantsWatch: intent.messageSignals?.wantsWatch ?? false,
    wantsTeamHandoff: intent.messageSignals?.wantsTeamHandoff ?? false,
    wantsCallback: intent.messageSignals?.wantsCallback ?? false,
    ruckfrageTopicId: intent.messageSignals?.ruckfrageTopicId ?? null,
  };

  const messageDraft = buildCommandMessageDraft({
    patientName,
    practicePhone: hints?.practicePhone ?? "",
    appointmentUrl: hints?.appointmentUrl ?? null,
    signals,
    replyIntent: resolveCommandReplyIntent(intent.rawText, signals),
  });

  const nextStep = suggestNextStepFromNotes(concernLine);
  const relayTaskDraft = signals.wantsTeamHandoff
    ? buildTeamHandoffTask(intent, patientName, hints)
    : null;

  return {
    id: `prep-${intent.submissionId ?? patientName}-${Date.now()}`,
    status: "ready_for_review",
    createdAt: new Date().toISOString(),
    intent,
    patientName,
    submissionId: intent.submissionId ?? patient?.submissionId ?? null,
    situationSummary: frameSituation(concernLine, patientName),
    suggestionSummary: frameSuggestion(
      relayTaskDraft
        ? `${nextStep} — zusätzlich Team-Hinweis in Relay vorbereitet.`
        : nextStep
    ),
    messageDraft,
    relayTaskDraft,
    checks: [
      { id: "context", label: "Fallkontext geladen", done: Boolean(intent.submissionId) },
      { id: "draft", label: "Antwortentwurf erstellt", done: true },
      {
        id: "photo",
        label: "Bildanforderung im Entwurf",
        done: signals.wantsPhoto,
      },
      {
        id: "link",
        label: "Terminlink vorbereitet",
        done: Boolean(hints?.appointmentUrl) && signals.wantsAppointment,
      },
      { id: "team", label: "Team-Hinweis vorbereitet", done: Boolean(relayTaskDraft) },
    ],
    actions: [
      {
        id: "send_message",
        kind: "send_message",
        label: "Nachricht prüfen",
        description: "Entwurf im Tracker — Versand erst nach Freigabe",
        enabled: true,
        href: intent.submissionId ? `/inbox/${intent.submissionId}#tracker-korrespondenz` : undefined,
      },
      {
        id: "appointment_link",
        kind: "add_appointment_link",
        label: "Terminlink prüfen",
        description: "Terminbereich im Fall öffnen",
        enabled: signals.wantsAppointment,
        href: intent.submissionId ? `/inbox/${intent.submissionId}#tracker-termin` : undefined,
      },
      {
        id: "create_task",
        kind: "create_task",
        label: "Relay-Aufgabe prüfen",
        description: "Interne Aufgabe anlegen oder zuweisen",
        enabled: Boolean(relayTaskDraft),
        href: "/relay",
      },
    ],
  };
}

function buildSummarizeInboxWork(
  intent: CommandIntent,
  hints: CommandWorkspaceHints | null
): PreparedWorkItem {
  const patients = hints?.patients ?? [];
  const unseen = patients.filter((p) => p.concernLine !== null);
  const count = patients.length;

  return {
    id: `prep-summarize-${Date.now()}`,
    status: "ready_for_review",
    createdAt: new Date().toISOString(),
    intent,
    patientName: null,
    submissionId: null,
    situationSummary: `${count} aktuelle Patientenfälle im Überblick.`,
    suggestionSummary: frameSuggestion(
      count > 0
        ? `${count} Zusammenfassungen und Entwürfe können zur Prüfung geöffnet werden.`
        : "Keine offenen Einsendungen — Posteingang ist auf dem aktuellen Stand."
    ),
    messageDraft: null,
    relayTaskDraft: null,
    checks: [
      { id: "reviewed", label: `${count} Fälle gesichtet`, done: count > 0 },
      { id: "summaries", label: "Zusammenfassungen erstellt", done: count > 0 },
      { id: "drafts", label: "Antwortentwürfe vorbereitet", done: unseen.length > 0 },
    ],
    actions: [
      {
        id: "open_inbox",
        kind: "navigate",
        label: "Posteingang öffnen",
        description: "Alle Fälle zur Freigabe prüfen",
        enabled: true,
        href: "/inbox",
      },
    ],
  };
}

function buildSummarizeDayWork(intent: CommandIntent): PreparedWorkItem {
  return {
    id: `prep-day-${Date.now()}`,
    status: "ready_for_review",
    createdAt: new Date().toISOString(),
    intent,
    patientName: null,
    submissionId: null,
    situationSummary: "Tagesüberblick für Ihre Praxis vorbereitet.",
    suggestionSummary: frameSuggestion(
      "Prioritäten: neue Einsendungen, vorbereitete Antworten, offene Teamaufgaben."
    ),
    messageDraft: null,
    relayTaskDraft: null,
    checks: [
      { id: "inbox", label: "Einsendungen geprüft", done: true },
      { id: "tasks", label: "Aufgaben eingeordnet", done: true },
    ],
    actions: [
      {
        id: "dashboard",
        kind: "navigate",
        label: "Atlas öffnen",
        description: "Überblick prüfen",
        enabled: true,
        href: "/dashboard",
      },
      {
        id: "relay",
        kind: "navigate",
        label: "Relay öffnen",
        description: "Teamaufgaben prüfen",
        enabled: true,
        href: "/relay",
      },
    ],
  };
}

function buildSummarizePatientWork(
  intent: CommandIntent,
  hints: CommandWorkspaceHints | null
): PreparedWorkItem {
  const patient =
    hints?.patients.find((p) => p.submissionId === intent.submissionId) ??
    hints?.patients.find((p) => p.name === intent.patientName) ??
    null;

  const patientName = intent.patientName ?? patient?.name ?? "Patient";
  const concernLine = patient?.concernLine ?? null;
  const nextStep = suggestNextStepFromNotes(concernLine);

  return {
    id: `prep-summary-${intent.submissionId ?? patientName}-${Date.now()}`,
    status: "ready_for_review",
    createdAt: new Date().toISOString(),
    intent,
    patientName,
    submissionId: intent.submissionId ?? patient?.submissionId ?? null,
    situationSummary: frameSituation(concernLine, patientName),
    suggestionSummary: frameSuggestion(nextStep),
    messageDraft: null,
    relayTaskDraft: null,
    checks: [
      { id: "timeline", label: "Verlauf zusammengefasst", done: Boolean(concernLine) },
      { id: "context", label: "Fallkontext geladen", done: Boolean(intent.submissionId) },
      { id: "next", label: "Nächster Schritt vorbereitet", done: true },
    ],
    actions: [
      {
        id: "open_case",
        kind: "navigate",
        label: "Fall öffnen",
        description: "Zusammenfassung im Tracker prüfen",
        enabled: Boolean(intent.submissionId),
        href: intent.submissionId ? `/inbox/${intent.submissionId}#tracker-assistenz` : "/inbox",
      },
    ],
  };
}

function buildCreateTaskWork(intent: CommandIntent): PreparedWorkItem {
  const parsed = parseTaskFromVoice(intent.rawText);
  const patientName = intent.patientName ?? parsed.patientHint;
  const dueLabel = formatDueLabel(parsed.dueHint);
  const assignee = parsed.assigneeHint
    ? parsed.assigneeHint.charAt(0).toUpperCase() + parsed.assigneeHint.slice(1)
    : null;

  const isCallNote = /anruf|telefon|telefonat|rückruf/.test(intent.rawText.toLowerCase());
  const relayTaskDraft = buildRelayTaskDraftFromIntent(intent);

  const situationSummary = parsed.isReminder
    ? "Erinnerung für das Praxisteam vorbereitet."
    : isCallNote
      ? "Telefonnotiz strukturiert — Follow-up vorbereitet."
      : "Aufgabe für das Praxisteam vorbereitet.";

  const draftLines = [
    `Aufgabe: ${parsed.taskTitle}`,
    patientName ? `Patient: ${patientName}` : null,
    assignee ? `Zugewiesen: ${assignee}` : null,
    `Fällig: ${dueLabel}`,
    parsed.rawSummary ? `Notiz: ${parsed.rawSummary}` : null,
  ].filter(Boolean);

  return {
    id: `prep-task-${Date.now()}`,
    status: "ready_for_review",
    createdAt: new Date().toISOString(),
    intent,
    patientName,
    submissionId: intent.submissionId,
    situationSummary,
    suggestionSummary: frameSuggestion("Entwurf in Relay prüfen und zuweisen."),
    messageDraft: draftLines.join("\n"),
    relayTaskDraft,
    checks: [
      { id: "task_draft", label: "Aufgabenentwurf erstellt", done: true },
      { id: "due", label: `Fälligkeit: ${dueLabel}`, done: Boolean(parsed.dueHint) },
      ...(isCallNote
        ? [
            { id: "case_note", label: "Patientennotiz vorbereitet", done: true },
            { id: "followup", label: "Follow-up erkannt", done: true },
          ]
        : []),
    ],
    actions: [
      {
        id: "relay",
        kind: "create_task",
        label: "In Relay anlegen",
        description: "Vorbefüllte Aufgabe prüfen und speichern",
        enabled: true,
        href: "/relay",
      },
    ],
  };
}

/** Deterministic preparation — replace internals with LLM while keeping PreparedWorkItem contract. */
export function prepareWorkFromIntent(
  intent: CommandIntent,
  hints: CommandWorkspaceHints | null
): PreparedWorkItem | null {
  switch (intent.kind) {
    case "patient_message":
      if (/fasse|zusammenfass/.test(intent.rawText.toLowerCase()) && (intent.patientName || intent.submissionId)) {
        return buildSummarizePatientWork(intent, hints);
      }
      if (!intent.patientName && !intent.submissionId) return null;
      return buildPatientMessageWork(intent, hints);
    case "summarize_inbox":
      return buildSummarizeInboxWork(intent, hints);
    case "summarize_day":
      return buildSummarizeDayWork(intent);
    case "create_task":
      return buildCreateTaskWork(intent);
    case "recall_patients":
      return {
        ...buildCreateTaskWork({ ...intent, kind: "create_task" }),
        situationSummary: "Recall für relevante Patientengruppe vorbereitet.",
        suggestionSummary: frameSuggestion("Erinnerungen und Nachrichten warten auf Ihre Freigabe."),
        checks: [
          { id: "identify", label: "Relevante Fälle identifiziert", done: true },
          { id: "reminders", label: "Erinnerungen vorbereitet", done: true },
        ],
        actions: [
          {
            id: "relay_recall",
            kind: "create_reminder",
            label: "In Relay prüfen",
            description: "Recall-Aufgaben freigeben",
            enabled: true,
            href: "/relay",
          },
        ],
      };
    default:
      return null;
  }
}

export function buildConcernLine(
  patientNotes: string | null,
  patientName: string | null
): string | null {
  const line = deriveSubmissionIssueShortLine(patientNotes, patientName, {
    maxLen: 120,
    emptyLabel: "",
  });
  return line.trim() || null;
}

export { suggestNextStepFromNotes, frameNextStep };
