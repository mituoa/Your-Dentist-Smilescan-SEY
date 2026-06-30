import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { getAppBaseUrl } from "@/lib/env";
import { listPublishedForWorkspace } from "@/lib/queries/journal";
import { journalEntryTitle } from "@/lib/journal/workspace-display";
import { matchesJournalSearch } from "@/lib/journal/journal-patient-knowledge";
import type { JournalEntry } from "@/lib/types/journal-entry";

export type CommandAiJournalSnippet = {
  id: string;
  title: string;
  excerpt: string | null;
  slug: string;
  publicUrl: string | null;
};

function buildPublicUrl(slug: string | null, articleSlug: string): string | null {
  if (!slug?.trim()) return null;
  const base = getAppBaseUrl().replace(/\/$/, "");
  return `${base}/doc/${slug}/journal/${articleSlug}`;
}

function scoreEntryForQuery(entry: JournalEntry, query: string): number {
  if (matchesJournalSearch(entry, query)) return 10;
  const q = query.toLowerCase();
  const title = journalEntryTitle(entry).toLowerCase();
  let score = 0;
  for (const token of q.split(/\s+/).filter((t) => t.length >= 4)) {
    if (title.includes(token)) score += 3;
    if ((entry.excerpt ?? "").toLowerCase().includes(token)) score += 2;
    if ((entry.content_markdown ?? "").toLowerCase().includes(token)) score += 1;
  }
  return score;
}

export async function searchJournalForCommandAi(input: {
  workspaceId: string;
  query: string;
  limit?: number;
}): Promise<CommandAiJournalSnippet[]> {
  const query = input.query.trim();
  if (!query) return [];

  const limit = input.limit ?? 5;
  const [entries, workspaceRow] = await Promise.all([
    listPublishedForWorkspace(input.workspaceId),
    createAdminClient()
      .from("workspaces")
      .select("slug")
      .eq("id", input.workspaceId)
      .maybeSingle(),
  ]);

  const publicSlug = workspaceRow.data?.slug ?? null;

  return entries
    .map((entry) => ({ entry, score: scoreEntryForQuery(entry, query) }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .filter(({ entry }) => Boolean(entry.slug))
    .map(({ entry }) => ({
      id: entry.id,
      title: journalEntryTitle(entry),
      excerpt: entry.excerpt?.trim().slice(0, 280) ?? null,
      slug: entry.slug as string,
      publicUrl: buildPublicUrl(publicSlug, entry.slug as string),
    }));
}

export function formatJournalSnippetsForPrompt(snippets: CommandAiJournalSnippet[]): string {
  if (snippets.length === 0) return "Keine passenden Journal-Artikel gefunden.";
  return snippets
    .map(
      (s, i) =>
        `${i + 1}. ${s.title}${s.publicUrl ? ` (${s.publicUrl})` : ""}\n   ${s.excerpt ?? "—"}`
    )
    .join("\n");
}
