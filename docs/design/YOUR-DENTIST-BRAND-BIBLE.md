# Your Dentist — Brand Bible & Visual System

**Version:** 1.0 (reverse-engineered from live dashboard)  
**Stand:** Mai 2026  
**Source of truth:** Current implementation — `app/(protected)/dashboard`, `lib/design/yd-design-tokens.ts`, `app/yd-*.css`, `components/dashboard/hc/`, `components/design-system/`, `components/ambient/`

> **Purpose:** Lock the *existing* dashboard atmosphere into a scalable master system. This document does **not** propose a redesign. It extracts visual DNA so every future page can match the same premium medical OS feeling **1:1**.

**Companion files:** [YOUR-DENTIST-DESIGN-SYSTEM.md](./YOUR-DENTIST-DESIGN-SYSTEM.md) (technical index) · [BRAND-GUIDE.md](./BRAND-GUIDE.md) (quick checklist) · [DESIGN-TOKENS-REFERENCE.md](./DESIGN-TOKENS-REFERENCE.md) (token tables)

---

## Executive analysis — why the dashboard feels premium

The current Atlas dashboard avoids generic SaaS through **five simultaneous mechanisms**:

1. **Atmospheric layering** — The app is never a flat white page. A cool blue-grey **page gradient** wraps a **rounded canvas island** (`md:rounded-[52px]`), which holds **gradient cards** with inset top highlights and soft blue shadows. Depth comes from *light*, not from harsh borders or Material elevation steps.

2. **Asymmetric composition** — KPIs use a **3 / 5 / 4** column split with one **hero** card (`tone="primary"`, larger KPI, optional `glow`). Charts and table occupy **8** columns; calendar and arc sit in **4**. Equal widget grids are deliberately avoided.

3. **Calm typography** — **DM Sans** at weights **400–500** only (no finance-style 700+ KPIs). Titles use negative letter-spacing and medium weight. **Fraunces** is reserved for brand moments (sidebar wordmark), not body UI.

4. **Spatial OS motion** — Interactions change **illumination** (box-shadow, radial `::before` pools, brightness) over **720ms** curves. No card lift (`translateY`), no scale pops, no 200ms snappy hovers. Post-login **layered materialization** (~4.4s) reinforces “device boot,” not “page load.”

5. **Clinical emotional tone** — Copy is German, operational, non-alarmist (`Praxisüberblick`, `Dr. {Name}`, status pills **calm by default**). Trust comes from restraint, not from security badges or marketing claims.

**Forbidden drift:** pure `#FFFFFF` app backgrounds · flat `#2563EB` corporate blue · dense equal grids · bold hero headlines · bounce/scale hovers · white sidebar selection blocks · unverified compliance claims.

---

## 1. Brand identity

| Dimension | Current expression |
|-----------|-------------------|
| **Name** | Your Dentist |
| **Category** | Premium medical SaaS / clinical operating system for dental practices |
| **Visual metaphor** | Luxury medical device UI + futuristic calm OS rail — not admin panel, CRM, or finance dashboard |
| **Primary locale** | German (de-DE dates, clinical copy) |
| **Trust signals** | Clarity, calm hierarchy, honest partial-load states — **not** fake certifications |

**Logo / mark:** `BrandMark` + `YourDentistWordmarkStack` — Fraunces wordmark, medical-blue mark, sidebar-centered on desktop.

**Code:** `components/app-shell/brand-mark.tsx`, `components/brand/your-dentist-wordmark-stack.tsx`

---

## 2. Emotional design language

| Emotion | How the UI achieves it |
|---------|------------------------|
| **Calm** | Slow motion (720ms+), muted blue-greys, no alarm-red unless `urgent` variant |
| **Trust** | Layered surfaces, soft shadows, `Dr.` prefix, neutral recovery copy |
| **Intelligence** | Floating context on hover, nav ambient previews, operational subtitles |
| **Precision** | Tabular KPI numerals, room IDs, scannable table metadata |
| **Safety** | Status pills default to `active`/`calm`, not screaming red |
| **Control** | Clear zones (header axis → KPIs → analytics → table/calendar) |

**Avoid:** hype adjectives, fear-based security copy, startup gradients, “dashboard excitement.”

---

## 3. Product personality

- **Who it speaks to:** Dentists and practice teams managing submissions, relay tasks, profiles, journals.
- **Voice:** Professional, quiet, operational — *„Ruhiger Überblick für {Praxis}“*, not marketing slogans.
- **Role naming:** Dashboard = **Atlas**; Inbox = **Tracker**; tasks = **Relay**.
- **Authority:** `formatDoctorDisplayName()` → **`Dr. {Name}`** on dashboard header (never strip title for “modern” minimalism).

---

## 4. Clinical UX philosophy

1. **Information supports action** — KPIs link to footnotes and optional floating previews; table rows link to `/inbox/[id]`.
2. **No false success** — Partial dashboard load shows explicit status with links to Inbox/Relay (`dashboard/page.tsx`).
3. **Scannable clinical data** — Patient name primary, email secondary, room-style fall IDs, relative timestamps in previews.
4. **Calm urgency** — Unread counts can be hero-weighted; copy stays procedural (*„Priorität für klinische Sichtung“*).
5. **DSGVO-aligned tone** — factual, no exaggerated security promises (see `AGENTS.md`).

---

## 5. Visual design principles

1. **Atmosphere over flat UI** — Always stack: page → canvas → card → content.
2. **Light as depth** — Shadows include blue tint + inset white top edge; hover adds radial glow, not lift.
3. **Hierarchy through tone** — `default` | `primary` | `quiet` card tones, not random border colors.
4. **Asymmetry creates luxury** — Hero column wider; secondary modules quieter.
5. **Restrained accent** — `#2F80ED` core, deep navy `#1A4F9C` for charts/labels — never neon.
6. **Whitespace is operational** — Zones separated by `2.25–2.75rem` margin, not divider lines everywhere.

---

## 6. Spatial composition rules

### Layer stack (outside → inside)

```
┌─ Page: YD.atmosphere.pageGradient (full viewport)
│  ┌─ Sidebar: glass rail (108px, rounded 44px, floating md:mt-3)
│  └─ Main column
│     └─ Canvas island: YD.atmosphere.canvas, radius 52px, island shadow
│        └─ .yd-dashboard (max-width 1340px)
│           ├─ Ambient orbs (absolute, blurred)
│           ├─ Header axis
│           ├─ KPI zone (12-col)
│           ├─ Charts zone
│           └─ Table + calendar zone
```

### Alignment rules

- Sidebar and canvas **start together** (`md:mt-3` on sidebar) — no “dropped” rail.
- Dashboard content **centered** with `maxWidth: YD.space.contentMax` (1340px).
- Header: left **48%** title block / right search + controls on `lg+` (`dashboard-header.tsx`).

### Breathing room

| Element | Spacing |
|---------|---------|
| Canvas padding (dashboard) | `0.75–1.125rem` top (tighter than default canvas) |
| Zone margin | `2.25rem` → `2.75rem` at `lg` (`.yd-dash-zone`) |
| Header → KPIs | `1.125rem` (`.yd-dash-header-axis`) |
| KPI grid gap | `1.25rem` → `1.5rem` at `lg` |
| Lower grid gap | `1.75rem` → `2rem` at `lg` |

---

## 7. Layout philosophy

- **One dominant scroll container** — `main` in protected layout; canvas does not create nested scroll hell on desktop.
- **Page-owned chrome** — Dashboard header lives *inside* the page, not only in global topbar (`ProtectedTopbar` hidden on `md+` for dashboard context).
- **Grid-first** — Tailwind `lg:grid-cols-12` with explicit spans; mobile stacks single column.
- **Content max width** — Prevents ultra-wide readability loss on large monitors.

---

## 8. Dashboard tension system

**Tension** = contrast between hero and supporting elements *without* loud color.

| Element | Tension mechanism |
|---------|-------------------|
| Hero KPI (unread) | `lg:col-span-5`, `tone="primary"`, `hero`, `lift`, `glow`, `yd-dash-kpi-hero` |
| Quiet KPIs | `col-span-3` / `4`, `tone="quiet"`, smaller KPI (`.yd-dash-kpi-quiet`) |
| Analytics | `primary` tone, large total number in section |
| Arc / calendar | `quiet` tone, `lg:pt-3` / `lg:pt-4` vertical offset for rhythm |
| Table | `primary` — operational anchor |
| Ambient orbs | Top-right cyan, bottom-left blue — visual weight without data |

---

## 9. Negative space philosophy

- **Let the canvas breathe** — Cards float inside icy gradient; gaps between zones are as important as card content.
- **Do not fill every column** — 4-column sidebar of calendar balances 8-column table; empty space on page gradient is intentional.
- **Meta text is small and tracked** — Reserves visual weight for KPI numbers and patient names.
- **Icons in KPI** — Single gradient orb per card, not icon clutter.

---

## 10. Typography system

### Font families

| Role | Family | Variable | Weights loaded |
|------|--------|----------|----------------|
| **UI / data** | DM Sans | `--font-dm-sans` | 400, 500 |
| **Brand** | Fraunces | `--font-fraunces` | 300, 400, 500 (+ italic) |
| **Mono** (code elsewhere) | JetBrains Mono | `--font-jetbrains-mono` | 400, 500 |

**Application:** `.yd-workspace { font-family: var(--font-dm-sans) }` · `.yd-font-brand` for Fraunces.

### Dashboard type scale (`.yd-dashboard` in `app/yd-dashboard.css`)

| Class | Size | Weight | Letter-spacing | Color token | Use |
|-------|------|--------|----------------|-------------|-----|
| `.yd-dash-title` | 1.4–1.75rem | 500 | -0.028em | `#0c1929` | Greeting headline |
| `.yd-dash-subtitle` | 13px | 400 | 0.01em | `#3d5266` | Praxis subtitle |
| `.yd-dash-section` | 15px (0.9375rem) | 500 | -0.02em | title | Card section titles |
| `.yd-dash-label` | 12px | 500 | 0.02em | `#6b849c` | KPI labels |
| `.yd-dash-meta` | 11px (0.6875rem) | 500 | 0.04em | `#8ba3b8` | Metadata, table head, preview labels |
| `.yd-dash-kpi` | 28–30px | 500 | -0.035em | title | Standard KPI |
| `.yd-dash-kpi-hero` | 34–38px | 500 | -0.04em | title | Hero KPI |
| `.yd-dash-kpi-quiet` | 26px | 500 | -0.03em | `#1a3348` | Quiet KPI |

**Numeric:** `font-variant-numeric: tabular-nums` on KPIs.

### Why it feels calm / medical / premium

- **Calm:** No 700–800 weights; 500 maximum reads as confident, not shouting.
- **Medical:** Compact meta, uppercase section labels with tracking evoke clinical charts, not consumer apps.
- **Premium:** Negative tracking on large sizes + Fraunces brand contrast = editorial, not template Inter Bold.
- **Anti-SaaS:** Avoids oversized KPI hero (48px+) and all-caps dashboard titles.

### Sidebar typography

- Mobile nav labels: `14px font-medium`, active `#1A4F9C`, idle `#475569`.
- Nav preview panel: `10px` uppercase title, `12px` body lines.

---

## 11. Color system

### Core palette (from `YD`)

| Token | Hex / value | Role |
|-------|-------------|------|
| `YD.text.primary` | `#0C1929` | Headlines, KPI |
| `YD.text.secondary` | `#3D5266` | Body, preview secondary |
| `YD.text.muted` | `#5E7389` | Table IDs, labels |
| `YD.text.faint` | `#8BA3B8` | Meta, placeholders |
| `YD.accent.core` | `#2F80ED` | Links, active icon |
| `YD.accent.deep` | `#1A4F9C` | Chart bars, active labels |
| `YD.accent.light` | `#7EB8FF` | Chart soft stops |
| `YD.accent.ice` | `#B8DCFF` | Highlights |
| `YD.atmosphere.page` | `#9AABB9` | Base page tone |
| `YD.surface.sunken` | `#D8E4EF` | Sunken / search adjacency |

### Status colors (soft pills — not alarm UI)

| Variant | Background | Text |
|---------|------------|------|
| urgent | `#FEE8E8` | `#B91C1C` |
| active | `#E0EDFE` | `#1D4ED8` |
| calm | `#E0F2F5` | `#0E7490` |
| done | `#DCFCE7` | `#15803D` |
| pending | `#FEF3C7` | `#B45309` |

---

## 12. Ambient gradient system

### Page (`YD.atmosphere.pageGradient`)

- Radial cyan-blue top-right + soft cyan bottom-left + linear `#A3B3C2 → #8E9EAE`.
- **Never** replace with flat `#F8FAFC`.

### Canvas (`YD.atmosphere.canvas` + `canvasGlow` + `vignette`)

- Linear icy white-blue fill on island.
- Top-right glow ellipse (`rgba(91,156,245,0.12)`).
- Bottom vignette (`rgba(30,58,95,0.06)`).

### Card interiors (`YdCard`)

- Top 46% white fade overlay (`rgba(255,255,255,0.92) → transparent`).
- Accent soft blob top-right (`YD.accent.glowSoft`).
- Primary tone: bottom radial blue pool.

### Dashboard orbs (`.yd-dash-ambient-orb`)

- **Orb A:** top-right, `rgba(125,211,252,0.14)`, blur 64px.
- **Orb B:** bottom-left, `rgba(47,128,237,0.1)`, blur 64px.

---

## 13. Lighting & glow system

### Principles

1. **Glow = attention without boxes** — Active nav uses radial halo + shell shadow, not white rectangle.
2. **Inset top edge = light source** — Cards and floating panels use `inset 0 1px 0 rgba(255,255,255,…)`.
3. **Blue-tinted shadows** — `rgba(47,128,237,…)` in outer shadows ties depth to brand.
4. **Hover = brighten + expand glow** — `filter: brightness(1.015)` on `.yd-spatial-surface:hover`.

### Shadow tokens

| Token | Character |
|-------|-----------|
| `YD.shadow.island` | Heavy float for canvas |
| `YD.shadow.card` | Default card |
| `YD.shadow.cardPrimary` | Hero modules |
| `YD.shadow.cardQuiet` | Supporting modules |
| `YD.shadow.glowFocus` | Optional KPI glow ring |
| `YD.shadow.sidebar` | Rail depth |

### Sidebar lighting

- Bottom `yd-glow-pulse` (7s breath, opacity 0.42↔0.62).
- Edge glow strip on right (`YD.sidebar.edgeGlow`).
- Active: `.yd-nav-active-halo` + `.yd-nav-icon-shell--active` glow stack.

---

## 14. Surface material system

| Surface | Token / pattern | When |
|---------|-----------------|------|
| Page | `pageGradient` | `protected/layout` wrapper |
| Island / canvas | `atmosphere.canvas` | `YdWorkspaceCanvas` |
| Card default | `surface.card` | Standard modules |
| Card primary | `surface.cardPrimary` | Hero KPI, analytics, table |
| Card quiet | `surface.cardQuiet` | Secondary KPI, arc, calendar |
| Elevated preview | floating context gradient | Hover layer |
| Search | white→icy linear + inset shadow | Dashboard search |
| Table head | `surface.tableHead` | Recent submissions header |
| Sunken | `surface.sunken` | Rare recessed areas |

**Material rule:** Surfaces are **gradients**, not solid fills — even “white” cards transition `#FFFFFF → #EDF4FA`.

---

## 15. Border treatment

| Token | Value | Use |
|-------|-------|-----|
| `YD.border.whisper` | `rgba(255,255,255,0.72)` | Canvas island border |
| `YD.border.soft` | `rgba(180,198,218,0.55)` | Table dividers, search |
| `YD.border.focus` | `rgba(47,128,237,0.45)` | Focus rings |

**Rules:**

- Prefer **separators at 28–32% opacity** inside tables (`rgba(180,198,218,0.28)`).
- No 1px harsh `#E5E7EB` grid lines across entire layouts.
- Floating panels: `rgba(255,255,255,0.75–0.82)` border with luminous shadow.

---

## 16. Radius system

| Token | Value | Application |
|-------|-------|-------------|
| `YD.radius.sm` | 12px | Small controls |
| `YD.radius.md` | 18px | Nav preview panel |
| `YD.radius.lg` | 24px | Default cards |
| `YD.radius.xl` | 32px | Primary cards |
| `YD.radius.island` | 48px | (legacy naming) |
| Canvas | **52px** | `md:rounded-[52px]` on workspace |
| Sidebar | **44px** | Glass rail |
| Pill | 9999px | Search, chips, status pills |
| Chart area | 20px | Bar chart container |
| Floating context | 20px | Preview panel |

---

## 17. Depth & elevation

**Elevation is expressed through shadow + light, not Z-index stacks.**

| Level | Element | Mechanism |
|-------|---------|-----------|
| 0 | Page gradient | — |
| 1 | Canvas island | `shadow.island` |
| 2 | Cards | `shadow.card*` + hover glow |
| 3 | Sidebar rail | `shadow.sidebar` + blur backdrop |
| 4 | Floating context / nav panel | Fixed/absolute, blur entrance, z-index 60–200 |
| 5 | Modals (elsewhere) | Must match glass + luminous border when ported |

**No** Material Design  elevation-1/2/3 literal mapping.

---

## 18. Sidebar design rules

### Structure

- Width: **108px** desktop (`YD.sidebar.width`).
- Glass: `rgba(252,254,255,0.48)` + flow gradient + `backdrop-blur-[22px]`.
- Icons only on desktop; labels in mobile drawer.
- Profile + sign-out bottom stack.

### Active state (ambient — NOT menu block)

- Radial `.yd-nav-active-halo` (cyan-blue, blurred).
- Vertical `.yd-nav-active-trace` on rail edge (desktop).
- Icon shell: glass + multi-layer glow; icon color `#2F80ED` with drop-shadow.
- **Forbidden:** large white active row, solid blue circle with white icon (legacy `navActiveSolid`).

### Hover

- Icon shell: `rgba(255,255,255,0.14)` + soft blue outer glow.
- Row whisper: `rgba(47,128,237,0.04)`.

**CSS:** `app/yd-sidebar.css` · **Component:** `components/app-shell/nav-item.tsx`

---

## 19. Navigation philosophy

- **Rail = device**, not webpage navbar.
- **Context on hover** — `YdNavAmbientPanel` shows inbox/tasks/journal preview beside rail (staggered lines 80–300ms).
- **Badges** — Small count on icon; urgent variant for overdue relay.
- **Route-aware active** — Relay includes `/my-tasks`; settings includes `/admin`.
- **No scale** on icon hover (spatial OS rule).

---

## 20. Card system

### Component: `YdCard` / `HcCard`

| Prop | Effect |
|------|--------|
| `tone="default"` | `surface.card`, `radius.lg`, `shadow.card` |
| `tone="primary"` | `surface.cardPrimary`, `radius.xl`, `shadow.cardPrimary`, bottom glow blob |
| `tone="quiet"` | `surface.cardQuiet`, softer shadow |
| `ambient` | Enables `.yd-spatial-surface` hover lighting |
| `lift` | Stronger hover shadow (still **no** translateY) |
| `glow` | Applies `shadow.glowFocus` |

### Internal structure

1. Top highlight gradient overlay.
2. Optional accent blob.
3. Content in `relative` flex column.

---

## 21. KPI design rules

### `HcStatCard` anatomy

1. Gradient icon orb (Lucide, white stroke, soft blue shadow).
2. `.yd-dash-label` title.
3. KPI value (`yd-dash-kpi` | `yd-dash-kpi-hero` | `yd-dash-kpi-quiet`).
4. Optional footnote with `TrendingUp` when positive trend styling.
5. Optional metric row (`metricA` / `metricB`) separated by **soft top border**.
6. Optional `YdFloatingContext` wrapper — preview does not resize card.

### Tone mapping (current dashboard)

| KPI | Columns | tone | Flags |
|-----|---------|------|-------|
| Einsendungen gesamt | 3 | quiet | floating preview if new in 24h |
| Ungelesene Fälle | 5 | primary | hero, lift, glow |
| Offene Aufgaben | 4 | quiet | — |

### Heights

- Standard: `min-h-[176px]` → `188px` md, `p-5` → `p-6`.
- Hero: `min-h-[204px]` → `216px` md, `p-6` → `p-7`.

---

## 22. Table design rules

### Recent submissions (`HcRecentTable`)

- Wrapper: `HcCard tone="primary"`, `p-0` overflow hidden.
- Head band: `YD.surface.tableHead`, bottom `border.soft`.
- Columns: checkbox placeholder, Fall ID, Patient (avatar circle + name/email), Eingang, Status pill.
- Head text: `10px uppercase tracking-[0.1em]` `YD.text.faint`.
- Row hover: `rgba(248,252,255,0.9)` — not grey `#F1F5F9` block.
- Empty / error: centered `13px` `YD.text.secondary` — calm, no blame.

### Status

- `YdStatusPill`: `active` (unread) vs `calm` (seen).

---

## 23. Chart design rules

### Bar chart (`HcAnalyticsBars`)

- `tone="primary"`, `yd-awaken-chart` for entry animation.
- Dot grid background (`YD.chart.grid`, 14px repeat).
- Area fade overlay at bottom.
- Dual bar stack: striped soft + solid gradient (`chartStripe`, `chartBar`, `chartBarSoft`).
- Horizontal guide lines at 33% / 66% height.
- Section title + KPI total + meta label pattern same as cards.

### Distribution arc (`HcDistributionArc`)

- `tone="quiet"`, SVG arcs with glow filter.
- Track: `YD.chart.track`.
- Gradients: `YD.accent.arc` / `arcSoft`.

**Rule:** Charts support narrative; they must not dominate like analytics SaaS billboards.

---

## 24. Search bar rules

- Height: **48px** (`h-12`).
- Shape: pill (`YD.radius.pill`).
- Background: `linear-gradient(180deg, rgba(255,255,255,0.88), rgba(236,244,252,0.95))`.
- Border: `rgba(180,198,218,0.42)`.
- Shadow: inset + faint white ring + `rgba(47,128,237,0.06)` outer.
- Icon: Search 17px, `YD.text.faint`, left `pl-12`.
- Placeholder: `#8BA3B8`, copy *„Fälle oder Patienten suchen…“*.
- Hover (`.yd-dash-search-input:hover`): stronger blue outer glow — no layout shift.
- Focus: `ring-[rgba(47,128,237,0.14)]`.

---

## 25. Form / input design rules (workspace)

**When extending to forms inside YD canvas:**

- Radius: pill or `YD.radius.md` (18px) for compact fields.
- Height: min 44px touch on mobile, 48px for primary fields.
- Font size: **16px on mobile** where iOS zoom must be avoided; 13–15px desktop acceptable for dense clinical UI.
- Border: `YD.border.soft`, not stark gray-300.
- Focus: luminous ring, not default browser blue box.
- Background: gradient or `rgba(255,255,255,0.88)` — match search field DNA.
- Disabled: reduced opacity, cursor not-allowed — never hide labels.

**Login (`/login`):** Implemented — `app/yd-login.css`, `YdLoginEnvironment`, same page gradient + 52px island + awakening sequence. Register/forgot-password still on legacy shell until migrated.

---

## 26. Modal & drawer rules

### Mobile sidebar drawer

- Full-height sheet inside `MobileSidebarFrame`.
- Same sidebar component — labels visible, ambient active states.
- Close control: whisper blue hover `rgba(47,128,237,0.06)`, not white block.

### Future modals (YD-aligned)

- Backdrop: `rgba(15,35,58,0.25)` + optional blur — not pure `#000000` at 50%.
- Panel: same floating context gradient + `inset` top highlight.
- Enter: blur-in 720ms `yd-float-context-in` pattern.
- **No** scale-from-0.95 bounce.

---

## 27. Floating context preview rules

### Pattern: `YdFloatingContext`

- Wraps trigger (KPI card); **does not change card size**.
- Portal to `document.body`, `position: fixed`, z-index **200**.
- Disabled on `(hover: none)` / coarse pointer — prevents stuck overlays on touch.
- Position: below anchor +12px, flips above if viewport overflow.
- Surface: `.yd-floating-context-surface` — blur-in 720ms.

### Content structure (`DashboardFloatingPreviewShell`)

- Title: `10px uppercase tracking-[0.1em]` faint.
- Primary line: `14px medium` primary color.
- Secondary: `12px` secondary.
- Meta: `11px` muted.

**Copy tone:** factual clinical status (*„Wartet auf Sichtung“*), not marketing.

---

## 28. Hover interaction rules

| Target | Allowed | Forbidden |
|--------|---------|-----------|
| Cards | brightness, shadow, `::before` radial pool | `translateY`, `scale` |
| KPI lift | stronger shadow only | card height change |
| Sidebar icons | glow diffusion | solid white active block |
| Table rows | soft icy background | dark grey fill |
| Inbox rows (`.yd-inbox-row-ambient`) | horizontal gradient + inset ring | translate |
| Search | enhanced glow | — |

**Timing:** `720ms` spatial, `880ms` preview reveal — see §30–31.

---

## 29. Motion system

### Philosophy

**Spatial OS / ambient computing** — layers materialize and illuminate; they do not “bounce.”

### Post-login awakening (`YdWorkspaceAwakening`)

| Phase | Duration | Delay | Element |
|-------|----------|-------|---------|
| BG illuminate | 1400ms | 0 | `.yd-awaken-page` |
| Canvas emerge | 1600ms | 320ms | `.yd-awaken-canvas` |
| Sidebar materialize | 1400ms | 680ms | `.yd-awaken-sidebar` |
| Stagger layers | 1200ms | 980ms + stagger | `.yd-awaken-stagger` |
| Chart illuminate | 1600ms | 1280ms + chart stagger | `.yd-awaken-chart` |
| Ambient settle | 2200ms | 1800ms | `.yd-awaken-glow-settle` |

**Total:** ~4400ms (`YD_AWAKEN_DURATION_MS`). Trigger: `?yd_enter=1` → session `yd-workspace-awaken`.

### Stagger indices (dashboard)

| Index | Section |
|-------|---------|
| 0 | Header |
| 1 | KPIs |
| 2 | Charts |
| 3 | Table + calendar |

`YD_STAGGER_MS`: 0, 80, 160, 240… per child.

---

## 30. Animation timing

| Token | ms | Use |
|-------|-----|-----|
| `YD_MOTION.duration.breath` | 180 | Micro state |
| `YD_MOTION.duration.spatial` | 720 | Hover, surfaces, sidebar |
| `YD_MOTION.duration.reveal` | 880 | Preview lines |
| `YD_MOTION.duration.materialize` | 1100 | Large layers |
| `YD_MOTION.duration.awaken` | 4200 | Full sequence |

### Easing

| Token | Curve |
|-------|-------|
| `ease.spatial` | `cubic-bezier(0.19, 1, 0.32, 1)` |
| `ease.luminous` | `cubic-bezier(0.25, 0.9, 0.35, 1)` |
| `ease.diffuse` | `cubic-bezier(0.33, 0, 0.15, 1)` |

**CSS variables:** `--yd-ease-spatial`, `--yd-ease-luminous`, `--yd-ease-diffuse` in `app/yd-ambient.css`.

---

## 31. Hover timing

- **Default:** 720ms on box-shadow, filter, background (`ydSpatialTransition()`).
- **Nav preview lines:** 600ms opacity/transform, delays **80–300ms** staggered per line.
- **Floating context:** 720ms blur-in.
- **Forbidden:** 150–200ms “snappy” SaaS hovers.

---

## 32. Iconography rules

- Library: **Lucide**.
- Stroke: **1.55–2.1** (active slightly heavier).
- KPI icons: white on **gradient circle** (`YD.accent.iconGradient`).
- Idle chrome icons: `YD.sidebar.iconIdle` (`#6B849C`).
- Active nav: `YD.sidebar.iconActive` + glow filter.
- Sizes: 17px chrome, 19px hero KPI, 22px nav.
- **No** filled icon sets; outline only for OS consistency.

---

## 33. Notification design

- Inbox bell: `yd-dash-control` glass circle; unread **1.5px dot** `#E11D48` with `ring-2 ring-white/90` — minimal, not numeric badge in header.
- Sidebar: `NavBadge` on icons when count > 0.
- **Tone:** indicate presence, don't alarm — reserve red for true urgency variant.

---

## 34. Empty states

- Table: *„Noch keine Einsendungen in diesem Ausschnitt.“* — `13px`, secondary, centered `py-12`.
- Null data KPI: em dash `—`, never fake zero.
- Charts: bars at minimum height with zero values — grid still visible for structure.

**Voice:** neutral, operational, offers next step only when relevant (links in partial-error banner).

---

## 35. Error states

- Dashboard partial load: single `role="status"` paragraph, links to Inbox/Relay — **no** raw DB errors.
- Table `rows === null`: *„Daten momentan nicht verfügbar.“*
- Color: `YD.text.secondary`, accent links `YD.accent.core`.
- **Never** stack trace or Supabase codes in UI.

---

## 36. Upload flow design (future YD alignment)

When applying YD to patient/doctor uploads:

- Use canvas island + `YdCard` quiet/primary progression.
- Progress: calm copy, luminous bar (blue gradient fill), not spinner-only.
- Purpose binding in label text (AGENTS.md).
- Hover/motion per spatial rules; no white modal boxes on grey page.

*Current upload routes may predate YD — migrate using this bible, not login/register patterns.*

---

## 37. Public doctor profile rules

- Editorial **Fraunces** acceptable for article/journal *content* prose.
- Chrome around profile should still use **canvas + card** metaphor when inside product.
- Photo frames: soft ring `ring-white/85`, `shadow.cardQuiet` — match dashboard avatar.
- No consumer-social profile tropes (heavy follow buttons, cover banners).

---

## 38. Patient upload UX rules

- Calm, trustworthy German microcopy.
- Large touch targets, safe-area padding.
- Success = explicit next step; failure = recovery without blame.
- Visuals: icy gradients, not stark white hospital forms.

---

## 39. Mobile rules

- `100dvh` shell; safe areas on sidebar header/footer (`env(safe-area-inset-*)`).
- Main padding bottom: `max(4.25rem, safe-area + 3.25rem)` for thumb reach.
- Dashboard: single column; KPI grid `sm:grid-cols-2` then `lg:12-col`.
- Touch min **44–48px** on nav links (`min-h-[48px]`).
- Floating context **disabled** on coarse pointer.
- One scroll container in `main`.
- `16px` inputs on critical mobile forms (iOS zoom).

---

## 40. Accessibility rules

- `focus-visible:ring-2` with blue tint on interactive elements.
- `aria-label` on icon-only links (search, bell, relay).
- `role="status"` for partial dashboard errors.
- `prefers-reduced-motion`: disables awakening, hover transitions, sidebar breath (`app/yd-ambient.css`, `yd-sidebar.css`).
- Contrast: primary text `#0C1929` on icy white-blue surfaces meets clinical UI targets; verify new pairs when adding colors.
- Tooltips: floating context uses `role="tooltip"` — ensure keyboard focus path (`onFocus`/`onBlur` on anchor).

---

## 41. Future expansion rules

### When building a new protected page

1. Render inside `app/(protected)/layout.tsx` → automatic page gradient + canvas.
2. Import tokens from `YD` — no ad-hoc hex from Tailwind gray scale.
3. Pick card `tone` for hierarchy (one `primary` hero max per viewport).
4. Use `YdAwakenStagger` for section entry if page is mission-critical.
5. Apply `.yd-spatial-surface` / `yd-inbox-row-ambient` for lists.
6. Use `YdFloatingContext` for hover detail — never expand rows/cards.
7. German clinical copy; `formatDoctorDisplayName` where doctors appear.
8. Run mobile + reduced-motion check.

### Do not import from

- Login/register visual system (different phase).
- Generic shadcn defaults without YD token overlay.
- Finance dashboard patterns (bold KPI, equal grids, red/green candles).

### Rollout priority (see IMPLEMENTATION-STATUS.md)

Inbox (partial) → Relay → Create Case → Settings → Public profile → Patient upload → Journals.

---

## Appendix A — Code map

| Concern | Path |
|---------|------|
| Tokens | `lib/design/yd-design-tokens.ts` |
| Motion | `lib/design/yd-motion.ts`, `lib/design/yd-workspace-awakening.ts` |
| CSS | `app/yd-workspace.css`, `app/yd-ambient.css`, `app/yd-dashboard.css`, `app/yd-sidebar.css` |
| Canvas | `components/design-system/yd-workspace-canvas.tsx` |
| Card | `components/design-system/yd-card.tsx` |
| Status | `components/design-system/yd-status-pill.tsx` |
| Floating | `components/ambient/yd-floating-context.tsx` |
| Awakening | `components/ambient/yd-workspace-awakening.tsx`, `yd-awaken-bootstrap.tsx`, `yd-awaken-stagger.tsx` |
| Dashboard | `app/(protected)/dashboard/page.tsx`, `components/dashboard/hc/*` |
| Shell | `app/(protected)/layout.tsx`, `components/app-shell/sidebar.tsx`, `nav-item.tsx` |

---

## Appendix B — Why this must not normalize to generic SaaS

| Generic SaaS tells | Your Dentist tells |
|-------------------|-------------------|
| White page, gray cards | Icy gradient page, luminous island |
| 3 equal KPI columns | 3/5/4 asymmetric hero |
| Bold 700 KPI numbers | Medium 500 tabular KPIs |
| 200ms hover lift | 720ms glow illumination |
| Sidebar high-contrast active block | Ambient halo + glass shell |
| Tooltip = description | Floating OS context layer |
| Charts dominate | Charts support calm overview |
| “Enterprise security certified” | Honest, calm operational copy |

**The product moat is atmosphere + clinical emotional design**, not feature-dense widgets.

---

*End of Brand Bible v1.0 — extracted from live implementation, Mai 2026.*
