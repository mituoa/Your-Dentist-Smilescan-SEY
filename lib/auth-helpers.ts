import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  // Enforce email confirmation before entering protected areas.
  // Supabase sets email_confirmed_at once the user clicks the confirmation link.
  if (!user.email_confirmed_at) {
    const p = new URLSearchParams();
    p.set("error", "email_not_confirmed");
    if (user.email) p.set("email", user.email);
    redirect(`/login?${p.toString()}`);
  }
  return user;
}

export async function getCurrentWorkspace() {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("workspace_members")
    .select("workspace_id, role, workspaces(id, name, slug, approved_at)")
    .eq("user_id", user.id)
    .single();

  return data;
}

export async function requireApprovedWorkspace() {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return null;
  // @ts-expect-error - workspaces is joined
  const approvedAt = workspace?.workspaces?.approved_at as string | null | undefined;
  if (!approvedAt) {
    redirect("/login?error=account_pending_approval");
  }
  return workspace;
}
