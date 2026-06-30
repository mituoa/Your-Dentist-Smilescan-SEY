import { notFound, redirect } from "next/navigation";

import { CaseCreatedToast } from "@/components/inbox/case-created-toast";
import { InboxAssistHydration } from "@/components/command-assist/inbox-assist-hydration";
import { InboxMobileBack } from "@/components/inbox/inbox-mobile-back";
import { TrackerBackboneNotice } from "@/components/inbox/tracker-backbone-notice";
import { TrackerWorkspace } from "@/components/inbox/tracker-workspace";
import { getCurrentUser, getCurrentWorkspace } from "@/lib/auth-helpers";
import { deriveSubmissionIssueShortLine } from "@/lib/inbox/derive-submission-issue-short-line";
import {
  trackerStatusForRow,
  type EnrichedSubmissionListItem,
} from "@/lib/inbox/tracker-inbox-logic";
import { suggestClinicalUrgencyFromListItem } from "@/lib/inbox/tracker-v9-clinical";
import type { MessageDraftListStatus } from "@/lib/message-drafts/list-status";
import { getOpenTaskCountForSubmission } from "@/lib/queries/inbox";
import { loadMessageDraftDetailForSubmission } from "@/lib/queries/message-drafts";
import { getOutboundMessagesForSubmission } from "@/lib/queries/outbound-messages";
import { getProfileData, getSubmissionById } from "@/lib/queries/submissions";
import { getAssignableWorkspaceMembers } from "@/lib/queries/team-members";
import { isTrackerBackboneAvailable } from "@/lib/outbound-messages/backbone-available";

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

type InboxDetailLoaderProps = {
  submissionId: string;
};

export async function InboxDetailLoader({ submissionId }: InboxDetailLoaderProps) {
  const [user, workspace] = await Promise.all([getCurrentUser(), getCurrentWorkspace()]);

  if (!user || !workspace) {
    redirect("/login?error=workspace_missing");
  }

  const workspaceId = workspace.workspace_id;

  const [
    submission,
    profileRow,
    messageDraftLoad,
    trackerBackboneAvailable,
    outboundMessages,
    openTaskCount,
    assignableMembers,
  ] = await Promise.all([
    getSubmissionById(submissionId, workspaceId),
    getProfileData(workspaceId),
    loadMessageDraftDetailForSubmission(submissionId, workspaceId),
    isTrackerBackboneAvailable(),
    getOutboundMessagesForSubmission(submissionId, workspaceId),
    getOpenTaskCountForSubmission(submissionId, workspaceId),
    getAssignableWorkspaceMembers(workspaceId, user.id),
  ]);

  if (!submission || submission.workspace_id !== workspaceId) {
    notFound();
  }

  const isDoctor = workspace.role === "doctor";
  const concernPreview = deriveSubmissionIssueShortLine(
    submission.patient_notes,
    submission.patient_name,
    { maxLen: 120, emptyLabel: "Einsendung" }
  );
  const practicePhone = profileRow?.practice_phone ?? null;
  const appointmentUrl = profileRow?.appointment_link ?? null;

  const hasOutboundReplySent = outboundMessages.some(
    (m) => m.message_kind === "reply" && m.status === "sent"
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
    open_task_count: openTaskCount,
    photo_documentation: null,
    practice_status: submission.practice_status,
    photo_request_requested_at: submission.photo_request_requested_at,
    follow_up_series_id: submission.follow_up_series_id,
  };

  const status = trackerStatusForRow(statusRow);

  return (
    <>
      <InboxAssistHydration
        submissionId={submission.id}
        patientName={submission.patient_name}
        urgency={submission.urgency ?? suggestClinicalUrgencyFromListItem(statusRow)}
        practicePhone={practicePhone}
        appointmentUrl={appointmentUrl}
        concernLine={concernPreview}
      />
      <CaseCreatedToast />
      <div className="mb-4 hidden md:block">
        <TrackerBackboneNotice available={trackerBackboneAvailable} />
      </div>
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
          practice_status: submission.practice_status,
          seen_at: submission.seen_at,
          photos: submission.photos.map(({ id: photoId, sort_order, created_at, signed_url }) => ({
            id: photoId,
            sort_order,
            created_at,
            signed_url,
          })),
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
        assignableMembers={assignableMembers}
        outboundMessages={outboundMessages}
        trackerBackboneAvailable={trackerBackboneAvailable}
        hasOutboundReplySent={hasOutboundReplySent}
      />
    </>
  );
}
