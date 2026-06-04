"use client";

import type { RelayOpsStatus } from "@/lib/relay/relay-ops-status";
import { cn } from "@/lib/utils";

type RelayOpsStatusBadgeProps = {
  status: RelayOpsStatus;
  label: string;
  critical?: boolean;
  size?: "sm" | "md";
};

const STATUS_CLASS: Record<RelayOpsStatus, string> = {
  new: "yd-relay-ops-status--new",
  in_progress: "yd-relay-ops-status--progress",
  waiting_patient: "yd-relay-ops-status--patient",
  waiting_practice: "yd-relay-ops-status--practice",
  overdue: "yd-relay-ops-status--overdue",
  done: "yd-relay-ops-status--done",
};

export function RelayOpsStatusBadge({
  status,
  label,
  critical = false,
  size = "sm",
}: RelayOpsStatusBadgeProps) {
  return (
    <span
      className={cn(
        "yd-relay-ops-status yd-relay-ops-status--badge",
        STATUS_CLASS[status],
        critical && "yd-relay-ops-status--critical",
        size === "md" && "yd-relay-ops-status--md"
      )}
    >
      <span className="yd-relay-ops-status__dot" aria-hidden />
      <span className="yd-relay-ops-status__label">
        {critical && status !== "done" ? `Kritisch · ${label}` : label}
      </span>
    </span>
  );
}
