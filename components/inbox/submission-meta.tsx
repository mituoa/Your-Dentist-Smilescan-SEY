interface SubmissionMetaProps {
  patientName: string | null;
  patientEmail: string | null;
  patientPhone: string | null;
  createdAt: string;
  patientBirthDate?: string | null;
  patientExternalId?: string | null;
  urgency?: string | null;
  isDraft?: boolean;
  seenAt?: string | null;
  updatedAt?: string | null;
  photoCount?: number;
}

function formatDeDate(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function urgencyLabel(u: string | null | undefined): string | null {
  switch (u) {
    case "today":
      return "Heute / dringend";
    case "this_week":
      return "Diese Woche";
    case "not_urgent":
      return "Nicht dringend";
    default:
      return u ? u : null;
  }
}

export function SubmissionMeta({
  patientName,
  patientEmail,
  patientPhone,
  createdAt,
  patientBirthDate,
  patientExternalId,
  urgency,
  isDraft,
  seenAt,
  updatedAt,
  photoCount,
}: SubmissionMetaProps) {
  const formattedCreated = formatDeDate(createdAt);
  const birth =
    patientBirthDate && patientBirthDate.includes("T")
      ? patientBirthDate.split("T")[0]
      : patientBirthDate;
  let birthDisplay: string | null = null;
  if (birth) {
    const d = new Date(`${birth}T12:00:00Z`);
    if (!Number.isNaN(d.getTime())) {
      birthDisplay = d.toLocaleDateString("de-DE", {
        day: "numeric",
        month: "numeric",
        year: "numeric",
      });
    }
  }
  const urg = urgencyLabel(urgency ?? null);
  const statusLine = isDraft
    ? "Entwurf"
    : !seenAt
      ? "Neu / noch nicht geöffnet"
      : "Geöffnet";

  return (
    <div className="space-y-3 text-sm">
      <div>
        <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-text-tertiary">
          Status
        </div>
        <div className="text-sm font-medium leading-6 text-text-primary">{statusLine}</div>
      </div>

      <div>
        <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-text-tertiary">
          Eingereicht
        </div>
        <div className="text-sm font-medium leading-6 text-text-primary">{formattedCreated}</div>
      </div>

      {updatedAt && updatedAt !== createdAt ? (
        <div>
          <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-text-tertiary">
            Zuletzt aktualisiert
          </div>
          <div className="text-sm font-medium leading-6 text-text-primary">
            {formatDeDate(updatedAt)}
          </div>
        </div>
      ) : null}

      {typeof photoCount === "number" ? (
        <div>
          <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-text-tertiary">
            Fotos
          </div>
          <div className="text-sm font-medium leading-6 text-text-primary">{photoCount}</div>
        </div>
      ) : null}

      {urg ? (
        <div>
          <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-text-tertiary">
            Dringlichkeit (Einschätzung)
          </div>
          <div className="text-sm font-medium leading-6 text-text-primary">{urg}</div>
        </div>
      ) : null}

      {patientName && (
        <div>
          <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-text-tertiary">
            Name
          </div>
          <div className="text-sm font-medium leading-6 text-text-primary">{patientName}</div>
        </div>
      )}
      {patientEmail && (
        <div>
          <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-text-tertiary">
            E-Mail
          </div>
          <div className="break-all text-sm leading-6 text-text-primary">{patientEmail}</div>
        </div>
      )}
      {patientPhone && (
        <div>
          <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-text-tertiary">
            Telefon
          </div>
          <div className="text-sm leading-6 text-text-primary">{patientPhone}</div>
        </div>
      )}
      {birthDisplay ? (
        <div>
          <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-text-tertiary">
            Geburtsdatum
          </div>
          <div className="text-sm leading-6 text-text-primary">{birthDisplay}</div>
        </div>
      ) : null}
      {patientExternalId?.trim() ? (
        <div>
          <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-text-tertiary">
            Patienten-ID
          </div>
          <div className="break-all text-sm leading-6 text-text-primary">{patientExternalId.trim()}</div>
        </div>
      ) : null}
    </div>
  );
}
