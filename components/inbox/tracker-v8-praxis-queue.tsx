import type { PraxisQueueSummary } from "@/lib/inbox/tracker-v7-presentational";
import { cn } from "@/lib/utils";

type TrackerV8PraxisQueueProps = {
  summary: PraxisQueueSummary;
};

type QueueMetric = {
  id: string;
  label: string;
  value: number;
  tone: "primary" | "new" | "follow" | "approval" | "task";
};

/**
 * Praxis-Queue — horizontale Premium-Leiste, keine KPI-Karten.
 */
export function TrackerV8PraxisQueue({ summary }: TrackerV8PraxisQueueProps) {
  const metrics: QueueMetric[] = [
    {
      id: "today",
      label: "Heute zu prüfen",
      value: summary.activeCases,
      tone: "primary",
    },
    {
      id: "new",
      label: "Neue Einsendungen",
      value: summary.newSubmissions,
      tone: "new",
    },
    {
      id: "follow",
      label: "Nachsorgen",
      value: summary.followUpControls,
      tone: "follow",
    },
    {
      id: "approval",
      label: "Freigaben",
      value: summary.approvalPending,
      tone: "approval",
    },
    {
      id: "tasks",
      label: "Offene Aufgaben",
      value: summary.openTasks,
      tone: "task",
    },
  ];

  return (
    <section className="yd-tracker-v8-queue" aria-labelledby="tracker-v8-queue-title">
      <div className="yd-tracker-v8-queue__intro">
        <p className="yd-tracker-v8-queue__eyebrow">Praxis-Queue</p>
        <h2 id="tracker-v8-queue-title" className="yd-tracker-v8-queue__title">
          Klinisches Kontrollzentrum
        </h2>
      </div>
      <div className="yd-tracker-v8-queue__rail" role="list">
        {metrics.map((metric) => (
          <div
            key={metric.id}
            role="listitem"
            className={cn(
              "yd-tracker-v8-queue__metric",
              `yd-tracker-v8-queue__metric--${metric.tone}`,
              metric.value === 0 && "yd-tracker-v8-queue__metric--idle"
            )}
          >
            <span className="yd-tracker-v8-queue__metric-value">{metric.value}</span>
            <span className="yd-tracker-v8-queue__metric-label">{metric.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
