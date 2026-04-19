import { redirect } from "next/navigation";
import { getCurrentWorkspace } from "@/lib/auth-helpers";
import { getSettingsData } from "@/lib/queries/settings";
import { createClient } from "@/lib/supabase/server";
import { getAppBaseUrl } from "@/lib/env";
import { TerminlinkSection } from "@/components/settings/terminlink-section";
import { SlugSection } from "@/components/settings/slug-section";
import { AccountSection } from "@/components/settings/account-section";
import { TeamSection } from "@/components/settings/team-section";
import { BrandingSection } from "@/components/settings/branding-section";
import { DangerZone } from "@/components/settings/danger-zone";

export default async function SettingsPage() {
  const workspace = await getCurrentWorkspace();
  if (!workspace) redirect("/login");

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const data = await getSettingsData(workspace.workspace_id);
  if (!data.workspace) {
    return <div className="p-12">Workspace nicht gefunden.</div>;
  }

  const isDoctor = workspace.role === "doctor";

  return (
    <div className="max-w-4xl mx-auto px-6 py-12 space-y-16">
      <div>
        <p className="text-xs font-mono uppercase tracking-wider text-text-tertiary mb-3">
          Einstellungen
        </p>
        <h1 className="font-serif text-5xl font-light tracking-tight mb-4">
          Einstellungen
        </h1>
        <p className="text-text-secondary max-w-xl">
          Account, Team und Erscheinungsbild Ihrer Praxis.
        </p>
      </div>

      <TerminlinkSection initial={data.profile?.appointment_link || null} />

      <SlugSection
        currentSlug={data.workspace.slug}
        appBaseUrl={getAppBaseUrl()}
      />

      <AccountSection
        email={user.email!}
        workspaceName={data.workspace.name}
      />

      {isDoctor && (
        <TeamSection
          members={data.members}
          invitations={data.invitations}
          currentUserId={user.id}
        />
      )}

      {isDoctor && (
        <BrandingSection
          logoUrl={data.profile?.logo_url || null}
          accentColor={data.profile?.accent_color || "#0F6E56"}
        />
      )}

      <DangerZone />
    </div>
  );
}
