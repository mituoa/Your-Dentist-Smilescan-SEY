import { redirect } from "next/navigation";

import { PracticeSolutionsView } from "@/components/profile/practice-solutions-view";
import { getCurrentWorkspace } from "@/lib/auth-helpers";
import { buildInquiryContextFromProfile } from "@/lib/practice-solutions/inquiry-context";
import { getProfileForEditor } from "@/lib/queries/profile-editor";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function ProfileSolutionsPage() {
  const workspace = await getCurrentWorkspace();
  if (!workspace) redirect("/login?error=workspace_missing");
  if (workspace.role !== "doctor") redirect("/my-tasks");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const profile = await getProfileForEditor(workspace.workspace_id);

  // @ts-expect-error — workspaces ist Supabase-Join
  const rawWorkspaceName = workspace.workspaces?.name as string | undefined;
  const workspaceName =
    typeof rawWorkspaceName === "string" && rawWorkspaceName.trim()
      ? rawWorkspaceName.trim()
      : "Ihre Praxis";

  const inquiryContext = buildInquiryContextFromProfile(profile, {
    workspaceName,
    userEmail: user.email ?? "",
  });

  return (
    <div className="yd-profile-editor-workspace yd-profile-solutions-workspace flex min-h-0 w-full flex-1 flex-col md:h-full">
      <PracticeSolutionsView inquiryContext={inquiryContext} />
    </div>
  );
}
