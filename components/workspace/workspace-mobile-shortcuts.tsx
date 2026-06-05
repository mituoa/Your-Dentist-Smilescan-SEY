"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  CalendarDays,
  Home,
  MessageSquare,
  Settings,
  Users,
} from "lucide-react";

import { NavBadge } from "@/components/app-shell/nav-badge";
import { YD } from "@/lib/design/yd-design-tokens";
import { cn } from "@/lib/utils";

import { WorkspaceMobileMoreSheet } from "./workspace-mobile-more-sheet";

type MobileNavTab = {
  id: string;
  href: string;
  label: string;
  description?: string;
  icon: typeof Home;
  active: boolean;
  badge?: number;
  badgeUrgent?: boolean;
};

type WorkspaceMobileShortcutsProps = {
  role?: "doctor" | "team";
  inboxBadge?: number;
  relayBadge?: number;
  relayBadgeUrgent?: boolean;
  className?: string;
};

function MobileBottomNavItem({
  href,
  label,
  description,
  icon: Icon,
  active,
  badge,
  badgeUrgent,
}: Omit<MobileNavTab, "id">) {
  return (
    <Link
      href={href}
      className={cn(
        "yd-mobile-bottom-nav__item yd-ambient-nav-link group relative flex min-w-0 flex-1 flex-col items-center justify-center gap-0.5 touch-manipulation",
        active && "yd-nav-link-active yd-mobile-bottom-nav__item--active"
      )}
      aria-current={active ? "page" : undefined}
      title={label}
    >
      {active ? (
        <>
          <span className="yd-nav-active-halo yd-mobile-bottom-nav__halo" aria-hidden />
        </>
      ) : null}
      <span
        className={cn(
          "yd-nav-icon-shell yd-mobile-bottom-nav__icon-shell relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full",
          active && "yd-nav-icon-shell--active"
        )}
      >
        <Icon
          className={cn("h-[22px] w-[22px] transition-colors duration-700", active && "yd-nav-icon--active")}
          strokeWidth={active ? 2 : 1.55}
          style={{ color: active ? YD.sidebar.iconActive : YD.sidebar.iconIdle }}
          aria-hidden
        />
        {badge != null && badge > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 z-[2]">
            <NavBadge count={badge} variant={badgeUrgent ? "urgent" : "default"} />
          </span>
        ) : null}
      </span>
      <span
        className={cn(
          "yd-mobile-bottom-nav__label max-w-full truncate text-[10px] font-medium leading-tight tracking-[-0.01em]",
          active ? "text-[#1A4F9C]" : "text-[#64748B]"
        )}
      >
        {label}
      </span>
      {description ? (
        <span className="sr-only">{description}</span>
      ) : null}
    </Link>
  );
}

/** Bottom-Rail — dieselbe Navigations-DNA wie Desktop-Sidebar (WhatsApp-Position). */
export function WorkspaceMobileShortcuts({
  role = "doctor",
  inboxBadge,
  relayBadge,
  relayBadgeUrgent = false,
  className,
}: WorkspaceMobileShortcutsProps) {
  const pathname = usePathname() || "";

  const isRelayActive =
    pathname === "/relay" ||
    pathname.startsWith("/relay/") ||
    pathname === "/my-tasks" ||
    pathname.startsWith("/my-tasks/");

  const isSettingsActive = pathname === "/settings" || pathname === "/admin";

  const primaryTabs: MobileNavTab[] =
    role === "doctor"
      ? [
          {
            id: "atlas",
            href: "/dashboard",
            label: "Atlas",
            description: "Praxisüberblick",
            icon: Home,
            active: pathname === "/dashboard" || pathname.startsWith("/dashboard/"),
          },
          {
            id: "tracker",
            href: "/inbox",
            label: "Tracker",
            description: "Patientenfälle",
            icon: Users,
            active: pathname === "/inbox" || pathname.startsWith("/inbox/"),
            badge: inboxBadge,
          },
          {
            id: "relay",
            href: "/relay",
            label: "Relay",
            description: "Aufgaben & Nachrichten",
            icon: CalendarDays,
            active: isRelayActive,
            badge: relayBadge,
            badgeUrgent: relayBadgeUrgent,
          },
        ]
      : [
          {
            id: "tracker",
            href: "/inbox",
            label: "Tracker",
            description: "Patientenfälle",
            icon: Users,
            active: pathname === "/inbox" || pathname.startsWith("/inbox/"),
            badge: inboxBadge,
          },
          {
            id: "relay",
            href: "/relay",
            label: "Relay",
            description: "Aufgaben & Nachrichten",
            icon: CalendarDays,
            active: isRelayActive,
            badge: relayBadge,
            badgeUrgent: relayBadgeUrgent,
          },
        ];

  const moreActive =
    pathname.startsWith("/profile") ||
    pathname.startsWith("/doc/") ||
    pathname.startsWith("/journal") ||
    isSettingsActive;

  return (
    <nav
      className={cn("yd-mobile-bottom-rail md:hidden", className)}
      aria-label="Hauptnavigation"
      style={
        {
          ["--yd-sidebar-glass" as string]: YD.sidebar.glass,
          ["--yd-sidebar-border" as string]: YD.border.whisper,
          ["--yd-sidebar-shadow" as string]: YD.shadow.sidebar,
        } as React.CSSProperties
      }
    >
      <div className="yd-mobile-bottom-rail__surface">
        <div className="yd-mobile-bottom-rail__glow" aria-hidden />
        {primaryTabs.map((tab) => (
          <MobileBottomNavItem key={tab.id} {...tab} />
        ))}
        <WorkspaceMobileMoreSheet
          role={role}
          active={moreActive}
          className="yd-mobile-bottom-nav__item yd-mobile-bottom-nav__item--more"
        />
      </div>
    </nav>
  );
}

/** Icons für More-Sheet — Sidebar Sekundärnavigation */
export const MOBILE_MORE_SECONDARY_ICONS = {
  profile: MessageSquare,
  journal: BookOpen,
  settings: Settings,
} as const;
