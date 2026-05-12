"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCurrentWorkspace } from "@/lib/auth-helpers";
import { generateSlug, isSafeDocPathSlug } from "@/lib/slug";
import { revalidatePath } from "next/cache";

const profileRoleError = "Dieser Schritt ist für Ihre Rolle nicht vorgesehen.";

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
}

export async function saveProfileData(
  payload: SaveProfilePayload
): Promise<{ error?: string; success?: boolean }> {
  const workspace = await getCurrentWorkspace();
  if (!workspace) return { error: "Nicht angemeldet." };
  if (workspace.role !== "doctor") return { error: profileRoleError };

  const supabase = await createClient();

  const { data: existingBranding } = await supabase
    .from("profile_data")
    .select("logo_url, accent_color")
    .eq("workspace_id", workspace.workspace_id)
    .maybeSingle();

  const display_name =
    [payload.first_name, payload.last_name].filter(Boolean).join(" ").trim() ||
    null;

  const row = {
    workspace_id: workspace.workspace_id,
    first_name: payload.first_name || null,
    last_name: payload.last_name || null,
    title: payload.title || null,
    display_name,
    founding_year: payload.founding_year,
    vita_markdown: payload.vita_markdown || null,
    specializations: payload.specializations,
    services_structured: payload.services_structured,
    practice_name: payload.practice_name || null,
    practice_address: payload.practice_address || null,
    practice_employment_status: payload.practice_employment_status || null,
    practice_phone: payload.practice_phone || null,
    practice_email: payload.practice_email || null,
    practice_website: payload.practice_website || null,
    practice_hours: payload.practice_hours || null,
    logo_url: existingBranding?.logo_url ?? null,
    accent_color: existingBranding?.accent_color ?? null,
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
      await supabase
        .from("workspaces")
        .update({ slug: newSlug })
        .eq("id", workspace.workspace_id);
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

  const allowed = ["image/jpeg", "image/png", "image/webp"];
  if (!allowed.includes(file.type)) {
    return { error: "Format nicht unterstützt. JPG, PNG oder WEBP." };
  }

  const admin = createAdminClient();
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
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

  await admin
    .from("profile_data")
    .update({ photo_url: publicUrl } as never)
    .eq("workspace_id", workspace.workspace_id);

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
  await admin
    .from("profile_data")
    .update({ photo_url: null } as never)
    .eq("workspace_id", workspace.workspace_id);

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
