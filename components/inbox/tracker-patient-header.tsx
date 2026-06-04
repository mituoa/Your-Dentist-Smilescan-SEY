import {
  formatPatientAgeYears,
} from "@/lib/inbox/tracker-inbox-logic";
import { cn } from "@/lib/utils";

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

/** V9 — Patient, Stammdaten, Anliegen als Headline (keine Doppelung). */
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

  const metaParts: string[] = [];
  if (age) metaParts.push(age);
  if (birthLabel) metaParts.push(birthLabel);
  const phone = patientPhone?.trim();
  const email = patientEmail?.trim();
  if (phone) metaParts.push(phone);
  if (email) metaParts.push(email);

  return (
    <header className="yd-tracker-v6-hero yd-tracker-v8-hero yd-tracker-v9-hero">
      <h1 className="yd-tracker-v6-hero__name yd-tracker-v8-hero__name yd-tracker-v9-hero__name">
        {displayName}
      </h1>
      {metaParts.length > 0 ? (
        <p className="yd-tracker-v9-hero__meta">
          {metaParts.map((part, i) => (
            <span key={`${part}-${i}`}>
              {i > 0 ? <span className="yd-tracker-v6-hero__sep" aria-hidden> · </span> : null}
              {part}
            </span>
          ))}
          {isDraft ? (
            <>
              <span className="yd-tracker-v6-hero__sep" aria-hidden> · </span>
              <span>Entwurf</span>
            </>
          ) : null}
        </p>
      ) : null}
      <p className={cn("yd-tracker-v6-hero__fallgrund", "yd-tracker-v8-hero__fallgrund", "yd-tracker-v9-hero__concern")}>
        {caseHeadline}
      </p>
    </header>
  );
}
