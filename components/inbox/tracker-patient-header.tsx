import { formatPatientAgeYears } from "@/lib/inbox/tracker-inbox-logic";
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

function formatPhoneCompact(phone: string): string {
  const t = phone.trim();
  return t.length > 18 ? `${t.slice(0, 16)}…` : t;
}

/** V10+ — Wer → Problem → Kontakt (3 Ebenen). */
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
  metaParts.push(age ?? "Alter —");
  metaParts.push(birthLabel ?? "Geburtsdatum —");
  metaParts.push(
    patientPhone?.trim()
      ? formatPhoneCompact(patientPhone)
      : "Telefon —"
  );
  metaParts.push(patientEmail?.trim() ?? "E-Mail —");
  if (isDraft) metaParts.push("Entwurf");

  return (
    <header className="yd-tracker-v6-hero yd-tracker-v8-hero yd-tracker-v10-hero yd-tracker-v11-hero">
      <h1 className="yd-tracker-v11-hero__name">{displayName}</h1>
      <p className={cn("yd-tracker-v11-hero__concern")}>{caseHeadline}</p>
      <p className="yd-tracker-v11-hero__meta" title={metaParts.join(" · ")}>
        {metaParts.map((part, i) => (
          <span key={`${part}-${i}`}>
            {i > 0 ? <span className="yd-tracker-v11-hero__sep" aria-hidden> · </span> : null}
            {part}
          </span>
        ))}
      </p>
    </header>
  );
}
