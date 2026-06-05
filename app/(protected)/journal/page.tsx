import { redirect } from "next/navigation";
import { getCurrentWorkspace } from "@/lib/auth-helpers";
import { listJournalForWorkspace } from "@/lib/queries/journal";
import { JournalPatientKnowledge } from "@/components/journal/journal-patient-knowledge";

export default async function JournalPage() {
  const workspace = await getCurrentWorkspace();
  if (!workspace) redirect("/login");
  if (workspace.role !== "doctor") {
    redirect("/my-tasks");
  }

  const entries = await listJournalForWorkspace(workspace.workspace_id);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <JournalPatientKnowledge initialEntries={entries} />
    </div>
  );
}
