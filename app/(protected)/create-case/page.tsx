import { redirect } from "next/navigation";
import { getCurrentWorkspace } from "@/lib/auth-helpers";
import { CreateCaseClient } from "@/components/cases/create-case-client";

export default async function CreateCasePage() {
  const workspace = await getCurrentWorkspace();
  if (!workspace) {
    redirect("/login?error=workspace_missing");
  }

  return <CreateCaseClient workspaceId={workspace.workspace_id} />;
}
