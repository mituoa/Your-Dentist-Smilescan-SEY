"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NavBadge } from "./nav-badge";

const BRAND_MARK_BY_ROUTE: Record<string, { src: string; alt: string }> = {
  "/dashboard": { src: "/brand/atlas/logo-mark.svg", alt: "Atlas mark" },
  "/inbox": { src: "/brand/smilescan/logo-mark.svg", alt: "SmileScan mark" },
  "/my-tasks": { src: "/brand/relay/logo-mark.svg", alt: "Relay mark" },
  "/relay": { src: "/brand/relay/logo-mark.svg", alt: "Relay mark" },
  "/profile/editor": { src: "/brand/portrait/logo-mark.svg", alt: "Portrait mark" },
  "/journal": { src: "/brand/journals/logo-mark.svg", alt: "Journals mark" },
  "/settings": { src: "/brand/your-dentist/logo-mark.svg", alt: "Settings mark" },
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
  label,
  description,
  badge,
  badgeUrgent,
}: NavItemProps) {
  const pathname = usePathname();
  const isRelayNav = href === "/relay";
  const isSettingsNav = href === "/settings";
  const isActive = isRelayNav
    ? pathname === "/relay" ||
      pathname.startsWith("/relay/") ||
      pathname === "/my-tasks" ||
      pathname.startsWith("/my-tasks/")
    : isSettingsNav
      ? pathname === "/settings" || pathname === "/admin"
      : pathname === href || pathname.startsWith(href + "/");
  const brandMark = BRAND_MARK_BY_ROUTE[href] || {
    src: "/brand/your-dentist/logo-mark.svg",
    alt: `${label} mark`,
  };

  return (
    <Link
      href={href}
      className={cn(
        "relative mx-2 flex items-center gap-3.5 rounded-xl px-3 py-2.5 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30",
        isActive ? "bg-[#EEF6FF]" : "hover:bg-[#F8FAFC]"
      )}
    >
      {isActive ? (
        <span className="absolute left-[6px] top-1/2 h-5 w-0.5 -translate-y-1/2 rounded bg-[#2F80ED]" />
      ) : null}
      <img
        src={brandMark.src}
        alt={brandMark.alt}
        className={cn(
          "h-8 w-8 shrink-0 object-contain opacity-80",
          isActive && "opacity-100"
        )}
      />
      <div className="flex-1 min-w-0 text-left">
        <span
          className={cn(
            "block truncate text-[15px] font-medium",
            isActive ? "text-[#1E293B]" : "text-[#64748B]"
          )}
        >
          {label}
        </span>
        {description ? (
          <span
            className={cn(
              "block truncate text-[11px] font-medium",
              isActive ? "text-[#64748B]" : "text-[#94A3B8]"
            )}
          >
            {description}
          </span>
        ) : null}
      </div>
      {badge !== undefined && badge > 0 && (
        <NavBadge
          count={badge}
          variant={badgeUrgent ? "urgent" : "default"}
        />
      )}
    </Link>
  );
}
