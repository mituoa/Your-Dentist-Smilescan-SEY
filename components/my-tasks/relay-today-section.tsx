"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type {
  RelayPriorityTask,
  RelayTodayStats,
} from "@/lib/relay/build-relay-snapshot";
import { YD } from "@/lib/design/yd-design-tokens";

type RelayTodaySectionProps = {
  stats: RelayTodayStats;
  tasks: RelayPriorityTask[];
};

export function RelayTodaySection({ stats, tasks }: RelayTodaySectionProps) {
  const summaryParts = [
    stats.openTasks === 1 ? "1 offene Aufgabe" : `${stats.openTasks} offene Aufgaben`,
    stats.pendingReview > 0
      ? stats.pendingReview === 1
        ? "1 Freigabe ausstehend"
        : `${stats.pendingReview} Freigaben ausstehend`
      : null,
    stats.unreadHandoffs > 0
      ? stats.unreadHandoffs === 1
        ? "1 Übergabe ungelesen"
        : `${stats.unreadHandoffs} Übergaben ungelesen`
      : null,
  ].filter(Boolean);

  return (
    <section className="yd-relay-today" aria-labelledby="yd-relay-today-title">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 id="yd-relay-today-title" className="yd-relay-section-title">
            Heute wichtig
          </h2>
          <p className="mt-0.5 text-[13px] font-medium" style={{ color: YD.text.secondary }}>
            {summaryParts.join(" · ") || "Alles erledigt für heute"}
          </p>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="yd-relay-surface-card px-5 py-6">
          <p className="text-[14px] font-medium" style={{ color: YD.text.primary }}>
            Keine dringenden Aufgaben
          </p>
          <p className="mt-1 text-[13px]" style={{ color: YD.text.muted }}>
            Neue Prioritäten erscheinen hier zuerst.
          </p>
        </div>
      ) : (
        <ul className="flex flex-col gap-2.5">
          {tasks.map((task) => (
            <li key={task.id}>
              <Link href={task.href} className="yd-relay-surface-card yd-relay-priority-row block p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="truncate text-[15px] font-semibold tracking-[-0.015em] text-[#0F172A]">
                      {task.title}
                    </p>
                    {task.patientLabel ? (
                      <p className="mt-0.5 text-[13px]" style={{ color: YD.text.secondary }}>
                        {task.patientLabel}
                      </p>
                    ) : null}
                    <p className="mt-1.5 text-[12px] font-medium" style={{ color: YD.text.muted }}>
                      Zuständig: {task.assigneeLabel}
                      {task.dueLabel ? ` · ${task.dueLabel}` : ""}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-3">
                    <span className="yd-relay-meta-pill">{task.statusLabel}</span>
                    <span
                      className="inline-flex items-center gap-1 text-[13px] font-semibold"
                      style={{ color: YD.accent.core }}
                    >
                      Öffnen
                      <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden />
                    </span>
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
