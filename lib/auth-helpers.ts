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
  return user;
}

export async function getCurrentWorkspace() {
  const user = await getCurrentUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("workspace_members")
    .select("workspace_id, role, workspaces(id, name, slug)")
    .eq("user_id", user.id)
    .single();

  return data;
}
