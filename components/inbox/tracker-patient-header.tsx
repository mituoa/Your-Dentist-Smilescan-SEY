import { formatPatientAgeYears } from "@/lib/inbox/tracker-inbox-logic";

type TrackerPatientHeaderProps = {
  patientName: string | null;
  birthDate: string | null;
  patientEmail: string | null;
  patientPhone: string | null;
  concern: string | null;
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

/** V14 — Patient → Anliegen → Stammdaten (Premium Medical). */
export function TrackerPatientHeader({
  patientName,
  birthDate,
  patientEmail,
  patientPhone,
  concern,
  isDraft,
}: TrackerPatientHeaderProps) {
  const displayName = patientName?.trim() || "Unbekannter Patient";
  const age = formatPatientAgeYears(birthDate);
  const birthLabel = formatBirthDateDe(birthDate);
  const caseHeadline =
    concern?.trim() ||
    "Eingang ohne dokumentiertes Anliegen — bitte Bilder und Verlauf prüfen.";

  const ageBirthParts = [age, birthLabel].filter(Boolean);
  const phoneTrim = patientPhone?.trim();
  const emailTrim = patientEmail?.trim();

  return (
    <header className="yd-tracker-v6-hero yd-tracker-v8-hero yd-tracker-v12-hero yd-tracker-v14-hero">
      <h1 className="yd-tracker-v6-hero__name yd-tracker-v8-hero__name yd-tracker-v12-hero__name yd-tracker-v14-hero__name">
        {displayName}
      </h1>
      <p className="yd-tracker-v6-hero__fallgrund yd-tracker-v8-hero__fallgrund yd-tracker-v12-hero__concern yd-tracker-v14-hero__concern">
        {caseHeadline}
      </p>
      <div className="yd-tracker-v14-hero__demographics">
        {ageBirthParts.length > 0 ? (
          <p className="yd-tracker-v14-hero__demographics-row">{ageBirthParts.join(" · ")}</p>
        ) : null}
        {phoneTrim ? (
          <p className="yd-tracker-v14-hero__demographics-row">
            <a className="yd-tracker-v14-hero__link" href={telHref(phoneTrim)}>
              {formatPhoneDisplay(phoneTrim)}
            </a>
          </p>
        ) : null}
        {emailTrim ? (
          <p className="yd-tracker-v14-hero__demographics-row">
            <a className="yd-tracker-v14-hero__link" href={`mailto:${emailTrim}`}>
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
    </header>
  );
}
