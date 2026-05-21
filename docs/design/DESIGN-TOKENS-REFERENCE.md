# Your Dentist — Design Tokens Reference

**Source:** `lib/design/yd-design-tokens.ts`, `lib/design/yd-motion.ts`, `lib/design/yd-workspace-awakening.ts`, `app/yd-dashboard.css`

Use **`YD`** in new code. **`HC`** is a legacy alias mapped to `YD` values.

---

## Import

```ts
import { YD } from "@/lib/design/yd-design-tokens";
import { YD_MOTION, ydSpatialTransition } from "@/lib/design/yd-motion";
import { YD_STAGGER_MS, YD_AWAKEN_DURATION_MS } from "@/lib/design/yd-workspace-awakening";
```

---

## Atmosphere

| Token | Value |
|-------|-------|
| `YD.atmosphere.page` | `#9AABB9` |
| `YD.atmosphere.pageGradient` | Multi radial + linear `#A3B3C2 → #8E9EAE` |
| `YD.atmosphere.canvas` | `linear-gradient(168deg, #F2F7FC 0%, #E6EFF8 42%, #DAE8F4 100%)` |
| `YD.atmosphere.canvasGlow` | Radial top-right `rgba(91,156,245,0.12)` |
| `YD.atmosphere.vignette` | Bottom radial `rgba(30,58,95,0.06)` |

---

## Surfaces

| Token | Use |
|-------|-----|
| `YD.surface.island` | Legacy island fill |
| `YD.surface.card` | Default card gradient |
| `YD.surface.cardPrimary` | Hero / table / analytics |
| `YD.surface.cardQuiet` | Secondary KPI, arc, calendar |
| `YD.surface.cardHover` | Hover gradient target |
| `YD.surface.elevated` | Floating panels |
| `YD.surface.sunken` | `#D8E4EF` recessed |
| `YD.surface.search` | Search field gradient base |
| `YD.surface.tableHead` | Table header band |

---

## Accent

| Token | Value |
|-------|-------|
| `YD.accent.core` | `#2F80ED` |
| `YD.accent.deep` | `#1A4F9C` |
| `YD.accent.mid` | `#2563EB` |
| `YD.accent.light` | `#7EB8FF` |
| `YD.accent.ice` | `#B8DCFF` |
| `YD.accent.glow` | `rgba(47, 128, 237, 0.35)` |
| `YD.accent.glowSoft` | `rgba(125, 211, 252, 0.22)` |
| `YD.accent.iconGradient` | `linear-gradient(145deg, #6BA8F5 0%, #2F80ED 42%, #1A4F9C 100%)` |
| `YD.accent.navActive` | Legacy solid orb — **avoid** |
| `YD.accent.chartBar` | Bar gradient deep → light |
| `YD.accent.chartBarSoft` | Soft bar gradient |
| `YD.accent.chartStripe` | Diagonal stripe pattern |
| `YD.accent.arc` | `["#1A4F9C", "#2F80ED", "#6BA8F5"]` |
| `YD.accent.arcSoft` | `["#93C5FD", "#C7E2FF"]` |

---

## Text

| Token | Hex |
|-------|-----|
| `YD.text.primary` | `#0C1929` |
| `YD.text.secondary` | `#3D5266` |
| `YD.text.muted` | `#5E7389` |
| `YD.text.faint` | `#8BA3B8` |
| `YD.text.brand` | `#0F172A` |

### Dashboard CSS classes (scoped `.yd-dashboard`)

| Class | Size (mobile → md+) |
|-------|---------------------|
| `.yd-dash-title` | 1.4rem → 1.75rem |
| `.yd-dash-kpi` | 1.75rem → 1.875rem |
| `.yd-dash-kpi-hero` | 2.125rem → 2.375rem |
| `.yd-dash-kpi-quiet` | 1.625rem |
| `.yd-dash-section` | 0.9375rem |
| `.yd-dash-label` | 0.75rem |
| `.yd-dash-meta` | 0.6875rem |

---

## Borders

| Token | Value |
|-------|-------|
| `YD.border.whisper` | `rgba(255, 255, 255, 0.72)` |
| `YD.border.soft` | `rgba(180, 198, 218, 0.55)` |
| `YD.border.focus` | `rgba(47, 128, 237, 0.45)` |

---

## Shadows

| Token | Character |
|-------|-----------|
| `YD.shadow.island` | Canvas float |
| `YD.shadow.card` | Default card |
| `YD.shadow.cardLift` | Hover emphasis |
| `YD.shadow.sidebar` | Rail |
| `YD.shadow.glowFocus` | Hero KPI ring |
| `YD.shadow.cardPrimary` | Primary card |
| `YD.shadow.cardQuiet` | Quiet card |

---

## Sidebar

| Token | Value |
|-------|-------|
| `YD.sidebar.width` | `108` (px) |
| `YD.sidebar.radius` | `44px` |
| `YD.sidebar.glass` | `rgba(252, 254, 255, 0.48)` |
| `YD.sidebar.flow` | Vertical white→blue gradient |
| `YD.sidebar.edgeGlow` | Right edge light strip |
| `YD.sidebar.iconIdle` | `#6B849C` |
| `YD.sidebar.iconActive` | `#2F80ED` |
| `YD.sidebar.navActiveGlass` | `rgba(255, 255, 255, 0.22)` |
| `YD.sidebar.navActiveGlow` | Multi-layer box-shadow string |

---

## Radius

| Token | px |
|-------|-----|
| `YD.radius.sm` | 12 |
| `YD.radius.md` | 18 |
| `YD.radius.lg` | 24 |
| `YD.radius.xl` | 32 |
| `YD.radius.island` | 48 |
| `YD.radius.pill` | 9999 |
| Canvas (implementation) | **52** |
| Floating context | **20** |

---

## Spacing

| Token | px | Use |
|-------|-----|-----|
| `YD.space.breath` | 32 | Large section gap |
| `YD.space.section` | 28 | Section internal |
| `YD.space.cardPad` | 24 | Default card padding reference |
| `YD.space.contentMax` | 1340 | Dashboard max width |

### Layout gaps (Tailwind in dashboard)

| Zone | Class |
|------|-------|
| KPI grid | `gap-5` / `lg:gap-6` |
| Chart row | `gap-6` / `lg:gap-7` |
| Lower row | `gap-7` / `lg:gap-8` |
| Header axis mb | `1.125rem` |
| Zone mb | `2.25rem` / `lg:2.75rem` |

---

## Status & trend

| Token | Background / text |
|-------|-----------------|
| `YD.status.urgent` | `#FEE8E8` / `#B91C1C` |
| `YD.status.active` | `#E0EDFE` / `#1D4ED8` |
| `YD.status.calm` | `#E0F2F5` / `#0E7490` |
| `YD.status.done` | `#DCFCE7` / `#15803D` |
| `YD.status.pending` | `#FEF3C7` / `#B45309` |
| `YD.trend.up` | `#16A34A` |
| `YD.trend.neutral` | `#5E7389` |

---

## Chart

| Token | Value |
|-------|-------|
| `YD.chart.grid` | Dot grid `#B0C4D6` |
| `YD.chart.areaFade` | Bottom fade overlay |
| `YD.chart.track` | `#C5D5E3` |

---

## Motion (`YD_MOTION`)

| Key | ms |
|-----|-----|
| `duration.breath` | 180 |
| `duration.spatial` | 720 |
| `duration.reveal` | 880 |
| `duration.materialize` | 1100 |
| `duration.awaken` | 4200 |

| Ease key | Curve |
|----------|-------|
| `ease.spatial` | `cubic-bezier(0.19, 1, 0.32, 1)` |
| `ease.luminous` | `cubic-bezier(0.25, 0.9, 0.35, 1)` |
| `ease.diffuse` | `cubic-bezier(0.33, 0, 0.15, 1)` |

```ts
ydSpatialTransition("opacity, box-shadow, filter", 720);
// → "opacity, box-shadow, filter 720ms cubic-bezier(0.19, 1, 0.32, 1)"
```

---

## Awakening

| Constant | Value |
|----------|-------|
| `YD_ENTER_QUERY` | `yd_enter` |
| `YD_AWAKEN_SESSION_KEY` | `yd-workspace-awaken` |
| `YD_STAGGER_MS` | `[0, 80, 160, 240, 320, 400, 480, 560]` |
| `YD_AWAKEN_DURATION_MS` | `4400` |

---

## Card tone mapping

| `tone` | Background | Shadow | Radius |
|--------|------------|--------|--------|
| `default` | `surface.card` | `shadow.card` | `radius.lg` |
| `primary` | `surface.cardPrimary` | `shadow.cardPrimary` | `radius.xl` |
| `quiet` | `surface.cardQuiet` | `shadow.cardQuiet` | `radius.lg` |

---

## CSS class registry

| Class | File | Purpose |
|-------|------|---------|
| `.yd-workspace` | `yd-workspace.css` | Font + scope |
| `.yd-spatial-surface` | `yd-ambient.css` | Card hover light |
| `.yd-ambient-card` | `yd-ambient.css` | Same as spatial |
| `.yd-floating-context-surface` | `yd-ambient.css` | KPI preview panel |
| `.yd-inbox-row-ambient` | `yd-ambient.css` | List row hover |
| `.yd-nav-active-halo` | `yd-sidebar.css` | Active nav glow |
| `.yd-nav-icon-shell--active` | `yd-sidebar.css` | Active icon glass |
| `.yd-dash-*` | `yd-dashboard.css` | Dashboard typography |
| `.yd-dash-search-input` | `yd-dashboard.css` | Search hover glow |
| `.yd-awaken-*` | `yd-ambient.css` | Entry animations |

---

## Forbidden token usage

| Avoid | Use instead |
|-------|-------------|
| `#FFFFFF` page background | `YD.atmosphere.pageGradient` |
| `#2563EB` as default brand | `YD.accent.core` |
| `navActiveSolid` / `YD.accent.navActive` for new nav | `navActiveGlass` + halo CSS |
| `shadow-lg` Tailwind alone | `YD.shadow.card*` |
| `font-bold` on KPIs | `font-medium` + `.yd-dash-kpi` |
| `transition-all duration-200` | `ydSpatialTransition()` 720ms |

---

See [YOUR-DENTIST-BRAND-BIBLE.md](./YOUR-DENTIST-BRAND-BIBLE.md) for usage context and rules.
