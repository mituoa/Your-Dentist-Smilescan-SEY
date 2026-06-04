"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { TrackerClinicalUrgency } from "@/components/inbox/tracker-clinical-urgency";
import {
  TrackerClinicalActionSheet,
  openTrackerTaskFlow,
} from "@/components/inbox/tracker-clinical-action-sheet";
import type { TrackerActionIntent } from "@/lib/inbox/tracker-clinical-decision";
import {
  buildTrackerV9ClinicalModel,
  normalizeClinicalUrgency,
  type ClinicalUrgencyId,
  type TrackerNextStepItem,
} from "@/lib/inbox/tracker-v9-clinical";
import type { MessageDraftListStatus } from "@/lib/message-drafts/list-status";
import type { IntakeChannel } from "@/lib/submissions/intake-channel";
import { cn } from "@/lib/utils";

type TrackerPraxisAssistentProps = {
  submissionId: string;
  trackerBackboneAvailable?: boolean;
  hasOutboundReplySent?: boolean;
  isDoctor: boolean;
  openTaskCount?: number;
  photoCount: number;
  isApprovalPending: boolean;
  messageDraftStatus: MessageDraftListStatus;
  draftsAvailable: boolean;
  patientName: string;
  patientEmail: string | null;
  patientNotes: string | null;
  urgency: string | null;
  intakeChannel: IntakeChannel;
  hasPhotoTrail: boolean;
  hasMultiDayPhotos: boolean;
  practicePhone: string | null;
  appointmentUrl: string | null;
  canSendAppointmentLink: boolean;
  editableDraftId: string | null;
  initialDraftBody: string | null;
};

type ActionNotice = {
  type: "success" | "error";
  message: string;
};

const MORE_OPTION_IDS = ["rueckfrage", "foto", "aufgabe"] as const;

/** V12 — Entscheidung: Empfehlung → Handlung → Dringlichkeit → Vorbereitet. */
export function TrackerPraxisAssistent({
  submissionId,
  trackerBackboneAvailable = true,
  hasOutboundReplySent = false,
  isDoctor,
  photoCount,
  isApprovalPending,
  messageDraftStatus,
  draftsAvailable,
  patientName,
  patientEmail,
  patientNotes,
  urgency,
  intakeChannel,
  hasPhotoTrail,
  hasMultiDayPhotos,
  practicePhone,
  appointmentUrl,
  canSendAppointmentLink,
  editableDraftId,
  initialDraftBody,
}: TrackerPraxisAssistentProps) {
  const router = useRouter();
  const [sheetIntent, setSheetIntent] = useState<TrackerActionIntent | null>(null);
  const [clinicalUrgency, setClinicalUrgency] = useState<ClinicalUrgencyId>(
    normalizeClinicalUrgency(urgency) ?? "this_week"
  );
  const [actionNotice, setActionNotice] = useState<ActionNotice | null>(null);

  const clinical = useMemo(
    () =>
      buildTrackerV9ClinicalModel({
        submissionId,
        patientNotes,
        patientName,
        photoCount,
        hasMultiDayPhotos,
        hasPhotoTrail,
        messageDraftStatus,
        draftsAvailable,
        urgency: clinicalUrgency,
        intakeChannel,
        isApprovalPending,
        isDoctor,
        openTaskCount: 0,
      }),
    [
      submissionId,
      patientNotes,
      patientName,
      photoCount,
      hasMultiDayPhotos,
      hasPhotoTrail,
      messageDraftStatus,
      draftsAvailable,
      clinicalUrgency,
      intakeChannel,
      isApprovalPending,
      isDoctor,
    ]
  );

  const { primary, secondary } = clinical.actionPlan;

  const moreOptions = useMemo(() => {
    const pool = [...secondary];
    return MORE_OPTION_IDS.map((id) => pool.find((item) => item.id === id)).filter(
      (item): item is TrackerNextStepItem => Boolean(item)
    );
  }, [secondary]);

  const runStep = (item: TrackerNextStepItem) => {
    setActionNotice(null);
    if (item.intent) {
      setSheetIntent(item.intent);
      return;
    }
    if (item.href) {
      if (item.id === "aufgabe") {
        openTrackerTaskFlow({
          router,
          submissionId,
          patientName,
          patientNotes,
          primaryAction: clinical.decision.primaryAction,
        });
        return;
      }
      router.push(item.href);
    }
  };

  return (
    <>
      <aside
        id="tracker-entscheidung"
        className="yd-tracker-v7-rail yd-tracker-v8-rail yd-tracker-v12-rail yd-tracker-v14-rail yd-tracker-v15-rail"
        aria-label="Entscheidung"
        aria-busy={sheetIntent !== null}
      >
        <section className="yd-tracker-v12-rail__block yd-tracker-v12-rail__block--empfehlung">
          <h2 className="yd-tracker-v12-rail__label">Empfehlung</h2>
          <p className="yd-tracker-v12-rail__headline">{clinical.recommendationLabel}</p>
        </section>

        <section className="yd-tracker-v12-rail__block yd-tracker-v14-rail__block--action">
          <button
            id="tracker-v10-primary-action"
            type="button"
            className="yd-tracker-v12-primary-action yd-tracker-v14-primary-action yd-tracker-v15-primary-action"
            aria-haspopup="dialog"
            onClick={() => runStep(primary)}
          >
            {primary.label}
          </button>
        </section>

        <section className="yd-tracker-v12-rail__block">
          <h2 className="yd-tracker-v12-rail__label">Dringlichkeit</h2>
          <TrackerClinicalUrgency
            submissionId={submissionId}
            initialUrgency={urgency}
            suggestedUrgency={clinical.suggestedUrgency}
            onUrgencyChange={setClinicalUrgency}
          />
        </section>

        <section className="yd-tracker-v12-rail__block">
          <h2 className="yd-tracker-v12-rail__label">Vorbereitet</h2>
          <ul className="yd-tracker-v12-status-list">
            {clinical.statusLines.map((line) => (
              <li
                key={line.label}
                className={cn(
                  "yd-tracker-v12-status-line",
                  line.kind === "warn" && "yd-tracker-v12-status-line--warn"
                )}
              >
                <span className="yd-tracker-v12-status-line__mark" aria-hidden>
                  {line.kind === "done" ? "✓" : "⚠"}
                </span>
                {line.label}
              </li>
            ))}
          </ul>
        </section>

        {moreOptions.length > 0 ? (
          <section className="yd-tracker-v12-rail__block yd-tracker-v12-rail__block--more">
            <h2 className="yd-tracker-v12-rail__label yd-tracker-v12-rail__label--muted">
              Weitere Optionen
            </h2>
            <ul className="yd-tracker-v12-more-list">
              {moreOptions.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className="yd-tracker-v12-more-action yd-tracker-v14-more-action"
                    onClick={() => runStep(item)}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {actionNotice ? (
          <p
            className={cn(
              "yd-tracker-v12-rail-notice",
              actionNotice.type === "error" && "yd-tracker-v12-rail-notice--error"
            )}
            role="status"
            aria-live="polite"
          >
            {actionNotice.message}
          </p>
        ) : null}
      </aside>

      <TrackerClinicalActionSheet
        open={sheetIntent !== null}
        intent={sheetIntent}
        onClose={() => setSheetIntent(null)}
        onOutcome={(outcome) => setActionNotice(outcome)}
        submissionId={submissionId}
        patientName={patientName}
        patientEmail={patientEmail}
        patientNotes={patientNotes}
        urgency={clinicalUrgency}
        practicePhone={practicePhone}
        appointmentUrl={appointmentUrl}
        photoCount={photoCount}
        primaryAction={clinical.decision.primaryAction}
        isDoctor={isDoctor}
        canSendAppointmentLink={canSendAppointmentLink}
        draftsAvailable={draftsAvailable}
        editableDraftId={editableDraftId}
        initialDraftBody={initialDraftBody}
        prioritizedRuckfrageTopics={clinical.prioritizedRuckfrageTopics}
        suggestedPhotoViewId={clinical.suggestedPhotoViewId}
        trackerBackboneAvailable={trackerBackboneAvailable}
      />
    </>
  );
}
