import { BrandMark } from "./brand-mark";
import { NavItem } from "./nav-item";
import { JournalNavGroup } from "./journal-nav-group";

export interface SidebarProps {
  role: "doctor" | "team";
  inboxCount: number;
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
    <aside className="sticky top-0 hidden h-screen w-80 flex-col border-r border-white/45 bg-white/72 shadow-[0px_20px_44px_rgba(15,23,42,0.08)] backdrop-blur-xl md:flex">
      <BrandMark />

      <nav className="flex-1 py-4 space-y-0.5">
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
          href="/my-tasks"
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

      <div className="p-4 border-t border-border">
        <div className="text-[10px] font-mono uppercase tracking-wider text-text-tertiary">
          v 0.1 · Alpha
        </div>
      </div>
    </aside>
  );
}
