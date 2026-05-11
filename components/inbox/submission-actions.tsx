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
 * Rechte Spalte: **unterstützende Praxis-Kommunikation** (Entwürfe, Terminlink) — untergeordnet
 * zur Triage-Mitte. Kein Postfach, kein Chat-Verlauf, kein CRM-Case-Workspace.
 * **Punkt 9 — Mobile:** Außenpadding enger auf kleinen Screens; inneres Scroll mit `overscroll-y-contain`,
 * **`scroll-padding-bottom`** + Safe-Area-Inset unten — Tastatur/Entwurf weniger abgeschnitten.
 * **Punkt 11 — MVP:** Überschriften nennen **Entwurf/Kopie** explizit; Stammdaten-Block ohne
 * „Plattform-Kontext“-Wording.
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
    <div className="flex min-h-0 flex-1 touch-manipulation flex-col gap-4 p-3 sm:px-[14px] sm:pb-5 sm:pt-4">
      <div className={`flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden ${shell}`}>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain pb-[max(0.75rem,var(--safe-area-bottom))] max-lg:scroll-pb-28">
          <div id="tracker-korrespondenz" className={`scroll-mt-6 border-b border-slate-100 ${sectionPad}`}>
            <div className="mb-4 space-y-1.5">
              <h2 className="text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">
                Text & Entwurf
              </h2>
              <p className="text-[13px] font-semibold leading-snug tracking-tight text-slate-800">
                Rückmeldung an den Patienten
              </p>
              <p className="text-[12px] leading-relaxed text-slate-600">
                Vorlagen und Entwurf hier kopieren — in Ihrem Kanal (Telefon, Praxis-SMS, E-Mail)
                selbst versenden. SmileScan versendet nichts automatisch.
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
              Terminlink
            </h2>
            <p className="mb-3 text-[12px] leading-relaxed text-slate-600">
              Terminlink per E-Mail an die hinterlegte Adresse — nur nach Klick, nicht im Hintergrund.
            </p>
            <AppointmentLinkButton
              submissionId={submissionId}
              hasPatientEmail={!!patientEmail}
              canSend={canSendAppointmentLink}
            />
          </div>

          <div className={sectionPad}>
            <h2 className="mb-3 text-[10px] font-semibold uppercase tracking-[0.1em] text-slate-500">
              Stammdaten & Status
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
              Zugewiesene Teamaufgaben:{" "}
              <Link href="/relay" className="font-medium text-[#2563EB] underline-offset-2 hover:underline">
                Relay
              </Link>{" "}
              (separater Arbeitsbereich, kein Patienten-Postfach).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
