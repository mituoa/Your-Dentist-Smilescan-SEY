# Your Dentist — Premium Medical OS Design System (YD)

**Version 0.2** · Luxury clinical workspace · Production-ready

## Vision

Your Dentist is a **luxury clinical operating system** — calm, luminous, trustworthy, futuristic without being trendy. Not generic SaaS, not CRM, not Jira.

**Emotional targets:** trust · calm · intelligence · precision · emotional safety · operational control

---

## Code entry points

| Layer | Path |
|-------|------|
| Tokens | `lib/design/yd-design-tokens.ts` (`YD`, legacy `HC`) |
| Motion | `lib/design/yd-motion.ts` |
| Workspace CSS | `app/yd-workspace.css` |
| Primitives | `components/design-system/` |
| Workspace shell | `app/(protected)/layout.tsx` |

### Primitives

- `YdWorkspaceCanvas` — floating clinical island (main content)
- `YdCard` — layered card with ambient glow corner
- `YdStatusPill` — medical status chips
- `YdSectionHeader` — calm section titles

Legacy aliases: `HcAppCanvas`, `HcCard` → wrap YD primitives.

---

## Color — atmospheric, never flat white pages

- **Page:** cool grey-blue gradient (`YD.atmosphere.pageGradient`) — NOT `#FFFFFF` page
- **Canvas:** icy luminous gradient (`YD.atmosphere.canvas`)
- **Cards:** white → cool white gradient (`YD.surface.card`)
- **Accent:** luminous medical blue `#2F80ED` → deep `#1A4F9C` with glow layers

### Forbidden

- Pure white app backgrounds
- Default enterprise `#2563eb` flat panels
- Harsh 1px grey borders everywhere
- Dense widget grids

---

## Typography

| Role | Font | Usage |
|------|------|--------|
| UI | DM Sans (`--font-dm-sans`) | Body, labels, data |
| Brand | Fraunces (`--font-fraunces`) | *Your* italic + **Dentist** |
| Mono | JetBrains Mono | Codes, technical meta |

**Rules:** elegant hierarchy, airy line-height, no startup hero sizing on dashboards.

---

## Layout — composition, not rigid grids

- Asymmetrical balance (e.g. 8/4 charts, 4/8 table/calendar)
- Breathing space (`YD.space.breath` 32px+ between sections)
- One focal card may `lift` + `glow` (center KPI)
- Avoid equal three-column widget walls

---

## Sidebar — device-like rail

- Floating glass pill (`backdrop-blur`, `YD.sidebar.flow`)
- Logo + **Your Dentist** wordmark (`YourDentistWordmarkStack`)
- Icons only on desktop; active = gradient orb + downward glow trail
- Inactive = line icon, no heavy circles
- Profile + logout at bottom

Inspired by: iPadOS · Apple Health · medical device UI

---

## Tables

- Soft row hover (`#FAFCFF`)
- Rounded checkbox affordances
- `YdStatusPill` variants: urgent · active · calm · done · pending
- Head row: `YD.surface.tableHead` gradient — not spreadsheet grey

---

## Charts

- Ambient integration: dot grid + area fade
- Dual bars + stripe cap (reference DNA)
- Arc: multi-stop gradient + soft glow filter
- Charts are **atmosphere**, not analytics-dashboard noise

---

## Motion

| Token | Value |
|-------|--------|
| Normal | 320ms `cubic-bezier(0.22, 1, 0.36, 1)` |
| Enter | 520ms surface enter |
| Hover lift | 2px translate, soft shadow |

Respect `prefers-reduced-motion` (see `yd-workspace.css`).

## Ambient interactions (YD v0.3)

| System | Path |
|--------|------|
| CSS | `app/yd-ambient.css` |
| Post-login reveal | `components/ambient/yd-workspace-awakening.tsx`, `yd-awaken-bootstrap.tsx` |
| Stagger | `components/ambient/yd-awaken-stagger.tsx` |
| Nav hover intelligence | `yd-nav-ambient-panel.tsx` + `lib/ambient/build-nav-ambient-previews.ts` |

**After login:** URL `?yd_enter=1` → session flag → staged reveal (page → sidebar → canvas → staggered sections). No bounce, no scale gimmicks.

**Hover:** Cards use `.yd-ambient-card`; inbox rows reveal metadata inline; sidebar shows contextual preview panel (desktop).

---

## Product areas — rollout map

| Area | Status | Notes |
|------|--------|-------|
| Dashboard | ✅ YD v0.2 | Reference implementation |
| App shell / Sidebar | ✅ YD v0.2 | |
| Inbox / Tracker | 🔜 | Apply `YdCard`, table, calm ops copy |
| Relay / Tasks | 🔜 | Healthcare coordination, not PM tool |
| Create Case | 🔜 | Calm guided flow |
| Public Profile | 🔜 | Trust, reputation, premium clinic |
| Patient Upload | 🔜 | Safe, luxurious, no funnel energy |
| Journals | 🔜 | Editorial medical, not blog CMS |
| Settings / Admin | 🔜 | Quiet administration |

---

## Medical SaaS compliance (copy)

- No unverified certification claims
- No fake patient/practice statistics in UI
- DSGVO-calm tone; enumeration-safe auth copy unchanged

---

## Reference slices

`docs/design/reference/` · `docs/design/slices/` — implement slice-by-slice, evolve with YD tokens.
