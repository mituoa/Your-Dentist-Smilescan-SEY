import { notFound } from "next/navigation";
import { getPublicProfileBySlug, publicProfileToEditorData } from "@/lib/queries/public-profile";
import { listPublishedForWorkspace } from "@/lib/queries/journal";
import { EditorialProfile } from "@/components/profile-preview/editorial-profile";

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

  const journalEntries = await listPublishedForWorkspace(profile.workspace_id);
  const data = publicProfileToEditorData(profile);

  return (
    <EditorialProfile
      data={data}
      workspaceName={profile.workspace_name}
      slug={profile.slug}
      journalEntries={journalEntries}
    />
  );
}
