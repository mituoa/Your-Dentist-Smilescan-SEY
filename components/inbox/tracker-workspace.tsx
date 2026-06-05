import { TrackerCaseTimeline } from "@/components/inbox/tracker-case-timeline";
import { TrackerDraftWorkspace } from "@/components/inbox/tracker-draft-workspace";
import { TrackerPatientHeader } from "@/components/inbox/tracker-patient-header";
import { TrackerPhotoStage } from "@/components/inbox/tracker-photo-stage";
import { TrackerPraxisAssistent } from "@/components/inbox/tracker-praxis-assistent";
import { TrackerUrgencyChips } from "@/components/inbox/tracker-urgency-chips";
import { deriveSubmissionConcernDisplay } from "@/lib/inbox/derive-submission-issue-short-line";
import { buildTrackerCaseTimeline } from "@/lib/inbox/build-tracker-workspace";
import type { OutboundMessageRow } from "@/lib/outbound-messages/types";
import {
  isApprovalPending,
  type EnrichedSubmissionListItem,
  type TrackerStatusDisplay,
} from "@/lib/inbox/tracker-inbox-logic";
import type { MessageDraftListStatus } from "@/lib/message-drafts/list-status";
import type { MessageDraftRow } from "@/lib/queries/message-drafts";
import type { AssignableMember } from "@/lib/queries/team-members";
import type { IntakeChannel } from "@/lib/submissions/intake-channel";
import { getIntakeChannelLabel } from "@/lib/submissions/intake-channel";

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
  assignableMembers: AssignableMember[];
  outboundMessages?: OutboundMessageRow[];
  trackerBackboneAvailable?: boolean;
  hasOutboundReplySent?: boolean;
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
  outboundMessages = [],
  trackerBackboneAvailable = true,
  hasOutboundReplySent = false,
}: TrackerWorkspaceProps) {
  const patientLabel = submission.patient_name?.trim() || "Unbekannter Patient";
  const concern = deriveSubmissionConcernDisplay(
    submission.patient_notes,
    submission.patient_name,
    ""
  );
  const note = submission.patient_notes?.trim();
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
    seen_at: null,
    photo_count: submission.photos.length,
    message_draft_status: messageDraftStatus,
    intake_channel: submission.intake_channel,
    open_task_count: openTaskCount,
    photo_documentation: null,
    practice_status: null,
    photo_request_requested_at: null,
    follow_up_series_id: null,
  };

  const photoTrail =
    submission.photos.length >= 2 && hasMultiDayPhotos(submission.photos);
  const approvalPending = isApprovalPending(statusRow);

  const timeline = buildTrackerCaseTimeline({
    createdAt: submission.created_at,
    photos: submission.photos,
    patientNotes: submission.patient_notes,
    messageDraftStatus,
    isApprovalPending: approvalPending,
    outboundSent: outboundMessages
      .filter((m) => m.status === "sent")
      .map((m) => ({
        id: m.id,
        message_kind: m.message_kind,
        sent_at: m.sent_at,
      })),
  });

  const draftBody =
    editableMessageDraft?.body?.trim() || historyMessageDraft?.body?.trim() || "";
  const draftPreview =
    draftBody.length > 0
      ? draftBody.length > 140
        ? `${draftBody.slice(0, 140).trimEnd()}…`
        : draftBody
      : null;

  const showCommunication =
    messageDraftsAvailable ||
    Boolean(draftPreview) ||
    canSendAppointmentLink;

  const draftBodyForAssist =
    editableMessageDraft?.body?.trim() || historyMessageDraft?.body?.trim() || null;

  return (
    <div className="yd-tracker-v6-workspace yd-tracker-v7-workspace yd-tracker-v8-workspace yd-tracker-v12-workspace yd-tracker-v14-workspace yd-tracker-v15-workspace">
      <TrackerPatientHeader
        patientName={patientLabel}
        birthDate={submission.patient_birth_date}
        patientEmail={submission.patient_email}
        patientPhone={submission.patient_phone}
        concern={concern || null}
        createdAt={submission.created_at}
        isDraft={submission.is_draft}
      />

      <div className="yd-tracker-v8-clinical-row">
        <section
          id="tracker-beweise"
          className="yd-tracker-v6-evidence yd-tracker-v7-evidence yd-tracker-v8-evidence"
          aria-label="Klinische Dokumentation"
        >
          <h2 className="yd-tracker-v6-section-label">Klinische Dokumentation</h2>
          <TrackerPhotoStage
            submissionId={submission.id}
            photos={submission.photos}
            patientName={patientLabel}
            dominant
          />
        </section>

        <TrackerPraxisAssistent
          submissionId={submission.id}
          trackerBackboneAvailable={trackerBackboneAvailable}
          hasOutboundReplySent={hasOutboundReplySent}
          isDoctor={isDoctor}
          openTaskCount={openTaskCount}
          photoCount={submission.photos.length}
          isApprovalPending={approvalPending}
          messageDraftStatus={messageDraftStatus}
          draftsAvailable={messageDraftsAvailable}
          patientName={patientLabel}
          patientEmail={submission.patient_email}
          patientNotes={submission.patient_notes}
          urgency={submission.urgency}
          intakeChannel={submission.intake_channel}
          hasPhotoTrail={photoTrail}
          hasMultiDayPhotos={hasMultiDayPhotos(submission.photos)}
          practicePhone={practicePhone}
          appointmentUrl={appointmentUrl}
          canSendAppointmentLink={canSendAppointmentLink}
          editableDraftId={editableMessageDraft?.id ?? null}
          initialDraftBody={draftBodyForAssist}
        />
      </div>

      <div className="yd-tracker-v8-workspace__below">
          {showCommunication ? (
            <section
              id="tracker-kommunikation"
              className="yd-tracker-v6-communication"
              aria-label="Kommunikation"
            >
              <h2 className="yd-tracker-v6-section-label">Kommunikation</h2>
              <TrackerDraftWorkspace
                trackerBackboneAvailable={trackerBackboneAvailable}
                submissionId={submission.id}
                patientName={submission.patient_name}
                patientEmail={submission.patient_email}
                urgency={submission.urgency}
                practicePhone={practicePhone}
                appointmentUrl={appointmentUrl}
                isDoctor={isDoctor}
                draftsAvailable={messageDraftsAvailable}
                editableMessageDraft={editableMessageDraft}
                historyMessageDraft={historyMessageDraft}
              />
            </section>
          ) : null}

          <details className="yd-tracker-v6-docs" open={false}>
            <summary>Dokumentation & Verlauf</summary>
            <div className="yd-tracker-v6-docs__body">
              <TrackerCaseTimeline events={timeline} className="yd-tracker-v4-timeline--deferred" />
              {note ? (
                <details className="yd-tracker-v4-note yd-tracker-v4-note--original">
                  <summary>Originalanliegen</summary>
                  <p className="yd-tracker-v4-note__text">{note}</p>
                </details>
              ) : null}
              <details className="yd-tracker-v6-docs__group">
                <summary>Weitere Stammdaten</summary>
                <dl className="yd-tracker-v6-docs__dl">
                  {submission.patient_external_id ? (
                    <>
                      <dt>Patienten-ID</dt>
                      <dd>{submission.patient_external_id}</dd>
                    </>
                  ) : null}
                  <dt>Kanal</dt>
                  <dd>{getIntakeChannelLabel(submission.intake_channel)}</dd>
                  <dt>Eingang</dt>
                  <dd>
                    {new Date(submission.created_at).toLocaleDateString("de-DE", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </dd>
                </dl>
              </details>
              <details className="yd-tracker-v6-docs__group">
                <summary>Zeitraum</summary>
                <div className="pt-2">
                  <TrackerUrgencyChips
                    submissionId={submission.id}
                    initialUrgency={submission.urgency}
                  />
                </div>
              </details>
            </div>
          </details>
      </div>
    </div>
  );
}
