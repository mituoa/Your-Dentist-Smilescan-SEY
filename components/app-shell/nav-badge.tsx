import { cn } from "@/lib/utils";

interface NavBadgeProps {
  count: number;
  variant?: "default" | "urgent";
  className?: string;
}

export function NavBadge({ count, variant = "default", className }: NavBadgeProps) {
  if (count === 0) return null;

  const display = count > 9 ? "9+" : count.toString();

  return (
    <span
      className={cn(
        "ml-auto flex h-5 min-w-[20px] items-center justify-center rounded-full px-1.5 text-[10px] font-medium max-[419px]:absolute max-[419px]:top-2 max-[419px]:right-2 max-[419px]:ml-0",
        variant === "urgent"
          ? "bg-danger text-white"
          : "bg-surface-sunken text-text-primary",
        className
      )}
    >
      {display}
    </span>
  );
}
