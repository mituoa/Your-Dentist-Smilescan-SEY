"use client";

import Link from "next/link";

import { HcCard } from "@/components/design/hc-card";
import type { RelayTaskListItem } from "@/lib/relay/build-relay-snapshot";
import { YD } from "@/lib/design/yd-design-tokens";
import { cn } from "@/lib/utils";

type RelayTaskListProps = {
  items: RelayTaskListItem[];
  scope: "all" | "mine";
  onScopeChange: (scope: "all" | "mine") => void;
};

export function RelayTaskList({ items, scope, onScopeChange }: RelayTaskListProps) {
  const active = items.filter((i) => !i.isDone);
  const done = items.filter((i) => i.isDone);

  const tabBtn = (activeTab: boolean) =>
    cn(
      "rounded-lg px-3 py-1.5 text-[12px] font-medium transition-all",
      activeTab
        ? "bg-white text-[#0F172A] shadow-[0_1px_2px_rgba(43,111,232,0.1)] ring-1 ring-[rgba(43,111,232,0.12)]"
        : "text-[#64748B] hover:text-[#334155]"
    );

  return (
    <section className="yd-relay-task-list" aria-labelledby="yd-relay-tasks-title">
      <div className="mb-3 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 id="yd-relay-tasks-title" className="yd-dash-section text-[1.0625rem] md:text-[1.125rem]">
            Aufgaben
          </h2>
          <p className="mt-0.5 text-[13px] font-medium" style={{ color: YD.text.secondary }}>
            {active.length === 0
              ? "Keine offenen Aufgaben"
              : active.length === 1
                ? "1 offene Aufgabe"
                : `${active.length} offene Aufgaben`}
            {done.length > 0 ? ` · ${done.length} kürzlich erledigt` : ""}
          </p>
        </div>
        <div className="yd-relay-tab-strip" role="group" aria-label="Aufgaben filtern">
          <button type="button" className={tabBtn(scope === "all")} onClick={() => onScopeChange("all")}>
            Alle
          </button>
          <button type="button" className={tabBtn(scope === "mine")} onClick={() => onScopeChange("mine")}>
            Meine
          </button>
        </div>
      </div>

      {items.length === 0 ? (
        <HcCard tone="default" className="yd-dash-surface p-5">
          <p className="text-[14px] font-medium" style={{ color: YD.text.primary }}>
            Keine Aufgaben in dieser Ansicht
          </p>
          <p className="mt-1 text-[13px]" style={{ color: YD.text.muted }}>
            Neue Aufgaben erscheinen hier mit Zuständigkeit und Fälligkeit.
          </p>
        </HcCard>
      ) : (
        <ul className="flex flex-col gap-2">
          {items.map((item) => (
            <li key={item.id}>
              <Link
                href={item.href}
                className={cn(
                  "yd-dash-surface yd-dash-interactive-card block rounded-[14px] border border-[rgba(226,232,240,0.95)] p-4 transition-colors",
                  item.isDone && "opacity-[0.92]"
                )}
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <p
                    className="min-w-0 text-[15px] font-semibold tracking-[-0.015em]"
                    style={{ color: YD.text.primary }}
                  >
                    {item.title}
                  </p>
                  <span className="yd-relay-meta-pill shrink-0">{item.statusLabel}</span>
                </div>

                <dl className="mt-2.5 grid gap-1 text-[12px] font-medium sm:grid-cols-2">
                  {item.patientLabel ? (
                    <div className="flex gap-1.5 sm:col-span-2">
                      <dt style={{ color: YD.text.muted }}>Patient:</dt>
                      <dd style={{ color: YD.text.secondary }}>{item.patientLabel}</dd>
                    </div>
                  ) : null}
                  <div className="flex gap-1.5">
                    <dt style={{ color: YD.text.muted }}>Zuständig:</dt>
                    <dd style={{ color: YD.text.secondary }}>{item.assigneeLabel}</dd>
                  </div>
                  {item.dueLabel ? (
                    <div className="flex gap-1.5">
                      <dt style={{ color: YD.text.muted }}>Fällig:</dt>
                      <dd style={{ color: YD.text.secondary }}>{item.dueLabel}</dd>
                    </div>
                  ) : null}
                </dl>

                {item.completionLine ? (
                  <p className="mt-2 text-[12px] font-medium" style={{ color: YD.text.muted }}>
                    {item.completionLine}
                  </p>
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
