import { notFound } from "next/navigation";
import {
  getPublicProfileBySlug,
  getRecentJournalEntries,
} from "@/lib/queries/public-profile";
import { ProfileHero } from "@/components/public/profile-hero";
import { ProfileVita } from "@/components/public/profile-vita";
import { ProfileServices } from "@/components/public/profile-services";
import { ProfileWorkspace } from "@/components/public/profile-workspace";
import { ProfileJournalPreviews } from "@/components/public/profile-journal-previews";
import { ProfileCTA } from "@/components/public/profile-cta";

interface PublicProfilePageProps {
  params: Promise<{ slug: string }>;
}

export default async function PublicProfilePage({
  params,
}: PublicProfilePageProps) {
  const { slug } = await params;
  const profile = await getPublicProfileBySlug(slug);

  if (!profile) {
    notFound();
  }

  const journalEntries = await getRecentJournalEntries(profile.workspace_id);

  return (
    <>
      <ProfileHero
        displayName={profile.display_name}
        title={profile.title}
        photoUrl={profile.photo_url}
        practiceName={profile.practice_name}
      />

      <ProfileVita vitaMarkdown={profile.vita_markdown} />

      <ProfileServices services={profile.services} />

      <ProfileWorkspace
        practiceName={profile.practice_name}
        practiceAddress={profile.practice_address}
        practiceEmploymentStatus={profile.practice_employment_status}
        practicePhone={profile.practice_phone}
        practiceEmail={profile.practice_email}
        practiceWebsite={profile.practice_website}
      />

      <ProfileJournalPreviews entries={journalEntries} />

      <ProfileCTA slug={profile.slug} />
    </>
  );
}
