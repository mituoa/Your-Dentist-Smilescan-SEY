"use client";

import Link from "next/link";

import { clinicalCorePanel } from "@/lib/pilot-surface";

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
    <div className={`mb-6 p-2 sm:mb-8 sm:p-3 ${clinicalCorePanel}`}>
      <nav
        aria-label="Aufgabenstatus"
        className="grid grid-cols-1 gap-2 border-b border-[rgba(15,23,42,0.06)] pb-2 sm:grid-cols-2 sm:gap-3 lg:grid-cols-3 sm:border-0 sm:pb-0"
      >
        {tabs.map((tab) => {
          const active = tab.id === activeTab;
          return (
            <Link
              key={tab.id}
              href={`/my-tasks?tab=${tab.id}`}
              aria-current={active ? "page" : undefined}
              className={`inline-flex min-h-11 items-center justify-between gap-2 rounded-lg border px-3 py-2 text-sm leading-5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(43,111,232,0.28)] sm:rounded-none sm:border-0 sm:border-b-2 sm:-mb-px sm:px-4 sm:py-3 sm:focus-visible:ring-0 ${
                active
                  ? "border-[rgba(43,111,232,0.18)] bg-[#EEF6FF] font-medium text-[#0F172A] sm:border-transparent sm:border-[#2B6FE8] sm:bg-transparent sm:text-[#0F172A]"
                  : "border-[rgba(15,23,42,0.06)] text-[#64748B] hover:border-[rgba(43,111,232,0.12)] hover:bg-[#F4F7FB] hover:text-[#334155] sm:border-transparent sm:hover:bg-transparent"
              }`}
            >
              <span className="min-w-0 truncate">{tab.label}</span>
              {tab.count > 0 && (
                <span
                  className={`ml-2 inline-flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[11px] font-semibold tabular-nums ${
                    active ? "bg-[#2B6FE8] text-white" : "bg-[#E8EEF7] text-[#475569]"
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
