import type { CSSProperties, ReactNode } from "react";

import { YD } from "@/lib/design/yd-design-tokens";
import { ydTransition } from "@/lib/design/yd-motion";
import { cn } from "@/lib/utils";

type YdCardProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  lift?: boolean;
  glow?: boolean;
  ambient?: boolean;
  hoverPreview?: ReactNode;
};

export function YdCard({
  children,
  className,
  style,
  lift = false,
  glow = false,
  ambient = true,
  hoverPreview,
}: YdCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden",
        ambient && "yd-ambient-card",
        lift && "yd-hover-lift",
        className
      )}
      style={{
        background: YD.surface.card,
        borderRadius: YD.radius.lg,
        boxShadow: glow ? YD.shadow.glowFocus : YD.shadow.card,
        transition: ydTransition(),
        ...style,
      }}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[42%] rounded-t-[inherit]"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.95) 0%, transparent 100%)",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-24 w-24 rounded-full opacity-40 blur-2xl"
        style={{ background: YD.accent.glowSoft }}
        aria-hidden
      />
      <div className="relative flex min-h-0 flex-col">
        {children}
        {hoverPreview ? (
          <div className="yd-ambient-preview border-t border-[rgba(180,198,218,0.35)] pt-3">
            {hoverPreview}
          </div>
        ) : null}
      </div>
    </div>
  );
}
