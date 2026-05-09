import { signOut } from "@/app/(auth)/actions";
import { LogOut } from "lucide-react";

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
      <form action={signOut}>
        <button
          type="submit"
          className="flex h-9 w-9 items-center justify-center rounded border border-white/70 bg-white/75 text-text-secondary shadow-[0px_6px_14px_rgba(15,23,42,0.08)] transition-colors hover:bg-white hover:text-text-primary"
          title="Abmelden"
        >
          <LogOut className="w-4 h-4" strokeWidth={1.75} />
        </button>
      </form>
    </div>
  );
}
