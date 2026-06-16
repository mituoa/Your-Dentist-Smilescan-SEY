import type { ActivityEvent } from "@/lib/queries/dashboard";

type Props = {
  events: ActivityEvent[] | null;
};

const TYPE_LABEL: Record<ActivityEvent["type"], string> = {
  submission_received: "Patientenrückmeldung",
  task_created: "Teamvorgang",
  task_done: "Erledigt",
};

function formatWhen(timestamp: string): string {
  const then = new Date(timestamp);
  const now = new Date();
  const diffHours = Math.floor((now.getTime() - then.getTime()) / (1000 * 60 * 60));
  if (diffHours < 1) return "Gerade";
  if (diffHours < 24) {
    return `Heute ${then.toLocaleTimeString("de-DE", { hour: "2-digit", minute: "2-digit" })}`;
  }
  if (diffHours < 48) return "Gestern";
  return then.toLocaleDateString("de-DE", { day: "numeric", month: "short" });
}

/** Chronologischer Verlauf — keine Charts, keine KPIs */
export function DashboardPracticeActivity({ events }: Props) {
  return (
    <section className="yd-dash-bento-activity" aria-label="Praxisaktivität">
      <header className="yd-dash-bento-activity__head">
        <h2 className="yd-dash-bento-activity__title">Praxisaktivität</h2>
        <p className="yd-dash-bento-activity__lead">
          Freigaben, Rückmeldungen, Teamvorgänge und Routinen im Verlauf.
        </p>
      </header>

      {events === null ? (
        <p className="yd-dash-bento-activity__empty">Verlauf momentan nicht verfügbar.</p>
      ) : events.length === 0 ? (
        <p className="yd-dash-bento-activity__empty">Noch keine Aktivität heute.</p>
      ) : (
        <ol className="yd-dash-bento-activity__list">
          {events.map((event) => (
            <li
              key={`${event.type}-${event.id}-${event.timestamp}`}
              className="yd-dash-bento-activity__item"
            >
              <span className="yd-dash-bento-activity__dot" aria-hidden />
              <div className="yd-dash-bento-activity__body">
                <p className="yd-dash-bento-activity__kind">{TYPE_LABEL[event.type]}</p>
                <p className="yd-dash-bento-activity__text">{event.text}</p>
              </div>
              <p className="yd-dash-bento-activity__when">{formatWhen(event.timestamp)}</p>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
