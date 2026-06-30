import "server-only";

import { buildCommandMessageDraft } from "@/lib/command-ai/build-command-message-draft";
import {
  mergeSubmissionContextIntoSignals,
  parseMessageSignals,
} from "@/lib/command-ai/message-signals";
import { resolveCommandReplyIntent } from "@/lib/command-ai/reply-intent";
import { appendCareCenterRecommendationToDraft } from "@/lib/care-center/format-patient-article-block";
import { resolveSubmissionCareRecommendation } from "@/lib/care-center/resolve-submission-care-recommendation";
import type { UrgencyKey } from "@/lib/clinical/message-templates";
import { createAdminClient } from "@/lib/supabase/admin";

function toUrgencyKey(urgency: string | null | undefined): UrgencyKey {
  if (
    urgency === "today" ||
    urgency === "within_24h" ||
    urgency === "this_week" ||
    urgency === "not_urgent"
  ) {
    return urgency;
  }
  return null;
}

type BootstrapSubmissionMessageDraftInput = {
  workspaceId: string;
  submissionId: string;
  patientName: string;
  patientNotes: string | null;
  practicePhone: string;
  appointmentUrl: string | null;
  submissionUrgency?: string | null;
  photoCount?: number;
};

/**
 * Legt nach Einsendung einen KI-Entwurf an — inkl. passendem Care-Center-Artikel, wenn Inhalte vorhanden sind.
 * Best-effort: Fehler blockieren den Einsendungs-Flow nicht.
 */
export async function bootstrapSubmissionMessageDraftBestEffort(
  input: BootstrapSubmissionMessageDraftInput
): Promise<void> {
  try {
    const admin = createAdminClient();
    const { data: existing } = await admin
      .from("message_drafts")
      .select("id")
      .eq("submission_id", input.submissionId)
      .eq("workspace_id", input.workspaceId)
      .eq("status", "draft")
      .maybeSingle();

    if (existing?.id) return;

    const rawText = input.patientNotes ?? "";
    const signals = mergeSubmissionContextIntoSignals(parseMessageSignals(rawText), {
      urgency: input.submissionUrgency ?? null,
      photoCount: input.photoCount ?? 1,
    });
    const replyIntent = resolveCommandReplyIntent(rawText, signals);

    const bodyBase = buildCommandMessageDraft({
      patientName: input.patientName,
      practicePhone: input.practicePhone,
      appointmentUrl: input.appointmentUrl,
      signals,
      replyIntent,
      submissionUrgency: toUrgencyKey(input.submissionUrgency),
    });

    const recommendation = await resolveSubmissionCareRecommendation({
      workspaceId: input.workspaceId,
      patientNotes: input.patientNotes,
    });

    const body = recommendation
      ? appendCareCenterRecommendationToDraft(bodyBase, recommendation)
      : bodyBase;

    const { error } = await admin.from("message_drafts").insert({
      workspace_id: input.workspaceId,
      submission_id: input.submissionId,
      body,
      status: "draft",
      created_by_kind: "ai",
      created_by_user_id: null,
    });

    if (error) {
      console.error(
        "[care-center] bootstrap draft failed",
        (error as { code?: string }).code ?? "unknown"
      );
    }
  } catch (error) {
    console.error("[care-center] bootstrap draft failed", error);
  }
}
