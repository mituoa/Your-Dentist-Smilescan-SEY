import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";

export interface AssignableMember {
  user_id: string;
  email: string;
  role: "doctor" | "team";
}

/** Quick-Create auf `/relay`: nur Mitglieder des übergebenen `workspaceId` (Admin-Client; Grenze am Aufrufer). */
export async function getAssignableWorkspaceMembers(
  workspaceId: string,
  excludeUserId?: string
): Promise<AssignableMember[]> {
  const admin = createAdminClient();
  const { data: rows, error } = await admin
    .from("workspace_members")
    .select("user_id, role")
    .eq("workspace_id", workspaceId)
    .order("role", { ascending: true });

  if (error || !rows) {
    console.error("[getAssignableWorkspaceMembers]", (error as { code?: string } | null)?.code ?? "unknown");
    return [];
  }

  const members: AssignableMember[] = [];
  for (const row of rows) {
    if (excludeUserId && row.user_id === excludeUserId) continue;
    const { data } = await admin.auth.admin.getUserById(row.user_id);
    const email = data?.user?.email;
    if (!email) continue;
    members.push({
      user_id: row.user_id,
      email,
      role: row.role as "doctor" | "team",
    });
  }

  return members.sort((a, b) => {
    if (a.role !== b.role) {
      return a.role === "doctor" ? -1 : 1;
    }
    return a.email.trim().toLowerCase().localeCompare(b.email.trim().toLowerCase(), "de");
  });
}
