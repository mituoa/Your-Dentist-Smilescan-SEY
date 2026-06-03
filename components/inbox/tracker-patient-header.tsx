import {
  formatPatientAgeYears,
  type TrackerStatusDisplay,
} from "@/lib/inbox/tracker-inbox-logic";
import { getIntakeChannelLabel, type IntakeChannel } from "@/lib/submissions/intake-channel";
import { cn } from "@/lib/utils";

type TrackerPatientHeaderProps = {
  patientName: string;
  status: TrackerStatusDisplay;
  birthDate: string | null;
  createdAt: string;
  urgency: string | null;
  intakeChannel: IntakeChannel;
  concern: string | null;
  isDraft?: boolean;
  patientEmail?: string | null;
  patientPhone?: string | null;
};

function formatIntakeDate(iso: string): string {
  return new Date(iso).toLocaleDateString("de-DE", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function urgencyLabel(urgency: string | null): string | null {
  if (urgency === "today") return "Heute dringend";
  if (urgency === "this_week") return "Diese Woche";
  if (urgency === "not_urgent") return "Keine Eile";
  return null;
}

export function TrackerPatientHeader({
  patientName,
  status,
  birthDate,
  createdAt,
  urgency,
  intakeChannel,
  concern,
  isDraft,
  patientEmail,
  patientPhone,
}: TrackerPatientHeaderProps) {
  const age = formatPatientAgeYears(birthDate);
  const urgencyText = urgencyLabel(urgency);

  return (
    <header className="yd-tracker-v4-patient-header">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="yd-tracker-v4-patient-header__name">{patientName}</h2>
          {concern ? <p className="yd-tracker-v4-patient-header__concern">{concern}</p> : null}
        </div>
        <span
          className={cn(
            "yd-tracker-v4-status yd-tracker-v4-status--lg",
            "yd-tracker-table__status",
            status.className
          )}
        >
          <span className="yd-tracker-v4-status__dot" aria-hidden />
          {status.label}
        </span>
      </div>

      <dl className="yd-tracker-v4-patient-header__meta">
        {age ? (
          <div>
            <dt>Alter</dt>
            <dd>{age}</dd>
          </div>
        ) : null}
        <div>
          <dt>Eingang</dt>
          <dd>{formatIntakeDate(createdAt)}</dd>
        </div>
        {urgencyText ? (
          <div>
            <dt>Dringlichkeit</dt>
            <dd>{urgencyText}</dd>
          </div>
        ) : null}
        <div>
          <dt>Zeitraum</dt>
          <dd>{getIntakeChannelLabel(intakeChannel)}</dd>
        </div>
        {isDraft ? (
          <div>
            <dt>Status</dt>
            <dd>Entwurf</dd>
          </div>
        ) : null}
      </dl>

      {patientEmail?.trim() || patientPhone?.trim() ? (
        <p className="yd-tracker-v4-patient-header__contact">
          {[patientEmail?.trim(), patientPhone?.trim()].filter(Boolean).join(" · ")}
        </p>
      ) : null}
    </header>
  );
}
