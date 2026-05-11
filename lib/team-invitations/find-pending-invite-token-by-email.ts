import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Latest pending, non-expired team invitation token for an email (admin; RLS blocks invitee SELECT).
 */
export async function findPendingInviteTokenByEmail(
  email: string
): Promise<string | null> {
  const normalized = email.trim().toLowerCase();
  if (!normalized) return null;

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("team_invitations")
    .select("token")
    .eq("email", normalized)
    .eq("status", "pending")
    .gt("expires_at", new Date().toISOString())
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[findPendingInviteTokenByEmail] event=query_failed");
    return null;
  }

  const token = data?.token;
  return typeof token === "string" && token.length > 0 ? token : null;
}
