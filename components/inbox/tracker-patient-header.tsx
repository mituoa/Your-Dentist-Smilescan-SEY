import {
  formatPatientAgeYears,
  type TrackerStatusDisplay,
} from "@/lib/inbox/tracker-inbox-logic";
import { cn } from "@/lib/utils";

type TrackerPatientHeaderProps = {
  patientName: string | null;
  status: TrackerStatusDisplay;
  birthDate: string | null;
  createdAt: string;
  photoCount: number;
  concern: string | null;
  isDraft?: boolean;
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

/** V6 Hero — Patient, Meta-Zeile, Fallgrund als Seiten-Headline (ohne Karte). */
export function TrackerPatientHeader({
  patientName,
  status,
  birthDate,
  createdAt,
  photoCount,
  concern,
  isDraft,
}: TrackerPatientHeaderProps) {
  const displayName = patientName?.trim() || "Unbekannter Patient";
  const age = formatPatientAgeYears(birthDate);
  const caseHeadline =
    concern?.trim() ||
    "Eingang ohne dokumentiertes Anliegen — bitte Bilder und Verlauf prüfen.";

  const metaParts = [
    age,
    status.label,
    photoCountLabel(photoCount),
    `Eingang ${formatIntakeDate(createdAt)}`,
    isDraft ? "Entwurf" : null,
  ].filter(Boolean);

  return (
    <header className="yd-tracker-v6-hero">
      <div className="yd-tracker-v6-hero__patient">
        <h1 className="yd-tracker-v6-hero__name">{displayName}</h1>
        <p className="yd-tracker-v6-hero__meta">
          {metaParts.map((part, i) => (
            <span key={part}>
              {i > 0 ? <span className="yd-tracker-v6-hero__sep" aria-hidden> · </span> : null}
              {part}
            </span>
          ))}
        </p>
      </div>
      <p className={cn("yd-tracker-v6-hero__fallgrund")}>{caseHeadline}</p>
    </header>
  );
}
