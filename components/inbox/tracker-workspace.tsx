import { AppointmentLinkButton } from "@/components/inbox/appointment-link-button";
import { TrackerCaseTimeline } from "@/components/inbox/tracker-case-timeline";
import { TrackerCommandFlow } from "@/components/inbox/tracker-command-flow";
import { TrackerDraftWorkspace } from "@/components/inbox/tracker-draft-workspace";
import { TrackerPatientHeader } from "@/components/inbox/tracker-patient-header";
import { TrackerPhotoStage } from "@/components/inbox/tracker-photo-stage";
import { TrackerUrgencyChips } from "@/components/inbox/tracker-urgency-chips";
import { TrackerWorkspaceAssist } from "@/components/inbox/tracker-workspace-assist";
import { TrackerWorkspaceNextSteps } from "@/components/inbox/tracker-workspace-next-steps";
import { deriveSubmissionIssueShortLine } from "@/lib/inbox/derive-submission-issue-short-line";
import {
  buildTrackerAssistChecklist,
  buildTrackerCaseTimeline,
  buildTrackerCommandFlow,
  buildTrackerNextSteps,
} from "@/lib/inbox/build-tracker-workspace";
import {
  isApprovalPending,
  type EnrichedSubmissionListItem,
  type TrackerStatusDisplay,
} from "@/lib/inbox/tracker-inbox-logic";
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
    urgency: string | null;
    created_at: string;
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
}: TrackerWorkspaceProps) {
  const patientLabel = submission.patient_name?.trim() || "Unbekannter Patient";
  const concern = deriveSubmissionIssueShortLine(
    submission.patient_notes,
    submission.patient_name,
    { maxLen: 120, emptyLabel: "" }
  );
  const note = submission.patient_notes?.trim();
  const statusRow: EnrichedSubmissionListItem = {
    id: submission.id,
    patient_name: submission.patient_name,
    patient_email: submission.patient_email,
    patient_notes: submission.patient_notes,
    patient_birth_date: submission.patient_birth_date,
    patient_external_id: null,
    urgency: submission.urgency,
    is_draft: submission.is_draft,
    created_at: submission.created_at,
    seen_at: null,
    photo_count: submission.photos.length,
    message_draft_status: messageDraftStatus,
    intake_channel: submission.intake_channel,
    open_task_count: openTaskCount,
    photo_documentation: null,
  };

  const photoTrail =
    submission.photos.length >= 2 && hasMultiDayPhotos(submission.photos);
  const approvalPending = isApprovalPending(statusRow);

  const timeline = buildTrackerCaseTimeline({
    createdAt: submission.created_at,
    photos: submission.photos,
    patientNotes: submission.patient_notes,
  });

  const assist = buildTrackerAssistChecklist({
    photoCount: submission.photos.length,
    hasMultiDayPhotos: hasMultiDayPhotos(submission.photos),
    messageDraftStatus,
    draftsAvailable: messageDraftsAvailable,
    status,
    isApprovalPending: approvalPending,
  });

  const nextSteps = buildTrackerNextSteps({
    isDoctor,
    messageDraftStatus,
    isApprovalPending: approvalPending,
    photoCount: submission.photos.length,
    urgency: submission.urgency,
    hasPhotoTrail: photoTrail,
  });

  const commandFlow = buildTrackerCommandFlow({
    messageDraftStatus,
    draftsAvailable: messageDraftsAvailable,
    openTaskCount,
    isApprovalPending: approvalPending,
  });

  return (
    <div className="yd-tracker-v4-workspace">
      <TrackerPatientHeader
        patientName={patientLabel}
        status={status}
        birthDate={submission.patient_birth_date}
        createdAt={submission.created_at}
        urgency={submission.urgency}
        intakeChannel={submission.intake_channel}
        concern={concern || null}
        isDraft={submission.is_draft}
        patientEmail={submission.patient_email}
        patientPhone={submission.patient_phone}
      />

      <div className="yd-tracker-v4-workspace__grid">
        <div className="yd-tracker-v4-workspace__main">
          <TrackerPhotoStage
            submissionId={submission.id}
            photos={submission.photos}
            patientName={patientLabel}
          />
          <TrackerCaseTimeline events={timeline} />
          {note ? (
            <section className="yd-tracker-v4-note" aria-label="Anliegen">
              <h3 className="yd-tracker-v4-section-title">Anliegen</h3>
              <p className="yd-tracker-v4-note__text">{note}</p>
            </section>
          ) : null}
          <TrackerDraftWorkspace
            submissionId={submission.id}
            patientName={submission.patient_name}
            urgency={submission.urgency}
            practicePhone={practicePhone}
            appointmentUrl={appointmentUrl}
            isDoctor={isDoctor}
            draftsAvailable={messageDraftsAvailable}
            editableMessageDraft={editableMessageDraft}
            historyMessageDraft={historyMessageDraft}
          />
          <section className="yd-tracker-v4-urgency" aria-labelledby="tracker-v4-urgency-label">
            <h3 id="tracker-v4-urgency-label" className="yd-tracker-v4-section-title">
              Zeitraum
            </h3>
            <TrackerUrgencyChips
              submissionId={submission.id}
              initialUrgency={submission.urgency}
            />
          </section>
        </div>

        <aside className="yd-tracker-v4-workspace__rail">
          <TrackerWorkspaceAssist items={assist} />
          <TrackerWorkspaceNextSteps steps={nextSteps} />
          <TrackerCommandFlow steps={commandFlow} />
          {canSendAppointmentLink ? (
            <section className="yd-tracker-v4-rail-card yd-dash-surface rounded-[14px] border border-[rgba(226,232,240,0.95)] p-4 md:p-5">
              <h3 className="yd-tracker-v4-section-title">Termin</h3>
              <AppointmentLinkButton
                submissionId={submission.id}
                hasPatientEmail={Boolean(submission.patient_email?.trim())}
                canSend={canSendAppointmentLink}
              />
            </section>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
