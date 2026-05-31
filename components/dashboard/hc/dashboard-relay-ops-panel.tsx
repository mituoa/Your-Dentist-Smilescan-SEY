import Link from "next/link";
import { ClipboardList, Repeat, UserRound } from "lucide-react";

import { HcCard } from "@/components/design/hc-card";
import { DashboardPanelChrome } from "@/components/dashboard/hc/dashboard-panel-chrome";
import { RECURRENCE_LABELS } from "@/lib/tasks/recurrence";
import type { DashboardRoutineRow, OpenTaskRow } from "@/lib/queries/dashboard";
import { YD } from "@/lib/design/yd-design-tokens";

function taskLabel(task: OpenTaskRow): string {
  const t = task.title?.trim() || task.content?.trim() || "Aufgabe";
  return t.length > 72 ? `${t.slice(0, 71)}…` : t;
}

function formatDue(iso: string | null | undefined): string | null {
  if (!iso) return null;
  return new Date(iso).toLocaleDateString("de-DE", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type DashboardRelayOpsPanelProps = {
  tasks: OpenTaskRow[] | null;
  routines: DashboardRoutineRow[] | null;
};

export function DashboardRelayOpsPanel({ tasks, routines }: DashboardRelayOpsPanelProps) {
  const visibleTasks = tasks?.slice(0, 6) ?? null;
  const visibleRoutines = routines?.slice(0, 4) ?? null;
  const handoffs =
    tasks?.filter((t) => t.recipient_type === "specific_person").slice(0, 3) ?? [];

  return (
    <HcCard tone="primary" className="yd-dash-panel yd-dash-panel--primary flex min-h-[320px] flex-col p-0">
      <DashboardPanelChrome
        title="Relay · Aufgaben &amp; Routinen"
        hint="Offene Schritte, Übergaben, wiederkehrende Abläufe"
        action={
          <Link
            href="/my-tasks"
            className="shrink-0 text-[12px] font-medium no-underline"
            style={{ color: YD.accent.core }}
          >
            Alle
          </Link>
        }
      />

      <div className="flex flex-col gap-0 divide-y" style={{ borderColor: "rgba(180,198,218,0.22)" }}>
        <section className="px-5 py-4 md:px-6">
          <p className="yd-dash-meta mb-2.5 flex items-center gap-1.5 normal-case tracking-normal">
            <ClipboardList className="h-3.5 w-3.5" strokeWidth={1.65} style={{ color: YD.text.faint }} />
            Offene Aufgaben
          </p>
          {visibleTasks === null ? (
            <p className="text-[13px]" style={{ color: YD.text.secondary }}>
              Momentan nicht verfügbar.
            </p>
          ) : visibleTasks.length === 0 ? (
            <p className="text-[13px]" style={{ color: YD.text.secondary }}>
              Keine offenen Aufgaben — guter Stand im Team.
            </p>
          ) : (
            <ul className="space-y-2">
              {visibleTasks.map((task) => (
                <li key={task.id}>
                  <Link
                    href={`/my-tasks/${task.id}`}
                    className="group block rounded-xl px-2 py-2 transition-colors hover:bg-[rgba(248,252,255,0.9)]"
                  >
                    <p className="text-[13px] font-medium leading-snug" style={{ color: YD.text.primary }}>
                      {taskLabel(task)}
                    </p>
                    <p className="mt-0.5 flex flex-wrap gap-x-2 text-[11px]" style={{ color: YD.text.faint }}>
                      {task.priority === "important" ? (
                        <span style={{ color: YD.status.urgent.text }}>Priorität</span>
                      ) : null}
                      {task.due_date ? <span>Fällig {formatDue(task.due_date)}</span> : null}
                      {task.recurrence_type && task.recurrence_type !== "once" ? (
                        <span>Routine</span>
                      ) : null}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {handoffs.length > 0 ? (
          <section className="px-5 py-4 md:px-6">
            <p className="yd-dash-meta mb-2.5 flex items-center gap-1.5 normal-case tracking-normal">
              <UserRound className="h-3.5 w-3.5" strokeWidth={1.65} />
              Übergaben
            </p>
            <ul className="space-y-2">
              {handoffs.map((task) => (
                <li key={`ho-${task.id}`}>
                  <Link
                    href={`/my-tasks/${task.id}`}
                    className="block rounded-xl px-2 py-1.5 text-[12px] leading-snug hover:bg-[rgba(248,252,255,0.9)]"
                    style={{ color: YD.text.secondary }}
                  >
                    {taskLabel(task)}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="px-5 py-4 md:px-6">
          <p className="yd-dash-meta mb-2.5 flex items-center gap-1.5 normal-case tracking-normal">
            <Repeat className="h-3.5 w-3.5" strokeWidth={1.65} />
            Wiederkehrende Routinen
          </p>
          {visibleRoutines === null ? (
            <p className="text-[13px]" style={{ color: YD.text.secondary }}>
              Routinen nicht geladen.
            </p>
          ) : visibleRoutines.length === 0 ? (
            <p className="text-[13px]" style={{ color: YD.text.secondary }}>
              Noch keine aktiven Routinen — in Relay anlegbar.
            </p>
          ) : (
            <ul className="space-y-2">
              {visibleRoutines.map((r) => (
                <li key={r.id}>
                  <Link
                    href={`/my-tasks/${r.id}`}
                    className="block rounded-xl px-2 py-2 hover:bg-[rgba(248,252,255,0.9)]"
                  >
                    <p className="text-[13px] font-medium" style={{ color: YD.text.primary }}>
                      {r.title}
                    </p>
                    <p className="mt-0.5 text-[11px]" style={{ color: YD.text.faint }}>
                      {RECURRENCE_LABELS[r.recurrence_type as keyof typeof RECURRENCE_LABELS] ??
                        r.recurrence_type}
                      {r.remind_at ? ` · Erinnerung ${formatDue(r.remind_at)}` : null}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </HcCard>
  );
}
