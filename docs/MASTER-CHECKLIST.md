# Your Dentist — Master-Checkliste

**Stand:** Juni 2026  
**Zweck:** Gesamtes Repo stabilisieren, aktivieren, medical-enterprise-tauglich machen — danach Premium Polish.

---

## So nutzt du diese Liste

Jeder Eintrag hat bis zu **3 Checkboxen**:

| Kürzel | Bedeutung | Wann abhaken |
|--------|-----------|--------------|
| **F** | Funktion | End-to-end getestet (echte DB + Env) |
| **S** | Stabilität / Medical | Fehler, Loading, Mobile, Pending, Copy, Security — kein Rohfehler, kein Fake-State |
| **P** | Premium Polish | Spacing, Motion, Typo, Depth, „clinical calm“ — erst nach F+S sinnvoll |

**Parallel arbeiten:** Du kannst z. B. Phase 1 (Auth) und Phase 6 (APIs) gleichzeitig angehen — pro Zeile trotzdem F → S → P in der Reihenfolge innerhalb des Moduls.

**Blocker notieren:** Freie Zeile unter jedem Abschnitt: `Blocker: …`

---

## Legende Status (vor dem Abhaken)

- ✅ Code vorhanden
- 🟡 Env/Migration/Flag nötig
- ⬜ Platzhalter oder nicht gebaut

---

# EBENE A — Infrastruktur & Ops (einmalig)

> Ohne diese Punkte wirken viele Flows „kaputt“, obwohl der Code stimmt.

## A0 — Datenbank & Env

- [ ] **F** Alle Supabase-Migrationen 001–044 auf Prod-DB angewendet
- [ ] **F** `NEXT_PUBLIC_SUPABASE_URL` + `NEXT_PUBLIC_SUPABASE_ANON_KEY` gesetzt
- [ ] **F** `SUPABASE_SERVICE_ROLE_KEY` nur serverseitig, nicht im Client
- [ ] **F** `NEXT_PUBLIC_APP_URL` korrekt (E-Mails, OAuth, Profil-Links)
- [ ] **S** Launch-Guards dokumentiert: `REQUIRE_EMAIL_CONFIRMATION_BEFORE_APP`, `REQUIRE_WORKSPACE_APPROVAL_BEFORE_APP`
- [ ] **S** `AUTH_RELAX_MODE` nur Dev/Demo — nicht Produktion

## A1 — E-Mail (SMTP)

- [ ] **F** `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` konfiguriert
- [ ] **F** Test-Mail versendet (z. B. Passwort-Reset oder Team-Invite)
- [ ] **F** Patienten-Bestätigung nach Upload funktioniert
- [ ] **F** Praxis-Mail bei neuer Einsendung funktioniert
- [ ] **F** Team-Einladungs-Mail funktioniert
- [ ] **S** Fehler ohne SMTP: ruhige UI, kein Rohfehler

## A2 — Stripe / Abo bei Register

- [ ] **F** `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` gesetzt
- [ ] **F** `ENABLE_STRIPE_CHECKOUT_AT_SIGNUP=true` (wenn Zahlung bei Register)
- [ ] **F** Stripe Price-IDs für Intervalle (monatlich/halbjährlich/jährlich)
- [ ] **F** Webhook `/api/stripe/webhook` → `workspace_billing` sync getestet
- [ ] **S** Demo-Modus klar getrennt: `REGISTRATION_DEMO_MODE` / `NEXT_PUBLIC_REGISTRATION_DEMO_MODE`

## A3 — Cron & interne APIs

- [ ] **F** `RELAY_TASK_REMINDERS_SECRET` oder `CRON_SECRET` → `POST /api/internal/relay-task-reminders`
- [ ] **F** Task-Erinnerungs-Mails bei fälligen Aufgaben
- [ ] **F** `REGISTER_LICENSE_PENDING_CLEANUP_SECRET` → `POST /api/internal/cleanup-register-license-pending`
- [ ] **F** `MAIL_WEBHOOK_SIGNING_SECRET` → `POST /api/mail/webhook` (Zustellnachweise)

## A4 — Admin & Freischaltung

- [ ] **F** `ADMIN_EMAILS` / `ADMIN_GITHUB_USERNAMES` für Ops-Zugang
- [ ] **F** `REQUIRE_WORKSPACE_APPROVAL_BEFORE_APP` + Freischaltung über `/admin/registrations`
- [ ] **S** Nicht-Admin kann Registrierungs-Queue nicht sehen

**Blocker A:** _______________________________________________

---

# EBENE B — Stabilisierung (Route für Route)

> Entspricht deiner Audit-Liste + Ergänzungen. **F zuerst, dann S.** P kommt in Ebene C.

---

## Phase 1 — Auth & Zugang

### `/` — Startseite (Landing)

- [ ] **F** Alle Sektionen laden (Hero, Platform, Journey, FAQ, CTA, Footer)
- [ ] **F** Anker `#preise` öffnet Preise-Sheet
- [ ] **F** CTA → Register mit `?plan=`
- [ ] **F** Demo-Formular → `POST /api/demo-request` (`DEMO_REQUEST_TO`)
- [ ] **F** Eingeloggt: Link „Zum Dashboard“ korrekt (Arzt vs. Team)
- [ ] **S** Mobile Scroll, Safe Area
- [ ] **S** Keine toten CTAs

### `/pricing`

- [ ] **F** Redirect zu `/#preise`, Query-Params erhalten (`plan`, `invite`, `email`)

### `/login`

- [ ] **F** E-Mail + Passwort Login
- [ ] **F** Google OAuth (wenn `NEXT_PUBLIC_ENABLE_GOOGLE_LOGIN`)
- [ ] **F** Fehler: falsches Passwort, unbekannte E-Mail
- [ ] **F** Fehler: `email_not_confirmed` (wenn Guard aktiv)
- [ ] **F** Fehler: `account_pending_approval` (wenn Guard aktiv)
- [ ] **F** Resend Bestätigungs-Mail
- [ ] **F** Invite-Kontext `?invite=` → accept-invite Flow
- [ ] **F** Redirect nach Rolle (Arzt → Dashboard, Team → My-Tasks) — **konsistent mit `/`**
- [ ] **F** Post-Login Awakening `?yd_enter=1`
- [ ] **S** Pending/Disabled während Submit
- [ ] **S** Blocking-Errors konsistent (`proxy.ts` + Login-Page, nicht doppelt widersprüchlich)
- [ ] **S** Unknown-Error-Fallback nutzerfreundlich (nicht technisch)
- [ ] **S** Mobile Safari, Keyboard, Autofill

### `/register` — Schritt 1 (Ansprechperson & Zugang)

- [ ] **F** Felder: Name, Rolle, E-Mail, Passwort, Bestätigung
- [ ] **F** `POST /api/auth/check-email` (Format, keine Enumeration)
- [ ] **S** Validierung + Weiter-Button gesperrt bei Fehler

### `/register` — Schritt 2 (Praxis)

- [ ] **F** Praxisname, Telefon, Website

### `/register` — Schritt 3 (Verifizierung)

- [ ] **F** Zulassung Vorder-/Rückseite → `POST /api/register-license-upload`
- [ ] **F** Demo: Upload überspringen (wenn Demo-Flag)
- [ ] **S** Upload-Fehler recoverbar

### `/register` — Schritt 4 (Praxiszugang / Abo)

- [ ] **F** Abo-Intervall (monatlich / halbjährlich / jährlich)
- [ ] **F** Zahlungsart (SEPA / Karte / Rechnung)
- [ ] **F** Rechnung bei monatlich blockiert
- [ ] **F** Vertrags-Checkboxen (AGB, Datenschutz, Widerruf)
- [ ] **F** Stripe Checkout Redirect (wenn aktiviert)
- [ ] **F** Demo: „Ohne Zahlung“ (wenn Demo-Flag)
- [ ] **F** Erfolgs-Screen + Resend Bestätigung
- [ ] **F** Rollback bei Fehler (`rollbackIncompleteRegistrationAfterFailure`)
- [ ] **F** Invite-Flow: kein Solo-Workspace
- [ ] **S** Fieldset disabled während Submit (kein Doppel-Submit)

### `/forgot-password`

- [ ] **F** Reset-Mail anfordern
- [ ] **S** Enumeration-sichere Success-Copy
- [ ] **S** Rate-Limit-Verhalten akzeptabel

### `/reset-password`

- [ ] **F** Neues Passwort mit gültigem Token
- [ ] **F** Abgelaufener/ungültiger Token → klare Meldung
- [ ] **S** Loading-State vorhanden

### `/auth/callback`

- [ ] **F** OAuth / E-Mail-Confirm Code-Exchange
- [ ] **S** Open-Redirect-Schutz (`sanitizeAuthNextPath`)

### `/auth/continue`

- [ ] **F** Post-OAuth Redirect (Rolle, Invite)
- [ ] **S** Konsistent mit Login-Redirect-Logik

### `/accept-invite`

- [ ] **F** Szenario: neuer User
- [ ] **F** Szenario: bestehender User
- [ ] **F** Abgelaufen / ungültig / bereits genutzt
- [ ] **F** E-Mail-Mismatch
- [ ] **S** Token nur bei explizitem Accept eingelöst

### `POST /api/auth/sign-out`

- [ ] **F** Abmelden aus Sidebar + Settings

### `/admin/registrations`

- [ ] **F** Warteschlange pending Workspaces
- [ ] **F** Freischalten (`approved_at`)
- [ ] **F** Lizenz-Dokumente ansehen (signed URL)
- [ ] **S** Nur Allowlist-Zugang

**Blocker Phase 1:** _______________________________________________

---

## Phase 2 — Kernprodukt

### `/dashboard` (nur Arzt)

- [ ] **F** KPIs aus echter DB (Ungelesen, Tasks, …)
- [ ] **F** Practice Briefing / Morning Briefing
- [ ] **F** Timeline / Recent Submissions
- [ ] **F** Team-User → Redirect `/my-tasks`
- [ ] **S** Loading (`dashboard/loading.tsx`)
- [ ] **S** Fehler bei DB-Ausfall: Banner statt stiller Nulls
- [ ] **S** Mobile vereinfacht nutzbar

### `/inbox`

- [ ] **F** Fallliste, Suche `?q=`
- [ ] **F** Ungelesen-Zähler
- [ ] **F** Desktop: Auto-Select erster Fall
- [ ] **F** Mobile: Liste ohne Detail-Split
- [ ] **S** Empty-State
- [ ] **S** Listen-Fehler-UI
- [ ] **S** Loading (`inbox/loading.tsx`)

### `/inbox/[id]`

- [ ] **F** Gesehen / Ungelesen markieren
- [ ] **F** Dringlichkeit ändern
- [ ] **F** Praxis-Status ändern
- [ ] **F** Fotos anzeigen (signed URLs)
- [ ] **F** Foto-ZIP-Download
- [ ] **F** Fall-Timeline / Outbound-Historie (Migration 038)
- [ ] **F** Nachrichten-Entwurf: anlegen, bearbeiten
- [ ] **F** Entwurf freigeben (nur Arzt)
- [ ] **F** Patientenversand (Reply, Frage, Foto-Anfrage) — SMTP + 038
- [ ] **F** Terminlink senden (nur Arzt)
- [ ] **F** Verknüpfte Aufgabe anlegen
- [ ] **F** KI-Vorbereitung sichtbar — **kein Auto-Versand**
- [ ] **S** `notFound` bei fremdem Workspace
- [ ] **S** Pending auf alle Schreibaktionen
- [ ] **S** Mobile Detail-Flow (eine Scroll-Kette)
- [ ] **S** Server Actions prüfen Workspace-ID

### `/inbox-preview`

- [ ] **F** Mock-UI lädt (nur wenn `INBOX_PREVIEW_ENABLED`)
- [ ] **S** In Produktion deaktiviert oder hinter Flag (`noindex`)

### `/relay`

- [ ] **F** Kanban-Board (4 Spalten)
- [ ] **F** Scope: all / mine / delegated
- [ ] **F** Team-Nachrichten (unread / all / mentions)
- [ ] **F** Quick-Create Task
- [ ] **F** Drag & Drop Status
- [ ] **F** Journal-Freigaben in Queue
- [ ] **S** Action-Fehler mit Rollback
- [ ] **S** Loading (`relay/loading.tsx`)
- [ ] **S** Mobile: horizontales Scroll akzeptabel dokumentiert

### `/my-tasks`

- [ ] **F** Entscheidungs-/Team-Ansicht Relay
- [ ] **S** Loading (`my-tasks/loading.tsx`)

### `/my-tasks/new`

- [ ] **F** Modus: Aufgabe erstellen
- [ ] **F** Modus: Zuweisen
- [ ] **F** Modus: Nachricht
- [ ] **F** Prefill von Command AI / Inbox

### `/my-tasks/[id]`

- [ ] **F** Detail, Kommentare
- [ ] **F** Submit / Approve / Reject (Rollen)
- [ ] **F** Link zurück zu Inbox-Fall (wenn verknüpft)
- [ ] **S** Workspace-Scope in Query
- [ ] **S** Loading (`[id]/loading.tsx`)

### `/create-case` (nur Arzt)

- [ ] **F** Patientendaten + Fotos
- [ ] **F** Entwurf vs. Fall speichern
- [ ] **F** Redirect zu `/inbox/[id]`
- [ ] **S** **Server Action + Page: nur `doctor`** (Team blockiert)
- [ ] **S** Loading (`create-case/loading.tsx`)
- [ ] **S** Upload-Fehler recoverbar

### Command AI (⌘K / FAB — kein eigener Pfad)

- [ ] **F** Öffnet auf allen Protected-Routes
- [ ] **F** Entwurf zu aktivem Inbox-Fall
- [ ] **F** Task erstellen → Relay Prefill
- [ ] **F** Relay-Nachricht senden
- [ ] **S** Explizit: kein automatischer Patientenversand
- [ ] **S** Safety-Copy sichtbar

**Blocker Phase 2:** _______________________________________________

---

## Phase 3 — Inhalte & Patient

### `/journal`

- [ ] **F** Bibliothek, Filter, Tabs
- [ ] **S** Empty-State
- [ ] **S** Loading (`journal/loading.tsx`)

### `/journal/new`

- [ ] **F** Draft anlegen → Redirect zu Edit

### `/journal/[id]/edit`

- [ ] **F** Speichern, Publish, Unpublish, Löschen
- [ ] **F** Cover-Foto Upload
- [ ] **S** `notFound` bei fremdem Workspace
- [ ] **S** Mobile Editor bedienbar

### `/journals`

- [ ] **F** Alias-Redirect zu `/journal` (Tab/Filter erhalten)

### `/doc/[slug]` — Öffentliches Profil

- [ ] **F** Profil lädt bei gültigem Slug
- [ ] **F** Journal-Teaser
- [ ] **F** Termin-CTA / Upload-Link
- [ ] **S** 404/Redirect bei ungültigem Slug
- [ ] **S** Loading wo sinnvoll

### `/doc/[slug]/upload`

- [ ] **F** Fotos + Consent + Submit
- [ ] **F** E-Mails (Patient + Praxis) bei SMTP
- [ ] **S** Nur freigeschalteter Workspace (`approved_at`)
- [ ] **S** Öffentlicher Write strikt an Slug gebunden
- [ ] **S** Mobile Dropzone, Safe Area

### `/doc/[slug]/upload/success`

- [ ] **F** Bestätigungsseite nach Upload

### `/doc/[slug]/journal`

- [ ] **F** Öffentliche Artikel-Liste (nur published)

### `/doc/[slug]/journal/[articleSlug]`

- [ ] **F** Artikel lesen
- [ ] **S** `notFound` bei unpublishiert / falsch

**Blocker Phase 3:** _______________________________________________

---

## Phase 4 — Verwaltung

### `/profile` (nur Arzt)

- [ ] **F** Link zu Editor
- [ ] **F** Link zu `/doc/{slug}` wenn Slug gesetzt
- [ ] **S** Empty wenn kein Slug

### `/profile/editor`

- [ ] **F** Alle Sektionen: Praxis, Arzt, Kontakt, Branding, Approach, Career, Fach, Leistungen, Certs
- [ ] **F** Auto-Save / Speichern
- [ ] **F** Portrait Upload/Delete
- [ ] **F** Live-Vorschau
- [ ] **S** Loading (`profile/editor/loading.tsx`)
- [ ] **S** Mobile Editor nutzbar

### `/profile/solutions`

- [ ] **F** Katalog lädt
- [ ] **F** Briefing-Modal pro Produkt
- [ ] **F** Anfrage absenden → E-Mail/DB (`deliver-request.ts`)
- [ ] **S** Erfolgs-Screen, kein Overflow-Bug auf Mobile

### `/settings` (nur Arzt)

**Echte Panels:**

- [ ] **F** Praxisprofil: Slug, Name, Logo, Akzentfarbe, Terminlink, öffentlicher Link
- [ ] **F** Öffnungszeiten (Migration 043)
- [ ] **F** Team: Mitgliederliste, Rolle anzeigen, entfernen
- [ ] **F** Einladungen: senden, widerrufen
- [ ] **F** Sicherheit: Passwort-Reset-Mail, Theme Toggle, Abmelden
- [ ] **S** Mobile Scroll (Hub + Panels)
- [ ] **S** Pending auf alle Schreibaktionen
- [ ] **S** „Workspace nicht gefunden“-Fall

**Platzhalter — bewusst offen (nicht als F abhaken):**

- [ ] ⬜ Standorte (Redirect zu Profil-Editor) — **bauen oder Link reicht**
- [ ] ⬜ Behandlungsspektrum (Redirect) — **bauen oder Link reicht**
- [ ] ⬜ Nachrichten-Vorlagen — **Feature fehlt**
- [ ] ⬜ Automatisierungen — **Feature fehlt**
- [ ] ⬜ Journal-Kategorien / Vorlagen — **Feature fehlt**
- [ ] ⬜ Individuelle Rollen (disabled: „kommende Version“)
- [ ] ⬜ 2FA / Sitzungen — **nicht gebaut**

### `/settings/design-briefing` (intern)

- [ ] **F** Editor lädt aus DB (Migration 044)
- [ ] **F** Speichern funktioniert
- [ ] **S** Seed: `npm run db:seed-design-briefing`

### `/admin`

- [ ] **F** Redirect zu `/settings`

**Blocker Phase 4:** _______________________________________________

---

## Phase 5 — Rechtliches & Public Assets

### Rechtstexte (Inhalt ersetzen — kein Code-„Aktivieren“)

- [ ] **F** `/agb` — echter Text + Datum/Version
- [ ] **F** `/datenschutz` — echter Text (DSGVO)
- [ ] **F** `/impressum` — echter Text (Pflicht DE)
- [ ] **F** `/widerruf` — echter Text
- [ ] **S** Links in Register Schritt 4 konsistent mit live Texten
- [ ] **S** Footer-Links auf Landing

### Metadata & Icons

- [ ] **F** `app/icon.tsx`
- [ ] **F** `app/apple-icon.tsx`
- [ ] **F** `app/opengraph-image.tsx`
- [ ] **F** `app/twitter-image.tsx`
- [ ] **F** `app/favicon-16/route.ts`
- [ ] **F** `app/not-found.tsx` — Branding konsistent
- [ ] **S** OG/Twitter auf Landing + wichtigen Public Pages sinnvoll

**Blocker Phase 5:** _______________________________________________

---

## Phase 6 — APIs & technische Stabilität

### `POST /api/upload`

- [ ] **F** Upload für Create-Case + Patient
- [ ] **S** **Session + Workspace gebunden** — kein anonymer Missbrauch
- [ ] **S** Pfad `temp/{uuid}` konsistent mit Actions

### `POST /api/register-license-upload`

- [ ] **F** Lizenz bei Register
- [ ] **S** An Session/Register-Flow gebunden

### `POST /api/auth/check-email`

- [ ] **F** Format-Check
- [ ] **S** Keine User-Enumeration in UI

### `POST /api/mail/webhook`

- [ ] **F** HMAC `MAIL_WEBHOOK_SIGNING_SECRET`
- [ ] **F** Receipts in `task_delivery_receipts`

### `POST /api/stripe/webhook`

- [ ] **F** Signatur + Billing-Sync

### `POST /api/demo-request`

- [ ] **F** Landing-Demo → `DEMO_REQUEST_TO`

### Storage / DB Konsistenz

- [ ] **S** `submission_photos` (DB) ↔ `submission-photos` (Storage) Mapping geprüft
- [ ] **S** RLS-Review: jede `createAdminClient()`-Stelle dokumentiert

### Performance & Build

- [ ] **F** `npm run build` ohne Fehler
- [ ] **S** Keine rohen Exceptions im Browser auf kritischen Pfaden

**Blocker Phase 6:** _______________________________________________

---

# EBENE C — Premium Polish (systemweise)

> **Erst starten, wenn F+S im jeweiligen System grün.** Nicht route-weise „funktioniert das?“ — sondern „fühlt es sich hochwertig an?“

## C1 — Global Design System

- [ ] **P** Einheitliches Spacing über alle Routes
- [ ] **P** Konsistente Container-Breiten
- [ ] **P** Einheitliche vertikale Rhythmik
- [ ] **P** Konsistente Card-Radien
- [ ] **P** Ruhigere Shadow-Hierarchie
- [ ] **P** Weniger generische Tailwind-Optik
- [ ] **P** Medical Blue als klares Primärsystem
- [ ] **P** Beige-/graue Placeholder-Flächen eliminiert
- [ ] **P** Einheitliche Hover-/Pressed-States
- [ ] **P** Typografie ruhiger und hochwertiger
- [ ] **P** Weniger „floating random panels“

## C2 — Loading & Performance Feel

- [ ] **P** Elegante Skeletons (kein hartes Weiß/Beige)
- [ ] **P** Subtile Fade-Transitions zwischen Routes
- [ ] **P** Weniger Layout-Sprünge
- [ ] **P** Shell visuell stabil bei Navigation
- [ ] **P** Mobile Transitions ruhiger

## C3 — Login / Auth Polish

- [ ] **P** Auth-Hintergrund konsistent (kein #FAFAFA vs #F7F9FC-Sprung)
- [ ] **P** Spinner hochwertiger
- [ ] **P** Formular-Rhythmus / Focus-States
- [ ] **P** Medical-Trust-Gefühl
- [ ] **P** `/register` YD-Tokens ausrollen (laut IMPLEMENTATION-STATUS ⬜)

## C4 — Dashboard Polish

- [ ] **P** KPI-Hierarchie stärker — „Command Center“
- [ ] **P** Panels ausbalanciert, mehr Depth
- [ ] **P** Mobile vereinfacht

## C5 — Tracker / Inbox Polish

- [ ] **P** Nah an Figma: mittlere Spalte dominant
- [ ] **P** Kommunikationspanel „clinical premium“
- [ ] **P** Bilddarstellung hochwertiger
- [ ] **P** Status-Chips, Actions gruppiert
- [ ] **P** Mobile Detailansicht native-app-nah
- [ ] **P** Apple Health + Linear Feeling

## C6 — Relay Polish

- [ ] **P** Medical Blue System konsequent
- [ ] **P** Karten hochwertiger — weniger Jira/Trello
- [ ] **P** Drag-State professionell
- [ ] **P** Mobile Board-Alternative oder eleganteres Horizontal-Scroll

## C7 — Command AI Polish

- [ ] **P** Dock-/Ambient-Feeling statt Chatbot
- [ ] **P** Konsistente Position auf allen Routes
- [ ] **P** Ruhigere Animationen
- [ ] **P** Mobile Command Bar nativer

## C8 — Settings & Journals Polish

- [ ] **P** Settings: weniger überladen, mehr Ruhe
- [ ] **P** Settings YD ausrollen (laut IMPLEMENTATION-STATUS ⬜)
- [ ] **P** Journal Editor hochwertiger, weniger CMS
- [ ] **P** Public Doc + Upload YD ausrollen (⬜)

## C9 — Mobile System

- [ ] **P** Thumb-friendly spacing
- [ ] **P** Native iOS Feeling (Safe Area, 16px Inputs)
- [ ] **P** Eine dominante Hauptaktion pro View
- [ ] **P** Sticky-Logik konsistent
- [ ] **P** Nicht „geschrumpfter Desktop“

## C10 — Microinteractions & Brand Trust

- [ ] **P** Hover / Pressed / Focus subtil und einheitlich
- [ ] **P** Buttons physischer
- [ ] **P** Navigation flüssiger
- [ ] **P** „Serious clinical platform“ — weniger Startup-Prototype

**Blocker Polish:** _______________________________________________

---

# EBENE D — Bewusst später bauen (nicht in Audit erwarten)

> Diese Punkte **nicht** als „vergessen“ markieren — sie existieren im Code bewusst nicht.

- [ ] ⬜ Abo verwalten / kündigen / Rechnungen in der App
- [ ] ⬜ Stripe Billing Portal in Settings
- [ ] ⬜ 2FA / Sitzungsverwaltung
- [ ] ⬜ Nachrichten-Vorlagen (Settings-Panel)
- [ ] ⬜ Automatisierungen (Recall, Nachsorge)
- [ ] ⬜ Individuelle Rollen & Permissions
- [ ] ⬜ Realtime (Inbox/Relay live ohne Reload)
- [ ] ⬜ LLM / echte KI-API (aktuell regelbasiert)
- [ ] ⬜ CRM / Lead-Capture

---

# Fortschritt auf einen Blick

| Phase | F erledigt | S erledigt | P erledigt |
|-------|------------|------------|------------|
| A — Ops | / | / | — |
| 1 — Auth | / | / | C3 |
| 2 — Kern | / | / | C4–C7 |
| 3 — Inhalte | / | / | C8 |
| 4 — Verwaltung | / | / | C8 |
| 5 — Recht/Public | / | / | C1–C2 |
| 6 — APIs | / | / | — |
| D — Später | — | — | — |

**Gesamt F:** _____ / ~120  
**Gesamt S:** _____ / ~120  
**Gesamt P:** _____ / ~60  

---

# Definition „Launch-ready“

Mindestens erfüllt:

- [ ] Alle **A0–A4** (Ops) grün
- [ ] Alle **Phase 1–6** mit **F + S** abgehakt (außer explizit ⬜)
- [ ] **Phase 5 Rechtstexte** echte Inhalte
- [ ] **P0 Security** aus Audit: Upload-API, Create-Case-Rolle, RLS-Stichproben
- [ ] `npm run build` grün

Premium Polish (Ebene C) kann **nach** Soft-Launch iterativ folgen.

---

*Zuletzt aktualisiert: Juni 2026 — bei neuen Routes diese Datei ergänzen.*
