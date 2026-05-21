# YD — Implementierungsstand (Code)

**Aktualisiert:** Mai 2026

Legende: ✅ umgesetzt · 🟡 teilweise · ⬜ geplant

---

## Design-System-Kern

| Feature | Status | Dateien |
|---------|--------|---------|
| YD Tokens (`YD`) | ✅ | `lib/design/yd-design-tokens.ts` |
| Legacy `HC` Alias | ✅ | `lib/design/healthcare-dashboard-tokens.ts` |
| Workspace Canvas | ✅ | `components/design-system/yd-workspace-canvas.tsx` |
| Card tones (default/primary/quiet) | ✅ | `components/design-system/yd-card.tsx` |
| Status Pills | ✅ | `components/design-system/yd-status-pill.tsx` |
| Dashboard CSS layer | ✅ | `app/yd-dashboard.css` |
| Spatial OS CSS | ✅ | `app/yd-ambient.css` |
| Workspace CSS | ✅ | `app/yd-workspace.css` |

---

## Spatial OS & Interaktion

| Feature | Status | Dateien |
|---------|--------|---------|
| Post-login Awakening (~4.4s) | ✅ | `yd-workspace-awakening.tsx`, `yd-awaken-bootstrap.tsx`, `?yd_enter=1` |
| Staggered card reveal | ✅ | `yd-awaken-stagger.tsx` |
| Spatial hover (light, no lift/scale) | ✅ | `app/yd-ambient.css` `.yd-spatial-surface` |
| Floating Context Previews | ✅ | `yd-floating-context.tsx` |
| Nav hover intelligence | ✅ | `yd-nav-ambient-panel.tsx`, `build-nav-ambient-previews.ts` |
| `prefers-reduced-motion` | ✅ | `yd-ambient.css`, `yd-workspace.css` |

---

## App Shell

| Feature | Status | Dateien |
|---------|--------|---------|
| Ambient page gradient | ✅ | `app/(protected)/layout.tsx` |
| Floating sidebar (glass, glow) | ✅ | `components/app-shell/sidebar.tsx` |
| Your Dentist wordmark | ✅ | `components/brand/your-dentist-wordmark-stack.tsx` |
| Nav items + ambient panel | ✅ | `components/app-shell/nav-item.tsx` |
| Topbar hidden on dashboard (md+) | ✅ | `protected-topbar.tsx` |

---

## Dashboard (`/dashboard`)

| Feature | Status | Dateien |
|---------|--------|---------|
| Dr. display name | ✅ | `lib/format-doctor-display-name.ts`, `dashboard-header.tsx` |
| Tight top axis (header + search) | ✅ | `dashboard-header.tsx`, `yd-dashboard.css` |
| OS search surface | ✅ | `dashboard-header.tsx` |
| Asymmetric KPI layout (3/5/4) | ✅ | `app/(protected)/dashboard/page.tsx` |
| Hero KPI „Ungelesene Fälle“ | ✅ | `stat-card.tsx` tone=primary |
| Floating previews on KPIs | ✅ | `dashboard-floating-preview.tsx`, `stat-card.tsx` |
| Analytics chart (primary card) | ✅ | `analytics-bars.tsx` |
| Distribution arc (quiet) | ✅ | `distribution-arc.tsx` |
| Recent table + pills | ✅ | `recent-table.tsx` |
| Month calendar (quiet) | ✅ | `month-calendar.tsx` |

---

## Inbox (`/inbox`)

| Feature | Status | Dateien |
|---------|--------|---------|
| YD card list shell | ✅ | `app/(protected)/inbox/layout.tsx` |
| Spatial row hover | ✅ | `submission-list-item-figma.tsx` |
| Tracker shell | ✅ | `inbox-tracker-shell.tsx` |

---

## Relay / Tasks

| Feature | Status | Dateien |
|---------|--------|---------|
| Spatial row hover | ✅ | `components/my-tasks/task-list.tsx` |
| Full YD shell polish | 🟡 | Relay views — Tokens teilweise Legacy |

---

## Login (YD spatial entrance)

| Item | Status | Path |
|------|--------|------|
| Spatial login environment | ✅ | `components/auth/yd-login-environment.tsx` |
| Login awakening + tokens | ✅ | `app/yd-login.css` |
| Login page (auth preserved) | ✅ | `components/auth/login-page-client.tsx` |

## Noch nicht YD-ausgerollt

| Bereich | Route |
|---------|-------|
| Register | `/register` |
| Create Case | `/create-case` |
| Public Doctor Profile | `/doc/[slug]` |
| Patient Upload | `/doc/[slug]/upload` |
| Journals (public + editor) | `/journal`, `/journals` |
| Settings / Admin | `/settings`, `/admin` |

Rollout: gleiche `YD` Tokens + `YdCard` + `yd-dashboard.css` Patterns — keine Logik ändern.
