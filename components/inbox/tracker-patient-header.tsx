import {
  formatPatientAgeYears,
  formatTrackerCaseRef,
  type TrackerStatusDisplay,
} from "@/lib/inbox/tracker-inbox-logic";
import type { IntakeChannel } from "@/lib/submissions/intake-channel";
import { cn } from "@/lib/utils";

type TrackerPatientHeaderProps = {
  submissionId: string;
  patientName: string | null;
  status: TrackerStatusDisplay;
  birthDate: string | null;
  createdAt: string;
  photoCount: number;
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
  });
}

function photoCountLabel(count: number): string {
  if (count === 0) return "Keine Bilder";
  if (count === 1) return "1 Bild";
  return `${count} Bilder`;
}

export function TrackerPatientHeader({
  submissionId,
  patientName,
  status,
  birthDate,
  createdAt,
  photoCount,
  concern,
  isDraft,
  patientEmail,
  patientPhone,
  patientExternalId,
}: TrackerPatientHeaderProps) {
  const displayName = patientName?.trim() || "Unbekannter Patient";
  const age = formatPatientAgeYears(birthDate);
  const patientId = formatTrackerCaseRef(submissionId, patientExternalId ?? null);
  const email = patientEmail?.trim() || null;
  const phone = patientPhone?.trim() || null;
  const caseFocus = concern?.trim() || null;

  return (
    <header className="yd-tracker-v4-patient-header">
      <div className="yd-tracker-v4-patient-header__identity">
        <div className="min-w-0">
          <h2 className="yd-tracker-v4-patient-header__name">{displayName}</h2>
          <p className="yd-tracker-v4-patient-header__strip">
            {age ? <span>{age}</span> : null}
            <span>Eingang {formatIntakeDate(createdAt)}</span>
            <span>{photoCountLabel(photoCount)}</span>
            {isDraft ? <span>Entwurf</span> : null}
          </p>
        </div>
        <span
          className={cn(
            "yd-tracker-v4-status yd-tracker-v4-status--lg yd-tracker-v4-status--header",
            "yd-tracker-table__status",
            status.className
          )}
        >
          <span className="yd-tracker-v4-status__dot" aria-hidden />
          {status.label}
        </span>
      </div>

      <div className="yd-tracker-v4-patient-header__case-focus" role="region" aria-label="Fallgrund">
        <p className="yd-tracker-v4-patient-header__case-focus-label">Warum dieser Fall</p>
        <p className="yd-tracker-v4-patient-header__case-focus-text">
          {caseFocus ?? "Eingang ohne dokumentiertes Anliegen — bitte Verlauf und Bilder prüfen."}
        </p>
      </div>

      {email || phone ? (
        <details className="yd-tracker-v4-patient-header__more">
          <summary>Kontakt & Fallreferenz</summary>
          <dl className="yd-tracker-v4-patient-header__contact-grid">
            <div>
              <dt>Fallreferenz</dt>
              <dd>{patientId}</dd>
            </div>
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
                  <a
                    href={`tel:${phone.replace(/\s/g, "")}`}
                    className="text-[#2563EB] hover:underline"
                  >
                    {phone}
                  </a>
                </dd>
              </div>
            ) : null}
          </dl>
        </details>
      ) : null}
    </header>
  );
}
