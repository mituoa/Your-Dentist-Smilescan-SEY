interface NavBadgeProps {
  count: number;
  variant?: "default" | "urgent";
}

export function NavBadge({ count, variant = "default" }: NavBadgeProps) {
  if (count === 0) return null;

  const display = count > 9 ? "9+" : count.toString();

  return (
    <span
      className={`ml-auto min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-medium flex items-center justify-center ${
        variant === "urgent"
          ? "bg-danger text-white"
          : "bg-surface-sunken text-text-primary"
      }`}
    >
      {display}
    </span>
  );
}
