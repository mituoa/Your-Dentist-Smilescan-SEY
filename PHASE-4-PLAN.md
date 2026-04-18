# PHASE 4 — App-Shell mit 5-Punkte-Navigation

> **Für Cursor Agent:** Arbeite diesen Plan autonom ab. Wir bauen die zentrale App-Navigation, in die wir ab Phase 5 die echten Screens einbauen.

> **Für den Menschen:** Nach dieser Phase hast du eine Sidebar mit 5 Punkten und leere Platzhalter-Seiten für alle Bereiche. Die echten Inhalte kommen in den späteren Phasen.

---

## Was gebaut wird

| Datei | Zweck |
|---|---|
| `app/(protected)/layout.tsx` | UPDATE — Sidebar + Header statt nur Header |
| `components/app-shell/sidebar.tsx` | Die 5-Punkte-Sidebar |
| `components/app-shell/nav-item.tsx` | Einzelner Navigations-Link |
| `components/app-shell/user-menu.tsx` | Logout + User-Info oben rechts |
| `components/app-shell/brand-mark.tsx` | SmileScan-Logo oben links |
| `app/(protected)/dashboard/page.tsx` | UPDATE — Platzhalter für Phase 5 |
| `app/(protected)/inbox/page.tsx` | Platzhalter für Phase 6 |
| `app/(protected)/profile/page.tsx` | Platzhalter für Phase 8 |
| `app/(protected)/journal/page.tsx` | Platzhalter für Phase 9 |
| `app/(protected)/settings/page.tsx` | Platzhalter für Phase 10 |
| `app/(protected)/my-tasks/page.tsx` | Platzhalter für Phase 11 (nur Team sichtbar) |

---

## Schritt 1 — Icons Setup

`lucide-react` ist bereits in Phase 1 installiert. Wir nutzen es direkt.

---

## Schritt 2 — Brand Mark Komponente

### Datei: `components/app-shell/brand-mark.tsx`

```typescript
import Link from "next/link";

export function BrandMark() {
  return (
    <Link
      href="/dashboard"
      className="flex items-center gap-2.5 px-4 h-14 border-b border-border"
    >
      <div className="w-7 h-7 rounded bg-brand flex items-center justify-center">
        <span className="text-white font-medium text-sm">S</span>
      </div>
      <span className="font-serif text-lg font-light tracking-tight text-text-primary">
        SmileScan
      </span>
    </Link>
  );
}
```

---

## Schritt 3 — Nav Item Komponente

### Datei: `components/app-shell/nav-item.tsx`

```typescript
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavItemProps {
  href: string;
  icon: LucideIcon;
  label: string;
  badge?: number;
}

export function NavItem({ href, icon: Icon, label, badge }: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-4 py-2.5 text-sm transition-colors rounded mx-2",
        isActive
          ? "bg-surface-sunken text-text-primary font-medium"
          : "text-text-secondary hover:text-text-primary hover:bg-surface-sunken/50"
      )}
    >
      <Icon className="w-4 h-4 shrink-0" strokeWidth={1.75} />
      <span className="flex-1">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="text-xs bg-brand text-white px-1.5 py-0.5 rounded">
          {badge}
        </span>
      )}
    </Link>
  );
}
```

---

## Schritt 4 — Sidebar Komponente

### Datei: `components/app-shell/sidebar.tsx`

```typescript
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
```

---

## Schritt 5 — User Menu (Logout)

### Datei: `components/app-shell/user-menu.tsx`

```typescript
import { signOut } from "@/app/(auth)/actions";
import { LogOut } from "lucide-react";

interface UserMenuProps {
  email: string;
  workspaceName: string;
  role: "doctor" | "team";
}

export function UserMenu({ email, workspaceName, role }: UserMenuProps) {
  return (
    <div className="flex items-center gap-4">
      <div className="text-right">
        <div className="text-sm text-text-primary font-medium">
          {workspaceName}
        </div>
        <div className="text-xs text-text-tertiary">
          {email} · {role === "doctor" ? "Arzt" : "Team"}
        </div>
      </div>
      <form action={signOut}>
        <button
          type="submit"
          className="flex items-center justify-center w-9 h-9 rounded border border-border text-text-secondary hover:text-text-primary hover:bg-surface-sunken transition-colors"
          title="Abmelden"
        >
          <LogOut className="w-4 h-4" strokeWidth={1.75} />
        </button>
      </form>
    </div>
  );
}
```

---

## Schritt 6 — Mobile Top-Bar (für kleine Screens)

### Datei: `components/app-shell/mobile-nav.tsx`

```typescript
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
```

---

## Schritt 7 — Protected Layout UPDATE

### Datei: `app/(protected)/layout.tsx` (komplett ersetzen)

```typescript
import { requireUser, getCurrentWorkspace } from "@/lib/auth-helpers";
import { Sidebar } from "@/components/app-shell/sidebar";
import { MobileNav } from "@/components/app-shell/mobile-nav";
import { UserMenu } from "@/components/app-shell/user-menu";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const workspace = await getCurrentWorkspace();

  const role = (workspace?.role || "team") as "doctor" | "team";
  // @ts-expect-error - workspaces is joined
  const workspaceName = workspace?.workspaces?.name || "Unbekannt";

  return (
    <div className="min-h-screen bg-surface-page">
      {/* Mobile nav at top */}
      <MobileNav role={role} />

      <div className="flex">
        {/* Desktop sidebar (hidden on mobile) */}
        <Sidebar role={role} />

        <div className="flex-1 flex flex-col min-h-screen">
          {/* Header with user info */}
          <header className="hidden md:flex h-14 border-b border-border bg-surface-card px-6 items-center justify-end sticky top-0 z-30">
            <UserMenu
              email={user.email || ""}
              workspaceName={workspaceName}
              role={role}
            />
          </header>

          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}
```

---

## Schritt 8 — Dashboard-Seite (Platzhalter für Phase 5)

### Datei: `app/(protected)/dashboard/page.tsx` (ersetzen)

```typescript
import { getCurrentUser, getCurrentWorkspace } from "@/lib/auth-helpers";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const workspace = await getCurrentWorkspace();

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <div className="mb-12">
        <p className="text-xs font-mono uppercase tracking-wider text-text-tertiary mb-3">
          Dashboard · Phase 5
        </p>
        <h1 className="font-serif text-5xl font-light tracking-tight text-text-primary mb-4">
          Willkommen
        </h1>
        <p className="text-text-secondary max-w-xl">
          Hier entstehen drei ruhige Info-Blöcke: neue Einsendungen, offene
          Aufgaben, letzte Aktivität. Kommt in der nächsten Phase.
        </p>
      </div>

      <div className="bg-surface-card border border-border rounded-lg p-6 space-y-3">
        <h2 className="text-sm font-medium text-text-primary mb-4">
          Session aktiv
        </h2>
        <div className="text-sm space-y-2">
          <div>
            <span className="text-text-tertiary">Email: </span>
            <span className="text-text-primary">{user?.email}</span>
          </div>
          {workspace && (
            <>
              <div>
                <span className="text-text-tertiary">Workspace: </span>
                <span className="text-text-primary">
                  {/* @ts-expect-error - workspaces is joined */}
                  {workspace.workspaces?.name}
                </span>
              </div>
              <div>
                <span className="text-text-tertiary">Rolle: </span>
                <span className="text-text-primary">
                  {workspace.role === "doctor" ? "Arzt" : "Team-Mitglied"}
                </span>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

## Schritt 9 — Platzhalter für Inbox

### Datei: `app/(protected)/inbox/page.tsx`

```typescript
export default function InboxPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <p className="text-xs font-mono uppercase tracking-wider text-text-tertiary mb-3">
        Inbox · Phase 6
      </p>
      <h1 className="font-serif text-5xl font-light tracking-tight text-text-primary mb-4">
        Einsendungen
      </h1>
      <p className="text-text-secondary max-w-xl">
        Hier entsteht die chronologische Liste aller Foto-Einsendungen. Mit
        Vorschau, Zeitstempel und Indikator für ungesehen/gesehen.
      </p>
    </div>
  );
}
```

---

## Schritt 10 — Platzhalter für Profil

### Datei: `app/(protected)/profile/page.tsx`

```typescript
export default function ProfilePage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <p className="text-xs font-mono uppercase tracking-wider text-text-tertiary mb-3">
        Profil · Phase 8
      </p>
      <h1 className="font-serif text-5xl font-light tracking-tight text-text-primary mb-4">
        Öffentliches Profil
      </h1>
      <p className="text-text-secondary max-w-xl">
        Hier entsteht der Editor für das, was Patienten auf /doc/[slug] sehen.
        Vita, Dienstleistungen, Workspace, Kontakt.
      </p>
    </div>
  );
}
```

---

## Schritt 11 — Platzhalter für Journal

### Datei: `app/(protected)/journal/page.tsx`

```typescript
export default function JournalPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <p className="text-xs font-mono uppercase tracking-wider text-text-tertiary mb-3">
        Journal · Phase 9
      </p>
      <h1 className="font-serif text-5xl font-light tracking-tight text-text-primary mb-4">
        Journal
      </h1>
      <p className="text-text-secondary max-w-xl">
        Hier entsteht die Liste der Artikel und der Rich-Text-Editor für neue
        Einträge.
      </p>
    </div>
  );
}
```

---

## Schritt 12 — Platzhalter für Settings

### Datei: `app/(protected)/settings/page.tsx`

```typescript
export default function SettingsPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <p className="text-xs font-mono uppercase tracking-wider text-text-tertiary mb-3">
        Einstellungen · Phase 10
      </p>
      <h1 className="font-serif text-5xl font-light tracking-tight text-text-primary mb-4">
        Einstellungen
      </h1>
      <p className="text-text-secondary max-w-xl">
        Hier entstehen Gruppen für Account, Workspace, Terminlink, Team,
        Erscheinungsbild, Billing und Benachrichtigungen.
      </p>
    </div>
  );
}
```

---

## Schritt 13 — Platzhalter für My Tasks (nur für Team)

### Datei: `app/(protected)/my-tasks/page.tsx`

```typescript
import { getCurrentWorkspace } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";

export default async function MyTasksPage() {
  const workspace = await getCurrentWorkspace();

  // Arzt hat kein "My Tasks" - er sieht Tasks die er verteilt hat im Dashboard
  if (workspace?.role === "doctor") {
    redirect("/dashboard");
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <p className="text-xs font-mono uppercase tracking-wider text-text-tertiary mb-3">
        Meine Aufgaben · Phase 11
      </p>
      <h1 className="font-serif text-5xl font-light tracking-tight text-text-primary mb-4">
        Meine Aufgaben
      </h1>
      <p className="text-text-secondary max-w-xl">
        Hier sieht ein Team-Mitglied alle Aufgaben, die an "alle" oder
        speziell an diese Person verteilt wurden.
      </p>
    </div>
  );
}
```

---

## Schritt 14 — Test und Commit

### Test im Terminal

```bash
npm run dev
```

### Manueller Test im Browser

1. Login mit dem Test-User aus Phase 3
2. Prüfe:
   - Sidebar links sichtbar mit 5 Punkten (als doctor)
   - Aktiver Punkt (Dashboard) hervorgehoben
   - Klick auf Inbox → URL ändert sich, Inbox-Platzhalter sichtbar, Inbox jetzt aktiv
   - Klick auf Profile, Journal, Settings → jeweils Platzhalter-Seiten
   - Header oben rechts zeigt Workspace-Name, Email, Rolle
   - Logout-Button funktioniert
3. Browser-Fenster schmaler ziehen (< 768px) → Sidebar verschwindet, Top-Bar mit Menu-Button erscheint
4. Menu-Button klicken → Mobile-Overlay mit Nav-Punkten

### Commit

```bash
git add .
git commit -m "feat: phase 4 — app shell with 5-point navigation"
```

---

## Schritt 15 — STOP und Übergabe

Melde dem Menschen:

"Phase 4 — App-Shell ist fertig. Du kannst jetzt zwischen Dashboard, Inbox, Profil, Journal und Settings navigieren. Alle Seiten sind noch Platzhalter, die in den nächsten Phasen mit echtem Inhalt gefüllt werden.

Teste bitte:
- Login und prüfe ob alle 5 Sidebar-Punkte navigieren
- Browser verschmälern, Mobile-Nav prüfen
- Logout funktioniert"

---

## Bei Fehlern

### "Type error: Cannot find module 'lucide-react'"
Installieren: `npm install lucide-react`

### Sidebar zeigt sich nicht
Prüfe, ob die Browser-Breite > 768px ist. Unter 768px ist sie per Tailwind `hidden md:flex` versteckt — stattdessen Mobile-Nav oben.

### "workspaces is undefined"
Der Signup-Trigger hat nicht funktioniert. Phase 3 Test nochmal durchführen — mit funktionierendem Account sollte das passen.

---

*Ende Phase 4*
