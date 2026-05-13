import { redirect } from "next/navigation";
import { getCurrentWorkspace } from "@/lib/auth-helpers";
import { getJournalEntry } from "@/lib/queries/journal";
import { JournalComposer } from "@/components/journal/journal-composer";

interface EditPageProps {
  params: Promise<{ id: string }>;
}

export default async function EditArticlePage({ params }: EditPageProps) {
  const { id } = await params;
  const workspace = await getCurrentWorkspace();
  if (!workspace) redirect("/login");
  if (workspace.role !== "doctor") redirect("/my-tasks");

  const article = await getJournalEntry(id);
  if (!article || article.workspace_id !== workspace.workspace_id) redirect("/journal");

  return <JournalComposer article={article} />;
}
