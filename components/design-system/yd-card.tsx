import type { CSSProperties, ReactNode } from "react";

import { YD } from "@/lib/design/yd-design-tokens";
import { ydSpatialTransition } from "@/lib/design/yd-motion";
import { cn } from "@/lib/utils";

export type YdCardTone = "default" | "primary" | "quiet";

type YdCardProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  lift?: boolean;
  glow?: boolean;
  ambient?: boolean;
  tone?: YdCardTone;
};

const TONE_STYLES: Record<
  YdCardTone,
  { background: string; boxShadow: string; radius: string }
> = {
  default: {
    background: YD.surface.card,
    boxShadow: YD.shadow.card,
    radius: YD.radius.lg,
  },
  primary: {
    background: YD.surface.cardPrimary,
    boxShadow: YD.shadow.cardPrimary,
    radius: YD.radius.xl,
  },
  quiet: {
    background: YD.surface.cardQuiet,
    boxShadow: YD.shadow.cardQuiet,
    radius: YD.radius.lg,
  },
};

export function YdCard({
  children,
  className,
  style,
  lift = false,
  glow = false,
  ambient = true,
  tone = "default",
}: YdCardProps) {
  const toneStyle = TONE_STYLES[tone];

  return (
    <div
      className={cn(
        "relative overflow-hidden",
        ambient && "yd-spatial-surface yd-ambient-card",
        lift && "yd-hover-lift",
        className
      )}
      style={{
        background: toneStyle.background,
        borderRadius: toneStyle.radius,
        boxShadow: glow ? YD.shadow.glowFocus : toneStyle.boxShadow,
        transition: ydSpatialTransition(),
        ...style,
      }}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[46%] rounded-t-[inherit]"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.92) 0%, transparent 100%)",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-10 -top-10 h-28 w-28 rounded-full opacity-30 blur-2xl"
        style={{ background: YD.accent.glowSoft }}
        aria-hidden
      />
      {tone === "primary" ? (
        <div
          className="pointer-events-none absolute bottom-0 left-1/2 h-[45%] w-[70%] -translate-x-1/2 rounded-full opacity-25 blur-3xl"
          style={{
            background: "radial-gradient(ellipse, rgba(47,128,237,0.12) 0%, transparent 70%)",
          }}
          aria-hidden
        />
      ) : null}
      <div className="relative flex min-h-0 flex-col">{children}</div>
    </div>
  );
}
