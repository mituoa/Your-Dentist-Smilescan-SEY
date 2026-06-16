import { YD } from "@/lib/design/yd-design-tokens";
import { cn } from "@/lib/utils";

type YdStatusPillProps = {
  label: string;
  variant?: "urgent" | "active" | "calm" | "done" | "pending";
  className?: string;
};

const VARIANT_CLASS: Record<NonNullable<YdStatusPillProps["variant"]>, string> = {
  urgent: "yd-status-pill--urgent",
  active: "yd-status-pill--active",
  calm: "yd-status-pill--calm",
  done: "yd-status-pill--done",
  pending: "yd-status-pill--pending",
};

export function YdStatusPill({ label, variant = "active", className }: YdStatusPillProps) {
  const v = YD.status[variant];
  return (
    <span
      className={cn(
        "yd-status-pill inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-medium tracking-wide",
        VARIANT_CLASS[variant],
        className
      )}
      style={{ backgroundColor: v.bg, color: v.text }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: v.dot }} aria-hidden />
      {label}
    </span>
  );
}
