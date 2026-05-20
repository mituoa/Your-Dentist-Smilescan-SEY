import type { CSSProperties, ReactNode } from "react";

import { YdCard } from "@/components/design-system/yd-card";

type HcCardProps = {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  lift?: boolean;
  glow?: boolean;
};

/** @deprecated Prefer YdCard — HC alias for workspace cards. */
export function HcCard({ children, className, style, lift, glow }: HcCardProps) {
  return (
    <YdCard className={className} style={style} lift={lift} glow={glow}>
      {children}
    </YdCard>
  );
}
