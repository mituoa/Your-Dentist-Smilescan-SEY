"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  ClipboardList,
  LayoutDashboard,
  ListTodo,
  Settings,
  UserCircle,
} from "lucide-react";

import { cn } from "@/lib/utils";

type WorkspaceMobileShortcutsProps = {
  overviewHref?: string;
  showJournal?: boolean;
  inboxBadge?: number;
  relayBadge?: number;
  className?: string;
};

export function WorkspaceMobileShortcuts({
  overviewHref = "/dashboard",
  showJournal = true,
  inboxBadge,
  relayBadge,
  className,
}: WorkspaceMobileShortcutsProps) {
  const pathname = usePathname() || "";

  const tabs = [
    {
      id: "overview",
      href: overviewHref,
      label: "Übersicht",
      icon: LayoutDashboard,
      active:
        pathname.startsWith(overviewHref) ||
        (overviewHref === "/dashboard" && pathname === "/dashboard"),
    },
    {
      id: "inbox",
      href: "/inbox",
      label: "Tracker",
      icon: ClipboardList,
      active: pathname === "/inbox" || pathname.startsWith("/inbox/"),
      badge: inboxBadge,
    },
    {
      id: "relay",
      href: "/relay",
      label: "Relay",
      icon: ListTodo,
      active: pathname.startsWith("/relay") || pathname.startsWith("/my-tasks"),
      badge: relayBadge,
    },
    ...(showJournal
      ? [
          {
            id: "journal",
            href: "/journal",
            label: "Journal",
            icon: BookOpen,
            active: pathname.startsWith("/journal"),
          },
        ]
      : []),
    {
      id: "profile",
      href: "/profile",
      label: "Profil",
      icon: UserCircle,
      active:
        pathname.startsWith("/profile") ||
        pathname.startsWith("/doc/"),
    },
    {
      id: "settings",
      href: "/settings",
      label: "Einstellungen",
      icon: Settings,
      active: pathname.startsWith("/settings"),
    },
  ] as const;

  return (
    <nav
      className={cn("yd-ws-mobile-shortcuts md:hidden", className)}
      aria-label="Hauptnavigation"
    >
      {tabs.map((item) => {
        const Icon = item.icon;
        const badge = "badge" in item ? item.badge : undefined;
        return (
          <Link
            key={item.id}
            href={item.href}
            className={cn(
              "yd-ws-mobile-shortcuts__item",
              item.active && "yd-ws-mobile-shortcuts__item--active"
            )}
            aria-current={item.active ? "page" : undefined}
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
