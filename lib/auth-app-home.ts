import type { SupabaseClient, User } from "@supabase/supabase-js";

/**
 * Zentral: App-Home nach Workspace-Rolle (Root "/", Dashboard, Post-Auth).
 */
export function workspaceRoleToHomePath(role: string | null | undefined): "/dashboard" | "/my-tasks" {
  const r = (role || "team") as "doctor" | "team";
  return r === "doctor" ? "/dashboard" : "/my-tasks";
}

/**
 * Edge/proxy: gleiche Rollenziele wie `resolveAuthenticatedEntryPath()`, nur mit dem
 * Request-`SupabaseClient`. Ohne Membership → `"/"` für volle Server-Auflösung (Invite, Relax).
 */
export async function resolveMiddlewareAuthenticatedHomeUrl(
  supabase: SupabaseClient,
  user: User
): Promise<string> {
  if (!user.email?.trim()) {
    return "/login";
  }

  const { data: row, error } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("user_id", user.id)
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[resolveMiddlewareAuthenticatedHomeUrl]", error);
    return "/login?error=workspace_missing";
  }

  if (!row) {
    return "/";
  }

  return workspaceRoleToHomePath(row.role);
}
