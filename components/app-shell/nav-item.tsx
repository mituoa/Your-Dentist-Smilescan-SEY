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

import { YD } from "@/lib/design/yd-design-tokens";
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
}

export function NavItem({
  href,
  iconName,
  label,
  description,
  badge,
  badgeUrgent,
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
      className={cn(
        "group relative flex min-h-[48px] w-full touch-manipulation items-center gap-3 rounded-xl px-3 py-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(47,128,237,0.3)] md:min-h-0 md:w-11 md:flex-col md:justify-center md:px-0 md:py-0",
        !isActive && "hover:bg-white/35 md:hover:bg-transparent"
      )}
    >
      {isActive ? (
        <span
          className="pointer-events-none absolute left-1/2 top-[calc(100%-4px)] hidden h-10 w-9 -translate-x-1/2 md:block"
          style={{
            background:
              "linear-gradient(180deg, rgba(47,128,237,0.35) 0%, rgba(47,128,237,0.08) 55%, transparent 100%)",
            borderRadius: "50%",
            filter: "blur(6px)",
          }}
          aria-hidden
        />
      ) : null}

      <span
        className={cn(
          "relative z-[1] flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-all duration-200 md:h-11 md:w-11",
          isActive && "shadow-[0_6px_18px_rgba(30,91,189,0.4)]"
        )}
        style={
          isActive
            ? { background: YD.accent.navActive }
            : { backgroundColor: "transparent" }
        }
      >
        <Icon
          className="h-[22px] w-[22px]"
          strokeWidth={isActive ? 2.25 : 1.65}
          style={{ color: isActive ? "#FFFFFF" : YD.sidebar.iconIdle }}
        />
      </span>

      <div className="min-w-0 flex-1 text-left md:hidden">
        <span
          className={cn(
            "block truncate text-[14px] font-medium leading-snug",
            isActive ? "text-[#0F172A]" : "text-[#475569]"
          )}
        >
          {label}
        </span>
        {description ? (
          <span className="mt-0.5 block text-[12px] text-[#94A3B8]">{description}</span>
        ) : null}
      </div>
      {badge !== undefined && badge > 0 ? (
        <span className="z-[2] md:absolute md:-right-1 md:-top-0.5">
          <NavBadge count={badge} variant={badgeUrgent ? "urgent" : "default"} />
        </span>
      ) : null}
    </Link>
  );
}
