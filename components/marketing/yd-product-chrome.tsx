"use client";

import Link from "next/link";

import { YourDentistBrandLockup } from "@/components/brand/your-dentist-brand-lockup";
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
};

/** Shared product chrome — same atmosphere on public, pricing, login. */
export function YdProductChrome({
  loginHref = "/login",
  setupHref = "/#pricing",
  setupLabel = "Praxis registrieren",
  showSetupInHeader = true,
  variant = "marketing",
}: YdProductChromeProps) {
  return (
    <header
      className={cn(
        "yd-product-chrome yd-public-os-awaken-field",
        variant === "entry" && "yd-product-chrome--entry"
      )}
      style={{ ["--yd-public-field-i" as string]: "0" }}
    >
      <Link href="/" className="yd-auth-brand-link" aria-label="Startseite">
        <YourDentistBrandLockup size="md" tagline="Neutral Practice Platform" />
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
