"use client";

import { X } from "lucide-react";

import { BrandMark } from "./brand-mark";
import { NavItem } from "./nav-item";
import { JournalNavGroup } from "./journal-nav-group";
import { SignOutSidebarForm } from "./sign-out-form";
import { useMobileNavOptional } from "./mobile-nav";

export interface SidebarProps {
  role: "doctor" | "team";
  /** Unread inbox; omit when unknown or zero (no badge). */
  inboxCount?: number;
  myTasksCount: number;
  myTasksOverdueCount: number;
}

/** Desktop rail width — muss mit `SIDEBAR_MAIN_PAD` im geschützten Layout übereinstimmen. */
const RAIL =
  "w-full md:w-[72px] min-[420px]:md:w-[240px] lg:w-[256px]" as const;

export function Sidebar({
  role,
  inboxCount,
  myTasksCount,
  myTasksOverdueCount,
}: SidebarProps) {
  const myTasksUrgent = myTasksOverdueCount > 0;
  const mobileNav = useMobileNavOptional();

  return (
    <aside
      id="app-sidebar"
      className={`flex h-full min-h-0 ${RAIL} shrink-0 flex-col border-r border-[rgba(15,23,42,0.06)] bg-white/95 backdrop-blur-xl md:min-h-[100dvh]`}
    >
      <div className="shrink-0 px-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2 md:px-4 md:pb-3 md:pt-4">
        <div className="flex items-center justify-between gap-2 md:hidden">
          <BrandMark compact />
          <button
            type="button"
            onClick={() => mobileNav?.close()}
            className="inline-flex h-11 min-w-11 touch-manipulation items-center justify-center rounded-lg text-[#64748B] transition hover:bg-[rgba(15,23,42,0.04)] hover:text-[#0F172A]"
            aria-label="Menü schließen"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>
        <div className="hidden md:block">
          <BrandMark />
        </div>
      </div>

      <nav
        className="min-h-0 flex-1 space-y-0.5 overflow-y-auto overflow-x-hidden px-2 py-1 min-[420px]:md:space-y-1 min-[420px]:md:px-3 min-[420px]:md:py-2"
        aria-label="Hauptnavigation"
      >
        {role === "doctor" && (
          <NavItem
            href="/dashboard"
            iconName="dashboard"
            label="Atlas"
            description="Dashboard"
          />
        )}

        <NavItem
          href="/inbox"
          iconName="inbox"
          label="Tracker"
          description="Intake & Triage"
          badge={inboxCount}
        />

        <NavItem
          href="/relay"
          iconName="tasks"
          label="Relay"
          description="Aufgaben"
          badge={myTasksCount}
          badgeUrgent={myTasksUrgent}
        />

        {role === "doctor" && (
          <>
            <NavItem
              href="/profile/editor"
              iconName="profile"
              label="Benutzer"
              description="Profilverwaltung"
            />
            <JournalNavGroup />
            <NavItem
              href="/settings"
              iconName="settings"
              label="Admin"
              description="Einstellungen"
            />
          </>
        )}
      </nav>

      <div className="shrink-0 space-y-4 px-2 pb-[max(1rem,env(safe-area-inset-bottom))] pt-6 min-[420px]:md:px-3">
        <SignOutSidebarForm />
        <div className="px-1">
          <p className="text-[11px] font-medium leading-snug text-[#94A3B8]">Hilfe &amp; Support</p>
          <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-[#94A3B8]">
            v 0.1 · Alpha
          </p>
        </div>
      </div>
    </aside>
  );
}

/** Abstand für die Sidebar — mobil kein permanenter Rail; ab md wie zuvor. */
export const SIDEBAR_MAIN_PAD =
  "pl-0 md:pl-[72px] min-[420px]:md:pl-[240px] lg:pl-[256px]" as const;
