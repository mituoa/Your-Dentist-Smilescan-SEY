import { redirect } from "next/navigation";
import { getCurrentWorkspace } from "@/lib/auth-helpers";
import { listJournalForWorkspace } from "@/lib/queries/journal";
import {
  JournalsWorkspaceView,
  type JournalsContentTab,
} from "@/components/journal/journals-workspace-view";

function resolveTab(search: {
  tab?: string;
  view?: string;
}): JournalsContentTab {
  const t = search.tab;
  if (t === "published" || t === "drafts" || t === "create") return t;
  if (search.view === "published") return "published";
  if (search.view === "drafts") return "drafts";
  return "create";
}

export default async function JournalPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; view?: string }>;
}) {
  const workspace = await getCurrentWorkspace();
  if (!workspace) redirect("/login");
  if (workspace.role !== "doctor") {
    redirect("/my-tasks");
  }

  const sp = await searchParams;
  const initialTab = resolveTab(sp);
  const entries = await listJournalForWorkspace(workspace.workspace_id);

  return <JournalsWorkspaceView initialEntries={entries} initialTab={initialTab} />;
}
