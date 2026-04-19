import { redirect } from "next/navigation";
import { createDraftArticle } from "@/app/(protected)/journal/actions";

export default async function NewJournalPage() {
  const result = await createDraftArticle();
  if (result.error || !result.id) redirect("/journal");
  redirect(`/journal/${result.id}/edit`);
}
