import Link from "next/link";

import { HcCard } from "@/components/design/hc-card";
import { DashboardPanelChrome } from "@/components/dashboard/hc/dashboard-panel-chrome";
import { WORKSPACE_COPY } from "@/lib/dashboard/workspace-copy";
import type { ActivityEvent } from "@/lib/queries/dashboard";
import { YD } from "@/lib/design/yd-design-tokens";

function formatRelativeTime(timestamp: string): string {
  const diffMin = Math.floor((Date.now() - new Date(timestamp).getTime()) / 60000);
  if (diffMin < 1) return "jetzt";
  if (diffMin < 60) return `${diffMin} Min`;
  const h = Math.floor(diffMin / 60);
  if (h < 24) return `${h} Std`;
  const d = Math.floor(h / 24);
  return d === 1 ? "1 Tag" : `${d} T`;
}

const TYPE_LABEL: Record<ActivityEvent["type"], string> = {
  submission_received: "Eingang",
  task_created: "Aufgabe",
  task_done: "Erledigt",
};

type DashboardActivityStreamProps = {
  events: ActivityEvent[] | null;
};

export function DashboardActivityStream({ events }: DashboardActivityStreamProps) {
  return (
    <HcCard tone="default" className="yd-dash-panel flex min-h-0 flex-col p-0 md:min-h-[240px]">
      <DashboardPanelChrome title={WORKSPACE_COPY.activity.title} />
      <div className="flex flex-1 flex-col px-5 py-4 md:px-6">
        {events === null ? (
          <p className="yd-workspace-quiet">{WORKSPACE_COPY.loadGap}</p>
        ) : events.length === 0 ? (
          <p className="yd-workspace-quiet">{WORKSPACE_COPY.activity.empty}</p>
        ) : (
          <ul className="min-h-0 flex-1 space-y-2">
            {events.map((event) => {
              const row = (
                <>
                  <span
                    className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full"
                    style={{
                      background:
                        event.type === "submission_received"
                          ? YD.accent.core
                          : event.type === "task_done"
                            ? YD.status.done.dot
                            : YD.text.faint,
                    }}
                    aria-hidden
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] font-semibold uppercase tracking-wide text-[#8ba3b8]">
                      {TYPE_LABEL[event.type]}
                    </p>
                    <p className="text-[13px] font-medium leading-snug" style={{ color: YD.text.primary }}>
                      {event.text}
                    </p>
                    <p className="mt-0.5 text-[11px] tabular-nums" style={{ color: YD.text.faint }}>
                      {formatRelativeTime(event.timestamp)}
                    </p>
                  </div>
                </>
              );
              return (
                <li key={event.id} className="flex gap-2.5">
                  {event.link ? (
                    <Link
                      href={event.link}
                      className="flex w-full gap-2.5 rounded-xl px-1 py-0.5 transition-colors hover:bg-[rgba(248,252,255,0.85)]"
                    >
                      {row}
                    </Link>
                  ) : (
                    <div className="flex gap-2.5">{row}</div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </HcCard>
  );
}
