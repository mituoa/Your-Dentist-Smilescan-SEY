import { SignOutIconForm } from "@/components/app-shell/sign-out-form";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import type { ThemePreference } from "@/lib/theme";

interface UserMenuProps {
  email: string;
  workspaceName: string;
  role: "doctor" | "team";
  initialTheme: ThemePreference;
  avatarUrl?: string | null;
  displayName?: string | null;
}

export function UserMenu({
  email,
  workspaceName,
  role,
  initialTheme,
  avatarUrl,
  displayName,
}: UserMenuProps) {
  const fallbackBase = (displayName || workspaceName || email).trim();
  const initials = fallbackBase
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("") || "U";

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
      <div className="h-10 w-10 overflow-hidden rounded-full border border-white/70 bg-white/80 shadow-[0px_6px_14px_rgba(15,23,42,0.12)] ring-1 ring-slate-200/60">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={displayName || workspaceName || "Profilbild"}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-slate-100 text-xs font-semibold tracking-wide text-slate-700">
            {initials}
          </div>
        )}
      </div>
      <SignOutIconForm />
    </div>
  );
}
