import { redirect } from "next/navigation";
import { getCurrentWorkspace } from "@/lib/auth-helpers";
import { resolveCreateCaseCancelHref } from "@/lib/create-case-return";
import { CreateCaseClient } from "@/components/cases/create-case-client";

interface CreateCasePageProps {
  searchParams: Promise<{ from?: string }>;
}

export default async function CreateCasePage({ searchParams }: CreateCasePageProps) {
  const workspace = await getCurrentWorkspace();
  if (!workspace) {
    redirect("/login?error=workspace_missing");
  }

  const sp = await searchParams;
  const cancelHref = resolveCreateCaseCancelHref(sp.from);

  return (
    <CreateCaseClient workspaceId={workspace.workspace_id} cancelHref={cancelHref} />
  );
}
