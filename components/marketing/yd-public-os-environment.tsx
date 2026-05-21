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
      {/* Selective accent glow — under content, not full-screen flood */}
      <div className="yd-public-os-ambient yd-public-os-ambient--upper" aria-hidden />
      <div className="yd-public-os-ambient yd-public-os-ambient--lower" aria-hidden />
      <div className="yd-public-os-vignette" aria-hidden />
      <div className="yd-public-os-content yd-public-os-awaken-content">{children}</div>
    </div>
  );
}
