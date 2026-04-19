import "server-only";

import { createClient } from "@/lib/supabase/server";

export interface MyTask {
  id: string;
  title: string;
  description: string | null;
  due_date: string | null;
  status: "open" | "pending_review" | "done";
  done_at: string | null;
  submitted_for_review_at: string | null;
  completed: boolean;
  created_at: string;
  submission_id: string;
  submission_patient_name: string | null;
  submission_created_at: string;
}

function roleOrFilter(userId: string, isDoctor: boolean): string {
  if (isDoctor) {
    return `created_by.eq.${userId},specific_recipient_id.eq.${userId},recipient_type.eq.all_team,recipient_type.eq.doctor_only`;
  }
  return `specific_recipient_id.eq.${userId},recipient_type.eq.all_team`;
}

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
      id, content, description, due_date, status, done_at, created_at,
      submitted_for_review_at, submission_id,
      submissions(patient_name, created_at)
    `
    )
    .eq("workspace_id", workspaceId)
    .eq("status", status)
    .or(roleOrFilter(userId, isDoctor));

  if (status === "done") {
    const ninetyDaysAgo = new Date(
      Date.now() - 90 * 24 * 60 * 60 * 1000
    ).toISOString();
    query = query
      .gte("done_at", ninetyDaysAgo)
      .order("done_at", { ascending: false });
  } else {
    query = query
      .order("due_date", { ascending: true, nullsFirst: false })
      .order("created_at", { ascending: true });
  }

  const { data, error } = await query;

  if (error) {
    console.error("[getMyTasks]", error);
    return [];
  }

  return (data || []).map((t: Record<string, unknown>) => {
    const submissions = t.submissions as {
      patient_name?: string | null;
      created_at?: string;
    } | null;
    const st = t.status as MyTask["status"];
    return {
      id: t.id as string,
      title: (t.content as string) || "",
      description: (t.description as string | null) ?? null,
      due_date: (t.due_date as string | null) ?? null,
      status: st,
      done_at: (t.done_at as string | null) ?? null,
      submitted_for_review_at:
        (t.submitted_for_review_at as string | null) ?? null,
      completed: st === "done",
      created_at: t.created_at as string,
      submission_id: t.submission_id as string,
      submission_patient_name: submissions?.patient_name ?? null,
      submission_created_at:
        submissions?.created_at ?? (t.created_at as string),
    };
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

export async function countMyOpenTasks(
  userId: string,
  workspaceId: string,
  role: "doctor" | "team"
): Promise<{ total: number; overdue: number }> {
  const supabase = await createClient();
  const isDoctor = role === "doctor";
  const orF = roleOrFilter(userId, isDoctor);

  const statuses = isDoctor ? (["open", "pending_review"] as const) : (["open"] as const);

  const queries = statuses.map((s) =>
    supabase
      .from("tasks")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId)
      .or(orF)
      .eq("status", s)
  );

  const results = await Promise.all(queries);
  for (const r of results) {
    if (r.error) {
      console.error("[countMyOpenTasks]", r.error);
      return { total: 0, overdue: 0 };
    }
  }

  const total = results.reduce((sum, r) => sum + (r.count || 0), 0);

  return {
    total,
    overdue: 0,
  };
}
