import Link from "next/link";

import { AppointmentLinkButton } from "./appointment-link-button";
import { FollowUpMessageDraft } from "./follow-up-message-draft";
import { SubmissionMeta } from "./submission-meta";

interface SubmissionActionsProps {
  submissionId: string;
  patientName: string | null;
  patientEmail: string | null;
  patientPhone: string | null;
  createdAt: string;
  patientBirthDate?: string | null;
  patientExternalId?: string | null;
  urgency?: string | null;
  isDraft?: boolean;
  seenAt?: string | null;
  updatedAt?: string | null;
  photoCount?: number;
  tasks?: unknown;
  assignableMembers?: unknown;
  canCheckOff?: boolean;
  canSendAppointmentLink: boolean;
  practicePhone?: string | null;
  appointmentUrl?: string | null;
}

const sectionPad = "px-4 py-4 sm:px-5 sm:py-4";

/**
 * Rechte Spalte: Entwurf kopieren + Terminlink — flach auf Canvas #F7F9FC (kein verschachteltes Karten-Instrument).
 */
export function SubmissionActions({
  submissionId,
  patientName,
  patientEmail,
  patientPhone,
  createdAt,
  patientBirthDate,
  patientExternalId,
  urgency,
  isDraft,
  seenAt,
  updatedAt,
  photoCount,
  canSendAppointmentLink,
  practicePhone,
  appointmentUrl,
}: SubmissionActionsProps) {
  return (
    <div className="flex min-h-0 flex-1 touch-manipulation flex-col px-4 py-3 max-lg:flex-none lg:min-h-0 lg:px-3 lg:py-2">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden max-lg:flex-none max-lg:overflow-visible lg:min-h-0">
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain pb-[max(0.75rem,var(--safe-area-bottom))] max-lg:h-auto max-lg:flex-none max-lg:overflow-visible max-lg:pb-[max(1rem,var(--safe-area-bottom))] max-lg:scroll-pb-28 lg:min-h-0 lg:overflow-y-auto">
          <div id="tracker-korrespondenz" className={`scroll-mt-6 border-b border-[rgba(15,23,42,0.06)] ${sectionPad}`}>
            <p className="mb-4 text-[13px] font-semibold leading-snug tracking-tight text-slate-800">
              Entwurf für die Rückmeldung
            </p>
            <FollowUpMessageDraft
              patientName={patientName}
              urgency={(urgency as "today" | "this_week" | "not_urgent") || null}
              practicePhone={practicePhone ?? null}
              appointmentUrl={appointmentUrl ?? null}
            />
          </div>

          <div id="tracker-termin" className={`scroll-mt-6 border-b border-[rgba(15,23,42,0.06)] ${sectionPad}`}>
            <p className="mb-3 text-[13px] font-semibold text-slate-800">Terminlink</p>
            <AppointmentLinkButton
              submissionId={submissionId}
              hasPatientEmail={!!patientEmail}
              canSend={canSendAppointmentLink}
            />
          </div>

          <div className={sectionPad}>
            <p className="mb-3 text-[13px] font-semibold text-slate-800">Fallangaben</p>
            <SubmissionMeta
              patientName={patientName}
              patientEmail={patientEmail}
              patientPhone={patientPhone}
              createdAt={createdAt}
              patientBirthDate={patientBirthDate}
              patientExternalId={patientExternalId}
              urgency={urgency}
              isDraft={isDraft}
              seenAt={seenAt}
              updatedAt={updatedAt}
              photoCount={photoCount}
            />
            <p className="mt-5 text-[12px] text-slate-500">
              Teamaufgaben:{" "}
              <Link href="/relay" className="font-medium text-[#2563EB] underline-offset-2 hover:underline">
                Relay öffnen
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
