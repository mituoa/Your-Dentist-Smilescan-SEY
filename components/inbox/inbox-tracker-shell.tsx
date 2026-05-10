"use client";

import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

type InboxTrackerShellProps = {
  list: React.ReactNode;
  detail: React.ReactNode;
};

/**
 * Tracker: below md, list and detail are never shown side-by-side.
 * /inbox → full-height inbox only; /inbox/[id] → full-height case (native app pattern).
 */
export function InboxTrackerShell({ list, detail }: InboxTrackerShellProps) {
  const pathname = usePathname() || "";
  const isInboxIndex = pathname === "/inbox";

  return (
    <div
      className="relative flex h-full min-h-0 flex-1 flex-col overflow-x-hidden md:flex-row"
      style={{ background: "#F7F9FC" }}
    >
      <div
        className={cn(
          "flex min-h-0 shrink-0 flex-col overflow-x-hidden overflow-y-hidden border-b border-[rgba(15,23,42,0.06)] md:max-h-none md:w-[40%] md:max-w-[480px] md:min-w-[380px] md:flex-none md:border-b-0 md:border-r md:border-[rgba(15,23,42,0.06)]",
          isInboxIndex
            ? "max-md:flex max-md:min-h-0 max-md:flex-1"
            : "max-md:hidden md:flex"
        )}
        style={{ background: "#F8FAFC" }}
      >
        {list}
      </div>

      <section
        className={cn(
          "flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden bg-[#F7F9FC] md:min-h-0",
          isInboxIndex ? "max-md:hidden md:flex" : "flex max-md:min-h-0 max-md:flex-1"
        )}
      >
        {detail}
      </section>
    </div>
  );
}
