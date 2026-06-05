"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentWorkspace } from "@/lib/auth-helpers";
import { generateSlug } from "@/lib/slug";
import { revalidatePath } from "next/cache";
import {
  calculateReadingTime,
  countWords,
  JOURNAL_LIMITS,
} from "@/lib/validation/journal-limits";
import { isClinicalAreaId } from "@/lib/journal/clinical-areas";
import { isContentType } from "@/lib/journal/content-categories";
import { JOURNAL_TOPICS } from "@/lib/masterdata/journal-topics";

const VALID_TOPIC_IDS = new Set(JOURNAL_TOPICS.map((t) => t.id));

function sanitizeTopic(topic: string | null | undefined): string | null {
  if (!topic) return null;
  return VALID_TOPIC_IDS.has(topic) ? topic : null;
}

function sanitizeClinicalArea(value: string | null | undefined): string | null {
  if (!value) return null;
  return isClinicalAreaId(value) ? value : null;
}

function sanitizeContentType(value: string | null | undefined): string | null {
  if (!value) return null;
  return isContentType(value) ? value : null;
}

function isAllowedCoverUrl(url: string | null | undefined): boolean {
  if (!url) return true;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) return false;
  try {
    const parsed = new URL(url);
    const expected = new URL(supabaseUrl);
    return parsed.hostname === expected.hostname;
  } catch {
    return false;
  }
}

async function requireDoctorWorkspace() {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "Nicht angemeldet." as const, workspace: null };
  if (workspace.role !== "doctor")
    return { error: "Keine Berechtigung." as const, workspace: null };
  return { error: null, workspace };
}

export async function createDraftArticle(): Promise<{ id?: string; error?: string }> {
  const { error: authErr, workspace } = await requireDoctorWorkspace();
  if (authErr || !workspace) return { error: authErr || "Nicht angemeldet." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Nicht angemeldet." };

  const { data, error } = await supabase
    .from("journal_entries")
    .insert({
      workspace_id: workspace.workspace_id,
      author_id: user.id,
      title: null,
      slug: null,
      excerpt: null,
      content_markdown: null,
      topic: null,
      status: "draft",
      word_count: 0,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("[createDraft]", error);
    return { error: "Entwurf konnte nicht erstellt werden." };
  }

  return { id: data.id };
}

export interface SaveArticlePayload {
  id: string;
  title: string;
  excerpt: string;
  content_markdown: string;
  topic: string | null;
  clinical_area: string | null;
  content_type: string | null;
  cover_photo_url: string | null;
}

export async function saveArticle(
  payload: SaveArticlePayload
): Promise<{ error?: string; success?: boolean }> {
  const { error: authErr, workspace } = await requireDoctorWorkspace();
  if (authErr || !workspace) return { error: authErr || "Nicht angemeldet." };

  const supabase = await createClient();

  const safeTitle = payload.title
    ? payload.title.slice(0, JOURNAL_LIMITS.title)
    : null;
  const safeExcerpt = payload.excerpt
    ? payload.excerpt.slice(0, JOURNAL_LIMITS.excerpt)
    : null;
  const safeContent = payload.content_markdown
    ? payload.content_markdown.slice(0, JOURNAL_LIMITS.content_markdown)
    : null;

  const wordCount = countWords(safeContent || "");
  const readingTime = calculateReadingTime(wordCount);

  let slug: string | null = null;
  if (safeTitle?.trim()) {
    slug = generateSlug(safeTitle);
    if (slug.length > JOURNAL_LIMITS.slug) {
      slug = slug.substring(0, JOURNAL_LIMITS.slug);
    }
    const { data: existing } = await supabase
      .from("journal_entries")
      .select("id")
      .eq("workspace_id", workspace.workspace_id)
      .eq("slug", slug)
      .neq("id", payload.id);
    if (existing && existing.length > 0) {
      slug = `${slug}-${payload.id.slice(0, 6)}`;
    }
  }

  const safeTopic = sanitizeTopic(payload.topic);
  const safeClinicalArea = sanitizeClinicalArea(payload.clinical_area);
  const safeContentType = sanitizeContentType(payload.content_type);
  const safeCoverUrl = isAllowedCoverUrl(payload.cover_photo_url)
    ? payload.cover_photo_url
    : null;

  const { error } = await supabase
    .from("journal_entries")
    .update({
      title: safeTitle,
      slug,
      excerpt: safeExcerpt,
      content_markdown: safeContent,
      topic: safeTopic,
      clinical_area: safeClinicalArea,
      content_type: safeContentType,
      cover_photo_url: safeCoverUrl,
      word_count: wordCount,
      reading_time_minutes: readingTime,
    })
    .eq("id", payload.id)
    .eq("workspace_id", workspace.workspace_id);

  if (error) {
    console.error("[saveArticle]", error);
    return { error: "Speichern fehlgeschlagen." };
  }

  revalidatePath("/journal");
  revalidatePath(`/journal/${payload.id}/edit`);
  return { success: true };
}

async function revalidatePublicJournalPaths(
  supabase: Awaited<ReturnType<typeof createClient>>,
  workspaceId: string,
  articleSlug: string | null
) {
  const { data: ws } = await supabase
    .from("workspaces")
    .select("slug")
    .eq("id", workspaceId)
    .single();
  if (ws?.slug) {
    revalidatePath(`/doc/${ws.slug}`);
    revalidatePath(`/doc/${ws.slug}/journal`);
    if (articleSlug) {
      revalidatePath(`/doc/${ws.slug}/journal/${articleSlug}`);
    }
  }
}

export async function publishArticle(
  id: string
): Promise<{ error?: string; success?: boolean }> {
  const { error: authErr, workspace } = await requireDoctorWorkspace();
  if (authErr || !workspace) return { error: authErr || "Nicht angemeldet." };

  const supabase = await createClient();
  const { data: article } = await supabase
    .from("journal_entries")
    .select("*")
    .eq("id", id)
    .eq("workspace_id", workspace.workspace_id)
    .single();

  if (!article) return { error: "Artikel nicht gefunden." };
  if (!article.title) return { error: "Titel erforderlich zum Veröffentlichen." };
  if (!article.content_markdown)
    return { error: "Inhalt erforderlich zum Veröffentlichen." };
  const hasClinicalArea =
    article.clinical_area && isClinicalAreaId(article.clinical_area as string);
  const hasLegacyTopic = article.topic && VALID_TOPIC_IDS.has(article.topic);
  if (!hasClinicalArea && !hasLegacyTopic)
    return { error: "Themenbereich erforderlich zum Veröffentlichen." };
  if (!article.slug) return { error: "Slug fehlt. Bitte Titel speichern." };

  const { error } = await supabase
    .from("journal_entries")
    .update({
      status: "published",
      published_at: article.published_at || new Date().toISOString(),
    })
    .eq("id", id)
    .eq("workspace_id", workspace.workspace_id);

  if (error) {
    console.error("[publishArticle]", error);
    return { error: "Veröffentlichung fehlgeschlagen." };
  }

  revalidatePath("/journal");
  revalidatePath(`/journal/${id}/edit`);
  await revalidatePublicJournalPaths(
    supabase,
    workspace.workspace_id,
    article.slug as string
  );

  return { success: true };
}

export async function unpublishArticle(
  id: string
): Promise<{ error?: string; success?: boolean }> {
  const { error: authErr, workspace } = await requireDoctorWorkspace();
  if (authErr || !workspace) return { error: authErr || "Nicht angemeldet." };

  const supabase = await createClient();
  const { data: article } = await supabase
    .from("journal_entries")
    .select("slug")
    .eq("id", id)
    .eq("workspace_id", workspace.workspace_id)
    .single();

  const { error } = await supabase
    .from("journal_entries")
    .update({ status: "draft" })
    .eq("id", id)
    .eq("workspace_id", workspace.workspace_id);

  if (error) return { error: "Zurücksetzen fehlgeschlagen." };

  revalidatePath("/journal");
  revalidatePath(`/journal/${id}/edit`);
  await revalidatePublicJournalPaths(
    supabase,
    workspace.workspace_id,
    article?.slug as string | null
  );

  return { success: true };
}

export async function deleteArticle(
  id: string
): Promise<{ error?: string; success?: boolean }> {
  const { error: authErr, workspace } = await requireDoctorWorkspace();
  if (authErr || !workspace) return { error: authErr || "Nicht angemeldet." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("journal_entries")
    .delete()
    .eq("id", id)
    .eq("workspace_id", workspace.workspace_id);

  if (error) return { error: "Löschen fehlgeschlagen." };

  revalidatePath("/journal");
  return { success: true };
}

export async function uploadCoverPhoto(
  formData: FormData
): Promise<{ error?: string; url?: string }> {
  const { error: authErr, workspace } = await requireDoctorWorkspace();
  if (authErr || !workspace) return { error: authErr || "Nicht angemeldet." };

  const file = formData.get("file") as File;
  if (!file || file.size === 0) return { error: "Keine Datei ausgewählt." };

  if (file.size > 10 * 1024 * 1024)
    return { error: "Datei zu groß. Maximum 10 MB." };

  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (!allowed.includes(file.type)) return { error: "Format nicht unterstützt." };

  const admin = createAdminClient();
  const ext =
    file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `${workspace.workspace_id}/cover-${Date.now()}.${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());
  const { error: upErr } = await admin.storage
    .from("journal-covers")
    .upload(path, buffer, { contentType: file.type, upsert: false });

  if (upErr) {
    console.error("[uploadCover]", (upErr as { code?: string }).code ?? "unknown");
    return { error: "Upload fehlgeschlagen." };
  }

  const { data } = admin.storage.from("journal-covers").getPublicUrl(path);
  return { url: data.publicUrl };
}
