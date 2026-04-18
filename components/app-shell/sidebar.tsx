import {
  LayoutDashboard,
  Inbox,
  UserCircle,
  BookOpen,
  Settings,
  ListChecks,
} from "lucide-react";
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
        <NavItem
          href="/dashboard"
          icon={LayoutDashboard}
          label="Dashboard"
        />
        <NavItem href="/inbox" icon={Inbox} label="Inbox" />

        {/* Team-Mitglieder sehen "My Tasks" statt der Profile/Journal */}
        {role === "team" && (
          <NavItem href="/my-tasks" icon={ListChecks} label="Meine Aufgaben" />
        )}

        <NavItem href="/profile" icon={UserCircle} label="Profil" />
        <NavItem href="/journal" icon={BookOpen} label="Journal" />
        <NavItem href="/settings" icon={Settings} label="Einstellungen" />
      </nav>

      <div className="p-4 border-t border-border">
        <div className="text-[10px] font-mono uppercase tracking-wider text-text-tertiary">
          v 0.1 · Alpha
        </div>
      </div>
    </aside>
  );
}
