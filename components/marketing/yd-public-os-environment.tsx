"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { cn } from "@/lib/utils";

const RAIL_MODULES = [
  { id: "atlas", label: "Atlas" },
  { id: "tracker", label: "Tracker" },
  { id: "relay", label: "Relay" },
  { id: "profile", label: "Profil" },
  { id: "journal", label: "Journal" },
] as const;

export type YdPublicOsEnvironmentProps = {
  children: ReactNode;
  className?: string;
};

/**
 * Public entry shell — same spatial OS as dashboard (rail + canvas island).
 * Not a marketing landing layout.
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
      <div className="yd-public-os-orb yd-public-os-orb--a" aria-hidden />
      <div className="yd-public-os-orb yd-public-os-orb--b" aria-hidden />
      <div className="yd-public-os-orb yd-public-os-orb--c" aria-hidden />

      <div className="yd-public-os-stage">
        <aside className="yd-public-os-rail yd-public-os-awaken-rail" aria-hidden>
          <div className="yd-public-os-rail-glow yd-glow-pulse" />
          <div className="yd-public-os-rail-inner">
            <div className="yd-public-os-rail-mark" />
            <nav className="yd-public-os-rail-nav">
              {RAIL_MODULES.map((m, i) => (
                <span
                  key={m.id}
                  className={cn("yd-public-os-rail-item", i === 0 && "yd-public-os-rail-item--active")}
                >
                  <span className="yd-public-os-rail-dot" aria-hidden />
                  <span className="yd-public-os-rail-label">{m.label}</span>
                </span>
              ))}
            </nav>
          </div>
        </aside>

        <main className="yd-public-os-canvas yd-public-os-awaken-canvas">
          <div className="yd-public-os-canvas-halo" aria-hidden />
          <div className="yd-public-os-canvas-sheen" aria-hidden />
          <div className="yd-public-os-canvas-inner">{children}</div>
        </main>
      </div>
    </div>
  );
}
