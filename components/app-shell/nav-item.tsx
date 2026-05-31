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
  type LucideIcon,
} from "lucide-react";

import { YdNavAmbientPanel } from "@/components/ambient/yd-nav-ambient-panel";
import { YD } from "@/lib/design/yd-design-tokens";
import type { YdNavAmbientPreview } from "@/lib/ambient/nav-preview-types";
import { cn } from "@/lib/utils";
import { NavBadge } from "./nav-badge";

const ICON_BY_NAME: Record<string, LucideIcon> = {
  dashboard: Home,
  inbox: Users,
  tasks: CalendarDays,
  relay: CalendarDays,
  profile: MessageSquare,
  settings: Settings,
  journal: BookOpen,
};

interface NavItemProps {
  href: string;
  iconName: string;
  label: string;
  description?: string;
  badge?: number;
  badgeUrgent?: boolean;
  ambientPreview?: YdNavAmbientPreview;
  /** Mobile: primary workflow vs quieter secondary destinations */
  tier?: "primary" | "secondary";
}

export function NavItem({
  href,
  iconName,
  label,
  description,
  badge,
  badgeUrgent,
  ambientPreview,
  tier = "primary",
}: NavItemProps) {
  const pathname = usePathname();
  const Icon = ICON_BY_NAME[iconName] ?? Home;
  const isRelayNav = href === "/relay";
  const isSettingsNav = href === "/settings";
  const isCreateCaseNav = href === "/create-case";
  const isActive = isRelayNav
    ? pathname === "/relay" ||
      pathname.startsWith("/relay/") ||
      pathname === "/my-tasks" ||
      pathname.startsWith("/my-tasks/")
    : isSettingsNav
      ? pathname === "/settings" || pathname === "/admin"
      : isCreateCaseNav
        ? pathname === "/create-case"
        : pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      title={label}
      data-active={isActive ? "true" : "false"}
      className={cn(
        "yd-ambient-nav-link group relative flex w-full touch-manipulation items-center transition-[filter] duration-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(47,128,237,0.18)]",
        "min-h-[44px] gap-2.5 rounded-[14px] px-2.5 py-1.5",
        "md:min-h-0 md:w-11 md:flex-col md:justify-center md:gap-0 md:rounded-none md:bg-transparent md:px-0 md:py-0",
        tier === "secondary" && "yd-nav-tier-secondary",
        isActive && "yd-nav-link-active"
      )}
    >
      {isActive ? (
        <>
          <span className="yd-nav-active-halo" aria-hidden />
          <span className="yd-nav-active-trace" aria-hidden />
        </>
      ) : null}

      <span
        className={cn(
          "yd-nav-icon-shell flex h-10 w-10 shrink-0 items-center justify-center rounded-full md:h-11 md:w-11",
          isActive && "yd-nav-icon-shell--active"
        )}
        style={
          isActive
            ? undefined
            : { backgroundColor: "transparent" }
        }
      >
        <Icon
          className={cn(
            "h-5 w-5 transition-[color,filter] duration-700 md:h-[22px] md:w-[22px]",
            isActive && "yd-nav-icon--active"
          )}
          strokeWidth={isActive ? 2 : 1.55}
          style={{ color: isActive ? YD.sidebar.iconActive : YD.sidebar.iconIdle }}
        />
      </span>

      <div className="min-w-0 flex-1 text-left md:hidden">
        <span
          className={cn(
            "yd-nav-label block truncate text-[13px] font-medium leading-snug transition-colors duration-700",
            isActive ? "text-[#1A4F9C]" : "text-[#475569]"
          )}
        >
          {label}
        </span>
        {description ? (
          <span className="yd-nav-desc mt-0.5 block text-[11px] leading-snug text-[#94A8B8]">
            {description}
          </span>
        ) : null}
      </div>
      {badge !== undefined && badge > 0 ? (
        <span className="z-[2] md:absolute md:-right-1 md:-top-0.5">
          <NavBadge count={badge} variant={badgeUrgent ? "urgent" : "default"} />
        </span>
      ) : null}

      {ambientPreview ? <YdNavAmbientPanel preview={ambientPreview} /> : null}
    </Link>
  );
}
