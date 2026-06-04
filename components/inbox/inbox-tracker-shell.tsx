"use client";

import { usePathname } from "next/navigation";

import { cn } from "@/lib/utils";

type InboxTrackerShellProps = {
  list: React.ReactNode;
  detail: React.ReactNode;
};

/** 34% Inbox · 66% Arbeitsbereich — Referenz-Split. */
export function InboxTrackerShell({ list, detail }: InboxTrackerShellProps) {
  const pathname = usePathname() || "";
  const isInboxIndex = pathname === "/inbox";
  const isCaseDetail = pathname.startsWith("/inbox/") && pathname !== "/inbox";

  return (
    <div className="yd-tracker-shell">
      <div
        className={cn(
          "yd-tracker-shell__inbox",
          isCaseDetail && "max-md:hidden"
        )}
      >
        {list}
      </div>
      <div
        className={cn(
          "yd-tracker-shell__workspace",
          isInboxIndex && "max-md:hidden"
        )}
      >
        {detail}
      </div>
    </div>
  );
}
