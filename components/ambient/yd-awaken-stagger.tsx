"use client";

import type { ReactNode } from "react";

import { YD_STAGGER_MS } from "@/lib/design/yd-workspace-awakening";
import { useYdAwakening } from "@/components/ambient/yd-workspace-awakening";
import { cn } from "@/lib/utils";

type YdAwakenStaggerProps = {
  children: ReactNode;
  index?: number;
  className?: string;
};

/** Staggered card reveal during workspace awakening. */
export function YdAwakenStagger({ children, index = 0, className }: YdAwakenStaggerProps) {
  const { isAwakening } = useYdAwakening();
  const delay = YD_STAGGER_MS[Math.min(index, YD_STAGGER_MS.length - 1)] ?? 0;

  return (
    <div
      className={cn(isAwakening && "yd-awaken-stagger", className)}
      style={isAwakening ? ({ ["--yd-stagger" as string]: `${delay}ms` } as React.CSSProperties) : undefined}
    >
      {children}
    </div>
  );
}
