"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { NavItem } from "./nav-item";
import { JournalNavGroup } from "./journal-nav-group";
import { BrandMark } from "./brand-mark";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import type { ThemePreference } from "@/lib/theme";

interface MobileNavProps {
  role: "doctor" | "team";
  inboxCount: number;
  myTasksCount: number;
  myTasksOverdueCount: number;
  initialTheme: ThemePreference;
}

export function MobileNav({
  role,
  inboxCount,
  myTasksCount,
  myTasksOverdueCount,
  initialTheme,
}: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const myTasksUrgent = myTasksOverdueCount > 0;

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
      <div className="sticky top-0 z-40 flex h-14 shrink-0 items-center justify-between gap-2 border-b border-white/45 bg-white/78 px-4 backdrop-blur-xl md:hidden">
        <BrandMark compact />
        <div className="flex items-center gap-2">
          <ThemeToggle initialTheme={initialTheme} />
          <button
            type="button"
            onClick={() => setOpen(!open)}
            className="flex h-9 w-9 items-center justify-center rounded border border-white/70 bg-white/75 text-text-secondary transition-colors hover:bg-white hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
            aria-label={open ? "Menü schließen" : "Menü öffnen"}
            aria-expanded={open}
            aria-controls="mobile-drawer"
          >
            {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
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
            className="absolute left-0 top-0 h-full w-[min(86vw,340px)] bg-white/92 backdrop-blur-xl shadow-[0_24px_60px_rgba(15,23,42,0.22)] ring-1 ring-slate-200/70"
            style={{ paddingTop: "max(env(safe-area-inset-top), 0px)" }}
          >
            <div className="flex h-14 items-center justify-between gap-3 border-b border-slate-200/60 px-4">
              <BrandMark compact />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="flex h-9 w-9 items-center justify-center rounded border border-slate-200/70 bg-white/70 text-slate-600 transition-colors hover:bg-white hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
                aria-label="Menü schließen"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <nav className="px-2 py-3 overflow-y-auto" style={{ maxHeight: "calc(100vh - 56px)" }}>
              <div className="space-y-0.5" onClick={() => setOpen(false)}>
                {role === "doctor" && (
                  <NavItem href="/dashboard" iconName="dashboard" label="Atlas" />
                )}
                <NavItem
                  href="/inbox"
                  iconName="inbox"
                  label="SmileScan"
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

              <div className="mt-4 px-2">
                <div className="h-px w-full bg-slate-200/60" />
                <div className="pt-4 flex items-center justify-between">
                  <div className="text-[11px] font-medium text-slate-500">
                    Theme
                  </div>
                  <ThemeToggle initialTheme={initialTheme} />
                </div>
              </div>
            </nav>
          </aside>
        </div>
      )}
    </>
  );
}
