"use client";

import type { ReactNode } from "react";

import { YourDentistBrandLockup } from "@/components/brand/your-dentist-brand-lockup";

type YdLoginEnvironmentProps = {
  children: ReactNode;
};

/**
 * Spatial login shell — same atmospheric stack as protected workspace (YD).
 * Ghost dashboard hints + floating island + awakening sequence on mount.
 */
export function YdLoginEnvironment({ children }: YdLoginEnvironmentProps) {
  return (
    <div className="yd-login yd-login-awakening">
      <div className="yd-login-page-bg yd-login-awaken-bg" aria-hidden />
      <div className="yd-login-ghost yd-login-awaken-ghost" aria-hidden>
        <div className="yd-login-ghost-sidebar" />
        <div className="yd-login-ghost-canvas" />
      </div>
      <div className="yd-login-orb yd-login-orb--a" aria-hidden />
      <div className="yd-login-orb yd-login-orb--b" aria-hidden />

      <div className="yd-login-stage">
        <div className="yd-login-island yd-login-awaken-island yd-login-awaken-settle">
          <div className="yd-login-island-glow" aria-hidden />
          <div className="yd-login-island-vignette" aria-hidden />
          <div className="yd-login-auth yd-login-awaken-auth">
            <div className="mb-8 flex justify-center md:mb-10">
              <YourDentistBrandLockup
                size="md"
                tagline="Klinischer Arbeitsbereich"
                centered
              />
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
