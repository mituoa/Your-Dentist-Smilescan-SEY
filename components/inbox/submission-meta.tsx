import {
  getIntakeChannelLabel,
  type IntakeChannel,
} from "@/lib/submissions/intake-channel";

/**
 * Kompakte Fallmetadaten (Hilfsspalte). **Punkt 7 — Empty:** „Einordnung (Zeitraum)“ immer sichtbar
 * mit **„Noch nicht gewählt“** wenn null; Kontakt **„Nicht hinterlegt“** wenn weder E-Mail noch Telefon.
 */
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
  intakeChannel?: IntakeChannel;
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
      return "Heute";
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
  intakeChannel = "unknown",
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
  const val = { color: "#1E293B", fontSize: "14px", lineHeight: 1.5, fontWeight: 500 } as const;

  return (
    <div className="space-y-4">
      <div>
        <div style={lab}>Status</div>
        <div className="mt-1" style={val}>
          {statusLine}
        </div>
      </div>

      <div>
        <div style={lab}>Eingang</div>
        <div className="mt-1" style={{ ...val, fontWeight: 400 }}>
          {getIntakeChannelLabel(intakeChannel)}
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

      <div>
        <div style={lab}>Einordnung (Zeitraum)</div>
        <div
          className="mt-1"
          style={{
            ...val,
            fontWeight: urg ? 500 : 400,
            color: urg ? val.color : "#64748B",
          }}
        >
          {urg ?? "Noch nicht gewählt"}
        </div>
      </div>

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
      {!patientEmail && !patientPhone ? (
        <div>
          <div style={lab}>Kontakt</div>
          <div className="mt-1" style={{ ...val, fontWeight: 400, color: "#64748B" }}>
            Nicht hinterlegt
          </div>
        </div>
      ) : null}
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
