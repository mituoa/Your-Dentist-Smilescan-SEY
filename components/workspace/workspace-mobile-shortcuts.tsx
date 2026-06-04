"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ClipboardList,
  LayoutDashboard,
  ListTodo,
  Plus,
} from "lucide-react";

import { createCaseFromQuery } from "@/lib/create-case-return";
import { cn } from "@/lib/utils";

type WorkspaceMobileShortcutsProps = {
  /** Arzt sieht Link zum Dashboard-Überblick. */
  showDashboard?: boolean;
  /** Badge auf Tracker (z. B. ungesehene Einsendungen). */
  inboxBadge?: number;
  /** Badge auf Relay (offene Aufgaben). */
  relayBadge?: number;
  className?: string;
};

export function WorkspaceMobileShortcuts({
  showDashboard = false,
  inboxBadge,
  relayBadge,
  className,
}: WorkspaceMobileShortcutsProps) {
  const pathname = usePathname() || "";
  const createHref = `/create-case?from=${createCaseFromQuery(pathname || "/inbox")}`;

  const items = [
    ...(showDashboard
      ? [{ id: "dashboard", href: "/dashboard", label: "Überblick", icon: LayoutDashboard }]
      : []),
    {
      id: "inbox",
      href: "/inbox",
      label: "Tracker",
      icon: ClipboardList,
      badge: inboxBadge,
    },
    {
      id: "relay",
      href: "/relay",
      label: "Relay",
      icon: ListTodo,
      badge: relayBadge,
    },
    {
      id: "case",
      href: createHref,
      label: "Fall",
      icon: Plus,
    },
  ] as const;

  return (
    <nav
      className={cn("yd-ws-mobile-shortcuts md:hidden", className)}
      aria-label="Schnellzugriff Praxis"
    >
      {items.map((item) => {
        const active =
          item.id === "inbox"
            ? pathname === "/inbox" || pathname.startsWith("/inbox/")
            : item.id === "relay"
              ? pathname.startsWith("/relay") || pathname.startsWith("/my-tasks")
              : item.id === "dashboard"
                ? pathname.startsWith("/dashboard")
                : false;
        const Icon = item.icon;
        const badge = "badge" in item ? item.badge : undefined;

        return (
          <Link
            key={item.id}
            href={item.href}
            className={cn(
              "yd-ws-mobile-shortcuts__item",
              active && "yd-ws-mobile-shortcuts__item--active"
            )}
            aria-current={active ? "page" : undefined}
          >
            <Icon className="yd-ws-mobile-shortcuts__icon" strokeWidth={1.85} aria-hidden />
            <span className="yd-ws-mobile-shortcuts__label">{item.label}</span>
            {badge != null && badge > 0 ? (
              <span className="yd-ws-mobile-shortcuts__badge" aria-label={`${badge} offen`}>
                {badge > 9 ? "9+" : badge}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
