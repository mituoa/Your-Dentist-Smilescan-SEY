"use client";

import { usePathname, useSearchParams } from "next/navigation";

import { inboxSearchQueryFromParam } from "@/lib/inbox-search-q";
import { YD } from "@/lib/design/yd-design-tokens";
import { cn } from "@/lib/utils";

type InboxTrackerShellProps = {
  list: React.ReactNode;
  detail: React.ReactNode;
};

/**
 * Tracker: unter `md` nie Liste und Detail nebeneinander.
 * `/inbox` → mobil nur Liste; **Ausnahme:** aktive Suche (`q`) zeigt den Detail-Slot unter der Liste,
 * damit leere Such-/Index-Zustände (z. B. „Keine Treffer“) sichtbar bleiben (Punkt 7).
 * `/inbox/[id]` → mobil Vollbild-Fall.
 * **Punkt 9:** Desktop: **getrennte Scroll-Panes** (Liste ↔ Detail), kein gemeinsamer `main`-Scroll
 * (`yd-inbox-workspace.css`); mobil Vollbild bzw. geteilte Liste bei aktivem `q`.
 */
export function InboxTrackerShell({ list, detail }: InboxTrackerShellProps) {
  const pathname = usePathname() || "";
  const searchParams = useSearchParams();
  const isInboxIndex = pathname === "/inbox";
  const qActive = Boolean(
    inboxSearchQueryFromParam(searchParams.get("q") ?? undefined)
  );
  const showMobileIndexDetail = isInboxIndex && qActive;

  return (
    <div
      className="yd-inbox-tracker relative flex h-full min-h-0 flex-1 flex-col overflow-hidden md:flex-row"
      style={{ backgroundColor: "transparent" }}
    >
      <div
        className={cn(
          "yd-inbox-tracker-list flex min-h-0 min-w-0 shrink-0 flex-col overflow-x-hidden border-b md:h-full md:max-h-full md:w-[min(40%,420px)] md:max-w-[440px] md:min-w-[300px] md:flex-none md:overflow-hidden md:border-b-0 md:border-r",
          !isInboxIndex && "max-md:hidden",
          isInboxIndex &&
            (showMobileIndexDetail
              ? "max-md:max-h-[min(46vh,320px)] max-md:flex-none max-md:overflow-y-auto"
              : "max-md:min-h-0 max-md:flex-1 max-md:overflow-y-hidden")
        )}
        style={{
          backgroundColor: "transparent",
          borderColor: YD.border.soft,
        }}
      >
        {list}
      </div>

      <section
        className={cn(
          "yd-inbox-tracker-detail flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden overscroll-y-contain md:h-full md:max-h-full",
          isInboxIndex
            ? showMobileIndexDetail
              ? "flex max-md:min-h-0 max-md:flex-1 max-md:overflow-y-auto"
              : "max-md:hidden md:flex"
            : "flex max-md:min-h-0 max-md:flex-1"
        )}
      >
        {detail}
      </section>
    </div>
  );
}
