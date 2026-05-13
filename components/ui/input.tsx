import * as React from "react";
import { cn } from "@/lib/utils";

export const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, ...props }, ref) => {
  return (
    <input
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded border border-border bg-surface-card px-3 py-2 text-base sm:text-sm",
        "text-text-primary placeholder:text-text-tertiary",
        "focus:outline-none focus:ring-2 focus:ring-brand/40 focus:border-brand",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        className
      )}
      {...props}
    />
  );
});

Input.displayName = "Input";
