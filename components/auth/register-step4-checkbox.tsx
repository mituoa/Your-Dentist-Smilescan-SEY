"use client";

import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type RegisterStep4CheckboxProps = {
  checked: boolean;
  onChange: (checked: boolean) => void;
  children: ReactNode;
  disabled?: boolean;
  /** Full legal meaning for screen readers when the visible label is shortened. */
  ariaLabel?: string;
};

/** Custom consent checkbox — no native black/accent fill. */
export function RegisterStep4Checkbox({
  checked,
  onChange,
  children,
  disabled = false,
  ariaLabel,
}: RegisterStep4CheckboxProps) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-center gap-2.5 py-1.5",
        disabled && "cursor-not-allowed opacity-60"
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange(e.target.checked)}
        aria-label={ariaLabel}
        className="peer sr-only"
      />
      <span
        className={cn(
          "flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-[5px] border bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-colors duration-150",
          checked
            ? "border-[#0284C7] bg-[#0284C7]"
            : "border-slate-200/90 bg-white peer-focus-visible:ring-2 peer-focus-visible:ring-[#0284C7]/25"
        )}
        aria-hidden
      >
        <svg
          className={cn("h-3 w-3 text-white transition-opacity duration-150", checked ? "opacity-100" : "opacity-0")}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
            clipRule="evenodd"
          />
        </svg>
      </span>
      <span className="min-w-0 text-[13px] leading-snug text-slate-700">{children}</span>
    </label>
  );
}
