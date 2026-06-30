import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { getAppBaseUrl } from "@/lib/env";
import { listPublishedForWorkspace } from "@/lib/queries/journal";
import {
  matchSubmissionCareRecommendation,
  type SubmissionCareRecommendation,
} from "@/lib/care-center/match-submission-recommendation";

export async function resolveSubmissionCareRecommendation(input: {
  workspaceId: string;
  patientNotes: string | null;
}): Promise<SubmissionCareRecommendation | null> {
  const admin = createAdminClient();
  const [{ data: workspace }, entries] = await Promise.all([
    admin.from("workspaces").select("slug").eq("id", input.workspaceId).maybeSingle(),
    listPublishedForWorkspace(input.workspaceId),
  ]);

  return matchSubmissionCareRecommendation({
    patientNotes: input.patientNotes,
    entries,
    publicSlug: workspace?.slug ?? null,
    appBaseUrl: getAppBaseUrl(),
  });
}
