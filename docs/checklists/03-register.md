# Checkliste: `/register` (danach)

**Route:** `/register` · 4 Schritte · F dann S pro Schritt

---

## Schritt 1 — Ansprechperson & Zugang

- [ ] **F** Name, Rolle, E-Mail, Passwort, Bestätigung
- [ ] **F** `POST /api/auth/check-email` (Format)
- [ ] **S** Weiter gesperrt bei ungültigen Feldern

## Schritt 2 — Praxis

- [ ] **F** Praxisname, Telefon, Website

## Schritt 3 — Verifizierung

- [ ] **F** Zulassung Upload Vorder-/Rückseite
- [ ] **F** Demo: Upload überspringen (wenn Demo-Flag)
- [ ] **S** Upload-Fehler recoverbar

## Schritt 4 — Praxiszugang / Abo

- [ ] **F** Intervall + Zahlungsart
- [ ] **F** Rechnung bei monatlich blockiert
- [ ] **F** AGB / Datenschutz / Widerruf Checkboxen
- [ ] **F** Stripe Checkout ODER Demo „Ohne Zahlung“
- [ ] **F** Erfolgs-Screen + Resend Bestätigung
- [ ] **S** Fieldset disabled während Submit

## Invite / Query

- [ ] **F** `?invite=` — kein Solo-Workspace
- [ ] **F** `?plan=` von Startseite übernommen

**Blocker Register:** _______________________________________________
