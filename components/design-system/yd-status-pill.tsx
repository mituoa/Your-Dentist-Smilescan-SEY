import { cn } from "@/lib/utils";

type YdStatusPillProps = {
  label: string;
  variant?: "urgent" | "active" | "calm" | "done" | "pending";
  className?: string;
};

const VARIANTS = {
  urgent: { bg: "#FEE8E8", text: "#B91C1C", dot: "#EF4444" },
  active: { bg: "#E0EDFE", text: "#1D4ED8", dot: "#3B82F6" },
  calm: { bg: "#E0F2F5", text: "#0E7490", dot: "#06B6D4" },
  done: { bg: "#DCFCE7", text: "#15803D", dot: "#22C55E" },
  pending: { bg: "#FEF3C7", text: "#B45309", dot: "#F59E0B" },
} as const;

export function YdStatusPill({ label, variant = "active", className }: YdStatusPillProps) {
  const v = VARIANTS[variant];
  return (
    <span
      className={cn(
        "yd-status-pill inline-flex items-center gap-2 rounded-full px-3 py-1 text-[11px] font-medium tracking-wide",
        className
      )}
      style={{ backgroundColor: v.bg, color: v.text }}
    >
      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: v.dot }} aria-hidden />
      {label}
    </span>
  );
}
