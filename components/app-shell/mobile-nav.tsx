"use client";

import { useEffect, useState } from "react";
import { LogOut, Menu, X } from "lucide-react";
import { NavItem } from "./nav-item";
import { JournalNavGroup } from "./journal-nav-group";
import { BrandMark } from "./brand-mark";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import type { ThemePreference } from "@/lib/theme";
import { signOut } from "@/app/(auth)/actions";

interface MobileNavProps {
  role: "doctor" | "team";
  /** Unread inbox count; omit when unknown or zero (no badge). */
  inboxCount?: number;
  myTasksCount: number;
  myTasksOverdueCount: number;
  initialTheme: ThemePreference;
  email: string;
  workspaceName: string;
  avatarUrl?: string | null;
  displayName?: string | null;
}

export function MobileNav({
  role,
  inboxCount,
  myTasksCount,
  myTasksOverdueCount,
  initialTheme,
  email,
  workspaceName,
  avatarUrl,
  displayName,
}: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const myTasksUrgent = myTasksOverdueCount > 0;

  const fallbackBase = (displayName || workspaceName || email).trim();
  const initials =
    fallbackBase
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("") || "U";

  useEffect(() => {
    if (!open) return;
    const prevBodyOverflow = document.body.style.overflow;
    const prevHtmlOverflow = document.documentElement.style.overflow;
    document.body.style.overflow = "hidden";
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevBodyOverflow;
      document.documentElement.style.overflow = prevHtmlOverflow;
    };
  }, [open]);

  return (
    <>
      <div className="sticky top-0 z-40 flex min-h-14 shrink-0 items-center justify-between gap-2 border-b border-white/45 bg-white/78 px-3 backdrop-blur-xl md:hidden sm:px-4">
        <BrandMark compact />
        <div className="flex items-center gap-1.5">
          <ThemeToggle initialTheme={initialTheme} />
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="flex h-11 min-h-[44px] w-11 min-w-[44px] items-center justify-center rounded-lg border border-white/70 bg-white/75 text-text-secondary transition-colors hover:bg-white hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
            aria-label={open ? "Menü schließen" : "Menü öffnen"}
            aria-expanded={open}
            aria-controls="mobile-drawer"
          >
            {open ? <X className="h-5 w-5" strokeWidth={1.75} /> : <Menu className="h-5 w-5" strokeWidth={1.75} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/20 backdrop-blur-[2px]"
            onClick={() => setOpen(false)}
            aria-label="Menü schließen"
          />

          <aside
            id="mobile-drawer"
            role="dialog"
            aria-modal="true"
            className="absolute left-0 top-0 flex h-full w-[min(calc(100vw-1rem),340px)] flex-col bg-white/92 pl-3 pr-3 backdrop-blur-xl shadow-[0_24px_60px_rgba(15,23,42,0.22)] ring-1 ring-slate-200/70 sm:pl-4 sm:pr-4"
            style={{
              paddingTop: "max(env(safe-area-inset-top), 0px)",
            }}
          >
            <div className="flex h-14 shrink-0 items-center justify-between gap-3 border-b border-slate-200/60">
              <BrandMark compact />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-11 min-h-[44px] w-11 min-w-[44px] items-center justify-center rounded-lg border border-slate-200/70 bg-white/70 text-slate-600 transition-colors hover:bg-white hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
                aria-label="Menü schließen"
              >
                <X className="h-5 w-5" strokeWidth={1.75} />
              </button>
            </div>

            <nav className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden py-3">
              <div className="space-y-0.5 pr-0.5" onClick={() => setOpen(false)}>
                {role === "doctor" && (
                  <NavItem href="/dashboard" iconName="dashboard" label="Atlas" />
                )}
                <NavItem
                  href="/inbox"
                  iconName="inbox"
                  label="Inbox"
                  badge={inboxCount}
                />
                <NavItem
                  href="/relay"
                  iconName="tasks"
                  label="Relay"
                  badge={myTasksCount}
                  badgeUrgent={myTasksUrgent}
                />
                {role === "doctor" && (
                  <>
                    <NavItem
                      href="/profile/editor"
                      iconName="profile"
                      label="Portrait"
                    />
                    <JournalNavGroup />
                    <NavItem href="/settings" iconName="settings" label="Settings" />
                  </>
                )}
              </div>
            </nav>

            <div
              className="shrink-0 space-y-4 border-t border-slate-200/50 pt-4"
              style={{
                paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
              }}
            >
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full border border-slate-200/70 bg-slate-50 ring-1 ring-slate-200/40">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={avatarUrl}
                      alt={displayName || workspaceName || ""}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-[13px] font-semibold tracking-wide text-slate-600">
                      {initials}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[15px] font-medium leading-snug text-slate-900">
                    {displayName || workspaceName || "Konto"}
                  </p>
                  {email ? (
                    <p className="mt-0.5 truncate text-[12px] leading-snug text-slate-500">
                      {email}
                    </p>
                  ) : null}
                  <p className="mt-0.5 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    {role === "doctor" ? "Arzt" : "Team"}
                  </p>
                </div>
              </div>

              <form action={signOut}>
                <button
                  type="submit"
                  className="flex min-h-[44px] w-full items-center gap-2 rounded-lg px-3 text-left text-[13px] font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 active:bg-slate-100/80"
                >
                  <LogOut className="h-4 w-4 shrink-0 opacity-70" strokeWidth={1.75} />
                  Abmelden
                </button>
              </form>

              <div className="flex items-center justify-between gap-3 pt-1">
                <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                  Erscheinungsbild
                </span>
                <ThemeToggle initialTheme={initialTheme} />
              </div>
            </div>
          </aside>
        </div>
      )}
    </>
  );
}
