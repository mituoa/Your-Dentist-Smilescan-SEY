import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { getCurrentWorkspace } from "@/lib/auth-helpers";
import { getProfileData, getSubmissionById } from "@/lib/queries/submissions";
import { CaseCreatedToast } from "@/components/inbox/case-created-toast";
import { SubmissionActions } from "@/components/inbox/submission-actions";
import { TrackerCaseOverview } from "@/components/inbox/tracker-case-overview";
import { InboxAssistHydration } from "@/components/command-assist/inbox-assist-hydration";
import { InboxMobileBack } from "@/components/inbox/inbox-mobile-back";
import { deriveSubmissionIssueShortLine } from "@/lib/inbox/derive-submission-issue-short-line";
import {
  trackerStatusForRow,
  type EnrichedSubmissionListItem,
} from "@/lib/inbox/tracker-inbox-logic";
import type { MessageDraftListStatus } from "@/lib/message-drafts/list-status";
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
    open_task_count: 0,
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

      <div className="yd-inbox-detail-root flex h-full min-h-0 flex-1 touch-manipulation flex-col overflow-x-hidden max-md:overflow-y-auto max-md:overscroll-y-contain max-md:[-webkit-overflow-scrolling:touch] max-md:min-h-0 max-md:bg-[#EDF1F7] md:overflow-hidden md:bg-transparent">
        <div className="yd-inbox-detail-pane flex h-full min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white max-md:mx-0 max-md:flex-none max-md:overflow-visible max-md:rounded-b-2xl max-md:shadow-[0_2px_12px_rgba(15,23,42,0.05)] md:mx-0 md:h-full md:max-h-full md:rounded-none md:bg-[#F7F9FC] md:shadow-none">
          <div className="z-[6] shrink-0 bg-white px-4 pb-2 pt-[max(12px,env(safe-area-inset-top))] max-md:sticky max-md:top-0 max-md:border-b max-md:border-[rgba(15,23,42,0.06)] md:static md:border-b-0 md:px-[clamp(20px,4vw,48px)] md:pt-[clamp(20px,4vw,32px)]">
            <Suspense fallback={null}>
              <InboxMobileBack />
            </Suspense>
          </div>

          <div className="yd-inbox-detail-body flex min-h-0 w-full min-w-0 flex-col max-md:flex-none md:flex-1 md:min-h-0 md:flex-row md:overflow-hidden">
            <div className="yd-inbox-detail-main-scroll min-h-0 w-full min-w-0 max-md:flex-none max-md:overflow-visible bg-white px-4 pb-6 max-md:scroll-pb-[max(6.5rem,var(--safe-area-bottom))] sm:px-5 max-md:pb-8 md:flex-1 md:min-h-0 md:px-[clamp(20px,4vw,48px)] md:pb-20 md:pt-0">
              <TrackerCaseOverview
                submission={{
                  id: submission.id,
                  patient_name: submission.patient_name,
                  patient_email: submission.patient_email,
                  patient_phone: submission.patient_phone,
                  patient_notes: submission.patient_notes,
                  patient_birth_date: submission.patient_birth_date,
                  patient_external_id: submission.patient_external_id,
                  urgency: submission.urgency,
                  created_at: submission.created_at,
                  is_draft: submission.is_draft,
                  seen_at: submission.seen_at,
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
              />
            </div>

            <aside className="yd-inbox-detail-aside-scroll flex w-full shrink-0 flex-col overflow-hidden border-t border-[rgba(15,23,42,0.06)] bg-[#F7F9FC] pb-[max(12px,var(--safe-area-bottom))] max-md:min-h-0 max-md:flex-none max-md:overflow-visible max-md:px-0 max-md:pb-[max(1rem,var(--safe-area-bottom))] md:mt-0 md:min-h-0 md:w-[min(100%,300px)] md:max-w-[320px] md:shrink-0 md:border-l md:border-t-0 md:pb-0">
              <SubmissionActions
                submissionId={submission.id}
                patientName={submission.patient_name}
                patientEmail={submission.patient_email}
                patientPhone={submission.patient_phone}
                createdAt={submission.created_at}
                patientBirthDate={submission.patient_birth_date}
                patientExternalId={submission.patient_external_id}
                urgency={submission.urgency}
                isDraft={submission.is_draft}
                seenAt={submission.seen_at}
                updatedAt={submission.updated_at}
                photoCount={submission.photos.length}
                canSendAppointmentLink={isDoctor}
                practicePhone={practicePhone}
                appointmentUrl={appointmentUrl}
                isDoctor={isDoctor}
                messageDraftsAvailable={messageDraftLoad.available}
                editableMessageDraft={
                  messageDraftLoad.available ? messageDraftLoad.editableDraft : null
                }
                historyMessageDraft={
                  messageDraftLoad.available ? messageDraftLoad.historyDraft : null
                }
                intakeChannel={submission.intake_channel}
              />
            </aside>
          </div>
        </div>
      </div>
    </>
  );
}
