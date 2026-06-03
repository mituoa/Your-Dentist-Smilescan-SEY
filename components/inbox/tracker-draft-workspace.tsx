import { SubmissionMessageDraftPanel } from "@/components/inbox/submission-message-draft-panel";
import type { MessageDraftRow } from "@/lib/queries/message-drafts";

type TrackerDraftWorkspaceProps = {
  submissionId: string;
  patientName: string | null;
  urgency: string | null;
  practicePhone: string | null;
  appointmentUrl: string | null;
  isDoctor: boolean;
  draftsAvailable: boolean;
  editableMessageDraft: MessageDraftRow | null;
  historyMessageDraft: MessageDraftRow | null;
};

export function TrackerDraftWorkspace(props: TrackerDraftWorkspaceProps) {
  return (
    <section className="yd-tracker-v4-draft" aria-labelledby="tracker-v4-draft-title">
      <h3 id="tracker-v4-draft-title" className="yd-tracker-v4-section-title">
        Antwortentwurf
      </h3>
      <p className="yd-tracker-v4-draft__hint">
        Lesen, anpassen und freigeben — die Hauptarbeit für diesen Fall.
      </p>
      <div className="yd-tracker-v4-draft__surface">
        <SubmissionMessageDraftPanel
          submissionId={props.submissionId}
          patientName={props.patientName}
          urgency={props.urgency}
          practicePhone={props.practicePhone}
          appointmentUrl={props.appointmentUrl}
          isDoctor={props.isDoctor}
          draftsAvailable={props.draftsAvailable}
          initialEditableDraft={props.editableMessageDraft}
          initialHistoryDraft={props.historyMessageDraft}
        />
      </div>
    </section>
  );
}
