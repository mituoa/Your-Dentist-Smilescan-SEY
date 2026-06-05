"use client";

import { useCallback, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

import {
  prepareMessageDraftForSubmission,
  saveMessageDraftBody,
} from "@/app/(protected)/inbox/[id]/message-draft-actions";
import { updateSubmissionUrgency } from "@/app/(protected)/inbox/[id]/actions";
import {
  TrackerClinicalActionSheet,
} from "@/components/inbox/tracker-clinical-action-sheet";
import { useTrackerWorkflow } from "@/components/inbox/tracker-workflow-context";
import { stashWorkflowDraftForSubmission } from "@/lib/command-ai/draft-bridge";
import {
  buildBeobachtenDraft,
  buildRuckfrageDraftForSnippet,
  buildTerminOfferDraft,
  TRACKER_RUCKFRAGE_RAIL_CHIPS,
  type UrgencyKey,
} from "@/lib/clinical/message-templates";
import { clinicalPriorityLabel } from "@/lib/inbox/tracker-clinical-priority-label";
import type { TrackerActionIntent } from "@/lib/inbox/tracker-clinical-decision";
import {
  buildTrackerV9ClinicalModel,
  CLINICAL_URGENCY_OPTIONS,
  normalizeClinicalUrgency,
  type ClinicalUrgencyId,
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

function toUrgencyKey(id: ClinicalUrgencyId): UrgencyKey {
  return id;
}

/** Entscheidungsleiste — Progressive Disclosure, Enterprise Medical Workflow. */
export function TrackerPraxisAssistent({
  submissionId,
  trackerBackboneAvailable = true,
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
  const { responsePath, setResponsePath, applyDraftToPanel } = useTrackerWorkflow();
  const [sheetIntent, setSheetIntent] = useState<TrackerActionIntent | null>(null);
  const [clinicalUrgency, setClinicalUrgency] = useState<ClinicalUrgencyId>(
    normalizeClinicalUrgency(urgency) ?? "this_week"
  );
  const [actionNotice, setActionNotice] = useState<ActionNotice | null>(null);
  const [pending, startTransition] = useTransition();

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

  const priorityLabel = useMemo(
    () =>
      clinicalPriorityLabel({
        patient_notes: patientNotes,
        urgency: clinicalUrgency,
        intake_channel: intakeChannel,
      }),
    [patientNotes, clinicalUrgency, intakeChannel]
  );

  const draftParams = useMemo(
    () => ({
      patientName,
      urgency: toUrgencyKey(clinicalUrgency),
      practicePhone: practicePhone || "",
      appointmentUrl,
    }),
    [patientName, clinicalUrgency, practicePhone, appointmentUrl]
  );

  const commitDraft = useCallback(
    async (
      body: string,
      path: "termin" | "ruckfrage" | "beobachten",
      meta?: { urgency?: string | null; snippetId?: string | null }
    ) => {
      if (!draftsAvailable) {
        setActionNotice({
          type: "error",
          message: "Antwortentwürfe sind aktuell nicht verfügbar.",
        });
        return;
      }

      if (!editableDraftId) {
        const prep = await prepareMessageDraftForSubmission(submissionId);
        if (!prep.ok) {
          setActionNotice({ type: "error", message: prep.error });
          return;
        }
        stashWorkflowDraftForSubmission(submissionId, body);
        router.refresh();
        return;
      }

      const saveRes = await saveMessageDraftBody({
        draftId: editableDraftId,
        submissionId,
        body,
      });
      if (!saveRes.ok) {
        setActionNotice({ type: "error", message: saveRes.error });
        return;
      }

      applyDraftToPanel({
        body,
        path,
        urgency: meta?.urgency ?? clinicalUrgency,
        snippetId: meta?.snippetId ?? null,
      });
      router.refresh();
    },
    [
      applyDraftToPanel,
      clinicalUrgency,
      draftsAvailable,
      editableDraftId,
      router,
      submissionId,
    ]
  );

  const pushDraft = useCallback(
    (
      body: string,
      path: "termin" | "ruckfrage" | "beobachten",
      meta?: { urgency?: string | null; snippetId?: string | null }
    ) => {
      setActionNotice(null);
      startTransition(async () => {
        await commitDraft(body, path, meta);
      });
    },
    [commitDraft]
  );

  const selectPath = (path: "termin" | "ruckfrage" | "beobachten") => {
    setResponsePath(path);
    if (path === "beobachten") {
      pushDraft(
        buildBeobachtenDraft({
          patientName,
          appointmentUrl,
        }),
        "beobachten"
      );
    }
  };

  const applyTerminUrgency = (id: ClinicalUrgencyId) => {
    setClinicalUrgency(id);
    setActionNotice(null);
    startTransition(async () => {
      const res = await updateSubmissionUrgency(submissionId, id);
      if (res.error) {
        setActionNotice({ type: "error", message: res.error });
        return;
      }
      const body = buildTerminOfferDraft({
        ...draftParams,
        urgency: toUrgencyKey(id),
      });
      await commitDraft(body, "termin", { urgency: id });
    });
  };

  const applyRuckfrageChip = (snippetId: string) => {
    const body = buildRuckfrageDraftForSnippet(snippetId, draftParams);
    pushDraft(body, "ruckfrage", { snippetId });
  };

  return (
    <>
      <aside
        id="tracker-entscheidung"
        className="yd-tracker-v7-rail yd-tracker-v8-rail yd-tracker-v12-rail yd-tracker-v14-rail yd-tracker-v15-rail"
        aria-label="Entscheidung"
        aria-busy={pending || sheetIntent !== null}
      >
        <section className="yd-tracker-v12-rail__block yd-tracker-v12-rail__block--empfehlung">
          <h2 className="yd-tracker-v12-rail__label">Empfohlene nächste Aktion</h2>
          <p className="yd-tracker-v12-rail__headline yd-tracker-v16-rail__recommendation">
            {clinical.recommendationLabel}
          </p>
        </section>

        <section className="yd-tracker-v12-rail__block">
          <h2 className="yd-tracker-v12-rail__label">Klinische Einschätzung</h2>
          <p className="yd-tracker-v12-rail__label yd-tracker-v12-rail__label--muted">
            {priorityLabel}
          </p>
        </section>

        <section className="yd-tracker-v12-rail__block yd-tracker-v14-rail__block--action">
          <p className="yd-tracker-v16-rail__action-label">Wie möchten Sie reagieren?</p>
          <div className="flex flex-col gap-2">
            <button
              type="button"
              className={cn(
                "yd-tracker-v12-primary-action yd-tracker-v14-primary-action yd-tracker-v15-primary-action",
                responsePath === "termin" && "yd-tracker-v15-primary-action--active"
              )}
              disabled={pending}
              onClick={() => selectPath("termin")}
            >
              Termin anbieten
            </button>
            <button
              type="button"
              className={cn(
                "yd-tracker-v12-primary-action yd-tracker-v14-primary-action yd-tracker-v15-primary-action",
                responsePath === "ruckfrage" && "yd-tracker-v15-primary-action--active"
              )}
              disabled={pending}
              onClick={() => selectPath("ruckfrage")}
            >
              Rückfrage stellen
            </button>
            <button
              type="button"
              className={cn(
                "yd-tracker-v12-primary-action yd-tracker-v14-primary-action yd-tracker-v15-primary-action",
                responsePath === "beobachten" && "yd-tracker-v15-primary-action--active"
              )}
              disabled={pending}
              onClick={() => selectPath("beobachten")}
            >
              Beobachten
            </button>
          </div>
        </section>

        {responsePath === "termin" ? (
          <section className="yd-tracker-v12-rail__block">
            <h2 className="yd-tracker-v12-rail__label">Terminzeitpunkt</h2>
            <div className="flex flex-wrap gap-2">
              {CLINICAL_URGENCY_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  disabled={pending}
                  className={cn(
                    "yd-tracker-v12-more-action yd-tracker-v14-more-action",
                    clinicalUrgency === opt.id &&
                      "yd-tracker-v14-more-action--emphasized"
                  )}
                  onClick={() => applyTerminUrgency(opt.id)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </section>
        ) : null}

        {responsePath === "ruckfrage" ? (
          <section className="yd-tracker-v12-rail__block">
            <h2 className="yd-tracker-v12-rail__label">Was möchten Sie erfragen?</h2>
            <div className="flex flex-wrap gap-2">
              {TRACKER_RUCKFRAGE_RAIL_CHIPS.map((chip) => (
                <button
                  key={chip.id}
                  type="button"
                  disabled={pending}
                  className="yd-tracker-v12-more-action yd-tracker-v14-more-action"
                  onClick={() => applyRuckfrageChip(chip.id)}
                >
                  {chip.label}
                </button>
              ))}
              {photoCount === 0 ? (
                <button
                  type="button"
                  disabled={pending}
                  className="yd-tracker-v12-more-action yd-tracker-v14-more-action"
                  onClick={() => setSheetIntent("foto")}
                >
                  Foto anfordern
                </button>
              ) : null}
            </div>
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
