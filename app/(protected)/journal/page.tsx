import { redirect } from "next/navigation";
import { getCurrentWorkspace } from "@/lib/auth-helpers";
import { listJournalForWorkspace } from "@/lib/queries/journal";
import { JournalList } from "@/components/journal/journal-list";

export default async function JournalPage() {
  const workspace = await getCurrentWorkspace();
  if (!workspace) redirect("/login");

  const entries = await listJournalForWorkspace(workspace.workspace_id);

  return <JournalList entries={entries} />;
}
