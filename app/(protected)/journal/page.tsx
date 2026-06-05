import { redirect } from "next/navigation";
import { getCurrentWorkspace } from "@/lib/auth-helpers";
import { listJournalForWorkspace } from "@/lib/queries/journal";
import { JournalKnowledgeCenter } from "@/components/journal/journal-knowledge-center";

export default async function JournalPage() {
  const workspace = await getCurrentWorkspace();
  if (!workspace) redirect("/login");
  if (workspace.role !== "doctor") {
    redirect("/my-tasks");
  }

  const entries = await listJournalForWorkspace(workspace.workspace_id);

  return <JournalKnowledgeCenter initialEntries={entries} />;
}
