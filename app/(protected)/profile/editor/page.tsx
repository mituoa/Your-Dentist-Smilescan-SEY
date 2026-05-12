import Link from "next/link";
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
      <div
        className="flex h-full min-h-0 flex-1 flex-col pb-[max(0px,env(safe-area-inset-bottom))]"
        style={{ backgroundColor: "#F8FAFC" }}
      >
        <div
          className={`${clinicalWorkspaceFrame} ${clinicalWorkspaceVerticalPadding} flex min-h-0 flex-1 flex-col`}
        >
          <div className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 sm:px-6">
            <div
              className="rounded-lg border border-border bg-surface-card px-6 py-10 text-center shadow-sm sm:px-8 sm:py-12"
              role="status"
              aria-live="polite"
            >
              <p className="text-[14px] font-medium text-text-primary">Profilbearbeitung</p>
              <p className="mx-auto mt-2 max-w-[28ch] text-[13px] leading-relaxed text-text-secondary">
                In diesem Moment nicht verfügbar. Bitte später erneut versuchen.
              </p>
              <div className="mt-8">
                <Link
                  href="/profile"
                  className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center text-[14px] font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  Zur Praxisübersicht
                </Link>
              </div>
            </div>
          </div>
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
