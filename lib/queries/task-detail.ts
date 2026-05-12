import "server-only";

import { createClient } from "@/lib/supabase/server";
import { summarizeTaskReceipts, type TaskDeliveryAggregate } from "@/lib/tasks/receipts";
import { resolveTaskDisplayTitle } from "@/lib/tasks/title";

export interface TaskDetail {
  id: string;
  title: string;
  raw_title: string | null;
  content: string;
  description: string | null;
  priority: "normal" | "important";
  status: "open" | "pending_review" | "done";
  recipient_type: "doctor_only" | "all_team" | "specific_person";
  specific_recipient_id: string | null;
  specific_recipient_email: string | null;
  assignee_user_ids: string[];
  assignee_emails: string[];
  submission_id: string | null;
  submission_patient_name: string | null;
  created_at: string;
  created_by: string;
  created_by_email: string | null;
  submitted_for_review_at: string | null;
  submitted_by_email: string | null;
  reviewed_at: string | null;
  reviewed_by_email: string | null;
  rejection_reason: string | null;
  done_at: string | null;
  due_date: string | null;
  delivery_status: TaskDeliveryAggregate;
  receipt_summary: {
    total: number;
    sent: number;
    delivered: number;
    read: number;
  };
}

export interface TaskComment {
  id: string;
  task_id: string;
  author_id: string;
  author_email: string | null;
  content: string;
  is_system: boolean;
  created_at: string;
}

/**
 * Lädt eine Aufgabe mit Kommentaren **nur** innerhalb von `workspaceId` (Detailroute — s.
 * `app/(protected)/my-tasks/[id]/page.tsx` Punkt 1 / **Punkt 3** / **Punkt 10**). Kein clientgewähltes Workspace.
 * Kommentare: `tasks!inner` + `workspace_id`-Filter (**zusätzlich** zu RLS auf `task_comments`).
 * **Submission:** `submissions.workspace_id` wird mit `workspaceId` abgeglichen — bei Abweichung kein Inbox-Link/
 * kein Patientenname (Integritäts-/Scope-Schutz). **Punkt 5 (Tot/Fake):** Kein zweiter „Live“-Pfad — Datenstand =
 * Server beim Rendern; s. `page.tsx` (Punkt 5).
 */
export async function getTaskWithComments(
  taskId: string,
  workspaceId: string
): Promise<{ task: TaskDetail | null; comments: TaskComment[] }> {
  const supabase = await createClient();

  const { data: taskRow } = await supabase
    .from("tasks")
    .select(
      `
      id, title, content, description, status, priority, recipient_type, specific_recipient_id,
      submission_id, created_at, created_by,
      submitted_for_review_at, submitted_by_user_id,
      reviewed_at, reviewed_by_user_id, rejection_reason, done_at, due_date,
      submissions(patient_name, workspace_id),
      task_assignees(user_id),
      task_delivery_receipts(sent_at, delivered_at, read_at)
    `
    )
    .eq("id", taskId)
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  if (!taskRow) return { task: null, comments: [] };

  const { createAdminClient } = await import("@/lib/supabase/admin");
  const admin = createAdminClient();

  const { data: commentRows, error: commentsError } = await supabase
    .from("task_comments")
    .select(
      `
      id,
      task_id,
      author_id,
      content,
      is_system,
      created_at,
      tasks!inner ( workspace_id )
    `
    )
    .eq("task_id", taskId)
    .eq("tasks.workspace_id", workspaceId)
    .order("created_at", { ascending: true });

  if (commentsError) {
    console.error("[getTaskWithComments comments]", (commentsError as { code?: string }).code ?? "unknown");
  }

  const taskAssignees =
    (taskRow.task_assignees as Array<{ user_id: string }> | null) || [];
  const taskReceipts =
    (taskRow.task_delivery_receipts as Array<{
      sent_at?: string | null;
      delivered_at?: string | null;
      read_at?: string | null;
    }> | null) || [];
  const receiptSummary = summarizeTaskReceipts(taskReceipts);
  const assigneeUserIds = taskAssignees
    .map((assignee) => assignee.user_id)
    .filter((id): id is string => Boolean(id));

  const userIds = Array.from(
    new Set(
      [
        taskRow.created_by,
        taskRow.submitted_by_user_id,
        taskRow.reviewed_by_user_id,
        taskRow.specific_recipient_id,
        ...assigneeUserIds,
      ].filter(Boolean) as string[]
    )
  );

  const emailMap: Record<string, string> = {};
  for (const id of userIds) {
    const { data } = await admin.auth.admin.getUserById(id);
    if (data?.user?.email) emailMap[id] = data.user.email;
  }

  const submissions = taskRow.submissions as
    | { patient_name?: string | null; workspace_id?: string | null }
    | null
    | undefined;

  const submissionWorkspaceMismatch =
    submissions?.workspace_id != null && String(submissions.workspace_id) !== workspaceId;

  const submissionIdForUi = submissionWorkspaceMismatch
    ? null
    : ((taskRow.submission_id as string | null) ?? null);
  const submissionPatientForUi = submissionWorkspaceMismatch
    ? null
    : submissions?.patient_name || null;

  const task: TaskDetail = {
    id: taskRow.id,
    title: resolveTaskDisplayTitle((taskRow.title as string | null) ?? null, taskRow.content),
    raw_title: (taskRow.title as string | null) ?? null,
    content: taskRow.content,
    description: taskRow.description,
    priority: ((taskRow.priority as "normal" | "important" | null) ?? "normal"),
    status: taskRow.status as TaskDetail["status"],
    recipient_type: taskRow.recipient_type as TaskDetail["recipient_type"],
    specific_recipient_id: taskRow.specific_recipient_id,
    specific_recipient_email: taskRow.specific_recipient_id
      ? emailMap[taskRow.specific_recipient_id] || null
      : null,
    assignee_user_ids: assigneeUserIds,
    assignee_emails: assigneeUserIds
      .map((id) => emailMap[id] || null)
      .filter((email): email is string => Boolean(email)),
    submission_id: submissionIdForUi,
    submission_patient_name: submissionPatientForUi,
    created_at: taskRow.created_at,
    created_by: taskRow.created_by,
    created_by_email: emailMap[taskRow.created_by] || null,
    submitted_for_review_at: taskRow.submitted_for_review_at,
    submitted_by_email: taskRow.submitted_by_user_id
      ? emailMap[taskRow.submitted_by_user_id] || null
      : null,
    reviewed_at: taskRow.reviewed_at,
    reviewed_by_email: taskRow.reviewed_by_user_id
      ? emailMap[taskRow.reviewed_by_user_id] || null
      : null,
    rejection_reason: taskRow.rejection_reason,
    done_at: taskRow.done_at,
    due_date: taskRow.due_date,
    delivery_status: receiptSummary.aggregate,
    receipt_summary: {
      total: receiptSummary.total,
      sent: receiptSummary.sent,
      delivered: receiptSummary.delivered,
      read: receiptSummary.read,
    },
  };

  const comments: TaskComment[] = [];
  for (const c of commentRows || []) {
    const row = c as {
      id: string;
      task_id: string;
      author_id: string;
      content: string;
      is_system: boolean;
      created_at: string;
    };
    if (!emailMap[row.author_id]) {
      const { data } = await admin.auth.admin.getUserById(row.author_id);
      emailMap[row.author_id] = data?.user?.email || "unbekannt";
    }
    comments.push({
      id: row.id,
      task_id: row.task_id,
      author_id: row.author_id,
      author_email: emailMap[row.author_id] || null,
      content: row.content,
      is_system: row.is_system,
      created_at: row.created_at,
    });
  }

  return { task, comments };
}
