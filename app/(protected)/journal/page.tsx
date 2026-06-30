import { redirect } from "next/navigation";
import { getCurrentUser, getCurrentWorkspace } from "@/lib/auth-helpers";
import { cockpitDoctorLabel } from "@/lib/format-doctor-display-name";
import { listCareCenterPatientSignals } from "@/lib/queries/care-center-patient-signals";
import { listJournalForWorkspace } from "@/lib/queries/journal";
import { createClient } from "@/lib/supabase/server";
import { CareCenter } from "@/components/care-center/care-center";

export default async function JournalPage() {
  const workspace = await getCurrentWorkspace();
  if (!workspace) redirect("/login");
  if (workspace.role !== "doctor") {
    redirect("/my-tasks");
  }

  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("user_id", user.id)
    .maybeSingle();

  const [entries, patientSignals] = await Promise.all([
    listJournalForWorkspace(workspace.workspace_id),
    listCareCenterPatientSignals(workspace.workspace_id),
  ]);

  // @ts-expect-error - workspaces is joined
  const publicSlug = (workspace.workspaces?.slug as string | undefined) ?? null;
  const authorLabel = cockpitDoctorLabel(profile?.display_name);

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <CareCenter
        initialEntries={entries}
        authorLabel={authorLabel}
        publicSlug={publicSlug}
        patientSignals={patientSignals}
      />
    </div>
  );
}
