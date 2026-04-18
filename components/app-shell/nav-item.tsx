"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Inbox,
  UserCircle,
  BookOpen,
  Settings,
  ListChecks,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ICON_MAP: Record<string, LucideIcon> = {
  dashboard: LayoutDashboard,
  inbox: Inbox,
  profile: UserCircle,
  journal: BookOpen,
  settings: Settings,
  tasks: ListChecks,
};

interface NavItemProps {
  href: string;
  iconName: keyof typeof ICON_MAP;
  label: string;
  badge?: number;
}

export function NavItem({ href, iconName, label, badge }: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + "/");
  const Icon = ICON_MAP[iconName];

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-4 py-2.5 text-sm transition-colors rounded mx-2",
        isActive
          ? "bg-surface-sunken text-text-primary font-medium"
          : "text-text-secondary hover:text-text-primary hover:bg-surface-sunken/50"
      )}
    >
      <Icon className="w-4 h-4 shrink-0" strokeWidth={1.75} />
      <span className="flex-1">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="text-xs bg-brand text-white px-1.5 py-0.5 rounded">
          {badge}
        </span>
      )}
    </Link>
  );
}
