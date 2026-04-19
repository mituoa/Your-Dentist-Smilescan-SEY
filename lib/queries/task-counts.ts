import "server-only";

import { createClient } from "@/lib/supabase/server";

export interface TaskCounts {
  open: number;
  pending: number;
  done: number;
}

function roleOrFilter(userId: string, isDoctor: boolean): string {
  if (isDoctor) {
    return `created_by.eq.${userId},specific_recipient_id.eq.${userId},recipient_type.eq.all_team,recipient_type.eq.doctor_only`;
  }
  return `specific_recipient_id.eq.${userId},recipient_type.eq.all_team`;
}

export async function getMyTaskCounts(
  userId: string,
  workspaceId: string,
  isDoctor: boolean
): Promise<TaskCounts> {
  const supabase = await createClient();
  const ninetyDaysAgo = new Date(
    Date.now() - 90 * 24 * 60 * 60 * 1000
  ).toISOString();

  const orF = roleOrFilter(userId, isDoctor);

  const [openResult, pendingResult, doneResult] = await Promise.all([
    supabase
      .from("tasks")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId)
      .or(orF)
      .eq("status", "open"),
    supabase
      .from("tasks")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId)
      .or(orF)
      .eq("status", "pending_review"),
    supabase
      .from("tasks")
      .select("id", { count: "exact", head: true })
      .eq("workspace_id", workspaceId)
      .or(orF)
      .eq("status", "done")
      .gte("done_at", ninetyDaysAgo),
  ]);

  return {
    open: openResult.count || 0,
    pending: pendingResult.count || 0,
    done: doneResult.count || 0,
  };
}
