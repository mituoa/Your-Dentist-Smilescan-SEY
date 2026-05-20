# Design-Slices — Healthcare Dashboard

Referenzbilder und zugeschnittene Teile für **Schritt-für-Schritt-Umsetzung**.  
Funktionen in SmileScan bleiben gleich — nur Layout, Form und Farbe.

## Referenz (Vollbild)

| Datei | Route in SmileScan | Inhalt |
|-------|-------------------|--------|
| `reference/01-dashboard-full.png` | `/dashboard` | Atlas / Übersicht |
| `reference/02-tracker-full.png` | `/inbox` | Einsendungen / Tracker |

## Dashboard — Slices (`slices/dashboard/`)

| Slice | Datei | Was drin ist | Code-Ziel (später) |
|-------|--------|--------------|-------------------|
| 1 | `01-sidebar.png` | Schmale Icon-Rail, Logo oben, aktives Home | `components/app-shell/sidebar.tsx` |
| 2 | `02-header.png` | Begrüßung, Suchfeld, Benachrichtigung | `Topbar` / `dashboard/greeting` |
| 3 | `03-stat-cards.png` | 3 KPI-Karten (Patient, Room, Appointment) | `components/dashboard/stat-block.tsx` ×3 |
| 4 | `04-chart-analytics.png` | Balkendiagramm „Analytics“ | Neuer Block oder bestehende Stats erweitern |
| 5 | `05-chart-gender.png` | Halbkreis „Gender“ | Optional / Phase 2 |
| 6 | `06-calendar.png` | Monatskalender | Optional / Phase 2 |
| 7 | `07-table-preview.png` | Tabelle mit Status-Pills | Inspiration für Aktivität / Kurzliste |

**SmileScan-Mapping (Inhalt, nicht 1:1 Text aus Referenz):**

- „Total Patient“ → z. B. neue Einsendungen / offene Fälle
- „Appointment“ → offene Aufgaben
- „Overall Room“ → ggf. Team-Metrik oder weglassen, wenn keine Daten

## Tracker (Einsendungen) — Slices (`slices/tracker/`)

| Slice | Datei | Was drin ist | Code-Ziel (später) |
|-------|--------|--------------|-------------------|
| 1 | `01-sidebar.png` | Rail, **Patients** aktiv (blauer Kreis) | `sidebar.tsx` — aktiver Nav `/inbox` |
| 2 | `02-header.png` | Titel „Patient“, Suchleiste | `inbox` Listenkopf / Suche |
| 3 | `03-table-card.png` | Weiße Karte, Tabelle, Pagination, Status-Pills | `InboxTrackerShell` + Listenzeilen |

**SmileScan-Mapping:**

- Spalten Referenz → unsere Spalten: Fall-ID, Patient, Datum, Status, …
- Status „Hospital / Consultation / Healthy“ → unsere Dringlichkeit/Workflow-Status (Farben aus `HC.status*`)

## Reihenfolge Umsetzung (empfohlen)

```
Phase A — Grundgerüst (alle Seiten)
  A1  Tokens + Canvas-Hintergrund (#E8EFF5)
  A2  Sidebar-Redesign (Icon-Rail wie Slice 01)
  A3  Karten-Stil (radius, shadow, weiß)

Phase B — Dashboard (/dashboard)
  B1  Header (Slice 02)
  B2  Stat-Karten (Slice 03)
  B3  Charts optional (04–07)

Phase C — Tracker (/inbox)
  C1  Header + Suche (Slice 02)
  C2  Tabellenkarte + Pills (Slice 03)

Phase D — Restliche App
  Relay, Settings, Register, … gleiche Tokens
```

## Lokal prüfen

```bash
npm run dev
# Dashboard: http://127.0.0.1:3000/dashboard
# Tracker:   http://127.0.0.1:3000/inbox
```

Slices im Finder: `docs/design/slices/dashboard/` und `docs/design/slices/tracker/`.

## Tokens im Code

`lib/design/healthcare-dashboard-tokens.ts` — export `HC` für Tailwind/inline styles.
