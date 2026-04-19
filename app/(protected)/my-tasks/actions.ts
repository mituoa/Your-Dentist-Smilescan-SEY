"use server";

import { revalidatePath } from "next/cache";

import { getCurrentWorkspace } from "@/lib/auth-helpers";
import { getAppBaseUrl } from "@/lib/env";
import {
  buildTaskApproved,
  buildTaskComment,
  buildTaskRejected,
  buildTaskSubmittedForReview,
} from "@/lib/mail/task-notifications";
import { sendTransactionalMailBestEffort } from "@/lib/mail/send-mail-best-effort";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

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
  if (task.recipient_type === "specific_person" && task.specific_recipient_id) {
    userIds.add(task.specific_recipient_id);
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
  if (task.status !== "open") return { error: "Aufgabe kann nicht gemeldet werden." };

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

  if (error) return { error: "Aktion fehlgeschlagen." };

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
  revalidatePath(`/my-tasks/${taskId}`);
  revalidatePath("/inbox");
  revalidatePath("/dashboard");
  return { success: true };
}

export async function approveTask(
  taskId: string
): Promise<{ error?: string; success?: boolean }> {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "Nicht angemeldet." };
  if (workspace.role !== "doctor") return { error: "Nur Ärzte können bestätigen." };

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
    return { error: "Aufgabe ist nicht im Review-Zustand." };
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

  if (error) return { error: "Bestätigung fehlgeschlagen." };

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
  if (workspace.role !== "doctor") return { error: "Nur Ärzte können zurückweisen." };

  if (!reason.trim()) return { error: "Begründung ist erforderlich." };

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
    return { error: "Aufgabe ist nicht im Review-Zustand." };
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

  if (error) return { error: "Zurückweisen fehlgeschlagen." };

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
  if (!trimmed) return { error: "Kommentar darf nicht leer sein." };
  if (trimmed.length > 2000) return { error: "Maximal 2000 Zeichen." };

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

  if (error) return { error: "Kommentar konnte nicht gespeichert werden." };

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
