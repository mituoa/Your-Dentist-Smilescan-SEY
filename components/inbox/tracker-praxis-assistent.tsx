import Link from "next/link";

import { AppointmentLinkButton } from "@/components/inbox/appointment-link-button";
import { TrackerActionBar } from "@/components/inbox/tracker-action-bar";
import { TrackerDraftWorkspace } from "@/components/inbox/tracker-draft-workspace";
import type { TrackerAssistentView } from "@/lib/inbox/build-tracker-decision";
import type { MessageDraftRow } from "@/lib/queries/message-drafts";

type TrackerPraxisAssistentProps = {
  model: TrackerAssistentView;
  submissionId: string;
  patientName: string | null;
  urgency: string | null;
  practicePhone: string | null;
  appointmentUrl: string | null;
  isDoctor: boolean;
  draftsAvailable: boolean;
  editableMessageDraft: MessageDraftRow | null;
  historyMessageDraft: MessageDraftRow | null;
  canSendAppointmentLink: boolean;
  hasPatientEmail: boolean;
};

export function TrackerPraxisAssistent({
  model,
  submissionId,
  patientName,
  urgency,
  practicePhone,
  appointmentUrl,
  isDoctor,
  draftsAvailable,
  editableMessageDraft,
  historyMessageDraft,
  canSendAppointmentLink,
  hasPatientEmail,
}: TrackerPraxisAssistentProps) {
  return (
    <aside className="yd-tracker-assistent" aria-label="Praxis-Assistent">
      <header className="yd-tracker-assistent__head">
        <div className="yd-tracker-assistent__head-row">
          <h3 className="yd-tracker-assistent__title">Praxis-Assistent</h3>
          <span className="yd-tracker-assistent__status-pill">{model.productStatusLabel}</span>
        </div>
      </header>

      <div className="yd-tracker-assistent__body">
        <section className="yd-tracker-assistent__block">
          <h4 className="yd-tracker-assistent__label">Analyse</h4>
          <p className="yd-tracker-assistent__text">{model.analysis}</p>
        </section>

        <section className="yd-tracker-assistent__block">
          <h4 className="yd-tracker-assistent__label">Empfehlung</h4>
          <p className="yd-tracker-assistent__text">{model.recommendation}</p>
        </section>

        {model.relayNote ? (
          <section className="yd-tracker-assistent__block yd-tracker-assistent__block--relay">
            <h4 className="yd-tracker-assistent__label">Relay</h4>
            <p className="yd-tracker-assistent__text">{model.relayNote}</p>
            <Link href="/relay" className="yd-tracker-assistent__relay-link">
              Aufgaben in Relay öffnen
            </Link>
          </section>
        ) : null}

        <section className="yd-tracker-assistent__block yd-tracker-assistent__block--decision">
          <h4 className="yd-tracker-assistent__label">Ihre Entscheidung</h4>
          <p className="yd-tracker-assistent__decision">{model.decisionRequired}</p>
        </section>

        <section
          id="tracker-freigabe"
          className="yd-tracker-assistent__block yd-tracker-assistent__block--draft scroll-mt-4"
        >
          <h4 className="yd-tracker-assistent__label">Vorbereitete Antwort</h4>
          <TrackerDraftWorkspace
            submissionId={submissionId}
            patientName={patientName}
            urgency={urgency}
            practicePhone={practicePhone}
            appointmentUrl={appointmentUrl}
            isDoctor={isDoctor}
            draftsAvailable={draftsAvailable}
            editableMessageDraft={editableMessageDraft}
            historyMessageDraft={historyMessageDraft}
          />
        </section>

        {canSendAppointmentLink ? (
          <section id="tracker-termin" className="yd-tracker-assistent__block scroll-mt-4">
            <h4 className="yd-tracker-assistent__label">Termin</h4>
            <AppointmentLinkButton
              submissionId={submissionId}
              hasPatientEmail={hasPatientEmail}
              canSend={canSendAppointmentLink}
              variant="minimal"
            />
          </section>
        ) : null}
      </div>

      <footer className="yd-tracker-assistent__footer">
        <p className="yd-tracker-assistent__footer-label">Nächste Schritte</p>
        <TrackerActionBar actions={model.actions} />
        <p className="yd-tracker-assistent__disclaimer">
          KI bereitet vor — Sie entscheiden. Kein automatischer Versand.
        </p>
      </footer>
    </aside>
  );
}
