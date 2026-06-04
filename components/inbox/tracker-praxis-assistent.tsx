"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { TrackerClinicalUrgency } from "@/components/inbox/tracker-clinical-urgency";
import {
  TrackerClinicalActionSheet,
  openTrackerTaskFlow,
} from "@/components/inbox/tracker-clinical-action-sheet";
import type { TrackerPraxisAssistentModel } from "@/lib/inbox/build-tracker-workspace";
import type { TrackerActionIntent } from "@/lib/inbox/tracker-clinical-decision";
import {
  buildTrackerV9ClinicalModel,
  normalizeClinicalUrgency,
  type ClinicalUrgencyId,
} from "@/lib/inbox/tracker-v9-clinical";
import type { MessageDraftListStatus } from "@/lib/message-drafts/list-status";
import type { IntakeChannel } from "@/lib/submissions/intake-channel";
import { cn } from "@/lib/utils";

type TrackerPraxisAssistentProps = {
  model: TrackerPraxisAssistentModel;
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

/** V9 — Entscheidungszentrale: Einschätzung, Dringlichkeit, Nächster Schritt. */
export function TrackerPraxisAssistent({
  model,
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

  const v9 = useMemo(
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

  const handleIntent = (intent: TrackerActionIntent) => {
    setSheetIntent(intent);
  };

  const handleStepClick = (item: {
    intent?: TrackerActionIntent;
    href?: string;
  }) => {
    if (item.intent) {
      handleIntent(item.intent);
      return;
    }
    if (item.href) {
      openTrackerTaskFlow({
        router,
        submissionId,
        patientName,
        patientNotes,
        primaryAction: v9.decision.primaryAction,
      });
    }
  };

  return (
    <>
      <aside
        className="yd-tracker-v7-rail yd-tracker-v8-rail yd-tracker-v9-rail"
        aria-label="Klinische Voranalyse"
      >
        <header className="yd-tracker-v9-rail__head">
          <h2 className="yd-tracker-v9-rail__title">Klinische Voranalyse</h2>
        </header>

        <section className="yd-tracker-v9-rail__section">
          <h3 className="yd-tracker-v9-rail__label">Einschätzung</h3>
          <p className="yd-tracker-v9-rail__assessment">{v9.assessment}</p>
        </section>

        <section className="yd-tracker-v9-rail__section">
          <h3 className="yd-tracker-v9-rail__label">Dringlichkeit</h3>
          <TrackerClinicalUrgency
            submissionId={submissionId}
            initialUrgency={urgency}
            suggestedUrgency={v9.suggestedUrgency}
            onUrgencyChange={setClinicalUrgency}
          />
        </section>

        <section className="yd-tracker-v9-rail__section yd-tracker-v9-rail__section--steps">
          <h3 className="yd-tracker-v9-rail__label">Nächster Schritt</h3>
          <div className="yd-tracker-v9-next-steps">
            {v9.nextStepGroups.map((group) => (
              <div key={group.id} className="yd-tracker-v9-next-steps__group">
                <p className="yd-tracker-v9-next-steps__group-label">{group.label}</p>
                <div className="yd-tracker-v9-next-steps__items">
                  {group.items.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      className={cn(
                        "yd-tracker-v9-next-step-btn",
                        item.emphasized && "yd-tracker-v9-next-step-btn--emphasized"
                      )}
                      onClick={() => handleStepClick(item)}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </aside>

      <TrackerClinicalActionSheet
        open={sheetIntent !== null}
        intent={sheetIntent}
        onClose={() => setSheetIntent(null)}
        submissionId={submissionId}
        patientName={patientName}
        patientEmail={patientEmail}
        patientNotes={patientNotes}
        urgency={clinicalUrgency}
        practicePhone={practicePhone}
        appointmentUrl={appointmentUrl}
        photoCount={photoCount}
        primaryAction={v9.decision.primaryAction}
        isDoctor={isDoctor}
        canSendAppointmentLink={canSendAppointmentLink}
        draftsAvailable={draftsAvailable}
        editableDraftId={editableDraftId}
        initialDraftBody={initialDraftBody}
        prioritizedRuckfrageTopics={v9.prioritizedRuckfrageTopics}
        suggestedPhotoViewId={v9.suggestedPhotoViewId}
      />
    </>
  );
}
