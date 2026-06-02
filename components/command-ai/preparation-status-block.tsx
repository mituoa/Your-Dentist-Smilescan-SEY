import { Check } from "lucide-react";

import type { SubmissionPreparation } from "@/lib/command-ai/types";
import { cn } from "@/lib/utils";

type PreparationStatusBlockProps = {
  preparation: SubmissionPreparation;
  compact?: boolean;
  className?: string;
};

export function PreparationStatusBlock({
  preparation,
  compact = false,
  className,
}: PreparationStatusBlockProps) {
  const compactLimit = 3;
  const visibleChecks = compact ? preparation.checks.slice(0, compactLimit) : preparation.checks;
  const remainingCount = compact ? Math.max(0, preparation.checks.length - visibleChecks.length) : 0;

  return (
    <div className={cn("yd-command-prep-block min-w-0", className)}>
      {!compact ? (
        <p className="text-[10px] font-semibold uppercase tracking-[0.07em] text-[#64748B]">
          Assistenz
        </p>
      ) : null}
      <ul className={cn("space-y-0.5", compact ? "mt-0" : "mt-1.5")}>
        {visibleChecks.map((check) => (
          <li
            key={check.id}
            className="flex items-center gap-1.5 text-[11px] leading-snug text-[#475569]"
          >
            <span
              className={cn(
                "flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full",
                check.done ? "text-[#16a34a]" : "text-[#CBD5E1]"
              )}
              aria-hidden
            >
              {check.done ? <Check className="h-2.5 w-2.5" strokeWidth={2.5} /> : "○"}
            </span>
            <span className={check.done ? "text-[#334155]" : "text-[#94A3B8]"}>{check.label}</span>
          </li>
        ))}
        {compact && remainingCount > 0 ? (
          <li className="flex items-center gap-1.5 text-[11px] leading-snug text-[#94A3B8]">
            <span className="flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-full" aria-hidden>
              +
            </span>
            <span>{remainingCount} weitere</span>
          </li>
        ) : null}
      </ul>
      {!compact ? (
        <p className="mt-2 text-[11px] font-medium leading-snug text-[#1E293B]">
          {preparation.suggestedNextStep}
        </p>
      ) : null}
    </div>
  );
}
