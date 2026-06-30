"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { TRUST_NAV_ITEMS } from "@/lib/trust/navigation";
import { cn } from "@/lib/utils";

/** Mobile/tablet — horizontale Trust-Navigation unter dem Header. */
export function TrustMobileNav() {
  const pathname = usePathname();

  /** Übersicht nutzt Karten als Navigation — horizontale Liste wäre redundant. */
  if (pathname === "/trust") return null;

  return (
    <nav className="yd-trust-mobile-nav lg:hidden" aria-label="Trust Center">
      <ul className="yd-trust-mobile-nav__list">
        {TRUST_NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/trust"
              ? pathname === "/trust"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "yd-trust-mobile-nav__link",
                  isActive && "yd-trust-mobile-nav__link--active"
                )}
                aria-current={isActive ? "page" : undefined}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
