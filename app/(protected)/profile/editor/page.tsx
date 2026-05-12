import { redirect } from "next/navigation";
import { getCurrentWorkspace } from "@/lib/auth-helpers";
import { getProfileForEditor } from "@/lib/queries/profile-editor";
import { ProfileEditorShell } from "@/components/profile-editor/profile-editor-shell";
import {
  clinicalWorkspaceFrame,
  clinicalWorkspaceVerticalPadding,
} from "@/lib/clinical-ui";

export default async function ProfileEditorPage() {
  const workspace = await getCurrentWorkspace();
  if (!workspace) redirect("/login?error=workspace_missing");
  if (workspace.role !== "doctor") {
    redirect("/my-tasks");
  }

  const data = await getProfileForEditor(workspace.workspace_id);
  if (!data) {
    return (
      <div className={`${clinicalWorkspaceFrame} ${clinicalWorkspaceVerticalPadding}`}>
        <div className="mx-auto max-w-lg text-center">
          <p className="text-[14px] font-medium text-[#0F172A]">Praxisangaben konnten nicht geladen werden.</p>
          <p className="mt-2 text-[13px] leading-relaxed text-[#64748B]">
            Bitte Seite neu laden. Bleibt der Hinweis bestehen, wenden Sie sich an den Support Ihres Arbeitsbereichs.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <ProfileEditorShell initialData={data} />
    </div>
  );
}
