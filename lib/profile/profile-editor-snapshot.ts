import { buildWorkingStyleVita, parseWorkingStyleVita } from "@/lib/profile/working-style-library";
import type { ProfileEditorData } from "@/lib/types/profile-editor-data";

export type ProfileEditorWorkingState = ReturnType<typeof parseWorkingStyleVita>;

export function buildProfileEditorSnapshot(
  data: ProfileEditorData,
  working: ProfileEditorWorkingState
): string {
  const vita = buildWorkingStyleVita(working) || "";
  return JSON.stringify({
    first_name: data.first_name || "",
    last_name: data.last_name || "",
    title: data.title || "",
    founding_year: data.founding_year,
    vita_markdown: vita,
    specializations: [...data.specializations].sort(),
    services_structured: data.services_structured
      .map((s) => ({ id: s.id, name: s.name, note: s.note, custom: s.custom }))
      .sort((a, b) => a.id.localeCompare(b.id)),
    practice_name: data.practice_name || "",
    practice_address: data.practice_address || "",
    practice_employment_status: data.practice_employment_status || "",
    practice_phone: data.practice_phone || "",
    practice_email: data.practice_email || "",
    practice_website: data.practice_website || "",
    practice_hours: data.practice_hours || "",
    practice_subtitle: data.practice_subtitle || "",
    profile_credentials: [...(data.profile_credentials ?? [])].filter((c) => c.trim()).sort(),
    profile_personal_approach: (data.profile_personal_approach ?? "").trim(),
    profile_career_path: [...(data.profile_career_path ?? [])].filter((l) => l.trim()),
    profile_background_color: data.profile_background_color,
  });
}
