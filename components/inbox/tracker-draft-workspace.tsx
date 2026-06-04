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
  );
}
