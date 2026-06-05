import { redirect } from "next/navigation";

/** Alias-Route wie in Figma (`/journals`) → Haupt-Journal. */
export default async function JournalsAliasPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const filter = typeof sp.filter === "string" ? sp.filter : undefined;
  const tab = typeof sp.tab === "string" ? sp.tab : undefined;
  const view = typeof sp.view === "string" ? sp.view : undefined;

  if (filter) {
    redirect(`/journal?filter=${encodeURIComponent(filter)}`);
  }

  const targetTab =
    tab ||
    (view === "published" ? "published" : view === "drafts" ? "drafts" : undefined);
  const q = targetTab ? `?tab=${encodeURIComponent(targetTab)}` : "";
  redirect(`/journal${q}`);
}
