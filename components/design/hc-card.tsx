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
}: HcCardProps) {
  return (
    <YdCard
      className={className}
      style={style}
      lift={lift}
      glow={glow}
      ambient={ambient}
      tone={tone}
    >
      {children}
    </YdCard>
  );
}
