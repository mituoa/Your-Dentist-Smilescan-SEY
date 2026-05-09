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

  const lab = { color: "#94A3B8", fontSize: "12px", fontWeight: 500, letterSpacing: "0.02em" } as const;
  const val = { color: "#1E293B", fontSize: "15px", lineHeight: 1.55, fontWeight: 500 } as const;

  return (
    <div className="space-y-5">
      <div>
        <div style={lab}>Status</div>
        <div className="mt-1" style={val}>
          {statusLine}
        </div>
      </div>

      <div>
        <div style={lab}>Eingereicht</div>
        <div className="mt-1" style={val}>
          {formattedCreated}
        </div>
      </div>

      {updatedAt && updatedAt !== createdAt ? (
        <div>
          <div style={lab}>Zuletzt aktualisiert</div>
          <div className="mt-1" style={val}>
            {formatDeDate(updatedAt)}
          </div>
        </div>
      ) : null}

      {typeof photoCount === "number" ? (
        <div>
          <div style={lab}>Fotos</div>
          <div className="mt-1" style={val}>
            {photoCount}
          </div>
        </div>
      ) : null}

      {urg ? (
        <div>
          <div style={lab}>Dringlichkeit</div>
          <div className="mt-1" style={val}>
            {urg}
          </div>
        </div>
      ) : null}

      {patientName && (
        <div>
          <div style={lab}>Name</div>
          <div className="mt-1" style={val}>
            {patientName}
          </div>
        </div>
      )}
      {patientEmail && (
        <div>
          <div style={lab}>E-Mail</div>
          <div className="mt-1 break-all" style={val}>
            {patientEmail}
          </div>
        </div>
      )}
      {patientPhone && (
        <div>
          <div style={lab}>Telefon</div>
          <div className="mt-1" style={{ ...val, fontWeight: 400 }}>
            {patientPhone}
          </div>
        </div>
      )}
      {birthDisplay ? (
        <div>
          <div style={lab}>Geburtsdatum</div>
          <div className="mt-1" style={{ ...val, fontWeight: 400 }}>
            {birthDisplay}
          </div>
        </div>
      ) : null}
      {patientExternalId?.trim() ? (
        <div>
          <div style={lab}>Patienten-ID</div>
          <div className="mt-1 break-all" style={{ ...val, fontWeight: 400 }}>
            {patientExternalId.trim()}
          </div>
        </div>
      ) : null}
    </div>
  );
}
