type TrackerConcernPanelProps = {
  concern: string | null;
  fullNotes: string | null;
};

export function TrackerConcernPanel({ concern, fullNotes }: TrackerConcernPanelProps) {
  const text = fullNotes?.trim() || concern?.trim();
  if (!text) return null;

  return (
    <section className="yd-tracker-concern" aria-labelledby="tracker-concern-title">
      <h2 id="tracker-concern-title" className="yd-tracker-concern__title">
        Patientenanliegen
      </h2>
      <p className="yd-tracker-concern__text">{text}</p>
    </section>
  );
}
