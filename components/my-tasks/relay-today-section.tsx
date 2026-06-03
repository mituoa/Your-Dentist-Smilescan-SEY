"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { RelayPriorityTask } from "@/lib/relay/build-relay-snapshot";
import { YD } from "@/lib/design/yd-design-tokens";

type RelayTodaySectionProps = {
  tasks: RelayPriorityTask[];
};

export function RelayTodaySection({ tasks }: RelayTodaySectionProps) {
  if (tasks.length === 0) {
    return (
      <p className="text-[14px] font-medium" style={{ color: YD.text.primary }}>
        Keine dringenden Aufgaben
      </p>
    );
  }

  return (
    <ul className="yd-relay-v4-priority-list">
      {tasks.map((task) => (
        <li key={task.id}>
          <Link href={task.href} className="yd-relay-v4-priority-card block no-underline">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
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
                <dl className="yd-relay-v4-priority-card__meta">
                  <div>
                    <dt>Zuständig</dt>
                    <dd>{task.assigneeLabel}</dd>
                  </div>
                  {task.dueLabel ? (
                    <div>
                      <dt>Fällig</dt>
                      <dd>{task.dueLabel}</dd>
                    </div>
                  ) : null}
                  <div>
                    <dt>Status</dt>
                    <dd>{task.statusLabel}</dd>
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
        </li>
      ))}
    </ul>
  );
}
