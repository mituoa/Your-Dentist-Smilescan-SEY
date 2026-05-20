import type { CSSProperties, ReactNode } from "react";

import { YdCard, type YdCardTone } from "@/components/design-system/yd-card";

type HcCardProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  lift?: boolean;
  glow?: boolean;
  ambient?: boolean;
  tone?: YdCardTone;
  hoverPreview?: ReactNode;
};

/** @deprecated Prefer YdCard — HC alias for workspace cards. */
export function HcCard({
  children,
  className,
  style,
  lift,
  glow,
  ambient,
  tone,
  hoverPreview,
}: HcCardProps) {
  return (
    <YdCard
      className={className}
      style={style}
      lift={lift}
      glow={glow}
      ambient={ambient}
      tone={tone}
      hoverPreview={hoverPreview}
    >
      {children}
    </YdCard>
  );
}
