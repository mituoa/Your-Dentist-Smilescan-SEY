"use client";

import Link from "next/link";
import { Shield } from "lucide-react";
import { useCallback } from "react";

import { YourDentistBrandLockup } from "@/components/brand/your-dentist-brand-lockup";
import { TRUST_FOOTER_LINK } from "@/lib/trust/navigation";
import { PUBLIC_SITE_FOOTER } from "@/lib/marketing/public-site-ia";
import { scrollToPublicSection } from "@/lib/marketing/public-site-scroll";
import { cn } from "@/lib/utils";

export function YdPublicSiteFooter({ compact = false }: { compact?: boolean }) {
  const onAnchorClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>, sectionId: string) => {
      if (typeof window === "undefined" || window.location.pathname !== "/") return;
      event.preventDefault();
      scrollToPublicSection(sectionId);
    },
    []
  );

  return (
    <footer
      className={cn(
        "yd-public-site-footer yd-public-os-awaken-field",
        compact && "yd-public-site-footer--compact"
      )}
    >
      <div className="yd-public-site-footer-inner">
        <div className="yd-public-site-footer-brand">
          <YourDentistBrandLockup size="sm" tagline={PUBLIC_SITE_FOOTER.tagline} />
        </div>

        <div className="yd-public-site-footer-trust">
          <Link href={TRUST_FOOTER_LINK.href} prefetch className="yd-public-site-footer-trust__link">
            <Shield className="h-4 w-4" strokeWidth={1.75} aria-hidden />
            {TRUST_FOOTER_LINK.label}
          </Link>
          <p className="yd-public-site-footer-trust__hint">
            Datenschutz, Sicherheit und KI-Transparenz für Zahnarztpraxen.
          </p>
        </div>

        <nav className="yd-public-site-footer-nav" aria-label="Produkt und Zugang">
          {PUBLIC_SITE_FOOTER.links.map((link) => {
            if (link.href.startsWith("/#")) {
              const sectionId = link.href.replace("/#", "");
              return (
                <a
                  key={link.href}
                  href={link.href}
                  className="yd-public-site-footer-link"
                  onClick={(e) => onAnchorClick(e, sectionId)}
                >
                  {link.label}
                </a>
              );
            }
            return (
              <Link
                key={link.href}
                href={link.href}
                prefetch
                className="yd-public-site-footer-link"
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </footer>
  );
}
