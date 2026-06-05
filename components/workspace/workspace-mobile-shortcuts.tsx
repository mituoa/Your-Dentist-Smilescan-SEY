"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, ClipboardList, LayoutDashboard, ListTodo } from "lucide-react";

import { WorkspaceMobileMoreSheet } from "@/components/workspace/workspace-mobile-more-sheet";
import { cn } from "@/lib/utils";

type WorkspaceMobileShortcutsProps = {
  /** Arzt: Übersicht → Dashboard; Team: → My Tasks */
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

  const isOverview =
    pathname.startsWith(overviewHref) ||
    (overviewHref === "/dashboard" && pathname === "/dashboard");
  const isInbox = pathname === "/inbox" || pathname.startsWith("/inbox/");
  const isRelay =
    pathname.startsWith("/relay") || pathname.startsWith("/my-tasks");
  const isJournal = pathname.startsWith("/journal");
  const isMore =
    pathname.startsWith("/settings") ||
    pathname.startsWith("/profile") ||
    pathname === "/datenschutz";

  const tabs = [
    {
      id: "overview",
      href: overviewHref,
      label: "Übersicht",
      icon: LayoutDashboard,
      active: isOverview,
      badge: undefined as number | undefined,
    },
    {
      id: "inbox",
      href: "/inbox",
      label: "Tracker",
      icon: ClipboardList,
      active: isInbox,
      badge: inboxBadge,
    },
    {
      id: "relay",
      href: "/relay",
      label: "Relay",
      icon: ListTodo,
      active: isRelay,
      badge: relayBadge,
    },
    ...(showJournal
      ? [
          {
            id: "journal",
            href: "/journal",
            label: "Journal",
            icon: BookOpen,
            active: isJournal,
            badge: undefined as number | undefined,
          },
        ]
      : []),
  ] as const;

  return (
    <nav
      className={cn("yd-ws-mobile-shortcuts md:hidden", className)}
      aria-label="Hauptnavigation"
    >
      {tabs.map((item) => {
        const Icon = item.icon;
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
            {item.badge != null && item.badge > 0 ? (
              <span className="yd-ws-mobile-shortcuts__badge" aria-label={`${item.badge} offen`}>
                {item.badge > 9 ? "9+" : item.badge}
              </span>
            ) : null}
          </Link>
        );
      })}
      <WorkspaceMobileMoreSheet active={isMore} />
    </nav>
  );
}
