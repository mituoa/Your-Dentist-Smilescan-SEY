import "server-only";

import { buildCommandTaskPlan } from "@/lib/command-ai/build-command-task";
import {
  getCommandAssignableMembers,
  resolvePersonAssignee,
} from "@/lib/command-ai/task-assignee-resolve";
import { parseTaskFromVoice } from "@/lib/command-ai/task-intent";
import { getCurrentUser, getCurrentWorkspace } from "@/lib/auth-helpers";
import { createClient } from "@/lib/supabase/server";

export type CreateCommandTaskResult =
  | {
      ok: true;
      taskId: string;
      assignmentUnclear: boolean;
      successMessage: string;
    }
  | { ok: false; error: string };

function logTaskFailure(scope: string, err: unknown) {
  const row = err as { code?: string; message?: string };
  const code =
    typeof row?.code === "string" && row.code.trim() !== "" ? row.code : "unknown";
  console.error(`[command-task] ${scope} code=${code}`);
}

async function insertCommandTask(input: {
  workspaceId: string;
  userId: string;
  submissionId: string | null;
  rawText: string;
  patientName: string | null;
  patientNotes: string | null;
}): Promise<CreateCommandTaskResult> {
  const trimmed = input.rawText.trim();
  if (!trimmed) {
    return { ok: false, error: "Ich konnte daraus noch keine Aufgabe erstellen." };
  }

  const supabase = await createClient();
  const workspaceId = input.workspaceId;

  if (input.submissionId) {
    const { data: ownedSubmission, error: submissionError } = await supabase
      .from("submissions")
      .select("id")
      .eq("id", input.submissionId)
      .eq("workspace_id", workspaceId)
      .maybeSingle();

    if (submissionError || !ownedSubmission) {
      return { ok: false, error: "Dieser Fall ist in Ihrem Arbeitsbereich nicht verfügbar." };
    }
  }

  const members = await getCommandAssignableMembers(workspaceId);
  const parsed = parseTaskFromVoice(trimmed);
  const delegationMatch = trimmed.match(/^([A-Za-zÄÖÜ][\wäöüßÄÖÜ-]*)\s+(soll|bitte)\s+/i);
  const assigneeHint =
    delegationMatch?.[1]?.toLowerCase() ?? parsed.assigneeHint;
  const personResolution = resolvePersonAssignee(assigneeHint, members);

  const plan = buildCommandTaskPlan({
    rawText: trimmed,
    patientName: input.patientName,
    patientNotes: input.patientNotes,
    personResolution,
  });

  const sortOrder = Date.now();
  const { data: inserted, error } = await supabase
    .from("tasks")
    .insert({
      workspace_id: workspaceId,
      submission_id: input.submissionId,
      title: plan.title,
      content: plan.content,
      description: plan.content,
      priority: plan.priority,
      recipient_type: plan.recipient.recipientType,
      specific_recipient_id:
        plan.recipient.recipientType === "specific_person"
          ? plan.recipient.assigneeUserIds[0] ?? null
          : null,
      created_by: input.userId,
      status: "open",
      sort_order: sortOrder,
      due_date: plan.dueDateIso,
    })
    .select("id")
    .single();

  if (error || !inserted?.id) {
    logTaskFailure("insert", error);
    return {
      ok: false,
      error: "Aufgabe konnte nicht erstellt werden. Bitte erneut versuchen.",
    };
  }

  const taskId = inserted.id as string;

  if (
    plan.recipient.recipientType === "specific_person" &&
    plan.recipient.assigneeUserIds.length > 0
  ) {
    const assigneeRows = plan.recipient.assigneeUserIds.map((userId) => ({
      task_id: taskId,
      user_id: userId,
    }));
    const { error: assigneeError } = await supabase
      .from("task_assignees")
      .insert(assigneeRows);

    if (assigneeError) {
      logTaskFailure("assignees", assigneeError);
      await supabase.from("tasks").delete().eq("id", taskId);
      return {
        ok: false,
        error: "Aufgabe konnte nicht erstellt werden. Bitte erneut versuchen.",
      };
    }
  }

  const successMessage = plan.assignmentUnclear
    ? "Aufgabe erstellt. Zuweisung bitte prüfen."
    : "Aufgabe erstellt.";

  return {
    ok: true,
    taskId,
    assignmentUnclear: plan.assignmentUnclear,
    successMessage,
  };
}

export async function createCommandTaskForSubmission(input: {
  submissionId: string;
  rawText: string;
  patientName: string | null;
  patientNotes: string | null;
}): Promise<CreateCommandTaskResult> {
  const user = await getCurrentUser();
  const workspace = await getCurrentWorkspace();
  if (!user || !workspace) {
    return { ok: false, error: "Bitte erneut anmelden." };
  }

  return insertCommandTask({
    workspaceId: workspace.workspace_id,
    userId: user.id,
    submissionId: input.submissionId,
    rawText: input.rawText,
    patientName: input.patientName,
    patientNotes: input.patientNotes,
  });
}

/** Relay-Aufgabe ohne geöffneten Fall (z. B. Command auf /relay). */
export async function createCommandTaskForWorkspace(input: {
  rawText: string;
}): Promise<CreateCommandTaskResult> {
  const user = await getCurrentUser();
  const workspace = await getCurrentWorkspace();
  if (!user || !workspace) {
    return { ok: false, error: "Bitte erneut anmelden." };
  }

  return insertCommandTask({
    workspaceId: workspace.workspace_id,
    userId: user.id,
    submissionId: null,
    rawText: input.rawText,
    patientName: null,
    patientNotes: null,
  });
}
