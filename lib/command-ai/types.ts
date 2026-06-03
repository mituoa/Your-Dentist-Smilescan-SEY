/**
 * Command AI — foundation types.
 * Intent → Prepare → Approve. No autonomous send; doctor always approves.
 */

export type CommandIntentKind =
  | "patient_message"
  | "summarize_inbox"
  | "summarize_day"
  | "create_task"
  | "recall_patients"
  | "navigate"
  | "unknown";

export type PreparedActionKind =
  | "send_message"
  | "add_appointment_link"
  | "create_task"
  | "create_reminder"
  | "navigate";

export type PreparedAction = {
  id: string;
  kind: PreparedActionKind;
  label: string;
  description: string;
  /** Default enabled in preview — doctor toggles before approve. */
  enabled: boolean;
  href?: string;
};

export type CommandMessageSignals = {
  wantsPhoto: boolean;
  wantsAppointment: boolean;
  wantsThisWeek: boolean;
  wantsTeamHandoff: boolean;
  wantsCallback?: boolean;
};

export type CommandRelayTaskDraft = {
  title: string;
  notes: string;
  dueDate: string | null;
  assigneeHint: string | null;
};

export type CommandIntent = {
  kind: CommandIntentKind;
  rawText: string;
  patientName: string | null;
  submissionId: string | null;
  confidence: "high" | "medium" | "low";
  messageSignals?: CommandMessageSignals;
};

export type PreparedWorkStatus = "draft" | "ready_for_review" | "approved" | "dismissed";

export type PreparedWorkItem = {
  id: string;
  status: PreparedWorkStatus;
  createdAt: string;
  intent: CommandIntent;
  patientName: string | null;
  submissionId: string | null;
  /** Clinical-safe framing — never a diagnosis. */
  situationSummary: string;
  suggestionSummary: string;
  messageDraft: string | null;
  relayTaskDraft: CommandRelayTaskDraft | null;
  actions: PreparedAction[];
  checks: { id: string; label: string; done: boolean }[];
};

export type CommandWorkspaceHints = {
  patients: { name: string; submissionId: string; concernLine: string | null }[];
  practicePhone: string | null;
  appointmentUrl: string | null;
};

export type SubmissionPreparationInput = {
  id: string;
  patient_name: string | null;
  patient_notes: string | null;
  seen_at: string | null;
  photo_count: number;
};

export type SubmissionPreparation = {
  submissionId: string;
  readyForReview: boolean;
  checks: { id: string; label: string; done: boolean }[];
  photoChecks: { id: string; label: string; done: boolean }[];
  suggestedNextStep: string;
  summaryLine: string | null;
  responseSummary: string | null;
};
