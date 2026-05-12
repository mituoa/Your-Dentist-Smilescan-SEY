import "server-only";
import { createClient } from "@/lib/supabase/server";
// Scope: ein aktueller profile_data-Satz je Workspace. Keine Versionierung/Änderungshistorie im MVP (bewusst out of scope).
import {
  parseServicesStructured,
  parseSpecializations,
} from "@/lib/profile/parse-profile-fields";
import type {
  ProfileEditorData,
  ServiceStructured,
} from "@/lib/types/profile-editor-data";

export type { ProfileEditorData, ServiceStructured } from "@/lib/types/profile-editor-data";

export async function getProfileForEditor(
  workspaceId: string
): Promise<ProfileEditorData | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profile_data")
    .select("*")
    .eq("workspace_id", workspaceId)
    .single();

  // PGRST116 = keine Zeile (.single) — erwartbar, dann Insert-Versuch. Andere Codes: nur serverseitig loggen.
  if (error?.code && error.code !== "PGRST116") {
    console.error("[getProfileForEditor] select", error.code);
  }

  if (error || !data) {
    const { data: inserted, error: insertError } = await supabase
      .from("profile_data")
      .insert({ workspace_id: workspaceId } as never)
      .select()
      .single();
    if (insertError) {
      console.error("[getProfileForEditor] insert", insertError.code ?? "unknown");
      return null;
    }
    if (!inserted) return null;
    return mapToEditor(inserted as Record<string, unknown>);
  }

  return mapToEditor(data as Record<string, unknown>);
}

function mapToEditor(data: Record<string, unknown>): ProfileEditorData {
  return {
    workspace_id: data.workspace_id as string,
    first_name: (data.first_name as string | null) ?? null,
    last_name: (data.last_name as string | null) ?? null,
    title: (data.title as string | null) ?? null,
    display_name: (data.display_name as string | null) ?? null,
    founding_year:
      typeof data.founding_year === "number" ? data.founding_year : null,
    photo_url: (data.photo_url as string | null) ?? null,
    vita_markdown: (data.vita_markdown as string | null) ?? null,
    specializations: parseSpecializations(data.specializations),
    services_structured: parseServicesStructured(data.services_structured),
    practice_name: (data.practice_name as string | null) ?? null,
    practice_address: (data.practice_address as string | null) ?? null,
    practice_employment_status:
      (data.practice_employment_status as string | null) ?? null,
    practice_phone: (data.practice_phone as string | null) ?? null,
    practice_email: (data.practice_email as string | null) ?? null,
    practice_website: (data.practice_website as string | null) ?? null,
    practice_hours: (data.practice_hours as string | null) ?? null,
    logo_url: (data.logo_url as string | null) ?? null,
    accent_color: (data.accent_color as string | null) ?? null,
  };
}
