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

/** Sekundäre Spalte — Figma-Canvas #F7F9FC, Panel weiß / dezent. */
const shell = "rounded-lg border border-[#E5E7EB] bg-white shadow-none";
const sectionPad = "px-4 py-5 sm:px-5 sm:py-6";

/**
 * Rechte Spalte: kompakter Kommunikations-Workspace (untergeordnet zur medizinischen Mitte).
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
    <div
      className="flex min-h-0 flex-1 flex-col gap-4"
      style={{ padding: "16px 14px 20px" }}
    >
      <div className={`flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden ${shell}`}>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div id="tracker-korrespondenz" className={`scroll-mt-6 border-b border-slate-100 ${sectionPad}`}>
            <div className="mb-4 space-y-1.5">
              <h2 className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                Korrespondenz
              </h2>
              <p className="text-[13px] font-semibold leading-snug tracking-tight text-slate-800">
                Patientenkommunikation
              </p>
              <p className="text-[12px] leading-relaxed text-slate-600">
                Vorlagen, Entwurf prüfen, manuell versenden. Kein automatischer Versand.
              </p>
            </div>
            <FollowUpMessageDraft
              patientName={patientName}
              urgency={(urgency as "today" | "this_week" | "not_urgent") || null}
              practicePhone={practicePhone ?? null}
              appointmentUrl={appointmentUrl ?? null}
            />
          </div>

          <div id="tracker-termin" className={`scroll-mt-6 border-b border-slate-100 ${sectionPad}`}>
            <h2 className="mb-0.5 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">
              Terminlogik
            </h2>
            <p className="mb-3 text-[12px] leading-relaxed text-slate-600">
              Link teilen oder E-Mail mit Terminoption — je nach Ablauf in der Praxis.
            </p>
            <AppointmentLinkButton
              submissionId={submissionId}
              hasPatientEmail={!!patientEmail}
              canSend={canSendAppointmentLink}
            />
          </div>

          <div className={sectionPad}>
            <h2 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">
              Fallkontext
            </h2>
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
            <p className="mt-6 text-[12px] leading-relaxed text-slate-500">
              Teamaufgaben in{" "}
              <Link href="/relay" className="font-medium text-[#2563EB] underline-offset-2 hover:underline">
                Relay
              </Link>
              .
            </p>
          </div>
        </div>

        <div
          id="tracker-assist-root"
          className="shrink-0 border-t border-slate-100 bg-[#F2F5F9] px-3 py-3 sm:px-4 sm:py-3.5"
        />
      </div>
    </div>
  );
}
