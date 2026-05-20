"use client";

import { X } from "lucide-react";

import { BrandMark } from "./brand-mark";
import { HcSidebarProfile } from "./hc-sidebar-profile";
import { HC } from "@/lib/design/healthcare-dashboard-tokens";
import { NavItem } from "./nav-item";
import { JournalNavGroup } from "./journal-nav-group";
import { SignOutSidebarForm } from "./sign-out-form";
import { useMobileNavOptional } from "./mobile-nav";

export interface SidebarProps {
  role: "doctor" | "team";
  inboxCount?: number;
  myTasksCount: number;
  myTasksOverdueCount: number;
  avatarUrl?: string | null;
  displayName?: string | null;
  email?: string;
}

export const SIDEBAR_MAIN_PAD = "pl-0 md:pl-0" as const;

export function Sidebar({
  role,
  inboxCount,
  myTasksCount,
  myTasksOverdueCount,
  avatarUrl,
  displayName,
  email = "",
}: SidebarProps) {
  const myTasksUrgent = myTasksOverdueCount > 0;
  const mobileNav = useMobileNavOptional();

  return (
    <aside
      id="app-sidebar"
      className="relative isolate flex h-full min-h-0 w-full shrink-0 flex-col overflow-hidden md:my-4 md:h-[calc(100dvh-2rem)] md:w-full md:rounded-[40px] md:border md:backdrop-blur-[18px]"
      style={{
        backgroundColor: HC.sidebarGlass,
        borderColor: HC.sidebarBorder,
        boxShadow: HC.sidebarShadow,
      }}
    >
      {/* Verlauf nach unten — Referenz-Flow */}
      <div
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
        style={{ background: HC.sidebarFlowGradient }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 left-1/2 top-[18%] w-[72%] -translate-x-1/2 rounded-full opacity-70 blur-2xl"
        style={{
          background:
            "radial-gradient(ellipse at center bottom, rgba(30,91,189,0.22) 0%, transparent 68%)",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-6 right-0 w-[2px] rounded-full opacity-50"
        style={{ background: HC.sidebarEdgeGlow }}
        aria-hidden
      />

      <div className="relative shrink-0 px-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2 md:px-0 md:pt-6 md:pb-2">
        <div className="flex items-center justify-between gap-2 md:hidden">
          <BrandMark compact />
          <button
            type="button"
            onClick={() => mobileNav?.close()}
            className="inline-flex h-11 min-w-11 touch-manipulation items-center justify-center rounded-lg text-[#64748B] transition hover:bg-white/50"
            aria-label="Menü schließen"
          >
            <X className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>
        <div className="hidden md:flex md:justify-center">
          <BrandMark />
        </div>
      </div>

      <nav
        className="relative flex min-h-0 flex-1 flex-col items-stretch gap-1 overflow-y-auto overflow-x-hidden px-3 py-2 md:items-center md:gap-3 md:px-1.5 md:py-3"
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
          description="Einsendungen"
          badge={inboxCount}
        />

        <NavItem
          href="/relay"
          iconName="relay"
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
              label="Profil"
              description="Benutzer"
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

      <div className="relative hidden shrink-0 flex-col items-center gap-3 px-2 pb-6 pt-1 md:flex">
        <SignOutSidebarForm variant="rail" />
        <HcSidebarProfile
          avatarUrl={avatarUrl}
          displayName={displayName}
          email={email}
        />
      </div>
      <div className="relative shrink-0 space-y-3 px-3 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 md:hidden">
        <SignOutSidebarForm />
        <HcSidebarProfile
          avatarUrl={avatarUrl}
          displayName={displayName}
          email={email}
        />
      </div>
    </aside>
  );
}
