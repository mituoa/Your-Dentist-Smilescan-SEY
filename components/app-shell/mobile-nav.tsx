"use client";

import { useState } from "react";
import {
  LayoutDashboard,
  Inbox,
  UserCircle,
  BookOpen,
  Settings,
  ListChecks,
  Menu,
  X,
} from "lucide-react";
import { NavItem } from "./nav-item";
import { BrandMark } from "./brand-mark";

interface MobileNavProps {
  role: "doctor" | "team";
}

export function MobileNav({ role }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="md:hidden flex items-center justify-between px-4 h-14 border-b border-border bg-surface-card">
        <BrandMark />
        <button
          onClick={() => setOpen(!open)}
          className="w-9 h-9 flex items-center justify-center rounded border border-border"
          aria-label="Menu"
        >
          {open ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {open && (
        <div className="md:hidden fixed inset-0 top-14 bg-surface-page z-40">
          <nav className="py-4 space-y-0.5" onClick={() => setOpen(false)}>
            <NavItem href="/dashboard" icon={LayoutDashboard} label="Dashboard" />
            <NavItem href="/inbox" icon={Inbox} label="Inbox" />
            {role === "team" && (
              <NavItem href="/my-tasks" icon={ListChecks} label="Meine Aufgaben" />
            )}
            <NavItem href="/profile" icon={UserCircle} label="Profil" />
            <NavItem href="/journal" icon={BookOpen} label="Journal" />
            <NavItem href="/settings" icon={Settings} label="Einstellungen" />
          </nav>
        </div>
      )}
    </>
  );
}
