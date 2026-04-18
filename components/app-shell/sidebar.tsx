import { BrandMark } from "./brand-mark";
import { NavItem } from "./nav-item";

interface SidebarProps {
  role: "doctor" | "team";
}

export function Sidebar({ role }: SidebarProps) {
  return (
    <aside className="hidden md:flex flex-col w-60 h-screen sticky top-0 bg-surface-card border-r border-border">
      <BrandMark />

      <nav className="flex-1 py-4 space-y-0.5">
        <NavItem href="/dashboard" iconName="dashboard" label="Dashboard" />
        <NavItem href="/inbox" iconName="inbox" label="Inbox" />

        {role === "team" && (
          <NavItem href="/my-tasks" iconName="tasks" label="Meine Aufgaben" />
        )}

        <NavItem href="/profile" iconName="profile" label="Profil" />
        <NavItem href="/journal" iconName="journal" label="Journal" />
        <NavItem href="/settings" iconName="settings" label="Einstellungen" />
      </nav>

      <div className="p-4 border-t border-border">
        <div className="text-[10px] font-mono uppercase tracking-wider text-text-tertiary">
          v 0.1 · Alpha
        </div>
      </div>
    </aside>
  );
}
