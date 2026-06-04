type TrackerBackboneNoticeProps = {
  available: boolean;
};

/** Ruhiger Hinweis, wenn Migration 038 fehlt — kein Fake-Versand. */
export function TrackerBackboneNotice({ available }: TrackerBackboneNoticeProps) {
  if (available) return null;

  return (
    <p
      className="rounded-[10px] border border-amber-200/90 bg-amber-50/95 px-4 py-3 text-[13px] leading-relaxed text-amber-950"
      role="alert"
    >
      Patientenversand ist auf dieser Umgebung noch nicht aktiv (Datenbank-Migration 038
      fehlt). Entwürfe können vorbereitet werden; E-Mails an Patient:innen sind erst nach
      Anwendung der Migration möglich.
    </p>
  );
}
