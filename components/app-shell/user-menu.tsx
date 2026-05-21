import Link from "next/link";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import type { ThemePreference } from "@/lib/theme";
import { cn } from "@/lib/utils";

interface UserMenuProps {
  email: string;
  workspaceName: string;
  role: "doctor" | "team";
  initialTheme: ThemePreference;
  avatarUrl?: string | null;
  displayName?: string | null;
  /** Mobile topbar: nur Avatar, einmalig oben rechts */
  variant?: "full" | "avatar";
}

function AvatarCircle({
  avatarUrl,
  initials,
  alt,
  className,
}: {
  avatarUrl?: string | null;
  initials: string;
  alt: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-full border border-white/70 bg-white/80 shadow-[0px_4px_12px_rgba(15,23,42,0.1)] ring-1 ring-slate-200/60",
        className
      )}
    >
      {avatarUrl ? (
        <img src={avatarUrl} alt={alt} className="h-full w-full object-cover" />
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-slate-100 text-xs font-semibold tracking-wide text-slate-700">
          {initials}
        </div>
      )}
    </div>
  );
}

export function UserMenu({
  email,
  workspaceName,
  role,
  initialTheme,
  avatarUrl,
  displayName,
  variant = "full",
}: UserMenuProps) {
  const fallbackBase = (displayName || workspaceName || email).trim();
  const initials = fallbackBase
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "U";
  const alt = displayName || workspaceName || "Konto";

  if (variant === "avatar") {
    return (
      <Link
        href="/settings"
        className="yd-user-menu-avatar shrink-0 touch-manipulation rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(47,128,237,0.2)]"
        aria-label={`Konto — ${alt}`}
      >
        <AvatarCircle avatarUrl={avatarUrl} initials={initials} alt={alt} className="h-9 w-9" />
      </Link>
    );
  }

  return (
    <div className="flex min-w-0 items-center gap-2 md:gap-3">
      <ThemeToggle initialTheme={initialTheme} />
      <div className="hidden text-right leading-tight sm:block">
        <div className="text-sm font-medium text-text-primary">
          {displayName || workspaceName}
        </div>
        <div className="text-xs text-text-tertiary">
          {role === "doctor" ? "Arzt" : "Team"}
        </div>
      </div>
      <Link
        href="/settings"
        className="shrink-0 rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(47,128,237,0.2)]"
        aria-label={`Konto — ${alt}`}
      >
        <AvatarCircle avatarUrl={avatarUrl} initials={initials} alt={alt} className="h-10 w-10" />
      </Link>
    </div>
  );
}
