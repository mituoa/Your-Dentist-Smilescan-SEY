"use client";

import Link from "next/link";

import { YourDentistBrandLockup } from "@/components/brand/your-dentist-brand-lockup";

/** Feste Markenposition — identisch in Topbar und geöffnetem Drawer (kein Sprung). */
export function MobileWorkspaceBrandAnchor() {
  return (
    <Link
      href="/dashboard"
      className="yd-mobile-brand-anchor md:hidden"
      aria-label="Your Dentist — Startseite"
    >
      <YourDentistBrandLockup size="sm" tagline={null} className="min-w-0" priority />
    </Link>
  );
}
