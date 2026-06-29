"use client";

import { useEffect, useRef, type ReactNode } from "react";

import { cn } from "@/lib/utils";

export type YdPublicOsEnvironmentProps = {
  children: ReactNode;
  /** editorial = landing; focus = login; register = wizard shell */
  mode?: "editorial" | "focus" | "register";
  /** Allow vertical scroll (pricing, register) */
  scroll?: boolean;
  /** Landing: kein 2s Blur-Fade — sofort lesbar nach Navigation */
  instantEnter?: boolean;
  /** Auth: gleicher Hintergrund wie Startseite (.yd-os) — nur Atmosphäre, Login-UI unverändert */
  landingAtmosphere?: boolean;
  className?: string;
};

/**
 * Immersive public OS atmosphere — open, luminous, no sidebar or dashboard chrome.
 */
export function YdPublicOsEnvironment({
  children,
  mode = "editorial",
  scroll = false,
  instantEnter = false,
  landingAtmosphere = false,
  className,
}: YdPublicOsEnvironmentProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (instantEnter) return;
    const root = rootRef.current;
    if (!root) return;
    const id = requestAnimationFrame(() => {
      root.classList.add("yd-public-os-awakening-active");
    });
    return () => cancelAnimationFrame(id);
  }, [instantEnter]);

  return (
    <div
      ref={rootRef}
      className={cn(
        "yd-public-os yd-clinical-world",
        !instantEnter && "yd-public-os-awakening",
        instantEnter && "yd-public-os-awakening-active yd-public-os--instant-enter",
        mode === "focus" && "yd-public-os--focus",
        mode === "register" && "yd-public-os--register",
        landingAtmosphere && "yd-public-os--landing-atmosphere",
        scroll && "yd-public-os--scroll",
        className
      )}
    >
      <div className="yd-public-os-bg" aria-hidden />
      <div className="yd-public-os-mesh" aria-hidden />
      {/* Selective accent glow — under content, not full-screen flood */}
      <div className="yd-public-os-ambient yd-public-os-ambient--upper" aria-hidden />
      <div className="yd-public-os-ambient yd-public-os-ambient--center" aria-hidden />
      <div className="yd-public-os-ambient yd-public-os-ambient--lower" aria-hidden />
      <div className="yd-public-os-vignette" aria-hidden />
      <div className="yd-public-os-content yd-public-os-awaken-content">{children}</div>
    </div>
  );
}
