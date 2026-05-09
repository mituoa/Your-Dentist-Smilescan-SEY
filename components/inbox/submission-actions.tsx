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
  /** @deprecated Nur Relay — nicht verwenden. */
  tasks?: unknown;
  assignableMembers?: unknown;
  canCheckOff?: boolean;
  canSendAppointmentLink: boolean;
  practicePhone?: string | null;
  appointmentUrl?: string | null;
}

/**
 * Rechte Spalte im Tracker: Korrespondenz, Terminlink, Fallkontext — ohne Aufgaben (die gehören zu Relay).
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
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="px-6 pb-8 pt-8 sm:px-8 sm:pt-10">
        <p
          className="mb-6 text-[11px] font-semibold uppercase tracking-[0.12em]"
          style={{ color: "#94A3B8" }}
        >
          Kommunikation
        </p>
        <FollowUpMessageDraft
          patientName={patientName}
          urgency={(urgency as "today" | "this_week" | "not_urgent") || null}
          practicePhone={practicePhone ?? null}
          appointmentUrl={appointmentUrl ?? null}
        />
      </div>

      <div
        className="border-t px-6 py-8 sm:px-8"
        style={{ borderColor: "rgba(226, 232, 240, 0.85)" }}
      >
        <p
          className="mb-3 text-[11px] font-semibold uppercase tracking-[0.12em]"
          style={{ color: "#94A3B8" }}
        >
          Terminvereinbarung
        </p>
        <p className="mb-5 text-[14px] leading-relaxed" style={{ color: "#64748B" }}>
          Senden Sie dem Patienten auf Wunsch den Online-Terminlink per E-Mail. Die Praxis bleibt
          datenschutzkonform in der Kontrolle.
        </p>
        <AppointmentLinkButton
          submissionId={submissionId}
          hasPatientEmail={!!patientEmail}
          canSend={canSendAppointmentLink}
        />
      </div>

      <div
        className="border-t px-6 py-8 sm:px-8"
        style={{ borderColor: "rgba(226, 232, 240, 0.85)" }}
      >
        <p
          className="mb-5 text-[11px] font-semibold uppercase tracking-[0.12em]"
          style={{ color: "#94A3B8" }}
        >
          Fallkontext
        </p>
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
        <p className="mt-8 text-[13px] leading-relaxed text-text-tertiary">
          Teamaufgaben und Delegation werden in{" "}
          <Link href="/relay" className="font-medium text-brand underline-offset-2 hover:underline">
            Relay
          </Link>{" "}
          geführt — getrennt vom Patienten-Intake hier im Tracker.
        </p>
      </div>
    </div>
  );
}
