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
    <div className="space-y-3 text-sm">
      <div>
        <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-text-tertiary">
          Eingereicht
        </div>
        <div className="text-sm font-medium leading-6 text-text-primary">
          {formattedDate}
        </div>
      </div>
      {patientName && (
        <div>
          <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-text-tertiary">
            Name
          </div>
          <div className="text-sm font-medium leading-6 text-text-primary">
            {patientName}
          </div>
        </div>
      )}
      {patientEmail && (
        <div>
          <div className="text-[11px] font-medium uppercase tracking-[0.08em] text-text-tertiary">
            E-Mail
          </div>
          <div className="break-all text-sm leading-6 text-text-primary">
            {patientEmail}
          </div>
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
    </div>
  );
}
