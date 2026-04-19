import "server-only";

import { createClient } from "@/lib/supabase/server";

export interface TaskDetail {
  id: string;
  content: string;
  description: string | null;
  status: "open" | "pending_review" | "done";
  recipient_type: "doctor_only" | "all_team" | "specific_person";
  specific_recipient_id: string | null;
  specific_recipient_email: string | null;
  submission_id: string;
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
      id, content, description, status, recipient_type, specific_recipient_id,
      submission_id, created_at, created_by,
      submitted_for_review_at, submitted_by_user_id,
      reviewed_at, reviewed_by_user_id, rejection_reason, done_at, due_date,
      submissions(patient_name)
    `
    )
    .eq("id", taskId)
    .eq("workspace_id", workspaceId)
    .maybeSingle();

  if (!taskRow) return { task: null, comments: [] };

  const { createAdminClient } = await import("@/lib/supabase/admin");
  const admin = createAdminClient();

  const userIds = Array.from(
    new Set(
      [
        taskRow.created_by,
        taskRow.submitted_by_user_id,
        taskRow.reviewed_by_user_id,
        taskRow.specific_recipient_id,
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
    content: taskRow.content,
    description: taskRow.description,
    status: taskRow.status as TaskDetail["status"],
    recipient_type: taskRow.recipient_type as TaskDetail["recipient_type"],
    specific_recipient_id: taskRow.specific_recipient_id,
    specific_recipient_email: taskRow.specific_recipient_id
      ? emailMap[taskRow.specific_recipient_id] || null
      : null,
    submission_id: taskRow.submission_id,
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
