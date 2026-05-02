import { redirect } from "next/navigation";
import { getCurrentWorkspace } from "@/lib/auth-helpers";
import { createClient } from "@/lib/supabase/server";
import { getProfileForEditor } from "@/lib/queries/profile-editor";
import { ProfileEditorShell } from "@/components/profile-editor/profile-editor-shell";

export default async function ProfileEditorPage() {
  const workspace = await getCurrentWorkspace();
  if (!workspace) redirect("/login");
  if (workspace.role !== "doctor") {
    redirect("/my-tasks");
  }

  const supabase = await createClient();
  const { data: ws } = await supabase
    .from("workspaces")
    .select("id, name, slug")
    .eq("id", workspace.workspace_id)
    .single();

  if (!ws) redirect("/login");

  const data = await getProfileForEditor(workspace.workspace_id);
  if (!data) {
    return (
      <div className="p-12 text-center">Profil konnte nicht geladen werden.</div>
    );
  }

  return (
    <ProfileEditorShell
      initialData={data}
      workspaceName={ws.name}
      slug={ws.slug ?? ""}
    />
  );
}
