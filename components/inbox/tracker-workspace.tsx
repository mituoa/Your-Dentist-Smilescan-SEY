import { TrackerFallakte } from "@/components/inbox/tracker-fallakte";
import { TrackerPraxisAssistent } from "@/components/inbox/tracker-praxis-assistent";
import { deriveSubmissionIssueShortLine } from "@/lib/inbox/derive-submission-issue-short-line";
import {
  buildTrackerAssistentView,
  buildTrackerDecisionCenter,
} from "@/lib/inbox/build-tracker-decision";
import { buildTrackerCaseTimeline } from "@/lib/inbox/build-tracker-workspace";
import {
  hasPhotoTrail,
  isApprovalPending,
  type EnrichedSubmissionListItem,
  type TrackerStatusDisplay,
} from "@/lib/inbox/tracker-inbox-logic";
import type { YdCaseProductStatus } from "@/lib/inbox/tracker-product-status";
import type { MessageDraftListStatus } from "@/lib/message-drafts/list-status";
import type { MessageDraftRow } from "@/lib/queries/message-drafts";
import type { IntakeChannel } from "@/lib/submissions/intake-channel";

type TrackerWorkspaceProps = {
  submission: {
    id: string;
    patient_name: string | null;
    patient_email: string | null;
    patient_phone: string | null;
    patient_notes: string | null;
    patient_birth_date: string | null;
    patient_external_id?: string | null;
    urgency: string | null;
    created_at: string;
    seen_at?: string | null;
    is_draft: boolean;
    intake_channel: IntakeChannel;
    photos: {
      id: string;
      sort_order: number;
      created_at: string;
      signed_url: string | null;
    }[];
  };
  status: TrackerStatusDisplay;
  messageDraftStatus: MessageDraftListStatus;
  messageDraftsAvailable: boolean;
  editableMessageDraft: MessageDraftRow | null;
  historyMessageDraft: MessageDraftRow | null;
  isDoctor: boolean;
  practicePhone: string | null;
  appointmentUrl: string | null;
  canSendAppointmentLink: boolean;
  openTaskCount?: number;
  photoDocumentation?: EnrichedSubmissionListItem["photo_documentation"];
};

function hasMultiDayPhotos(photos: { created_at: string }[]): boolean {
  const keys = new Set(photos.map((p) => p.created_at.slice(0, 10)));
  return keys.size > 1;
}

export function TrackerWorkspace({
  submission,
  status,
  messageDraftStatus,
  messageDraftsAvailable,
  editableMessageDraft,
  historyMessageDraft,
  isDoctor,
  practicePhone,
  appointmentUrl,
  canSendAppointmentLink,
  openTaskCount = 0,
  photoDocumentation = null,
}: TrackerWorkspaceProps) {
  const patientLabel = submission.patient_name?.trim() || "Unbekannter Patient";

  const statusRow: EnrichedSubmissionListItem = {
    id: submission.id,
    patient_name: submission.patient_name,
    patient_email: submission.patient_email,
    patient_notes: submission.patient_notes,
    patient_birth_date: submission.patient_birth_date,
    patient_external_id: submission.patient_external_id ?? null,
    urgency: submission.urgency,
    is_draft: submission.is_draft,
    created_at: submission.created_at,
    seen_at: submission.seen_at ?? null,
    photo_count: submission.photos.length,
    message_draft_status: messageDraftStatus,
    intake_channel: submission.intake_channel,
    open_task_count: openTaskCount,
    photo_documentation: photoDocumentation,
  };

  const photoTrail =
    hasPhotoTrail(statusRow) ||
    (submission.photos.length >= 2 && hasMultiDayPhotos(submission.photos));
  const approvalPending = isApprovalPending(statusRow);

  const decision = buildTrackerDecisionCenter({
    submission: statusRow,
    patientNotes: submission.patient_notes,
    photoCount: submission.photos.length,
    hasPhotoTrail: photoTrail,
    messageDraftStatus,
    draftsAvailable: messageDraftsAvailable,
    isDoctor,
    canSendAppointment: canSendAppointmentLink,
    patientEmail: submission.patient_email,
  });

  const assistent = buildTrackerAssistentView(decision, statusRow);

  const timeline = buildTrackerCaseTimeline({
    createdAt: submission.created_at,
    photos: submission.photos,
    patientNotes: submission.patient_notes,
    messageDraftStatus,
    isApprovalPending: approvalPending,
  });

  const concernLine = deriveSubmissionIssueShortLine(
    submission.patient_notes,
    submission.patient_name,
    { maxLen: 220, emptyLabel: "" }
  );

  const productStatus: YdCaseProductStatus = decision.productStatus;

  return (
    <div className="yd-tracker-triage">
      <div className="yd-tracker-triage__fallakte">
        <TrackerFallakte
          submissionId={submission.id}
          patientName={patientLabel}
          productStatus={productStatus}
          concernLine={concernLine || null}
          photos={submission.photos}
          showPhotoTrailHint={photoTrail}
          timeline={timeline}
          status={status}
          birthDate={submission.patient_birth_date}
          createdAt={submission.created_at}
          urgency={submission.urgency}
          intakeChannel={submission.intake_channel}
          isDraft={submission.is_draft}
          patientEmail={submission.patient_email}
          patientPhone={submission.patient_phone}
        />
      </div>

      <TrackerPraxisAssistent
        model={assistent}
        submissionId={submission.id}
        patientName={submission.patient_name}
        urgency={submission.urgency}
        practicePhone={practicePhone}
        appointmentUrl={appointmentUrl}
        isDoctor={isDoctor}
        draftsAvailable={messageDraftsAvailable}
        editableMessageDraft={editableMessageDraft}
        historyMessageDraft={historyMessageDraft}
        canSendAppointmentLink={canSendAppointmentLink}
        hasPatientEmail={Boolean(submission.patient_email?.trim())}
      />
    </div>
  );
}
