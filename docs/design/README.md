# Design — Your Dentist (YD)

**Stand:** Mai 2026 · **System:** Premium Medical OS (YD v1.0 Brand Bible)

Dieser Ordner ist die **Quelle der Wahrheit** für visuelle Richtung, Tokens, Umsetzungsstand und Referenz-Slices.

---

## Dokumente (lesen in dieser Reihenfolge)

| Datei | Inhalt |
|-------|--------|
| **[YOUR-DENTIST-BRAND-BIBLE.md](./YOUR-DENTIST-BRAND-BIBLE.md)** | **Master-Design-Bible** — reverse-engineered aus dem Live-Dashboard (41 Regelbereiche) |
| [DESIGN-TOKENS-REFERENCE.md](./DESIGN-TOKENS-REFERENCE.md) | Vollständige Token-Tabellen + CSS-Klassen |
| [YOUR-DENTIST-DESIGN-SYSTEM.md](./YOUR-DENTIST-DESIGN-SYSTEM.md) | Technischer Index, Vision, Code-Map |
| [IMPLEMENTATION-STATUS.md](./IMPLEMENTATION-STATUS.md) | Was im Code **live** ist (Route → Datei) |
| [BRAND-GUIDE.md](./BRAND-GUIDE.md) | Kurz-Checkliste für neue Seiten |
| [slices/README.md](./slices/README.md) | Referenz-Screens + Slice-Index + Phasen |

---

## Code (Implementierung)

| Bereich | Pfad |
|---------|------|
| **Tokens** | `lib/design/yd-design-tokens.ts` (`YD`; Legacy: `HC` in `healthcare-dashboard-tokens.ts`) |
| **Motion** | `lib/design/yd-motion.ts`, `lib/design/yd-workspace-awakening.ts` |
| **CSS** | `app/yd-workspace.css`, `app/yd-ambient.css`, `app/yd-dashboard.css` |
| **Primitives** | `components/design-system/` |
| **Ambient / OS** | `components/ambient/` |
| **Dashboard** | `components/dashboard/hc/`, `app/(protected)/dashboard/` |
| **Shell** | `components/app-shell/`, `app/(protected)/layout.tsx` |

---

## Referenzbilder

| Ordner | Beschreibung |
|--------|----------------|
| `reference/` | Ursprüngliche Vollbild-Mocks (Figma Healthcare Dashboard) |
| `slices/dashboard/` | 7 Teilstücke — Dashboard |
| `slices/tracker/` | 3 Teilstücke — Einsendungen / Inbox |

**Hinweis:** Die **Live-UI** ist weiterentwickelt (atmospheric YD, Dr.-Präfix, Floating Context, Spatial Motion). Referenz-Slices dienen als **DNA**, nicht als 1:1-Pixel-Vorgabe.

Optional: neue Screenshots der implementierten UI als `reference/03-dashboard-yd-v0.5.png` ergänzen.

---

## Lokal prüfen

```bash
npm run dev
```

| Seite | URL |
|-------|-----|
| Dashboard (Atlas) | http://127.0.0.1:3000/dashboard |
| Posteingang | http://127.0.0.1:3000/inbox |
| Relay | http://127.0.0.1:3000/relay |

Nach Login: Workspace-Awakening-Sequenz (einmal pro Session). Hard Refresh: `Cmd+Shift+R`.

---

## Nicht in diesem Modus (bewusst)

- `/login`, `/register` — Original-UI (eigene Phase)
- Keine unbelegten Zertifizierungs- oder Marketing-Claims (siehe AGENTS.md)
