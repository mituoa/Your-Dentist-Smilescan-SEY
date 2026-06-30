"use client";

import Link from "next/link";

import { YourDentistBrandLockup } from "@/components/brand/your-dentist-brand-lockup";
import { PUBLIC_BRAND_TAGLINE } from "@/lib/brand/constants";
import { cn } from "@/lib/utils";

type YdProductChromeProps = {
  loginHref?: string;
  /** Primary nav target — home anchors or /pricing */
  setupHref?: string;
  setupLabel?: string;
  /** When false, header shows only Anmelden (hero owns the start CTA). */
  showSetupInHeader?: boolean;
  /** entry = login focus (no pricing CTA in chrome) */
  variant?: "marketing" | "entry";
  /** Product line under wordmark; pass null to hide. */
  tagline?: string | null;
};

/** Shared product chrome — same atmosphere on public, pricing, login. */
export function YdProductChrome({
  loginHref = "/login",
  setupHref = "/#pricing",
  setupLabel = "Praxis registrieren",
  showSetupInHeader = true,
  variant = "marketing",
  tagline = PUBLIC_BRAND_TAGLINE,
}: YdProductChromeProps) {
  return (
    <header
      className={cn(
        "yd-product-chrome yd-public-os-awaken-field",
        variant === "entry" && "yd-product-chrome--entry"
      )}
      style={{ ["--yd-public-field-i" as string]: "0" }}
    >
      <Link href="/?welcome=1" className="yd-auth-brand-link" aria-label="Startseite">
        <YourDentistBrandLockup size="md" centered tagline={tagline} />
      </Link>
      <nav
        className={cn("yd-product-chrome-nav", variant === "entry" && "yd-product-chrome-nav--entry")}
        aria-label="Hauptnavigation"
      >
        {variant === "entry" ? null : showSetupInHeader ? (
          <>
            <Link prefetch href={loginHref} className="yd-os-btn yd-os-btn--ghost">
              Anmelden
            </Link>
            <Link href={setupHref} className="yd-os-btn yd-os-btn--primary">
              {setupLabel}
            </Link>
          </>
        ) : (
          <Link prefetch href={loginHref} className="yd-os-btn yd-os-btn--ghost">
            Anmelden
          </Link>
        )}
      </nav>
    </header>
  );
}
