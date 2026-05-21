"use server";

import { revalidatePath } from "next/cache";

import { getWorkspaceMembershipForUserId } from "@/lib/auth-helpers";
import { getAppBaseUrl } from "@/lib/env";
import {
  buildTaskAssigned,
  buildTaskApproved,
  buildTaskComment,
  buildTaskRejected,
  buildTaskSubmittedForReview,
} from "@/lib/mail/task-notifications";
import { sendTransactionalMailBestEffort } from "@/lib/mail/send-mail-best-effort";
import { createAdminClient } from "@/lib/supabase/admin";
import type { MyTask } from "@/lib/queries/my-tasks";
import type { AssignableMember } from "@/lib/queries/team-members";
import { getAssignableWorkspaceMembers } from "@/lib/queries/team-members";
import { createClient } from "@/lib/supabase/server";
import type { User } from "@supabase/supabase-js";
import { upsertTaskReceipts } from "@/lib/tasks/receipts";
import { resolveTaskDisplayTitle } from "@/lib/tasks/title";
import {
  computeRemindAt,
  parseRecurrenceType,
  parseRemindBefore,
} from "@/lib/tasks/recurrence";
import { maybeSpawnNextRecurrence } from "@/lib/tasks/spawn-recurrence";
import {
  canMoveTask,
  columnToTaskStatus,
  type BoardColumnId,
  taskStatusToColumn,
} from "@/lib/tasks/workflow-rules";

async function getUserEmail(userId: string): Promise<string | null> {
  const admin = createAdminClient();
  const { data } = await admin.auth.admin.getUserById(userId);
  return data?.user?.email || null;
}

async function getWorkspaceDoctorEmails(workspaceId: string): Promise<string[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("workspace_members")
    .select("user_id")
    .eq("workspace_id", workspaceId)
    .eq("role", "doctor");

  const emails: string[] = [];
  for (const m of data || []) {
    const e = await getUserEmail(m.user_id);
    if (e) emails.push(e);
  }
  return emails;
}

/** Admin-Client: Task **nur** mit `workspaceId` laden — keine Audience-Ermittlung über nackte `task_id`. */
async function getTaskAudienceEmails(
  taskId: string,
  workspaceId: string,
  excludeUserId?: string
): Promise<string[]> {
  const admin = createAdminClient();
  const { data: task } = await admin
    .from("tasks")
    .select(
      "workspace_id, recipient_type, specific_recipient_id, created_by"
    )
    .eq("id", taskId)
    .eq("workspace_id", workspaceId)
    .single();

  if (!task) return [];

  const userIds = new Set<string>();
  userIds.add(task.created_by);
  if (task.recipient_type === "specific_person") {
    if (task.specific_recipient_id) {
      userIds.add(task.specific_recipient_id);
    }
    const { data: assignees } = await admin
      .from("task_assignees")
      .select("user_id")
      .eq("task_id", taskId);
    for (const assignee of assignees || []) {
      userIds.add(assignee.user_id);
    }
  } else if (task.recipient_type === "all_team") {
    const { data: members } = await admin
      .from("workspace_members")
      .select("user_id")
      .eq("workspace_id", task.workspace_id);
    for (const m of members || []) userIds.add(m.user_id);
  } else if (task.recipient_type === "doctor_only") {
    const { data: members } = await admin
      .from("workspace_members")
      .select("user_id")
      .eq("workspace_id", task.workspace_id)
      .eq("role", "doctor");
    for (const m of members || []) userIds.add(m.user_id);
  }

  if (excludeUserId) userIds.delete(excludeUserId);

  const emails: string[] = [];
  for (const id of userIds) {
    const e = await getUserEmail(id);
    if (e) emails.push(e);
  }
  return emails;
}

type WorkspaceMembership = NonNullable<
  Awaited<ReturnType<typeof getWorkspaceMembershipForUserId>>
>;

/**
 * Session + Arbeitsbereich für Server-Actions: zuerst Anmeldung, dann Mitgliedschaft — gleiche Semantik für
 * Relay-relevante Pfade (Quick-Create, DnD, Reihenfolge). **Punkt 3:** kein Schreibzugriff ohne `workspace_id`
 * aus dieser Mitgliedschaft. **Punkt 10:** gleiche Workspace-Session wie `loadRelayWorkspaceData` / RSC — kein
 * clientgewähltes `workspace_id` aus Formularen. **Detailroute:** `addTaskComment` / Audience-Ermittlung nur mit
 * workspace-gebundener Task-Zeile (`getTaskAudienceEmails`).
 */
async function resolveActorWorkspace(): Promise<
  | { ok: true; supabase: Awaited<ReturnType<typeof createClient>>; user: User; workspace: WorkspaceMembership }
  | { ok: false; error: { error: string } }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: { error: "Nicht angemeldet." } };
  const workspace = await getWorkspaceMembershipForUserId(user.id, supabase);
  if (!workspace) return { ok: false, error: { error: "Arbeitsbereich nicht gefunden." } };
  return { ok: true, supabase, user, workspace };
}

/** Mitgliederliste für das Modal „Neue Aufgabe“ (geschützter Arbeitsbereich). */
export async function fetchAssignableMembersForTaskCreate(): Promise<
  { ok: true; members: AssignableMember[] } | { ok: false; error: string }
> {
  const actor = await resolveActorWorkspace();
  if (!actor.ok) return { ok: false, error: actor.error.error };
  const members = await getAssignableWorkspaceMembers(
    actor.workspace.workspace_id,
    actor.user.id
  );
  return { ok: true, members };
}

export async function createMyTask(formData: FormData): Promise<{
  error?: string;
  success?: boolean;
}> {
  const taskFormVariant = ((formData.get("task_form") as string) || "").trim();
  const isModalForm = taskFormVariant === "modal";

  const titleTrim = ((formData.get("title") as string) || "").trim();
  const contentField = ((formData.get("content") as string) || "").trim();
  const descriptionBody = ((formData.get("description") as string) || "").trim();
  const tagsRaw = ((formData.get("tags") as string) || "").trim();
  const dueDateRaw = ((formData.get("due_date") as string) || "").trim();
  const priorityLevel = ((formData.get("priority_level") as string) || "").toLowerCase();

  const tagParts = tagsRaw
    .split(/[,;]+/)
    .map((t) => t.trim())
    .filter(Boolean);
  let descriptionForRow: string | null = descriptionBody || null;
  if (tagParts.length > 0) {
    const tagLine = `Tags: ${tagParts.join(", ")}`;
    descriptionForRow = descriptionForRow ? `${descriptionForRow}\n\n${tagLine}` : tagLine;
  }

  let dueDateIso: string | null = null;
  if (dueDateRaw.length > 0) {
    const parsed = new Date(`${dueDateRaw}T12:00:00`);
    if (Number.isNaN(parsed.getTime())) {
      return { error: "Bitte prüfen Sie das Fälligkeitsdatum." };
    }
    dueDateIso = parsed.toISOString();
  }

  const legacyImportant = formData.get("is_important") === "true";
  const priority: "normal" | "important" =
    legacyImportant || priorityLevel === "high" ? "important" : "normal";

  const content =
    contentField.length > 0
      ? contentField
      : titleTrim.length > 0
        ? descriptionBody
          ? `${titleTrim}\n\n${descriptionBody}`
          : titleTrim
        : "";
  const assignAllTeam = formData.get("assign_all_team") === "true";
  const assignToMe = formData.get("assign_to_me") === "true";
  const specificRecipientId =
    (formData.get("specific_recipient_id") as string | null) || null;
  const specificRecipientIds = Array.from(
    new Set(
      formData
        .getAll("specific_recipient_ids[]")
        .map((value) => String(value).trim())
        .filter(Boolean)
    )
  );

  if (isModalForm && titleTrim.length === 0) {
    return { error: "Bitte geben Sie einen Titel ein." };
  }

  if (!content.trim()) {
    return { error: "Bitte geben Sie eine Aufgabe ein." };
  }

  const actor = await resolveActorWorkspace();
  if (!actor.ok) return actor.error;
  const { workspace, user, supabase } = actor;
  const sortOrder = Date.now();

  if (assignAllTeam && specificRecipientIds.length > 0) {
    return { error: "Bitte wählen Sie entweder alle Mitarbeitenden oder konkrete Personen." };
  }

  const recipientType = assignAllTeam ? "all_team" : "specific_person";

  if (
    !assignAllTeam &&
    !assignToMe &&
    specificRecipientIds.length === 0 &&
    (!specificRecipientId || specificRecipientId.trim().length === 0)
  ) {
    return { error: "Bitte wählen Sie einen Mitarbeitenden aus." };
  }

  const normalizedSpecificRecipientIds =
    !assignAllTeam
      ? specificRecipientIds.length > 0
        ? specificRecipientIds
        : specificRecipientId
          ? [specificRecipientId]
          : []
      : [];
  const finalSpecificRecipientIds = assignToMe
    ? Array.from(new Set([...normalizedSpecificRecipientIds, user.id]))
    : normalizedSpecificRecipientIds;

  if (recipientType === "specific_person" && finalSpecificRecipientIds.length > 0) {
    const { data: members, error: memberError } = await supabase
      .from("workspace_members")
      .select("user_id")
      .eq("workspace_id", workspace.workspace_id)
      .in("user_id", finalSpecificRecipientIds);
    if (memberError || !members || members.length !== finalSpecificRecipientIds.length) {
      return {
        error: "Ausgewählter Mitarbeitender ist in diesem Arbeitsbereich nicht verfügbar.",
      };
    }
  }

  const titleForInsert =
    titleTrim.length > 0
      ? titleTrim
      : content.trim().length > 120
        ? content.trim().slice(0, 120)
        : null;

  const recurrenceType = parseRecurrenceType(formData.get("recurrence_type") as string);
  const intervalRaw = ((formData.get("recurrence_interval_days") as string) || "").trim();
  const recurrenceIntervalDays =
    recurrenceType === "custom" && intervalRaw
      ? Math.min(365, Math.max(1, parseInt(intervalRaw, 10) || 0)) || null
      : null;
  if (recurrenceType === "custom" && !recurrenceIntervalDays) {
    return { error: "Bitte geben Sie für den eigenen Rhythmus die Anzahl Tage an." };
  }
  const remindSelf = formData.get("remind_self") === "true";
  const remindAssignees = formData.get("remind_assignees") === "true";
  const remindBefore = parseRemindBefore(formData.get("remind_before") as string);
  const dueForRemind = dueDateIso ? new Date(dueDateIso) : null;
  const remindAt = computeRemindAt(dueForRemind, remindBefore, remindSelf, remindAssignees);

  const { data: inserted, error } = await supabase
    .from("tasks")
    .insert({
      workspace_id: workspace.workspace_id,
      submission_id: null,
      title: titleForInsert,
      content: content.trim(),
      description: descriptionForRow,
      due_date: dueDateIso,
      priority,
      recipient_type: recipientType,
      specific_recipient_id:
        !assignAllTeam
          ? finalSpecificRecipientIds[0] || specificRecipientId || null
          : null,
      created_by: user.id,
      status: "open",
      sort_order: sortOrder,
      recurrence_type: recurrenceType,
      recurrence_interval_days: recurrenceIntervalDays,
      remind_self: remindSelf,
      remind_assignees: remindAssignees,
      remind_before: remindBefore,
      remind_at: remindAt,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[createMyTask]", (error as { code?: string }).code ?? "unknown");
    return { error: "Aufgabe konnte nicht erstellt werden. Bitte erneut versuchen." };
  }

  if (!assignAllTeam && finalSpecificRecipientIds.length > 0) {
    const assigneeRows = finalSpecificRecipientIds.map((id) => ({
      task_id: inserted.id,
      user_id: id,
    }));
    const { error: assigneeError } = await supabase
      .from("task_assignees")
      .insert(assigneeRows);
    if (assigneeError) {
      console.error("[createMyTask assignees]", (assigneeError as { code?: string }).code ?? "unknown");
      await supabase.from("tasks").delete().eq("id", inserted.id);
      return { error: "Aufgabe konnte nicht erstellt werden. Bitte erneut versuchen." };
    }
  }

  try {
    const admin = createAdminClient();
    const recipients: Array<{ userId: string; email: string }> = [];

    if (assignAllTeam) {
      const { data: members } = await admin
        .from("workspace_members")
        .select("user_id")
        .eq("workspace_id", workspace.workspace_id)
        .neq("user_id", user.id);
      for (const m of members || []) {
        const { data } = await admin.auth.admin.getUserById(m.user_id);
        if (data?.user?.email) recipients.push({ userId: m.user_id, email: data.user.email });
      }
    } else if (finalSpecificRecipientIds.length > 0) {
      for (const recipientId of finalSpecificRecipientIds) {
        const { data } = await admin.auth.admin.getUserById(recipientId);
        if (data?.user?.email && data.user.id !== user.id) {
          recipients.push({ userId: recipientId, email: data.user.email });
        }
      }
    }

    const dedupedRecipients = Array.from(
      new Map(recipients.map((recipient) => [recipient.userId, recipient])).values()
    );
    const receiptRows: Array<{ userId: string; email?: string | null; messageId?: string | null }> = [];
    if (dedupedRecipients.length > 0) {
      const taskUrl = `${getAppBaseUrl()}/my-tasks/${inserted.id}`;
      const mail = buildTaskAssigned({
        taskTitle: resolveTaskDisplayTitle(titleForInsert, content.trim()),
        taskUrl,
        actorName: user.email || "Team-Mitglied",
        recipientEmail: dedupedRecipients[0]?.email || "",
      });
      for (const recipient of dedupedRecipients) {
        const result = await sendTransactionalMailBestEffort(
          { to: recipient.email, subject: mail.subject, text: mail.text, html: mail.html },
          "task_assigned"
        );
        receiptRows.push({
          userId: recipient.userId,
          email: recipient.email,
          messageId: result.messageId ?? null,
        });
      }
    }
    if (!assignAllTeam) {
      const knownRecipientIds = new Set(receiptRows.map((row) => row.userId));
      for (const recipientId of finalSpecificRecipientIds) {
        if (!knownRecipientIds.has(recipientId)) {
          receiptRows.push({ userId: recipientId, email: null, messageId: null });
        }
      }
    }
    if (receiptRows.length > 0) {
      await upsertTaskReceipts(inserted.id, receiptRows);
    }
  } catch (mailError) {
    console.error(
      "[createMyTask mail]",
      mailError instanceof Error ? mailError.message : "unknown"
    );
  }

  revalidatePath("/my-tasks");
  revalidatePath("/relay");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function submitTaskForReview(
  taskId: string
): Promise<{ error?: string; success?: boolean }> {
  const actor = await resolveActorWorkspace();
  if (!actor.ok) return actor.error;
  const { supabase, user, workspace } = actor;

  const { data: task } = await supabase
    .from("tasks")
    .select("id, content, status, workspace_id, created_by")
    .eq("id", taskId)
    .eq("workspace_id", workspace.workspace_id)
    .single();

  if (!task) return { error: "Aufgabe nicht gefunden." };
  if (task.status !== "open") return { error: "Einreichung ist für den aktuellen Aufgabenstand nicht möglich." };

  const isDoctorSelfAssignment =
    workspace.role === "doctor" && task.created_by === user.id;

  const newStatus = isDoctorSelfAssignment ? "done" : "pending_review";
  const now = new Date().toISOString();
  const updates: Record<string, unknown> = {
    status: newStatus,
  };
  if (newStatus === "pending_review") {
    updates.submitted_for_review_at = now;
    updates.submitted_by_user_id = user.id;
  } else if (newStatus === "done") {
    updates.done_at = now;
    updates.done_by = user.id;
    updates.reviewed_by_user_id = user.id;
    updates.reviewed_at = now;
  }

  const { error } = await supabase
    .from("tasks")
    .update(updates)
    .eq("id", taskId)
    .eq("workspace_id", workspace.workspace_id);

  if (error) return { error: "Die Änderung konnte nicht gespeichert werden. Bitte erneut versuchen." };

  if (newStatus === "pending_review") {
    const actorEmail = user.email || "Team-Mitglied";
    const doctorEmails = await getWorkspaceDoctorEmails(workspace.workspace_id);
    const taskUrl = `${getAppBaseUrl()}/my-tasks/${taskId}`;
    const mail = buildTaskSubmittedForReview({
      taskTitle: task.content,
      taskUrl,
      actorName: actorEmail,
      recipientEmail: doctorEmails[0] || "",
    });

    for (const to of doctorEmails) {
      await sendTransactionalMailBestEffort(
        { to, subject: mail.subject, text: mail.text, html: mail.html },
        "task_submitted_for_review"
      );
    }
  }

  if (newStatus === "done") {
    await maybeSpawnNextRecurrence(supabase, taskId, workspace.workspace_id);
  }

  revalidatePath("/my-tasks");
  revalidatePath("/relay");
  revalidatePath(`/my-tasks/${taskId}`);
  revalidatePath("/inbox");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function moveTaskStatusByDrag(
  taskId: string,
  toColumn: BoardColumnId
): Promise<{ success?: boolean; error?: string; notAllowed?: boolean }> {
  const actor = await resolveActorWorkspace();
  if (!actor.ok) return actor.error;
  const { workspace, user, supabase } = actor;

  const { data: task } = await supabase
    .from("tasks")
    .select(
      "id, workspace_id, status, created_by, submission_id, recipient_type, specific_recipient_id, task_assignees(user_id)"
    )
    .eq("id", taskId)
    .eq("workspace_id", workspace.workspace_id)
    .single();
  if (!task) return { error: "Aufgabe nicht gefunden." };

  const currentColumn = taskStatusToColumn(task.status as "open" | "pending_review" | "done");
  const assigneeIds = ((task.task_assignees as Array<{ user_id: string }> | null) || [])
    .map((entry) => entry.user_id)
    .filter((id): id is string => Boolean(id));
  const ruleTask: MyTask = {
    id: task.id,
    title: "",
    raw_title: null,
    description: null,
    due_date: null,
    priority: "normal",
    recipient_type: task.recipient_type as MyTask["recipient_type"],
    specific_recipient_id: (task.specific_recipient_id as string | null) ?? null,
    assignee_ids: assigneeIds,
    created_by: task.created_by as string,
    status: task.status as MyTask["status"],
    done_at: null,
    submitted_for_review_at: null,
    sort_order: 0,
    completed: false,
    created_at: "",
    submission_id: (task.submission_id as string | null) ?? null,
    submission_patient_name: null,
    submission_created_at: null,
    delivery_status: "none",
    receipt_summary: { total: 0, sent: 0, delivered: 0, read: 0 },
  };

  const allowed = canMoveTask(ruleTask, currentColumn, toColumn, {
    currentUserId: user.id,
    isDoctor: workspace.role === "doctor",
  });
  if (!allowed) return { notAllowed: true };
  if (currentColumn === toColumn) return { success: true };

  const now = new Date().toISOString();
  const nextStatus = columnToTaskStatus(toColumn);
  const updates: Record<string, unknown> = {
    status: nextStatus,
  };
  if (nextStatus === "pending_review") {
    updates.submitted_for_review_at = now;
    updates.submitted_by_user_id = user.id;
    updates.done_at = null;
    updates.done_by = null;
  } else if (nextStatus === "done") {
    updates.done_at = now;
    updates.done_by = user.id;
    if (currentColumn === "pending") {
      updates.reviewed_at = now;
      updates.reviewed_by_user_id = user.id;
    }
  }

  const { error } = await supabase
    .from("tasks")
    .update(updates)
    .eq("id", taskId)
    .eq("workspace_id", workspace.workspace_id);
  if (error) {
    console.error("[moveTaskStatusByDrag]", (error as { code?: string }).code ?? "unknown");
    return { error: "Die Aufgabe konnte nicht verschoben werden. Bitte versuchen Sie es erneut." };
  }

  if (nextStatus === "done") {
    await maybeSpawnNextRecurrence(supabase, taskId, workspace.workspace_id);
  }

  revalidatePath("/my-tasks");
  revalidatePath("/relay");
  revalidatePath(`/my-tasks/${taskId}`);
  revalidatePath("/dashboard");
  return { success: true };
}

export async function reorderTasksInColumn(
  column: BoardColumnId,
  orderedTaskIds: string[]
): Promise<{ success?: boolean; error?: string }> {
  const actor = await resolveActorWorkspace();
  if (!actor.ok) return actor.error;
  const { workspace, supabase } = actor;

  const status = columnToTaskStatus(column);
  const { data: existing, error: fetchError } = await supabase
    .from("tasks")
    .select("id")
    .eq("workspace_id", workspace.workspace_id)
    .eq("status", status)
    .in("id", orderedTaskIds);
  if (fetchError) return { error: "Reihenfolge konnte nicht gespeichert werden." };
  if ((existing || []).length !== orderedTaskIds.length)
    return { error: "Die Reihenfolge konnte nicht übernommen werden." };

  const base = Date.now();
  for (let i = 0; i < orderedTaskIds.length; i += 1) {
    const id = orderedTaskIds[i];
    const { error } = await supabase
      .from("tasks")
      .update({ sort_order: base + i })
      .eq("id", id)
      .eq("workspace_id", workspace.workspace_id);
    if (error) {
      console.error("[reorderTasksInColumn]", (error as { code?: string }).code ?? "unknown");
      return { error: "Reihenfolge konnte nicht gespeichert werden." };
    }
  }

  revalidatePath("/my-tasks");
  revalidatePath("/relay");
  return { success: true };
}

export async function approveTask(
  taskId: string
): Promise<{ error?: string; success?: boolean }> {
  const actor = await resolveActorWorkspace();
  if (!actor.ok) return actor.error;
  const { workspace, user, supabase } = actor;
  if (workspace.role !== "doctor") return { error: "Dieser Schritt ist für Ihre Rolle nicht vorgesehen." };

  const { data: task } = await supabase
    .from("tasks")
    .select("id, content, status, workspace_id, submitted_by_user_id")
    .eq("id", taskId)
    .eq("workspace_id", workspace.workspace_id)
    .single();

  if (!task) return { error: "Aufgabe nicht gefunden." };
  if (task.status !== "pending_review") {
    return { error: "Die Aufgabe steht nicht zur ärztlichen Bestätigung aus." };
  }

  const now = new Date().toISOString();
  const { error } = await supabase
    .from("tasks")
    .update({
      status: "done",
      done_at: now,
      done_by: user.id,
      reviewed_at: now,
      reviewed_by_user_id: user.id,
    })
    .eq("id", taskId)
    .eq("workspace_id", workspace.workspace_id);

  if (error) return { error: "Die Bestätigung konnte nicht gespeichert werden. Bitte erneut versuchen." };

  if (task.submitted_by_user_id) {
    const submitterEmail = await getUserEmail(task.submitted_by_user_id);
    if (submitterEmail) {
      const taskUrl = `${getAppBaseUrl()}/my-tasks/${taskId}`;
      const mail = buildTaskApproved({
        taskTitle: task.content,
        taskUrl,
        actorName: user.email || "Arzt",
        recipientEmail: submitterEmail,
      });
      await sendTransactionalMailBestEffort(
        { to: submitterEmail, subject: mail.subject, text: mail.text, html: mail.html },
        "task_approved"
      );
    }
  }

  await maybeSpawnNextRecurrence(supabase, taskId, workspace.workspace_id);

  revalidatePath("/my-tasks");
  revalidatePath("/relay");
  revalidatePath(`/my-tasks/${taskId}`);
  revalidatePath("/inbox");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function rejectTask(
  taskId: string,
  reason: string
): Promise<{ error?: string; success?: boolean }> {
  const actor = await resolveActorWorkspace();
  if (!actor.ok) return actor.error;
  const { workspace, user, supabase } = actor;
  if (workspace.role !== "doctor") return { error: "Dieser Schritt ist für Ihre Rolle nicht vorgesehen." };

  if (!reason.trim()) return { error: "Bitte geben Sie eine Begründung ein." };

  const { data: task } = await supabase
    .from("tasks")
    .select("id, content, status, workspace_id, submitted_by_user_id")
    .eq("id", taskId)
    .eq("workspace_id", workspace.workspace_id)
    .single();

  if (!task) return { error: "Aufgabe nicht gefunden." };
  if (task.status !== "pending_review") {
    return { error: "Die Aufgabe steht nicht zur ärztlichen Bestätigung aus." };
  }

  const { error } = await supabase
    .from("tasks")
    .update({
      status: "open",
      submitted_for_review_at: null,
      submitted_by_user_id: null,
      rejection_reason: reason,
      reviewed_at: new Date().toISOString(),
      reviewed_by_user_id: user.id,
      done_at: null,
      done_by: null,
    })
    .eq("id", taskId)
    .eq("workspace_id", workspace.workspace_id);

  if (error) return { error: "Die Rückmeldung konnte nicht übernommen werden. Bitte erneut versuchen." };

  await supabase.from("task_comments").insert({
    task_id: taskId,
    author_id: user.id,
    content: `Aufgabe zurückgewiesen. Begründung: ${reason}`,
    is_system: true,
  });

  if (task.submitted_by_user_id) {
    const submitterEmail = await getUserEmail(task.submitted_by_user_id);
    if (submitterEmail) {
      const taskUrl = `${getAppBaseUrl()}/my-tasks/${taskId}`;
      const mail = buildTaskRejected({
        taskTitle: task.content,
        taskUrl,
        actorName: user.email || "Arzt",
        recipientEmail: submitterEmail,
        rejectionReason: reason,
      });
      await sendTransactionalMailBestEffort(
        { to: submitterEmail, subject: mail.subject, text: mail.text, html: mail.html },
        "task_rejected"
      );
    }
  }

  revalidatePath("/my-tasks");
  revalidatePath("/relay");
  revalidatePath(`/my-tasks/${taskId}`);
  revalidatePath("/inbox");
  revalidatePath("/dashboard");
  return { success: true };
}

/** Kommentar anlegen — Task muss im **aktuellen** Workspace liegen (Select + RLS); Audience nur workspace-gebunden (`getTaskAudienceEmails`). **Punkt 10:** kein clientgewähltes Workspace. */
export async function addTaskComment(
  taskId: string,
  content: string
): Promise<{ error?: string; success?: boolean }> {
  const actor = await resolveActorWorkspace();
  if (!actor.ok) return actor.error;
  const { workspace, user, supabase } = actor;

  const trimmed = content.trim();
  if (!trimmed) return { error: "Bitte geben Sie eine Notiz ein." };
  if (trimmed.length > 2000) return { error: "Die Notiz darf maximal 2000 Zeichen umfassen." };

  const { data: task } = await supabase
    .from("tasks")
    .select("id, content, workspace_id")
    .eq("id", taskId)
    .eq("workspace_id", workspace.workspace_id)
    .single();

  if (!task) return { error: "Aufgabe nicht gefunden." };

  const { error } = await supabase.from("task_comments").insert({
    task_id: taskId,
    author_id: user.id,
    content: trimmed,
    is_system: false,
  });

  if (error) return { error: "Die Notiz konnte nicht gespeichert werden. Bitte erneut versuchen." };

  const audience = await getTaskAudienceEmails(taskId, workspace.workspace_id, user.id);
  const taskUrl = `${getAppBaseUrl()}/my-tasks/${taskId}`;
  const mail = buildTaskComment({
    taskTitle: task.content,
    taskUrl,
    actorName: user.email || "Team-Mitglied",
    recipientEmail: audience[0] || "",
    commentText: trimmed,
  });

  for (const to of audience) {
    await sendTransactionalMailBestEffort(
      { to, subject: mail.subject, text: mail.text, html: mail.html },
      "task_comment"
    );
  }

  revalidatePath(`/my-tasks/${taskId}`);
  revalidatePath("/inbox");
  return { success: true };
}
