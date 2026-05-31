"use client";

import { X } from "lucide-react";

import { BrandMark } from "./brand-mark";
import { DesktopCommandNavEntry } from "./desktop-command-nav-entry";
import { JournalNavGroup } from "./journal-nav-group";
import { MobileCommandNavEntry } from "./mobile-command-nav-entry";
import { YourDentistBrandLockup } from "@/components/brand/your-dentist-brand-lockup";
import { YD } from "@/lib/design/yd-design-tokens";
import { NavItem } from "./nav-item";
import { SignOutSidebarForm } from "./sign-out-form";
import { useMobileNavOptional } from "./mobile-nav";
import type { YdNavAmbientMap } from "@/lib/ambient/nav-preview-types";

export interface SidebarProps {
  role: "doctor" | "team";
  inboxCount?: number;
  myTasksCount: number;
  myTasksOverdueCount: number;
  navAmbient?: YdNavAmbientMap;
}

export const SIDEBAR_MAIN_PAD = "pl-0 md:pl-0" as const;

export function Sidebar({
  role,
  inboxCount,
  myTasksCount,
  myTasksOverdueCount,
  navAmbient,
}: SidebarProps) {
  const myTasksUrgent = myTasksOverdueCount > 0;
  const mobileNav = useMobileNavOptional();

  return (
    <aside
      id="app-sidebar"
      className="yd-awaken-sidebar yd-mobile-nav-sidebar relative isolate flex h-full min-h-0 w-full shrink-0 flex-col overflow-hidden backdrop-blur-[22px] max-md:h-full max-md:max-h-none max-md:bg-transparent max-md:shadow-none md:h-full md:w-full md:overflow-visible md:rounded-[40px] md:border md:self-stretch"
      style={{
        backgroundColor: YD.sidebar.glass,
        borderColor: YD.border.whisper,
        boxShadow: YD.shadow.sidebar,
      }}
    >
      <div
        className="pointer-events-none absolute inset-0 rounded-[inherit] max-md:opacity-90"
        style={{ background: YD.sidebar.flow }}
        aria-hidden
      />
      <div
        className="yd-glow-pulse pointer-events-none absolute bottom-2 left-1/2 hidden h-[40%] w-[70%] -translate-x-1/2 rounded-full blur-3xl opacity-60 md:block"
        style={{
          background:
            "radial-gradient(ellipse at center bottom, rgba(47,128,237,0.16) 0%, transparent 72%)",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-6 right-0 hidden w-[2px] rounded-full md:block"
        style={{ background: YD.sidebar.edgeGlow }}
        aria-hidden
      />

      <header className="yd-mobile-sidebar-drawer-head relative shrink-0 md:hidden">
        <div className="yd-mobile-drawer-brand min-w-0">
          <YourDentistBrandLockup size="sm" tagline="Praxis Workspace" />
        </div>
        <button
          type="button"
          onClick={() => mobileNav?.close()}
          className="yd-mobile-sidebar-close touch-manipulation"
          aria-label="Menü schließen"
        >
          <X className="h-[18px] w-[18px]" strokeWidth={1.85} />
        </button>
      </header>

      <div className="relative hidden shrink-0 md:flex md:justify-center md:px-0 md:pb-1 md:pt-3">
        <BrandMark />
      </div>

      <nav
        className="yd-mobile-sidebar-nav relative flex min-h-0 flex-1 flex-col overflow-hidden max-md:min-h-0 md:items-center md:justify-center md:gap-2 md:overflow-y-auto md:overflow-x-hidden md:px-2 md:py-2"
        aria-label="Hauptnavigation"
      >
        <div className="yd-mobile-sidebar-scroll min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain px-2 pb-2 pt-1 max-md:px-3 md:contents md:overflow-visible md:p-0">
          <div className="yd-nav-primary-group flex flex-col md:contents">
            {role === "doctor" && (
              <NavItem
                href="/dashboard"
                iconName="dashboard"
                label="Home"
                ambientPreview={navAmbient?.dashboard}
                tier="primary"
              />
            )}

            <NavItem
              href="/inbox"
              iconName="inbox"
              label="Patients"
              badge={inboxCount}
              ambientPreview={navAmbient?.inbox}
              tier="primary"
            />

            <NavItem
              href="/relay"
              iconName="relay"
              label="Relay"
              badge={myTasksCount}
              badgeUrgent={myTasksUrgent}
              ambientPreview={navAmbient?.relay}
              tier="primary"
            />

            <NavItem
              href="/my-tasks"
              iconName="tasks"
              label="Tasks"
              tier="primary"
            />

            <div className="hidden md:block">
              <DesktopCommandNavEntry />
            </div>
            <div className="md:hidden">
              <MobileCommandNavEntry />
            </div>
          </div>

          {role === "team" ? (
            <div className="yd-nav-secondary-group flex flex-col md:contents">
              <JournalNavGroup ambientPreview={navAmbient?.journal} tier="secondary" />
              <NavItem
                href="/settings"
                iconName="settings"
                label="Settings"
                tier="secondary"
              />
            </div>
          ) : (
            <div className="yd-nav-footer-group flex flex-col md:contents">
              <NavItem
                href="/settings"
                iconName="settings"
                label="Settings"
                tier="secondary"
              />
            </div>
          )}
        </div>
      </nav>

      <div className="yd-sidebar-rail-footer relative hidden shrink-0 px-2 pb-4 pt-1 md:flex md:justify-center">
        <SignOutSidebarForm variant="rail" />
      </div>

      <footer className="yd-mobile-sidebar-footer relative shrink-0 md:hidden">
        <SignOutSidebarForm variant="rail" />
      </footer>
    </aside>
  );
}
