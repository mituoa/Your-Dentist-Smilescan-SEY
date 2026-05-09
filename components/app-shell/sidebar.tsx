import { BrandMark } from "./brand-mark";
import { NavItem } from "./nav-item";
import { JournalNavGroup } from "./journal-nav-group";

export interface SidebarProps {
  role: "doctor" | "team";
  /** Unread inbox; omit when unknown or zero (no badge). */
  inboxCount?: number;
  myTasksCount: number;
  myTasksOverdueCount: number;
}

/** Breite muss mit `pl-*` im geschützten Layout identisch bleiben. */
const RAIL =
  "w-[72px] min-[420px]:w-[240px] lg:w-[260px] xl:w-[280px]" as const;

export function Sidebar({
  role,
  inboxCount,
  myTasksCount,
  myTasksOverdueCount,
}: SidebarProps) {
  const myTasksUrgent = myTasksOverdueCount > 0;

  return (
    <aside
      className={`fixed inset-y-0 left-0 z-20 flex ${RAIL} shrink-0 flex-col border-r bg-white/95 backdrop-blur-xl`}
      style={{ borderColor: "#EEF2F6" }}
    >
      <div
        className="flex shrink-0 flex-col border-b max-[419px]:items-center max-[419px]:justify-center max-[419px]:py-3 min-[420px]:block"
        style={{ borderColor: "#EEF2F6" }}
      >
        <div className="hidden min-[420px]:block">
          <BrandMark />
        </div>
        <div className="flex min-[420px]:hidden justify-center px-2">
          <BrandMark compact />
        </div>
      </div>

      <nav className="min-h-0 flex-1 space-y-2 overflow-y-auto overflow-x-hidden px-2 pt-4 pb-4 min-[420px]:px-4">
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
        className="shrink-0 space-y-2 border-t px-2 py-4 max-[419px]:text-center min-[420px]:px-4"
        style={{ borderColor: "#EEF2F6", paddingBottom: "max(1rem, env(safe-area-inset-bottom))" }}
      >
        <div className="mx-2 text-[11px] font-medium text-[#94A3B8] max-[419px]:hidden">
          Hilfe &amp; Support
        </div>
        <div className="mx-2 font-mono text-[10px] uppercase tracking-wider text-[#94A3B8] max-[419px]:mx-0 max-[419px]:text-[9px]">
          v 0.1 · Alpha
        </div>
      </div>
    </aside>
  );
}

/** Abstand für die fixierte Sidebar — Werte wie in `RAIL` in dieser Datei. */
export const SIDEBAR_MAIN_PAD =
  "pl-[72px] min-[420px]:pl-[240px] lg:pl-[260px] xl:pl-[280px]" as const;
