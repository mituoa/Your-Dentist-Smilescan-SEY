import "server-only";

import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { summarizeTaskReceipts, type TaskDeliveryAggregate } from "@/lib/tasks/receipts";
import { resolveTaskDisplayTitle } from "@/lib/tasks/title";

export interface MyTask {
  id: string;
  title: string;
  raw_title: string | null;
  description: string | null;
  due_date: string | null;
  priority: "normal" | "important";
  recipient_type: "doctor_only" | "all_team" | "specific_person";
  specific_recipient_id: string | null;
  assignee_ids: string[];
  created_by: string;
  status: "open" | "pending_review" | "done";
  done_at: string | null;
  submitted_for_review_at: string | null;
  sort_order: number;
  completed: boolean;
  created_at: string;
  submission_id: string | null;
  submission_patient_name: string | null;
  submission_created_at: string | null;
  delivery_status: TaskDeliveryAggregate;
  receipt_summary: {
    total: number;
    sent: number;
    delivered: number;
    read: number;
  };
}

/**
 * Aufgabenliste für Relay / „Meine Aufgaben“.
 * **Workspace:** Abfrage immer mit `.eq("workspace_id", workspaceId)`; zusätzlicher **Sichtbarkeitsfilter**
 * nach Rolle und Empfänger (ergänzend zu RLS). Server Actions prüfen dieselbe Workspace-Mitgliedschaft über
 * `resolveActorWorkspace` und `canMoveTask` (s. `workflow-rules`).
 * **Punkt 10 (Security):** Kein Lesen ohne `workspace_id`; Sichtbarkeitsfilter ergänzt RLS — konsistent mit
 * `resolveActorWorkspace` / Relay-Actions; Fremd-Workspace-Tasks werden hier nicht gemappt.
 */
export async function getMyTasks(
  userId: string,
  workspaceId: string,
  isDoctor: boolean,
  status: "open" | "pending_review" | "done"
): Promise<MyTask[]> {
  const supabase = await createClient();

  let query = supabase
    .from("tasks")
    .select(
      `
      id, title, content, description, due_date, status, done_at, created_at, priority, sort_order,
      submitted_for_review_at, submission_id, created_by, recipient_type, specific_recipient_id,
      submissions(patient_name, created_at),
      task_assignees(user_id),
      task_delivery_receipts(sent_at, delivered_at, read_at)
    `
    )
    .eq("workspace_id", workspaceId)
    .eq("status", status);

  if (status === "done") {
    const ninetyDaysAgo = new Date(
      Date.now() - 90 * 24 * 60 * 60 * 1000
    ).toISOString();
    query = query
      .gte("done_at", ninetyDaysAgo)
      .order("done_at", { ascending: false });
  } else {
    query = query
      .order("priority", { ascending: false })
      .order("sort_order", { ascending: true })
      .order("due_date", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: true });
  }

  const { data, error } = await query;

  if (error) {
    console.error("[getMyTasks]", (error as { code?: string }).code ?? "unknown");
    return [];
  }

  const mapped = (data || []).map((t: Record<string, unknown>) => {
    const submissions = t.submissions as {
      patient_name?: string | null;
      created_at?: string;
    } | null;
    const assignees = (t.task_assignees as Array<{ user_id: string }> | null) || [];
    const receipts =
      (t.task_delivery_receipts as Array<{
        sent_at?: string | null;
        delivered_at?: string | null;
        read_at?: string | null;
      }> | null) || [];
    const receiptSummary = summarizeTaskReceipts(receipts);
    const assigneeIds = assignees
      .map((assignee) => assignee.user_id)
      .filter((id): id is string => Boolean(id));
    const st = t.status as MyTask["status"];
    return {
      id: t.id as string,
      title: resolveTaskDisplayTitle((t.title as string | null) ?? null, (t.content as string) || ""),
      raw_title: (t.title as string | null) ?? null,
      description: (t.description as string | null) ?? null,
      due_date: (t.due_date as string | null) ?? null,
      priority: ((t.priority as "normal" | "important" | null) ?? "normal"),
      recipient_type:
        (t.recipient_type as "doctor_only" | "all_team" | "specific_person") ??
        "doctor_only",
      specific_recipient_id:
        (t.specific_recipient_id as string | null) ?? null,
      assignee_ids: assigneeIds,
      created_by: t.created_by as string,
      status: st,
      done_at: (t.done_at as string | null) ?? null,
      submitted_for_review_at:
        (t.submitted_for_review_at as string | null) ?? null,
      sort_order: Number((t.sort_order as number | string | null) ?? 0),
      completed: st === "done",
      created_at: t.created_at as string,
      submission_id: (t.submission_id as string | null) ?? null,
      submission_patient_name: submissions?.patient_name ?? null,
      submission_created_at: submissions?.created_at ?? null,
      delivery_status: receiptSummary.aggregate,
      receipt_summary: {
        total: receiptSummary.total,
        sent: receiptSummary.sent,
        delivered: receiptSummary.delivered,
        read: receiptSummary.read,
      },
    };
  });

  return mapped.filter((task) => {
    const isSpecificallyAssigned =
      task.specific_recipient_id === userId || task.assignee_ids.includes(userId);
    if (isDoctor) {
      return (
        task.created_by === userId ||
        task.recipient_type === "all_team" ||
        task.recipient_type === "doctor_only" ||
        isSpecificallyAssigned
      );
    }
    return task.recipient_type === "all_team" || isSpecificallyAssigned;
  });
}

/** @deprecated use getMyTasks(..., "open") */
export async function getMyOpenTasks(
  userId: string,
  workspaceId: string,
  role: "doctor" | "team"
): Promise<MyTask[]> {
  return getMyTasks(userId, workspaceId, role === "doctor", "open");
}

export const countMyOpenTasks = cache(
  async (
    userId: string,
    workspaceId: string,
    role: "doctor" | "team"
  ): Promise<{ total: number; overdue: number }> => {
    const isDoctor = role === "doctor";
    const statuses = isDoctor
      ? (["open", "pending_review"] as const)
      : (["open"] as const);
    const tasksByStatus = await Promise.all(
      statuses.map((currentStatus) =>
        getMyTasks(userId, workspaceId, isDoctor, currentStatus)
      )
    );
    const total = tasksByStatus.reduce((sum, items) => sum + items.length, 0);

    return {
      total,
      overdue: 0,
    };
  }
);
