"use server";

import { revalidatePath } from "next/cache";

import {
  createCommandTaskForSubmission,
  createCommandTaskForWorkspace,
} from "@/lib/command-ai/create-command-task";
import { isCommandTaskCommand } from "@/lib/command-ai/task-intent";
import { resolveCommandIntent } from "@/lib/command-ai/intent-resolver";
import { getCurrentWorkspace } from "@/lib/auth-helpers";
import { getSubmissionById } from "@/lib/queries/submissions";

export type CommandTaskCreateResult =
  | { ok: true; taskId: string; message: string; relayHref: string }
  | { ok: false; error: string };

function revalidateAfterTask(submissionId: string) {
  revalidatePath(`/inbox/${submissionId}`);
  revalidatePath("/relay");
  revalidatePath("/my-tasks");
}

/**
 * Command AI → Relay-Aufgabe am geöffneten Fall.
 * Keine Patientennachricht, keine Diagnose.
 */
export async function createTaskFromCommand(input: {
  submissionId: string;
  rawText: string;
}): Promise<CommandTaskCreateResult> {
  const workspace = await getCurrentWorkspace();
  if (!workspace) {
    return { ok: false, error: "Bitte erneut anmelden." };
  }

  const trimmed = input.rawText.trim();
  if (!trimmed) {
    return { ok: false, error: "Ich konnte daraus noch keine Aufgabe erstellen." };
  }

  const submission = await getSubmissionById(
    input.submissionId,
    workspace.workspace_id
  );
  if (!submission) {
    return { ok: false, error: "Dieser Fall ist in Ihrem Arbeitsbereich nicht verfügbar." };
  }

  const activeCase = {
    submissionId: submission.id,
    patientName: submission.patient_name,
    concernLine: submission.patient_notes,
  };

  const intent = resolveCommandIntent(trimmed, null, activeCase);

  if (intent.kind !== "create_task" && !isCommandTaskCommand(trimmed)) {
    return {
      ok: false,
      error: "Ich konnte daraus noch keine Aufgabe erstellen.",
    };
  }

  const result = await createCommandTaskForSubmission({
    submissionId: submission.id,
    rawText: trimmed,
    patientName: submission.patient_name,
    patientNotes: submission.patient_notes,
  });

  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  revalidateAfterTask(submission.id);

  return {
    ok: true,
    taskId: result.taskId,
    message: result.successMessage,
    relayHref: "/relay",
  };
}

/** Command → Relay-Aufgabe ohne geöffneten Fall (z. B. auf /relay). */
export async function createTaskFromCommandRelay(input: {
  rawText: string;
}): Promise<CommandTaskCreateResult> {
  const workspace = await getCurrentWorkspace();
  if (!workspace) {
    return { ok: false, error: "Bitte erneut anmelden." };
  }

  const trimmed = input.rawText.trim();
  if (!trimmed) {
    return { ok: false, error: "Ich konnte daraus noch keine Aufgabe erstellen." };
  }

  const intent = resolveCommandIntent(trimmed, null, null);
  if (intent.kind !== "create_task" && !isCommandTaskCommand(trimmed)) {
    return {
      ok: false,
      error: "Ich konnte daraus noch keine Aufgabe erstellen.",
    };
  }

  const result = await createCommandTaskForWorkspace({ rawText: trimmed });
  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  revalidatePath("/relay");
  revalidatePath("/my-tasks");

  return {
    ok: true,
    taskId: result.taskId,
    message: result.successMessage,
    relayHref: "/relay",
  };
}
