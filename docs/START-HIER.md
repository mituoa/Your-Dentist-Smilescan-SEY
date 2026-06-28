# Your Dentist — Start hier (von Null)

**Regel:** Nicht überspringen. Erst Ebene A, dann Phase 1, dann Phase 2 …  
**Pro Punkt:** F (funktioniert) → S (Medical/Stability) → später P (Polish).

Vollständige Liste: [`MASTER-CHECKLIST.md`](./MASTER-CHECKLIST.md)

---

## Schritt 0 — Heute vorbereiten (15 Min.)

```bash
cd "/Users/seymapehlivan/Downloads/smilescan_ - Copy"
cp .env.example .env.local   # nur wenn noch keine .env.local
npm install
npm run dev                  # http://127.0.0.1:3000
```

- [ ] Dev-Server läuft ohne Crash
- [ ] `npm run build` grün (einmal vor Go-Live)

---

## Schritt 1 — Ebene A: Infrastruktur (PFLICHT vor allen Routen)

### A0 — Supabase

- [ ] **F** Supabase-Projekt angelegt
- [ ] **F** Alle **44** Migrationen angewendet (`supabase/migrations/001` … `044`)
- [ ] **F** `.env.local`: `NEXT_PUBLIC_SUPABASE_URL`
- [ ] **F** `.env.local`: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] **F** `.env.local`: `SUPABASE_SERVICE_ROLE_KEY` (nur Server, nie im Client)
- [ ] **F** `.env.local`: `NEXT_PUBLIC_APP_URL` = deine echte URL (lokal: `http://127.0.0.1:3000`)
- [ ] **S** `AUTH_RELAX_MODE=false` für echten Test (oder bewusst `true` nur lokal)
- [ ] **S** Launch-Guards notiert: `REQUIRE_EMAIL_CONFIRMATION_BEFORE_APP`, `REQUIRE_WORKSPACE_APPROVAL_BEFORE_APP`

**Test A0:** `/login` öffnen — Seite lädt, kein Supabase-Config-Fehler im Terminal.

---

### A1 — E-Mail (SMTP)

- [ ] **F** SMTP in `.env.local` gesetzt (`SMTP_HOST`, `PORT`, `USER`, `PASS`, `FROM`)
- [ ] **F** Test: Passwort vergessen → Mail kommt an
- [ ] **F** Test: Team-Einladung → Mail kommt an
- [ ] **F** Test: Patient-Upload → Bestätigungs-Mail
- [ ] **S** Ohne SMTP: UI zeigt ruhige Meldung, kein Stacktrace

**Test A1:** `/forgot-password` mit echter E-Mail.

---

### A2 — Stripe (nur wenn Abo bei Register)

- [ ] **F** `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- [ ] **F** `ENABLE_STRIPE_CHECKOUT_AT_SIGNUP=true`
- [ ] **F** Stripe Price-IDs für alle Intervalle
- [ ] **F** Webhook `/api/stripe/webhook` getestet

**Überspringen wenn:** `REGISTRATION_DEMO_MODE=true` (Demo ohne Zahlung).

---

### A3 — Cron & Webhooks

- [ ] **F** `RELAY_TASK_REMINDERS_SECRET` + Cron → `/api/internal/relay-task-reminders`
- [ ] **F** `MAIL_WEBHOOK_SIGNING_SECRET` → `/api/mail/webhook`
- [ ] **F** License-Cleanup → `/api/internal/cleanup-register-license-pending`

**Kann warten bis:** Relay-Tasks und Mail-Zustellung live sind.

---

### A4 — Admin-Freischaltung

- [ ] **F** `ADMIN_EMAILS=deine@email.de` in `.env.local`
- [ ] **F** `REQUIRE_WORKSPACE_APPROVAL_BEFORE_APP=true` (für Produktion)
- [ ] **F** `/admin/registrations` erreichbar nach Login
- [ ] **S** Nicht-Admin sieht Queue nicht

**Blocker A:** _______________________________________________

**→ Erst wenn A0 mindestens grün: weiter zu Schritt 2.**

---

## Schritt 2 — Phase 1: Öffentlich & Auth (Route für Route)

Reihenfolge — **jede Route: alle F, dann alle S, dann weiter:**

| # | Route | Fokus |
|---|-------|--------|
| 2.1 | `/` | Landing, Demo-Form, CTAs |
| 2.2 | `/pricing` | Redirect `#preise` |
| 2.3 | `/login` | Login, Fehler, OAuth, Redirect Rolle |
| 2.4 | `/register` | Schritt 1 → 2 → 3 → 4 |
| 2.5 | `/forgot-password` | Reset-Mail |
| 2.6 | `/reset-password` | Neues Passwort |
| 2.7 | `/auth/callback` | OAuth / E-Mail-Bestätigung |
| 2.8 | `/auth/continue` | Post-OAuth Redirect |
| 2.9 | `/accept-invite` | Alle Invite-Szenarien |
| 2.10 | Abmelden | Sidebar + Settings |
| 2.11 | `/admin/registrations` | Freischalten |

Detail-Checkboxen: siehe **Phase 1** in `MASTER-CHECKLIST.md`.

**Blocker Phase 1:** _______________________________________________

---

## Schritt 3 — Phase 2: Kernprodukt

`/dashboard` → `/inbox` → `/inbox/[id]` → `/relay` → `/my-tasks` → `/create-case` → Command AI

---

## Schritt 4 — Phase 3: Inhalte & Patient

`/journal` … → `/doc/[slug]` … → Upload

---

## Schritt 5 — Phase 4: Verwaltung

`/profile` → `/profile/editor` → `/settings` → `/profile/solutions`

---

## Schritt 6 — Phase 5: Recht & Assets

`/agb`, `/datenschutz`, `/impressum`, `/widerruf` — **echte Texte**  
Icons, OG, `not-found`

---

## Schritt 7 — Phase 6: APIs & Security

Upload-API, License-Upload, Webhooks, RLS-Review, Build

---

## Schritt 8 — Premium Polish (Ebene C)

Erst wenn F+S pro System grün. Systemweise, nicht route-weise.

---

## Was du JETZT machst (Tag 1)

1. Schritt 0 (Dev-Server)
2. Schritt 1 A0 komplett
3. Schritt 1 A1 (SMTP) — mindestens Forgot-Password testen
4. Dann **2.1 `/`** — erste Route in Phase 1

**Nicht:** Polish, Redesign, neue Features.  
**Ja:** Ein Schritt, testen, abhaken, weiter.
