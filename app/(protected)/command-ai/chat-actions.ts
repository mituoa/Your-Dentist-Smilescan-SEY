"use server";

import { revalidatePath } from "next/cache";

import {
  COMMAND_AI_PATIENT_WELCOME_MESSAGE,
  COMMAND_AI_WELCOME_MESSAGE,
  runCommandAiChatTurn,
} from "@/lib/command-ai/gpt-practice-assistant";
import { isCommandAiGptEnabled } from "@/lib/command-ai/gpt-config";
import { persistCommandMessageDraftBody } from "@/lib/command-ai/persist-command-message-draft";
import { createRelayMessageFromCommand } from "@/lib/command-ai/create-relay-message-from-command";
import {
  createCommandTaskForSubmission,
  createCommandTaskForWorkspace,
} from "@/lib/command-ai/create-command-task";
import { executeCommandAiActions } from "@/lib/command-ai/execute-assistant-actions";
import {
  appendCommandAiMessage,
  getOrCreateCommandAiSession,
  isCommandAiPersistenceAvailable,
  loadCommandAiMessages,
} from "@/lib/command-ai/chat-persistence";
import type {
  CommandAiAssistantPayload,
  CommandAiChatContext,
  CommandAiChatResult,
  CommandAiChatTurn,
  CommandAiPersistedMessage,
  CommandAiPracticeStatusAction,
} from "@/lib/command-ai/command-ai-chat-types";
import { updateSubmissionPracticeStatus } from "@/app/(protected)/inbox/[id]/actions";
import { sendPatientOutboundMessage } from "@/lib/outbound-messages/send-to-patient";
import { getCurrentUser, getCurrentWorkspace } from "@/lib/auth-helpers";
import { getSubmissionById } from "@/lib/queries/submissions";
import type { PracticeStatusId } from "@/lib/practice-status";

export type CommandAiChatActionResult = CommandAiChatResult;

export async function sendCommandAiChat(input: {
  history: CommandAiChatTurn[];
  userMessage: string;
  context: CommandAiChatContext;
  sessionId?: string | null;
}): Promise<CommandAiChatActionResult> {
  const workspace = await getCurrentWorkspace();
  const user = await getCurrentUser();
  if (!workspace || !user) {
    return { ok: false, error: "Bitte erneut anmelden." };
  }

  const result = await runCommandAiChatTurn({
    ...input,
    workspaceId: workspace.workspace_id,
    audience: "practice",
  });

  if (!result.ok) return result;

  let sessionId = input.sessionId ?? null;
  if (await isCommandAiPersistenceAvailable()) {
    sessionId =
      (await getOrCreateCommandAiSession(
        {
          workspaceId: workspace.workspace_id,
          userId: user.id,
          submissionId: input.context.activeCase?.submissionId ?? null,
          audience: "practice",
        },
        sessionId
      )) ?? sessionId;

    if (sessionId) {
      await appendCommandAiMessage({
        sessionId,
        role: "user",
        content: input.userMessage.trim(),
      });
      await appendCommandAiMessage({
        sessionId,
        role: "assistant",
        content: result.assistant.reply,
        payload: result.assistant,
      });
    }
  }

  return { ...result, sessionId: sessionId ?? undefined };
}

export async function loadCommandAiChatHistory(input: {
  sessionId: string;
}): Promise<{ messages: CommandAiPersistedMessage[]; sessionId: string | null }> {
  const workspace = await getCurrentWorkspace();
  const user = await getCurrentUser();
  if (!workspace || !user) return { messages: [], sessionId: null };

  const messages = await loadCommandAiMessages(
    input.sessionId,
    workspace.workspace_id,
    user.id
  );
  return { messages, sessionId: input.sessionId };
}

export async function resolveCommandAiSession(input: {
  submissionId?: string | null;
  existingSessionId?: string | null;
}): Promise<string | null> {
  const workspace = await getCurrentWorkspace();
  const user = await getCurrentUser();
  if (!workspace || !user) return null;
  if (!(await isCommandAiPersistenceAvailable())) return null;

  return getOrCreateCommandAiSession(
    {
      workspaceId: workspace.workspace_id,
      userId: user.id,
      submissionId: input.submissionId ?? null,
      audience: "practice",
    },
    input.existingSessionId
  );
}

export async function getCommandAiWelcomeMessage(): Promise<string> {
  return COMMAND_AI_WELCOME_MESSAGE;
}

export async function getCommandAiGptStatus(): Promise<{ enabled: boolean; persistence: boolean }> {
  return {
    enabled: isCommandAiGptEnabled(),
    persistence: await isCommandAiPersistenceAvailable(),
  };
}

export type CommandAiApplyDraftResult =
  | { ok: true; body: string }
  | { ok: false; error: string };

export async function applyCommandAiPatientDraft(input: {
  submissionId: string;
  body: string;
}): Promise<CommandAiApplyDraftResult> {
  const workspace = await getCurrentWorkspace();
  if (!workspace) {
    return { ok: false, error: "Bitte erneut anmelden." };
  }

  const submission = await getSubmissionById(
    input.submissionId,
    workspace.workspace_id
  );
  if (!submission) {
    return { ok: false, error: "Dieser Fall ist in Ihrem Arbeitsbereich nicht verfügbar." };
  }

  const result = await persistCommandMessageDraftBody({
    submissionId: submission.id,
    body: input.body,
  });

  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  revalidatePath(`/inbox/${submission.id}`);
  return { ok: true, body: result.body };
}

export type CommandAiApplyTaskResult =
  | { ok: true; message: string; relayHref: string }
  | { ok: false; error: string };

export async function applyCommandAiTask(input: {
  submissionId: string | null;
  taskTitle: string;
  taskNotes: string | null;
}): Promise<CommandAiApplyTaskResult> {
  const workspace = await getCurrentWorkspace();
  if (!workspace) {
    return { ok: false, error: "Bitte erneut anmelden." };
  }

  const title = input.taskTitle.trim();
  if (!title) {
    return { ok: false, error: "Aufgabentitel fehlt." };
  }

  const rawText = input.taskNotes?.trim()
    ? `${title}\n\n${input.taskNotes.trim()}`
    : title;

  if (input.submissionId) {
    const submission = await getSubmissionById(
      input.submissionId,
      workspace.workspace_id
    );
    if (!submission) {
      return { ok: false, error: "Dieser Fall ist in Ihrem Arbeitsbereich nicht verfügbar." };
    }

    const created = await createCommandTaskForSubmission({
      submissionId: submission.id,
      rawText,
      patientName: submission.patient_name,
      patientNotes: submission.patient_notes,
    });

    if (!created.ok) {
      return { ok: false, error: created.error };
    }

    revalidatePath(`/inbox/${submission.id}`);
    revalidatePath("/relay");
    revalidatePath("/my-tasks");

    return {
      ok: true,
      message: created.successMessage,
      relayHref: `/relay?task=${created.taskId}`,
    };
  }

  const created = await createCommandTaskForWorkspace({ rawText });
  if (!created.ok) {
    return { ok: false, error: created.error };
  }

  revalidatePath("/relay");
  revalidatePath("/my-tasks");

  return {
    ok: true,
    message: created.successMessage,
    relayHref: `/relay?task=${created.taskId}`,
  };
}

export type CommandAiRelayResult =
  | { ok: true; message: string; relayHref: string }
  | { ok: false; error: string };

export async function applyCommandAiRelayMessage(input: {
  submissionId: string | null;
  body: string;
}): Promise<CommandAiRelayResult> {
  const workspace = await getCurrentWorkspace();
  if (!workspace) {
    return { ok: false, error: "Bitte erneut anmelden." };
  }

  const body = input.body.trim();
  if (!body) return { ok: false, error: "Nachricht fehlt." };

  const result = await createRelayMessageFromCommand({
    rawText: body,
    submissionId: input.submissionId,
  });

  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  revalidatePath("/relay");
  return {
    ok: true,
    message: result.message,
    relayHref: `/relay?panel=messages&conversation=${result.conversationId}`,
  };
}

export type CommandAiStatusResult =
  | { ok: true; message: string }
  | { ok: false; error: string };

export async function applyCommandAiStatus(input: {
  submissionId: string;
  status: CommandAiPracticeStatusAction;
}): Promise<CommandAiStatusResult> {
  const workspace = await getCurrentWorkspace();
  if (!workspace) {
    return { ok: false, error: "Bitte erneut anmelden." };
  }

  const result = await updateSubmissionPracticeStatus(
    input.submissionId,
    input.status as PracticeStatusId
  );

  if ("error" in result && result.error) {
    return { ok: false, error: result.error };
  }

  return { ok: true, message: "Status aktualisiert." };
}

export type CommandAiSendResult =
  | { ok: true; message: string }
  | { ok: false; error: string };

export async function applyCommandAiSendToPatient(input: {
  submissionId: string;
  body: string;
  messageKind?: "reply" | "question" | "photo_request" | "appointment_offer";
  includeAppointmentLink?: boolean;
}): Promise<CommandAiSendResult> {
  const workspace = await getCurrentWorkspace();
  if (!workspace) {
    return { ok: false, error: "Bitte erneut anmelden." };
  }

  const result = await sendPatientOutboundMessage({
    submissionId: input.submissionId,
    body: input.body,
    messageKind: input.messageKind ?? "reply",
    includeAppointmentLink: input.includeAppointmentLink ?? false,
  });

  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  revalidatePath(`/inbox/${input.submissionId}`);
  return { ok: true, message: "Nachricht an Patient:in versendet." };
}

export async function runCommandAiAutoActions(input: {
  submissionId: string | null;
  assistant: CommandAiAssistantPayload;
  autoExecute: boolean;
}): Promise<{
  executed: { type: string; ok: boolean; message: string; href?: string }[];
  navigateHref: string | null;
}> {
  const result = await executeCommandAiActions({
    actions: input.assistant.actions,
    submissionId: input.submissionId,
    patientDraft: input.assistant.patientDraft,
    taskTitle: input.assistant.taskTitle,
    taskNotes: input.assistant.taskNotes,
    relayMessage: input.assistant.relayMessage,
    autoExecute: input.autoExecute,
  });
  return result;
}

export { COMMAND_AI_PATIENT_WELCOME_MESSAGE };
