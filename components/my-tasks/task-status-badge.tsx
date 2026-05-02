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
        className={`inline-flex items-center gap-1 rounded font-medium bg-amber-100 text-amber-900 ${cls}`}
      >
        <Clock className={iconCls} strokeWidth={2} />
        Auf Bestätigung
      </span>
    );
  }
  if (status === "done") {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded font-medium bg-emerald-100 text-emerald-900 ${cls}`}
      >
        <Check className={iconCls} strokeWidth={2} />
        Erledigt
      </span>
    );
  }
  return (
    <span
      className={`inline-flex items-center gap-1 rounded font-medium bg-surface-sunken text-text-secondary ${cls}`}
    >
      <AlertCircle className={iconCls} strokeWidth={2} />
      Offen
    </span>
  );
}
