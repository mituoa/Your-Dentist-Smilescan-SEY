"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

import { YourDentistBrandLockup } from "@/components/brand/your-dentist-brand-lockup";
import { BENTO_HERO, BENTO_NAV, BENTO_SECTIONS } from "@/lib/marketing/public-bento-ia";
import { PUBLIC_BRAND_TAGLINE } from "@/lib/brand/constants";
import { getPublicSiteScrollRoot, scrollToPublicSection } from "@/lib/marketing/public-site-scroll";
import { cn } from "@/lib/utils";

type Props = {
  dashboardHref?: string | null;
};

export function BentoHeader({ dashboardHref = null }: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const readScrollTop = () => {
      const root = getPublicSiteScrollRoot();
      if (root && root !== document.documentElement && root !== document.body) {
        return root.scrollTop;
      }
      return window.scrollY;
    };
    const onScroll = () => setScrolled(readScrollTop() > 8);
    onScroll();
    const root = getPublicSiteScrollRoot();
    window.addEventListener("scroll", onScroll, { passive: true });
    if (root && root !== document.documentElement && root !== document.body) {
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
    scrollToPublicSection(sectionId, () => setMenuOpen(false));
  }, []);

  return (
    <>
      <header className={cn("yd-bento-header", scrolled && "yd-bento-header--scrolled")}>
        <div className="yd-bento-header__inner">
          <Link href="/" className="yd-bento-header__brand" aria-label="Startseite">
            <YourDentistBrandLockup size="sm" tagline={PUBLIC_BRAND_TAGLINE} />
          </Link>

          <nav className="yd-bento-header__nav hidden lg:flex" aria-label="Hauptnavigation">
            {BENTO_NAV.map((item) => (
              <button
                key={item.sectionId}
                type="button"
                className="yd-bento-header__link"
                onClick={() => go(item.sectionId)}
              >
                {item.label}
              </button>
            ))}
          </nav>

          <div className="yd-bento-header__actions">
            {dashboardHref ? (
              <Link href={dashboardHref} className="yd-bento-header__dash hidden md:inline-flex">
                Dashboard
              </Link>
            ) : null}
            <button
              type="button"
              className="yd-bento-btn yd-bento-btn--primary yd-bento-btn--sm hidden md:inline-flex"
              onClick={() => go(BENTO_SECTIONS.demo)}
            >
              {BENTO_HERO.primaryCta}
            </button>
            <Link href="/login" className="yd-bento-header__login hidden md:inline-flex">
              {BENTO_HERO.signInLabel}
            </Link>
            <button
              type="button"
              className="yd-bento-header__menu lg:hidden"
              aria-expanded={menuOpen}
              aria-label={menuOpen ? "Menü schließen" : "Menü öffnen"}
              onClick={() => setMenuOpen((v) => !v)}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </header>

      <div
        className={cn("yd-bento-mobile-nav lg:hidden", menuOpen && "yd-bento-mobile-nav--open")}
        aria-hidden={!menuOpen}
      >
        <button
          type="button"
          className="yd-bento-mobile-nav__backdrop"
          aria-label="Menü schließen"
          onClick={() => setMenuOpen(false)}
        />
        <nav className="yd-bento-mobile-nav__panel">
          {BENTO_NAV.map((item) => (
            <button
              key={item.sectionId}
              type="button"
              className="yd-bento-mobile-nav__link"
              onClick={() => go(item.sectionId)}
            >
              {item.label}
            </button>
          ))}
          <button
            type="button"
            className="yd-bento-mobile-nav__link"
            onClick={() => go(BENTO_SECTIONS.demo)}
          >
            {BENTO_HERO.primaryCta}
          </button>
          <Link href="/login" className="yd-bento-mobile-nav__link" onClick={() => setMenuOpen(false)}>
            {BENTO_HERO.signInLabel}
          </Link>
        </nav>
      </div>
    </>
  );
}
