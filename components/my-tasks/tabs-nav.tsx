"use client";

import Link from "next/link";

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
    <nav className="border-b border-border flex gap-1 mb-8">
      {tabs.map((tab) => {
        const active = tab.id === activeTab;
        return (
          <Link
            key={tab.id}
            href={`/my-tasks?tab=${tab.id}`}
            className={`px-4 py-3 text-sm border-b-2 -mb-px transition-colors ${
              active
                ? "border-ink text-ink font-medium"
                : "border-transparent text-text-tertiary hover:text-text-primary"
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span
                className={`ml-2 min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-medium inline-flex items-center justify-center ${
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
  );
}
