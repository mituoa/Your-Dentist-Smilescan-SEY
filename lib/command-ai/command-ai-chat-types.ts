export type CommandAiChatRole = "user" | "assistant";

export type CommandAiChatTurn = {
  role: CommandAiChatRole;
  content: string;
};

export type CommandAiAudience = "practice" | "patient";

export type CommandAiCaseContext = {
  submissionId: string;
  patientName: string | null;
  concernLine: string | null;
  urgency: string | null;
  practicePhone: string | null;
  appointmentUrl: string | null;
  practiceStatus?: string | null;
  photoCount?: number;
};

export type CommandAiWorkspaceZone =
  | "dashboard"
  | "inbox"
  | "relay"
  | "journal"
  | "settings"
  | "other";

export type CommandAiChatContext = {
  zone: CommandAiWorkspaceZone;
  activeCase: CommandAiCaseContext | null;
  workspaceId?: string;
  workspaceName?: string | null;
  publicSlug?: string | null;
};

export type CommandAiJournalSnippet = {
  id: string;
  title: string;
  excerpt: string | null;
  slug: string;
  publicUrl: string | null;
};

export type CommandAiRichContext = CommandAiChatContext & {
  audience: CommandAiAudience;
  patientNotesExcerpt: string | null;
  practiceStatus: string | null;
  practiceStatusLabel: string | null;
  photoCount: number;
  photoUrls: string[];
  openTaskCount: number | null;
  draftPreview: string | null;
  outboundSummary: string | null;
  journalSnippets: CommandAiJournalSnippet[];
  journalPromptBlock: string;
};

export type CommandAiPracticeStatusAction =
  | "new"
  | "in_progress"
  | "waiting_for_patient"
  | "photo_requested"
  | "watching"
  | "resolved";

export type CommandAiNavigateTarget =
  | "inbox"
  | "inbox_case"
  | "relay"
  | "relay_messages"
  | "journal"
  | "dashboard"
  | "settings";

export type CommandAiAssistantAction = {
  type:
    | "set_status"
    | "navigate"
    | "relay_message"
    | "send_patient"
    | "open_draft";
  status?: CommandAiPracticeStatusAction;
  navigate?: CommandAiNavigateTarget;
  relayBody?: string;
  sendBody?: string;
  sendKind?: "reply" | "question" | "photo_request" | "appointment_offer";
  includeAppointmentLink?: boolean;
};

export type CommandAiAssistantPayload = {
  reply: string;
  patientDraft: string | null;
  taskTitle: string | null;
  taskNotes: string | null;
  relayMessage: string | null;
  journalLinks: { title: string; url: string | null }[];
  actions: CommandAiAssistantAction[];
  suggestedNavigate: CommandAiNavigateTarget | null;
};

export type CommandAiChatResult =
  | {
      ok: true;
      assistant: CommandAiAssistantPayload;
      usedGpt: boolean;
      sessionId?: string;
    }
  | { ok: false; error: string };

export type CommandAiUiMessage = {
  id: string;
  role: CommandAiChatRole;
  content: string;
  patientDraft?: string | null;
  taskTitle?: string | null;
  taskNotes?: string | null;
  relayMessage?: string | null;
  journalLinks?: { title: string; url: string | null }[];
  actions?: CommandAiAssistantAction[];
  suggestedNavigate?: CommandAiNavigateTarget | null;
  pending?: boolean;
  streaming?: boolean;
};

export type CommandAiPersistedMessage = {
  id: string;
  role: CommandAiChatRole;
  content: string;
  payload: CommandAiAssistantPayload | null;
  createdAt: string;
};

export const COMMAND_AI_WELCOME_MESSAGE =
  "Guten Tag — ich bin Ihre Praxis-Assistenz. Ich sehe Ihre Fälle, Fotos und Praxiswissen, formuliere Entwürfe, setze Status, leite weiter und unterstütze Ihr Team. Nichts wird automatisch versendet.";

export const COMMAND_AI_PATIENT_WELCOME_MESSAGE =
  "Guten Tag — ich bin die digitale Assistenz Ihrer Zahnarztpraxis. Fragen Sie mich zu Abläufen, Terminen oder allgemeinen Hinweisen. Bei Beschwerden verweise ich Sie sicher an die Praxis — ich stelle keine Diagnosen.";

export const COMMAND_AI_ACTIONS_DELIMITER = "###ACTIONS###";
