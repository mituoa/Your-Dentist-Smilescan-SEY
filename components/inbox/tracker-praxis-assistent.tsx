"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import {
  TrackerClinicalActionSheet,
  openTrackerTaskFlow,
} from "@/components/inbox/tracker-clinical-action-sheet";
import type { TrackerPraxisAssistentModel } from "@/lib/inbox/build-tracker-workspace";
import {
  buildTrackerActionCatalog,
  type TrackerActionIntent,
  type TrackerDecisionAction,
} from "@/lib/inbox/tracker-clinical-decision";
import type { MessageDraftListStatus } from "@/lib/message-drafts/list-status";
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
  practicePhone: string | null;
  appointmentUrl: string | null;
  canSendAppointmentLink: boolean;
  editableDraftId: string | null;
  initialDraftBody: string | null;
};

function DecisionButton({
  action,
  onIntent,
}: {
  action: TrackerDecisionAction;
  onIntent: (intent: TrackerActionIntent) => void;
}) {
  const className = cn(
    "yd-tracker-v8-decision-btn",
    action.primary && "yd-tracker-v8-decision-btn--primary"
  );

  if (action.href) {
    return (
      <a href={action.href} className={className}>
        {action.label}
      </a>
    );
  }

  if (action.intent) {
    return (
      <button type="button" className={className} onClick={() => onIntent(action.intent!)}>
        {action.label}
      </button>
    );
  }

  return (
    <button type="button" className={className} disabled>
      {action.label}
    </button>
  );
}

/** V8 — Assistenz mit gebündelten Aktionen und echten Dialogen. */
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
  practicePhone,
  appointmentUrl,
  canSendAppointmentLink,
  editableDraftId,
  initialDraftBody,
}: TrackerPraxisAssistentProps) {
  const router = useRouter();
  const { decision } = model;
  const [sheetIntent, setSheetIntent] = useState<TrackerActionIntent | null>(null);

  const actions = buildTrackerActionCatalog({
    primaryAction: decision.primaryAction,
    submissionId,
    isDoctor,
    photoCount,
    isApprovalPending,
    messageDraftStatus,
    draftsAvailable,
  });

  const handleIntent = (intent: TrackerActionIntent) => {
    setSheetIntent(intent);
  };

  const handleActionClick = (action: TrackerDecisionAction) => {
    if (action.intent) {
      handleIntent(action.intent);
      return;
    }
    if (action.id === "aufgabe" && action.href) {
      openTrackerTaskFlow({
        router,
        submissionId,
        patientName,
        patientNotes,
        primaryAction: decision.primaryAction,
      });
    }
  };

  return (
    <>
      <aside className="yd-tracker-v7-rail yd-tracker-v8-rail" aria-label="Klinische Voranalyse">
        <header className="yd-tracker-v7-rail__head">
          <h2 className="yd-tracker-v7-rail__title">Klinische Voranalyse</h2>
          <p className="yd-tracker-v7-rail__subtitle">Vorbereitet für Ihre Entscheidung</p>
        </header>

        <section className="yd-tracker-v7-rail__block" aria-labelledby="tracker-v7-prepared">
          <h3 id="tracker-v7-prepared" className="yd-tracker-v7-rail__label">
            Vorbereitet
          </h3>
          <ul className="yd-tracker-v7-prepared-list">
            {decision.prepared.map((item) => (
              <li
                key={item.label}
                className={cn(
                  "yd-tracker-v7-prepared-list__item",
                  item.status === "done"
                    ? "yd-tracker-v7-prepared-list__item--done"
                    : "yd-tracker-v7-prepared-list__item--warn"
                )}
              >
                <span className="yd-tracker-v7-prepared-list__mark" aria-hidden>
                  {item.status === "done" ? "✓" : "⚠"}
                </span>
                <span>{item.label}</span>
              </li>
            ))}
          </ul>
        </section>

        {decision.stillNeed.length > 0 ? (
          <section className="yd-tracker-v7-rail__block" aria-labelledby="tracker-v7-gaps">
            <h3 id="tracker-v7-gaps" className="yd-tracker-v7-rail__label">
              Was fehlt noch?
            </h3>
            <ul className="yd-tracker-v7-gap-list">
              {decision.stillNeed.map((gap) => (
                <li key={gap}>{gap}</li>
              ))}
            </ul>
          </section>
        ) : null}

        <section
          className="yd-tracker-v7-rail__block yd-tracker-v7-rail__block--decision"
          aria-labelledby="tracker-v7-action"
        >
          <h3 id="tracker-v7-action" className="yd-tracker-v7-rail__label">
            Empfohlene nächste Handlung
          </h3>
          <p className="yd-tracker-v7-rail__recommendation">{decision.primaryAction}</p>
        </section>

        <section className="yd-tracker-v8-rail__actions" aria-labelledby="tracker-v8-actions">
          <h3 id="tracker-v8-actions" className="yd-tracker-v7-rail__label">
            Aktionen
          </h3>
          <div className="yd-tracker-v8-rail__actions-grid">
            {actions.map((action) =>
              action.href ? (
                <button
                  key={action.id}
                  type="button"
                  className={cn(
                    "yd-tracker-v8-decision-btn",
                    action.primary && "yd-tracker-v8-decision-btn--primary"
                  )}
                  onClick={() => handleActionClick(action)}
                >
                  {action.label}
                </button>
              ) : (
                <DecisionButton
                  key={action.id}
                  action={action}
                  onIntent={handleIntent}
                />
              )
            )}
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
        urgency={urgency}
        practicePhone={practicePhone}
        appointmentUrl={appointmentUrl}
        photoCount={photoCount}
        primaryAction={decision.primaryAction}
        isDoctor={isDoctor}
        canSendAppointmentLink={canSendAppointmentLink}
        draftsAvailable={draftsAvailable}
        editableDraftId={editableDraftId}
        initialDraftBody={initialDraftBody}
      />
    </>
  );
}
