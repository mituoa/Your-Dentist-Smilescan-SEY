import { formatPatientAgeYears } from "@/lib/inbox/tracker-inbox-logic";
import { formatTrackerRelativeIngress } from "@/lib/inbox/tracker-v9-clinical";

type TrackerPatientHeaderProps = {
  patientName: string | null;
  birthDate: string | null;
  patientEmail: string | null;
  patientPhone: string | null;
  concern: string | null;
  createdAt?: string | null;
  isDraft?: boolean;
};

function formatBirthDateDe(iso: string | null): string | null {
  if (!iso) return null;
  const part = iso.split("T")[0];
  const [y, m, d] = part.split("-").map((x) => parseInt(x, 10));
  if (!y || !m || !d) return null;
  const dd = String(d).padStart(2, "0");
  const mm = String(m).padStart(2, "0");
  return `${dd}.${mm}.${y}`;
}

function formatPhoneDisplay(phone: string): string {
  return phone.trim();
}

function telHref(phone: string): string {
  const digits = phone.replace(/[^\d+]/g, "");
  return digits.startsWith("+") ? `tel:${digits}` : `tel:${digits}`;
}

function formatIngressLine(iso: string): string {
  const rel = formatTrackerRelativeIngress(iso);
  if (rel === "Heute" || rel === "Gestern") return `Eingereicht ${rel.toLowerCase()}`;
  if (rel.startsWith("Vor ")) return `Eingereicht ${rel.toLowerCase()}`;
  return `Eingereicht ${rel}`;
}

/** V16 — Anliegen zuerst, Stammdaten danach (klinische Triage). */
export function TrackerPatientHeader({
  patientName,
  birthDate,
  patientEmail,
  patientPhone,
  concern,
  createdAt,
  isDraft,
}: TrackerPatientHeaderProps) {
  const displayName = patientName?.trim() || "Unbekannter Patient";
  const age = formatPatientAgeYears(birthDate);
  const birthLabel = formatBirthDateDe(birthDate);
  const caseHeadline =
    concern?.trim() ||
    "Eingang ohne dokumentiertes Anliegen — bitte Bilder und Verlauf prüfen.";

  const ingressLabel = createdAt ? formatIngressLine(createdAt) : null;
  const phoneTrim = patientPhone?.trim();
  const emailTrim = patientEmail?.trim();
  const ageBirthLine = [age, birthLabel].filter(Boolean).join(" · ");
  const hasDemographics = Boolean(ageBirthLine || phoneTrim || emailTrim || isDraft);

  return (
    <header className="yd-tracker-v6-hero yd-tracker-v8-hero yd-tracker-v12-hero yd-tracker-v14-hero yd-tracker-v16-hero">
      <h1 className="yd-tracker-v16-hero__concern">{caseHeadline}</h1>
      {ingressLabel ? (
        <p className="yd-tracker-v16-hero__ingress">{ingressLabel}</p>
      ) : null}
      <p className="yd-tracker-v16-hero__patient">{displayName}</p>
      {hasDemographics ? (
        <div className="yd-tracker-v14-hero__demographics yd-tracker-v16-hero__demographics">
          {ageBirthLine ? (
            <p className="yd-tracker-v8-hero__meta-line yd-tracker-v14-hero__demographics-row">
              {ageBirthLine}
            </p>
          ) : null}
          {phoneTrim ? (
            <p className="yd-tracker-v8-hero__contact-line yd-tracker-v14-hero__demographics-row">
              <a
                className="yd-tracker-v8-hero__contact-link yd-tracker-v14-hero__link"
                href={telHref(phoneTrim)}
              >
                {formatPhoneDisplay(phoneTrim)}
              </a>
            </p>
          ) : null}
          {emailTrim ? (
            <p className="yd-tracker-v8-hero__contact-line yd-tracker-v14-hero__demographics-row">
              <a
                className="yd-tracker-v8-hero__contact-link yd-tracker-v14-hero__link"
                href={`mailto:${emailTrim}`}
              >
                {emailTrim}
              </a>
            </p>
          ) : null}
          {isDraft ? (
            <p className="yd-tracker-v14-hero__draft" aria-label="Fall ist Entwurf">
              Entwurf
            </p>
          ) : null}
        </div>
      ) : null}
    </header>
  );
}
