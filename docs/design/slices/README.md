# Design-Slices — Referenz & Umsetzung

**Stand:** Mai 2026 · System: **YD v0.5**

Referenzbilder aus dem Figma Healthcare Dashboard. Die **Live-Implementierung** nutzt dieselbe DNA, ist aber atmosphärischer (icy gradients, spatial motion, floating context).

---

## Referenz (Vollbild)

| Datei | Route | Status Code |
|-------|-------|-------------|
| `../reference/01-dashboard-full.png` | `/dashboard` | ✅ YD v0.5 (weiterentwickelt) |
| `../reference/02-tracker-full.png` | `/inbox` | 🟡 YD shell + spatial rows |

---

## Dashboard — Slices (`dashboard/`)

| # | Datei | Inhalt Referenz | Code (aktuell) | Status |
|---|--------|-----------------|----------------|--------|
| 1 | `01-sidebar.png` | Icon-Rail | `sidebar.tsx`, `nav-item.tsx`, wordmark | ✅ |
| 2 | `02-header.png` | Greeting + Suche | `dashboard-header.tsx` | ✅ v0.5 (Dr., OS search) |
| 3 | `03-stat-cards.png` | 3 KPI-Karten | `stat-card.tsx`, asymmetric grid | ✅ |
| 4 | `04-chart-analytics.png` | Balkendiagramm | `analytics-bars.tsx` | ✅ |
| 5 | `05-chart-gender.png` | Halbkreis | `distribution-arc.tsx` (Bearbeitungsstand) | ✅ adapted |
| 6 | `06-calendar.png` | Kalender | `month-calendar.tsx` | ✅ |
| 7 | `07-table-preview.png` | Tabelle + Pills | `recent-table.tsx` | ✅ |

---

## Tracker — Slices (`tracker/`)

| # | Datei | Inhalt Referenz | Code (aktuell) | Status |
|---|--------|-----------------|----------------|--------|
| 1 | `01-sidebar.png` | Rail, Patients aktiv | `sidebar.tsx` → `/inbox` | ✅ |
| 2 | `02-header.png` | Titel + Suche | `inbox/layout.tsx` | ✅ |
| 3 | `03-table-card.png` | Tabellenkarte | `InboxTrackerShell`, list items | 🟡 |

---

## Umsetzungsphasen (historisch → aktuell)

```
✅ Phase A — Shell + YD Tokens + Canvas
✅ Phase B — Dashboard v0.5 (composition, motion, floating context)
🟡 Phase C — Inbox / Tracker (YD card, spatial rows)
⬜ Phase D — Relay, Settings, Profile, Journals, Public flows
⬜ Phase E — Auth surfaces (login/register) — bewusst separat
```

Details: [../IMPLEMENTATION-STATUS.md](../IMPLEMENTATION-STATUS.md)

---

## SmileScan-Inhalt (nicht Figma-Text 1:1)

| Referenz-KPI | SmileScan |
|--------------|-----------|
| Total Patient | Einsendungen gesamt |
| Appointment | Offene Aufgaben (Relay) |
| Unread / Room | Ungelesene Fälle (hero KPI) |

---

## Tokens im Code

```ts
import { YD } from "@/lib/design/yd-design-tokens";
// oder Legacy:
import { HC } from "@/lib/design/healthcare-dashboard-tokens";
```

---

## Screenshots aktualisieren (optional)

Wenn die Referenz veraltet wirkt, neue Vollbild-Screenshots der Live-UI ablegen:

```
docs/design/reference/03-dashboard-yd-v0.5.png
docs/design/reference/04-inbox-yd-v0.5.png
```

Dann in dieser README verlinken.
