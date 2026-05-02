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
      submissions(patient_name),
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
    | { patient_name?: string | null }
    | null
    | undefined;

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
    submission_id: (taskRow.submission_id as string | null) ?? null,
    submission_patient_name: submissions?.patient_name || null,
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

  const { data: commentRows } = await supabase
    .from("task_comments")
    .select("*")
    .eq("task_id", taskId)
    .order("created_at", { ascending: true });

  const comments: TaskComment[] = [];
  for (const c of commentRows || []) {
    if (!emailMap[c.author_id]) {
      const { data } = await admin.auth.admin.getUserById(c.author_id);
      emailMap[c.author_id] = data?.user?.email || "unbekannt";
    }
    comments.push({
      id: c.id,
      task_id: c.task_id,
      author_id: c.author_id,
      author_email: emailMap[c.author_id] || null,
      content: c.content,
      is_system: c.is_system,
      created_at: c.created_at,
    });
  }

  return { task, comments };
}
