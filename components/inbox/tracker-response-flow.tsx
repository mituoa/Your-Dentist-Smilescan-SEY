"use client";

import { useEffect, useState } from "react";

import type { SubmissionUrgencyValue } from "@/app/(protected)/inbox/[id]/actions";
import { TrackerDraftWorkspace } from "@/components/inbox/tracker-draft-workspace";
import { TrackerUrgencyChips } from "@/components/inbox/tracker-urgency-chips";
import type { MessageDraftRow } from "@/lib/queries/message-drafts";

type TrackerResponseFlowProps = {
  submissionId: string;
  patientName: string | null;
  initialUrgency: string | null;
  practicePhone: string | null;
  appointmentUrl: string | null;
  isDoctor: boolean;
  draftsAvailable: boolean;
  editableMessageDraft: MessageDraftRow | null;
  historyMessageDraft: MessageDraftRow | null;
  patientEmail: string | null;
  canSendAppointmentLink: boolean;
  /** Weniger Erklärtexte — Enterprise-Arbeitsfläche. */
  compact?: boolean;
};

function isUrgencySet(value: string | null): value is SubmissionUrgencyValue {
  return value === "today" || value === "this_week" || value === "not_urgent";
}

function responseHint(urgency: SubmissionUrgencyValue): string {
  if (urgency === "today") {
    return "Zeitnaher Termin und eine passende Rückmeldung — Entwurf anpassen oder Terminlink senden.";
  }
  if (urgency === "this_week") {
    return "Termin in den nächsten Tagen oder Rückmeldung per Entwurf — beides mit der gewählten Dringlichkeit.";
  }
  return "Rückmeldung per Entwurf; bei Bedarf können Sie zusätzlich einen Terminlink senden.";
}

export function TrackerResponseFlow({
  submissionId,
  patientName,
  initialUrgency,
  practicePhone,
  appointmentUrl,
  isDoctor,
  draftsAvailable,
  editableMessageDraft,
  historyMessageDraft,
  patientEmail,
  canSendAppointmentLink,
  compact = false,
}: TrackerResponseFlowProps) {
  const [urgency, setUrgency] = useState<string | null>(initialUrgency);

  useEffect(() => {
    setUrgency(initialUrgency);
  }, [initialUrgency]);

  const urgencyChosen = isUrgencySet(urgency);
  const showTerminFirst = urgency === "today" || urgency === "this_week";

  return (
    <div className="yd-tracker-v4-response-flow flex flex-col gap-6">
      <section
        className="yd-tracker-v4-urgency scroll-mt-20"
        aria-labelledby="tracker-v4-urgency-label"
      >
        <h3 id="tracker-v4-urgency-label" className="yd-tracker-comm__subtitle">
          Dringlichkeit
        </h3>
        {!compact ? (
          <p className="yd-tracker-v4-urgency__lead">
            Bitte zuerst einordnen — danach stehen Antwortentwurf und Terminlink zur Verfügung.
          </p>
        ) : null}
        <TrackerUrgencyChips
          submissionId={submissionId}
          initialUrgency={urgency}
          onUrgencyChange={(id) => setUrgency(id)}
        />
      </section>

      {!urgencyChosen ? (
        <p className="yd-tracker-comm__gate" role="status">
          Dringlichkeit wählen
        </p>
      ) : (
        <>
          {!compact ? (
            <p className="text-[13px] leading-relaxed text-slate-600">{responseHint(urgency)}</p>
          ) : null}

          <div id="tracker-korrespondenz" className="scroll-mt-20">
            <TrackerDraftWorkspace
              submissionId={submissionId}
              patientName={patientName}
              patientEmail={patientEmail}
              urgency={urgency}
              practicePhone={practicePhone}
              appointmentUrl={appointmentUrl}
              isDoctor={isDoctor}
              draftsAvailable={draftsAvailable}
              editableMessageDraft={editableMessageDraft}
              historyMessageDraft={historyMessageDraft}
            />
          </div>

        </>
      )}
    </div>
  );
}
