import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center font-medium rounded transition-colors focus:outline-none focus:ring-2 focus:ring-brand/40 disabled:opacity-50 disabled:pointer-events-none",
          variant === "primary" &&
            "bg-brand text-white hover:bg-brand-glow",
          variant === "secondary" &&
            "bg-surface-card text-text-primary border border-border hover:bg-surface-sunken",
          variant === "ghost" &&
            "text-text-secondary hover:text-text-primary hover:bg-surface-sunken",
          size === "sm" && "h-8 px-3 text-sm",
          size === "md" && "h-10 px-4 text-sm",
          size === "lg" && "h-12 px-6 text-base",
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
