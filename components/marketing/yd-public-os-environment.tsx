"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { cn } from "@/lib/utils";

export type YdPublicOsEnvironmentProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Immersive public OS atmosphere — open, luminous, no sidebar or dashboard chrome.
 */
export function YdPublicOsEnvironment({ children, className }: YdPublicOsEnvironmentProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const id = requestAnimationFrame(() => {
      root.classList.add("yd-public-os-awakening-active");
    });
    return () => cancelAnimationFrame(id);
  }, []);

  return (
    <div ref={rootRef} className={cn("yd-public-os yd-public-os-awakening", className)}>
      <div className="yd-public-os-bg" aria-hidden />
      <div className="yd-public-os-mesh" aria-hidden />
      <div className="yd-public-os-orb yd-public-os-orb--cyan" aria-hidden />
      <div className="yd-public-os-orb yd-public-os-orb--turquoise" aria-hidden />
      <div className="yd-public-os-orb yd-public-os-orb--lavender" aria-hidden />
      <div className="yd-public-os-orb yd-public-os-orb--ice" aria-hidden />
      <div className="yd-public-os-vignette" aria-hidden />
      <div className="yd-public-os-content yd-public-os-awaken-content">{children}</div>
    </div>
  );
}
