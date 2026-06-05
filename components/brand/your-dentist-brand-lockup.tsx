import Image from "next/image";

import { cn } from "@/lib/utils";

export type YourDentistBrandLockupSize = "sm" | "md";

const MARK = {
  sm: { px: 28, cls: "h-7 w-7" },
  md: { px: 32, cls: "h-8 w-8" },
} as const;

const WORD = {
  sm: "text-[15px] leading-none",
  md: "text-[17px] leading-none sm:text-[18px]",
} as const;

const TAGLINE =
  "w-full text-center text-[9px] font-medium uppercase leading-tight tracking-[0.12em] text-slate-500/90 whitespace-nowrap";

export interface YourDentistBrandLockupProps {
  size?: YourDentistBrandLockupSize;
  /** Optional product line under the wordmark (centered under logo + wordmark). */
  tagline?: string | null;
  /** Center the lockup block (row + tagline). */
  centered?: boolean;
  /** Nur das Mark-Icon — für kurze Route-/Overlay-Loads (kein Wordmark, keine Subline). */
  markOnly?: boolean;
  className?: string;
  priority?: boolean;
}

/**
 * Canonical in-app brand: [Logo] Your Dentist — Tagline centered underneath.
 */
export function YourDentistBrandLockup({
  size: lockupSize = "md",
  tagline = null,
  centered = false,
  markOnly = false,
  className,
  priority = false,
}: YourDentistBrandLockupProps) {
  const m = MARK[lockupSize];

  if (markOnly) {
    return (
      <div
        className={cn(centered ? "flex justify-center" : "flex", className)}
        data-brand="your-dentist-mark"
      >
        <Image
          src="/brand/your-dentist/logo-mark.svg"
          alt=""
          width={m.px}
          height={m.px}
          priority={priority}
          className={cn(m.cls, "shrink-0 object-contain")}
          aria-hidden
        />
      </div>
    );
  }

  return (
    <div
      className={cn(
        "inline-flex flex-col gap-0.5",
        centered ? "items-center" : "items-start",
        className
      )}
      data-brand="your-dentist"
    >
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
      {tagline ? <p className={TAGLINE}>{tagline}</p> : null}
    </div>
  );
}
