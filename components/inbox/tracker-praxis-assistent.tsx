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

/** V10+ — Handlung → Dringlichkeit → Vorbereitet. */
export function TrackerPraxisAssistent({
  submissionId,
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

  const sheetOpen = sheetIntent !== null;

  return (
    <>
      <aside
        id="tracker-klinische-voranalyse"
        className="yd-tracker-v7-rail yd-tracker-v8-rail yd-tracker-v10-rail yd-tracker-v11-rail"
        aria-label="Klinische Voranalyse"
      >
        <header className="yd-tracker-v11-rail__head">
          <h2 className="yd-tracker-v11-rail__title">Klinische Voranalyse</h2>
        </header>

        <section className="yd-tracker-v11-rail__block yd-tracker-v11-rail__block--hero">
          <h3 className="yd-tracker-v11-rail__label">Empfehlung</h3>
          <p className="yd-tracker-v11-recommendation-text">
            {clinical.recommendationLabel}
          </p>
          <button
            id="tracker-v10-primary-action"
            type="button"
            className="yd-tracker-v11-primary-action"
            disabled={sheetOpen}
            aria-busy={sheetOpen && primary.intent != null}
            onClick={() => runStep(primary)}
          >
            {primary.label}
          </button>
        </section>

        <section className="yd-tracker-v11-rail__block">
          <h3 className="yd-tracker-v11-rail__label">Dringlichkeit</h3>
          <TrackerClinicalUrgency
            submissionId={submissionId}
            initialUrgency={urgency}
            suggestedUrgency={clinical.suggestedUrgency}
            onUrgencyChange={setClinicalUrgency}
          />
        </section>

        <section className="yd-tracker-v11-rail__block">
          <h3 className="yd-tracker-v11-rail__label">Vorbereitet</h3>
          <ul className="yd-tracker-v11-status-list">
            {clinical.statusLines.map((line) => (
              <li
                key={line.label}
                className={cn(
                  "yd-tracker-v11-status-line",
                  line.kind === "warn" && "yd-tracker-v11-status-line--warn"
                )}
              >
                <span className="yd-tracker-v11-status-line__mark" aria-hidden>
                  {line.kind === "done" ? "✓" : "⚠"}
                </span>
                {line.label}
              </li>
            ))}
          </ul>
        </section>

        {secondary.length > 0 ? (
          <section className="yd-tracker-v11-rail__block yd-tracker-v11-rail__block--more">
            <h3 className="yd-tracker-v11-rail__label yd-tracker-v11-rail__label--muted">
              Weitere Optionen
            </h3>
            <ul className="yd-tracker-v11-secondary-list">
              {secondary.map((item) => (
                <li key={item.id}>
                  <button
                    type="button"
                    className="yd-tracker-v11-secondary-action"
                    disabled={sheetOpen}
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
              "yd-tracker-v11-rail-notice",
              actionNotice.type === "error" && "yd-tracker-v11-rail-notice--error"
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
      />
    </>
  );
}
