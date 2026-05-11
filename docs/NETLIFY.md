# Netlify + Supabase (Your Dentist)

## Environment variables (Site → Site configuration → Environment variables)

Set **exact key names** (case-sensitive):

| Key | Source |
|-----|--------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Settings → API / Connect → Project URL (`https://<ref>.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → API Keys → **Publishable** (`sb_publishable_…`) **or** Legacy tab → **anon** (`eyJ…`) |

**Pflicht für OAuth/Magic-Link:** Ohne `NEXT_PUBLIC_SUPABASE_URL` und `NEXT_PUBLIC_SUPABASE_ANON_KEY` kann `/auth/callback` keine Session setzen — die Route leitet dann kontrolliert auf `/login` um (kein „still“ erfolgreicher OAuth-Flow).
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → API Keys → **Secret** (`sb_secret_…`) **or** Legacy → **service_role** (`eyJ…`) |
| `NEXT_PUBLIC_APP_URL` | Your live site, e.g. `https://<site>.netlify.app` (no trailing slash optional) |
| `ADMIN_EMAILS` | Optional: comma-separated ops emails (bypass workspace approval for testing) |
| `ADMIN_GITHUB_USERNAMES` | Optional: comma-separated GitHub logins (same bypass), e.g. `mituoa` |
| `AUTH_RELAX_MODE` | **Nur Demos:** `true` = E-Mail-Bestätigung + Freischaltung aus; Demo-Workspace wenn leer (braucht Service Role) |
| `EMERGENCY_PASSWORD_LOGIN_ENABLED` | `true` + `EMERGENCY_LOGIN_EMAIL` + `EMERGENCY_LOGIN_PASSWORD` = festes Login ohne OAuth (setzt/löscht Passwort in Supabase per Service Role) |
| `NEXT_PUBLIC_REGISTRATION_DEMO_MODE` | **Nur Demos:** `true` = auf `/register` (Schritt 4) zweiter Button „Registrierung ohne Zahlung“ anzeigen |
| `REGISTRATION_DEMO_MODE` | **Nur Demos:** `true` = Server akzeptiert diesen Button und überspringt Stripe-Checkout; ohne diese Variable bleibt der Checkout-Schutz aktiv |

Use **either** the new `sb_*` pair **or** the legacy `eyJ…` pair for anon + service_role — do not mix publishable with a mismatched secret.

Für **Demo-Registrierung ohne Stripe** beide auf `true` setzen, nach Tests wieder entfernen oder `false`.

After any change: **Deploys → Trigger deploy → Clear cache and deploy site**.

## Notfall: Chef-Demo / kein Zugang (`AUTH_RELAX_MODE`)

Wenn **Freischaltung**, **fehlende Praxis** oder **E-Mail-Bestätigung** euch aussperren, könnt ihr **nur auf der Demo-Seite** (Netlify) setzen:

| Variable | Wert |
|----------|------|
| `AUTH_RELAX_MODE` | `true` |
| `SUPABASE_SERVICE_ROLE_KEY` | muss gesetzt sein (sonst kein Auto-Workspace) |

Wirkung:

- Keine Weiterleitung wegen unbestätigter E-Mail.
- Keine Sperre wegen `approved_at` (Praxis-Freischaltung).
- Wenn der User **keine** Zeile in `workspace_members` hat, legt die App einen **Demo-Workspace** an (Name „Relax-Modus (Demo)“).

**⚠️ Für Produktion wieder `AUTH_RELAX_MODE` löschen oder auf `false` setzen** — sonst ist der Schutz aus.

## Notfall: Festes E-Mail-Passwort ohne GitHub/Google (`EMERGENCY_*`)

Wenn **keine Zeit für OAuth**, aber ihr braucht **ein normales Login** auf der Login-Seite:

| Variable | Beispiel |
|----------|----------|
| `EMERGENCY_PASSWORD_LOGIN_ENABLED` | `true` |
| `EMERGENCY_LOGIN_EMAIL` | die E-Mail, die ihr nutzen wollt (z. B. dieselbe wie bei GitHub in Supabase **Authentication → Users**) |
| `EMERGENCY_LOGIN_PASSWORD` | ein starkes Passwort (nur in Netlify speichern) |
| `SUPABASE_SERVICE_ROLE_KEY` | muss gesetzt sein |

Beim ersten erfolgreichen Versuch legt die Server-Action den User **an** oder setzt **Passwort + E-Mail bestätigt** für diese Adresse. Danach wie gewohnt **E-Mail + Passwort** einloggen.

Kombiniert mit **`AUTH_RELAX_MODE=true`** kommt ihr auch ohne Freischaltung/Workspace rein.

**⚠️ Nach der Demo `EMERGENCY_PASSWORD_LOGIN_ENABLED` aus / `false` — das ist ein Hoheitsschlüssel.**

## Google OAuth (Supabase Auth)

1. Supabase → Authentication → Providers → **Google** enabled; Client ID/Secret from Google Cloud.
2. Supabase → Authentication → URL configuration → add redirect URL:  
   `https://<site>.netlify.app/auth/callback`
3. `NEXT_PUBLIC_APP_URL` must match that host so server actions build the same `redirectTo`.

## GitHub OAuth (Supabase Auth)

Die App hat bereits **„Mit GitHub anmelden“** (`signInWithOAuth` → `github`). Ohne die folgenden Schritte liefert Supabase z. B.  
`Unsupported provider: provider is not enabled`.

### 1) GitHub OAuth App anlegen

1. Auf **GitHub** einloggen → **Settings** → **Developer settings** → **OAuth Apps** → **New OAuth App**.
2. **Application name:** z. B. `Your Dentist`  
   **Homepage URL:** eure Netlify-URL, z. B. `https://<site>.netlify.app`
3. **Authorization callback URL** (wichtig): **exakt** die Supabase-Callback-URL eures Projekts:

   `https://<PROJECT_REF>.supabase.co/auth/v1/callback`

   `<PROJECT_REF>` steht in Supabase unter **Settings → General → Reference ID** (in eurem Fall z. B. `exsgywpbpslgxzbccbjh`).

4. Nach dem Erstellen: **Client ID** kopieren und ein **Client secret** erzeugen.

### 2) GitHub in Supabase aktivieren

1. **Supabase** → **Authentication** → **Providers** → **GitHub** → **Enable**.
2. **Client ID** und **Client Secret** von der GitHub OAuth App eintragen → **Save**.

**Oder per Terminal (ein Befehl):** Repo-Skript `scripts/configure-supabase-github-auth.sh` — setzt dieselben Werte über die [Management API](https://supabase.com/docs/guides/auth/social-login/auth-github). Dafür brauchst du ein **Personal Access Token** von [supabase.com/dashboard/account/tokens](https://supabase.com/dashboard/account/tokens) (nicht der Anon-Key der App).

### 3) Weitere URLs in Supabase

**Authentication** → **URL configuration**:

- **Site URL:** `https://<site>.netlify.app`
- **Redirect URLs** (eintragen, eine Zeile pro URL), mindestens:

  - `https://<site>.netlify.app/auth/callback`
  - `http://localhost:3000/auth/callback` (optional, für lokal)

`NEXT_PUBLIC_APP_URL` auf Netlify = dieselbe `https://<site>.netlify.app` ohne Slash am Ende (oder konsistent zu eurer Live-Domain).

### 4) Ops-Admin per GitHub-Username (optional)

Netlify **Environment variables**:

- `ADMIN_GITHUB_USERNAMES` = euer GitHub-Login (z. B. `mituoa`), kommagetrennt bei mehreren.

Danach **Clear cache and deploy**. Ohne Workspace-Freischaltung könnt ihr so trotzdem ins Dashboard, wenn der Code die Allowlist nutzt.

## Stripe / mail webhooks

- Stripe webhook calls `getStripeServer()` — if `STRIPE_SECRET_KEY` is missing, the route returns **503** (does not crash the app).
- Mail webhook needs `MAIL_WEBHOOK_SIGNING_SECRET` and a valid Supabase admin env for DB updates.

## Runtime errors after login

If the homepage works but **after login** you see a Netlify error overlay:

1. Netlify → **Deploys** → latest → **Functions** / runtime logs.
2. Common causes: wrong/missing env vars; DB table missing (run `supabase/migrations` on your project); RLS blocking reads (check Supabase logs).
