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

const panel = "rounded-2xl border border-[rgba(15,23,42,0.07)] bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]";
const sectionPad = "px-5 py-6 sm:px-6 sm:py-7";

/**
 * Rechte Spalte: ein Kommunikations-Workspace (Figma: eine Säule, klare Abschnitte, Assist unten).
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
      className="flex min-h-0 flex-1 flex-col gap-5"
      style={{ padding: "clamp(20px,3vw,36px) clamp(16px,2.5vw,28px) 24px" }}
    >
      <div className={`flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden ${panel}`}>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <div id="tracker-korrespondenz" className={`scroll-mt-6 border-b border-[rgba(15,23,42,0.06)] ${sectionPad}`}>
            <div className="mb-5 space-y-2">
              <h2 className="text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                Korrespondenz
              </h2>
              <p className="text-[15px] font-semibold leading-snug tracking-tight text-slate-900">
                Patientenkommunikation
              </p>
              <p className="text-[14px] leading-relaxed text-slate-600">
                Vorlagen wählen, Entwurf prüfen, manuell versenden. Keine automatische Patientenkommunikation.
              </p>
            </div>
            <FollowUpMessageDraft
              patientName={patientName}
              urgency={(urgency as "today" | "this_week" | "not_urgent") || null}
              practicePhone={practicePhone ?? null}
              appointmentUrl={appointmentUrl ?? null}
            />
          </div>

          <div id="tracker-termin" className={`scroll-mt-6 border-b border-[rgba(15,23,42,0.06)] ${sectionPad}`}>
            <h2 className="mb-1 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">Terminlogik</h2>
            <p className="mb-4 text-[14px] leading-relaxed text-slate-600">
              Link teilen oder E-Mail mit Terminoption auslösen — je nach Praxisablauf.
            </p>
            <AppointmentLinkButton
              submissionId={submissionId}
              hasPatientEmail={!!patientEmail}
              canSend={canSendAppointmentLink}
            />
          </div>

          <div className={sectionPad}>
            <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.1em] text-slate-500">Fallkontext</h2>
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
            <p className="mt-8 text-[13px] leading-relaxed text-slate-500">
              Teamaufgaben in{" "}
              <Link href="/relay" className="font-medium text-[#2563EB] underline-offset-2 hover:underline">
                Relay
              </Link>
              .
            </p>
          </div>
        </div>

        {/* Portal-Ziel für eingebettete Klinische Assistenz (CommandAssist) */}
        <div
          id="tracker-assist-root"
          className="shrink-0 border-t border-[rgba(15,23,42,0.06)] bg-[#F4F7FB] px-4 py-4 sm:px-5 sm:py-5"
        />
      </div>
    </div>
  );
}
