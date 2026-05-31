import Link from "next/link";
import { Repeat, UserRound } from "lucide-react";

import { HcCard } from "@/components/design/hc-card";
import { DashboardPanelChrome } from "@/components/dashboard/hc/dashboard-panel-chrome";
import { WORKSPACE_COPY } from "@/lib/dashboard/workspace-copy";
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
    <HcCard tone="primary" className="yd-dash-panel yd-dash-panel--primary flex min-h-0 flex-col p-0 md:min-h-[280px]">
      <DashboardPanelChrome
        title={WORKSPACE_COPY.tasks.title}
        action={
          <Link
            href="/my-tasks"
            className="shrink-0 text-[12px] font-semibold no-underline"
            style={{ color: YD.accent.core }}
          >
            {WORKSPACE_COPY.command.open}
          </Link>
        }
      />

      <div className="flex flex-col gap-0 divide-y" style={{ borderColor: "rgba(180,198,218,0.22)" }}>
        <section className="px-5 py-4 md:px-6">
          {visibleTasks === null ? (
            <p className="yd-workspace-quiet">{WORKSPACE_COPY.loadGap}</p>
          ) : visibleTasks.length === 0 ? (
            <p className="yd-workspace-quiet">{WORKSPACE_COPY.tasks.empty}</p>
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
                    {task.due_date ? (
                      <p className="mt-0.5 text-[11px] tabular-nums" style={{ color: YD.text.faint }}>
                        {formatDue(task.due_date)}
                      </p>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {handoffs.length > 0 ? (
          <section className="px-5 py-4 md:px-6">
            <p className="yd-workspace-section-label mb-2 flex items-center gap-1.5">
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
          <p className="yd-workspace-section-label mb-2 flex items-center gap-1.5">
            <Repeat className="h-3.5 w-3.5" strokeWidth={1.65} />
            Routinen
          </p>
          {visibleRoutines === null ? (
            <p className="yd-workspace-quiet">{WORKSPACE_COPY.loadGap}</p>
          ) : visibleRoutines.length === 0 ? (
            <p className="yd-workspace-quiet">{WORKSPACE_COPY.tasks.routinesEmpty}</p>
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
