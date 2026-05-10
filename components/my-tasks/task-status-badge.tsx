import { AlertCircle, Check, Clock } from "lucide-react";

interface TaskStatusBadgeProps {
  status: "open" | "pending_review" | "done";
  size?: "sm" | "md";
}

export function TaskStatusBadge({ status, size = "sm" }: TaskStatusBadgeProps) {
  const cls =
    size === "sm" ? "text-[11px] px-1.5 py-0.5" : "text-sm px-2 py-1";
  const iconCls = size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5";

  if (status === "pending_review") {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-md font-medium bg-[#EEF6FF] text-[#1E40AF] ring-1 ring-[rgba(43,111,232,0.12)] ${cls}`}
      >
        <Clock className={iconCls} strokeWidth={2} />
        Auf Bestätigung
      </span>
    );
  }
  if (status === "done") {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-md font-medium bg-[#ECFDF5] text-[#047857] ring-1 ring-[rgba(16,185,129,0.15)] ${cls}`}
      >
        <Check className={iconCls} strokeWidth={2} />
        Erledigt
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md font-medium bg-[#F1F5F9] text-[#334155] ring-1 ring-[rgba(15,23,42,0.06)] ${cls}`}
    >
      <AlertCircle className={iconCls} strokeWidth={2} />
      Offen
    </span>
  );
}
