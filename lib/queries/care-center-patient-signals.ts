import "server-only";

import { deriveSubmissionIssueShortLine } from "@/lib/inbox/derive-submission-issue-short-line";
import { formatLastUpdatedLabel } from "@/lib/journal/workspace-display";
import { createClient } from "@/lib/supabase/server";

export type CareCenterPatientSignal = {
  id: string;
  patientName: string;
  concernLine: string;
  relativeTime: string;
};

export async function listCareCenterPatientSignals(
  workspaceId: string,
  limit = 5
): Promise<CareCenterPatientSignal[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("submissions")
    .select("id, patient_name, patient_notes, created_at")
    .eq("workspace_id", workspaceId)
    .eq("is_draft", false)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (!data?.length) return [];

  return data.map((row) => ({
    id: row.id,
    patientName: (row.patient_name || "Patient").trim(),
    concernLine: deriveSubmissionIssueShortLine(row.patient_notes, row.patient_name, {
      maxLen: 120,
      emptyLabel: "Anfrage ohne Text",
    }),
    relativeTime: formatLastUpdatedLabel(row.created_at),
  }));
}
