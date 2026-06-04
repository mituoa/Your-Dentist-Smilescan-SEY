import {
  formatPatientAgeYears,
  formatTrackerCaseRef,
  type TrackerStatusDisplay,
} from "@/lib/inbox/tracker-inbox-logic";
import { getIntakeChannelLabel, type IntakeChannel } from "@/lib/submissions/intake-channel";
import { cn } from "@/lib/utils";

type TrackerPatientHeaderProps = {
  submissionId: string;
  patientName: string | null;
  status: TrackerStatusDisplay;
  birthDate: string | null;
  createdAt: string;
  urgency: string | null;
  intakeChannel: IntakeChannel;
  concern: string | null;
  isDraft?: boolean;
  patientEmail?: string | null;
  patientPhone?: string | null;
  patientExternalId?: string | null;
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

function formatBirthDe(value: string | null): string | null {
  if (!value) return null;
  const part = value.split("T")[0];
  const [y, m, d] = part.split("-").map((x) => parseInt(x, 10));
  if (!y || !m || !d) return null;
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function patientFirstName(name: string | null): string | null {
  const parts = (name ?? "").trim().split(/\s+/).filter(Boolean);
  return parts[0] ?? null;
}

function urgencyLabel(urgency: string | null): string | null {
  if (urgency === "today") return "Heute";
  if (urgency === "this_week") return "Diese Woche";
  if (urgency === "not_urgent") return "Nicht dringend";
  return null;
}

export function TrackerPatientHeader({
  submissionId,
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
  patientExternalId,
}: TrackerPatientHeaderProps) {
  const displayName = patientName?.trim() || "Unbekannter Patient";
  const firstName = patientFirstName(patientName);
  const age = formatPatientAgeYears(birthDate);
  const birthFormatted = formatBirthDe(birthDate);
  const urgencyText = urgencyLabel(urgency);
  const patientId = formatTrackerCaseRef(submissionId, patientExternalId ?? null);
  const email = patientEmail?.trim() || null;
  const phone = patientPhone?.trim() || null;

  return (
    <header className="yd-tracker-v4-patient-header">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="yd-tracker-v4-patient-header__name">{displayName}</h2>
          {firstName && displayName !== firstName ? (
            <p className="yd-tracker-v4-patient-header__firstname">Vorname: {firstName}</p>
          ) : null}
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
        <div>
          <dt>Patienten-ID</dt>
          <dd>{patientId}</dd>
        </div>
        {birthFormatted ? (
          <div>
            <dt>Geburtsdatum</dt>
            <dd>{birthFormatted}</dd>
          </div>
        ) : null}
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
        <div>
          <dt>Eingangskanal</dt>
          <dd>{getIntakeChannelLabel(intakeChannel)}</dd>
        </div>
        {urgencyText ? (
          <div>
            <dt>Dringlichkeit</dt>
            <dd>{urgencyText}</dd>
          </div>
        ) : null}
        {isDraft ? (
          <div>
            <dt>Fallstatus</dt>
            <dd>Entwurf</dd>
          </div>
        ) : null}
      </dl>

      {concern ? (
        <div className="yd-tracker-v4-patient-header__concern-block">
          <p className="yd-tracker-v4-patient-header__concern-label">Anliegen</p>
          <p className="yd-tracker-v4-patient-header__concern">{concern}</p>
        </div>
      ) : null}

      {email || phone ? (
        <dl className="yd-tracker-v4-patient-header__contact-grid">
          {email ? (
            <div>
              <dt>E-Mail</dt>
              <dd>
                <a href={`mailto:${email}`} className="text-[#2563EB] hover:underline">
                  {email}
                </a>
              </dd>
            </div>
          ) : null}
          {phone ? (
            <div>
              <dt>Telefon</dt>
              <dd>
                <a href={`tel:${phone.replace(/\s/g, "")}`} className="text-[#2563EB] hover:underline">
                  {phone}
                </a>
              </dd>
            </div>
          ) : null}
        </dl>
      ) : null}
    </header>
  );
}
