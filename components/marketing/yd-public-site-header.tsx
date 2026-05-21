"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

import { YourDentistBrandLockup } from "@/components/brand/your-dentist-brand-lockup";
import {
  PUBLIC_SITE_HERO,
  PUBLIC_SITE_NAV,
  PUBLIC_SITE_NAV_MOBILE,
  PUBLIC_SITE_SECTIONS,
} from "@/lib/marketing/public-site-ia";
import { cn } from "@/lib/utils";

function scrollToSection(sectionId: string, onDone?: () => void) {
  const el = document.getElementById(sectionId);
  if (!el) return;

  const headerVar = getComputedStyle(document.documentElement).getPropertyValue(
    "--yd-public-header-h"
  );
  const headerOffset = Number.parseFloat(headerVar) || 68;
  const top = el.getBoundingClientRect().top + window.scrollY - headerOffset - 12;

  window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
  onDone?.();
}

type YdPublicSiteHeaderProps = {
  className?: string;
};

export function YdPublicSiteHeader({ className }: YdPublicSiteHeaderProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isMobileNav, setIsMobileNav] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 1023px)");
    const sync = () => setIsMobileNav(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.documentElement.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [menuOpen]);

  const go = useCallback((sectionId: string) => {
    scrollToSection(sectionId, () => setMenuOpen(false));
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

          <nav className="yd-public-site-header-nav hidden lg:flex" aria-label="Hauptnavigation">
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
            <button
              type="button"
              className="yd-public-site-cta-ghost hidden lg:inline-flex"
              onClick={() => go(PUBLIC_SITE_SECTIONS.demo)}
            >
              Demo buchen
            </button>
            <Link prefetch href="/login" className="yd-public-site-cta-login">
              Anmelden
            </Link>
            <button
              type="button"
              className="yd-public-site-menu-btn lg:hidden"
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
          "yd-public-site-mobile-drawer lg:hidden",
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
            {(isMobileNav ? PUBLIC_SITE_NAV_MOBILE : PUBLIC_SITE_NAV).map((item) => (
              <button
                key={item.sectionId}
                type="button"
                className="yd-public-site-mobile-link"
                onClick={() => go(item.sectionId)}
              >
                {item.label}
              </button>
            ))}
            <Link
              href="/register"
              className="yd-public-site-mobile-link"
              onClick={() => setMenuOpen(false)}
            >
              {PUBLIC_SITE_HERO.primaryCta}
            </Link>
            <button
              type="button"
              className="yd-public-site-mobile-link"
              onClick={() => go(PUBLIC_SITE_SECTIONS.demo)}
            >
              Demo buchen
            </button>
            <Link
              prefetch
              href="/login"
              className="yd-public-site-mobile-link yd-public-site-mobile-link--login"
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
