# Your Dentist — Public Homepage (Figma)

**Scope:** Public homepage only. No dashboard, login, register, or product-wide redesign.

**Target file (existing):** [SS — Figma](https://www.figma.com/design/pInIifbClMMZ8rTEJ6dtns/SS) · `fileKey: pInIifbClMMZ8rTEJ6dtns`

**New file (optional):** `Your Dentist — Public Homepage` (drafts) via `create_new_file`.

**Artboard:** Desktop `1440 × auto` · content column `1200` · horizontal inset `120`.

---

## Design decisions

| Decision | Choice |
|----------|--------|
| Hero headline | **Option A** — clearest in 3s: *Patientenanfragen. Direkt verstanden. Sicher organisiert.* |
| Background | Warm clinical canvas `#F8FBFE` → `#E8F1F8`, soft blue/lavender radial glows (see YD tokens) |
| Typography | **Inter** — Display 40/44 semibold, H2 28/34 semibold, H3 18/24 medium, body 15/22 regular, label 11/14 medium caps |
| Hero height | **Compact** ~520px content area (not poster-scale) |
| Product visual | **Single card** workflow moment (spec below), not collage |

---

## Color tokens (from `lib/design/yd-design-tokens.ts`)

| Token | Hex | Figma fill |
|-------|-----|------------|
| Text primary | `#0C1929` | `{r:0.047,g:0.098,b:0.161}` |
| Text secondary | `#3D5266` | `{r:0.239,g:0.322,b:0.400}` |
| Text muted | `#5E7389` | `{r:0.369,g:0.451,b:0.537}` |
| Text faint | `#8BA3B8` | `{r:0.545,g:0.639,b:0.722}` |
| Accent core | `#2F80ED` | `{r:0.184,g:0.502,b:0.929}` |
| Accent deep | `#1A4F9C` | `{r:0.102,g:0.310,b:0.612}` |
| Surface card | gradient white → `#EFF5FA` | linear 165° |
| Page canvas | `#F8FBFE` | base |
| Status done dot | `#22C55E` | checkmarks |
| Lavender depth | `rgba(167,139,250,0.06)` | hero glow only |

**Shadow (card):** `0 12px 36px rgba(30,91,189,0.10), inset 0 1px 0 rgba(255,255,255,0.9)`

**Radius:** cards `24`, buttons `12`, product card `32`, pills `9999`

---

## Section map (top → bottom)

1. **Header** — 72px sticky-style (design static)
2. **Hero** — copy left · product visual right
3. **Problem** — *Was heute verloren geht*
4. **Funktionen** — 4 pillars (Tracker, Command AI, Relay, Journal)
5. **Für Praxen** — 3 audience cards
6. **Einführung** — *Kein Großprojekt.* 4 steps
7. **Preise** — *Transparente Praxiszugänge*
8. **Demo** — *Einen Praxisablauf ansehen*
9. **Footer** — minimal

Section vertical rhythm: **96px** between major blocks, **48px** internal head-to-content.

---

## 1. Header

| Zone | Content |
|------|---------|
| Left | Your Dentist logo + optional tagline *Neutral Practice Platform* (small, faint) |
| Center | Lösung · Funktionen · Für Praxen · Preise · Einführung |
| Right | **Demo buchen** (secondary ghost) · **Anmelden** (text link, not loud CTA) |

**Avoid:** heavy borders, neon hover, “Sign up” styling.

Nav: 14px medium, `#3D5266`, hover → `#0C1929`. No underline animation.

---

## 2. Hero

**Eyebrow (optional, 11px caps):** `Praxisbetriebssystem`

**Headline (Option A):**
```
Patientenanfragen.
Direkt verstanden.
Sicher organisiert.
```

**Subline:**
> Patient:innen senden Anliegen und Bilder sicher an Ihre Praxis. Your Dentist strukturiert den Fall, bereitet nächste Schritte vor und verbindet Behandlung, Team und Kommunikation.

**CTAs:**
- Primary: **Demo buchen** (filled accent)
- Secondary: **Zugang anfordern** (outline/ghost)
- Tertiary link: **Bereits registriert? Anmelden**

**Forbidden CTAs:** Kostenlos testen, Jetzt starten, Praxis einrichten, Sign up, Start now.

---

### Hero product visual (right)

One card, ~480×420, soft shadow, radius 32.

```
[Label] Neue Anfrage

Sila Özmen
Schmerzen Unterkiefer

✓ Fotos erhalten
✓ Ersteinschätzung vorbereitet
✓ Antwortentwurf erstellt

[Button] Freigeben

── Command AI ──
„Rückruf an Rezeption übergeben“

✓ Aufgabe erstellt
```

**Visual rules:** believable app chrome, no floating widgets, max 1 card, checkmarks in green, Command block slightly recessed (`#F2F7FB`).

---

## 3. Problem

**Title:** Was heute verloren geht

| Ohne System | Mit Your Dentist |
|-------------|------------------|
| Patientenfotos in WhatsApp | ein Eingang |
| Rückrufe auf Zetteln | ein Fallverlauf |
| Übergaben zwischen Türen | ein Team |
| vergessene Nachrichten | eine Entscheidung |

Layout: 2 columns, bullet lists, no paragraphs.

Right column header: **With Your Dentist** (or DE: *Mit Your Dentist*).

---

## 4. Funktionen

**Section label:** Funktionen

| # | Title | Body |
|---|-------|------|
| 1 Tracker | Patientenanfragen strukturiert erfassen | Fotos, Symptome, Verlauf und nächster Schritt bleiben an einem Ort. |
| 2 Command AI | Ein Satz. Die Arbeit vorbereitet. | Patient informieren, Aufgabe erstellen oder Team benachrichtigen — Command AI bereitet den nächsten Schritt vor. |
| 3 Relay | Kommunikation bleibt beim Fall | Rückfragen, Übergaben und Aufgaben bleiben im Zusammenhang des Patientenfalls. |
| 4 Journal | Jede Entscheidung nachvollziehbar | Antworten, Aufgaben und interne Schritte bleiben sauber dokumentiert. |

4 calm cards, 2×2 grid, subtle line icons, 24px padding.

---

## 5. Für Praxen

| Card | Line |
|------|------|
| Einzelpraxis | Mehr Struktur ohne mehr Personal. |
| Mehrbehandlerpraxis / MVZ | Einheitliche Abläufe über Teams und Standorte. |
| Rezeption & Assistenz | Klare Aufgaben statt Nachfragen. |

3 cards horizontal, equal width.

---

## 6. Einführung

**Title:** Kein Großprojekt.

**Steps:** 1 Analyse · 2 Einrichtung · 3 Teamstart · 4 Begleitung

**Copy:** Wir richten den Praxisbereich kontrolliert ein und begleiten den Start im Team.

Horizontal step rail with connectors — calm, not wizard UI.

---

## 7. Preise

**Title:** Transparente Praxiszugänge

**Tiers:** Professional · Enterprise · optional Pilotphase

**Forbidden:** Most popular, discount badges, loud comparison table.

**CTAs:** Zugang anfordern (primary) · Demo buchen (secondary)

Feel: medical licensing, not startup pricing.

---

## 8. Demo

**Title:** Einen Praxisablauf ansehen

**Copy:** Wir zeigen in einem kurzen Einblick, wie Patienteneingänge, Command AI, Relay und Aufgaben in einem Praxisbereich zusammenspielen.

**CTA:** Demo buchen

---

## 9. Footer

Your Dentist · Neutral Practice Platform · Datenschutz · Impressum · Kontakt · Anmelden

Single row, 13px faint, no columns clutter.

---

## Build in Figma (automated)

After **Figma MCP auth** in Cursor:

1. Open or create file (see top).
2. Run scripts in order from `design/figma/public-homepage/scripts/`:
   - `01-page-shell.js`
   - `02-header-hero.js`
   - `03-sections-problem-functions.js`
   - `04-sections-praxen-einfuehrung.js`
   - `05-sections-pricing-demo-footer.js`

Each script is a `use_figma` body with `skillNames: "figma-use,figma-generate-design"`.

**Return value:** `createdNodeIds` for validation + `get_screenshot`.

---

## Quality bar (review checklist)

- [ ] Explains product in **15 seconds**
- [ ] Does **not** feel like login or generic SaaS template
- [ ] Hero **compact**, product moment **believable**
- [ ] No filler (“Hier können Sie…”, “Behalten Sie den Überblick…”)
- [ ] Premium medical warmth (off-white, soft blue, quiet shadows)
- [ ] Emotional target: *I understand it. I trust it. I want a demo.*
