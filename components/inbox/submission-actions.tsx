import Link from "next/link";

import { SubmissionMessageDraftPanel } from "./submission-message-draft-panel";
import { TrackerCaseSidebarMeta } from "./tracker-case-sidebar-meta";
import type { MessageDraftRow } from "@/lib/queries/message-drafts";
import type { IntakeChannel } from "@/lib/submissions/intake-channel";

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
  isDoctor: boolean;
  messageDraftsAvailable: boolean;
  editableMessageDraft: MessageDraftRow | null;
  historyMessageDraft: MessageDraftRow | null;
  intakeChannel?: IntakeChannel;
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
  isDoctor,
  messageDraftsAvailable,
  editableMessageDraft,
  historyMessageDraft,
  intakeChannel = "unknown",
}: SubmissionActionsProps) {
  return (
    <div className="flex min-h-0 max-lg:flex-none touch-manipulation flex-col px-4 py-3 lg:min-h-0 lg:flex-1 lg:px-3 lg:py-2">
      <div className="flex min-h-0 min-w-0 max-lg:flex-none flex-col overflow-hidden max-lg:overflow-visible lg:min-h-0 lg:flex-1">
        <div className="min-h-0 overscroll-y-contain pb-[max(0.75rem,var(--safe-area-bottom))] max-lg:h-auto max-lg:flex-none max-lg:overflow-visible max-lg:pb-[max(1rem,var(--safe-area-bottom))] max-lg:scroll-pb-28 lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
          <div id="tracker-korrespondenz" className={`scroll-mt-6 border-b border-[rgba(15,23,42,0.06)] ${sectionPad}`}>
            <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.06em] text-[#64748B]">
              Entwurf
            </p>
            <SubmissionMessageDraftPanel
              submissionId={submissionId}
              patientName={patientName}
              patientEmail={patientEmail}
              urgency={urgency ?? null}
              practicePhone={practicePhone ?? null}
              appointmentUrl={appointmentUrl ?? null}
              isDoctor={isDoctor}
              draftsAvailable={messageDraftsAvailable}
              initialEditableDraft={editableMessageDraft}
              initialHistoryDraft={historyMessageDraft}
            />
          </div>

          <div id="tracker-termin" className={`scroll-mt-6 border-b border-[rgba(15,23,42,0.06)] ${sectionPad}`}>
            <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.06em] text-[#64748B]">
              Termin
            </p>
            <p className="text-[14px] leading-relaxed text-slate-600">
              Terminangebote senden Sie im Tracker über „Termin anbieten“ (Nachrichtentext und
              Terminlink in einer E-Mail).
            </p>
          </div>

          <div className={sectionPad}>
            <p className="mb-3 text-[12px] font-semibold uppercase tracking-[0.06em] text-[#64748B]">
              Kurzinfo
            </p>
            <TrackerCaseSidebarMeta
              intakeChannel={intakeChannel}
              photoCount={photoCount ?? 0}
              urgency={urgency ?? null}
              isDraft={isDraft}
              seenAt={seenAt}
            />
            <p className="mt-4 text-[12px] text-[#94A3B8]">
              <Link href="/relay" className="font-medium text-[#1A4F9C] hover:underline">
                Relay
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
