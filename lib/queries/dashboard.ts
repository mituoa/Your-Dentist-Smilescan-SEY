import { createClient } from "@/lib/supabase/server";

/** Count query: `ok: false` means DB/RLS error — UI must not show a fake zero. */
export type SafeCount = { ok: true; count: number } | { ok: false };

export type OpenTaskRow = {
  id: string;
  content: string;
  submission_id: string | null;
  created_at: string;
};

export type OpenTasksResult = { ok: true; tasks: OpenTaskRow[] } | { ok: false };

export type ActivityEvent = {
  type: "submission_received" | "task_created" | "task_done";
  id: string;
  text: string;
  timestamp: string;
  link?: string;
};

export type RecentActivityResult = { ok: true; events: ActivityEvent[] } | { ok: false };

export async function getNewSubmissionsCount(workspaceId: string): Promise<SafeCount> {
  const supabase = await createClient();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  const { count, error } = await supabase
    .from("submissions")
    .select("*", { count: "exact", head: true })
    .eq("workspace_id", workspaceId)
    .gte("created_at", yesterday.toISOString());

  if (error) {
    console.error("[dashboard] new submissions count failed:", error);
    return { ok: false };
  }

  return { ok: true, count: count || 0 };
}

export async function getTotalUnseenSubmissions(workspaceId: string): Promise<SafeCount> {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("submissions")
    .select("*", { count: "exact", head: true })
    .eq("workspace_id", workspaceId)
    .is("seen_at", null);

  if (error) {
    console.error("[dashboard] unseen count failed:", error);
    return { ok: false };
  }

  return { ok: true, count: count || 0 };
}

export async function getOpenTasks(workspaceId: string): Promise<OpenTasksResult> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tasks")
    .select("id, content, submission_id, created_at")
    .eq("workspace_id", workspaceId)
    .in("status", ["open", "pending_review"])
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    console.error("[dashboard] tasks failed:", error);
    return { ok: false };
  }

  const tasks: OpenTaskRow[] = (data || []).map((row) => ({
    id: row.id as string,
    content: row.content as string,
    submission_id: (row.submission_id as string | null) ?? null,
    created_at: row.created_at as string,
  }));

  return { ok: true, tasks };
}

export async function getRecentActivity(workspaceId: string): Promise<RecentActivityResult> {
  const supabase = await createClient();

  const [submissionsRes, tasksRes, doneTasksRes] = await Promise.all([
    supabase
      .from("submissions")
      .select("id, patient_name, created_at")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("tasks")
      .select("id, content, created_at, submission_id")
      .eq("workspace_id", workspaceId)
      .order("created_at", { ascending: false })
      .limit(3),
    supabase
      .from("tasks")
      .select("id, content, done_at, submission_id, status")
      .eq("workspace_id", workspaceId)
      .eq("status", "done")
      .order("done_at", { ascending: false })
      .limit(3),
  ]);

  if (submissionsRes.error || tasksRes.error || doneTasksRes.error) {
    if (submissionsRes.error) {
      console.error("[dashboard] recent submissions failed:", submissionsRes.error);
    }
    if (tasksRes.error) {
      console.error("[dashboard] recent tasks failed:", tasksRes.error);
    }
    if (doneTasksRes.error) {
      console.error("[dashboard] recent done tasks failed:", doneTasksRes.error);
    }
    return { ok: false };
  }

  const events: ActivityEvent[] = [];

  (submissionsRes.data || []).forEach((s) => {
    events.push({
      type: "submission_received",
      id: s.id,
      text: `Neue Einsendung von ${s.patient_name || "Patient"}`,
      timestamp: s.created_at,
      link: `/inbox/${s.id}`,
    });
  });

  (tasksRes.data || []).forEach((t) => {
    events.push({
      type: "task_created",
      id: t.id,
      text: `Aufgabe: ${t.content.substring(0, 60)}${t.content.length > 60 ? "…" : ""}`,
      timestamp: t.created_at,
      link: `/my-tasks/${t.id}`,
    });
  });

  (doneTasksRes.data || []).forEach((t) => {
    if (t.done_at) {
      events.push({
        type: "task_done",
        id: `done-${t.id}`,
        text: `Aufgabe erledigt: ${t.content.substring(0, 60)}${t.content.length > 60 ? "…" : ""}`,
        timestamp: t.done_at,
        link: t.submission_id ? `/inbox/${t.submission_id}` : `/my-tasks/${t.id}`,
      });
    }
  });

  events.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  return { ok: true, events: events.slice(0, 4) };
}
