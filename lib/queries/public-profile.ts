import { createAdminClient } from "@/lib/supabase/admin";
import { parseProfileCareerPath } from "@/lib/profile/parse-career-path";
import { parseProfileCredentials } from "@/lib/profile/parse-credentials";
import {
  parseServicesStructured,
  parseSpecializations,
} from "@/lib/profile/parse-profile-fields";
import type { ProfileEditorData } from "@/lib/types/profile-editor-data";

export interface PublicProfile {
  workspace_id: string;
  workspace_name: string;
  slug: string;
  display_name: string | null;
  title: string | null;
  photo_url: string | null;
  vita_markdown: string | null;
  services: string[];
  first_name: string | null;
  last_name: string | null;
  founding_year: number | null;
  specializations: string[];
  services_structured: ProfileEditorData["services_structured"];
  practice_name: string | null;
  practice_address: string | null;
  practice_employment_status: string | null;
  practice_phone: string | null;
  practice_email: string | null;
  practice_website: string | null;
  practice_hours: string | null;
  practice_subtitle: string | null;
  profile_credentials: string[];
  profile_personal_approach: string | null;
  profile_career_path: string[];
  logo_url: string | null;
  accent_color: string | null;
  profile_background_color: string | null;
  appointment_link: string | null;
}

function normalizeServices(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter((item): item is string => typeof item === "string");
}

export function publicProfileToEditorData(
  profile: PublicProfile
): ProfileEditorData {
  return {
    workspace_id: profile.workspace_id,
    first_name: profile.first_name,
    last_name: profile.last_name,
    title: profile.title,
    display_name: profile.display_name,
    founding_year: profile.founding_year,
    photo_url: profile.photo_url,
    vita_markdown: profile.vita_markdown,
    specializations: profile.specializations,
    services_structured: profile.services_structured,
    practice_name: profile.practice_name,
    practice_address: profile.practice_address,
    practice_employment_status: profile.practice_employment_status,
    practice_phone: profile.practice_phone,
    practice_email: profile.practice_email,
    practice_website: profile.practice_website,
    practice_hours: profile.practice_hours,
    practice_subtitle: profile.practice_subtitle,
    profile_credentials: profile.profile_credentials,
    profile_personal_approach: profile.profile_personal_approach,
    profile_career_path: profile.profile_career_path,
    logo_url: profile.logo_url,
    accent_color: profile.accent_color,
    profile_background_color: profile.profile_background_color,
    appointment_link: profile.appointment_link,
  };
}

function mapProfileRow(
  workspace: { id: string; name: string; slug: string },
  profile: Record<string, unknown> | null
): PublicProfile {
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
      first_name: null,
      last_name: null,
      founding_year: null,
      specializations: [],
      services_structured: [],
      practice_name: null,
      practice_address: null,
      practice_employment_status: null,
      practice_phone: null,
      practice_email: null,
      practice_website: null,
      practice_hours: null,
      practice_subtitle: null,
      profile_credentials: [],
      profile_personal_approach: null,
      profile_career_path: [],
      logo_url: null,
      accent_color: null,
      profile_background_color: null,
      appointment_link: null,
    };
  }

  return {
    workspace_id: workspace.id,
    workspace_name: workspace.name,
    slug: workspace.slug,
    display_name: (profile.display_name as string | null) ?? null,
    title: (profile.title as string | null) ?? null,
    photo_url: (profile.photo_url as string | null) ?? null,
    vita_markdown: (profile.vita_markdown as string | null) ?? null,
    services: normalizeServices(profile.services),
    first_name: (profile.first_name as string | null) ?? null,
    last_name: (profile.last_name as string | null) ?? null,
    founding_year:
      typeof profile.founding_year === "number"
        ? profile.founding_year
        : null,
    specializations: parseSpecializations(profile.specializations),
    services_structured: parseServicesStructured(profile.services_structured),
    practice_name: (profile.practice_name as string | null) ?? null,
    practice_address: (profile.practice_address as string | null) ?? null,
    practice_employment_status:
      (profile.practice_employment_status as string | null) ?? null,
    practice_phone: (profile.practice_phone as string | null) ?? null,
    practice_email: (profile.practice_email as string | null) ?? null,
    practice_website: (profile.practice_website as string | null) ?? null,
    practice_hours: (profile.practice_hours as string | null) ?? null,
    practice_subtitle: (profile.practice_subtitle as string | null) ?? null,
    profile_credentials: parseProfileCredentials(profile.profile_credentials),
    profile_personal_approach: (profile.profile_personal_approach as string | null) ?? null,
    profile_career_path: parseProfileCareerPath(profile.profile_career_path),
    logo_url: (profile.logo_url as string | null) ?? null,
    accent_color: (profile.accent_color as string | null) ?? null,
    profile_background_color: (profile.profile_background_color as string | null) ?? null,
    appointment_link: (profile.appointment_link as string | null) ?? null,
  };
}

const PUBLIC_PROFILE_FIELDS =
  "display_name, title, photo_url, vita_markdown, services, first_name, last_name, founding_year, specializations, services_structured, practice_name, practice_address, practice_employment_status, practice_phone, practice_email, practice_website, practice_hours, practice_subtitle, profile_credentials, profile_personal_approach, profile_career_path, logo_url, accent_color, profile_background_color, appointment_link" as const;

export async function getPublicProfileBySlug(
  slug: string
): Promise<PublicProfile | null> {
  const admin = createAdminClient();

  const { data: workspace, error: wsError } = await admin
    .from("workspaces")
    .select("id, name, slug")
    .eq("slug", slug)
    .not("approved_at", "is", null)
    .single();

  if (wsError || !workspace) {
    return null;
  }

  const { data: profile } = await admin
    .from("profile_data")
    .select(PUBLIC_PROFILE_FIELDS)
    .eq("workspace_id", workspace.id)
    .single();

  return mapProfileRow(workspace, profile as Record<string, unknown> | null);
}