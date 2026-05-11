import Image from "next/image";

import { cn } from "@/lib/utils";

export type YourDentistBrandLockupSize = "sm" | "md";

const MARK = {
  sm: { px: 28, cls: "h-7 w-7" },
  md: { px: 32, cls: "h-8 w-8" },
} as const;

const TAGLINE_INDENT = {
  sm: "pl-[38px]" /* 28px mark + 10px gap */,
  md: "pl-[42px]" /* 32px mark + 10px gap */,
} as const;

const WORD = {
  sm: "text-[15px] leading-none",
  md: "text-[17px] leading-none sm:text-[18px]",
} as const;

export interface YourDentistBrandLockupProps {
  size?: YourDentistBrandLockupSize;
  /** Optional product line under the wordmark (aligned with wordmark column). */
  tagline?: string | null;
  /** Center stack (e.g. modal headers). Default: left-aligned block. */
  centered?: boolean;
  className?: string;
  priority?: boolean;
}

/**
 * Canonical in-app brand: small mark + “Your Dentist” wordmark.
 * Uses the shipped SVG mark — no duplicated inline hero artwork.
 */
export function YourDentistBrandLockup({
  size: lockupSize = "md",
  tagline = null,
  centered = false,
  className,
  priority = false,
}: YourDentistBrandLockupProps) {
  const m = MARK[lockupSize];

  const row = (
    <div className="flex items-center gap-2.5">
      <Image
        src="/brand/your-dentist/logo-mark.svg"
        alt=""
        width={m.px}
        height={m.px}
        priority={priority}
        className={cn(m.cls, "shrink-0 object-contain")}
        aria-hidden
      />
      <div
        className={cn(
          "min-w-0 font-serif font-medium tracking-tight text-gray-900",
          WORD[lockupSize]
        )}
      >
        <span className="font-light italic">Your</span> Dentist
      </div>
    </div>
  );

  const taglineNode = tagline ? (
    <p
      className={cn(
        "max-w-[min(100%,20rem)] text-[9px] font-semibold uppercase leading-tight tracking-[0.15em] text-slate-500",
        centered ? "text-center" : TAGLINE_INDENT[lockupSize]
      )}
    >
      {tagline}
    </p>
  ) : null;

  if (centered) {
    return (
      <div className={cn("flex flex-col items-center gap-1", className)} data-brand="your-dentist">
        {row}
        {taglineNode}
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-start gap-1", className)} data-brand="your-dentist">
      {row}
      {taglineNode}
    </div>
  );
}
