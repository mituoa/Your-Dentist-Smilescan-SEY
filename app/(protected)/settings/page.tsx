import { Suspense } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { getCurrentWorkspace } from "@/lib/auth-helpers";
import { getSettingsData } from "@/lib/queries/settings";
import { createClient } from "@/lib/supabase/server";
import { getAppBaseUrl } from "@/lib/env";
import { SettingsFigmaView } from "@/components/settings/settings-figma-view";
import { ClinicalSettingsSkeleton } from "@/components/workspace/clinical-route-skeleton";
import { parseThemeCookie, THEME_COOKIE_NAME } from "@/lib/theme";

export default async function SettingsPage() {
  const workspace = await getCurrentWorkspace();
  if (!workspace) redirect("/login");
  if (workspace.role !== "doctor") {
    redirect("/my-tasks");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const data = await getSettingsData(workspace.workspace_id);
  if (!data.workspace) {
    redirect("/login");
  }

  const cookieStore = await cookies();
  const theme = parseThemeCookie(cookieStore.get(THEME_COOKIE_NAME)?.value);

  return (
    <Suspense fallback={<ClinicalSettingsSkeleton />}>
      <SettingsFigmaView
        appBaseUrl={getAppBaseUrl()}
        initialSlug={data.workspace.slug}
        initialWorkspaceName={data.workspace.name}
        initialAppointmentLink={data.profile?.appointment_link ?? null}
        logoUrl={data.profile?.logo_url ?? null}
        initialAccentColor={data.profile?.accent_color || "#2F80ED"}
        userEmail={user.email ?? ""}
        initialTheme={theme}
        members={data.members}
        invitations={data.invitations}
        currentUserId={user.id}
      />
    </Suspense>
  );
}
