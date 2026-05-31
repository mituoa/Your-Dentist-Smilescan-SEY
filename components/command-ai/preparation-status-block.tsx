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
  return (
    <div className={cn("yd-command-prep-block min-w-0", className)}>
      {!compact ? (
        <p className="text-[10px] font-semibold uppercase tracking-[0.07em] text-[#64748B]">
          Assistenz
        </p>
      ) : null}
      <ul className={cn("space-y-0.5", compact ? "mt-0" : "mt-1.5")}>
        {preparation.checks.map((check) => (
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
      </ul>
      {!compact ? (
        <p className="mt-2 text-[11px] font-medium leading-snug text-[#1E293B]">
          {preparation.suggestedNextStep}
        </p>
      ) : null}
    </div>
  );
}
