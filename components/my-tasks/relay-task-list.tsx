"use client";

import Link from "next/link";

import type { RelayTaskListItem } from "@/lib/relay/build-relay-snapshot";
import { YD } from "@/lib/design/yd-design-tokens";
import { cn } from "@/lib/utils";

type RelayTaskListProps = {
  items: RelayTaskListItem[];
};

export function RelayTaskList({ items }: RelayTaskListProps) {
  if (items.length === 0) {
    return (
      <p className="text-[14px] font-medium" style={{ color: YD.text.primary }}>
        Keine Aufgaben in dieser Ansicht
      </p>
    );
  }

  return (
    <ul className="yd-relay-v4-task-list">
      {items.map((item) => (
        <li key={item.id}>
          <Link
            href={item.href}
            className={cn("yd-relay-v4-task-row block no-underline", item.isDone && "yd-relay-v4-task-row--done")}
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <p
                className="min-w-0 text-[14px] font-semibold tracking-[-0.015em]"
                style={{ color: YD.text.primary }}
              >
                {item.title}
              </p>
              <span className="yd-relay-meta-pill shrink-0">{item.statusLabel}</span>
            </div>

            <dl className="yd-relay-v4-task-row__meta">
              {item.patientLabel ? (
                <div className="sm:col-span-2">
                  <dt>Patient</dt>
                  <dd>{item.patientLabel}</dd>
                </div>
              ) : null}
              <div>
                <dt>Zuständig</dt>
                <dd>{item.assigneeLabel}</dd>
              </div>
              {item.dueLabel ? (
                <div>
                  <dt>Fällig</dt>
                  <dd>{item.dueLabel}</dd>
                </div>
              ) : null}
            </dl>

            {item.completionLine ? (
              <p className="yd-relay-v4-task-row__done">{item.completionLine}</p>
            ) : null}
          </Link>
        </li>
      ))}
    </ul>
  );
}
