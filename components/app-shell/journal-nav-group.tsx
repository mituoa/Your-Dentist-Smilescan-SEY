"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { NavItem } from "./nav-item";

const JOURNAL_SUB_ITEMS = [
  { href: "/journal?view=drafts", label: "Entwürfe", view: "drafts" },
  { href: "/journal?view=published", label: "Veröffentlicht", view: "published" },
  { href: "/journal?view=scheduled", label: "Geplant", view: "scheduled" },
] as const;

export function JournalNavGroup() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isJournalActive = pathname.startsWith("/journal");
  const currentView = searchParams.get("view") || "all";

  return (
    <div>
      <NavItem href="/journal" iconName="journal" label="Journals" />
      {isJournalActive && (
        <div className="mt-1 space-y-0.5 pb-1 pl-11 pr-3">
          {JOURNAL_SUB_ITEMS.map((item) => {
            const isActive = currentView === item.view;

            return (
              <Link
                key={item.view}
                href={item.href}
                className={cn(
                  "block rounded-md px-3 py-1.5 text-xs transition-colors",
                  isActive
                    ? "bg-slate-100 text-slate-900"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
