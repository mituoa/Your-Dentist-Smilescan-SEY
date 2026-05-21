"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, MessageCircle, Search, X } from "lucide-react";

import { YD } from "@/lib/design/yd-design-tokens";

type DashboardMobileSearchProps = {
  inboxCount?: number;
};

/** Mobile: Suche und Kurzaktionen nur bei Bedarf — nicht dauerhaft in der Topbar. */
export function DashboardMobileSearch({ inboxCount }: DashboardMobileSearchProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="yd-dash-mobile-toolbar md:hidden">
      <div className="flex items-center gap-2">
        <button
          type="button"
          className="yd-dash-mobile-toolbar-btn flex min-h-[40px] flex-1 items-center justify-center gap-2 rounded-full touch-manipulation"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="yd-dash-mobile-search-panel"
        >
          <Search className="h-4 w-4 shrink-0" strokeWidth={1.65} style={{ color: YD.text.muted }} />
          <span className="text-[13px] font-medium" style={{ color: YD.text.secondary }}>
            {open ? "Suche schließen" : "Fälle suchen"}
          </span>
        </button>
        <Link
          href="/inbox"
          className="yd-dash-mobile-icon-btn relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full touch-manipulation"
          aria-label={
            inboxCount && inboxCount > 0 ? `Tracker, ${inboxCount} ungelesen` : "Tracker"
          }
        >
          <Bell className="h-[17px] w-[17px]" style={{ color: YD.text.muted }} strokeWidth={1.65} />
          {inboxCount && inboxCount > 0 ? (
            <span
              className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full ring-2 ring-white/90"
              style={{ backgroundColor: "#E11D48" }}
              aria-hidden
            />
          ) : null}
        </Link>
        <Link
          href="/relay"
          className="yd-dash-mobile-icon-btn flex h-10 w-10 shrink-0 items-center justify-center rounded-full touch-manipulation"
          aria-label="Relay"
        >
          <MessageCircle
            className="h-[17px] w-[17px]"
            style={{ color: YD.text.muted }}
            strokeWidth={1.65}
          />
        </Link>
      </div>

      {open ? (
        <form
          id="yd-dash-mobile-search-panel"
          action="/inbox"
          method="get"
          className="yd-dash-mobile-search-panel"
        >
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2"
              style={{ color: YD.text.faint }}
              strokeWidth={1.65}
            />
            <input
              type="search"
              name="q"
              placeholder="Fälle oder Patienten suchen…"
              autoFocus
              className="yd-dash-search-input h-11 w-full pl-11 pr-10 text-[16px] outline-none"
              style={{
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.94) 0%, rgba(236,244,252,0.98) 100%)",
                border: `1px solid ${YD.border.soft}`,
                borderRadius: YD.radius.pill,
                color: YD.text.primary,
              }}
            />
            <button
              type="button"
              className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full"
              onClick={() => setOpen(false)}
              aria-label="Schließen"
            >
              <X className="h-4 w-4" style={{ color: YD.text.muted }} strokeWidth={1.75} />
            </button>
          </div>
        </form>
      ) : null}
    </div>
  );
}
