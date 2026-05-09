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

export function Sidebar({
  role,
  inboxCount,
  myTasksCount,
  myTasksOverdueCount,
}: SidebarProps) {
  const myTasksUrgent = myTasksOverdueCount > 0;

  return (
    <aside className="sticky top-0 hidden h-screen w-[280px] flex-col border-r bg-white/95 backdrop-blur-xl md:flex"
      style={{ borderColor: "#EEF2F6" }}
    >
      <BrandMark />

      <nav className="flex-1 px-4 pt-6 pb-4 space-y-2">
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

      <div className="px-4 py-4 border-t space-y-2" style={{ borderColor: "#EEF2F6" }}>
        <div className="mx-2 text-[11px] font-medium text-[#94A3B8]">Hilfe &amp; Support</div>
        <div className="mx-2 text-[10px] font-mono uppercase tracking-wider text-[#94A3B8]">
          v 0.1 · Alpha
        </div>
      </div>
    </aside>
  );
}
