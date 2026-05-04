"use server";

import { revalidatePath } from "next/cache";

import { getCurrentWorkspace } from "@/lib/auth-helpers";
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
import { createClient } from "@/lib/supabase/server";
import { upsertTaskReceipts } from "@/lib/tasks/receipts";
import { resolveTaskDisplayTitle } from "@/lib/tasks/title";
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

async function getTaskAudienceEmails(
  taskId: string,
  excludeUserId?: string
): Promise<string[]> {
  const admin = createAdminClient();
  const { data: task } = await admin
    .from("tasks")
    .select(
      "workspace_id, recipient_type, specific_recipient_id, created_by"
    )
    .eq("id", taskId)
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

export async function createMyTask(formData: FormData): Promise<{
  error?: string;
  success?: boolean;
}> {
  const title = ((formData.get("title") as string) || "").trim();
  const content = (formData.get("content") as string) || "";
  const priority = formData.get("is_important") === "true" ? "important" : "normal";
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

  if (!content.trim()) {
    return { error: "Bitte geben Sie eine Aufgabe ein." };
  }

  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "Nicht angemeldet." };
  const sortOrder = Date.now();

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Nicht angemeldet." };
  if (assignAllTeam && specificRecipientIds.length > 0) {
    return { error: "Bitte wählen Sie entweder alle Mitarbeitenden oder konkrete Personen." };
  }

  const recipientType = assignAllTeam ? "all_team" : "specific_person";

  if (
    !assignAllTeam &&
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
      return { error: "Ausgewählter Mitarbeitender ist im Workspace nicht verfügbar." };
    }
  }

  const { data: inserted, error } = await supabase
    .from("tasks")
    .insert({
      workspace_id: workspace.workspace_id,
      submission_id: null,
      title: title.length > 0 ? title : null,
      content: content.trim(),
      priority,
      recipient_type: recipientType,
      specific_recipient_id:
        !assignAllTeam
          ? finalSpecificRecipientIds[0] || specificRecipientId || null
          : null,
      created_by: user.id,
      status: "open",
      sort_order: sortOrder,
    })
    .select("id")
    .single();

  if (error) {
    console.error("[createMyTask]", error);
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
      console.error("[createMyTask assignees]", assigneeError);
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
        taskTitle: resolveTaskDisplayTitle(title, content.trim()),
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
    console.error("[createMyTask mail]", mailError);
  }

  revalidatePath("/my-tasks");
  revalidatePath("/relay");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function submitTaskForReview(
  taskId: string
): Promise<{ error?: string; success?: boolean }> {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "Nicht angemeldet." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Nicht angemeldet." };

  const { data: task } = await supabase
    .from("tasks")
    .select("id, content, status, workspace_id, created_by")
    .eq("id", taskId)
    .eq("workspace_id", workspace.workspace_id)
    .single();

  if (!task) return { error: "Aufgabe nicht gefunden." };
  if (task.status !== "open") return { error: "Diese Aufgabe kann nicht eingereicht werden." };

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

  const { error } = await supabase.from("tasks").update(updates).eq("id", taskId);

  if (error) return { error: "Aktion fehlgeschlagen. Bitte erneut versuchen." };

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
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "Nicht angemeldet." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Nicht angemeldet." };

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

  const { error } = await supabase.from("tasks").update(updates).eq("id", taskId);
  if (error) {
    console.error("[moveTaskStatusByDrag]", error);
    return { error: "Statuswechsel fehlgeschlagen." };
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
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "Nicht angemeldet." };
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Nicht angemeldet." };
  if (orderedTaskIds.length === 0) return { success: true };

  const status = columnToTaskStatus(column);
  const { data: existing, error: fetchError } = await supabase
    .from("tasks")
    .select("id")
    .eq("workspace_id", workspace.workspace_id)
    .eq("status", status)
    .in("id", orderedTaskIds);
  if (fetchError) return { error: "Reihenfolge konnte nicht gespeichert werden." };
  if ((existing || []).length !== orderedTaskIds.length) return { error: "Ungültige Reihenfolge." };

  const base = Date.now();
  for (let i = 0; i < orderedTaskIds.length; i += 1) {
    const id = orderedTaskIds[i];
    const { error } = await supabase
      .from("tasks")
      .update({ sort_order: base + i })
      .eq("id", id)
      .eq("workspace_id", workspace.workspace_id);
    if (error) {
      console.error("[reorderTasksInColumn]", error);
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
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "Nicht angemeldet." };
  if (workspace.role !== "doctor") return { error: "Nur Ärzte dürfen bestätigen." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Nicht angemeldet." };

  const { data: task } = await supabase
    .from("tasks")
    .select("id, content, status, workspace_id, submitted_by_user_id")
    .eq("id", taskId)
    .eq("workspace_id", workspace.workspace_id)
    .single();

  if (!task) return { error: "Aufgabe nicht gefunden." };
  if (task.status !== "pending_review") {
    return { error: "Diese Aufgabe wartet aktuell nicht auf Bestätigung." };
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
    .eq("id", taskId);

  if (error) return { error: "Bestätigung fehlgeschlagen. Bitte erneut versuchen." };

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
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "Nicht angemeldet." };
  if (workspace.role !== "doctor") return { error: "Nur Ärzte dürfen zurückweisen." };

  if (!reason.trim()) return { error: "Bitte geben Sie eine Begründung ein." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Nicht angemeldet." };

  const { data: task } = await supabase
    .from("tasks")
    .select("id, content, status, workspace_id, submitted_by_user_id")
    .eq("id", taskId)
    .eq("workspace_id", workspace.workspace_id)
    .single();

  if (!task) return { error: "Aufgabe nicht gefunden." };
  if (task.status !== "pending_review") {
    return { error: "Diese Aufgabe wartet aktuell nicht auf Bestätigung." };
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
    .eq("id", taskId);

  if (error) return { error: "Zurückweisen fehlgeschlagen. Bitte erneut versuchen." };

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

export async function addTaskComment(
  taskId: string,
  content: string
): Promise<{ error?: string; success?: boolean }> {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "Nicht angemeldet." };

  const trimmed = content.trim();
  if (!trimmed) return { error: "Bitte geben Sie einen Kommentar ein." };
  if (trimmed.length > 2000) return { error: "Der Kommentar darf maximal 2000 Zeichen enthalten." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Nicht angemeldet." };

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

  if (error) return { error: "Kommentar konnte nicht gespeichert werden. Bitte erneut versuchen." };

  const audience = await getTaskAudienceEmails(taskId, user.id);
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
