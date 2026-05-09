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

/**
 * Rechte Spalte: ein vertikaler Kommunikations-Workspace (Figma: weniger Boxen, mehr Fläche).
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
      className="flex min-h-0 flex-1 flex-col"
      style={{ padding: "clamp(28px,4vw,48px) clamp(20px,3vw,32px) 40px" }}
    >
      <div className="space-y-3" style={{ marginBottom: "36px" }}>
        <h2
          className="text-[13px] font-semibold tracking-wide"
          style={{ color: "#64748B", letterSpacing: "0.04em" }}
        >
          Korrespondenz
        </h2>
        <p className="text-[15px] leading-relaxed" style={{ color: "#475569" }}>
          Entwürfe prüfen und manuell versenden. Keine automatische Patientenkommunikation.
        </p>
      </div>

      <FollowUpMessageDraft
        patientName={patientName}
        urgency={(urgency as "today" | "this_week" | "not_urgent") || null}
        practicePhone={practicePhone ?? null}
        appointmentUrl={appointmentUrl ?? null}
      />

      <div className="mt-14 space-y-4">
        <h2
          className="text-[13px] font-semibold tracking-wide"
          style={{ color: "#64748B", letterSpacing: "0.04em" }}
        >
          Terminlink
        </h2>
        <AppointmentLinkButton
          submissionId={submissionId}
          hasPatientEmail={!!patientEmail}
          canSend={canSendAppointmentLink}
        />
      </div>

      <div className="mt-14">
        <h2
          className="mb-6 text-[13px] font-semibold tracking-wide"
          style={{ color: "#64748B", letterSpacing: "0.04em" }}
        >
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
        <p className="mt-10 text-[13px] leading-relaxed" style={{ color: "#94A3B8" }}>
          Teamaufgaben in{" "}
          <Link href="/relay" className="font-medium underline-offset-2" style={{ color: "#2563EB" }}>
            Relay
          </Link>
          .
        </p>
      </div>
    </div>
  );
}
