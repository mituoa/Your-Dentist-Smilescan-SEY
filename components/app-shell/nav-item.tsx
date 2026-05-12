"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NavBadge } from "./nav-badge";

const BRAND_MARK_BY_ROUTE: Record<string, { src: string; alt: string }> = {
  "/dashboard": { src: "/brand/atlas/logo-mark.svg", alt: "Atlas mark" },
  "/inbox": { src: "/brand/your-dentist/logo-mark.svg", alt: "Inbox" },
  "/create-case": { src: "/brand/your-dentist/logo-mark.svg", alt: "Neuer Fall" },
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
  const brandMark = BRAND_MARK_BY_ROUTE[href] || {
    src: "/brand/your-dentist/logo-mark.svg",
    alt: `${label} mark`,
  };

  return (
    <Link
      href={href}
      className={cn(
        "relative flex min-h-[48px] touch-manipulation items-center gap-3 rounded-lg px-3 py-2.5 transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(15,23,42,0.1)] md:min-h-[44px] md:py-2",
        isActive ? "bg-[rgba(47,128,237,0.06)]" : "hover:bg-[rgba(15,23,42,0.03)]"
      )}
    >
      {isActive ? (
        <span className="absolute left-1 top-1/2 h-[22px] w-0.5 -translate-y-1/2 rounded-full bg-[#2F80ED]/90" />
      ) : null}
      <img
        src={brandMark.src}
        alt={brandMark.alt}
        className={cn(
          "h-7 w-7 shrink-0 object-contain opacity-75",
          isActive && "opacity-100"
        )}
      />
      <div className="min-w-0 flex-1 text-left">
        <span
          className={cn(
            "block truncate text-[14px] font-medium leading-snug tracking-[-0.01em]",
            isActive ? "text-[#0F172A]" : "text-[#475569]"
          )}
        >
          {label}
        </span>
        {description ? (
          <span
            className={cn(
              "mt-0.5 block line-clamp-2 text-left text-[12px] font-normal leading-snug",
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
