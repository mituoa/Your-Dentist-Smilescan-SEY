import "server-only";

import { revalidatePath } from "next/cache";

import { createRelayMessageFromCommand } from "@/lib/command-ai/create-relay-message-from-command";
import type { CommandAiAssistantAction } from "@/lib/command-ai/command-ai-chat-types";
import { updateSubmissionPracticeStatus } from "@/app/(protected)/inbox/[id]/actions";
import { sendPatientOutboundMessage } from "@/lib/outbound-messages/send-to-patient";
import { persistCommandMessageDraftBody } from "@/lib/command-ai/persist-command-message-draft";
import type { PracticeStatusId } from "@/lib/practice-status";

export type CommandAiExecutedAction = {
  type: CommandAiAssistantAction["type"];
  ok: boolean;
  message: string;
  href?: string;
};

export type CommandAiExecuteActionsResult = {
  executed: CommandAiExecutedAction[];
  navigateHref: string | null;
};

const VALID_STATUS = new Set<string>([
  "new",
  "in_progress",
  "waiting_for_patient",
  "photo_requested",
  "watching",
  "resolved",
]);

function navigateHrefFor(
  target: NonNullable<CommandAiAssistantAction["navigate"]>,
  submissionId: string | null
): string {
  switch (target) {
    case "inbox_case":
      return submissionId ? `/inbox/${submissionId}` : "/inbox";
    case "inbox":
      return "/inbox";
    case "relay":
      return "/relay";
    case "relay_messages":
      return "/relay?panel=messages";
    case "journal":
      return "/journal";
    case "dashboard":
      return "/dashboard";
    case "settings":
      return "/settings";
    default:
      return "/dashboard";
  }
}

export async function executeCommandAiActions(input: {
  actions: CommandAiAssistantAction[];
  submissionId: string | null;
  patientDraft: string | null;
  taskTitle: string | null;
  taskNotes: string | null;
  relayMessage: string | null;
  autoExecute?: boolean;
}): Promise<CommandAiExecuteActionsResult> {
  const executed: CommandAiExecutedAction[] = [];
  let navigateHref: string | null = null;

  if (!input.autoExecute) {
    return { executed, navigateHref };
  }

  for (const action of input.actions) {
    if (action.type === "navigate" && action.navigate) {
      const href = navigateHrefFor(action.navigate, input.submissionId);
      navigateHref = href;
      executed.push({ type: action.type, ok: true, message: "Navigation vorbereitet.", href });
      continue;
    }

    if (action.type === "set_status" && action.status && input.submissionId) {
      if (!VALID_STATUS.has(action.status)) {
        executed.push({ type: action.type, ok: false, message: "Unbekannter Status." });
        continue;
      }
      const result = await updateSubmissionPracticeStatus(
        input.submissionId,
        action.status as PracticeStatusId
      );
      const ok = "success" in result && result.success === true;
      executed.push({
        type: action.type,
        ok,
        message: ok ? "Status aktualisiert." : ("error" in result ? result.error : "Fehler.") ?? "Fehler.",
        href: `/inbox/${input.submissionId}`,
      });
      continue;
    }

    if (action.type === "relay_message") {
      const body = (action.relayBody ?? input.relayMessage ?? "").trim();
      if (!body) {
        executed.push({ type: action.type, ok: false, message: "Keine Nachricht angegeben." });
        continue;
      }
      const result = await createRelayMessageFromCommand({
        rawText: body,
        submissionId: input.submissionId,
      });
      executed.push({
        type: action.type,
        ok: result.ok,
        message: result.ok ? result.message : result.error,
        href: result.ok
          ? `/relay?panel=messages&conversation=${result.conversationId}`
          : undefined,
      });
      continue;
    }

    if (action.type === "open_draft" && input.patientDraft && input.submissionId) {
      const result = await persistCommandMessageDraftBody({
        submissionId: input.submissionId,
        body: input.patientDraft,
      });
      if (result.ok) {
        revalidatePath(`/inbox/${input.submissionId}`);
      }
      executed.push({
        type: action.type,
        ok: result.ok,
        message: result.ok ? "Entwurf gespeichert." : result.error,
        href: `/inbox/${input.submissionId}#tracker-kommunikation`,
      });
      continue;
    }

    if (action.type === "send_patient" && input.submissionId) {
      const body = (action.sendBody ?? input.patientDraft ?? "").trim();
      if (!body) {
        executed.push({ type: action.type, ok: false, message: "Kein Versandtext." });
        continue;
      }
      const result = await sendPatientOutboundMessage({
        submissionId: input.submissionId,
        body,
        messageKind: action.sendKind ?? "reply",
        includeAppointmentLink: action.includeAppointmentLink ?? false,
      });
      executed.push({
        type: action.type,
        ok: result.ok,
        message: result.ok ? "Nachricht versendet." : result.error,
        href: `/inbox/${input.submissionId}`,
      });
    }
  }

  return { executed, navigateHref };
}
