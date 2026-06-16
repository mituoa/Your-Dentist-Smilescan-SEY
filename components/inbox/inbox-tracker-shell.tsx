"use client";

import { useEffect } from "react";
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

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!isCaseDetail) return;
    window.requestAnimationFrame(() => {
      document
        .querySelector(".yd-tracker-v4-detail__scroll")
        ?.scrollTo({ top: 0, behavior: "auto" });
    });
  }, [isCaseDetail, pathname]);

  return (
    <div
      className={cn(
        "yd-tracker-shell",
        isInboxIndex && "yd-tracker-shell--mobile-list",
        isCaseDetail && "yd-tracker-shell--mobile-detail"
      )}
    >
      <div
        className={cn(
          "yd-tracker-shell__inbox",
          isCaseDetail && "max-md:hidden",
          isInboxIndex && "max-md:flex max-md:min-h-0 max-md:flex-1 max-md:flex-col"
        )}
      >
        {list}
      </div>
      <div
        className={cn(
          "yd-tracker-shell__workspace",
          isInboxIndex && "max-md:hidden",
          isCaseDetail &&
            "max-md:flex max-md:min-h-0 max-md:w-full max-md:flex-1 max-md:flex-col"
        )}
      >
        {detail}
      </div>
    </div>
  );
}
