# Your Dentist — Premium Medical OS (YD)

**Version 1.0** · Mai 2026 · Dashboard foundation + Brand Bible

> **Full visual DNA:** [YOUR-DENTIST-BRAND-BIBLE.md](./YOUR-DENTIST-BRAND-BIBLE.md) (reverse-engineered, 41 sections)  
> **Token tables:** [DESIGN-TOKENS-REFERENCE.md](./DESIGN-TOKENS-REFERENCE.md)

## Vision

A **luxury clinical operating system** for modern dental practices — calm, luminous, trustworthy, spatial. Not generic SaaS, CRM, Jira, or finance dashboards.

**Emotional targets:** trust · calm · intelligence · precision · emotional safety · operational control

---

## Code map

| Layer | Path |
|-------|------|
| Tokens | `lib/design/yd-design-tokens.ts` (`YD`; legacy `HC`) |
| Motion | `lib/design/yd-motion.ts`, `lib/design/yd-workspace-awakening.ts` |
| CSS | `app/yd-workspace.css`, `app/yd-ambient.css`, `app/yd-dashboard.css` |
| Primitives | `components/design-system/` |
| Ambient OS | `components/ambient/` |
| Shell | `app/(protected)/layout.tsx` |
| Dashboard | `components/dashboard/hc/`, `app/(protected)/dashboard/page.tsx` |

See [IMPLEMENTATION-STATUS.md](./IMPLEMENTATION-STATUS.md) for live checklist.

---

## Color — atmospheric illumination

| Surface | Token / pattern |
|---------|-----------------|
| Page | `YD.atmosphere.pageGradient` — icy blue-grey, never flat `#FFF` page |
| Canvas island | `YD.atmosphere.canvas` + glow + vignette |
| Card default | `YD.surface.card` |
| Card primary (hero) | `YD.surface.cardPrimary` |
| Card quiet (secondary) | `YD.surface.cardQuiet` |
| Accent | `#2F80ED` → `#1A4F9C`, glow layers |

### Forbidden

Pure white app backgrounds · default `#2563eb` enterprise blue · harsh borders · dense equal widget grids

---

## Typography

| Role | Font | Class / rule |
|------|------|----------------|
| UI | DM Sans | Body, labels, data |
| Brand | Fraunces | Sidebar *Your* / **Dentist** |
| Dashboard title | medium 500 | `.yd-dash-title` |
| Section | medium 500 | `.yd-dash-section` |
| Labels | 12px muted blue-grey | `.yd-dash-label` |
| KPI | 28–38px medium, tabular | `.yd-dash-kpi`, `.yd-dash-kpi-hero` |

**Doctor header:** `formatDoctorDisplayName()` → `Dr. {Name}` on dashboard.

No oversized finance KPI typography. No aggressive bold hero lines.

---

## Layout — composition & tension

### Dashboard grid (current)

| Zone | Columns | Notes |
|------|---------|-------|
| KPI total | 3/12 | `quiet` |
| KPI unread (hero) | 5/12 | `primary`, lift, glow |
| KPI tasks | 4/12 | `quiet` |
| Analytics | 8/12 | `primary` |
| Arc | 4/12 | `quiet` |
| Table | 8/12 | `primary` |
| Calendar | 4/12 | `quiet` |

### Top workspace axis

- Reduced canvas + main padding (`.yd-awaken-canvas:has(.yd-dashboard)`)
- Header + search + controls on **one horizontal axis** (lg+)
- Tight gap header → KPI row (`.yd-dash-header-axis`)

### Sidebar alignment

- `md:mt-3` — starts with workspace, not “dropped”

---

## Sidebar — device-like rail

- Glass pill, flow gradient, bottom glow pulse
- Logo + `YourDentistWordmarkStack`
- Active: **ambient halo + glass icon shell** (no white selection block) — `app/yd-sidebar.css`
- Desktop: icon-only + **floating nav context panel** on hover

---

## Spatial OS motion

**Principle:** illumination & materialization — not web microinteractions.

### After login (~4.4s)

1. Background illuminate  
2. Canvas emerge  
3. Sidebar materialize  
4. Cards stagger (80ms steps)  
5. Charts illuminate  
6. Ambient settle  

Trigger: `?yd_enter=1` → session → `YdWorkspaceAwakening`

### Hover

- Depth via **light** (glow, brightness, inset edge)
- **No** translateY lift · **no** scale · **no** accordion `max-height`
- **Floating Context** (`YdFloatingContext`) — fixed layer, layout stable

### Forbidden

Bounce · scale-pop · fast 200ms hovers · Framer-demo energy · tooltip dropdowns

---

## Floating Context Previews

On KPI hover (desktop), a **floating illuminated surface** shows contextual data (patient, status, timing) without resizing cards.

Components: `yd-floating-context.tsx`, `dashboard-floating-preview.tsx`

---

## Tables & lists

- Soft separators, no spreadsheet grey head
- `YdStatusPill`: active · calm · urgent (calm, not alarming by default)
- Inbox rows: `.yd-inbox-row-ambient` spatial highlight

---

## Charts

Atmospheric integration — dot grid, soft bars, arc with glow filter. Support information; do not dominate like analytics SaaS.

---

## Product rollout

| Area | Status |
|------|--------|
| Dashboard | ✅ v0.5 reference |
| App shell / Sidebar | ✅ |
| Inbox | 🟡 YD shell, spatial rows |
| Relay / Tasks | 🟡 partial |
| Create Case, Public, Journals, Settings | ⬜ |
| Auth (login/register) | ⬜ unchanged |

---

## Medical SaaS compliance

- No unverified certification or fake statistics in UI  
- DSGVO-calm copy; no fear-based security language  
- Doctor naming: **Dr.** prefix where clinically appropriate  

---

## Reference material

`docs/design/reference/` · `docs/design/slices/` — visual DNA from Figma Healthcare Dashboard; implementation may exceed reference in atmosphere and polish.
