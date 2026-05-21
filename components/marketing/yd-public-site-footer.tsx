import Link from "next/link";

import { YourDentistBrandLockup } from "@/components/brand/your-dentist-brand-lockup";
import { PUBLIC_SITE_FOOTER } from "@/lib/marketing/public-site-ia";

export function YdPublicSiteFooter() {
  return (
    <footer className="yd-public-site-footer yd-public-os-awaken-field">
      <div className="yd-public-site-footer-inner">
        <div className="yd-public-site-footer-brand">
          <YourDentistBrandLockup size="sm" tagline={PUBLIC_SITE_FOOTER.tagline} />
        </div>
        <nav className="yd-public-site-footer-nav" aria-label="Rechtliches und Zugang">
          {PUBLIC_SITE_FOOTER.links.map((link) =>
            link.href.startsWith("/#") ? (
              <a key={link.href} href={link.href} className="yd-public-site-footer-link">
                {link.label}
              </a>
            ) : (
              <Link
                key={link.href}
                href={link.href}
                prefetch={!link.href.startsWith("/#")}
                className="yd-public-site-footer-link"
              >
                {link.label}
              </Link>
            )
          )}
        </nav>
      </div>
    </footer>
  );
}
