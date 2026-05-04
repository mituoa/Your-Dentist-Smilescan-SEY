import { redirect } from "next/navigation";
import { getCurrentWorkspace } from "@/lib/auth-helpers";
import { getProfileForEditor } from "@/lib/queries/profile-editor";
import { ProfileEditorShell } from "@/components/profile-editor/profile-editor-shell";

export default async function ProfileEditorPage() {
  const workspace = await getCurrentWorkspace();
  if (!workspace) redirect("/login");
  if (workspace.role !== "doctor") {
    redirect("/relay");
  }

  const data = await getProfileForEditor(workspace.workspace_id);
  if (!data) {
    return (
      <div className="p-12 text-center">Profil konnte nicht geladen werden.</div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <ProfileEditorShell initialData={data} />
    </div>
  );
}
