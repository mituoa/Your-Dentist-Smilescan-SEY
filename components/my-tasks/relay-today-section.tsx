"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { HcCard } from "@/components/design/hc-card";
import type { RelayPriorityTask } from "@/lib/relay/build-relay-snapshot";
import { YD } from "@/lib/design/yd-design-tokens";

type RelayTodaySectionProps = {
  tasks: RelayPriorityTask[];
};

export function RelayTodaySection({ tasks }: RelayTodaySectionProps) {
  const countLabel =
    tasks.length === 0
      ? "Keine Prioritäten für heute"
      : tasks.length === 1
        ? "1 Priorität"
        : `${tasks.length} Prioritäten`;

  return (
    <section className="yd-relay-today min-w-0" aria-labelledby="yd-relay-today-title">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 id="yd-relay-today-title" className="yd-dash-section text-[1.0625rem] md:text-[1.125rem]">
            Heute wichtig
          </h2>
          <p className="mt-0.5 text-[13px] font-medium" style={{ color: YD.text.secondary }}>
            {countLabel}
          </p>
        </div>
      </div>

      {tasks.length === 0 ? (
        <HcCard tone="default" className="yd-dash-surface p-5">
          <p className="text-[14px] font-medium" style={{ color: YD.text.primary }}>
            Keine dringenden Aufgaben
          </p>
          <p className="mt-1 text-[13px]" style={{ color: YD.text.muted }}>
            Neue Prioritäten erscheinen hier zuerst.
          </p>
        </HcCard>
      ) : (
        <ul className="flex flex-col gap-3">
          {tasks.map((task) => (
            <li key={task.id}>
              <HcCard
                tone="default"
                className="yd-dash-surface yd-dash-interactive-card p-4 md:p-5"
              >
                <Link href={task.href} className="block no-underline">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <p
                        className="truncate text-[15px] font-semibold tracking-[-0.015em]"
                        style={{ color: YD.text.primary }}
                      >
                        {task.title}
                      </p>
                      {task.patientLabel ? (
                        <p className="mt-0.5 text-[13px]" style={{ color: YD.text.secondary }}>
                          Patient: {task.patientLabel}
                        </p>
                      ) : null}
                      <dl className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[12px] font-medium">
                        <div className="flex gap-1">
                          <dt style={{ color: YD.text.muted }}>Zuständig:</dt>
                          <dd style={{ color: YD.text.secondary }}>{task.assigneeLabel}</dd>
                        </div>
                        {task.dueLabel ? (
                          <div className="flex gap-1">
                            <dt style={{ color: YD.text.muted }}>Fällig:</dt>
                            <dd style={{ color: YD.text.secondary }}>{task.dueLabel}</dd>
                          </div>
                        ) : null}
                        <div className="flex gap-1">
                          <dt style={{ color: YD.text.muted }}>Status:</dt>
                          <dd style={{ color: YD.text.secondary }}>{task.statusLabel}</dd>
                        </div>
                      </dl>
                    </div>
                    <span
                      className="inline-flex shrink-0 items-center gap-1 text-[13px] font-semibold"
                      style={{ color: YD.accent.core }}
                    >
                      Öffnen
                      <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden />
                    </span>
                  </div>
                </Link>
              </HcCard>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
