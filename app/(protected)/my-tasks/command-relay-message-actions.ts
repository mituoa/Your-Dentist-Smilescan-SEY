"use server";

import { revalidatePath } from "next/cache";

import { createRelayMessageFromCommand } from "@/lib/command-ai/create-relay-message-from-command";
import { isRelayInternalMessageCommand } from "@/lib/command-ai/relay-message-intent";
import { resolveCommandIntent } from "@/lib/command-ai/intent-resolver";
import { getCurrentWorkspace } from "@/lib/auth-helpers";
import { getSubmissionById } from "@/lib/queries/submissions";

export type CommandRelayMessageResult =
  | { ok: true; conversationId: string; message: string; relayHref: string }
  | { ok: false; error: string };

export async function createRelayMessageFromCommandAction(input: {
  rawText: string;
  submissionId?: string | null;
}): Promise<CommandRelayMessageResult> {
  const workspace = await getCurrentWorkspace();
  if (!workspace) {
    return { ok: false, error: "Bitte erneut anmelden." };
  }

  const trimmed = input.rawText.trim();
  if (!trimmed) {
    return { ok: false, error: "Bitte formulieren Sie eine Nachricht." };
  }

  let submissionId = input.submissionId ?? null;
  if (submissionId) {
    const submission = await getSubmissionById(submissionId, workspace.workspace_id);
    if (!submission) {
      return { ok: false, error: "Dieser Fall ist in Ihrem Arbeitsbereich nicht verfügbar." };
    }
  }

  const activeCase = submissionId
    ? {
        submissionId,
        patientName: null as string | null,
        concernLine: null as string | null,
      }
    : null;

  const intent = resolveCommandIntent(trimmed, null, activeCase);
  if (intent.kind !== "relay_message" && !isRelayInternalMessageCommand(trimmed)) {
    return {
      ok: false,
      error: "Ich konnte daraus noch keine interne Nachricht erstellen.",
    };
  }

  const result = await createRelayMessageFromCommand({
    rawText: trimmed,
    submissionId,
  });

  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  revalidatePath("/relay");

  return {
    ok: true,
    conversationId: result.conversationId,
    message: result.message,
    relayHref: `/relay?panel=messages&conversation=${result.conversationId}`,
  };
}
