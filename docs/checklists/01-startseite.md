# Checkliste: `/` Startseite

**Route:** `http://127.0.0.1:3000/`  
**Pro Punkt:** `[ ] F` funktioniert · `[ ] S` Medical/Stability

---

## A — Seite lädt (Geschwindigkeit)

- [ ] **F** Seite öffnet ohne weißen Crash / 500
- [ ] **F** Logo + Brand sichtbar
- [ ] **F** Hero-Text **sofort** lesbar (kein 2s Fade/Blur nach Klick)
- [ ] **F** Klick auf `/` von anderer Seite: leichtes Bento-Skeleton, **nicht** „Workspace wird geladen“
- [ ] **F** Ausgeloggt: Seite erscheint **ohne** Warten auf Supabase (Dashboard-Link kommt ggf. 0,2s später)
- [ ] **S** Keine rohen Fehler in Browser-Konsole
- [ ] **S** Mobile: eine Scroll-Kette, kein abgeschnittener Footer
- [ ] **S** Lighthouse / Network: First Contentful Paint unter ~1,5s (lokal)
- [ ] **S** Services-Bilder laden lazy (Netzwerk: Unsplash erst beim Scrollen)

---

## B — Header (Desktop ≥ lg)

- [ ] **F** Logo → `/` (Startseite)
- [ ] **F** Nav „Plattform“ → scrollt zu `#plattform`
- [ ] **F** Nav „Patient Journey“ → scrollt zu `#journey`
- [ ] **F** Nav „Services“ → scrollt zu `#services`
- [ ] **F** Nav „Warum“ → scrollt zu `#warum`
- [ ] **F** Nav „FAQ“ → scrollt zu `#faq`
- [ ] **F** Button „Gespräch vereinbaren“ → scrollt zu `#demo`
- [ ] **F** Link „Anmelden“ → `/login`
- [ ] **F** Eingeloggt (Arzt): „Dashboard“ → `/dashboard`
- [ ] **F** Eingeloggt (Team): „Dashboard“ → `/my-tasks`
- [ ] **S** Header bekommt Schatten beim Scrollen
- [ ] **S** Alle Nav-Buttons erreichbar, kein toter Klick

---

## C — Header (Mobile < lg)

- [ ] **F** Hamburger öffnet Menü
- [ ] **F** X schließt Menü
- [ ] **F** Backdrop-Tap schließt Menü
- [ ] **F** Alle Nav-Punkte wie Desktop
- [ ] **F** „Gespräch vereinbaren“ + „Anmelden“ im Menü
- [ ] **S** `html` overflow gesperrt solange Menü offen
- [ ] **S** Menü schließt nach Sektions-Klick

---

## D — Hero

- [ ] **F** Titel + Untertitel sichtbar
- [ ] **F** CTA „Gespräch vereinbaren“ → `#demo`
- [ ] **F** CTA „Praxiszugang anfordern“ → `#plattform`
- [ ] **F** Link „Anmelden“ → `/login`
- [ ] **F** KPI-Karten (3 Stück) sichtbar
- [ ] **S** CTAs nicht doppelt / verwirrend

---

## E — Inhalts-Sektionen (scroll / Anker)

- [ ] **F** `#plattform` — Module (Atlas, Tracker, Relay, Journals, Command)
- [ ] **F** `#journey` — Patient Journey (6 Schritte)
- [ ] **F** `#heilung` — Heilungsverläufe, Tabs wechseln (Implantate, Endo, …)
- [ ] **F** `#command` — Command AI Sektion
- [ ] **F** `#automation` — Automatisierung
- [ ] **F** `#services` — Service-Karten + Bilder laden
- [ ] **F** `#warum` — Warum-Karten
- [ ] **F** `#faq` — FAQ auf/zu klappen
- [ ] **F** `#demo` — Demo-Bereich + Formular
- [ ] **S** Direktaufruf `/#faq` scrollt korrekt (nach Reload)
- [ ] **S** Legacy-Hashes funktionieren (`/#praxisalltag` → warum, `/#command-ai` → command)

---

## F — Services-Sektion (Interaktion)

- [ ] **F** „Portfolio anfragen“ (Kopf) → `#demo`
- [ ] **F** Jede Karte „Portfolio ansehen“ → `#demo`
- [ ] **S** Unsplash-Bilder laden (oder ruhiger Fallback, kein Broken-Icon-Chaos)

---

## G — Demo-Formular (`#demo`)

- [ ] **F** Pflichtfelder: Name, Praxis, E-Mail
- [ ] **F** Optional: Telefon, Nachricht
- [ ] **F** Submit → `POST /api/demo-request` → Erfolg
- [ ] **F** Erfolgs-Screen: „Anfrage ist eingegangen“
- [ ] **F** „Weitere Anfrage“ → Formular zurück
- [ ] **F** Leere Pflichtfelder → Browser-Validierung / Fehler
- [ ] **S** Pending: Button disabled, „Wird gesendet …“
- [ ] **S** Fehler ohne `DEMO_REQUEST_TO`/SMTP: ruhige Meldung (kein Stacktrace)
- [ ] **S** Rate-Limit (viele Sends): verständliche Meldung
- [ ] **S** Honeypot (`website`) blockiert Bots still

**Env:** `DEMO_REQUEST_TO` oder `ADMIN_EMAILS` + optional SMTP

---

## H — Preise (Sheet, nicht Inline-Sektion)

- [ ] **F** Footer „Preise“ → Sheet öffnet
- [ ] **F** URL wird `/#preise` beim Öffnen
- [ ] **F** Direkt `/#preise` beim Laden → Sheet öffnet automatisch
- [ ] **F** `/pricing` → Redirect `/#preise` (+ Query `plan`, `invite`, `email`)
- [ ] **F** `/?plan=yearly` → Sheet mit Plan vorausgewählt
- [ ] **F** `/?invite=…&email=…` → an Register-CTAs durchgereicht
- [ ] **F** Plan wählen (monatlich / halbjährlich / jährlich)
- [ ] **F** CTA Plan → `/register?plan=…&step=1`
- [ ] **F** Escape schließt Sheet
- [ ] **F** Backdrop / „Schließen“ schließt Sheet
- [ ] **F** Schließen entfernt `#preise` aus URL
- [ ] **S** Sheet: Body-Scroll gesperrt, danach wieder frei
- [ ] **S** Mobile: Sheet bedienbar, nicht abgeschnitten

---

## I — Footer

- [ ] **F** „Datenschutz“ → `/datenschutz`
- [ ] **F** „Impressum“ → `/impressum`
- [ ] **F** „Preise“ → Sheet (wie H)
- [ ] **F** „Anmelden“ → `/login`
- [ ] **S** Links öffnen (Platzhalter-Seiten ok für S nur wenn Copy klar „Platzhalter“)

---

## J — Eingeloggt vs. ausgeloggt

- [ ] **F** Ausgeloggt: kein Dashboard-Link im Header
- [ ] **F** Eingeloggt: Dashboard-Link mit korrekter Rolle
- [ ] **F** Landing bleibt sichtbar (kein Auto-Redirect weg von `/`)
- [ ] **S** Kein Flackern zwischen Login-State

---

## K — Query-Parameter

- [ ] **F** `?plan=monthly|halfyearly|yearly` → Preise-Sheet + Plan
- [ ] **F** `?invite=TOKEN` → an Register weiter
- [ ] **F** `?email=…` → vorausgefüllt wo vorgesehen

---

**Blocker Startseite:** _______________________________________________

**F erledigt:** ___ / 52 · **S erledigt:** ___ / 22
