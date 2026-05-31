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
      className="yd-awaken-sidebar yd-mobile-nav-sidebar relative isolate flex h-full min-h-0 w-full shrink-0 flex-col overflow-hidden backdrop-blur-[22px] max-md:h-full max-md:max-h-full max-md:bg-transparent max-md:shadow-none md:mt-3 md:mb-4 md:h-[calc(100dvh-1.75rem)] md:w-full md:overflow-visible md:rounded-[44px] md:border"
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

      <div className="relative shrink-0 px-4 pb-2 pt-5 md:px-0 md:pt-7 md:pb-3">
        <div className="flex items-center justify-between gap-2 md:hidden">
          <BrandMark compact />
          <button
            type="button"
            onClick={() => mobileNav?.close()}
            className="inline-flex h-10 min-w-10 touch-manipulation items-center justify-center rounded-xl transition hover:bg-[rgba(47,128,237,0.05)]"
            style={{ color: YD.text.muted }}
            aria-label="Navigation schließen"
          >
            <X className="h-[18px] w-[18px]" strokeWidth={1.85} />
          </button>
        </div>
        <div className="hidden md:flex md:justify-center">
          <BrandMark />
        </div>
      </div>

      <nav
        className="relative flex min-h-0 flex-1 flex-col overflow-y-auto overflow-x-hidden px-2.5 py-1.5 md:items-center md:gap-4 md:px-2 md:py-5"
        aria-label="Hauptnavigation"
      >
        <div className="yd-nav-primary-group flex flex-col gap-0.5 md:contents">
          {role === "doctor" && (
            <NavItem
              href="/dashboard"
              iconName="dashboard"
              label="Atlas"
              description="Praxisüberblick"
              ambientPreview={navAmbient?.dashboard}
              tier="primary"
            />
          )}

          <NavItem
            href="/inbox"
            iconName="inbox"
            label="Tracker"
            description="Einsendungen"
            badge={inboxCount}
            ambientPreview={navAmbient?.inbox}
            tier="primary"
          />

          <NavItem
            href="/relay"
            iconName="relay"
            label="Relay"
            description="Aufgaben & Nachrichten"
            badge={myTasksCount}
            badgeUrgent={myTasksUrgent}
            ambientPreview={navAmbient?.relay}
            tier="primary"
          />
        </div>

        {role === "doctor" && (
          <div className="yd-nav-secondary-group mt-2 flex flex-col gap-0.5 pt-2 md:contents md:mt-0 md:pt-0">
            <NavItem
              href="/profile/editor"
              iconName="profile"
              label="Profil"
              description="Benutzer"
              tier="secondary"
            />
            <JournalNavGroup ambientPreview={navAmbient?.journal} tier="secondary" />
            <NavItem
              href="/settings"
              iconName="settings"
              label="Admin"
              description="Einstellungen"
              tier="secondary"
            />
          </div>
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
      <div className="relative shrink-0 space-y-2.5 border-t border-[rgba(180,198,218,0.18)] px-3 pb-[max(0.875rem,env(safe-area-inset-bottom))] pt-3 md:hidden">
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
