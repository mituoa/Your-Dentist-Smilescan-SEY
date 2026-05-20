# Your Dentist — Brand Guide (Healthcare Dashboard Modus)

**Version:** 0.1 (Pilot) · **Referenz:** Figma Healthcare Dashboard  
**Ziel:** Ein Modus für alle App-Seiten — gleiche Formen, Farben, Abstände; **Funktionen bleiben unverändert**.

---

## 1. Referenz-Material (Slices)

| Ordner | Inhalt |
|--------|--------|
| `docs/design/reference/` | Vollbild-Mocks (Dashboard + Tracker) |
| `docs/design/slices/dashboard/` | 7 Teilstücke (Sidebar → Tabelle) |
| `docs/design/slices/tracker/` | 3 Teilstücke (Sidebar → Tabelle) |
| `docs/design/slices/README.md` | Slice-Index + Umsetzungsreihenfolge |

**Regel:** Immer **ein Slice = ein Umsetzungsschritt**. Nicht das ganze Mock auf einmal bauen.

---

## 2. Design-Tokens (Code)

Zentrale Datei: `lib/design/healthcare-dashboard-tokens.ts` → Export **`HC`**

| Token | Wert | Verwendung |
|-------|------|------------|
| `canvasBg` | `#E8EFF5` | App-Innenfläche (abgerundeter Bereich) |
| `surface` | `#FFFFFF` | Karten, Listen, Formulare |
| `primary` | `#2563EB` | Buttons, aktive Nav, Links |
| `primaryDark` | `#1D4ED8` | Hover Primary |
| `primaryLight` | `#60A5FA` | Icons, Akzente |
| `primarySoft` | `#DBEAFE` | Hintergründe Icon-Well |
| `text` | `#0F172A` | Überschriften |
| `textSecondary` | `#64748B` | Fließtext, Labels |
| `textMuted` | `#94A3B8` | Meta, Footer |
| `border` | `#E2E8F0` | Rahmen Inputs/Karten |
| `cardShadow` | siehe Code | Karten-Schatten |
| `cardRadius` | `20px` | Karten |
| `pillRadius` / `inputRadius` | `9999px` | Suche, Pills |
| `sidebarWidth` | `76px` | Desktop Icon-Rail |

**Komponenten (wiederverwenden):**

- `components/design/hc-app-canvas.tsx` — äußerer abgerundeter App-Bereich
- `components/design/hc-card.tsx` — weiße Karte mit Schatten

---

## 3. Layout-System

### App-Shell (alle geschützten Seiten)

```
[ Icon-Sidebar 76px ] [ HcAppCanvas (#E8EFF5, radius 28px)
                        └─ Seiteninhalt (Karten #FFFFFF)
                      ]
```

- **Sidebar:** nur Icons auf Desktop (`components/app-shell/sidebar.tsx`)
- **Aktiver Nav-Punkt:** blauer Kreis, weißes Icon (`nav-item.tsx`)
- **Logo oben:** blaues Pill mit Mark (`brand-mark.tsx`)

### Seiten-Typen

| Typ | Referenz-Slice | SmileScan-Route | Muster |
|-----|----------------|-----------------|--------|
| Dashboard | `03-stat-cards` + Charts | `/dashboard` | Header + KPI-Karten + optional Charts |
| Tracker-Liste | `03-table-card` | `/inbox` | Titel + Pill-Suche + `HcCard` mit Tabelle |
| Formular/Detail | — | `/inbox/[id]`, Settings | `HcCard` + ruhige Typo |
| Auth (öffentlich) | **später** — noch Original-UI | `/login`, `/register` | eigene Phase nach App-Shell |

---

## 4. Typografie

| Rolle | Größe | Gewicht | Farbe |
|-------|-------|---------|-------|
| Seitentitel | 26–30px | Bold | `HC.text` |
| Kartentitel | 13–14px | Medium | `HC.textSecondary` |
| KPI-Zahl | 32px | Bold | `HC.text` |
| Fließtext | 14–15px | Regular | `HC.textSecondary` |
| Meta / Footer | 11–12px | Regular | `HC.textMuted` |

**Kein Serif** in diesem Modus. Login/Register bleiben vorerst unverändert.

---

## 5. Komponenten-Muster

### Primär-Button

- Hintergrund: `HC.primary`
- Hover: `HC.primaryDark`
- Radius: `8–10px` (Login) / `lg` in App
- Kein Verlauf in App (Login darf Ausnahme sein)

### Sekundär / Google

- Weiß, Border `HC.border`, ruhige Copy

### Karte (`HcCard`)

```tsx
import { HcCard } from "@/components/design/hc-card";

<HcCard className="p-5">
  {/* Inhalt */}
</HcCard>
```

### Status-Pill (Tracker)

| Semantik | Hintergrund | Text |
|----------|-------------|------|
| Dringend / „Hospital“ | `#FEE2E2` | `#DC2626` |
| In Bearbeitung / „Consultation“ | `#DBEAFE` | `#2563EB` |
| Erledigt / „Healthy“ | `#D1FAE5` | `#059669` |

Mapping auf SmileScan-Status in `submission-list-item-figma.tsx` — **nur Farben**, keine neuen States.

### Suche

- Höhe: 40–44px
- `border-radius: 9999px`
- Icon links, Placeholder `HC.textMuted`

---

## 6. Medical-SaaS Copy (Pflicht)

**Nicht aus dem Figma-Mock übernehmen ohne Prüfung:**

- ❌ „medizinisch zertifiziert“
- ❌ „2.500 Praxen nutzen …“
- ❌ SOC2 / HIPAA / TÜV

**Stattdessen:** bestehende, abgesicherte Formulierungen aus Produktion (DSGVO-orientiert, sachlich).

---

## 7. Rollout-Reihenfolge (andere Seiten)

1. ✅ Phase A — Shell + Tokens (`layout`, Sidebar, `HcAppCanvas`)
2. ✅ Phase B (teilweise) — `/dashboard`, `/inbox`
3. ⬜ Phase C — `/relay`, `/my-tasks`, `/settings`, `/profile`
4. ⬜ Phase D — `/login`, `/register`, `/forgot-password` (bewusst zurückgestellt)
5. ⬜ Charts/Kalender (Dashboard) — nur wenn Daten vorhanden

**Pro Seite:** Slice ansehen → `HcCard` + `HC.*` → keine Logik ändern.

---

## 8. Lokal testen

```bash
# Alten Server stoppen, Cache leeren, neu starten:
kill $(lsof -ti:3000) 2>/dev/null
rm -rf .next
npm run dev
```

**URLs (127.0.0.1, nicht localhost verwechseln):**

| Seite | URL |
|-------|-----|
| Login | http://127.0.0.1:3000/login |
| Dashboard | http://127.0.0.1:3000/dashboard |
| Einsendungen | http://127.0.0.1:3000/inbox |

Wenn „Diese Seite existiert nicht“ erscheint: **Dev-Server neu starten** (siehe oben) oder falsche URL (z. B. `/design` existiert nicht).

---

## 9. Dateien-Checkliste für neue Seite

- [ ] `HC` Tokens statt Hardcoded-Farben
- [ ] Inhalt in `HcAppCanvas` (automatisch via Layout)
- [ ] Blöcke in `HcCard`
- [ ] Buttons Primary `HC.primary`
- [ ] Keine neuen Marketing-Claims
- [ ] Mobile: Touch 44px, ein Scroll-Container
