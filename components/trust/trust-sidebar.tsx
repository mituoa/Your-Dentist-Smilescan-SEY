"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { TRUST_NAV_ITEMS } from "@/lib/trust/navigation";
import { cn } from "@/lib/utils";

export function TrustSidebar() {
  const pathname = usePathname();

  return (
    <nav className="yd-trust-sidebar" aria-label="Trust Center Navigation">
      <p className="yd-trust-sidebar__brand">Trust Center</p>
      <ul className="yd-trust-sidebar__list">
        {TRUST_NAV_ITEMS.map((item) => {
          const isActive =
            item.href === "/trust"
              ? pathname === "/trust"
              : pathname === item.href || pathname.startsWith(`${item.href}/`);

          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn("yd-trust-sidebar__link", isActive && "yd-trust-sidebar__link--active")}
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
