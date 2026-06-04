import { cn } from "@/lib/utils";
import type { TrackerKiSignal } from "@/lib/inbox/build-tracker-decision";

type TrackerKiCenterProps = {
  signals: TrackerKiSignal[];
};

const STATUS_LABEL: Record<TrackerKiSignal["status"], string> = {
  done: "Abgeschlossen",
  active: "Ihr Schritt",
  recommended: "Empfohlen",
  pending: "Offen",
};

export function TrackerKiCenter({ signals }: TrackerKiCenterProps) {
  return (
    <section className="yd-tracker-ia-assist" aria-labelledby="tracker-ia-assist-title">
      <div className="yd-tracker-ia-assist__head">
        <h3 id="tracker-ia-assist-title" className="yd-tracker-ia-section-title">
          Praxis-Assistent
        </h3>
        <p className="yd-tracker-ia-assist__lead">
          Analyse → Vorbereitung → Freigabe → nächste Aktion
        </p>
      </div>

      <ol className="yd-tracker-ia-assist__workflow">
        {signals.map((signal, index) => (
          <li
            key={signal.id}
            className={cn(
              "yd-tracker-ia-assist__step",
              `yd-tracker-ia-assist__step--${signal.status}`
            )}
          >
            {index > 0 ? (
              <span className="yd-tracker-ia-assist__connector" aria-hidden />
            ) : null}
            <div className="yd-tracker-ia-assist__step-inner">
              <span className="yd-tracker-ia-assist__step-name">{signal.workflowStep}</span>
              <span className="yd-tracker-ia-assist__step-status">
                {STATUS_LABEL[signal.status]}
              </span>
              <p className="yd-tracker-ia-assist__step-label">{signal.label}</p>
              <p className="yd-tracker-ia-assist__step-detail">{signal.detail}</p>
            </div>
          </li>
        ))}
      </ol>

      <p className="yd-tracker-ia-assist__disclaimer">
        Unterstützt die Strukturierung — die klinische Entscheidung liegt bei Ihnen.
      </p>
    </section>
  );
}
