import { createAdminClient } from "@/lib/supabase/admin";

export interface PublicProfile {
  workspace_id: string;
  workspace_name: string;
  slug: string;
  display_name: string | null;
  title: string | null;
  photo_url: string | null;
  vita_markdown: string | null;
  services: string[];
  practice_name: string | null;
  practice_address: string | null;
  practice_employment_status: string | null;
  practice_phone: string | null;
  practice_email: string | null;
  practice_website: string | null;
}

function normalizeServices(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((item): item is string => typeof item === "string");
}

export async function getPublicProfileBySlug(
  slug: string
): Promise<PublicProfile | null> {
  const admin = createAdminClient();

  const { data: workspace, error: wsError } = await admin
    .from("workspaces")
    .select("id, name, slug")
    .eq("slug", slug)
    .single();

  if (wsError || !workspace) {
    return null;
  }

  const { data: profile } = await admin
    .from("profile_data")
    .select("*")
    .eq("workspace_id", workspace.id)
    .single();

  if (!profile) {
    return {
      workspace_id: workspace.id,
      workspace_name: workspace.name,
      slug: workspace.slug,
      display_name: null,
      title: null,
      photo_url: null,
      vita_markdown: null,
      services: [],
      practice_name: null,
      practice_address: null,
      practice_employment_status: null,
      practice_phone: null,
      practice_email: null,
      practice_website: null,
    };
  }

  return {
    workspace_id: workspace.id,
    workspace_name: workspace.name,
    slug: workspace.slug,
    display_name: profile.display_name,
    title: profile.title,
    photo_url: profile.photo_url,
    vita_markdown: profile.vita_markdown,
    services: normalizeServices(profile.services),
    practice_name: profile.practice_name,
    practice_address: profile.practice_address,
    practice_employment_status: profile.practice_employment_status,
    practice_phone: profile.practice_phone,
    practice_email: profile.practice_email,
    practice_website: profile.practice_website,
  };
}

export async function getRecentJournalEntries(workspaceId: string, limit = 3) {
  const admin = createAdminClient();

  const { data } = await admin
    .from("journal_entries")
    .select("id, title, slug, published_at")
    .eq("workspace_id", workspaceId)
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(limit);

  return data || [];
}
