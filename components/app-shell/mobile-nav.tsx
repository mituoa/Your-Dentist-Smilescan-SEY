"use client";

import { useState } from "react";
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

  return (
    <>
      <div className="flex h-14 items-center justify-between gap-2 border-b border-white/45 bg-white/78 px-4 backdrop-blur-xl md:hidden">
        <BrandMark compact />
        <div className="flex items-center gap-2">
          <ThemeToggle initialTheme={initialTheme} />
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex h-9 w-9 items-center justify-center rounded border border-white/70 bg-white/75 text-text-secondary transition-colors hover:bg-white hover:text-text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/30"
          aria-label="Menu"
        >
          {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 top-14 z-40 bg-gradient-to-br from-slate-50/95 via-white/95 to-blue-50/90 backdrop-blur-xl md:hidden">
          <nav className="space-y-0.5 px-2 py-4" onClick={() => setOpen(false)}>
            {role === "doctor" && (
              <NavItem
                href="/dashboard"
                iconName="dashboard"
                label="Atlas"
              />
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
                <NavItem
                  href="/settings"
                  iconName="settings"
                  label="Settings"
                />
              </>
            )}
          </nav>
        </div>
      )}
    </>
  );
}
