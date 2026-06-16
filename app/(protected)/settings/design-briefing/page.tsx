import Link from "next/link";
import { redirect } from "next/navigation";

import { DesignBriefingView } from "@/components/settings/design-briefing-view";
import { PLATFORM_DESIGN_BRIEFING_SLUG } from "@/lib/design/platform-design-briefing/types";
import { getPlatformDesignBriefingBundle } from "@/lib/queries/platform-design-briefing";
import { createClient } from "@/lib/supabase/server";

export const metadata = {
  title: "Design-Briefing",
};

export default async function DesignBriefingSettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: member } = await supabase
    .from("workspace_members")
    .select("role")
    .eq("user_id", user.id)
    .maybeSingle();

  if (member?.role !== "doctor") {
    redirect("/settings");
  }

  const { data: dbBriefing } = await supabase
    .from("platform_design_briefings")
    .select("id")
    .eq("slug", PLATFORM_DESIGN_BRIEFING_SLUG)
    .maybeSingle();

  const bundle = await getPlatformDesignBriefingBundle();

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 p-4 md:p-6">
      <Link href="/settings" className="text-sm font-medium text-slate-600 hover:text-slate-900">
        ← Einstellungen
      </Link>
      <DesignBriefingView bundle={bundle} isFromDatabase={Boolean(dbBriefing?.id)} />
    </div>
  );
}
