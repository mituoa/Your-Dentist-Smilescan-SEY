"use client";

import { cn } from "@/lib/utils";

type RelayTrackerShellProps = {
  list: React.ReactNode;
  context: React.ReactNode;
  actions: React.ReactNode;
  /** Mobile: show context+actions when a Vorgang is selected. */
  showWorkspace: boolean;
};

/** Relay V3 — Liste · Kontext · Aktionen (Tracker-Dichte). */
export function RelayTrackerShell({
  list,
  context,
  actions,
  showWorkspace,
}: RelayTrackerShellProps) {
  return (
    <div
      className={cn(
        "yd-relay-v6-shell yd-relay-v4-shell yd-relay-v3-shell yd-tracker-shell",
        !showWorkspace && "yd-relay-v3-shell--list",
        showWorkspace && "yd-relay-v3-shell--workspace"
      )}
    >
      <div
        className={cn(
          "yd-relay-v3-shell__list yd-tracker-shell__inbox",
          showWorkspace && "max-lg:hidden"
        )}
      >
        {list}
      </div>
      <div
        className={cn(
          "yd-relay-v3-shell__workspace yd-tracker-shell__workspace",
          !showWorkspace && "max-lg:hidden",
          showWorkspace && "max-lg:flex max-lg:min-h-0 max-lg:w-full max-lg:flex-1 max-lg:flex-col"
        )}
      >
        <div className="yd-relay-v3-shell__context">{context}</div>
        <aside className="yd-relay-v3-shell__actions">{actions}</aside>
      </div>
    </div>
  );
}
