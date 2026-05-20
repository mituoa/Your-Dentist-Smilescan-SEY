"use client";

import { X } from "lucide-react";

import { BrandMark } from "./brand-mark";
import { HcSidebarProfile } from "./hc-sidebar-profile";
import { YD } from "@/lib/design/yd-design-tokens";
import { NavItem } from "./nav-item";
import { JournalNavGroup } from "./journal-nav-group";
import { SignOutSidebarForm } from "./sign-out-form";
import { useMobileNavOptional } from "./mobile-nav";
import type { YdNavAmbientMap } from "@/lib/ambient/nav-preview-types";

export interface SidebarProps {
  role: "doctor" | "team";
  inboxCount?: number;
  myTasksCount: number;
  myTasksOverdueCount: number;
  avatarUrl?: string | null;
  displayName?: string | null;
  email?: string;
  navAmbient?: YdNavAmbientMap;
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
  navAmbient,
}: SidebarProps) {
  const myTasksUrgent = myTasksOverdueCount > 0;
  const mobileNav = useMobileNavOptional();

  return (
    <aside
      id="app-sidebar"
      className="yd-awaken-sidebar relative isolate flex h-full min-h-0 w-full shrink-0 flex-col overflow-hidden backdrop-blur-[22px] md:my-5 md:h-[calc(100dvh-2.5rem)] md:w-full md:overflow-visible md:rounded-[44px] md:border"
      style={{
        backgroundColor: YD.sidebar.glass,
        borderColor: YD.border.whisper,
        boxShadow: YD.shadow.sidebar,
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
        style={{ background: YD.sidebar.flow }}
        aria-hidden
      />
      <div
        className="yd-glow-pulse pointer-events-none absolute bottom-2 left-1/2 h-[55%] w-[85%] -translate-x-1/2 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(ellipse at center bottom, rgba(47,128,237,0.28) 0%, transparent 72%)",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-8 right-0 w-[2px] rounded-full"
        style={{ background: YD.sidebar.edgeGlow }}
        aria-hidden
      />

      <div className="relative shrink-0 px-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2 md:px-0 md:pt-7 md:pb-3">
        <div className="flex items-center justify-between gap-2 md:hidden">
          <BrandMark compact />
          <button
            type="button"
            onClick={() => mobileNav?.close()}
            className="inline-flex h-11 min-w-11 touch-manipulation items-center justify-center rounded-lg transition hover:bg-white/50"
            style={{ color: YD.text.muted }}
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
        className="relative flex min-h-0 flex-1 flex-col items-stretch gap-1 overflow-y-auto overflow-x-hidden px-3 py-2 md:items-center md:gap-4 md:px-2 md:py-5"
        aria-label="Hauptnavigation"
      >
        {role === "doctor" && (
          <NavItem
            href="/dashboard"
            iconName="dashboard"
            label="Atlas"
            description="Dashboard"
            ambientPreview={navAmbient?.dashboard}
          />
        )}

        <NavItem
          href="/inbox"
          iconName="inbox"
          label="Tracker"
          description="Einsendungen"
          badge={inboxCount}
          ambientPreview={navAmbient?.inbox}
        />

        <NavItem
          href="/relay"
          iconName="relay"
          label="Relay"
          description="Aufgaben"
          badge={myTasksCount}
          badgeUrgent={myTasksUrgent}
          ambientPreview={navAmbient?.relay}
        />

        {role === "doctor" && (
          <>
            <NavItem
              href="/profile/editor"
              iconName="profile"
              label="Profil"
              description="Benutzer"
            />
            <JournalNavGroup ambientPreview={navAmbient?.journal} />
            <NavItem
              href="/settings"
              iconName="settings"
              label="Admin"
              description="Einstellungen"
            />
          </>
        )}
      </nav>

      <div className="relative hidden shrink-0 flex-col items-center gap-3.5 px-2 pb-7 pt-2 md:flex">
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
