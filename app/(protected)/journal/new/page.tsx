import { redirect } from "next/navigation";
import { getCurrentWorkspace } from "@/lib/auth-helpers";
import { createDraftArticle } from "@/app/(protected)/journal/actions";

export default async function NewJournalPage() {
  const workspace = await getCurrentWorkspace();
  if (!workspace) redirect("/login");
  if (workspace.role !== "doctor") redirect("/my-tasks");

  const result = await createDraftArticle();
  if (result.error || !result.id) redirect("/journal");
  redirect(`/journal/${result.id}/edit`);
}
