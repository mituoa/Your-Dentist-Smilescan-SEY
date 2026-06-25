import type { PracticeSolution } from "@/lib/practice-solutions/catalog";
import type { LandingConfigId } from "@/lib/practice-solutions/landing-configs";
import type { ProfileEditorData } from "@/lib/types/profile-editor-data";

export type PracticeSolutionInquiryContext = {
  practiceName: string;
  contactEmail: string;
  contactName: string;
  contactPhone?: string;
  practiceSubtitle?: string | null;
  logoUrl?: string | null;
  photoUrl?: string | null;
  accentColor?: string | null;
  practiceAddress?: string | null;
  practiceHours?: string | null;
  practiceWebsite?: string | null;
  doctorDisplayName?: string | null;
  doctorTitle?: string | null;
  personalApproach?: string | null;
  specializations?: string[];
  services?: string[];
  credentials?: string[];
  appointmentLink?: string | null;
};

export type InquiryTarget = {
  solution: PracticeSolution;
  displayTitle: string;
  configId: LandingConfigId;
};

export function buildInquiryContextFromProfile(
  profile: ProfileEditorData | null,
  opts: {
    workspaceName: string;
    userEmail: string;
  }
): PracticeSolutionInquiryContext {
  const practiceName = profile?.practice_name?.trim() || opts.workspaceName;
  const contactName =
    profile?.display_name?.trim() ||
    [profile?.title, profile?.first_name, profile?.last_name].filter(Boolean).join(" ").trim() ||
    "";
  const contactEmail = profile?.practice_email?.trim() || opts.userEmail.trim();

  const services =
    profile?.services_structured
      ?.map((s) => s.name?.trim())
      .filter(Boolean)
      .slice(0, 6) ?? [];

  const specializations = profile?.specializations?.slice(0, 6) ?? [];

  return {
    practiceName,
    contactName,
    contactEmail,
    contactPhone: profile?.practice_phone?.trim() || undefined,
    practiceSubtitle: profile?.practice_subtitle,
    logoUrl: profile?.logo_url,
    photoUrl: profile?.photo_url,
    accentColor: profile?.accent_color,
    practiceAddress: profile?.practice_address,
    practiceHours: profile?.practice_hours,
    practiceWebsite: profile?.practice_website,
    doctorDisplayName: contactName || null,
    doctorTitle: profile?.title,
    personalApproach: profile?.profile_personal_approach,
    specializations,
    services,
    credentials: profile?.profile_credentials?.slice(0, 4) ?? [],
    appointmentLink: profile?.appointment_link,
  };
}
