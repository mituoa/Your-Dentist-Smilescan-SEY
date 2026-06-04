import {
  formatPatientAgeYears,
  formatTrackerCaseRef,
  type TrackerStatusDisplay,
} from "@/lib/inbox/tracker-inbox-logic";
import { getIntakeChannelLabel, type IntakeChannel } from "@/lib/submissions/intake-channel";
import { TrackerUrgencyChips } from "@/components/inbox/tracker-urgency-chips";

type TrackerMetadataPanelProps = {
  submissionId: string;
  patientName: string | null;
  status: TrackerStatusDisplay;
  birthDate: string | null;
  createdAt: string;
  urgency: string | null;
  intakeChannel: IntakeChannel;
  isDraft?: boolean;
  patientEmail?: string | null;
  patientPhone?: string | null;
  patientExternalId?: string | null;
  variant?: "default" | "minimal";
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

export function TrackerMetadataPanel({
  submissionId,
  status,
  birthDate,
  createdAt,
  urgency,
  intakeChannel,
  isDraft,
  patientEmail,
  patientPhone,
  patientExternalId,
  variant = "default",
}: TrackerMetadataPanelProps) {
  const minimal = variant === "minimal";
  const patientId = formatTrackerCaseRef(submissionId, patientExternalId ?? null);
  const age = formatPatientAgeYears(birthDate);
  const birthFormatted = formatBirthDe(birthDate);
  const email = patientEmail?.trim() || null;
  const phone = patientPhone?.trim() || null;

  return (
    <details className={minimal ? "yd-tracker-meta-minimal" : "yd-tracker-ia-meta"}>
      <summary className={minimal ? "yd-tracker-meta-minimal__summary" : "yd-tracker-ia-meta__summary"}>
        Stammdaten
        <span className={minimal ? "yd-tracker-meta-minimal__hint" : "yd-tracker-ia-meta__hint"}>
          bei Bedarf
        </span>
      </summary>
      <div className={minimal ? "yd-tracker-meta-minimal__body" : "yd-tracker-ia-meta__body"}>
        <dl className={minimal ? "yd-tracker-meta-minimal__grid" : "yd-tracker-ia-meta__grid"}>
          <div>
            <dt>Status</dt>
            <dd>{status.label}</dd>
          </div>
          <div>
            <dt>Fallreferenz</dt>
            <dd>{patientId}</dd>
          </div>
          {birthFormatted ? (
            <div>
              <dt>Geburtsdatum</dt>
              <dd>
                {birthFormatted}
                {age ? ` · ${age}` : ""}
              </dd>
            </div>
          ) : null}
          <div>
            <dt>Eingang</dt>
            <dd>{formatIntakeDate(createdAt)}</dd>
          </div>
          <div>
            <dt>Kanal</dt>
            <dd>{getIntakeChannelLabel(intakeChannel)}</dd>
          </div>
          {email ? (
            <div>
              <dt>E-Mail</dt>
              <dd>
                <a href={`mailto:${email}`}>{email}</a>
              </dd>
            </div>
          ) : null}
          {phone ? (
            <div>
              <dt>Telefon</dt>
              <dd>
                <a href={`tel:${phone.replace(/\s/g, "")}`}>{phone}</a>
              </dd>
            </div>
          ) : null}
          {isDraft ? (
            <div>
              <dt>Fallstatus</dt>
              <dd>Entwurf</dd>
            </div>
          ) : null}
        </dl>
        <div className={minimal ? "yd-tracker-meta-minimal__urgency" : "yd-tracker-ia-meta__urgency"}>
          <p className={minimal ? "yd-tracker-meta-minimal__urgency-label" : "yd-tracker-ia-meta__urgency-label"}>
            Zeitraum
          </p>
          <TrackerUrgencyChips submissionId={submissionId} initialUrgency={urgency} />
        </div>
      </div>
    </details>
  );
}
