import "server-only";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  parseOpeningHoursConfig,
} from "@/lib/settings/opening-hours";
import type { TeamInvitation, TeamMember } from "@/lib/types/settings-team";

export type { TeamInvitation, TeamMember };

export async function getSettingsData(workspaceId: string) {
  const supabase = await createClient();
  const admin = createAdminClient();

  const [ws, profile] = await Promise.all([
    supabase
      .from("workspaces")
      .select("id, name, slug")
      .eq("id", workspaceId)
      .single(),
    supabase
      .from("profile_data")
      .select("appointment_link, logo_url, accent_color, opening_hours_config")
      .eq("workspace_id", workspaceId)
      .single(),
  ]);

  const { data: memberRows } = await admin
    .from("workspace_members")
    .select("user_id, role, created_at")
    .eq("workspace_id", workspaceId);

  const members: TeamMember[] = [];
  for (const m of memberRows || []) {
    const { data: user } = await admin.auth.admin.getUserById(m.user_id);
    if (user?.user?.email) {
      members.push({
        user_id: m.user_id,
        email: user.user.email,
        role: m.role as "doctor" | "team",
        joined_at: m.created_at ?? null,
      });
    }
  }

  const { data: invitations } = await supabase
    .from("team_invitations")
    .select("id, email, role, status, expires_at, created_at")
    .eq("workspace_id", workspaceId)
    .eq("status", "pending")
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false });

  return {
    workspace: ws.data || null,
    profile: profile.data
      ? {
          ...profile.data,
          opening_hours_config: profile.data.opening_hours_config
            ? parseOpeningHoursConfig(profile.data.opening_hours_config)
            : null,
        }
      : null,
    members,
    invitations: (invitations as TeamInvitation[]) || [],
  };
}

export async function isSlugAvailable(
  slug: string,
  excludeWorkspaceId: string
): Promise<boolean> {
  const admin = createAdminClient();

  const { data: existing } = await admin
    .from("workspaces")
    .select("id")
    .eq("slug", slug)
    .neq("id", excludeWorkspaceId);

  if (existing && existing.length > 0) return false;

  const { data: historical } = await admin
    .from("workspace_slug_history")
    .select("workspace_id")
    .eq("old_slug", slug)
    .neq("workspace_id", excludeWorkspaceId);

  if (historical && historical.length > 0) return false;

  return true;
}

export async function resolveSlugRedirect(slug: string): Promise<string | null> {
  const admin = createAdminClient();

  const { data } = await admin
    .from("workspace_slug_history")
    .select("workspace_id")
    .eq("old_slug", slug)
    .maybeSingle();

  if (!data) return null;

  const { data: ws } = await admin
    .from("workspaces")
    .select("slug")
    .eq("id", data.workspace_id)
    .single();

  return ws?.slug || null;
}
