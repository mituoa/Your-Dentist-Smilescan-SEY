import { createClient } from "@/lib/supabase/server";

export async function getNewSubmissionsCount(workspaceId: string) {
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
    return 0;
  }

  return count || 0;
}

export async function getTotalUnseenSubmissions(workspaceId: string) {
  const supabase = await createClient();

  const { count, error } = await supabase
    .from("submissions")
    .select("*", { count: "exact", head: true })
    .eq("workspace_id", workspaceId)
    .is("seen_at", null);

  if (error) {
    console.error("[dashboard] unseen count failed:", error);
    return 0;
  }

  return count || 0;
}

export async function getOpenTasks(workspaceId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("tasks")
    .select(
      "id, content, submission_id, created_at, created_by, recipient_type, specific_recipient_id"
    )
    .eq("workspace_id", workspaceId)
    .is("done_at", null)
    .order("created_at", { ascending: false })
    .limit(10);

  if (error) {
    console.error("[dashboard] tasks failed:", error);
    return [];
  }

  return data || [];
}

export async function getRecentActivity(workspaceId: string) {
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
      .select("id, content, done_at, submission_id")
      .eq("workspace_id", workspaceId)
      .not("done_at", "is", null)
      .order("done_at", { ascending: false })
      .limit(3),
  ]);

  type ActivityEvent = {
    type: "submission_received" | "task_created" | "task_done";
    id: string;
    text: string;
    timestamp: string;
    link?: string;
  };

  const events: ActivityEvent[] = [];

  if (submissionsRes.error) {
    console.error("[dashboard] recent submissions failed:", submissionsRes.error);
  }
  if (tasksRes.error) {
    console.error("[dashboard] recent tasks failed:", tasksRes.error);
  }
  if (doneTasksRes.error) {
    console.error("[dashboard] recent done tasks failed:", doneTasksRes.error);
  }

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
      link: t.submission_id ? `/inbox/${t.submission_id}` : undefined,
    });
  });

  (doneTasksRes.data || []).forEach((t) => {
    if (t.done_at) {
      events.push({
        type: "task_done",
        id: `done-${t.id}`,
        text: `Aufgabe erledigt: ${t.content.substring(0, 60)}${t.content.length > 60 ? "…" : ""}`,
        timestamp: t.done_at,
        link: t.submission_id ? `/inbox/${t.submission_id}` : undefined,
      });
    }
  });

  events.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );
  return events.slice(0, 4);
}
