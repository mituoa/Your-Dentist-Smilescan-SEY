"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

import { YourDentistBrandLockup } from "@/components/brand/your-dentist-brand-lockup";
import { buildRegisterEntryHref } from "@/lib/marketing/auth-access-copy";
import {
  PUBLIC_SITE_HERO,
  PUBLIC_SITE_NAV,
  PUBLIC_SITE_SECTIONS,
} from "@/lib/marketing/public-site-ia";
import { getPublicSiteScrollRoot, scrollToPublicSection } from "@/lib/marketing/public-site-scroll";
import { cn } from "@/lib/utils";

type YdPublicSiteHeaderProps = {
  className?: string;
  /** Session aktiv — kleiner Link, Landing bleibt sichtbar. */
  dashboardHref?: string | null;
};

export function YdPublicSiteHeader({ className, dashboardHref = null }: YdPublicSiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const readScrollTop = () => {
      const root = getPublicSiteScrollRoot();
      if (
        root &&
        root !== document.documentElement &&
        root !== document.body
      ) {
        return root.scrollTop;
      }
      return window.scrollY;
    };
    const onScroll = () => setScrolled(readScrollTop() > 8);
    onScroll();
    const root = getPublicSiteScrollRoot();
    window.addEventListener("scroll", onScroll, { passive: true });
    if (
      root &&
      root !== document.documentElement &&
      root !== document.body
    ) {
      root.addEventListener("scroll", onScroll, { passive: true });
      return () => {
        window.removeEventListener("scroll", onScroll);
        root.removeEventListener("scroll", onScroll);
      };
    }
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [menuOpen]);

  const go = useCallback((sectionId: string) => {
    const scrolled = scrollToPublicSection(sectionId, () => setMenuOpen(false));
    if (!scrolled && typeof window !== "undefined") {
      window.setTimeout(() => scrollToPublicSection(sectionId, () => setMenuOpen(false)), 80);
    }
  }, []);

  return (
    <>
      <header
        className={cn(
          "yd-public-site-header yd-public-os-awaken-field",
          scrolled && "yd-public-site-header--scrolled",
          className
        )}
        style={{ ["--yd-public-field-i" as string]: "0" }}
      >
        <div className="yd-public-site-header-inner">
          <Link href="/" className="yd-public-site-header-brand min-w-0" aria-label="Startseite">
            <YourDentistBrandLockup size="sm" tagline="Neutral Practice Platform" />
          </Link>

          <nav
            className="yd-public-site-header-nav hidden min-[900px]:flex"
            aria-label="Hauptnavigation"
          >
            {PUBLIC_SITE_NAV.map((item) => (
              <button
                key={item.sectionId}
                type="button"
                className="yd-public-site-nav-link"
                onClick={() => go(item.sectionId)}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="yd-public-site-header-actions">
            {dashboardHref ? (
              <Link
                prefetch
                href={dashboardHref}
                className="yd-public-site-cta-dashboard hidden min-[900px]:inline-flex"
              >
                Zum Dashboard
              </Link>
            ) : null}
            <button
              type="button"
              className="yd-public-site-cta-register hidden lg:inline-flex"
              onClick={() => go(PUBLIC_SITE_SECTIONS.demo)}
            >
              {PUBLIC_SITE_HERO.primaryCta}
            </button>
            <Link
              prefetch
              href="/login"
              className="yd-public-site-cta-login hidden min-[900px]:inline-flex"
            >
              Anmelden
            </Link>
            <button
              type="button"
              className="yd-public-site-menu-btn min-[900px]:hidden"
              aria-expanded={menuOpen}
              aria-controls="yd-public-site-mobile-nav"
              aria-label={menuOpen ? "Menü schließen" : "Menü öffnen"}
              onClick={() => setMenuOpen((v) => !v)}
            >
              {menuOpen ? (
                <X className="h-5 w-5" strokeWidth={1.75} />
              ) : (
                <Menu className="h-5 w-5" strokeWidth={1.75} />
              )}
            </button>
          </div>
        </div>
      </header>

      <div
        id="yd-public-site-mobile-nav"
        className={cn(
          "yd-public-site-mobile-drawer min-[900px]:hidden",
          menuOpen && "yd-public-site-mobile-drawer--open"
        )}
        aria-hidden={!menuOpen}
      >
        <button
          type="button"
          className="yd-public-site-mobile-backdrop"
          aria-label="Menü schließen"
          tabIndex={menuOpen ? 0 : -1}
          onClick={() => setMenuOpen(false)}
        />
        <div className="yd-public-site-mobile-panel">
          <nav className="flex flex-col gap-1 p-4" aria-label="Mobile Navigation">
            {PUBLIC_SITE_NAV.map((item) => (
              <button
                key={item.sectionId}
                type="button"
                className="yd-public-site-mobile-link"
                onClick={() => go(item.sectionId)}
              >
                {item.label}
              </button>
            ))}
            <button
              type="button"
              className="yd-public-site-mobile-link"
              onClick={() => go(PUBLIC_SITE_SECTIONS.demo)}
            >
              {PUBLIC_SITE_HERO.primaryCta}
            </button>
            {dashboardHref ? (
              <Link
                prefetch
                href={dashboardHref}
                className="yd-public-site-mobile-link"
                onClick={() => setMenuOpen(false)}
              >
                Zum Dashboard
              </Link>
            ) : null}
            <Link
              prefetch
              href="/login"
              className="yd-public-site-mobile-link"
              onClick={() => setMenuOpen(false)}
            >
              Anmelden
            </Link>
          </nav>
        </div>
      </div>
    </>
  );
}
