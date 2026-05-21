import Link from "next/link";

import { HcCard } from "@/components/design/hc-card";
import type { ActivityEvent } from "@/lib/queries/dashboard";
import { YD } from "@/lib/design/yd-design-tokens";

function formatRelativeTime(timestamp: string): string {
  const diffMin = Math.floor((Date.now() - new Date(timestamp).getTime()) / 60000);
  if (diffMin < 1) return "gerade eben";
  if (diffMin < 60) return `vor ${diffMin} Min`;
  const h = Math.floor(diffMin / 60);
  if (h < 24) return `vor ${h} Std`;
  const d = Math.floor(h / 24);
  return d === 1 ? "gestern" : `vor ${d} Tagen`;
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
    <HcCard tone="default" className="flex min-h-[280px] flex-col p-5 md:p-6">
      <div className="mb-4">
        <p className="yd-dash-section">Letzte Aktivität</p>
        <p className="yd-dash-meta mt-1 normal-case tracking-normal">
          Strukturierter Praxisfluss — Eingang, Aufgaben, Abschlüsse
        </p>
      </div>
      {events === null ? (
        <p className="text-[13px]" style={{ color: YD.text.secondary }}>
          Aktivität momentan nicht verfügbar.
        </p>
      ) : events.length === 0 ? (
        <p className="text-[13px]" style={{ color: YD.text.secondary }}>
          Noch keine Einträge in diesem Ausschnitt.
        </p>
      ) : (
        <ul className="min-h-0 flex-1 space-y-3">
          {events.map((event) => {
            const row = (
              <>
                <span
                  className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
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
                  <p className="text-[11px] font-medium uppercase tracking-wide" style={{ color: YD.text.faint }}>
                    {TYPE_LABEL[event.type]}
                  </p>
                  <p className="text-[13px] font-medium leading-snug" style={{ color: YD.text.primary }}>
                    {event.text}
                  </p>
                  <p className="mt-0.5 text-[11px]" style={{ color: YD.text.faint }}>
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
    </HcCard>
  );
}
