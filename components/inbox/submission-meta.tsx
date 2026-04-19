interface SubmissionMetaProps {
  patientName: string | null;
  patientEmail: string | null;
  patientPhone: string | null;
  createdAt: string;
}

export function SubmissionMeta({
  patientName,
  patientEmail,
  patientPhone,
  createdAt,
}: SubmissionMetaProps) {
  const formattedDate = new Date(createdAt).toLocaleDateString("de-DE", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="space-y-2 text-sm">
      <div>
        <div className="text-xs text-text-tertiary">Eingereicht</div>
        <div className="text-text-primary">{formattedDate}</div>
      </div>
      {patientName && (
        <div>
          <div className="text-xs text-text-tertiary">Name</div>
          <div className="text-text-primary">{patientName}</div>
        </div>
      )}
      {patientEmail && (
        <div>
          <div className="text-xs text-text-tertiary">E-Mail</div>
          <div className="text-text-primary break-all">{patientEmail}</div>
        </div>
      )}
      {patientPhone && (
        <div>
          <div className="text-xs text-text-tertiary">Telefon</div>
          <div className="text-text-primary">{patientPhone}</div>
        </div>
      )}
    </div>
  );
}
