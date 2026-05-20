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
};

export function YdCard({ children, className, style, lift = false, glow = false }: YdCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden",
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
      <div className="relative">{children}</div>
    </div>
  );
}
