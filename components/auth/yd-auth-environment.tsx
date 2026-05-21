"use client";

import type { ReactNode } from "react";
import Link from "next/link";

import { YourDentistBrandLockup } from "@/components/brand/your-dentist-brand-lockup";
import { cn } from "@/lib/utils";

export type YdAuthEnvironmentProps = {
  children: ReactNode;
  /** Wider auth panel (register recovery flows with more copy). */
  wide?: boolean;
  /** Page may scroll (e.g. register + pricing below modal). */
  scroll?: boolean;
  /** Brand lockup above form content (default on). */
  showBrand?: boolean;
  /** Link target for brand click; `false` = no link. Default: Startseite `/`. */
  brandHref?: string | false;
  /** Full-stage content without floating panel (register modal overlay). */
  bare?: boolean;
};

/**
 * Spatial auth shell — same atmospheric language as dashboard / login.
 * Premium clinical OS entrance, not a marketing landing page.
 */
export function YdAuthEnvironment({
  children,
  wide = false,
  scroll = false,
  showBrand = true,
  brandHref = "/",
  bare = false,
}: YdAuthEnvironmentProps) {
  return (
    <div
      className={cn(
        "yd-auth yd-auth-awakening",
        scroll && "yd-auth--scroll",
        bare && "yd-auth--bare-shell"
      )}
    >
      <div className="yd-auth-page-bg yd-auth-awaken-bg" aria-hidden />
      {!bare ? (
        <div className="yd-auth-ghost yd-auth-awaken-ghost" aria-hidden>
          <div className="yd-auth-ghost-sidebar" />
          <div className="yd-auth-ghost-canvas" />
        </div>
      ) : null}
      <div className="yd-auth-orb yd-auth-orb--a" aria-hidden />
      <div className="yd-auth-orb yd-auth-orb--b" aria-hidden />
      <div className="yd-auth-orb yd-auth-orb--c" aria-hidden />

      <div className="yd-auth-stage">
        {bare ? (
          <div className="yd-auth-bare yd-auth-awaken-bare w-full min-w-0">
            {children}
          </div>
        ) : (
          <div
            className={cn(
              "yd-auth-compose yd-auth-awaken-island yd-auth-awaken-settle",
              wide && "yd-auth-compose--wide"
            )}
          >
            <div className="yd-auth-panel-halo" aria-hidden />
            <div className="yd-auth-panel yd-auth-awaken-auth">
              <div className="yd-auth-panel-sheen" aria-hidden />
              <div className="yd-auth-panel-inner">
                {showBrand ? (
                  <div className="yd-auth-brand">
                    {brandHref === false ? (
                      <YourDentistBrandLockup
                        size="md"
                        tagline="Neutral Practice Platform"
                        centered
                      />
                    ) : (
                      <Link
                        href={brandHref}
                        className="yd-auth-brand-link"
                        aria-label="Zur Startseite"
                      >
                        <YourDentistBrandLockup
                          size="md"
                          tagline="Neutral Practice Platform"
                          centered
                        />
                      </Link>
                    )}
                  </div>
                ) : null}
                {children}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/** @deprecated Use `YdAuthEnvironment` */
export const YdLoginEnvironment = YdAuthEnvironment;
