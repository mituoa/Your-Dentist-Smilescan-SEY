import { publicProfileToEditorData } from "@/lib/queries/public-profile";
import { listPublishedForWorkspace } from "@/lib/queries/journal";
import { EditorialProfile } from "@/components/profile-preview/editorial-profile";
import { getPublicDocProfileOrRedirect } from "@/lib/doc/resolve-public-doc-profile";

interface PublicProfilePageProps {
  params: Promise<{ slug: string }>;
}

export default async function PublicProfilePage({
  params,
}: PublicProfilePageProps) {
  const { slug } = await params;
  const profile = await getPublicDocProfileOrRedirect(slug, "");

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
