"use client";

import Link from "next/link";

import type {
  RelayPriorityTask,
  RelayStatusTone,
  RelayTodayStats,
} from "@/lib/relay/build-relay-snapshot";
import { cn } from "@/lib/utils";

type RelayTodaySectionProps = {
  stats: RelayTodayStats;
  tasks: RelayPriorityTask[];
  embedded?: boolean;
};

const STATUS_TONE_CLASS: Record<RelayStatusTone, string> = {
  new: "yd-relay-status--new",
  critical: "yd-relay-status--critical",
  overdue: "yd-relay-status--overdue",
  pending: "yd-relay-status--pending",
  open: "yd-relay-status--open",
  done: "yd-relay-status--done",
};

export function RelayTodaySection({ stats, tasks, embedded = false }: RelayTodaySectionProps) {
  const summaryParts = [
    stats.openTasks === 1 ? "1 offene Aufgabe" : `${stats.openTasks} offene Aufgaben`,
    stats.pendingReview > 0
      ? stats.pendingReview === 1
        ? "1 Freigabe offen"
        : `${stats.pendingReview} Freigaben offen`
      : null,
    stats.unreadHandoffs > 0
      ? stats.unreadHandoffs === 1
        ? "1 Übergabe ungelesen"
        : `${stats.unreadHandoffs} Übergaben ungelesen`
      : null,
  ].filter(Boolean);

  return (
    <section
      className={cn("yd-relay-today", embedded && "yd-relay-today--embedded")}
      aria-labelledby={embedded ? undefined : "yd-relay-today-title"}
    >
      {!embedded ? (
        <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 id="yd-relay-today-title" className="yd-relay-section-title">
              Heute wichtig
            </h2>
            <p className="yd-relay-today__summary">
              {summaryParts.join(" · ") || "Alles im Blick — keine dringenden Prioritäten"}
            </p>
          </div>
        </div>
      ) : (
        <p className="yd-relay-today__summary yd-relay-today__summary--inline">
          {summaryParts.join(" · ") || "Alles im Blick — keine dringenden Prioritäten"}
        </p>
      )}

      {tasks.length === 0 ? (
        <div className="yd-relay-empty-state yd-relay-empty-state--compact">
          <p className="yd-relay-empty-state__title">Keine dringenden Aufgaben</p>
          <p className="yd-relay-empty-state__text">
            Die Praxis ist auf dem aktuellen Stand. Neue Prioritäten erscheinen hier zuerst.
          </p>
        </div>
      ) : (
        <ul className="yd-relay-priority-list">
          {tasks.map((task) => (
            <li key={task.id}>
              <Link href={task.href} className="yd-relay-priority-row">
                <span
                  className={cn(
                    "yd-relay-status yd-relay-status--inline",
                    STATUS_TONE_CLASS[task.statusTone]
                  )}
                >
                  <span className="yd-relay-status__dot" aria-hidden />
                </span>
                <span className="yd-relay-priority-row__main">
                  <span className="yd-relay-priority-row__title">{task.title}</span>
                  <span className="yd-relay-priority-row__meta">
                    {task.patientLabel ? `${task.patientLabel} · ` : ""}
                    {task.assigneeLabel}
                    {task.dueLabel ? ` · ${task.dueLabel}` : ""}
                  </span>
                </span>
                <span className="yd-relay-status__label yd-relay-priority-row__status">
                  {task.statusLabel}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
