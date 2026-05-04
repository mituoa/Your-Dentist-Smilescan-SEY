import "server-only";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import type { JournalEntry } from "@/lib/types/journal-entry";

export type { JournalEntry };

export async function listJournalForWorkspace(
  workspaceId: string
): Promise<JournalEntry[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("workspace_id", workspaceId)
    .order("updated_at", { ascending: false });
  return (data as JournalEntry[]) || [];
}

export async function getJournalEntry(id: string): Promise<JournalEntry | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("id", id)
    .single();
  return data as JournalEntry | null;
}

export async function getPublicJournalBySlug(
  workspaceId: string,
  articleSlug: string
): Promise<JournalEntry | null> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("journal_entries")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("slug", articleSlug)
    .eq("status", "published")
    .single();
  return data as JournalEntry | null;
}

export async function listPublishedForWorkspace(
  workspaceId: string
): Promise<JournalEntry[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("journal_entries")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("status", "published")
    .order("published_at", { ascending: false });
  return (data as JournalEntry[]) || [];
}

export async function getRelatedEntries(
  workspaceId: string,
  excludeId: string,
  limit = 3
): Promise<JournalEntry[]> {
  const admin = createAdminClient();
  const { data } = await admin
    .from("journal_entries")
    .select("*")
    .eq("workspace_id", workspaceId)
    .eq("status", "published")
    .neq("id", excludeId)
    .order("published_at", { ascending: false })
    .limit(limit);
  return (data as JournalEntry[]) || [];
}
