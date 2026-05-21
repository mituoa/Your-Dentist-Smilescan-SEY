import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";

import { computeNextDueDate, computeRemindAt, type TaskRecurrenceType, type TaskRemindBefore } from "@/lib/tasks/recurrence";

type TaskRow = {
  id: string;
  workspace_id: string;
  title: string | null;
  content: string;
  description: string | null;
  due_date: string | null;
  priority: "normal" | "important";
  recipient_type: string;
  specific_recipient_id: string | null;
  created_by: string;
  recurrence_type: TaskRecurrenceType;
  recurrence_interval_days: number | null;
  remind_self: boolean;
  remind_assignees: boolean;
  remind_before: TaskRemindBefore | null;
  submission_id: string | null;
};

/** After a recurring task is completed, create the next open instance. */
export async function maybeSpawnNextRecurrence(
  supabase: SupabaseClient,
  completedTaskId: string,
  workspaceId: string
): Promise<void> {
  const { data: task } = await supabase
    .from("tasks")
    .select(
      "id, workspace_id, title, content, description, due_date, priority, recipient_type, specific_recipient_id, created_by, recurrence_type, recurrence_interval_days, remind_self, remind_assignees, remind_before, submission_id"
    )
    .eq("id", completedTaskId)
    .eq("workspace_id", workspaceId)
    .single();

  if (!task) return;
  const row = task as TaskRow;
  if (row.recurrence_type === "once") return;

  const baseDue = row.due_date ? new Date(row.due_date) : new Date();
  const nextDue = computeNextDueDate(
    baseDue,
    row.recurrence_type,
    row.recurrence_interval_days
  );
  if (!nextDue) return;

  const remindAt = computeRemindAt(
    nextDue,
    row.remind_before,
    row.remind_self,
    row.remind_assignees
  );

  const { data: inserted, error } = await supabase
    .from("tasks")
    .insert({
      workspace_id: row.workspace_id,
      submission_id: row.submission_id,
      title: row.title,
      content: row.content,
      description: row.description,
      due_date: nextDue.toISOString(),
      priority: row.priority,
      recipient_type: row.recipient_type,
      specific_recipient_id: row.specific_recipient_id,
      created_by: row.created_by,
      status: "open",
      sort_order: Date.now(),
      recurrence_type: row.recurrence_type,
      recurrence_interval_days: row.recurrence_interval_days,
      remind_self: row.remind_self,
      remind_assignees: row.remind_assignees,
      remind_before: row.remind_before,
      remind_at: remindAt,
      recurrence_parent_id: completedTaskId,
    })
    .select("id")
    .single();

  if (error || !inserted) {
    console.error("[maybeSpawnNextRecurrence]", (error as { code?: string })?.code ?? "unknown");
    return;
  }

  if (row.recipient_type === "specific_person" && row.specific_recipient_id) {
    const { data: assignees } = await supabase
      .from("task_assignees")
      .select("user_id")
      .eq("task_id", completedTaskId);
    if (assignees?.length) {
      await supabase.from("task_assignees").insert(
        assignees.map((a) => ({ task_id: inserted.id, user_id: a.user_id }))
      );
    } else {
      await supabase.from("task_assignees").insert({
        task_id: inserted.id,
        user_id: row.specific_recipient_id,
      });
    }
  }
}
