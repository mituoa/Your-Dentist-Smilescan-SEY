import {
  formatPatientAgeYears,
  type TrackerStatusDisplay,
} from "@/lib/inbox/tracker-inbox-logic";
import { cn } from "@/lib/utils";

type TrackerPatientHeaderProps = {
  patientName: string | null;
  status: TrackerStatusDisplay;
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

/** V8 — Patient, Stammdaten kompakt, Fallgrund als Headline. */
export function TrackerPatientHeader({
  patientName,
  status,
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

  const lineOneParts = [
    age,
    birthLabel,
    status.label,
    isDraft ? "Entwurf" : null,
  ].filter(Boolean);

  const contactParts: { type: "email" | "phone"; value: string; href: string }[] = [];
  const email = patientEmail?.trim();
  const phone = patientPhone?.trim();
  if (email) contactParts.push({ type: "email", value: email, href: `mailto:${email}` });
  if (phone) contactParts.push({ type: "phone", value: phone, href: `tel:${phone.replace(/\s/g, "")}` });

  return (
    <header className="yd-tracker-v6-hero yd-tracker-v8-hero">
      <div className="yd-tracker-v8-hero__patient">
        <h1 className="yd-tracker-v6-hero__name yd-tracker-v8-hero__name">{displayName}</h1>
        {lineOneParts.length > 0 ? (
          <p className="yd-tracker-v8-hero__meta-line">
            {lineOneParts.map((part, i) => (
              <span key={part}>
                {i > 0 ? <span className="yd-tracker-v6-hero__sep" aria-hidden> · </span> : null}
                {part}
              </span>
            ))}
          </p>
        ) : null}
        {contactParts.length > 0 ? (
          <p className="yd-tracker-v8-hero__contact-line">
            {contactParts.map((c, i) => (
              <span key={c.href}>
                {i > 0 ? <span className="yd-tracker-v6-hero__sep" aria-hidden> · </span> : null}
                <a href={c.href} className="yd-tracker-v8-hero__contact-link">
                  {c.value}
                </a>
              </span>
            ))}
          </p>
        ) : null}
      </div>
      <p className={cn("yd-tracker-v6-hero__fallgrund", "yd-tracker-v8-hero__fallgrund")}>
        {caseHeadline}
      </p>
    </header>
  );
}
