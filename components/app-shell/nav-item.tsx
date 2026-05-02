"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { NavBadge } from "./nav-badge";

const BRAND_MARK_BY_ROUTE: Record<string, { src: string; alt: string }> = {
  "/dashboard": { src: "/brand/atlas/logo-mark.svg", alt: "Atlas mark" },
  "/inbox": { src: "/brand/smilescan/logo-mark.svg", alt: "SmileScan mark" },
  "/my-tasks": { src: "/brand/relay/logo-mark.svg", alt: "Relay mark" },
  "/profile/editor": { src: "/brand/portrait/logo-mark.svg", alt: "Portrait mark" },
  "/journal": { src: "/brand/journals/logo-mark.svg", alt: "Journals mark" },
  "/settings": { src: "/brand/your-dentist/logo-mark.svg", alt: "Settings mark" },
};

interface NavItemProps {
  href: string;
  iconName: string;
  label: string;
  badge?: number;
  badgeUrgent?: boolean;
}

export function NavItem({
  href,
  label,
  badge,
  badgeUrgent,
}: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + "/");
  const brandMark = BRAND_MARK_BY_ROUTE[href] || {
    src: "/brand/your-dentist/logo-mark.svg",
    alt: `${label} mark`,
  };

  return (
    <Link
      href={href}
      className={cn(
        "mx-2 flex items-center gap-3 rounded-[10px] px-4 py-2.5 text-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30",
        isActive
          ? "bg-slate-700 text-white shadow-[0px_8px_22px_rgba(51,65,85,0.22)]"
          : "text-text-primary/80 hover:bg-white/75 hover:text-text-primary"
      )}
    >
      <img
        src={brandMark.src}
        alt={brandMark.alt}
        className="h-5 w-5 shrink-0 object-contain"
      />
      <span className="flex-1">{label}</span>
      {badge !== undefined && badge > 0 && (
        <NavBadge
          count={badge}
          variant={badgeUrgent ? "urgent" : "default"}
        />
      )}
    </Link>
  );
}
