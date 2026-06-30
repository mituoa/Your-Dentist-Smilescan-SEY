"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import {
  BookOpen,
  CalendarDays,
  Home,
  MessageSquare,
  Settings,
  Users,
} from "lucide-react";

import { NavBadge } from "@/components/app-shell/nav-badge";
import { useLocale } from "@/components/i18n/locale-provider";
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
        "yd-mobile-bottom-nav__item yd-ambient-nav-link group relative flex min-w-0 flex-1 flex-col items-center justify-center touch-manipulation",
        active && "yd-nav-link-active yd-mobile-bottom-nav__item--active"
      )}
      aria-current={active ? "page" : undefined}
      title={label}
    >
      {active ? <span className="yd-nav-active-halo yd-mobile-bottom-nav__halo" aria-hidden /> : null}
      <span
        className={cn(
          "yd-nav-icon-shell yd-mobile-bottom-nav__icon-shell relative flex shrink-0 items-center justify-center rounded-full",
          active && "yd-nav-icon-shell--active"
        )}
      >
        <Icon
          className={cn("yd-mobile-bottom-nav__icon transition-colors duration-700", active && "yd-nav-icon--active")}
          strokeWidth={active ? 2 : 1.55}
          style={{ color: active ? YD.sidebar.iconActive : YD.sidebar.iconIdle }}
          aria-hidden
        />
        {badge != null && badge > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 z-[2] scale-90">
            <NavBadge count={badge} variant={badgeUrgent ? "urgent" : "default"} />
          </span>
        ) : null}
      </span>
      <span
        className={cn(
          "yd-mobile-bottom-nav__label max-w-full truncate font-medium leading-none tracking-[-0.01em]",
          active ? "text-[#1A4F9C]" : "text-[#64748B]"
        )}
      >
        {label}
      </span>
      {description ? <span className="sr-only">{description}</span> : null}
    </Link>
  );
}

/** Bottom-Rail — 6 Module nebeneinander (Arzt), kompakt wie Desktop-Sidebar. */
export function WorkspaceMobileShortcuts({
  role = "doctor",
  inboxBadge,
  relayBadge,
  relayBadgeUrgent = false,
  className,
}: WorkspaceMobileShortcutsProps) {
  const { messages } = useLocale();
  const pathname = usePathname() || "";

  const isRelayActive =
    pathname === "/relay" ||
    pathname.startsWith("/relay/") ||
    pathname === "/my-tasks" ||
    pathname.startsWith("/my-tasks/");

  const isSettingsActive = pathname === "/settings" || pathname === "/admin";
  const isProfileActive =
    pathname.startsWith("/profile") || pathname.startsWith("/doc/");
  const isJournalActive = pathname.startsWith("/journal");

  const doctorTabs: MobileNavTab[] = [
    {
      id: "atlas",
      href: "/dashboard",
      label: messages.nav.atlas,
      description: messages.nav.atlasDesc,
      icon: Home,
      active: pathname === "/dashboard" || pathname.startsWith("/dashboard/"),
    },
    {
      id: "tracker",
      href: "/inbox",
      label: messages.nav.tracker,
      description: messages.nav.trackerDesc,
      icon: Users,
      active: pathname === "/inbox" || pathname.startsWith("/inbox/"),
      badge: inboxBadge,
    },
    {
      id: "relay",
      href: "/relay",
      label: messages.nav.relay,
      description: messages.nav.relayDesc,
      icon: CalendarDays,
      active: isRelayActive,
      badge: relayBadge,
      badgeUrgent: relayBadgeUrgent,
    },
    {
      id: "profile",
      href: "/profile/editor",
      label: messages.nav.profile,
      description: messages.nav.profileDesc,
      icon: MessageSquare,
      active: isProfileActive,
    },
    {
      id: "journal",
      href: "/journal",
      label: messages.nav.careCenter,
      description: messages.nav.careCenterDesc,
      icon: BookOpen,
      active: isJournalActive,
    },
    {
      id: "admin",
      href: "/settings",
      label: messages.nav.admin,
      description: messages.nav.adminDesc,
      icon: Settings,
      active: isSettingsActive,
    },
  ];

  const teamTabs: MobileNavTab[] = [
    {
      id: "tracker",
      href: "/inbox",
      label: messages.nav.tracker,
      description: messages.nav.trackerDesc,
      icon: Users,
      active: pathname === "/inbox" || pathname.startsWith("/inbox/"),
      badge: inboxBadge,
    },
    {
      id: "relay",
      href: "/relay",
      label: messages.nav.relay,
      description: messages.nav.relayDesc,
      icon: CalendarDays,
      active: isRelayActive,
      badge: relayBadge,
      badgeUrgent: relayBadgeUrgent,
    },
  ];

  const tabs = role === "doctor" ? doctorTabs : teamTabs;

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const rail = (
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
        {tabs.map((tab) => (
          <MobileBottomNavItem key={tab.id} {...tab} />
        ))}
        {role === "team" ? (
          <WorkspaceMobileMoreSheet
            role={role}
            active={false}
            className="yd-mobile-bottom-nav__item yd-mobile-bottom-nav__item--more"
          />
        ) : null}
      </div>
    </nav>
  );

  if (!mounted) return null;

  return createPortal(rail, document.body);
}
