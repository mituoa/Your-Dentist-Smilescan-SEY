import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { getCurrentWorkspace } from "@/lib/auth-helpers";
import { getProfileData, getSubmissionById } from "@/lib/queries/submissions";
import { CaseCreatedToast } from "@/components/inbox/case-created-toast";
import { TrackerWorkspace } from "@/components/inbox/tracker-workspace";
import { InboxAssistHydration } from "@/components/command-assist/inbox-assist-hydration";
import { InboxMobileBack } from "@/components/inbox/inbox-mobile-back";
import { deriveSubmissionIssueShortLine } from "@/lib/inbox/derive-submission-issue-short-line";
import {
  trackerStatusForRow,
  type EnrichedSubmissionListItem,
} from "@/lib/inbox/tracker-inbox-logic";
import type { MessageDraftListStatus } from "@/lib/message-drafts/list-status";
import { getInboxSubmissions } from "@/lib/queries/inbox";
import { loadMessageDraftDetailForSubmission } from "@/lib/queries/message-drafts";
import { markSubmissionSeen } from "./actions";

interface InboxDetailPageProps {
  params: Promise<{ id: string }>;
}

function messageDraftStatusFromDetail(
  editable: { status: string } | null,
  history: { status: string } | null,
  available: boolean
): MessageDraftListStatus {
  if (!available) return "none";
  if (editable) return "draft";
  if (history?.status === "sent") return "sent";
  if (history?.status === "approved") return "approved";
  if (history) return "approved";
  return "none";
}

export default async function InboxDetailPage({ params }: InboxDetailPageProps) {
  const { id } = await params;
  const workspace = await getCurrentWorkspace();

  if (!workspace) {
    redirect("/login?error=workspace_missing");
  }

  const submission = await getSubmissionById(id, workspace.workspace_id);

  if (!submission || submission.workspace_id !== workspace.workspace_id) {
    notFound();
  }

  const profileRow = await getProfileData(workspace.workspace_id);

  if (!submission.seen_at) {
    markSubmissionSeen(id).catch(() => {});
  }

  const isDoctor = workspace.role === "doctor";
  const concernPreview = deriveSubmissionIssueShortLine(
    submission.patient_notes,
    submission.patient_name,
    { maxLen: 120, emptyLabel: "Einsendung" }
  );
  const practicePhone = profileRow?.practice_phone ?? null;
  const appointmentUrl = profileRow?.appointment_link ?? null;

  const messageDraftLoad = await loadMessageDraftDetailForSubmission(
    submission.id,
    workspace.workspace_id
  );

  const messageDraftStatus = messageDraftStatusFromDetail(
    messageDraftLoad.available ? messageDraftLoad.editableDraft : null,
    messageDraftLoad.available ? messageDraftLoad.historyDraft : null,
    messageDraftLoad.available
  );

  const listResult = await getInboxSubmissions(workspace.workspace_id);
  const openTaskCount = listResult.ok
    ? (listResult.items.find((i) => i.id === id)?.open_task_count ?? 0)
    : 0;

  const statusRow: EnrichedSubmissionListItem = {
    id: submission.id,
    patient_name: submission.patient_name,
    patient_email: submission.patient_email,
    patient_notes: submission.patient_notes,
    patient_birth_date: submission.patient_birth_date,
    patient_external_id: submission.patient_external_id,
    urgency: submission.urgency,
    is_draft: submission.is_draft,
    created_at: submission.created_at,
    seen_at: submission.seen_at,
    photo_count: submission.photos.length,
    message_draft_status: messageDraftStatus,
    intake_channel: submission.intake_channel,
    open_task_count: openTaskCount,
    photo_documentation: null,
  };

  const status = trackerStatusForRow(statusRow);

  return (
    <>
      <InboxAssistHydration
        submissionId={submission.id}
        patientName={submission.patient_name}
        urgency={submission.urgency}
        practicePhone={practicePhone}
        appointmentUrl={appointmentUrl}
        concernLine={concernPreview}
      />
      <CaseCreatedToast />

      <div className="yd-tracker-v4-detail flex h-full min-h-0 flex-1 flex-col overflow-hidden max-md:overflow-y-auto max-md:overscroll-y-contain">
        <div className="yd-tracker-v4-detail__bar shrink-0 px-4 pb-2 pt-[max(12px,env(safe-area-inset-top))] max-md:sticky max-md:top-0 max-md:z-[6] md:px-6 md:pt-4">
          <Suspense fallback={null}>
            <InboxMobileBack />
          </Suspense>
        </div>

        <div className="yd-tracker-v4-detail__scroll min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 pb-[max(1.25rem,var(--safe-area-bottom))] md:px-6 md:pb-8 md:pt-2">
          <TrackerWorkspace
            submission={{
              id: submission.id,
              patient_name: submission.patient_name,
              patient_email: submission.patient_email,
              patient_phone: submission.patient_phone,
              patient_notes: submission.patient_notes,
              patient_birth_date: submission.patient_birth_date,
              urgency: submission.urgency,
              created_at: submission.created_at,
              is_draft: submission.is_draft,
              intake_channel: submission.intake_channel,
              photos: submission.photos.map(
                ({ id: photoId, sort_order, created_at, signed_url }) => ({
                  id: photoId,
                  sort_order,
                  created_at,
                  signed_url,
                })
              ),
            }}
            status={status}
            messageDraftStatus={messageDraftStatus}
            messageDraftsAvailable={messageDraftLoad.available}
            editableMessageDraft={
              messageDraftLoad.available ? messageDraftLoad.editableDraft : null
            }
            historyMessageDraft={
              messageDraftLoad.available ? messageDraftLoad.historyDraft : null
            }
            isDoctor={isDoctor}
            practicePhone={practicePhone}
            appointmentUrl={appointmentUrl}
            canSendAppointmentLink={isDoctor}
            openTaskCount={openTaskCount}
          />
        </div>
      </div>
    </>
  );
}
