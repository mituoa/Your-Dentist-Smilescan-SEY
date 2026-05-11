# Registrierung: Production-Hardening (Security / Storage / Abuse)

Dieses Dokument ergänzt den Code für `/register`, Server Action `signUp` und die APIs `register-license-upload`, `check-email` sowie den internen Cleanup `cleanup-register-license-pending`. Ziel: **Launch-taugliche Transparenz** — was im Repo erledigt ist, was bewusst offen bleibt, was **Infra** leisten kann.

---

## 1. Fehlgeschlagene Registrierung (Rollback im Code)

**Verhalten:** Schlägt die Registrierung **nach** erfolgreichem `auth.signUp` und **vor** vollständigem, konsistentem Solo-Setup fehl, führt `registerFail` → `rollbackIncompleteRegistrationAfterFailure` aus:

- Pending-Berufsnachweise (bekannte Pfade) → `removePendingLicenseUploads`
- **Solo (ohne Invite):** `workspace_billing` und `workspace_contracts` für die erkannte `workspace_id`, dann `auth.admin.deleteUser`, dann **`workspaces`-Delete** (inkl. abhängiger Daten per FK/Cascade, soweit die DB es vorsieht)
- **Invite:** nur Pending-Uploads + `deleteUser` — **kein** Löschen von Team-`workspace_billing` / Team-Workspace

**Nicht per Rollback gelöscht:** Nach **erfolgreichem** `workspace_contracts`-Upsert schlagen Stripe-/Checkout-Schritte fehl — der Account bleibt bestehen (Support-Pfad, keine halben Zahlungs-Löschungen).

**Restrisiko:** `deleteUser` oder `workspaces.delete` schlagen isoliert fehl (Netzwerk/Timeout) → verbleibende Artefakte; Mitigation: Logs + optionaler SQL-Reconcile-Job in der Infra.

---

## 2. Upload- & Register-Spam

**Im Code:**

- `POST /api/register-license-upload`: IP-Ratelimit, **Content-Length**-Obergrenze, strikte Dateigröße nach Buffer, Origin-Check, MIME + Magic-Bytes, deutsche Kurzfehler.
- `POST /api/auth/check-email`: IP-Ratelimit (keine Enumeration mehr, s. Abschnitt 4).
- `signUp`: IP- und E-Mail-Ratelimit (1 h Fenster, Konstanten in `app/(auth)/actions.ts`).
- `resendSignupConfirmation`: IP-Ratelimit.

**Bewusste Grenze:** In-Memory-Limit gilt **pro Serverless-Instanz**, nicht global.

**Production-Empfehlung (Infra):**

- WAF / Edge-Rate-Limit (z. B. **Cloudflare**, **Netlify** Traffic Rules) auf `/api/register-license-upload`, `/api/auth/check-email` und die Route `signUp` (POST `/register` bzw. Server-Action-Endpunkt).
- Optional **Turnstile / hCaptcha** bei sichtbarem Abuse.

---

## 3. Storage-Lifecycle (`registrations/licenses/pending/`)

**Im Code:**

- `registerFail` räumt bekannte Pending-Pfade auf (best effort).
- Pfade im Formular sind auf `registrations/licenses/pending/` beschränkt (kein Path-Traversal).
- **TTL-Cleanup (serverseitig):** `POST /api/internal/cleanup-register-license-pending`  
  - Header: `Authorization: Bearer <SECRET>`  
  - `SECRET` = `REGISTER_LICENSE_PENDING_CLEANUP_SECRET` **oder** `CRON_SECRET` (falls erster nicht gesetzt).
  - TTL-Stunden: `REGISTER_LICENSE_PENDING_TTL_HOURS` (Standard **72**, Minimum 6, Maximum 720).
  - Optional: `REGISTER_LICENSE_CLEANUP_MAX_DELETES` (Standard **500**, max 2000 pro Lauf).
  - Löscht nur Objekte unter `registrations/licenses/pending/`, die **älter als TTL** sind und in **keiner** Zeile `workspace_contracts` (drei Pfad-Spalmen) referenziert werden.

**Manueller Test (lokal, Secret in `.env.local`):**

```bash
curl -sS -X POST "http://127.0.0.1:3000/api/internal/cleanup-register-license-pending" \
  -H "Authorization: Bearer $REGISTER_LICENSE_PENDING_CLEANUP_SECRET" \
  -H "Content-Type: application/json"
```

Erwartung: JSON `{ "ok": true, "stats": { ... } }` — ohne gültigen Bearer: **401**.

**Production:** Storage-Bucket-Policy — **kein öffentliches Lesen** für Berufsnachweise; Cron (Netlify Scheduled Functions, GitHub Actions, Supabase Edge mit Secret) periodisch den Endpunkt aufrufen.

---

## 4. E-Mail-Enumeration (`check-email`)

**Entscheidung (Option A, im Code):** Die Route gibt **keine** Existenz einer E-Mail-Adresse preis (`available` entfällt). Es wird nur das Format serverseitig validiert; die echte Eindeutigkeit ergibt sich beim Absenden über `signUp` (Supabase-Fehler → nutzerfreundliche deutsche Meldung).

**Mitigation:** strenges Rate-Limit pro IP; UI mit neutraler Copy.

---

## 5. Demo vs. Production

- **Demo/MVP:** kann mit denselben Endpunkten arbeiten; Abuse-Schutz bleibt relevant.
- **Production:** Edge/WAF ergänzend; Cleanup-Route mit eigenem Secret schedulen.

---

## Checkliste vor Go-Live

- [ ] Env: `REGISTER_LICENSE_PENDING_CLEANUP_SECRET` (oder geteilter `CRON_SECRET`) gesetzt; optional `REGISTER_LICENSE_PENDING_TTL_HOURS`.
- [ ] Netlify/Edge: zusätzliche Rate-Limits oder WAF-Regeln für Upload + Check-Email + Register-POST.
- [ ] Supabase Storage: Policies + kein Public Read auf sensible Pfade.
- [ ] Scheduler: `POST /api/internal/cleanup-register-license-pending` mindestens täglich.
- [ ] Optional: SQL-Reconcile für verwaiste Workspaces nach seltenen Partial-Failures.
