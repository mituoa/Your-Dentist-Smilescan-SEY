"use client";

import { X } from "lucide-react";

import { BrandMark } from "./brand-mark";
import { NavItem } from "./nav-item";
import { JournalNavGroup } from "./journal-nav-group";
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
      className={`flex h-full min-h-0 ${RAIL} shrink-0 flex-col border-r bg-white/95 backdrop-blur-xl md:min-h-[100dvh]`}
      style={{ borderColor: "#EEF2F6" }}
    >
      <div
        className="flex shrink-0 flex-col border-b md:block"
        style={{ borderColor: "#EEF2F6" }}
      >
        <div className="flex items-center justify-between gap-2 px-3 py-3 md:hidden">
          <BrandMark compact />
          <button
            type="button"
            onClick={() => mobileNav?.close()}
            className="inline-flex h-11 min-w-11 touch-manipulation items-center justify-center rounded-xl text-[#64748B] transition hover:bg-[#F8FAFC] hover:text-[#0F172A]"
            aria-label="Menü schließen"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>
        <div className="hidden md:block">
          <BrandMark />
        </div>
      </div>

      <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto overflow-x-hidden px-2 pt-3 pb-4 min-[420px]:md:space-y-2 min-[420px]:md:px-4 min-[420px]:md:pt-4">
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

      <div
        className="shrink-0 space-y-2 border-t px-2 py-4 min-[420px]:md:px-4"
        style={{
          borderColor: "#EEF2F6",
          paddingBottom: "max(1rem, env(safe-area-inset-bottom))",
        }}
      >
        <div className="mx-2 hidden text-[11px] font-medium text-[#94A3B8] md:block">
          Hilfe &amp; Support
        </div>
        <div className="mx-2 font-mono text-[10px] uppercase tracking-wider text-[#94A3B8] max-md:mx-1 md:mx-2">
          v 0.1 · Alpha
        </div>
      </div>
    </aside>
  );
}

/** Abstand für die Sidebar — mobil kein permanenter Rail; ab md wie zuvor. */
export const SIDEBAR_MAIN_PAD =
  "pl-0 md:pl-[72px] min-[420px]:md:pl-[240px] lg:pl-[256px]" as const;
