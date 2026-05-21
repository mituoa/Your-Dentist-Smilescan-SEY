# Your Dentist — Brand & UI Guide (YD)

**Version:** 1.0 · **Stand:** Mai 2026  
**Master Bible (41 sections):** [YOUR-DENTIST-BRAND-BIBLE.md](./YOUR-DENTIST-BRAND-BIBLE.md)  
**Token tables:** [DESIGN-TOKENS-REFERENCE.md](./DESIGN-TOKENS-REFERENCE.md)  
**Technical index:** [YOUR-DENTIST-DESIGN-SYSTEM.md](./YOUR-DENTIST-DESIGN-SYSTEM.md)  
**Code-Stand:** [IMPLEMENTATION-STATUS.md](./IMPLEMENTATION-STATUS.md)

---

## 1. Tokens — immer `YD` verwenden

**Primär:** `lib/design/yd-design-tokens.ts` → `YD`  
**Legacy-Alias:** `HC` in `lib/design/healthcare-dashboard-tokens.ts` (mapped auf `YD`)

| Token | Verwendung |
|-------|------------|
| `YD.atmosphere.pageGradient` | App-Hintergrund außerhalb der Insel |
| `YD.atmosphere.canvas` | Abgerundeter Workspace-Bereich |
| `YD.surface.card` / `cardPrimary` / `cardQuiet` | Karten-Hierarchie |
| `YD.accent.core` | Links, aktive Akzente (`#2F80ED`) |
| `YD.text.primary` / `secondary` / `muted` / `faint` | Typo-Farben |
| `YD.shadow.island` / `card` / `cardPrimary` | Tiefe |

**Nicht mehr:** flaches `#FFFFFF` Page, `#2563EB` Corporate-Blue als Standard.

---

## 2. Komponenten

```tsx
import { YdWorkspaceCanvas } from "@/components/design-system/yd-workspace-canvas";
import { YdCard } from "@/components/design-system/yd-card";
import { YdStatusPill } from "@/components/design-system/yd-status-pill";
import { YdFloatingContext } from "@/components/ambient/yd-floating-context";

// Legacy (weiter OK):
import { HcAppCanvas } from "@/components/design/hc-app-canvas";
import { HcCard } from "@/components/design/hc-card";
```

| Komponente | Wann |
|------------|------|
| `HcAppCanvas` / `YdWorkspaceCanvas` | Automatisch via `app/(protected)/layout.tsx` |
| `HcCard` tone=`primary` \| `quiet` \| default | KPI hero, charts, tables |
| `YdFloatingContext` | Kontext bei Hover **ohne** Layout-Shift |
| `YdStatusPill` | Tabellen-Status |

---

## 3. Layout-Shell

```
[ Ambient page gradient ]
  [ Sidebar glass rail ] [ Workspace canvas (rounded island)
                           └─ Page content (.yd-dashboard on Atlas)
                         ]
```

- Sidebar: `components/app-shell/sidebar.tsx`  
- Dashboard-Header: in der Seite (`dashboard-header.tsx`), Topbar auf md+ ausgeblendet  
- Arzt-Anzeige: `formatDoctorDisplayName(name)` → `Dr. …`

---

## 4. Neue Seite — Checkliste

- [ ] `YD` Tokens, keine Hardcoded Tailwind-Grays (`#6B7280`)
- [ ] Inhalt in Workspace-Canvas (Layout)
- [ ] Karten mit passendem `tone`
- [ ] Keine Layout-shifting Hover-Previews (nur `YdFloatingContext`)
- [ ] Keine unbelegten Medical-/Zertifizierungs-Claims
- [ ] Mobile: Touch 44px, ein dominanter Scroll-Container
- [ ] `prefers-reduced-motion` respektiert (CSS vorhanden)

---

## 5. Referenz-Slices

| Ordner | Inhalt |
|--------|--------|
| `docs/design/reference/` | Vollbild-Mocks |
| `docs/design/slices/dashboard/` | Dashboard-Teile |
| `docs/design/slices/tracker/` | Inbox-Teile |
| [slices/README.md](./slices/README.md) | Index + Phasen |

Slices = **visuelle DNA**, nicht 1:1 Pixel. Live-Code ist führend.

---

## 6. Medical Copy

- ❌ Unbelegte Zertifizierungen (SOC2, HIPAA, TÜV, …)  
- ❌ Fake Praxis-Zahlen / „2.500 Kunden“  
- ✅ Sachlich, ruhig, DSGVO-orientiert (bestehende Produkt-Copy)

---

## 7. Lokal testen

```bash
npm run dev
```

| Seite | URL |
|-------|-----|
| Dashboard | http://127.0.0.1:3000/dashboard |
| Posteingang | http://127.0.0.1:3000/inbox |
| Relay | http://127.0.0.1:3000/relay |

Hard Refresh nach Deploy: `Cmd+Shift+R`.
