import Link from "next/link";
import { ChevronLeft } from "lucide-react";

import { TrackerResponseFlow } from "@/components/inbox/tracker-response-flow";
import { TrackerV3VerlaufBanner } from "@/components/inbox/tracker-v3-verlauf-banner";
import { TrackerV5ClinicalTimeline } from "@/components/inbox/tracker-v5-clinical-timeline";
import { TrackerV6ClinicalPhotos } from "@/components/inbox/tracker-v6-clinical-photos";
import { TrackerV6KiSummary } from "@/components/inbox/tracker-v6-ki-summary";
import { TrackerWorkspaceTasks } from "@/components/inbox/tracker-workspace-tasks";
import {
  buildTrackerCaseTimeline,
  buildTrackerNextSteps,
} from "@/lib/inbox/build-tracker-workspace";
import {
  formatTrackerCaseRef,
  isApprovalPending,
  type EnrichedSubmissionListItem,
  type TrackerStatusDisplay,
} from "@/lib/inbox/tracker-inbox-logic";
import { formatBirthDateDe } from "@/lib/inbox/tracker-overview-status";
import { deriveSubmissionIssueShortLine } from "@/lib/inbox/derive-submission-issue-short-line";
import {
  formatPatientAgeYears,
} from "@/lib/inbox/tracker-inbox-logic";
import {
  buildClinicalQueueCard,
  isVerlaufskontrolle,
  resolveTrackerCaseType,
  trackerLastActivityShort,
  trackerPriority,
} from "@/lib/inbox/tracker-v11-presentational";
import { buildVerlaufSummary } from "@/lib/inbox/tracker-v3-presentational";
import type { MessageDraftListStatus } from "@/lib/message-drafts/list-status";
import type { MessageDraftRow } from "@/lib/queries/message-drafts";
import type { IntakeChannel } from "@/lib/submissions/intake-channel";

type TrackerPatientRecordProps = {
  submission: {
    id: string;
    patient_name: string | null;
    patient_email: string | null;
    patient_phone: string | null;
    patient_notes: string | null;
    patient_birth_date: string | null;
    patient_external_id: string | null;
    urgency: string | null;
    created_at: string;
    is_draft: boolean;
    intake_channel: IntakeChannel;
    seen_at?: string | null;
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
  searchQuery?: string | null;
};

function uniquePhotoDays(photos: { created_at: string }[]): number {
  return new Set(photos.map((p) => p.created_at.slice(0, 10))).size;
}

/**
 * Tracker V3 — Patientenakte (volle Breite, medizinische Akte, Fotos + Verlauf + KI).
 */
export function TrackerPatientRecord({
  submission,
  messageDraftStatus,
  messageDraftsAvailable,
  editableMessageDraft,
  historyMessageDraft,
  isDoctor,
  practicePhone,
  appointmentUrl,
  canSendAppointmentLink,
  openTaskCount = 0,
  searchQuery,
}: TrackerPatientRecordProps) {
  const patientLabel = submission.patient_name?.trim() || "Unbekannter Patient";
  const backHref = searchQuery?.trim()
    ? `/inbox?q=${encodeURIComponent(searchQuery.trim())}`
    : "/inbox";

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
    seen_at: submission.seen_at ?? null,
    photo_count: submission.photos.length,
    message_draft_status: messageDraftStatus,
    intake_channel: submission.intake_channel,
    open_task_count: openTaskCount,
    photo_documentation: null,
  };

  const queueCard = buildClinicalQueueCard(statusRow);
  const caseType = resolveTrackerCaseType(statusRow);
  const priority = trackerPriority(statusRow);
  const patientId = formatTrackerCaseRef(submission.id, submission.patient_external_id);
  const birth = formatBirthDateDe(submission.patient_birth_date);
  const age = formatPatientAgeYears(submission.patient_birth_date);
  const concern = deriveSubmissionIssueShortLine(
    submission.patient_notes,
    submission.patient_name,
    { maxLen: 240, emptyLabel: "" }
  );
  const photoDayCount = uniquePhotoDays(submission.photos);
  const verlaufSummary = buildVerlaufSummary(statusRow, photoDayCount);
  const approvalPending = isApprovalPending(statusRow);

  const timeline = buildTrackerCaseTimeline({
    createdAt: submission.created_at,
    photos: submission.photos,
    patientNotes: submission.patient_notes,
  });

  if (messageDraftStatus === "draft" || messageDraftStatus === "approved") {
    timeline.push({
      id: "prep-today",
      dateLabel: "Heute",
      title: "Antwort vorbereitet",
    });
  }

  const nextSteps = buildTrackerNextSteps({
    isDoctor,
    messageDraftStatus,
    isApprovalPending: approvalPending,
    photoCount: submission.photos.length,
    urgency: submission.urgency,
    hasPhotoTrail: isVerlaufskontrolle(statusRow),
  });

  const kiRecommendation = nextSteps[0] ?? null;

  return (
    <div className="yd-tq-record">
      <div className="yd-tq-record__inner">
        <Link href={backHref} className="yd-tq-record__back">
          <ChevronLeft className="h-4 w-4" strokeWidth={2.25} aria-hidden />
          Zurück zur Warteschlange
        </Link>

        <header className="yd-tq-record__head">
          <div className="yd-tq-record__identity">
            <h1 className="yd-tq-record__name">{patientLabel}</h1>
            <p className="yd-tq-record__meta">
              {[age, birth, `Patienten-ID ${patientId}`].filter(Boolean).join(" · ")}
            </p>
            <dl className="yd-tq-record__facts">
              <div>
                <dt>Falltyp</dt>
                <dd>{queueCard.headline}</dd>
              </div>
              <div>
                <dt>Status</dt>
                <dd>{queueCard.subline ?? caseType.label}</dd>
              </div>
              <div>
                <dt>Priorität</dt>
                <dd>{priority.label}</dd>
              </div>
              <div>
                <dt>Letzte Aktivität</dt>
                <dd>{trackerLastActivityShort(submission.created_at)}</dd>
              </div>
            </dl>
          </div>
        </header>

        {concern ? (
          <section className="yd-tq-concern" aria-label="Patientenanliegen">
            <h2 className="yd-tq-section-title">Patientenanliegen</h2>
            <p>{concern}</p>
          </section>
        ) : null}

        {verlaufSummary ? <TrackerV3VerlaufBanner summary={verlaufSummary} /> : null}

        <div className="yd-tq-record__workspace">
          <div className="yd-tq-record__clinical">
            <TrackerV6ClinicalPhotos photos={submission.photos} />
            <section className="yd-tq-timeline-wrap" aria-labelledby="v11-timeline">
              <h2 id="v11-timeline" className="yd-tq-section-title">
                Verlauf
              </h2>
              <TrackerV5ClinicalTimeline events={timeline} />
            </section>
          </div>

          <aside className="yd-tq-record__aside">
            <TrackerV6KiSummary
              patientNotes={submission.patient_notes}
              urgency={submission.urgency}
              recommendation={kiRecommendation}
            />

            <section
              className="yd-tq-draft"
              aria-labelledby="v11-draft"
            >
              <h2 id="v11-draft" className="yd-tq-section-title">
                Antwort
              </h2>
              <TrackerResponseFlow
                submissionId={submission.id}
                patientName={submission.patient_name}
                initialUrgency={submission.urgency}
                practicePhone={practicePhone}
                appointmentUrl={appointmentUrl}
                isDoctor={isDoctor}
                draftsAvailable={messageDraftsAvailable}
                editableMessageDraft={editableMessageDraft}
                historyMessageDraft={historyMessageDraft}
                patientEmail={submission.patient_email}
                canSendAppointmentLink={canSendAppointmentLink}
                compact
              />
            </section>

            <TrackerWorkspaceTasks openTaskCount={openTaskCount} />

            {nextSteps.length > 0 ? (
              <section className="yd-tq-next" aria-labelledby="v11-next">
                <h2 id="v11-next" className="yd-tq-section-title">
                  Empfohlene Schritte
                </h2>
                <ul className="yd-tracker-v3-next__list">
                  {nextSteps.map((step) => (
                    <li key={step}>{step}</li>
                  ))}
                </ul>
              </section>
            ) : null}
          </aside>
        </div>
      </div>
    </div>
  );
}
