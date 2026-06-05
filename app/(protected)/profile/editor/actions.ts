"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentWorkspace } from "@/lib/auth-helpers";
import { generateSlug, isSafeDocPathSlug } from "@/lib/slug";
import { MAX_FIGMA_SPECIALTY_SELECTIONS } from "@/lib/profile/figma-specialties";
import { normalizeProfileBackgroundHex } from "@/lib/profile/carree-theme";
import { parseProfileCareerPath } from "@/lib/profile/parse-career-path";
import { parseProfileCredentials } from "@/lib/profile/parse-credentials";
import { PROFILE_LIMITS } from "@/lib/validation/profile-limits";
import { revalidatePath } from "next/cache";

const profileRoleError = "Dieser Schritt ist für Ihre Rolle nicht vorgesehen.";

/** Schutz vor übergroßen Payloads / Mass-Assignment über JSON-Felder (Server Action). */
const MAX_SERVICES_STRUCTURED_ITEMS = 100;

function clampStr(value: unknown, max: number): string {
  const s = typeof value === "string" ? value : String(value ?? "");
  return s.length <= max ? s : s.slice(0, max);
}

function sanitizeFoundingYear(value: number | null): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  const y = Math.round(value);
  if (y < 1800 || y > 2100) return null;
  return y;
}

function sanitizeSpecializations(raw: unknown): string[] {
  const arr = Array.isArray(raw) ? raw : [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of arr.slice(0, MAX_FIGMA_SPECIALTY_SELECTIONS * 4)) {
    const id = clampStr(item, PROFILE_LIMITS.specialization_custom);
    if (!id || seen.has(id)) continue;
    seen.add(id);
    out.push(id);
    if (out.length >= MAX_FIGMA_SPECIALTY_SELECTIONS) break;
  }
  return out;
}

function sanitizeServicesStructured(
  raw: SaveProfilePayload["services_structured"]
): SaveProfilePayload["services_structured"] {
  const arr = Array.isArray(raw) ? raw : [];
  return arr
    .slice(0, MAX_SERVICES_STRUCTURED_ITEMS)
    .map((s) => ({
      id: clampStr(s?.id, 64),
      name: clampStr(s?.name, PROFILE_LIMITS.service_name),
      note: clampStr(s?.note, PROFILE_LIMITS.service_note),
      custom: Boolean(s?.custom),
    }))
    .filter((s) => s.id.length > 0 && s.name.length > 0);
}

function sanitizeCredentials(raw: unknown): string[] {
  return parseProfileCredentials(raw)
    .map((line) => clampStr(line, PROFILE_LIMITS.credential_line))
    .filter(Boolean);
}

function sanitizeCareerPath(raw: unknown): string[] {
  return parseProfileCareerPath(raw)
    .map((line) => clampStr(line, PROFILE_LIMITS.career_line))
    .filter(Boolean);
}

function sanitizeSavePayload(payload: SaveProfilePayload): SaveProfilePayload {
  return {
    first_name: clampStr(payload.first_name, PROFILE_LIMITS.first_name),
    last_name: clampStr(payload.last_name, PROFILE_LIMITS.last_name),
    title: clampStr(payload.title, PROFILE_LIMITS.title),
    founding_year: sanitizeFoundingYear(payload.founding_year),
    vita_markdown: clampStr(payload.vita_markdown, PROFILE_LIMITS.vita_markdown),
    specializations: sanitizeSpecializations(payload.specializations),
    services_structured: sanitizeServicesStructured(payload.services_structured),
    practice_name: clampStr(payload.practice_name, PROFILE_LIMITS.practice_name),
    practice_address: clampStr(payload.practice_address, PROFILE_LIMITS.practice_address),
    practice_employment_status: clampStr(
      payload.practice_employment_status,
      PROFILE_LIMITS.practice_employment_status
    ),
    practice_phone: clampStr(payload.practice_phone, PROFILE_LIMITS.practice_phone),
    practice_email: clampStr(payload.practice_email, PROFILE_LIMITS.practice_email),
    practice_website: clampStr(payload.practice_website, PROFILE_LIMITS.practice_website),
    practice_hours: clampStr(payload.practice_hours, PROFILE_LIMITS.practice_hours),
    practice_subtitle: clampStr(payload.practice_subtitle, PROFILE_LIMITS.practice_subtitle),
    profile_credentials: sanitizeCredentials(payload.profile_credentials),
    profile_personal_approach: clampStr(
      payload.profile_personal_approach,
      PROFILE_LIMITS.personal_approach
    ),
    profile_career_path: sanitizeCareerPath(payload.profile_career_path),
    profile_background_color: normalizeProfileBackgroundHex(payload.profile_background_color),
  };
}

export interface SaveProfilePayload {
  first_name: string;
  last_name: string;
  title: string;
  founding_year: number | null;
  vita_markdown: string;
  specializations: string[];
  services_structured: Array<{
    id: string;
    name: string;
    note: string;
    custom: boolean;
  }>;
  practice_name: string;
  practice_address: string;
  practice_employment_status: string;
  practice_phone: string;
  practice_email: string;
  practice_website: string;
  practice_hours: string;
  practice_subtitle: string;
  profile_credentials: string[];
  profile_personal_approach: string;
  profile_career_path: string[];
  profile_background_color: string | null;
}

export async function saveProfileData(
  payload: SaveProfilePayload
): Promise<{ error?: string; success?: boolean }> {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "Nicht angemeldet." };
  if (workspace.role !== "doctor") return { error: profileRoleError };

  const p = sanitizeSavePayload(payload);

  const supabase = await createClient();

  const { data: existingBranding } = await supabase
    .from("profile_data")
    .select("logo_url, accent_color")
    .eq("workspace_id", workspace.workspace_id)
    .maybeSingle();

  const display_name =
    [p.first_name, p.last_name].filter(Boolean).join(" ").trim() || null;

  const row = {
    workspace_id: workspace.workspace_id,
    first_name: p.first_name || null,
    last_name: p.last_name || null,
    title: p.title || null,
    display_name,
    founding_year: p.founding_year,
    vita_markdown: p.vita_markdown || null,
    specializations: p.specializations,
    services_structured: p.services_structured,
    practice_name: p.practice_name || null,
    practice_address: p.practice_address || null,
    practice_employment_status: p.practice_employment_status || null,
    practice_phone: p.practice_phone || null,
    practice_email: p.practice_email || null,
    practice_website: p.practice_website || null,
    practice_hours: p.practice_hours || null,
    practice_subtitle: p.practice_subtitle || null,
    profile_credentials: p.profile_credentials,
    profile_personal_approach: p.profile_personal_approach || null,
    profile_career_path: p.profile_career_path,
    logo_url: existingBranding?.logo_url ?? null,
    accent_color: existingBranding?.accent_color ?? null,
    profile_background_color: p.profile_background_color,
  };

  const { error } = await supabase
    .from("profile_data")
    .upsert(row as never, { onConflict: "workspace_id" });

  if (error) {
    console.error("[saveProfile]", (error as { code?: string }).code ?? "unknown");
    return { error: "Speichern fehlgeschlagen." };
  }

  if (display_name) {
    const newSlug = generateSlug(display_name);
    if (newSlug) {
      const { error: slugErr } = await supabase
        .from("workspaces")
        .update({ slug: newSlug })
        .eq("id", workspace.workspace_id);
      if (slugErr) {
        console.error("[saveProfileData] workspace slug update", slugErr.code ?? "unknown");
      }
    }
  }

  const { data: wsRow } = await supabase
    .from("workspaces")
    .select("slug")
    .eq("id", workspace.workspace_id)
    .single();

  revalidatePath("/profile/editor");
  revalidatePath("/profile");
  const slugAfter = typeof wsRow?.slug === "string" ? wsRow.slug.trim() : "";
  if (slugAfter.length > 0 && isSafeDocPathSlug(slugAfter)) {
    revalidatePath(`/doc/${slugAfter}`);
  }

  return { success: true };
}

export async function uploadPortraitPhoto(
  formData: FormData
): Promise<{ error?: string; url?: string }> {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "Nicht angemeldet." };
  if (workspace.role !== "doctor") return { error: profileRoleError };

  const file = formData.get("file") as File;
  if (!file || file.size === 0) return { error: "Keine Datei ausgewählt." };

  if (file.size > 10 * 1024 * 1024) {
    return { error: "Datei zu groß. Maximum 10 MB." };
  }

  const allowed = ["image/jpeg", "image/png", "image/webp"] as const;
  if (!allowed.includes(file.type as (typeof allowed)[number])) {
    return { error: "Format nicht unterstützt. JPG, PNG oder WEBP." };
  }

  const admin = createAdminClient();
  const ext =
    file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
  const path = `${workspace.workspace_id}/portrait-${Date.now()}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { error: uploadError } = await admin.storage
    .from("profile-photos")
    .upload(path, buffer, { contentType: file.type, upsert: false });

  if (uploadError) {
    console.error("[uploadPortrait]", (uploadError as { code?: string }).code ?? "unknown");
    return { error: "Upload fehlgeschlagen." };
  }

  const { data: urlData } = admin.storage
    .from("profile-photos")
    .getPublicUrl(path);
  const publicUrl = urlData.publicUrl;

  const { error: linkErr } = await admin
    .from("profile_data")
    .update({ photo_url: publicUrl } as never)
    .eq("workspace_id", workspace.workspace_id);
  if (linkErr) {
    console.error("[uploadPortraitPhoto] profile_data update", linkErr.code ?? "unknown");
    return { error: "Das Foto wurde hochgeladen, konnte aber nicht mit Ihrem Profil verknüpft werden. Bitte versuchen Sie es erneut." };
  }

  revalidatePath("/profile/editor");
  const { data: wsRow } = await admin
    .from("workspaces")
    .select("slug")
    .eq("id", workspace.workspace_id)
    .single();
  const slugAfter = typeof wsRow?.slug === "string" ? wsRow.slug.trim() : "";
  if (slugAfter.length > 0 && isSafeDocPathSlug(slugAfter)) {
    revalidatePath(`/doc/${slugAfter}`);
  }

  return { url: publicUrl };
}

export async function deletePortraitPhoto(): Promise<{
  error?: string;
  success?: boolean;
}> {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "Nicht angemeldet." };
  if (workspace.role !== "doctor") return { error: profileRoleError };

  const admin = createAdminClient();
  const { error: clearErr } = await admin
    .from("profile_data")
    .update({ photo_url: null } as never)
    .eq("workspace_id", workspace.workspace_id);
  if (clearErr) {
    console.error("[deletePortraitPhoto] profile_data update", clearErr.code ?? "unknown");
    return { error: "Porträt konnte nicht entfernt werden. Bitte versuchen Sie es erneut." };
  }

  revalidatePath("/profile/editor");
  const { data: wsRow } = await admin
    .from("workspaces")
    .select("slug")
    .eq("id", workspace.workspace_id)
    .single();
  const slugAfter = typeof wsRow?.slug === "string" ? wsRow.slug.trim() : "";
  if (slugAfter.length > 0 && isSafeDocPathSlug(slugAfter)) {
    revalidatePath(`/doc/${slugAfter}`);
  }

  return { success: true };
}
