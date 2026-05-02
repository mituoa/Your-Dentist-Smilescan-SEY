"use client";

import Link from "next/link";

import { pilotGlassPanel } from "@/lib/pilot-surface";

interface Tab {
  id: "open" | "pending" | "done";
  label: string;
  count: number;
}

interface TabsNavProps {
  tabs: Tab[];
  activeTab: string;
}

export function TabsNav({ tabs, activeTab }: TabsNavProps) {
  return (
    <div className={`mb-6 p-2 sm:mb-8 sm:p-3 ${pilotGlassPanel}`}>
    <nav
      aria-label="Aufgabenstatus"
      className="grid grid-cols-1 gap-2 border-b border-border pb-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3 sm:border-0 sm:pb-0"
    >
      {tabs.map((tab) => {
        const active = tab.id === activeTab;
        return (
          <Link
            key={tab.id}
            href={`/my-tasks?tab=${tab.id}`}
            aria-current={active ? "page" : undefined}
            className={`inline-flex min-h-11 items-center justify-between gap-2 rounded-md border px-3 py-2 text-sm leading-5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/40 sm:rounded-none sm:border-0 sm:border-b-2 sm:-mb-px sm:px-4 sm:py-3 sm:focus-visible:ring-0 ${
              active
                ? "border-border bg-surface-card text-text-primary font-medium sm:border-ink sm:bg-transparent sm:text-ink"
                : "border-border/70 text-text-tertiary hover:border-border hover:bg-surface-sunken/40 hover:text-text-primary sm:border-transparent sm:hover:bg-transparent"
            }`}
          >
            <span className="min-w-0 truncate">{tab.label}</span>
            {tab.count > 0 && (
              <span
                className={`ml-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] font-semibold tabular-nums ${
                  active
                    ? "bg-ink text-cream"
                    : "bg-surface-sunken text-text-secondary"
                }`}
              >
                {tab.count > 99 ? "99+" : tab.count}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
    </div>
  );
}
